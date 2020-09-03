import requests
import json
from models.service_meta_class import MetaService
from config import ConfigClass

class SrvContainerManager(metaclass=MetaService):
    def __init__(self):
        self.url = ConfigClass.NEO4J_SERVICE
    def check_container_exist(self, token, label, container_id):
        my_url = self.url + "nodes/%s/node/" % label + str(container_id)
        headers = {
            'Authorization': token
        }
        res = requests.get(
            url=my_url,
            headers=headers
        )
        return json.loads(res.text)

    def list_containers(self, label, payload=None):
        url = ConfigClass.NEO4J_SERVICE + "nodes/%s/query" % label
        res = requests.post(
            url=url,
            json=payload
        )
        return json.loads(res.text)