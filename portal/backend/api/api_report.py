from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from models.report import ReportForm
from services.notifier_services.email_service import SrvEmail
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.user_services.user_manager import SrvUserManager
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from api import module_api
from flask import request
import json
from datetime import datetime


api_ns_report = module_api.namespace(
    'Report Restful', description='Portal Report Restful', path='/v1')


class APIReport(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_report.add_resource(
            self.ReportRestful, '/report/upload')

    class ReportRestful(Resource):
        @jwt_required()
        def post(self):
            '''
            This method allow to send a upload report to uploader.
            '''
            # init logger
            _logger = SrvLoggerFactory('api_report').get_logger()

            # init resp
            my_res = APIResponse()

            # init form
            post_json = request.get_json()
            _logger.info("Start Creating Report: {}".format(post_json))
            try:
                # now = datetime.now()
                # timestamp = now.strftime("%d/%m/%Y %H:%M:%S")
                # post_json['timestamp'] = timestamp
                report_form = ReportForm(
                    post_json).email_formatter()
                # message = MIMEMultipart(
                #     "alternative", None, [MIMEText(report_form, 'html')])
            except Exception as e:
                my_res.set_result(
                    '[FAILED] Failed to format the response.')
                my_res.set_code(EAPIResponseCode.bad_request)
                return my_res.to_dict, my_res.code

            # get receiver's email
            receiver_name = post_json.get('uploader')
            user_mgr = SrvUserManager()
            try:
                receiver_email = user_mgr.get_email_by_username(receiver_name)
            except Exception as e:
                my_res.set_result(
                    '[FAILED] Failed to get email address of receiver.')
                my_res.set_code(EAPIResponseCode.not_found)
                return my_res.to_dict, my_res.code

            # init invitation managemer
            email_mgr = SrvEmail()

            # send email to uploader
            title = '%s - Your upload report is ready!' % (receiver_name)
            email_mgr.send(title, report_form,
                           [receiver_email], "html")
            my_res.set_result('[SUCCEED] Email Upload Report Sent')
            _logger.info('Invitation Saved, Email Sent')
            my_res.set_code(EAPIResponseCode.success)
            return my_res.to_dict, my_res.code
