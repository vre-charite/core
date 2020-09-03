from flask_restful import Api
users_api = Api()


# user operations
from users.user_ops import *

users_api.add_resource(user_auth, '/users/auth')


# admin-only operations
from users.admin_ops import *

users_api.add_resource(admin_op_on_users, '/admin/users')