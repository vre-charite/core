from flask import request
from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
import requests
import json
import datetime
from resources.utils import *
from resources.decorator import check_role
from resources.swagger_modules import dataset_module, dataset_sample_return, datasets_sample_return
from services.container_services.container_manager import SrvContainerManager
from .namespace import datasets_entity_ns
from config import ConfigClass
from services.logger_services.logger_factory_service import SrvLoggerFactory

# init logger
_logger = SrvLoggerFactory('api_dataset_ops').get_logger()


# this class is the action on all datasets
class datasets(Resource):
    @datasets_entity_ns.response(200, datasets_sample_return)
    @jwt_required()
    # @check_role("visitor")
    def get(self):
        '''
        This method allow user list all datasets/metadatas/tags
        '''
        try:
            param = request.args.get('type', None)  # metadata/tag/usecase
            tags = request.args.get('tags', None)
            _logger.info(
                'Call API for fetching project info: type {}'.format(param))
            access_token = request.headers.get("Authorization", None)

            result = None
            if(param == "metadata" or param == "tag"):
                res = retreive_property(access_token, "Dataset")

                if(param == "tag"):
                    result = list(set().union(*res['tags']))
                else:
                    result = {}
                    for key, value in res.items():
                        if key.startswith('_'):
                            result[key] = value
            else:
                role = current_identity["role"]
                username = current_identity["username"]

                payload = {"type": "Usecase", **request.args} if param == "usecase" else {}
                if role != "admin":
                    payload["discoverable"] = True
                payload = {**payload, **request.args}

                if "create_time_start" in payload and "create_time_end" in payload:
                    payload["create_time_start"] = datetime.datetime.utcfromtimestamp(int(payload["create_time_start"])).strftime('%Y-%m-%dT%H:%M:%S')
                    payload["create_time_end"] = datetime.datetime.utcfromtimestamp(int(payload["create_time_end"])).strftime('%Y-%m-%dT%H:%M:%S')
               
                url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query"
                response = neo4j_query_with_pagination(url, payload, partial=True)

                if(response.code != 200):
                    _logger.error('Failed to fetch info in neo4j: {}'.format(
                        json.loads(response.result)))
                    return response.to_dict

                _logger.info('success in calling neo4j')

                return response.to_dict
        except Exception as e:
            _logger.error('Error in fetching project info: {}'.format(str(e)))
            return {'result': 'Error %s' % str(e)}, 403

    @ datasets_entity_ns.expect(dataset_module)
    @ datasets_entity_ns.response(200, dataset_sample_return)
    @ jwt_required()
    @ check_role("admin", True)
    def post(self):
        '''
        This method allow to create container in platform.
        Notice that top-level container could only be created by site admin.
        '''
        # get the payload
        post_data = request.get_json()
        _logger.info('Calling API for creating project: {}'.format(post_data))

        metadatas = post_data.pop("metadatas", {})
        container_type = post_data.get("type", None)

        # check the dict type neo4j dont support the dict type
        for x in post_data:
            if type(post_data[x]) == dict:
                post_data.update({x: json.dumps(post_data[x])})

        dataset_name = post_data.pop("dataset_name", None)
        code = post_data.get("code", None)
        if not dataset_name or not code:
            _logger.error('Field dataset_name and code field is required.')
            return {'result': "Error the dataset_name and code field is required"}, 403

        auth_result = None

        # as the easy start the payload are only description and admin
        try:
            # Duplicate check 
            url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query"
            res = requests.post(url=url, json={"code": code})
            datasets = res.json()
            if datasets:
                return {'result': 'Error duplicate project code'}, 409

            # # let the hdfs create a dataset
            post_data.update({'name': dataset_name})
            post_data.update({'path': code})
            post_data['system_tags'] = ['copied-to-core']

            # if we have the parent_id then update relationship label as PARENT
            if post_data.get('parent_id', None):
                post_data.update({'parent_relation': 'PARENT'})

            # pop the metadatas one layer out
            for x in metadatas:
                post_data.update({'_%s' % x: metadatas[x]})

            if post_data.get("icon"):
                # check if icon is bigger then limit
                if len(post_data.get("icon")) > ConfigClass.ICON_SIZE_LIMIT:
                    return {'result': 'icon too large'}, 413

            result = requests.post(ConfigClass.NEO4J_SERVICE+"nodes/Dataset",
                                   json=post_data)

            # if we get the error in the result as 403
            if result.status_code == 403:
                raise Exception(json.loads(result.text))
            result = json.loads(result.text)[0]

            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Add admins to dataset
            dataset_id = result.get("id")
            admins = result.get("admin", None)
            error = []
            if(admins is not None):
                error = bulk_add_user(headers, dataset_id, admins, "admin")
                if len(error) != 0:
                    return {"result": str(error)}

            # Create folder (project) in Green Room
            url = ConfigClass.DATA_SERVICE + "folders"
            root = result['path']
            if container_type == "Usecase":
                path = [root, root+"/raw", root+"/processed", root +
                        "/workdir", root+"/trash", root+'/logs']  # Top-level folders
                vre_path = [root, root + "/raw"]
            else:
                path = [root]
                vre_path = [root]

            for p in path:
                payload = {
                    "path": p
                }
                res = requests.post(
                    url=url,
                    json=payload
                )
                if(res.status_code != 200):
                    return {'result': json.loads(res.text)}, res.status_code

            # Create folder in VRE Core
            for p in vre_path:
                res = requests.post(url=url, json={
                    'path': p,
                    'service': 'VRE'
                })
                if(res.status_code != 200):
                    return {'result': json.loads(res.text)}, res.status_code

            container_mgr = SrvContainerManager()
            res = container_mgr.list_containers('Dataset', {'type': 'Usecase'})

            # create Project User Group
            auth_url = ConfigClass.AUTH_SERVICE + 'admin/users/group'
            auth_payload = {
                "realm": "vre",
                "username": ConfigClass.GROUP_ADMIN,
                "groupname": code
            }

            auth_res = requests.post(url=auth_url, json=auth_payload)

            if(auth_res.status_code != 200):
                    return {'result': json.loads(res.text), 'auth_result': 'failed to create user group'}, res.status_code

        except Exception as e:
            _logger.error('Error in creating project: {}'.format(str(e)))
            return {'result': 'Error %s' % str(e)}, 403

        return {'result': res, 'auth_result': 'create user group successfully'}, 200


