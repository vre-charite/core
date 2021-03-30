from .proxy import BaseProxyResource
from config import ConfigClass


class FoldersEntity(BaseProxyResource):
    methods = ["GET", "POST"]
    required_roles = {"GET": "member", "POST": "member"}
    url = ConfigClass.FILEINFO_HOST + "/v1/folders"

class FolderEntity(BaseProxyResource):
    methods = ["GET", "POST"]
    required_roles = {"GET": "member", "POST": "member"}
    url = ConfigClass.FILEINFO_HOST + "/v1/folder/{geid}"
