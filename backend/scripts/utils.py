import config
import requests

def get_file_node(full_path):
    post_data = {"full_path": full_path}
    response = requests.post(config.NEO4J_SERVICE + f"nodes/File/query", json=post_data)
    if not response.json():
        return None
    return response.json()[0] 