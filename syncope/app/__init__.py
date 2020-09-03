from flask import Flask
from flask_cors import CORS
from config import ConfigClass


def create_app(extra_config_settings={}):
    app = Flask(__name__)
    app.config.from_object(__name__+'.ConfigClass')

    CORS(app, origins="*",
         allow_headers=["Content-Type", "Authorization",
                        "Access-Control-Allow-Credentials"],
         supports_credentials=True, intercept_exceptions=False
         )

    from users import users_api
    users_api.init_app(app)
    from file_ops import file_api
    file_api.init_app(app)

    return app
