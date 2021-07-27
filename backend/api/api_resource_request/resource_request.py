from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from flask import request
import requests
from datetime import datetime
import math

from api import module_api
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from models.api_resource_request import ResourceRequest, db
from config import ConfigClass
from services.notifier_services.email_service import SrvEmail
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.permissions_service.decorators import permissions_check

api_resource = module_api.namespace('ResourceRequest', description='Resource Request API', path='/v1')

_logger = SrvLoggerFactory('api_resource_request').get_logger()

class APIResourceRequest(metaclass=MetaAPI):
    def api_registry(self):
        api_resource.add_resource(self.ResourceRequestComplete, '/resource-request/<id>/complete')
        api_resource.add_resource(self.ResourceRequest, '/resource-request/<id>/')
        api_resource.add_resource(self.ResourceRequests, '/resource-requests')
        api_resource.add_resource(self.ResourceRequestsQuery, '/resource-requests/query')


    class ResourceRequest(Resource):
        @jwt_required()
        @permissions_check('resource_request', '*', 'view')
        def get(self, id):
            """
             Get a single resource request
            """
            api_response = APIResponse()
            _logger.info("ResourceRequest get called")

            if current_identity["role"] != "admin":
                api_response.set_error_msg("Permissions denied")
                api_response.set_code(EAPIResponseCode.forbidden)
                return api_response.to_dict, api_response.code

            try:
                resource_request = db.session.query(ResourceRequest).get(id)
                if not resource_request:
                    api_response.set_code(EAPIResponseCode.not_found)
                    api_response.set_result("Resource Request not found")
                    return api_response.to_dict, api_response.code
            except Exception as e:
                _logger.error("Psql Error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Psql Error: " + str(e))
                return api_response.to_dict, api_response.code
            api_response.set_result(resource_request.to_dict())
            return api_response.to_dict, api_response.code

        @jwt_required()
        @permissions_check('resource_request', '*', 'delete')
        def delete(self, id):
            api_response = APIResponse()
            _logger.info("ResourceRequest get called")

            try:
                resource_request = db.session.query(ResourceRequest).get(id)
                if not resource_request:
                    api_response.set_code(EAPIResponseCode.not_found)
                    api_response.set_result("Resource Request not found")
                db.session.delete(resource_request)
                db.session.commit()
            except Exception as e:
                _logger.error("Psql Error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Psql Error: " + str(e))
                return api_response.to_dict, api_response.code
            api_response.set_result('success')
            return api_response.to_dict, api_response.code

    class ResourceRequestComplete(Resource):
        @jwt_required()
        @permissions_check('resource_request', '*', 'update')
        def put(self, id):
            """
                Update an existing resource request as complete
            """
            api_response = APIResponse()
            _logger.info("ResourceRequestComplete put called")

            try:
                resource_request = db.session.query(ResourceRequest).get(id)
                if not resource_request:
                    api_response.set_code(EAPIResponseCode.not_found)
                    api_response.set_result("Resource Request not found")
                    return api_response.to_dict, api_response.code
                resource_request.active = False
                resource_request.complete_date = datetime.utcnow() 
                db.session.add(resource_request)
                db.session.commit()
                db.session.refresh(resource_request)
            except Exception as e:
                _logger.error("Psql Error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Psql Error: " + str(e))
                return api_response.to_dict, api_response.code

            try:
                # Get dataset
                payload = {"global_entity_id": resource_request.project_geid}
                response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/Container/query", json=payload)
                if not response.json():
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Container not found in neo4j")
                    return api_response.to_dict, api_response.code
                dataset_node = response.json()[0]
            except Exception as e:
                _logger.error("Neo4j Error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Neo4j Error: " + str(e))
                return api_response.to_dict, api_response.code

            template_kwargs = {
                "current_user": current_identity["username"],
                "request_for": resource_request.request_for,
                "project_name": resource_request.project_name,
                "project_code": dataset_node["code"],
                "admin_email": ConfigClass.EMAIL_SUPPORT,
            }
            try:
                email_sender = SrvEmail()
                email_sender.send(
                    f"Access granted to {resource_request.request_for}",
                    [resource_request.email],
                    msg_type='html',
                    template="resource_request/approved.html",
                    template_kwargs=template_kwargs,
                )
                _logger.info(f"Email sent to {resource_request.email}")
            except Exception as e:
                _logger.error("Error sending email: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Error sending email: " + str(e))
                return api_response.to_dict, api_response.code

            api_response.set_result(resource_request.to_dict())
            return api_response.to_dict, api_response.code

    class ResourceRequestsQuery(Resource):
        @jwt_required()
        def post(self):
            """
                List resource requests
            """
            _logger.info("ResourceRequestsQuery post called")
            api_response = APIResponse()
            data = request.get_json()

            page = int(data.get('page', 0))
            # use 0 start for consitency with other pagination systems
            page = page + 1
            page_size = int(data.get('page_size', 25))
            order_by = data.get('order_by', "request_date")
            order_type = data.get('order_type', "asc")
            filters = data.get('filters', {})

            try:
                query = None
                if current_identity["role"] != "admin":
                    filters["username"] = current_identity["username"]

                for key, value in filters.items():
                    query = db.session.query(ResourceRequest).filter(getattr(ResourceRequest, key).contains(value))
                if not query:
                    query = db.session.query(ResourceRequest)
                if order_by and order_type == "desc":
                    query = query.order_by(getattr(ResourceRequest, order_by).desc())
                else:
                    query = query.order_by(getattr(ResourceRequest, order_by).asc())
                resource_requests = query.paginate(page=page, per_page=page_size, error_out=False)
            except Exception as e:
                _logger.error("Psql error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Psql error: " + str(e))
                return api_response.to_dict, api_response.code

            total = resource_requests.total
            results = []
            for resource in resource_requests.items:
                results.append(resource.to_dict())
            api_response.set_page(page - 1)
            api_response.set_num_of_pages(math.ceil(total / page_size))
            api_response.set_total(total)
            api_response.set_result(results)
            return api_response.to_dict, api_response.code

    class ResourceRequests(Resource):
        @jwt_required()
        @permissions_check('resource_request', '*', 'create')
        def post(self):
            """
                Create a new resource request, send email notification
            """
            _logger.info("ResourceRequests post called")
            api_response = APIResponse()
            data = request.get_json()

            required_fields = ["user_geid", "project_geid", "request_for"]
            model_data = {}
            for field in required_fields:
                if not field in data:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result(f"Missing required field {field}")
                    return api_response.to_dict, api_response.code
                model_data[field] = data[field]

            try:
                # Duplicate check
                resource_requests = db.session.query(ResourceRequest).filter_by(
                    user_geid=data["user_geid"], 
                    project_geid=data["project_geid"],
                    request_for=data["request_for"],
                )
            except Exception as e:
                _logger.error("Psql error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Psql error: " + str(e))
                return api_response.to_dict, api_response.code

            if resource_requests.count() > 0:
                if resource_requests.first().active:
                    api_response.set_code(EAPIResponseCode.conflict)
                    api_response.set_result("Request already exists")
                    return api_response.to_dict, api_response.code
                else:
                    api_response.set_code(EAPIResponseCode.conflict)
                    api_response.set_result("Request already completed")
                    return api_response.to_dict, api_response.code

            if not data["request_for"] in ConfigClass.RESOURCES:
                api_response.set_code(EAPIResponseCode.bad_request)
                api_response.set_result("Invalid request_for field")
                return api_response.to_dict, api_response.code

            try:
                # Get user node
                payload = {"global_entity_id": data["user_geid"]}
                response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/User/query", json=payload)
                if not response.json():
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("User not found in neo4j")
                    return api_response.to_dict, api_response.code
                user_node = response.json()[0]

                if current_identity["username"] != user_node["name"]:
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Permission Denied")
                    return api_response.to_dict, api_response.code

                # Get dataset
                payload = {"global_entity_id": data["project_geid"]}
                response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/Container/query", json=payload)
                if not response.json():
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Container not found in neo4j")
                    return api_response.to_dict, api_response.code
                dataset_node = response.json()[0]

                # Get Relationship
                params = {
                    "start_id": user_node["id"],
                    "end_id": dataset_node["id"]
                }
                response = requests.get(ConfigClass.NEO4J_SERVICE + "relations", params=params)
                if not response.json() or not response.json()[0]["r"]["type"]:
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Permission Denied")
                    return api_response.to_dict, api_response.code
                user_role = response.json()[0]["r"]["type"]

            except Exception as e:
                _logger.error("Neo4j error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Neo4j Error: " + str(e))
                return api_response.to_dict, api_response.code

            model_data["username"] = user_node["name"]
            model_data["email"] = user_node["email"]
            model_data["project_name"] = dataset_node["name"]

            try:
                resource_request = ResourceRequest(**model_data)
                db.session.add(resource_request)
                db.session.commit()
                db.session.refresh(resource_request)
            except Exception as e:
                _logger.error("Psql error: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Psql Error: " + str(e))
                return api_response.to_dict, api_response.code

            template_kwargs = {
                "username": resource_request.username,
                "request_for": resource_request.request_for,
                "project_name": resource_request.project_name,
                "project_code": dataset_node["code"],
                "admin_email": ConfigClass.EMAIL_SUPPORT,
                "vre_portal_url": ConfigClass.VRE_DOMAIN,
                "user_role": user_role.title()
            }
            try:
                query = {"name":ConfigClass.RESOURCE_REQUEST_ADMIN}
                response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/User/query", json=query)
                admin_email = response.json()[0]["email"]
            except Exception as e:
                _logger.error("Error getting admin email: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Error getting admin email: " + str(e))
                return api_response.to_dict, api_response.code

            try:
                email_sender = SrvEmail()
                email_sender.send(
                    "Resource Request from " + template_kwargs["username"],
                    [admin_email],
                    msg_type='html',
                    template="resource_request/request.html",
                    template_kwargs=template_kwargs,
                )
                _logger.info(f"Email sent to {admin_email}")
            except Exception as e:
                _logger.error("Error sending email: " + str(e))
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result("Error sending email: " + str(e))
                return api_response.to_dict, api_response.code
            api_response.set_result(resource_request.to_dict())
            return api_response.to_dict, api_response.code
