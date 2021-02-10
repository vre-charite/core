from flask_restx import Api, Resource, fields
from api.module_api import module_api


dataset_module = module_api.model("dataset", {
    "dataset_name": fields.String(description='Name of container'),
    "tags": fields.List(fields.String),
    "admin": fields.List(fields.String),
    "metadatas": fields.Raw,
    "type": fields.String(description='Usecase or Dataset')
})

user_module = module_api.model("user", {
    "name": fields.String,
    "password": fields.String,
    "email": fields.String,
    "first_name": fields.String,
    "last_name": fields.String,
})

new_user_module = module_api.model("new_user", {
    "username": fields.String,
    "password": fields.String,
    "email": fields.String,
    "first_name": fields.String,
    "last_name": fields.String,
    "project_id":fields.Integer,
    "role":fields.String,
    "portal_role":fields.String,
    "token":fields.String
})

## Invitation CRUD
create_invitation_request_model = module_api.model("create_invitation_form", {
    "email": fields.String,
    "projectId": fields.Integer,
    "role": fields.String,
})

create_invitation_return_example = '''
    {
        "code": 200,
        "error_msg": "",
        "page": 1,
        "total": 1,
        "num_of_pages": 1,
        "result": "[SUCCEED] Invitation Saved, Email Sent"
    }
    '''

read_invitation_request_model = module_api.model("read_invitation", {
})

read_invitation_return_example = '''
    {
        "code": 200,
        "error_msg": "",
        "page": 1,
        "total": 1,
        "num_of_pages": 1,
        "result": {
            "role": "testrole",
            "projectId": 1,
            "email": "zhengyangma9517@gmail.com"
        }
    }
    '''

update_invitation_request_model = module_api.model("update_invitation_form", {
})

deactivate_invitation_request_model = module_api.model("deactivate_invitation_form", {
})

## Contact Us
contact_us_model = module_api.model("contact_us_form", {
    "category": fields.String,
    "description": fields.String,
    "email": fields.String,
    "name": fields.String,
    "title": fields.String,
    "attachments": fields.List(fields.Raw()),

})

contact_us_return_example = '''
    {
        "code": 200,
        "error_msg": "",
        "result": "[SUCCEED] Contact Us Email Sent"
    }
    '''

## Hello World
hello_indoc_return_example = '''
    {
        "code": 200,
        "error_msg": "",
        "page": 1,
        "total": 1,
        "num_of_pages": 1,
        "result": {
            "Hello Prototype1.",
            "Hello Prototype2.",
            "Hello Prototype3."
        }
    }
    '''

dataset_sample_return = '''
    {
        "result": {
            "parent_relation": "PARENT",
            "admin": [
                "admin"
            ],
            "time_lastmodified": "2020-07-15T19:10:28",
            "_key2": "value2",
            "path": "Carsten Finke Generate/dataset-test-1",
            "id": 97,
            "time_created": "2020-07-15T19:10:28",
            "name": "dataset-test-1",
            "labels": [
                "Dataset"
            ],
            "_key1": "value1",
            "parent_id": 12,
            "tags": [
                "tag1",
                "tag2"
            ],
            "type": "Dataset"
        }
    }
    '''

datasets_sample_return = '''
    {   
        "code": 200,
        "error_msg": "",
        "num_of_pages": 14,
        "page": 0,
        "result": [   {   "admin": ["admin"],
                          "code": "autotest161",
                          "description": "auto test description",
                          "discoverable": True,
                          "id": 583,
                          "labels": ["Dataset"],
                          "name": "autotest161",
                          "path": "autotest161",
                          "roles": ["admin"],
                          "time_created": "2020-11-06T17:47:10",
                          "time_lastmodified": "2020-11-06T17:47:10",
                          "type": "Usecase"},
                      {   "admin": ["admin"],
                          "code": "autotest1693",
                          "description": "auto test description",
                          "discoverable": True,
                          "id": 603,
                          "labels": ["Dataset"],
                          "name": "autotest1693",
                          "path": "autotest1693",
                          "roles": ["admin"],
                          "time_created": "2020-11-06T20:46:06",
                          "time_lastmodified": "2020-11-06T20:46:06",
                          "type": "Usecase"}],
        "total": 27
    }
'''

users_sample_return = '''
    {
        result:[
                    {
                "time_created": "2020-07-03T18:23:15",
                "first_name": "admin",
                "name": "admin",
                "time_lastmodified": "2020-07-03T18:23:15",
                "last_name": "admin",
                "path": "users",
                "role": "admin",
                "labels": [
                    "User"
                ],
                "id": 46
            }
        ]
    }
    '''

user_sample_return = '''
    {
        result: {
            "time_created": "2020-07-03T18:23:15",
            "first_name": "admin",
            "name": "admin",
            "time_lastmodified": "2020-07-03T18:23:15",
            "last_name": "admin",
            "path": "users",
            "role": "admin",
            "labels": [
                "User"
            ],
            "id": 46
        }
    }
    '''

permission_return = '''
    {   
        'code': 200,
        'error_msg': '',
        'num_of_pages': 6,
        'page': 0,
        'result': {
             'permission': [{
                  'code': '0timetest',
                  'container_id': 642,
                  'container_name': 'ZeroClock',
                  'permission': 'admin'
              },
              {
                  'code': '0timetest',
                  'container_id': 642,
                  'container_name': 'ZeroClock',
              }],
              'role': 'admin'
        },
        'total': 27
    }
'''


success_return = '''
    {
        result: success
    }
'''

dataset_user_status= module_api.model("dataset_user_status", {
    "status": fields.String,
})

data_manifests = module_api.model("data_manifests", {
    "project_code": fields.String,
})

data_manifests_return = """
    {   
        'code': 200,
        'error_msg': '',
        'num_of_pages': 1,
        'page': 1,
        'result': [   {   'attribute': 'test',
                          'id': 1,
                          'name': 'Manifest 1',
                          'optional': False,
                          'project_code': 'test2',
                          'type': 'multiple_choice',
                          'value': 'testing 123'},
        ],
        'total': 1,
    }
"""

