from flask import request
from flask_restful import Resource
import requests

from config import ConfigClass


class user_auth(Resource):
    # user login
    # return entitlements and privileges
    def post(self):
        try:
            # get username and password
            post_data = request.get_json()
            
            username = post_data.get('username', None)
            password = post_data.get('password', None)
            
            print(username);print(password)
            if not username or not password:
                return {'result': 'missing username or password'}, 400

            # login
            url = ConfigClass.SYNCOPE_BASE_URL + '/accessTokens/login'
            res = requests.post(
                url=url,
                auth=(username, password)
            )
            res_headers = res.headers
            print(res_headers)

            try:
                access_token = res_headers['X-Syncope-Token']
            except KeyError:
                return {'result': 'incorrect username or password'}, 403

            # get user info
            url = ConfigClass.SYNCOPE_BASE_URL + '/users/self'
            headers = {
                'Authorization': 'Bearer ' + access_token
            }
            res = requests.get(
                url=url,
                headers=headers
            )
            res_data = res.json()

            try:
                username = res_data['username']
                roles = res_data['roles']
                privileges = res_data['privileges']
                memberships = res_data['memberships']
            except KeyError:
                return {'result': 'user does not exist'}, 403

            # build user object
            ret = {
                'username': username,
                'access_token': access_token,
                'roles': roles,
                'privileges': privileges,
                'memberships': memberships
            }


        except Exception as e:
            return {'result': str(e)}, 500

        return {'result': ret}, 200