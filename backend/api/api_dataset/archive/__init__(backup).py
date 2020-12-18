from flask_restx import Api, Resource, fields
from config import ConfigClass

module_api = Api(version='1.0', title='Portal API', 
    description='BFF Portal API for VRE', doc='/v1/api-doc')
datasets_entity_ns = module_api.namespace('Portal Dataset Actions', description='Operation on datasets', path ='/v1/datasets')
users_entity_ns = module_api.namespace('Portal User Actions', description='Operation on users', path ='/v1/users')

from .dataset_operation_neo4j import *
from .user_operation import *

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
users_entity_ns.add_resource(user_dataset_query, '/<username>/datasets')
users_entity_ns.add_resource(user_default_dataset, '/<username>/default')


# Deprecated 
# # first check the necessary config parameter
# required_parameters = ["NEO4J_URL", "DATASET_PATH", "HDFS_DATANODE", "HDFS_USER", "NEO4J_PASS", "NEO4J_USER"]
# for x in required_parameters:
# 	if not getattr(ConfigClass, x, None):
# 		raise Exception("Error: Missing the attribute %s in config."%x)

# from neo4j import GraphDatabase
# print(ConfigClass.NEO4J_URL)
# neo4j_connection = GraphDatabase.driver(ConfigClass.NEO4J_URL, 
# 	auth=(ConfigClass.NEO4J_USER, ConfigClass.NEO4J_PASS),encrypted=False)

# from hdfs.ext.kerberos import KerberosClient
# # for testing we disable the hdfs
# if ConfigClass.HDFS_ENABLE == True:
# 	hdfs_client = KerberosClient(url=ConfigClass.HDFS_DATANODE, proxy=ConfigClass.HDFS_USER)
# 	hdfs_client.makedirs(ConfigClass.DATASET_PATH)
# else:
# 	hdfs_client = None

# create the default dataset folder
# enforce the db constrain for dataset name uniqueness
# try:
# 	neo4j_connection.session().run("""
# 	    CREATE CONSTRAINT 
# 	    ON (n:Dataset)
# 	    ASSERT n.name IS UNIQUE
# 	""")
# except:
# 	pass