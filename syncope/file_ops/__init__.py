from flask_restful import Api
file_api = Api()


# user operations
from file_ops.file_operation import *

file_api.add_resource(study_files, '/studies/<study_id>/files')
