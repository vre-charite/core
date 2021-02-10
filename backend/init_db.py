from app.db import db
from app import create_app 
from config import ConfigClass
from models.api_data_manifest import DataManifestModel, DataAttributeModel

app = create_app()
with app.app_context():
    db.init_app(app)
    DataManifestModel.__table__.create(db.session.bind)
    DataAttributeModel.__table__.create(db.session.bind)
    print("SUCCESS")