class dataset(Resource):
    @ datasets_entity_ns.response(200, dataset_sample_return)
    @ jwt_required()
    @ check_role("admin")
    def put(self, dataset_id):
        '''
        This method allow to allow admin to update information of the container.
        '''

        try:
            post_data = request.get_json()
            _logger.info('Calling API for updating project info: dataset_id {}, {}'.format(
                str(dataset_id), post_data))

            # Check if the dataset exists
            access_token = request.headers.get("Authorization", None)
            datasets = check_container_exist(
                access_token, "Dataset", dataset_id)
            if(len(datasets) == 0):
                _logger.error('Field dataset_id is not valid.')
                return {'result': "Dataset %s is not available." % dataset_id}, 403

            if post_data.get("icon"):
                # check if icon is bigger then limit
                if len(post_data.get("icon")) > ConfigClass.ICON_SIZE_LIMIT:
                    return {'result': 'icon to large'}, 413

            # Update dataset properties
            result = requests.put(
                ConfigClass.NEO4J_SERVICE+"nodes/Dataset/node/%s" % dataset_id, json=post_data)

            # If we get the error in the result as 403
            if result.status_code == 403:
                raise Exception(json.loads(result.text))

        except Exception as e:
            _logger.error(
                'Error in updating project information:{}'.format(str(e)))
            return {'result': str(e)}, 403

        return {'result': json.loads(result.text)}, 200

    # not used
    @ datasets_entity_ns.response(200, dataset_sample_return)
    @ jwt_required()
    @ check_role("visitor")
    def get(self, dataset_id):
        '''
        This method allow to allow admin to get information of the container.
        '''
        _logger.info(
            'Call API for getting project info: dataset_id %s', str(dataset_id))
        try:
            result = requests.get(
                ConfigClass.NEO4J_SERVICE+"nodes/Dataset/node/%s" % dataset_id)
            # if we get the error in the result as 403
            if result.status_code == 403:
                raise Exception(json.loads(result.text))

        except Exception as e:
            _logger.error('Error in getting project info: {}'.format(str(e)))
            return {'result': 'Error %s' % str(e)}, 403

        return {'result': json.loads(result.text)}, 200

# Deprecate


class datasets_search(Resource):
    @ jwt_required()
    def post(self):
        '''
        This method allow user to query datasets by name/tags/metadata
        '''
        try:
            res = request.get_json()

            # List all datasets meet the requirements
            result = filter_datasets_by_args(res)

        except Exception as e:
            return {'result': str(e)}, 403

        return {'result': result}, 200


