from flask import request, send_file, Response, current_app
import requests
from flask_restx import Api, Resource
from flask_jwt import jwt_required, current_identity

from config import ConfigClass

from resources.decorator import check_role


class folders(Resource):

    # @nfs_entity_ns.doc(params={'field': {'type': 'string'}})
    # @nfs_entity_ns.expect(folder)
    # @nfs_entity_ns.response(200, folder_return)
    @jwt_required()
    # @check_role("member")
    def get(self):
        '''
        This method allow to walk through folders.
        '''
        # proxy the arg and payload
        try:
            arg = request.args
            # payload = request.get_json()
            headers = request.headers

            res = requests.get(ConfigClass.DATA_SERVICE+'folders',
                               params=arg, headers=headers)

            return res.json(), res.status_code
        except Exception as e:
            print(e)
            return {'result': str(e)}, 403
