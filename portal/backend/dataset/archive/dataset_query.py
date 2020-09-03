from flask import request
from flask_restful import Resource
import requests
from flask_jwt import jwt_required
from resources import utils

class  dataset_query(Resource):
    # This API allow user to query datasets by name/tags/metadata
    def post(self):
        try: 
            # args = request.args
            # tags = args.getlist("tag")
            res = request.get_json()

            # List all datasets meet the requirements
            ret = utils.filter_datasets_by_args(res)

            # Format response
            result = []
            for x in ret:
                result.append({
                    'id': x[0].id,
                    'labels': list(x[0].labels),
                    'items': dict(zip(x[0].keys(), x[0].values()))
                })
        
        except Exception as e:
            return {'result': str(e)}, 403

        return {'result': result}, 200  

