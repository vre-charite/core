from api.module_api import module_api
from models.api_meta_class import MetaAPI
from dataset import datasets_entity_ns, users_entity_ns
from .dataset_operation_neo4j import *
from .user_operation import *

class APIDateSet(metaclass=MetaAPI):
    def api_registry(self):
        datasets_entity_ns.add_resource(datasets, '/')
        datasets_entity_ns.add_resource(datasets_search, '/queries')

        # Actions on specific dataset
        datasets_entity_ns.add_resource(dataset, '/<dataset_id>')

        # Actions on relationship between dataset and dataset
        datasets_entity_ns.add_resource(dataset_relation_child, '/<dataset_id>/relations/children')
        datasets_entity_ns.add_resource(dataset_relation_parent, '/<dataset_id>/relations/parent')
        datasets_entity_ns.add_resource(dataset_relation_none, '/<dataset_id>/relations/none')

        # Actions on multiple users
        datasets_entity_ns.add_resource(dataset_users, '/<dataset_id>/users')

        # Actions on the specific user
        datasets_entity_ns.add_resource(dataset_user, '/<dataset_id>/users/<username>')

        # Actions on users
        users_entity_ns.add_resource(users, '/platform')
        users_entity_ns.add_resource(user_registry, '/new')
        users_entity_ns.add_resource(user_dataset_query, '/<username>/datasets')
        users_entity_ns.add_resource(user_default_dataset, '/<username>/default')
