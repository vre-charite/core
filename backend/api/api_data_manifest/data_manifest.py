from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
from resources.swagger_modules import data_manifests, data_manifests_return
from resources.utils import get_project_permissions
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from models.api_data_manifest import DataAttributeModel, DataManifestModel, TypeEnum, db
from .utils import has_permissions, is_greenroom_raw, get_file_node, has_valid_attributes, check_attributes
from api import module_api
from flask import request
import re
import math
import requests
import json

api_ns_data_manifests = module_api.namespace('Data Manifests Restful', description='For data manifest feature', path ='/v1')
api_ns_data_manifest = module_api.namespace('Data Manifest Restful', description='For data manifest feature', path ='/v1')

_logger = SrvLoggerFactory('api_data_manifest').get_logger()

class APIDataManifest(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_data_manifests.add_resource(self.RestfulManifests, '/data/manifests')
        api_ns_data_manifest.add_resource(self.RestfulManifest, '/data/manifest/<manifest_id>')
        api_ns_data_manifest.add_resource(self.RestfulAttributes, '/data/attributes')
        api_ns_data_manifest.add_resource(self.RestfulAttribute, '/data/attribute/<id>')
        api_ns_data_manifest.add_resource(self.FileManifests, '/file/manifest/attach')
        api_ns_data_manifest.add_resource(self.FileManifest, '/file/manifest')
        api_ns_data_manifest.add_resource(self.ValidateManifest, '/file/manifest/validate')
        api_ns_data_manifest.add_resource(self.ImportManifest, '/import/manifest')
        api_ns_data_manifest.add_resource(self.ExportManifest, '/export/manifest')
        api_ns_data_manifest.add_resource(self.FileManifestQuery, '/file/manifest/query')

    class RestfulManifests(Resource):
        @api_ns_data_manifest.expect(data_manifests)
        @api_ns_data_manifest.response(200, data_manifests_return)
        @jwt_required()
        def get(self):
            """
            List manifests by project_code
            """
            my_res = APIResponse()
            project_code = request.args.get('project_code')
            page = int(request.args.get('page', 1))
            page_size = int(request.args.get('page_size', 25))
            if not project_code:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_result("project_code is required")
                return my_res.to_dict, my_res.code

            # Query psql for manifests
            # paginated
            #manifests = db.session.query(DataManifestModel).filter_by(
            #        project_code=project_code).paginate(page=page, per_page=page_size, error_out=False)
            manifests = db.session.query(DataManifestModel).filter_by(project_code=project_code)
            results = []
            for manifest in manifests:
            #for manifest in manifests.items:
                result = manifest.to_dict()
                result["attributes"] = []
                attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=manifest.id).\
                        order_by(DataAttributeModel.id.asc())
                for atr in attributes:
                    result["attributes"].append(atr.to_dict())
                results.append(result)
            #my_res.set_page(manifests.page)
            #my_res.set_num_of_pages(manifests.pages)
            my_res.set_total(len(results))
            my_res.set_result(results)
            return my_res.to_dict, my_res.code

        @jwt_required()
        def post(self):
            """
            Create a data manifest
            """
            api_response = APIResponse()
            data = request.get_json()
            required_fields = ["name", "project_code"]
            model_data = {}
            for field in required_fields:
                if not field in data:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result(f"Missing required field {field}")
                    return api_response.to_dict, api_response.code
                model_data[field] = data[field]

            if current_identity["role"] != "admin":
                role = get_project_permissions(model_data["project_code"], current_identity["user_id"])
                if role != "admin":
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Permission Denied")
                    return api_response.to_dict, api_response.code
            manifests = db.session.query(DataManifestModel).filter_by(project_code=data["project_code"])
            if manifests.count() > 9:
                api_response.set_code(EAPIResponseCode.forbidden)
                api_response.set_result("Manifest limit reached")
                return api_response.to_dict, api_response.code

            for item in manifests:
                result = item.to_dict()
                if data["name"] == result["name"]:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result("duplicate manifest name")
                    return api_response.to_dict, api_response.code

            manifest = DataManifestModel(**model_data)
            db.session.add(manifest)
            db.session.commit()
            db.session.refresh(manifest)

            api_response.set_result(manifest.to_dict())
            return api_response.to_dict, api_response.code


    class RestfulManifest(Resource):
        @jwt_required()
        def get(self, manifest_id):
            """
            Get a data manifest and list attributes
            """
            my_res = APIResponse()
            page = int(request.args.get('page', 1))
            page_size = int(request.args.get('page_size', 25))
            manifest = db.session.query(DataManifestModel).get(manifest_id)
            if not manifest:
                my_res.set_code(EAPIResponseCode.not_found)
                my_res.set_error_msg('Manifest not found')
            else:
                result = manifest.to_dict()
                result["attributes"] = []
                #paginated
                #attributes = db.session.query(DataAttributeModel).filter_by(
                #        manifest_id=manifest_id).paginate(page=page, per_page=page_size, error_out=False)
                #my_res.set_page(attributes.page)
                #my_res.set_num_of_pages(attributes.pages)
                attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=manifest_id).\
                        order_by(DataAttributeModel.id.asc())
                for atr in attributes:
                    result["attributes"].append(atr.to_dict())
                my_res.set_result(result)
            return my_res.to_dict, my_res.code

        @jwt_required()
        def put(self, manifest_id):
            my_res = APIResponse()
            data = request.get_json()
            update_fields = ["name", "project_code"]
            manifest = db.session.query(DataManifestModel).get(manifest_id)
            if not manifest:
                my_res.set_code(EAPIResponseCode.not_found)
                my_res.set_error_msg('Manifest not found')
                return my_res.to_dict, my_res.code

            # Permissions check
            if current_identity["role"] != "admin":
                role = get_project_permissions(manifest.project_code, current_identity["user_id"])
                if role != "admin":
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_result("Permission Denied")
                    return my_res.to_dict, my_res.code

            if "type" in data:
                try:
                    manifest.type = getattr(TypeEnum, data["type"])
                except AttributeError:
                    my_res.set_code(EAPIResponseCode.bad_request)
                    my_res.set_result("Invalid type")
                    return my_res.to_dict, my_res.code
            for field in update_fields:
                if field in data:
                    setattr(manifest, field, data[field])
            db.session.add(manifest)
            db.session.commit()
            db.session.refresh(manifest)
            my_res.set_result(manifest.to_dict())
            return my_res.to_dict, my_res.code

        @jwt_required()
        def delete(self, manifest_id):
            """
            Delete an manifest 
            """
            my_res = APIResponse()
            manifest = db.session.query(DataManifestModel).get(manifest_id)
            if not manifest:
                my_res.set_code(EAPIResponseCode.not_found)
                my_res.set_error_msg('Manifest not found')
                return my_res

            # check if connect to any files
            response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/File/query/count", json={"manifest_id": int(manifest_id)})
            if response.json()["count"] > 0:
                my_res.set_code(EAPIResponseCode.forbidden)
                my_res.set_result("Can't delete manifest attached to files")
                return my_res.to_dict, my_res.code

            # Permissions check
            if current_identity["role"] != "admin":
                role = get_project_permissions(manifest.project_code, current_identity["user_id"])
                if role != "admin":
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_result("Permission Denied")
                    return my_res.to_dict, my_res.code

            attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=manifest.id)
            for atr in attributes:
                db.session.delete(atr)
            db.session.commit()
            db.session.delete(manifest)
            db.session.commit()
            my_res.set_result("Success")
            return my_res.to_dict, my_res.code


    class RestfulAttributes(Resource):
        @jwt_required()
        def post(self):
            """
            Bulk Create attribute
            """
            api_response = APIResponse()
            attributes = request.get_json()
            for data in attributes:
                required_fields = ["manifest_id", "name", "type", "value", "optional", "project_code"]
                model_data = {}
                for field in required_fields:
                    if not field in data:
                        api_response.set_code(EAPIResponseCode.bad_request)
                        api_response.set_result(f"Missing required field {field}")
                        return api_response.to_dict, api_response.code
                    model_data[field] = data[field]
                # Permissions check
                if current_identity["role"] != "admin":
                    role = get_project_permissions(model_data["project_code"], current_identity["user_id"])
                    if role != "admin":
                        api_response.set_code(EAPIResponseCode.forbidden)
                        api_response.set_result("Permission Denied")
                        return api_response.to_dict, api_response.code
                # check if connect to any files
                if not model_data["optional"]:
                    response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/File/query/count", json={"manifest_id": model_data["manifest_id"]})
                    if response.json()["count"] > 0:
                        api_response.set_code(EAPIResponseCode.forbidden)
                        api_response.set_result("Can't add required attributes to manifest attached to files")
                        return api_response.to_dict, api_response.code
                attribute = DataAttributeModel(**model_data)
                db.session.add(attribute)
                db.session.commit()
                db.session.refresh(attribute)
            api_response.set_result("Success")
            return api_response.to_dict, api_response.code


    class RestfulAttribute(Resource):
        @jwt_required()
        def put(self, id):
            """
            Update an attribute
            """
            my_res = APIResponse()
            data = request.get_json()
            update_fields = ["name", "attribute", "value", "optional", "project_code"]
            attribute = db.session.query(DataAttributeModel).get(id)
            if not attribute:
                my_res.set_code(EAPIResponseCode.not_found)
                my_res.set_error_msg('Attribute not found')
                return my_res

            manifest = db.session.query(DataManifestModel).get(attribute.manifest_id)
            # Permissions check
            if current_identity["role"] != "admin":
                role = get_project_permissions(manifest.project_code, current_identity["user_id"])
                if role != "admin":
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_result("Permission Denied")
                    return my_res.to_dict, my_res.code

            if "type" in data:
                try:
                    attribute.type = getattr(TypeEnum, data["type"])
                except AttributeError:
                    my_res.set_code(EAPIResponseCode.bad_request)
                    my_res.set_result("Invalid type")
                    return my_res.to_dict, my_res.code
            for field in update_fields:
                if field in data:
                    setattr(attribute, field, data[field])
            db.session.add(attribute)
            db.session.commit()
            db.session.refresh(attribute)
            my_res.set_result(attribute.to_dict())
            return my_res.to_dict, my_res.code

        @jwt_required()
        def delete(self, id):
            """
            Delete an attribute
            """
            my_res = APIResponse()
            attribute = db.session.query(DataAttributeModel).get(id)
            if not attribute:
                my_res.set_code(EAPIResponseCode.not_found)
                my_res.set_error_msg('Attribute not found')
                return my_res.to_dict, my_res.code
            manifest = db.session.query(DataManifestModel).get(attribute.manifest_id)

            # Permissions check
            if current_identity["role"] != "admin":
                role = get_project_permissions(manifest.project_code, current_identity["user_id"])
                if role != "admin":
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_result("Permission Denied")
                    return my_res.to_dict, my_res.code
            db.sssion.delete(attribute)
            db.session.commit()
            my_res.set_result("Success")
            return my_res.to_dict, my_res.code


    class FileManifests(Resource):
        @jwt_required()
        def post(self):
            api_response = APIResponse()
            manifests = request.get_json()
            results = {
                "error": [],
                "success": []
            }
            error_list = []

            for data in manifests:
                # Check required fields
                if not "file_path" in data:
                    results["error"].append(data.get("file_path", ""))
                    print("missing file path")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_error_msg("missing file path")
                    return api_response.to_dict, api_response.code

                path = data["file_path"]
                manifest_id = data.get("manifest_id", None)
                if not manifest_id:
                    if not "manifest_name" in data or not "project_code" in data:
                        results["error"].append(data["file_path"])
                        print("missing manifest id or manifest_name and project_code")
                        api_response.set_code(EAPIResponseCode.bad_request)
                        api_response.set_error_msg("missing manifest id or manifest_name and project_code")
                        return api_response.to_dict, api_response.code

                    manifest = db.session.query(DataManifestModel).filter_by(name=data["manifest_name"], project_code=data["project_code"]).first()
                    manifest_id = manifest.id
                if not manifest_id:
                    results["error"].append(data["file_path"])
                    print("Manifest not found")
                    api_response.set_code(EAPIResponseCode.not_found)
                    api_response.set_error_msg("Manifest not found")
                    return api_response.to_dict, api_response.code

                file_node = get_file_node(path)
                if not file_node:
                    results["error"].append(data["file_path"])
                    print("File not found")
                    api_response.set_code(EAPIResponseCode.not_found)
                    api_response.set_error_msg("File not found")
                    return api_response.to_dict, api_response.code
                # Make sure it's Greenroom/Raw
                if not is_greenroom_raw(file_node):
                    results["error"].append(file_node["full_path"])
                    print("not greenroom/raw")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_error_msg("File is in not greenroom/raw")
                    return api_response.to_dict, api_response.code

                # Permissions check
                if not has_permissions(manifest_id, file_node):
                    results["error"].append(file_node["full_path"])
                    print("Permission denied")

                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_error_msg("Permission denied")
                    return api_response.to_dict, api_response.code

                post_data = {
                    "manifest_id": manifest_id,
                }
                for key, value in data.get("attributes", {}).items():
                    post_data["attr_" + key] = value

                # Check required attributes 
                valid, error_msg = has_valid_attributes(manifest_id, data)
                if not valid:
                    results["error"].append(file_node["full_path"])
                    print("Mising required attributes")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_error_msg("Mising required attributes")
                    return api_response.to_dict, api_response.code

                file_id = file_node["id"]
                response = requests.put(ConfigClass.NEO4J_SERVICE + f"nodes/File/node/{file_id}", json=post_data)
                results["success"].append(file_node["full_path"])
            api_response.set_result(results)
            return api_response.to_dict, api_response.code
            

    class FileManifest(Resource):
        """
        Edit a manifest attached to a file
        """
        @jwt_required()
        def put(self):
            api_response = APIResponse()
            data = request.get_json()
            if not "file_path" in data:
                api_response.set_code(EAPIResponseCode.bad_request)
                api_response.set_result("Missing required parameter file_path")
                return api_response.to_dict, api_response.code

            file_node = get_file_node(data.pop("file_path"))

            # Permissions check
            manifest = db.session.query(DataManifestModel).get(file_node["manifest_id"])
            if current_identity["role"] != "admin":
                role = get_project_permissions(manifest.project_code, current_identity["user_id"])
                if role != "admin":
                    # contrib and collaborator must own the file to attach manifests
                    if file_node["uploader"] != current_identity["username"]:
                        api_response.set_code(EAPIResponseCode.forbidden)
                        api_response.set_result("Permission Denied")
                        return api_response.to_dict, api_response.code

            # Check required attributes 
            attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=file_node["manifest_id"]).\
                    order_by(DataAttributeModel.id.asc())
            valid_attributes = []
            for attr in attributes:
                valid_attributes.append(attr.name)
                if not attr.optional and not attr.name in data:
                    api_response.set_result("Missing required attribute")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    return api_response.to_dict, api_response.code
                if attr.type.value == "multiple_choice":
                    if not data[attr.name] in attr.value.split(","):
                        api_response.set_result("Invalid attribute value")
                        api_response.set_code(EAPIResponseCode.bad_request)
                        return api_response.to_dict, api_response.code
                if attr.type.value == "text":
                    value = data[attr.name]
                    if value:
                        if len(value) > 100:
                            api_response.set_result("text to long")
                            api_response.set_code(EAPIResponseCode.bad_request)
                            return api_response.to_dict, api_response.code
            post_data = {
                "manifest_id": file_node["manifest_id"],
            }
            for key, value in data.items():
                if key not in valid_attributes:
                    api_response.set_result("Not a valid attribute")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    return api_response.to_dict, api_response.code
                post_data["attr_" + key] = value

            file_id = file_node["id"]
            response = requests.put(ConfigClass.NEO4J_SERVICE + f"nodes/File/node/{file_id}", json=post_data)
            api_response.set_result(response.json()[0])
            return api_response.to_dict, api_response.code


    class ValidateManifest(Resource):
        """
        Validate the input to attach a file manifest
        """
        @jwt_required()
        def post(self):
            api_response = APIResponse()
            data = request.get_json()
            required_fields = ["manifest_name", "project_code"]

            # Check required fields
            for field in required_fields:
                if not field in data:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result(f"Missing required field: {field}")
                    return api_response.to_dict, api_response.code

            manifest_name = data["manifest_name"]
            project_code = data["project_code"]
            manifest = db.session.query(DataManifestModel).filter_by(project_code=project_code, name=manifest_name).first()
            if not manifest:
                api_response.set_code(EAPIResponseCode.not_found)
                api_response.set_result(f"Manifest not found")
                return api_response.to_dict, api_response.code

            attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=manifest.id)
            valid_attributes = []
            for attr in attributes:
                valid_attributes.append(attr.name)

            for key, value in data.get("attributes", {}).items():
                if key not in valid_attributes:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result("Invalid attribute")
                    return api_response.to_dict, api_response.code

            valid, error_msg = check_attributes(data.get("attributes", {}))
            if not valid:
                api_response.set_code(EAPIResponseCode.bad_request)
                api_response.set_result(error_msg)
                return api_response.to_dict, api_response.code

            # Check required attributes 
            valid, error_msg = has_valid_attributes(manifest.id, data)
            if not valid:
                api_response.set_result(error_msg)
                api_response.set_code(EAPIResponseCode.bad_request)
                return api_response.to_dict, api_response.code
            api_response.set_result("Success")
            return api_response.to_dict, api_response.code


    class ImportManifest(Resource):
        @jwt_required()
        def post(self):
            api_response = APIResponse()
            data = request.get_json()
            # permissions check
            if current_identity["role"] != "admin":
                role = get_project_permissions(data["project_code"], current_identity["user_id"])
                if role != "admin":
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Permission Denied")
                    return api_response.to_dict, api_response.code

            # limit check
            manifests = db.session.query(DataManifestModel).filter_by(project_code=data["project_code"])
            if manifests.count() > 9:
                api_response.set_code(EAPIResponseCode.forbidden)
                api_response.set_result("Manifest limit reached")
                return api_response.to_dict, api_response.code

            for manifest in manifests:
                result = manifest.to_dict()
                if data["name"] == result["name"]:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result("duplicate manifest name")
                    return api_response.to_dict, api_response.code

            manifest_data = {
                "name": data["name"],
                "project_code": data["project_code"]
            }
            # Create manifest in psql
            manifest = DataManifestModel(**manifest_data)
            db.session.add(manifest)
            db.session.commit()
            db.session.refresh(manifest)

            attributes = data.get("attributes", [])
            attr_data = {}
            mutli_requirement = re.compile("^[a-zA-z0-9-_!%&/()=?*+#.;,]{1,32}$")
            for attr in attributes:
                if attr["name"] in attr_data:
                    api_response.set_code(EAPIResponseCode.bad_request)
                    api_response.set_result("duplicate attribute")
                    return api_response.to_dict, api_response.code
                if attr["type"] == "multiple_choice":
                    if not re.search(mutli_requirement, attr["value"]):
                        api_response.set_code(EAPIResponseCode.bad_request)
                        api_response.set_result("regex value error")
                        return api_response.to_dict, api_response.code
                else:
                    if attr["value"] and len(attr["value"]) > 100:
                        api_response.set_code(EAPIResponseCode.bad_request)
                        api_response.set_result("text to long")
                        return api_response.to_dict, api_response.code
                attr_data[attr["name"]] = attr["value"]
            valid, error_msg = check_attributes(attr_data)
            if not valid:
                api_response.set_code(EAPIResponseCode.bad_request)
                api_response.set_result(error_msg)
                return api_response.to_dict, api_response.code

            required_fields = ["name", "type", "value", "optional"]
            attr_list = []
            # required attrbiute check
            for attribute in attributes:
                attr_data = {
                    "manifest_id": manifest.id, 
                    "project_code": data.get("project_code"), 
                }
                for field in required_fields:
                    if not field in attribute:
                        api_response.set_code(EAPIResponseCode.bad_request)
                        api_response.set_result(f"Missing required field {field}")
                        return api_response.to_dict, api_response.code
                    attr_data[field] = attribute[field]
                # check if connect to any files
                if not attr_data["optional"]:
                    response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/File/query/count", json={"manifest_id": manifest.id})
                    if response.json()["count"] > 0:
                        api_response.set_code(EAPIResponseCode.forbidden)
                        api_response.set_result("Can't add required attributes to manifest attached to files")
                        return api_response.to_dict, api_response.code
                attr_list.append(attr_data)

            # Create create attributes in psql
            for attr in attr_list:
                attribute = DataAttributeModel(**attr)
                db.session.add(attribute)
                db.session.commit()
                db.session.refresh(attribute)
            api_response.set_result("Success")
            return api_response.to_dict, api_response.code


    class ExportManifest(Resource):
        @jwt_required()
        def get(self):
            api_response = APIResponse()
            manifest_id = request.args.get("manifest_id")
            response_data = {
                "attributes": []
            }
            if not manifest_id:
                api_response.set_code(EAPIResponseCode.bad_request)
                api_response.set_result(f"Missing required field manifest_id")
                return api_response.to_dict, api_response.code

            manifest = db.session.query(DataManifestModel).get(manifest_id)

            if current_identity["role"] != "admin":
                role = get_project_permissions(manifest.project_code, current_identity["user_id"])
                if role != "admin":
                    api_response.set_code(EAPIResponseCode.forbidden)
                    api_response.set_result("Permission Denied")
                    return api_response.to_dict, api_response.code

            attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=manifest.id).\
                    order_by(DataAttributeModel.id.asc())
            for attribute in attributes:
                response_data["attributes"].append({
                    "name": attribute.name,
                    "type": attribute.type.value,
                    "value": attribute.value,
                    "optional": attribute.optional,
                })
            response_data["name"] = manifest.name
            response_data["project_code"] = manifest.project_code
            return response_data, 200


    class FileManifestQuery(Resource):
        @jwt_required()
        def post(self):
            api_response = APIResponse()
            paths = request.get_json().get("file_paths")
            lineage_view = request.get_json().get("lineage_view")

            results = {} 
            for path in paths:
                file_node = get_file_node(path)
                if file_node and file_node.get("manifest_id"):
                    if not has_permissions(file_node["manifest_id"], file_node) and not lineage_view:
                        api_response.set_code(EAPIResponseCode.forbidden)
                        api_response.set_result(f"Permission denied")
                        return api_response.to_dict, api_response.code
                    attributes = []
                    manifest_id = file_node["manifest_id"]
                    manifest = db.session.query(DataManifestModel).get(manifest_id)
                    sql_attributes = db.session.query(DataAttributeModel).filter_by(manifest_id=manifest_id)
                    for sql_attribute in sql_attributes:
                        attributes.append({
                            "id": sql_attribute.id,
                            "name": sql_attribute.name,
                            "manifest_name": manifest.name,
                            "value": file_node.get("attr_" + sql_attribute.name, ""),
                            "type": sql_attribute.type.value,
                            "optional": sql_attribute.optional,
                            "manifest_id": manifest_id,
                        })
                    results[path] = attributes 
                else:
                    results[path] = {} 
            api_response.set_result(results)
            return api_response.to_dict, api_response.code
