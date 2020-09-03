from flask import request
from flask_restful import Resource
import requests
import json
import datetime

from . import neo4j_connection, hdfs_client
from config import ConfigClass
import requests
from requests.auth import HTTPBasicAuth
from .utils import *

# TODO remember the authorization <------------------------------------------------
class user_request_dataset(object):
    def post(self, dataset_id):
        # first check if the dataset if valid
        dataset_id = verify_dataset_id(dataset_id)

        ############################################################
        # TODO we dont have authorization now use the fake user
        ############################################################
        post_data = request.get_json()
        user = post_data.get('user', None)
        if not user:
            return {'result': 'user is required'}

        #####################################################
        # validata if user already have access
        #####################################################
        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run('match p=(u:User)-[]->(d:Dataset) where ID(d)={did} \
                and u.name={username} return p', dataset_id=dataset_id, username=user)
        result = [x for x in res]
        if len(result) == 0:
            raise Exception('User %s already have access or request to dataset %s'%(dataset_id))
        neo4j_session.close()

        # then add the relationship between them
        try:
            neo4j_session = neo4j_connection.session()
            res = neo4j_session.run('match p=(u:User)-[:REQUEST]->(d:Dataset) where ID(d)={did} \
                and u.name={username} return p', dataset_id=dataset_id, username=user)
            neo4j_session.close()
        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403


        return {'result': 'success'}, 200

    def get(self, dataset_id):
        # first check if the dataset if valid
        dataset_id = verify_dataset_id(dataset_id)

        # ############################################################
        # # TODO we dont have authorization now use the fake user
        # ############################################################
        # post_data = request.get_json()
        # user = post_data.get('user', None)
        # if not user:
        #     return {'result': 'user is required'}

        # #####################################################
        # # validata if user already have access
        # #####################################################
        # neo4j_session = neo4j_connection.session()
        # res = neo4j_session.run('match p=(u:User)-[]->(d:Dataset) where ID(d)={did} \
        #         and u.name={username} return p', dataset_id=dataset_id, username=user)
        # result = [x for x in res]
        # if len(result) == 0:
        #     raise Exception('User %s already have access or request to dataset %s'%(dataset_id))
        # neo4j_session.close()

        # then add the relationship between them
        try:
            neo4j_session = neo4j_connection.session()
            res = neo4j_session.run('match p=(u:User)-[:REQUEST]->(d:Dataset) where ID(d)={did} \
                return u', dataset_id=dataset_id)
            neo4j_session.close()
        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403


        return {'result': 'success'}, 200





