# Copyright 2022 Indoc Research
# 
# Licensed under the EUPL, Version 1.2 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
# 
# https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
# 
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
# 

import uuid
from minio import Minio
from config import ConfigClass


class Minio_Client():
    '''
    Connect to MinIO
    '''
    def __init__(self):
        self.client = Minio(
            ConfigClass.MINIO_ENDPOINT,
            access_key=ConfigClass.MINIO_ACCESS_KEY,
            secret_key=ConfigClass.MINIO_SECRET_KEY,
            secure=ConfigClass.MINIO_HTTPS
        )



def create_admin_policy(project_code):
    template = '''
    {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
            "Effect": "Allow",
            "Resource": ["arn:aws:s3:::gr-%s", "arn:aws:s3:::core-%s"]
            },
            {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Effect": "Allow",
            "Resource": ["arn:aws:s3:::gr-%s/*", "arn:aws:s3:::core-%s/*"]
            }
        ]
    }
    ''' % (project_code, project_code, project_code, project_code)

    template_name = str(uuid.uuid4())+".json"
    policy_file = open(template_name, "w")
    policy_file.write(template)
    policy_file.close()

    return template_name


def create_collaborator_policy(project_code):
    template = '''
    {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
            "Effect": "Allow",
            "Resource": ["arn:aws:s3:::gr-%s", "arn:aws:s3:::core-%s"]
            },
            {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Effect": "Allow",
            "Resource": ["arn:aws:s3:::gr-%s/${jwt:preferred_username}/*", "arn:aws:s3:::core-%s/*"]
            }
        ]
    }
    ''' % (project_code, project_code, project_code, project_code)

    template_name = str(uuid.uuid4())+".json"
    policy_file = open(template_name, "w")
    policy_file.write(template)
    policy_file.close()

    return template_name


def create_contributor_policy(project_code):
    template = '''
    {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
            "Effect": "Allow",
            "Resource": ["arn:aws:s3:::gr-%s", "arn:aws:s3:::core-%s"]
            },
            {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Effect": "Allow",
            "Resource": ["arn:aws:s3:::gr-%s/${jwt:preferred_username}/*", "arn:aws:s3:::core-%s/${jwt:preferred_username}/*"]
            }
        ]
    }
    ''' % (project_code, project_code, project_code, project_code)

    template_name = str(uuid.uuid4())+".json"
    policy_file = open(template_name, "w")
    policy_file.write(template)
    policy_file.close()

    return template_name
