import json
import os
import requests
import time 
import datetime 
import math
import sys

import config
from utils import get_file_node


# add system_tags to es entity
def update_es_file():
    neo4j_url = config.NEO4J_SERVICE_V2 + 'nodes/query'

    body = {
        "page": 0,
        "page_size": 10,
        "partial": True,
        "order_by": "time_created",
        "order_type": "desc",
        "query": {
            "labels": ["File"]
        }
    }

    neo4j_res = requests.post(neo4j_url, json=body)
    result = neo4j_res.json()

    neo4j_num = result['total']
    page_size = 100
    entities = result['result']

    pages = math.ceil(neo4j_num / page_size)

    for current_page in range(pages):
        body['page_size'] = 100
        body['page'] = current_page

        neo4j_res = requests.post(neo4j_url, json=body)
        result = neo4j_res.json()

        entities = result['result']

        for item in entities:
            if 'global_entity_id' not in item:
                continue

            if 'tags' not in item:
                continue

            if not len(item['tags']):
                continue

            print(item['tags'], item["global_entity_id"])

            es_body = {
                "global_entity_id": item["global_entity_id"],
                "updated_fields": {
                    "system_tags": item['tags']
                }
            }

            es_res = requests.put(config.PROVENANCE_SERVICE + 'entity/file', json=es_body)
            print(es_res.json())


update_es_file()