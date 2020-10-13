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

    # # Micro services on server(used for testing)
    NEO4J_SERVICE = "http://neo4j.utility:5062/v1/neo4j/"
    DATA_SERVICE = "http://dataops-gr.greenroom:5063/v1/"
    AUTH_SERVICE = "http://auth.utility:5061/v1/"

    # NEO4J_SERVICE = "http://10.3.7.216:5062/v1/neo4j/"
    # DATA_SERVICE = "http://127.0.0.1:5001/v1/"
    # AUTH_SERVICE = "http://10.3.7.217:5061/v1/"


    # KONG API Gateway
    KONG_BASE = "http://kong-proxy.utility:8000/vre/"

    # JWT
    JWT_AUTH_URL_RULE = None

    # Email Notify Service
    EMAIL_SERVICE = "http://notification.utility:5065/v1/email"
    # EMAIL_SERVICE = "http://10.3.9.240:5065/v1/email"
    EMAIL_DEFAULT_NOTIFIER = "notification@vre"
    EMAIL_ADMIN_CONNECTION = "zma@indocresearch.org"

    # User Invitation
    env = os.environ.get('env')
    if env is None or env == 'charite':
        # Config Email Service in charite
        EMAIL_DEFAULT_NOTIFIER = "vre-support@charite.de"
        EMAIL_ADMIN_CONNECTION = "vre-support@charite.de"

        INVITATION_URL_PREFIX = "http://10.32.42.226/vre/self-registration"
        INVITATION_EXPIRY_DAYS = 14
        INVITATION_URL_LOGIN = 'http://10.32.42.226/vre/'
    elif env == "staging":
        INVITATION_URL_PREFIX = "https://nx.indocresearch.org/vre/self-registration"
        INVITATION_EXPIRY_DAYS = 14
        INVITATION_URL_LOGIN = 'https://nx.indocresearch.org/vre/'
    else:
        INVITATION_URL_PREFIX = "http://10.3.7.220/vre/self-registration"
        INVITATION_EXPIRY_DAYS = 14
        INVITATION_URL_LOGIN = 'http://10.3.7.220/vre/'

    # BFF RDS
    RDS_HOST = "opsdb.utility"
    RDS_PORT = "5432"
    RDS_DBNAME = "INDOC_VRE"
    RDS_USER = "postgres"
    RDS_PWD = "postgres"
    if env is None or env == 'charite':
        RDS_USER = "indoc_vre"
        RDS_PWD = "opsdb-jrjmfa9svvC"
    RDS_SCHEMA_DEFAULT = "indoc_vre"

    # Error and Access Log
    LOG_FILE = 'application.log'
