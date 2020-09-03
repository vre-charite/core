# from app import neo4j_connection
from config import ConfigClass
import requests
import json
from datetime import timezone 
import datetime


######################################################### DATASET API #################################################

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
