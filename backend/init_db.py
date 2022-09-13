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

from app import create_app, db
from config import ConfigClass
#from models.api_data_manifest import DataManifestModel, DataAttributeModel
from models.api_resource_request import ResourceRequest

app = create_app()
with app.app_context():
    #DataManifestModel.__table__.create(db.session.bind)
    #DataAttributeModel.__table__.create(db.session.bind)
    ResourceRequest.__table__.create(db.session.bind)
    print("SUCCESS")

