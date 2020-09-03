# since the RDS need password and username from ssm parameter store
# so I will need to generate the connect string
import boto3
import os
# from resources.ssm_parameter_store import get_connection_parameters

# ssm = boto3.client("ssm")


class ConfigClass(object):

    """ Flask application config shared across environments"""

    # # # Flask settings by "python -c 'import os; print(os.urandom(16))'""
    SECRET_KEY = b"t+\x96\x18\x8a\xc8\xf4G)-\xa3n\xf8\xb1|e"
    PROPAGATE_EXCEPTIONS = True

    # # Flask-SQLAlchemy settings
    # # SQLALCHEMY_DATABASE_URI = 'postgresql://puser:puser@localhost:5432/muhc'    # File-based SQL database

    # # rds_parameters = get_connection_parameters(ssm, "rds")
    # # SQLALCHEMY_DATABASE_URI = rds_parameters["/rds/muhc/url"]
    # SQLALCHEMY_TRACK_MODIFICATIONS = False  # Avoids SQLAlchemy warning
    # SECURITY_PASSWORD_SALT = b".t\x92\xa5laX\x8c\xc3[\x11\xcb\xbc\x13\x82\xdb"
    # SQLALCHEMY_ENGINE_OPTIONS = {"pool_size": 20}

    # # flask-jwt
    # JWT_AUTH_URL_RULE = None
    # # default first admin
    # ADMIN_USER_NAME = 'testusername'

    # add the hadoop config
    HADOOP_NAMENODE = 'http://localhost:9870'
    ROOT_PATH = '/user/hive/warehouse'
    HADOOP_USER = 'color'

