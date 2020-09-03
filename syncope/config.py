# flask configs
import os
class ConfigClass(object):
    SYNCOPE_BASE_URL = 'http://10.3.9.240:8080/syncope/rest'
    TEMP_BASE = os.path.expanduser("~/tmp/flask_uploads/")