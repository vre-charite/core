from flask import request
from flask_restful import Resource
import requests
import json

from app import neo4j_connection
from config import ConfigClass
from resources import utils
import requests
from requests.auth import HTTPBasicAuth
from flask_jwt import jwt_required


class dataset_operation(Resource):
    # this api to get the detail infomation about the specific dataset
    def get(self, dataset_id):
        try:
            dataset_id = int(dataset_id)
        except:
            return {'result': 'dataset_id should be integer'}, 403

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run('match (n:Dataset) where ID(n)={did}  \
            return n', did=int(dataset_id))

        # check the dataset if it exist
        record = [x for x in res]
        if len(record) == 0:
            return {'result': 'dataset %s does not exist' % (dataset_id)}, 403

        # formulate the detail info as the json
        dataset_detail = record[0]
        result = {
            'id': dataset_detail[0].id,
            'labels': list(dataset_detail[0].labels),
            'items': dict(zip(dataset_detail[0].keys(), dataset_detail[0].values()))
        }

        # use the path attribute as the clue to find files
        path = result['items'].get('path', None)
        if not path:
            return {'result': 'path of dataset %s does not exist.' % dataset_id}, 403
        # then use the hdfs to grab the file under it
        files = hdfs_client.list(path)
        result.update({'files': files})
        # print(files)

        return {'result': result}, 200


# this class is the action on all datasets
class datasets_all_action(Resource):
    def get(self):
        # l = hdfs_client.list(ConfigClass.DATASET_PATH)
        # print(l)

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run('match (n:Dataset) where not "default" \
                in n.tags or n.tags is null return n')

        result = []
        for x in res:
            result.append({
                'id': x[0].id,
                'labels': list(x[0].labels),
                'items': dict(zip(x[0].keys(), x[0].values()))
            })
        # print(result)

        return {'result': result}, 200

    # create dataset
    def post(self):
        # get the payload
        post_data = request.get_json()
        # check the dict type neo4j dont support the dict type
        for x in post_data:
            if type(post_data[x]) == dict:
                post_data.update({x: json.dumps(post_data[x])})
        print(post_data)
        dataset_name = post_data.pop("dataset_name", None)
        if not dataset_name:
            return {'result': "Error the dataset_name field is required"}, 403

        # description = post_data.get("description", "None")
        # admin is the now is only one
        # admin = post_data.get("admin", "None")

        # as the easy start the payload are only description and admin
        try:

            # # let the hdfs create a dataset
            utils.create_dataset(dataset_name, post_data)

        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403
        # create ranger policy
        try:
            create_group_url = ConfigClass.RANGER_URL+'service/xusers/secure/groups'
            headers = {'content-type': 'application/json',
                       'Accept-Charset': 'UTF-8', 'X-XSRF-HEADER': 'valid'}
            payload = {'name': dataset_name}
            res = requests.post(create_group_url, headers=headers, json=payload, auth=HTTPBasicAuth(
                ConfigClass.RANGER_USER, ConfigClass.RANGER_PASSWORD), verify=True)
            if res.ok:
                update_policy_url = ConfigClass.RANGER_URL+'service/public/v2/api/policy'
                policy_payload = {
                    'name': dataset_name+'-'+'policy',
                    "policyItems": [
                        {
                            "accesses": [
                                {
                                    "isAllowed": True,
                                    "type": "read"
                                },
                                {
                                    "isAllowed": True,
                                    "type": "write"
                                },
                                {
                                    "isAllowed": True,
                                    "type": "execute"
                                }
                            ],
                            "conditions": [],
                            "delegateAdmin": True,
                            "groups": [dataset_name]
                        }
                    ],
                    "resources": {
                        "path": {
                            "isExcludes": False,
                            "isRecursive": True,
                            "values": ["/dataset/"+dataset_name]
                        }
                    },
                    "service": ConfigClass.RANGER_HDFS_REPO,
                    "version": 1
                }
                update_policy_res = requests.post(update_policy_url, headers=headers, json=policy_payload, auth=HTTPBasicAuth(
                    ConfigClass.RANGER_USER, ConfigClass.RANGER_PASSWORD), verify=True)
                if not update_policy_res.ok:
                    update_policy_res.raise_for_status()
            else:
                res.raise_for_status()
        except Exception as e:
            print(e)
            # TO DO, call remove dataset function to remove hdfs dataset
            return {'result': 'Error %s' % str(e)}

        # neo4j_session.commit()

        return {'result': 'ok'}, 200



        