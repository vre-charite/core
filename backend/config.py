import os
import requests
from requests.models import HTTPError
# os.environ['env'] = 'test'
srv_namespace = "core"
CONFIG_CENTER = "http://10.3.7.222:5062" \
    if os.environ.get('env', "test") == "test" \
    else "http://common.utility:5062"


def vault_factory() -> dict:
    url = CONFIG_CENTER + \
        "/v1/utility/config/{}".format(srv_namespace)
    config_center_respon = requests.get(url)
    if config_center_respon.status_code != 200:
        raise HTTPError(config_center_respon.text)
    return config_center_respon.json()['result']


class ConfigClass(object):
    vault = vault_factory()
    CONFIG_CENTER = CONFIG_CENTER
    env = vault['ENV']
    disk_namespace = os.environ.get('namespace')
    version = "0.1.0"
    # disk mounts
    NFS_ROOT_PATH = "./"
    VRE_ROOT_PATH = "/vre-data"
    ROOT_PATH = {
        "vre": "/vre-data"
    }.get(os.environ.get('namespace'), "/data/vre-storage")

    # the packaged modules
    # api_modules = ["dataset"]
    api_modules = ["api"]

    TIMEZONE = "CET"

    USERNAME_REGEX = "^[a-z\d]{6,20}$"
    PROJECT_CODE_REGEX = "^[a-z][a-z0-9]{0,31}$"
    PROJECT_NAME_REGEX = "^.{1,100}$"

    # Services

    ENTITYINFO_SERVICE = vault["ENTITYINFO_SERVICE"] + "/v1/"
    ENTITYINFO_SERVICE_V2 = vault["ENTITYINFO_SERVICE"] + "/v2/"
    # EMAIL_SERVICE = "http://notification.utility:5065/v1/email"
    # DATASET_SERVICE = "http://10.3.7.209:5081/v1/"

    DATA_SERVICE = vault["DATA_OPS_GR"] + "/v1/"
    DATA_SERVICE_V2 = vault["DATA_OPS_GR"] + "/v2/"
    CATALOGUING_SERVICE = vault["CATALOGUING_SERVICE"] + "v1/"
    CATALOGUING_SERVICE_v2 = vault["CATALOGUING_SERVICE"] + "/v2/"
    DATA_UTILITY_SERVICE = vault["DATA_OPS_UTIL"] + "/v1/"
    DATA_UTILITY_SERVICE_v2 = vault["DATA_OPS_UTIL"] + "/v2/"
    NEO4J_SERVICE = vault["NEO4J_SERVICE"] + "/v1/neo4j/"
    NEO4J_SERVICE_V2 = vault["NEO4J_SERVICE"] + "/v2/neo4j/"
    AUTH_SERVICE = vault["AUTH_SERVICE"] + "/v1/"
    UTILITY_SERVICE = vault["UTILITY_SERVICE"]
    PROVENANCE_SERVICE = vault["PROVENANCE_SERVICE"]+"/v1/"
    NOTIFY_SERVICE = vault["NOTIFY_SERVICE"]
    EMAIL_SERVICE = vault["EMAIL_SERVICE"]+"/v1/email"
    DATA_UPLOAD_SERVICE_VRE = vault["DATA_UPLOAD_SERVICE_VRE"] + "/v1"
    DATA_UPLOAD_SERVICE_GREENROOM = vault["DATA_UPLOAD_SERVICE_GREENROOM"] + "/v1"
    DATASET_SERVICE = vault["DATASET_SERVICE"]+"/v1/"
    DOWNLOAD_SERVICE_VRE_V2 = vault["DOWNLOAD_SERVICE_VRE"]+"/v2/"
    DOWNLOAD_SERVICE_GR_V2 = vault["DOWNLOAD_SERVICE_GR"]+"/v2/"
    # DOWNLOAD_SERVICE_GR = "http://10.3.7.236:5077/v2"
    # DOWNLOAD_SERVICE_VRE = "http://10.3.7.235:5077/v2"
    # KONG API Gateway
    KONG_BASE = vault["KONG_BASE"]+"/vre/"
    # Knowledge Graph
    KG_SERVICE = "http://10.3.7.102:5081/v1/" if os.environ.get('env', "test") == "test" else "http://kg.utility:5081/v1/"


    # JWT
    JWT_AUTH_URL_RULE = None

    # Email addresses
    EMAIL_SUPPORT = "jzhang@indocresearch.org"
    EMAIL_ADMIN = "cchen@indocresearch.org"
    EMAIL_HELPDESK = "helpdesk@vre"
    if env == 'charite':
        EMAIL_SUPPORT = "vre-support@charite.de"
        EMAIL_ADMIN = "vre-admin@charite.de"
        EMAIL_HELPDESK = "helpdesk@charite.de"

    # LDAP configs
    LDAP_URL = vault["LDAP_URL"]
    LDAP_ADMIN_DN = vault["LDAP_ADMIN_DN"]
    LDAP_ADMIN_SECRET = vault["LDAP_ADMIN_SECRET"]
    LDAP_OU = vault["LDAP_OU"]
    LDAP_DC1 = vault["LDAP_DC1"]
    LDAP_DC2 = vault["LDAP_DC2"]
    LDAP_objectclass = vault["LDAP_objectclass"]

    # Domain
    VRE_DOMAIN = vault["VRE_DOMAIN"]

    # Invitation
    INVITATION_URL_LOGIN = vault["INVITATION_URL_LOGIN"]

    # Resource request
    RESOURCE_REQUEST_ADMIN = "jzhang7"
    if env == 'charite' or env == 'staging':
        RESOURCE_REQUEST_ADMIN = "admin"

    # BFF RDS
    RDS_HOST = vault['RDS_HOST']
    RDS_PORT = vault['RDS_PORT']
    RDS_DBNAME = vault['RDS_DBNAME']
    RDS_USER = vault['RDS_USER']
    RDS_PWD = vault['RDS_PWD']
    RDS_SCHEMA_DEFAULT = vault['RDS_SCHEMA_DEFAULT']
    OPS_DB_URI = f"postgresql://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"
    SQLALCHEMY_DATABASE_URI = f"postgresql://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"
    ICON_SIZE_LIMIT = 500*1000

    GROUP_ADMIN = 'admin'
    RESOURCES = ["SuperSet", "Guacamole"]



