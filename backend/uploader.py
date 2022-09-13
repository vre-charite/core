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

"""muhc-cli command line syntax.
Usage:
  muhc-cli.py upload DATABASE_NAME USER PASS
            [--metadata=<metadata>]... [--tags=<tag>]...[--config=<config>] PATH

Arguments:
  DATABASE_NAME                  The dataset_name name
  USER                           The user name
  PATH                           Path of the file to be uploaded

Options:
  -h --help                      Show this screen.
  -v --version                   Show version.
  -m --metadata=<metadata>       The metadata of the uploading file
                                                    e.g. --metadata='key=value'
  -t --tags=<tag>                The tags of the uploading file
                                                    e.g. --tags='key=value'
"""
import os
import sys
from docopt import docopt
from hdfs import InsecureClient
from hdfs import Config
import requests
import json

import requests

from file_ops.util import upload_HDFS


def check(username, password):
    # data to be sent to api
    data = {
        "username": username,
        "password": password
    }
    data = json.dumps(data)
    headers = {'Content-type': 'application/json'}
    # sending post request and saving response as response object
    r = requests.post(url='http://10.3.9.240:5060/users/auth',
                      data=data, headers=headers)
    return r.json()['result']

# def upload(dataset_name, path, username, password):
#     # add the check the role of the user
#     # result = check(username, password)
#     # print(result['username'])
#     # print(result['access_token'])
#     # print(result['roles'])
#     # if 'hdfs-admin' not in result['roles']:
#     #     raise NameError('Not allowed to upload file')
#     # define path to saved file
#     file_name = os.path.basename(path)
#     client = InsecureClient('http://10.3.9.241:9870/', user=username)

#     # TODO I think this should be update into the configure file <------------------------------
#     # check the dataset exist
#     # DATASET_PATH = '/dataset/'
#     # datasets = client.list(DATASET_PATH)

#     # first get the dataset info from server
#     res = requests.get('http://10.3.9.240:5060/containers/%s'%(dataset_name))
#     if res.status_code != 200:
#         print("ERROR: dataset %s does not find. Please create one."%dataset_name)
#         return

#     # then try to get the path of the dataset
#     detail = json.loads(res.content)['result']
#     hdfs_path = detail['items'].get('path', None)
#     if not path:
#         print('path of dataset %s does not exist.'%dataset_name)
#         return

#     # after that upload to server
#     client.upload(hdfs_path, path)


def main():
    args = docopt(__doc__, version='0.9')

    # let user choose which config file to use
    if args["--config"] == 'staging':
        print(args["--config"])
    dataset_name = args['DATABASE_NAME']
    username = args['USER']
    password = args['PASS']
    path = args['PATH']

    upload_HDFS(dataset_name, path, username)
    # upload(dataset_name, path, username, password)


if __name__ == "__main__":
    main()
