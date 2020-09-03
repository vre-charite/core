from flask_restful import Api
studies_api = Api()

########################################################################

from study.study_operation import *

# studies_api.add_resource(list_study, '/studies')
studies_api.add_resource(study_operation, '/studies')