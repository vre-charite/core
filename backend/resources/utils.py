# from app import neo4j_connection
from flask import request
from config import ConfigClass
import requests
import json
import math
from datetime import timezone 
import datetime
import pytz
from models.api_response import APIResponse, EAPIResponseCode


def remove_user_from_project_group(container_id, username, logger):
    # Remove user from keycloak group with the same name as the project
    res = requests.get(
        url=ConfigClass.NEO4J_SERVICE + f"nodes/Dataset/node/{container_id}",
    )
    project_name = json.loads(res.content)[0]["code"]
    payload = {
        "realm": "vre",
        "username": username,
        "groupname": project_name,
    }
    res = requests.delete(
        url=ConfigClass.AUTH_SERVICE + "admin/users/group",
        params=payload
    )
    if(res.status_code != 200):
        logger.error(f"Error removing user from group in keycloak: {res.text} {res.status_code}")


def add_user_to_project_group(container_id, username, logger):
    # Add user to keycloak group with the same name as the project
    res = requests.get(
        url=ConfigClass.NEO4J_SERVICE + f"nodes/Dataset/node/{container_id}",
    )
    project_name = json.loads(res.content)[0]["code"]
    payload = {
        "realm": "vre",
        "username": username,
        "groupname": project_name,
    }
    res = requests.post(
        url=ConfigClass.AUTH_SERVICE + "admin/users/group",
        json=payload
    )
    if(res.status_code != 200):
        logger.error(f"Error adding user to group in keycloak: {res.text} {res.status_code}")


######################################################### DATASET API #################################################

def convert_from_utc(timestamp):
    dt = datetime.datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S")
    dt = pytz.utc.localize(dt)
    return dt.astimezone(pytz.timezone(ConfigClass.TIMEZONE)).strftime("%Y-%m-%dT%H:%M:%S")


def check_user_exists(token, username):
    url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
    headers = {
        'Authorization': token
    }
    res = requests.post(
        url=url,
        headers=headers,
        json={"name": username}
    )
    return json.loads(res.text)

def list_containers(token, label, payload=None):
    url = ConfigClass.NEO4J_SERVICE + "nodes/%s/query" % label
    headers = {
        'Authorization': token
    }
    res = requests.post(
        url=url,
        headers=headers,
        json=payload
    )
    return json.loads(res.text)


def retreive_property(token, label):
    url = ConfigClass.NEO4J_SERVICE + "nodes/%s/properties" % label
    headers = {
        'Authorization': token
    }
    res = requests.get(
        url=url,
        headers=headers,
    )
    return json.loads(res.text)


def update_container_information(token, label, container_id, payload):
    url = ConfigClass.NEO4J_SERVICE + \
        "nodes/%s/node/%s" % (label, container_id)
    headers = {
        'Authorization': token
    }
    res = requests.put(
        url=url,
        headers=headers,
        json=payload
    )
    return res


def check_container_exist(token, label, container_id):
    url = ConfigClass.NEO4J_SERVICE + "nodes/%s/node/" % label + container_id
    headers = {
        'Authorization': token
    }
    res = requests.get(
        url=url,
        headers=headers
    )
    return json.loads(res.text)

def neo4j_query_with_pagination(url, data, partial=False):
    page = int(data.get('page', 0))
    page_size = int(data.get('page_size', 25))
    data = data.copy()
    if data.get("page"):
        del data["page"]
    if data.get("page_size"):
        del data["page_size"]

    # Get token from reuqest's header
    access_token = request.headers.get("Authorization", None)
    page_data = {
        "limit": page_size,
        "skip": page * page_size,
        "partial": partial,
        **data
    }
    headers = {
        'Authorization': access_token
    }
    # Request to get page results
    res = requests.post(
        url=url,
        headers=headers,
        json=page_data,
    )
    del page_data["limit"]
    del page_data["skip"]
    if "order_by" in page_data:
        del page_data["order_by"]
    if "order_type" in page_data:
        del page_data["order_type"]

    # Get page count
    count_res = requests.post(
        url=url + "/count",
        headers=headers,
        json={"count": True, **page_data},
    )
    total = json.loads(count_res.content).get("count")
    response = APIResponse()
    response.set_result(json.loads(res.content))
    response.set_page(page)
    response.set_total(total)
    response.set_num_of_pages(math.ceil(total / page_size))
    return response

################################################### User Function ########################################


def bulk_add_user(headers, dataset_id, users, role):
    error = []
    # loop over each user to add with relationship
    for user in users:
        try:
            # Check if user is existed
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={"name": user}
            )
            temp = json.loads(res.text)
            if(len(temp) == 0):
                raise Exception("User %s does not exist" % user)
            user_id = temp[0]['id']

            # Add relation between user and container
            url = ConfigClass.NEO4J_SERVICE + "relations/"+role
            res = requests.post(
                url=url,
                headers=headers,
                json={
                    "start_id": int(user_id),
                    "end_id": int(dataset_id)
                }
            )

            if(res.status_code != 200):
                raise Exception(json.loads(res.text))

        except Exception as e:
            error.append(
                "Error when process user %s: error %s" % (user, e))

    return error

######################################################### DEPRECATED #################################################

######################################################### DATASET API #################################################
# function will create a dataset with node in neo4j
# and add the hdfs path to the hadoop server


