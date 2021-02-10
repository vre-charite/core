# flask configs
import os


class ConfigClass(object):
    # flask
    PROPAGATE_EXCEPTIONS = True

    TEMP_BASE = os.path.expanduser("~/tmp/flask_uploads/")
    NFS_BASE = "/data/vre-storage"

    # the packaged modules
    # api_modules = ["dataset"]
    api_modules = ["api"]

    TIMEZONE = "CET"

    USERNAME_REGEX = "^[a-z\d]{6,20}$"

    # Micro services on server(used for testing)
    NEO4J_SERVICE = "http://neo4j.utility:5062/v1/neo4j/"
    FILEINFO_SERVICE = "http://entityinfo.utility:5066/v1/"
    DATA_SERVICE = "http://dataops-gr.greenroom:5063/v1/"
    DATA_SERVICE_V2 = "http://dataops-gr.greenroom:5063/v2/"
    AUTH_SERVICE = "http://auth.utility:5061/v1/"
    CATALOGUING_SERVICE = "http://cataloguing:5064/v1/"
    DATA_UTILITY_SERVICE = "http://dataops-ut.utility:5063/v1/"

    # NEO4J_SERVICE = "http://10.3.7.216:5062/v1/neo4j/"
    # NEO4j_SERVICE_V2 = "http://10.3.7.216:5062/v2/neo4j/"
    # DATA_SERVICE = "http://10.3.7.234:5063/v1/"
    # DATA_SERVICE_V2 = "http://10.3.7.234:5063/v2/"
    # AUTH_SERVICE = "http://10.3.7.217:5061/v1/"
    # CATALOGUING_SERVICE = "http://cataloguing:5064/v1/"
    # DATA_UTILITY_SERVICE = "http://10.3.7.239:5063/v1/"


    # KONG API Gateway
    KONG_BASE = "http://kong-proxy.utility:8000/vre/"

    # JWT
    JWT_AUTH_URL_RULE = None

    # Email Notify Service
    EMAIL_SERVICE = "http://notification.utility:5065/v1/email"
    # EMAIL_SERVICE = "http://10.3.9.240:5065/v1/email"
    EMAIL_DEFAULT_NOTIFIER = "notification@vre"
    EMAIL_ADMIN_CONNECTION = "hliu@indocresearch.org"

    # User Invitation
    env = os.environ.get('env')
    if env == 'charite':
        # Config Email Service in charite
        EMAIL_DEFAULT_NOTIFIER = "vre-support@charite.de"
        EMAIL_ADMIN_CONNECTION = "vre-support@charite.de"

        INVITATION_URL_PREFIX = "https://vre.charite.de/vre/self-registration"
        INVITATION_EXPIRY_DAYS = 14
        INVITATION_URL_LOGIN = 'https://vre.charite.de/vre/'
    elif env == "staging":
        INVITATION_URL_PREFIX = "https://vre-staging.indocresearch.org/vre/self-registration"
        INVITATION_EXPIRY_DAYS = 14
        INVITATION_URL_LOGIN = 'https://vre-staging.indocresearch.org/vre/'
    else:
        INVITATION_URL_PREFIX = "http://10.3.7.220/vre/self-registration"
        INVITATION_EXPIRY_DAYS = 14
        INVITATION_URL_LOGIN = 'http://10.3.7.220/vre/'

    # BFF RDS
    RDS_HOST = "opsdb.utility"
    # RDS_HOST = '10.3.7.215'
    RDS_PORT = "5432"
    RDS_DBNAME = "INDOC_VRE"
    RDS_USER = "postgres"
    RDS_PWD = "postgres"
    if env == 'charite':
        RDS_USER = "indoc_vre"
        RDS_PWD = "opsdb-jrjmfa9svvC"
    RDS_SCHEMA_DEFAULT = "indoc_vre"

    SQLALCHEMY_DATABASE_URI = f"postgres://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"

    # Error and Access Log
    LOG_FILE = 'application.log'
    ICON_SIZE_LIMIT = 500*1000
    GROUP_ADMIN = 'admin'
    
    

