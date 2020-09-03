from flask import request
from flask_restful import Resource
import requests

from config import ConfigClass


class admin_op_on_users(Resource):
    # create a new user
    def post(self):
        return {'result': 'success'}, 200