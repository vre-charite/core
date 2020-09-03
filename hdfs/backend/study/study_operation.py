from flask import request, make_response, jsonify
from flask_restful import Api, Resource
from flask_jwt import current_identity, jwt_required

import datetime
import os
from flask_cors import CORS, cross_origin
from config import ConfigClass

from app import hdfs_client

class study_operation(Resource):
    def post(self):
        post_data = request.get_json()
        # the folder name TBD check the duplicate
        study_name = post_data.get('study_name', None)
        if not study_name:
            return 'field study_name is required', 400

        # create the study folder first
        try:
            hdfs_client.makedirs('./'+study_name)
        except Exception as e:
            return str(e), 403

        # create rest of placeholder
        hdfs_client.makedirs('./'+study_name+'/data')
        hdfs_client.makedirs('./'+study_name+'/etl')
        hdfs_client.makedirs('./'+study_name+'/raw')
        hdfs_client.makedirs('./'+study_name+'/metadata')

        return 'success', 200

    def get(self):
        try:
            res = hdfs_client.list('./')
        except Exception as e:
            return str(e), 403

        return res, 200
