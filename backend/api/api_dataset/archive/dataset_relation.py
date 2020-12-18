from flask import request
from flask_restful import Resource
import requests
import json

from app import neo4j_connection
from config import ConfigClass
from resources import utils

# class to for the operating on dataset to dataset relation
# we allow user to add one as the child of another
class dataset_relation(Resource):

    # add the dataset to another    
    def post(self, dataset_id):
        # the parameter is the select dataset
        # the target dataset will be in the payload
        post_data = request.get_json()
        # check the dict type neo4j dont support the dict type
        for x in post_data:
            if type(post_data[x]) == dict:
                post_data.update({x: json.dumps(post_data[x])})

        target_dataset = post_data.pop("target_dataset", None)
        if not target_dataset:
            return {'result': "Error the target_dataset field is required"}, 403

        # then add the relation in the neo4j
        # TODO application level check here <-----------------------------------------------------------
        # maybe at only admin can share? and he need has both authorization?
        try:
            neo4j_session = neo4j_connection.session()
            res = neo4j_session.run('match (n1:Dataset),(n2:Dataset) where ID(n1)={child_did} and ID(n2) ={target_did} \
                create p=(n1)-[:PARENT]->(n2) return p', child_did=int(dataset_id), target_did=int(target_dataset))
        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403

        # check the datasets if it exist
        record = [x for x in res]
        if len(record) == 0:
            return {'result': 'either datasets do not exist'}, 403

        # print(record)

        return {'result': 'ok'}, 200
