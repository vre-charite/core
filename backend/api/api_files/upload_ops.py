from config import ConfigClass
from .proxy import BaseProxyResource


class CheckUploadStatusRestful(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "uploader"}
    url = ConfigClass.DATA_SERVICE + "upload/containers/{dataset_id}/status" 


class PreUploadRestful(BaseProxyResource):
    # deprecated in Dataops_gr
    methods = ["POST"]
    required_roles = {"POST": "uploader"}
    url = ConfigClass.DATA_SERVICE + "upload/containers/{dataset_id}/pre" 
    content_type = "application/x-www-form-urlencoded"


class ChunkUploadSuccessRestful(BaseProxyResource):
    # deprecated in dataops_gr
    methods = ["POST"]
    required_roles = {"POST": "uploader"}
    url = ConfigClass.DATA_SERVICE + "upload/containers/{dataset_id}/on-success" 
    content_type = "application/x-www-form-urlencoded"


class CheckUploadStateRestful(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "uploader"}
    url = ConfigClass.DATA_SERVICE + "upload/containers/{dataset_id}/upload-state"
