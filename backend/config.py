import os
import requests
from requests.models import HTTPError
from pydantic import BaseSettings, Extra
from typing import Dict, Set, List, Any
from functools import lru_cache

SRV_NAMESPACE = os.environ.get("APP_NAME", "core")
CONFIG_CENTER_ENABLED = os.environ.get("CONFIG_CENTER_ENABLED", "false")
CONFIG_CENTER_BASE_URL = os.environ.get("CONFIG_CENTER_BASE_URL", "NOT_SET")

def load_vault_settings(settings: BaseSettings) -> Dict[str, Any]:
    if CONFIG_CENTER_ENABLED == "false":
        return {}
    else:
        return vault_factory(CONFIG_CENTER_BASE_URL)

def vault_factory(config_center) -> dict:
    url = f"{config_center}/v1/utility/config/{SRV_NAMESPACE}"
    config_center_respon = requests.get(url)
    if config_center_respon.status_code != 200:
        raise HTTPError(config_center_respon.text)
    return config_center_respon.json()['result']


class Settings(BaseSettings):
    port: int = 5063
    host: str = "127.0.0.1"
    env: str = ""
    namespace: str = ""
    CONFIG_CENTER_BASE_URL: str = ""
    
    # disk mounts
    NFS_ROOT_PATH: str = "./"
    VRE_ROOT_PATH: str = "/vre-data"
    ROOT_PATH: str = {
        "vre": "/vre-data"
    }.get(os.environ.get('namespace'), "/data/vre-storage")

    # the packaged modules
    # api_modules = ["dataset"]
    api_modules: List[str] = ["api"]

    TIMEZONE: str = "CET"

    USERNAME_REGEX: str = "^[a-z\d]{6,20}$"
    PROJECT_CODE_REGEX: str = "^[a-z][a-z0-9]{0,31}$"
    PROJECT_NAME_REGEX: str = "^.{1,100}$"

    # Services

    ENTITYINFO_SERVICE: str

    DATA_OPS_GR: str
    CATALOGUING_SERVICE: str
    DATA_OPS_UTIL: str
    NEO4J_SERVICE: str
    AUTH_SERVICE: str
    UTILITY_SERVICE: str
    PROVENANCE_SERVICE: str
    NOTIFY_SERVICE: str
    EMAIL_SERVICE: str
    DATA_UPLOAD_SERVICE_VRE: str
    DATA_UPLOAD_SERVICE_GREENROOM: str
    DATASET_SERVICE: str
    DOWNLOAD_SERVICE_VRE: str
    DOWNLOAD_SERVICE_GR: str
    APPROVAL_SERVICE: str

    # KONG API Gateway
    KONG_BASE: str
    # Knowledge Graph
    KG_SERVICE: str
    KG_SERVICE_STAGE: str = "http://kg.utility:5081"


    # JWT
    JWT_AUTH_URL_RULE: None = None

    # Email addresses
    EMAIL_SUPPORT: str = "jzhang@indocresearch.org"
    EMAIL_ADMIN: str = "cchen@indocresearch.org"
    EMAIL_HELPDESK: str = "helpdesk@vre"
    EMAIL_SUPPORT_PROD = "vre-support@charite.de"
    EMAIL_ADMIN_PROD = "vre-admin@charite.de"
    EMAIL_HELPDESK_PROD = "helpdesk@charite.de"

    # LDAP configs
    LDAP_URL: str
    LDAP_ADMIN_DN: str
    LDAP_ADMIN_SECRET: str
    LDAP_OU: str
    LDAP_DC1: str
    LDAP_DC2: str
    LDAP_objectclass: str

    # Domain
    VRE_DOMAIN: str

    # Invitation
    INVITATION_URL_LOGIN: str

    # Resource request
    RESOURCE_REQUEST_ADMIN: str = "jzhang7"
    RESOURCE_REQUEST_ADMIN_PROD: str = "admin"

    # BFF RDS
    RDS_HOST: str
    RDS_PORT: str
    RDS_DBNAME: str
    RDS_USER: str
    RDS_PWD: str
    RDS_SCHEMA_DEFAULT: str
    ICON_SIZE_LIMIT: int = 500*1000

    GROUP_ADMIN: str = 'admin'
    RESOURCES: List[str] = ["SuperSet", "Guacamole"]
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        extra = Extra.allow

        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            file_secret_settings,
        ):
            return (
                load_vault_settings,
                env_settings,
                init_settings,
                file_secret_settings,
            )
    

@lru_cache(1)
def get_settings():
    settings =  Settings()
    return settings

