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

from app import db
from datetime import datetime
from config import ConfigClass

class ResourceRequest(db.Model):
    __tablename__ = 'resource_request'
    __table_args__ = {"schema":ConfigClass.RDS_SCHEMA_DEFAULT}
    id = db.Column(db.Integer, unique=True, primary_key=True)
    user_geid = db.Column(db.String())
    username = db.Column(db.String())
    email = db.Column(db.String())
    project_geid = db.Column(db.String())
    project_name = db.Column(db.String())
    request_date = db.Column(db.DateTime(), default=datetime.utcnow)
    request_for = db.Column(db.String())
    active = db.Column(db.Boolean(), default=True)
    complete_date = db.Column(db.DateTime())

    def __init__(self, user_geid, username, email, project_geid, project_name, request_for):
        self.user_geid = user_geid
        self.username = username
        self.email = email
        self.project_geid = project_geid
        self.project_name = project_name
        self.request_for = request_for

    def to_dict(self):
        result = {}
        for field in ["id", "user_geid", "username", "email", "project_geid", "project_name", "request_date", \
                "request_for", "active", "complete_date"]:
            if field in ["complete_date", "request_date"]:
                result[field] = str(getattr(self, field))
            else:
                result[field] = getattr(self, field)
        return result
