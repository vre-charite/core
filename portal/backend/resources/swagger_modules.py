from flask_restx import Api, Resource, fields
from dataset import module_api


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
        "result": [
            {
                "id": 12,
                "labels": [
                    "Dataset"
                ],
                "path": "Carsten Finke Generate",
                "time_lastmodified": "2020-07-03T18:18:47",
                "name": "Carsten Finke Generate",
                "time_created": "2020-07-03T18:18:47",
                "admin": [
                    "user1",
                    "user2",
                    "user3"
                ],
                "type": "Usecase",
                "_key1": "value1",
                "_key2": "value2",
                "tags": [
                    "tag1",
                    "tag2"
                ]
            },
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
        "result": {
            "role": "admin",
            "permission": [
                {
                    "permission": "admin",
                    "container_name": "test1111",
                    "container_id": 16
                },
                {
                    "permission": "admin",
                    "container_name": "dataset-test-1",
                    "container_id": 97
                },
                {
                    "permission": "admin",
                    "container_name": "admin_default",
                    "container_id": 78
                }
            ]
        }
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