class ConfigClass(object):
    settings = get_settings()

    version = "0.1.0"
    env = settings.env
    disk_namespace = settings.namespace
    CONFIG_CENTER = settings.CONFIG_CENTER_BASE_URL
    
    # disk mounts
    NFS_ROOT_PATH = settings.NFS_ROOT_PATH
    VRE_ROOT_PATH = settings.VRE_ROOT_PATH
    ROOT_PATH = settings.ROOT_PATH

    # the packaged modules
    # api_modules = ["dataset"]
    api_modules = settings.api_modules

    TIMEZONE = settings.TIMEZONE

    USERNAME_REGEX = settings.USERNAME_REGEX
    PROJECT_CODE_REGEX = settings.PROJECT_CODE_REGEX
    PROJECT_NAME_REGEX = settings.PROJECT_NAME_REGEX

    # Services

    ENTITYINFO_SERVICE = settings.ENTITYINFO_SERVICE + "/v1/"
    ENTITYINFO_SERVICE_V2 = settings.ENTITYINFO_SERVICE + "/v2/"

    APPROVAL_SERVICE = settings.APPROVAL_SERVICE + "/v1/"
    DATA_SERVICE = settings.DATA_OPS_GR + "/v1/"
    DATA_SERVICE_V2 = settings.DATA_OPS_GR+ "/v2/"
    CATALOGUING_SERVICE = settings.CATALOGUING_SERVICE + "v1/"
    CATALOGUING_SERVICE_v2 = settings.CATALOGUING_SERVICE + "/v2/"
    DATA_UTILITY_SERVICE = settings.DATA_OPS_UTIL + "/v1/"
    DATA_UTILITY_SERVICE_v2 = settings.DATA_OPS_UTIL + "/v2/"
    NEO4J_SERVICE = settings.NEO4J_SERVICE + "/v1/neo4j/"
    NEO4J_SERVICE_V2 = settings.NEO4J_SERVICE + "/v2/neo4j/"
    AUTH_SERVICE = settings.AUTH_SERVICE + "/v1/"
    UTILITY_SERVICE = settings.UTILITY_SERVICE
    PROVENANCE_SERVICE = settings.PROVENANCE_SERVICE + "/v1/"
    NOTIFY_SERVICE = settings.NOTIFY_SERVICE
    EMAIL_SERVICE = settings.EMAIL_SERVICE + "/v1/email"
    DATA_UPLOAD_SERVICE_VRE = settings.DATA_UPLOAD_SERVICE_VRE + "/v1"
    DATA_UPLOAD_SERVICE_GREENROOM = settings.DATA_UPLOAD_SERVICE_GREENROOM + "/v1"
    DATASET_SERVICE = settings.DATASET_SERVICE + "/v1/"
    DOWNLOAD_SERVICE_VRE_V2 = settings.DOWNLOAD_SERVICE_VRE + "/v2/"
    DOWNLOAD_SERVICE_GR_V2 = settings.DOWNLOAD_SERVICE_GR + "/v2/"

    # KONG API Gateway
    KONG_BASE = settings.KONG_BASE + "/vre/"
    # Knowledge Graph
    KG_SERVICE = settings.KG_SERVICE + "/v1/" if env == "test" else settings.KG_SERVICE_STAGE + "/v1/"


    # JWT
    JWT_AUTH_URL_RULE = settings.JWT_AUTH_URL_RULE

    # Email addresses
    EMAIL_SUPPORT = settings.EMAIL_SUPPORT
    EMAIL_ADMIN = settings.EMAIL_ADMIN
    EMAIL_HELPDESK = settings.EMAIL_HELPDESK
    if env == 'charite':
        EMAIL_SUPPORT = settings.EMAIL_SUPPORT_PROD
        EMAIL_ADMIN = settings.EMAIL_ADMIN_PROD
        EMAIL_HELPDESK = settings.EMAIL_HELPDESK_PROD

    # LDAP configs
    LDAP_URL = settings.LDAP_URL
    LDAP_ADMIN_DN = settings.LDAP_ADMIN_DN
    LDAP_ADMIN_SECRET = settings.LDAP_ADMIN_SECRET
    LDAP_OU = settings.LDAP_OU
    LDAP_DC1 = settings.LDAP_DC1
    LDAP_DC2 = settings.LDAP_DC2
    LDAP_objectclass = settings.LDAP_objectclass
    # Domain
    VRE_DOMAIN = settings.VRE_DOMAIN

    # Invitation
    INVITATION_URL_LOGIN = settings.INVITATION_URL_LOGIN

    # Resource request
    RESOURCE_REQUEST_ADMIN = settings.RESOURCE_REQUEST_ADMIN
    if env == 'charite' or env == 'staging':
        RESOURCE_REQUEST_ADMIN = settings.RESOURCE_REQUEST_ADMIN_PROD

    # BFF RDS
    RDS_HOST = settings.RDS_HOST
    RDS_PORT = settings.RDS_PORT
    RDS_DBNAME = settings.RDS_DBNAME
    RDS_USER = settings.RDS_USER
    RDS_PWD = settings.RDS_PWD
    RDS_SCHEMA_DEFAULT = settings.RDS_SCHEMA_DEFAULT
    OPS_DB_URI = f"postgresql://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"
    SQLALCHEMY_DATABASE_URI = f"postgresql://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"
    ICON_SIZE_LIMIT = settings.ICON_SIZE_LIMIT

    GROUP_ADMIN = settings.GROUP_ADMIN
    RESOURCES = settings.RESOURCES
    
