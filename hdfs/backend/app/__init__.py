from flask import Flask, jsonify, request, render_template, make_response, send_from_directory
from flask.sessions import SecureCookieSessionInterface

from flask_jwt import JWT, jwt_required, current_identity, JWTError
# from flask_executor import Executor
# from werkzeug.security import safe_str_cmp

# import boto3
# from botocore.errorfactory import NotAuthorizedException

import datetime
import os
from passlib.hash import pbkdf2_sha256
from flask_cors import CORS, cross_origin
from config import ConfigClass

from sqlalchemy import event, DDL
from flask_sqlalchemy import SQLAlchemy

from hdfs import client

hdfs_client = client.InsecureClient(
    url=ConfigClass.HADOOP_NAMENODE, 
    user=ConfigClass.HADOOP_USER,
    root=ConfigClass.ROOT_PATH
)

# Create Flask app load app.config
def create_app(extra_config_settings={}):
    # app = Flask(__name__)
    app = Flask(__name__, static_folder="../build/static", template_folder="../build")
    app.config.from_object(__name__+'.ConfigClass')

    # db.init_app(app)
    CORS(app, origins="*",
        allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        supports_credentials=True, intercept_exceptions=False
    )
    # jwt = JWT(app)


    @app.route('/', methods=['GET'])
    def everyone_welcome():
        return render_template('./index.html'), 200

    # @app.route('/icons/<path:filename>')
    # def custom_static(filename):
    #     return send_from_directory(ConfigClass.STUDY_ICON, filename)

    # hdfs_client = client.Client(url='http://localhost:9870')

    from study import studies_api
    studies_api.init_app(app)

    res = hdfs_client.list('.')
    print(res)

    try:    
        hdfs_client.list(ConfigClass.ROOT_PATH)
    except Exception as e:
        hdfs_client.makedirs(ConfigClass.ROOT_PATH)

    # hdfs_client.makedirs('test/')

    return app
