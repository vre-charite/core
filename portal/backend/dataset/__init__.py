from flask_restx import Api, Resource, fields
from config import ConfigClass

from api import module_api
datasets_entity_ns = module_api.namespace('Portal Dataset Actions', description='Operation on datasets', path ='/v1/datasets')
users_entity_ns = module_api.namespace('Portal User Actions', description='Operation on users', path ='/v1/users')
