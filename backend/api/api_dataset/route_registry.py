from api.module_api import module_api
from models.api_meta_class import MetaAPI
from .dataset_operation_neo4j import *
from .user_operation import *
from .namespace import datasets_entity_ns, users_entity_ns

from flask_restx import Api, Resource, fields
from config import ConfigClass

class APIDateSet(metaclass=MetaAPI):
    def api_registry(self):
        datasets_entity_ns.add_resource(datasets, '/')
        datasets_entity_ns.add_resource(datasets_search, '/queries')

        # Actions on specific dataset
        datasets_entity_ns.add_resource(dataset, '/<dataset_id>')

        # Actions on relationship between dataset and dataset
        datasets_entity_ns.add_resource(
            dataset_relation_child, '/<dataset_id>/relations/children')
        datasets_entity_ns.add_resource(
            dataset_relation_parent, '/<dataset_id>/relations/parent')
        datasets_entity_ns.add_resource(
            dataset_relation_none, '/<dataset_id>/relations/none')

        # Actions on multiple users
        datasets_entity_ns.add_resource(dataset_users, '/<dataset_id>/users')
        datasets_entity_ns.add_resource(DatasetUsersQuery, '/<dataset_id>/users/query')
        datasets_entity_ns.add_resource(dataset_admins, '/<dataset_id>/admins')

        # Actions on the specific user
        datasets_entity_ns.add_resource(
            DatasetUser, '/<dataset_id>/users/<username>')
        datasets_entity_ns.add_resource(
            DatasetUserProjectStatus, '/<dataset_id>/users/<username>/status')

        # Actions on users
        users_entity_ns.add_resource(users, '/platform')
        users_entity_ns.add_resource(
            user_dataset_query, '/<username>/datasets')
        users_entity_ns.add_resource(
            user_default_dataset, '/<username>/default')
        users_entity_ns.add_resource(ADUserUpdate, '')
