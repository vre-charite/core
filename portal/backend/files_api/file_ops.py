from flask import request, send_file, Response, current_app
import os
import requests
from flask_restx import Api, Resource
from flask_jwt import jwt_required, current_identity

from config import ConfigClass

from resources.decorator import check_role


class file_predownload(Resource):
    @jwt_required()
    @check_role("uploader")
    def post(self, dataset_id):
        # proxy the arg and payload
        try:
            arg = request.args
            payload = request.get_json()
            headers = request.headers

            res = requests.post(ConfigClass.DATA_SERVICE+'containers/%s/file'%dataset_id, 
                    params=arg, json=payload, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403

    @jwt_required()
    @check_role("member")
    def get(self, dataset_id):
        '''
        This method allow to check download file zipping status.
        '''
        # proxy the arg and payload
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'containers/%s/file'%dataset_id, 
                    params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


class file_download_log(Resource):
    @jwt_required()
    @check_role("member")
    def get(self):
        # proxy the arg and payload
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'files/download/log',
                               params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


# ### ???????????????????????
# class file(Resource):
#     @ nfs_entity_ns.expect(file_download)
#     # @jwt_required()
#     def get(self):
#         '''
#         This method allow to download single file.
#         '''
#         arg = request.args
#         payload = request.get_json()
#         headers = request.headers

#         res = requests.get(ConfigClass.DATA_SERVICE+'/files/download',
#                 params=arg, data=payload, headers=headers)

#         return res.json(), res.status_code


class fileInfo(Resource):

    # query_sample_return = '''
    # {
    #     "result": {
    #         "entities": [
    #             {
    #                 "meanings": [],
    #                 "labels": [],
    #                 "displayText": "/usr/data/test1111/init.txt",
    #                 "attributes": {
    #                     "name": "/usr/data/test1111/init.txt",
    #                     "owner": "admin",
    #                     "generateID": "BXT-1234!",
    #                     "createTime": 0,
    #                     "bucketName": "test1111"
    #                 },
    #                 "classifications": [],
    #                 "classificationNames": [],
    #                 "typeName": "nfs_file",
    #                 "isIncomplete": false,
    #                 "status": "ACTIVE",
    #                 "guid": "c03d51b2-11be-400b-82ab-6b080ea12c50",
    #                 "meaningNames": []
    #             }
    #         ],
    #         "searchParameters": {
    #             "excludeDeletedEntities": true,
    #             "limit": 25,
    #             "includeClassificationAttributes": true,
    #             "attributes": [
    #                 "generateID"
    #             ],
    #             "includeSubClassifications": true,
    #             "includeSubTypes": true,
    #             "typeName": "nfs_file",
    #             "entityFilters": {
    #                 "operator": "contains",
    #                 "attributeValue": "test1111",
    #                 "attributeName": "bucketName"
    #             },
    #             "offset": 0
    #         },
    #         "approximateCount": 2,
    #         "queryType": "BASIC"
    #     }
    # }
    # '''

    # # get the file info under the container
    # @ nfs_entity_ns.response(200, query_sample_return)
    # @ nfs_entity_ns.param('page_size', 'number of entities return per request')
    # @ nfs_entity_ns.param('page', 'offset of query which page to start')
    # @ nfs_entity_ns.param('stage', 'possible value: raw(default)/processed indicates if it is raw or processed file')
    # @ nfs_entity_ns.param('column', 'which column user want to order')
    # @ nfs_entity_ns.param('text', 'full text search')
    # @ nfs_entity_ns.param('order', 'possible value asc and desc to tell order of return')
    @jwt_required()
    @check_role("uploader")
    def get(self, dataset_id):
        '''
        Get file detail infomation under container
        '''
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'containers/%s/files/meta'%dataset_id, 
                    params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


class processedFile(Resource):
    @jwt_required()
    @check_role("member")
    # use query string to find the files
    def get(self):
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'files/processed',
                               params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


class totalFileCount(Resource):
    @jwt_required()
    @check_role("admin")
    def get(self, dataset_id):
        '''
        Get file count from total raw and processed base on container id
        '''
        # proxy the arg and payload
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'containers/%s/files/count/total'%dataset_id, 
                    params=arg, headers=headers)
            
            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403


class dailyFileCount(Resource):
    @jwt_required()
    @check_role("uploader")
    def get(self, dataset_id):
        '''
        Get file count from total raw and processed base on container id
        '''
        # proxy the arg and payload
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'containers/%s/files/count/daily'%dataset_id, 
                    params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403
