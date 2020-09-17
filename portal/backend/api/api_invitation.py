from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.user_type import EUserType
from models.api_meta_class import MetaAPI
from models.invitation import InvitationForm
from resources.swagger_modules import create_invitation_request_model, create_invitation_return_example
from resources.swagger_modules import read_invitation_return_example
from services.invitation_services.invitation_manager import SrvInvitationManager
from services.logger_services.logger_factory_service import SrvLoggerFactory
from api import module_api
from flask import request
import json

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
            invitation_form = InvitationForm(post_json)
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
                if is_valid:
                    form_data = json.loads(invitation_find[1])
                    invitation_form = InvitationForm(form_data)
                    my_res.set_code(EAPIResponseCode.success)
                    my_res.set_result(invitation_form.to_dict)
                else:
                    my_res.set_code(EAPIResponseCode.not_found),
                    my_res.set_error_msg(
                        'Invitation Not Found Or Expired: ' + invitation_hash)
                    _logger.warning(
                        'Invitation Not Found Or Expired: ' + invitation_hash)
                return my_res.to_dict, my_res.code
            except Exception as e:
                _logger.fatal(str(e))
                my_res.set_code(EAPIResponseCode.internal_error)
                my_res.set_error_msg('Internal Error' + str(e))
                return my_res.to_dict, my_res.code
