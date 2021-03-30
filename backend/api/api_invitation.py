from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from models.invitation import db, InvitationModel, InvitationForm
from resources.swagger_modules import create_invitation_request_model, create_invitation_return_example
from resources.swagger_modules import read_invitation_return_example
from services.invitation_services.invitation_manager import SrvInvitationManager
from services.logger_services.logger_factory_service import SrvLoggerFactory
from api import module_api
from flask import request
import json
import requests
import math
import datetime

api_ns_invitations = module_api.namespace(
    'Invitation Restful', description='Portal Invitation Restful', path='/v1')
api_ns_invitation = module_api.namespace(
    'Invitation Restful', description='Portal Invitation Restful', path='/v1')

class APIInvitation(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_invitations.add_resource(
            self.InvitationsRestful, '/invitations')
        api_ns_invitation.add_resource(
            self.InvitationRestful, '/invitation/<invitation_hash>')
        api_ns_invitation.add_resource(
            self.CheckUserPlatformRole, '/invitation/check/<email>')
        api_ns_invitation.add_resource(
            self.PendingUserRestful, '/invitation-list')

    class InvitationsRestful(Resource):
        @api_ns_invitations.expect(create_invitation_request_model)
        @api_ns_invitations.response(200, create_invitation_return_example)
        @jwt_required()
        # @check_role('admin')
        def post(self):
            '''
            This method allow to create invitation in platform.
            '''
            # init logger
            _logger = SrvLoggerFactory('api_invitation').get_logger()
            # init resp
            my_res = APIResponse()
            # get access_token
            access_token = request.headers.get("Authorization", None)
            # init form
            post_json = request.get_json()

            _logger.info("Start Creating Invitation: {}".format(post_json))
            if not post_json.get("email"):
                my_res.set_result('missing required field email')
                my_res.set_code(EAPIResponseCode.bad_request)
                return my_res.to_dict, my_res.code

            invitation_form = InvitationForm(post_json)
            if not invitation_form.project_id:
                # Only platform admin can invite with a project
                if current_identity["role"] != "admin":
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_error_msg('Permission denied')
                    return my_res.to_dict, my_res.code

                res = requests.post(
                    url=ConfigClass.NEO4J_SERVICE + "nodes/User/query",
                    json={"email": invitation_form.email}
                )
                result = json.loads(res.text)
                if result:
                    my_res.set_result('[ERROR] User already exists in platform')
                    _logger.info('User already exists in platform')
                    my_res.set_code(EAPIResponseCode.bad_request)
                    return my_res.to_dict, my_res.code
            else:
                if current_identity["role"] != "admin":
                    params = {
                        "start_id": current_identity["user_id"],
                        "end_id": invitation_form.project_id 
                    }
                    res = requests.get(ConfigClass.NEO4J_SERVICE + "relations", params=params)
                    relations = json.loads(res.text)
                    if not relations:
                        my_res.set_code(EAPIResponseCode.forbidden)
                        my_res.set_error_msg('Permission denied')
                        return my_res.to_dict, my_res.code
                    role = relations[0]["r"]["type"]
                    # Check project permissions
                    if role != "admin":
                        my_res.set_code(EAPIResponseCode.forbidden)
                        my_res.set_error_msg('Permission denied')
                        return my_res.to_dict, my_res.code

            # init invitation managemer
            invitation_mgr = SrvInvitationManager()
            # save invitation
            invitation_mgr.save_invitation(invitation_form, access_token, current_identity)
            my_res.set_result('[SUCCEED] Invitation Saved, Email Sent')
            _logger.info('Invitation Saved, Email Sent')
            my_res.set_code(EAPIResponseCode.success)
            return my_res.to_dict, my_res.code

    class InvitationRestful(Resource):
        @api_ns_invitation.response(200, read_invitation_return_example)
        def get(self, invitation_hash):
            '''
            This method allow to get invitation details by HashID.
            '''
            # init logger
            _logger = SrvLoggerFactory('api_invitation').get_logger()
            # init resp
            my_res = APIResponse()
            try:
                # init invitation managemer
                invitation_mgr = SrvInvitationManager()
                invitation_validation = invitation_mgr.validate_invitation_code(
                    invitation_hash)
                is_valid = invitation_validation[0]
                invitation_find = invitation_validation[1]
                error_code = invitation_validation[2]
                if is_valid:
                    form_data = json.loads(invitation_find.invitation_detail)
                    invitation_form = InvitationForm(form_data)
                    my_res.set_code(EAPIResponseCode.success)
                    my_res.set_result(invitation_form.to_dict)
                else:
                    if error_code == 404:
                        my_res.set_code(EAPIResponseCode.not_found),
                        my_res.set_error_msg(
                            'Invitation Not Found: ' + invitation_hash)
                        _logger.warning(
                            'Invitation Not Found: ' + invitation_hash)
                    else:
                        my_res.set_code(EAPIResponseCode.unauthorized),
                        my_res.set_error_msg(
                            'Invitation Expired: ' + invitation_hash)
                        _logger.warning(
                            'Invitation Expired: ' + invitation_hash)
                return my_res.to_dict, my_res.code
            except Exception as e:
                _logger.fatal(str(e))
                my_res.set_code(EAPIResponseCode.internal_error)
                my_res.set_error_msg('Internal Error' + str(e))
                return my_res.to_dict, my_res.code


    class CheckUserPlatformRole(Resource):
        @jwt_required()
        def get(self, email):
            '''
            This method allow to get user's detail on the platform.
            '''
            # init logger
            _logger = SrvLoggerFactory('api_invitation').get_logger()
            # init resp
            my_res = APIResponse()

            try:
                # get access_token
                access_token = request.headers.get("Authorization", None)

                res = requests.post(
                    url=ConfigClass.NEO4J_SERVICE + "nodes/User/query",
                    headers={"Authorization": access_token},
                    json={"email": email}
                )
                result = json.loads(res.text)

                if result:
                    my_res.set_result(result)
                    my_res.set_code(EAPIResponseCode.success)
                    return my_res.to_dict, my_res.code

                else:
                    my_res.set_result('User is not existed in platform')
                    my_res.set_code(EAPIResponseCode.not_found)
                    return my_res.to_dict, my_res.code

            except Exception as e:
                _logger.fatal(str(e))
                my_res.set_code(EAPIResponseCode.internal_error)
                my_res.set_error_msg('Internal Error' + str(e))
                return my_res.to_dict, my_res.code


    class PendingUserRestful(Resource):
        @jwt_required()
        # @check_role("admin")
        def post(self):
            '''
            This method allow to get all pending users from invitation links.
            '''
            # init logger
            _logger = SrvLoggerFactory('api_pending_users').get_logger()
            _logger.info('fetching pending user api triggered')
            # init resp
            my_res = APIResponse()

            try:
                # init invitation managemer
                invitation_mgr = SrvInvitationManager()

                post_json = request.get_json()

                page = post_json.get('page', 0)
                page_size = post_json.get('page_size', 25)
                order_by = post_json.get('order_by', None)
                order_type = post_json.get('order_type', None)

                filters = post_json.get('filters', None)
                project_id = filters.get("project_id")

                if current_identity["role"] != "admin":
                    params = {
                        "start_id": current_identity["user_id"],
                        "end_id": project_id
                    }
                    res = requests.get(ConfigClass.NEO4J_SERVICE + "relations", params=params)
                    relations = json.loads(res.text)
                    if not relations:
                        my_res.set_code(EAPIResponseCode.forbidden)
                        my_res.set_error_msg('Permission denied')
                        return my_res.to_dict, my_res.code
                    role = relations[0]["r"]["type"]
                    # Only project admin or platform admin can access this API
                    if role != "admin":
                        my_res.set_code(EAPIResponseCode.forbidden)
                        my_res.set_error_msg('Permission denied')
                        return my_res.to_dict, my_res.code

                records, count = invitation_mgr.get_invitations(page, page_size, filters, order_by, order_type)
                result = []

                for record in records:
                    detail = json.loads(record.invitation_detail)
                    user_info = { 
                        'expiry_timestamp': record.expiry_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        'create_timestamp': record.create_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        'invited_by': record.invited_by,
                        **detail
                    }
                    result.append(user_info)
                my_res.set_result(result)
                my_res.set_total(count)
                my_res.set_num_of_pages(math.ceil(count/page_size))
                my_res.set_page(page)
                
                return my_res.to_dict, my_res.code
            except Exception as e:
                _logger.error('error in pending users' + str(e))
                my_res.set_code(EAPIResponseCode.internal_error)
                my_res.set_error_msg('Internal Error' + str(e))
                return my_res.to_dict, my_res.code