# Deprecate
# class to for the operating on dataset to dataset relation
class dataset_relation_parent(Resource):

    # given dataset add the parent dataset
    # the parameter is the select dataset
    # the target dataset will be in the payload
    @ jwt_required()
    def post(self, dataset_id):
        '''
        This method allow user to add one as the child of another
        '''
        post_data = request.get_json()
        # check the dict type neo4j dont support the dict type
        for x in post_data:
            if type(post_data[x]) == dict:
                post_data.update({x: json.dumps(post_data[x])})

        target_dataset = post_data.pop("target_dataset", None)
        if not target_dataset:
            return {'result': "Error the target_dataset field is required"}, 403
        # also if the frontend pass single one then we make it as array
        if type(target_dataset) != list:
            target_dataset = [target_dataset]

        # then add the relation in the neo4j
        # TODO application level check here <-----------------------------------------------------------
        # maybe at only admin can share? and he need has both authorization?
        try:
            res = requests.post(ConfigClass.NEO4J_SERVICE+"relations/PARENT",
                                json={"start_id": target_dataset, "end_id": int(dataset_id)})

            # if we get the error in the result as 403
            if res.status_code == 403:
                raise Exception(json.loads(res.text))

            # check the datasets if it exist
            # record = [x for x in res]
            record = json.loads(res.text)
            if len(record) == 0:
                return {'result': 'either datasets do not exist'}, 403

        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403

        return {'result': 'ok'}, 200

    @ jwt_required()
    def get(self, dataset_id):
        try:
            res = requests.get(ConfigClass.NEO4J_SERVICE+"relations/PARENT/node/%s" % dataset_id,
                               params={"start": False})
            result = json.loads(res.text)

        except Exception as e:
            return {'result': 'Error %s' % str(e)}, 403

        return {'result': result}, 200

# Deprecate


class dataset_relation_child(Resource):
    @ jwt_required()
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
        # also if the frontend pass single one then we make it as array
        if type(target_dataset) != list:
            target_dataset = [target_dataset]

        # then add the relation in the neo4j
        # TODO application level check here <-----------------------------------------------------------
        # maybe at only admin can share? and he need has both authorization?
        try:

            res = requests.post(ConfigClass.NEO4J_SERVICE+"relations/PARENT",
                                json={"start_id": int(dataset_id), "end_id": target_dataset})
            # if we get the error in the result as 403
            if res.status_code == 403:
                raise Exception(json.loads(res.text))

            # check the datasets if it exist
            record = json.loads(res.text)
            if len(record) == 0:
                return {'result': 'either datasets do not exist'}, 403

        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403

        return {'result': 'ok'}, 200

    @ jwt_required()
    def get(self, dataset_id):
        # start query for get the the parent relationship all the way down
        try:
            res = requests.get(
                ConfigClass.NEO4J_SERVICE+"relations", params={"start_id": int(dataset_id), "label": "PARENT*"})
            # if we get the error in the result as 403
            if res.status_code == 403:
                raise Exception(json.loads(res.text))

            result = json.loads(res.text)
            # if there is a relationship
            if len(result) != 0:
                result = json.loads(res.text)[0]['p']
        except Exception as e:
            print(e)
            return {'result': 'Error %s' % str(e)}, 403

        # formate the result into frontend request remove json in the children field
        def fomart_children_into_array(result_object):
            detail = {}
            for dataset in result_object:
                detail = result_object.get(dataset)
                children = detail.pop('children', {})

                # flattent the json into array
                detail.update({'dataset_name': dataset})
                detail.update({'children': []})

                # recursivelly go down if we have children
                for x in children:
                    detail['children'].append(
                        fomart_children_into_array({x: children[x]}))

            return detail

        return {'result': fomart_children_into_array(result)}, 200

# Deprecate
# this is class is the opposite for the previous two
# it will get the dataset that are not in the parent relationship
# with give dataset

# Deprecate


class dataset_relation_none(Resource):
    @ jwt_required()
    def get(self, dataset_id):

        # make the query to find the dataset is not in relationship
        try:
            res = requests.get(ConfigClass.NEO4J_SERVICE +
                               "relations/PARENT*/node/%s/none" % dataset_id)
            result = json.loads(res.text)

        except Exception as e:
            return {'result': 'Error %s' % str(e)}, 403

        return {'result': result}, 200
