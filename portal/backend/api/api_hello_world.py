from flask_restx import Api, Resource, fields
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from api import module_api
from services.helloworld_services.helloworld_manager import SrvHelloWolrd
from services.logger_services.logger_factory_service import SrvLoggerFactory
from resources.swagger_modules import hello_indoc_return_example

api_ns_hello = module_api.namespace('Hello VRE', description='For backend services down/on testing', path ='/v1')

## for backend services down/on testing
class APIHelloWorld(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_hello.add_resource(self.Restful, '/helloworld/') ## for browser
        api_ns_hello.add_resource(self.Restful, '/helloworld') ## for curl/postman
    class Restful(Resource):
        @api_ns_hello.response(200, hello_indoc_return_example)
        def get(self):
            '''
            Hello Wolrd PlaceHolder
            '''
            ## init logger
            _logger = SrvLoggerFactory('api_hello_world').get_logger()
            _logger.info("Request Gotten")
            ## init response
            my_res = APIResponse()
            ## access content from helloworld manager service
            my_srv = SrvHelloWolrd()
            hello_content = my_srv.get_content()
            my_res.set_code(EAPIResponseCode.success)
            my_res.set_result(hello_content)
            return my_res.to_dict, my_res.code
