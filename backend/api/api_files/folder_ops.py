from .proxy import BaseProxyResource
from config import ConfigClass


class Folders(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "folders"