def create_dataset(dataset_name, params):
    # assumption here the path will be /<default>/<dataset_name>
    params.update({'name': dataset_name})
    params.update({'path': ConfigClass.DATASET_PATH+dataset_name})

    neo4j_session = neo4j_connection.session()
    # not the dataset name will be unique
    neo4j_session.run('create(node:Dataset) set node = {param}',
                      param=params)

    # let the hdfs create a dataset
    # hdfs_client.makedirs(ConfigClass.DATASET_PATH+dataset_name)


# This function will fetch datasets that user has permission to
def get_datasets(username):
    neo4j_session = neo4j_connection.session()
    res = neo4j_session.run("MATCH (:User { name:{username}} )-[r]->(d:Dataset) return d,r",
                            username=username
                            )
    neo4j_session.close()
    return res

# This function will filter dataset based on name/tags/metadatas


def filter_datasets_by_args(args):
    name = args.get("name", None)
    types = args.get("type", None)
    tags = args.get("tags", None)
    metadatas = args.get("metadatas", None)
    file_count = args.get("file_count", None)
    time_lastmodified = args.get("time_lastmodified", None)
    time_created = args.get("time_created", None)

    # Format query string
    query = "MATCH (n:Dataset) WHERE NOT 'default' IN n._type OR n._type is null "
    if(name is not None):
        query+="WITH * WHERE n.name CONTAINS '{name}' ".format(name = name)
    
    if(types is not None):
        query+="WITH * WHERE n.type IN {types} ".format(types = types)

    if(tags is not None):
        query+="WITH * WHERE "
        for tag in tags:
            query+="'{tag}' in n.tags OR ".format(tag=tag)
        query = query[:-3]

    if(metadatas is not None):
        query+="WITH * WHERE "
        for k in metadatas:
            query+="n._{key} IN {value} OR ".format(key=k, value=str(metadatas[k])) 
        query = query[:-3]  

    if(file_count is not None):
        query+="WITH * WHERE n.file_count >= {mix} AND n.file_count <= {max} ".format(mix=file_count[0], max=file_count[1])

    if(time_lastmodified is not None):
        query+="WITH * WHERE datetime(n.time_created) >= datetime('{timestamp}') ".format(timestamp = time_lastmodified[0])
        query+="AND datetime(n.time_created) <= datetime('{timestamp}') ".format(timestamp = time_lastmodified[1])
    
    if(time_created is not None):
        query+="WITH * WHERE datetime(n.time_created) >= datetime('{timestamp}') ".format(timestamp = time_created[0])
        query+="AND datetime(n.time_created) <= datetime('{timestamp}') ".format(timestamp = time_created[1])
    
    query+="SET n.time_created = toString(n.time_created), \
            n.time_lastmodified = toString(n.time_lastmodified) \
            RETURN n"    
    print(query)

    # Connect to neo4j server and load query results
    neo4j_session = neo4j_connection.session()
    res = neo4j_session.run(query)
   
    # Format results 
    record = [x for x in res]
    result = dataset_obj_2_json(record)

    return result

def dataset_obj_2_json(query_result):
    
    def o2j(dataset_object):
        temp = {
            'id': dataset_object.id,
            'labels': list(dataset_object.labels)
        }
        # add the all the attribute all together
        temp.update(dict(zip(dataset_object.keys(), dataset_object.values())))

        # update the timestamp
        try:
            temp['time_lastmodified'] = str(temp['time_lastmodified'])[:19]
            temp['time_created'] = str(temp['time_created'])[:19]
        except Exception as e:
            print(e)

        return temp

    # allow the array and the single object
    if type(query_result) == list:
        result = []
        for x in query_result:
            temp = o2j(x[0])
            result.append(temp)

        return result
    else:
        return o2j(query_result)

# function will turn the neo4j query result of user
# and transform into user json object
def user_obj_2_json(query_result):
    
    def o2j(user_ob, role=None):
        print("here")
        temp = {
            'id': user_ob.id,
            **dict(zip(user_ob.keys(), user_ob.values()))
        }
        # Add role if existed
        if role is not None:
            temp.update(role=role)

        # update the timestamp
        try:
            temp['time_lastmodified'] = str(temp['time_lastmodified'])[:19]
            temp['time_created'] = str(temp['time_created'])[:19]
        except Exception as e:
            print(e)
        return temp

    # allow the array and the single object
    if type(query_result) == list:
        result = []
        for x in query_result:
            if(len(x) == 2):
                temp = o2j(x[0], x[1])
            else:
                temp = o2j(x[0])
            result.append(temp)

        return result
    else:
        return o2j(query_result[0])
################################################### User Function ########################################

# This function will create a user node in neo4j
# The function will be called after default dataset has already generated successfully
# And link default dataset to the user node when created


def create_user(params):
    username = params.get("name")
    neo4j_session = neo4j_connection.session()
    neo4j_session.run("MATCH (d:Dataset { admin:[{username}]} ) \
                CREATE (u:User)-[:admin {type: 'default'}]->(d) \
                SET u = {params}",
                      params=params,
                      username=username
                      )
    neo4j_session.close()

# This function fetch the specific user node by username


def get_user(username):
    # Fetch user information based on username from neo4j
    neo4j_session = neo4j_connection.session()
    res = neo4j_session.run("MATCH (n:User) WHERE n.name = {username} return n",
                            username=username
                            )
    neo4j_session.close()
    return res


################################################### Simple Helpers ########################################

def helper_now_utc():
    dt = datetime.datetime.now() 
    utc_time = dt.replace(tzinfo = timezone.utc) 
    return utc_time
