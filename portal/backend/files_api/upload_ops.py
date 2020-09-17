from flask import request, send_file, Response, current_app
import requests
from flask_restx import Api, Resource
from flask_jwt import jwt_required, current_identity
import json

from config import ConfigClass

from resources.decorator import check_role


class CheckUploadStatusRestful(Resource):
    # @api_file_upload.expect(create_invitation_request_model)
    # @api_file_upload.response(200, create_invitation_return_example)
    @jwt_required()
    @check_role("uploader")
    def get(self, dataset_id):
        '''
        This method allow to check file upload status.
        '''
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'upload/containers/%s/status' % dataset_id,
                               params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


class PreUploadRestful(Resource):

    # @api_file_upload.expect(create_invitation_request_model)
    # @api_file_upload.response(200, create_invitation_return_example)
    @jwt_required()
    @check_role("uploader")
    def post(self, dataset_id):
        '''
        This method allow to pre-upload file.
        '''
        # init resp
        try:
            payload = request.form
            headers = {k: v for k, v in request.headers.items()}
            headers.update(
                {'Content-Type': 'application/x-www-form-urlencoded'})

            res = requests.post(ConfigClass.DATA_SERVICE+'upload/containers/%s/pre' % dataset_id,
                                data=payload, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


class ChunkUploadSuccessRestful(Resource):

    # @api_file_upload.expect(create_invitation_request_model)
    # @api_file_upload.response(200, create_invitation_return_example)
    @jwt_required()
    @check_role("uploader")
    def post(self, dataset_id):
        '''
        This method allow to create a flask executor to combine chunks uploaded.
        '''
        try:
            payload = request.form
            headers = request.headers
            headers = {k: v for k, v in request.headers.items()}
            headers.update(
                {'Content-Type': 'application/x-www-form-urlencoded'})

            res = requests.post(ConfigClass.DATA_SERVICE+'upload/containers/%s/on-success' % dataset_id,
                                data=payload, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403
