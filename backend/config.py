# flask configs
import os

# os.environ['env'] = "test"
class ConfigClass(object):
    env = os.environ.get('env')

    # the packaged modules
    # api_modules = ["dataset"]
    api_modules = ["api"]

    TIMEZONE = "CET"

    USERNAME_REGEX = "^[a-z\d]{6,20}$"
    PROJECT_CODE_REGEX = "^[a-z][a-z0-9]{1,32}$"

    # Services
    ENTITYINFO_SERVICE = "http://entityinfo.utility:5066/v1/"
    ENTITYINFO_SERVICE_V2 = "http://entityinfo.utility:5066/v2/"
    DATA_SERVICE = "http://dataops-gr.greenroom:5063/v1/"
    DATA_SERVICE_V2 = "http://dataops-gr.greenroom:5063/v2/"
    CATALOGUING_SERVICE = "http://cataloguing:5064/v1/"
    CATALOGUING_SERVICE_v2 = "http://cataloguing:5064/v2/"
    DATA_UTILITY_SERVICE = "http://dataops-ut.utility:5063/v1/"
    NEO4J_SERVICE_V2 = "http://neo4j.utility:5062/v2/neo4j/"
    NEO4J_SERVICE = "http://neo4j.utility:5062/v1/neo4j/"
    AUTH_SERVICE = "http://auth.utility:5061/v1/"
    UTILITY_SERVICE = "http://common.utility:5062"
    PROVENANCE_SERVICE = "http://provenance.utility:5077/v1/"
    NOTIFY_SERVICE = "http://notification.utility:5065"
    EMAIL_SERVICE = "http://notification.utility:5065/v1/email"
    DATA_UPLOAD_SERVICE_VRE = "http://upload.vre:5079/v1"
    DATA_UPLOAD_SERVICE_GREENROOM = "http://upload.greenroom:5079/v1"
    
    if env == "test":
        AUTH_SERVICE = "http://10.3.7.217:5061/v1/"
        NEO4J_SERVICE = "http://10.3.7.216:5062/v1/neo4j/"
        NEO4J_SERVICE_V2 = "http://10.3.7.216:5062/v2/neo4j/"
        UTILITY_SERVICE = "http://10.3.7.222:5062"
        ENTITYINFO_SERVICE = "http://10.3.7.228:5066/v1/"
        ENTITYINFO_SERVICE_V2 = "http://10.3.7.228:5066/v2/"
        DATA_SERVICE = "http://10.3.7.234:5063/v1/"
        DATA_SERVICE_V2 = "http://10.3.7.234:5063/v2/"
        CATALOGUING_SERVICE = "http://cataloguing:5064/v1/"
        CATALOGUING_SERVICE_v2 = "http://cataloguing:5064/v2/"
        DATA_UTILITY_SERVICE = "http://10.3.7.239:5063/v1/"
        PROVENANCE_SERVICE = "http://10.3.7.202:5077/v1/"
        DATA_UPLOAD_SERVICE_VRE = "http://10.3.7.200:5079/v1"
        DATA_UPLOAD_SERVICE_GREENROOM = "http://10.3.7.201:5079/v1"

    # KONG API Gateway
    KONG_BASE = "http://kong-proxy.utility:8000/vre/"

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
    LDAP_URL = "ldap://10.3.50.101:389/"
    LDAP_ADMIN_DN = "svc-vre-ad@indoc.local"
    LDAP_ADMIN_SECRET = "indoc101!"
    LDAP_OU = "VRE-DEV"
    LDAP_USER_OU = "VRE-USER-DEV"
    LDAP_DC1 = "indoc"
    LDAP_DC2 = "local"
    LDAP_objectclass = "group"
    if env == 'staging':
        LDAP_OU = "VRE-STG"
        LDAP_URL = "ldap://10.3.50.102:389/"
        LDAP_USER_OU = "VRE-USER-STG"
    elif env == 'charite':
        LDAP_OU = "VRE,OU=Charite-Zentrale-Anwendungen"
        LDAP_URL = "ldap://charite.de:389/"
        LDAP_ADMIN_DN = "svc-vre-ad@CHARITE"
        LDAP_ADMIN_SECRET = "~*<whA\\5PCnk%X<k"
        LDAP_DC1 = "charite"
        LDAP_DC2 = "de"

    # Domain
    VRE_DOMAIN = "http://10.3.7.220"
    if env == 'charite':
        VRE_DOMAIN = "https://vre.charite.de"
    elif env == 'staging':
        VRE_DOMAIN = "https://vre-staging.indocresearch.org"

    # Invitation
    INVITATION_URL_LOGIN = 'http://10.3.7.220/vre/'
    if env == 'charite':
        INVITATION_URL_LOGIN = 'https://vre.charite.de/vre/'
    elif env == "staging":
        INVITATION_URL_LOGIN = 'https://vre-staging.indocresearch.org/vre/'

    # Resource request
    RESOURCE_REQUEST_ADMIN = "jzhang7"
    if env == 'charite' or env == 'staging':
        RESOURCE_REQUEST_ADMIN = "admin"

    # BFF RDS
    RDS_HOST = "opsdb.utility"
    RDS_PORT = "5432"
    RDS_DBNAME = "INDOC_VRE"
    RDS_USER = "postgres"
    RDS_PWD = "postgres"
    RDS_SCHEMA_DEFAULT = "indoc_vre"
    if env == "test":
        RDS_HOST = '10.3.7.215'
    if env == 'charite':
        RDS_USER = "indoc_vre"
        RDS_PWD = os.environ.get('RDS_PWD')
    SQLALCHEMY_DATABASE_URI = f"postgres://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"

    ICON_SIZE_LIMIT = 500*1000

    GROUP_ADMIN = 'admin'
    RESOURCES = ["SuperSet", "Guacamole"]


