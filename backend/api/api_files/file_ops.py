from config import ConfigClass
from .proxy import BaseProxyResource


class FilePreDownload(BaseProxyResource):
    methods = ["GET", "POST"]
    required_roles = {"GET": "member", "POST": "uploader"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/file"


class FileDownloadLog(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "files/download/log"


class FileInfo(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "uploader"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/meta"


class ProcessedFile(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "files/processed"


class TotalFileCount(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "admin"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/count/total"


class DailyFileCount(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "uploader"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/count/daily"


class FileExistCheck(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/exist"

class FileTransfer(BaseProxyResource):
    methods = ["POST"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "file-transfer/queue"

class FileActionLogs(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "file/actions/logs"
