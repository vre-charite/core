#
# this file is the basic operation on the neo4j includes
# add the node and relationship to fullfill the basic 
# requirement on the neo4j
# 

from flask import request, make_response, jsonify
from flask_restful import Resource
# from resources.util import get_dataset_by_id, create_user_rel, get_dataset_by_user
from datetime import datetime

from . import neo4j_connection
from config import ConfigClass
# from .utils import *

# def neo4j_obj_2_json(query_result):

#     def o2j(dataset_object):
#         temp = {
#             'id': dataset_object.id,
#             'labels': list(dataset_object.labels)
#         }
#         # add the all the attribute all together
#         temp.update(dict(zip(dataset_object.keys(), dataset_object.values())))

#         # update the timestamp
#         try:
#             temp['time_lastmodified'] = str(temp['time_lastmodified'])[:19]
#             temp['time_created'] = str(temp['time_created'])[:19]
#         except Exception as e:
#             print(e)

#         return temp

#     # allow the array and the single object
#     if type(query_result) == list:
#         result = []
#         for x in query_result:
#             temp = o2j(x[0])
#             result.append(temp)

#         return result
#     else:
#         return o2j(query_result)

# here I have create the two basic function to add a node and get a node
# also I add two simple GET and POST for to overwrite the 
class neo4j_node(object):
    # todo move the neo4j_connection here?


    # api will add the node in the neo4j
    # if parent_id appear in the parameter then it will also 
    # create a relationship between two
    def add_node(self, label, name, param={}):
        neo4j_session = neo4j_connection.session()

        query = 'create (node:%s) set node=$param, node.name=$name , \
            node.time_created = datetime(), node.time_lastmodified = datetime() \
            return node'%(label)

        res = neo4j_session.run(query, param=param, name=name)


        parent_id = param.pop("parent_id", None)
        parent_relation = param.pop("parent_relation", None)
        # if we have parent then add relationship
        if parent_id != None and parent_relation != None:
            query = 'match (p1), (n:%s) where ID(p1)=$parent_id \
                and n.name=$new_dataset create p=(p1)-[:%s]->(n) return p'%(label, parent_relation)

            neo4j_session.run(query, parent_id=int(parent_id), new_dataset=name)

        # record = [x for x in res]
        # ret = neo4j_obj_2_json(record)

        return res


    def get_node(self, label, id):
        neo4j_session = neo4j_connection.session()

        query = 'match (node:%s) where ID(node)=$nid return node'%(label)

        res = neo4j_session.run(query, nid=id)

        # then formating the object to the dictionary
        # record = [x for x in res]
        # ret = neo4j_obj_2_json(record)

        return res



class neo4j_relation(object):
    def relation_constrain_check(self, relation_label, dataset_id, target_dataset):
        # validate the target cannot add to itself
        # if there are common in intersection then abort it
        if set(dataset_id).intersection(target_dataset):
            return "Error cannot add yourself as parent/child", False


        # currently I dont have any better idea to check if we add the duplicate
        neo4j_session = neo4j_connection.session()
        query = 'match p=(n1)-[:%s]->(n2) where ID(n1) \
            in $dataset_id and ID(n2) in $target_dataset return n1'%(relation_label)
        res = neo4j_session.run(query, dataset_id=dataset_id, target_dataset=target_dataset)

        # if we get some dataset then they are duplicate
        duplicate_dataset = [x[0].id for x in res]
        if len(duplicate_dataset):
            return "dataset(s) %s already be the parent(s)."%(duplicate_dataset), False


        # impletement the cycle checking the dataset in child branch cannot be parent
        res = neo4j_session.run('match (n1)-[:PARENT*]->(n2) \
            where ID(n2) in $dataset_id and ID(n1) in $target_dataset return n2', 
            dataset_id=dataset_id, target_dataset=target_dataset)

        # if we get some dataset then they are cascade child dataset
        cascade_child_dataset = [x[0].id for x in res]
        if len(cascade_child_dataset):
            return "You cannot add the cascaded child dataset as parent or the other way around." \
                %(cascade_child_dataset), False

        return None, True

    # method allow to query the relationship
    # also the parameter allow the none so that we can query the 
    # n-to-n, 1-to-n, n-to-1 or 1-to-1
    def get_relation(self, relation_label, start_id=None, end_id=None):
        query = 'match p=(start_node)-[:%s]->(end_node) '%relation_label

        # now start add the start node and end node condition
        if start_id and end_id:
            query += 'where ID(start_node)=$start_id and ID(end_node)=$end_id '
        elif start_id:
            query += 'where ID(start_node)=$start_id '
        elif end_id:
            query += 'where ID(end_node)=$end_id '
        query += 'return p'

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query, start_id=start_id, end_id=end_id)

        return res

    def add_relation_between_nodes(self, relation_label, start_id, end_id):
        print(start_id, end_id)

        # now I only allow one be the array either start id or end id
        if type(start_id) == list and type(end_id) == list:
            raise Exception("Both start_id and end_id can be the list")
        
        if type(start_id) != list:
            start_id = [start_id]
        elif type(end_id) != list:
            end_id = [end_id]

        # first check the all constrain
        constrain_res = self.relation_constrain_check(relation_label, start_id, end_id)
        if not constrain_res[1]:
            raise Exception(constrain_res[0])


        # if every work fine add the relationship
        neo4j_session = neo4j_connection.session()
        query = 'match (start),(end) where ID(start) in $start_id and ID(end) in $end_id \
            create p=(start)-[:%s]->(end) return p'%(relation_label)
        res = neo4j_session.run(query, label=relation_label, start_id=start_id, end_id=end_id)

        return res


    # method allow to query the nodes on other side of relation
    # also the parameter allow the none so that we can query the 
    # 1-to-n, n-to-1 if start == True -> node_id-to-others
    def get_node_along_relation(self, relation_label, node_id, start=True):
        query = 'match r=(start_node)-[:%s]->(end_node) '%relation_label

        # now start add the start node and end node condition
        if start:
            query += 'where ID(start_node)=$node_id return end_node'
        else:
            query += 'where ID(end_node)=$node_id return start_node'

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query, node_id=node_id)

        # then format the result
        # record = [x for x in res]
        # ret = neo4j_obj_2_json(record)
        # print(ret)

        return res

    # this is designed for when choosing adding the dataset
    # that the node should not either be in the parent tree or
    # the children tree
    def get_nodes_outside_relation(self, relation_label, current_dataset_id):
        neo4j_session = neo4j_connection.session()

        query = 'match (n),(n1) where not (n1)-[:%s]->(n) and not (n)-[:%s] \
            ->(n1) and ID(n1)=$dataset_id and not ID(n)=$dataset_id return n'%(relation_label, relation_label)

        res = neo4j_session.run(query, dataset_id=current_dataset_id)

        return res
    