"""muhc-cli command line syntax.
Usage:
  muhc-cli.py upload STUDY USER HADOOP_PATH
            [--metadata=<metadata>]... [--tags=<tag>]...[--config=<config>] PATH

Arguments:
  STUDY                          The study name
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
from subprocess import PIPE, Popen

def upload(study, path, user, hadoop_path):
    # define path to saved file
    file_name = os.path.basename(path)

    # create path to your username on hdfs
    hdfs_path = os.path.join(os.sep, 'user', user, file_name)
    HDFS_URI = "hdfs://10.3.9.241:9000"
    hdfs_path =HDFS_URI+hdfs_path

    print(hadoop_path, path, hdfs_path)
    # put csv into hdfs
    put = Popen(['hadoop', "fs", "-put", path, hdfs_path], stdin=PIPE, bufsize=-1)
    put.communicate()

def main():
    args = docopt(__doc__, version='0.9')

    # let user choose which config file to use
    if args["--config"] == 'staging':
        print(args["--config"])
    study = args['STUDY']
    user = args['USER']
    hadoop_path = args['HADOOP_PATH']
    path = args['PATH']
    upload(study, path, user, hadoop_path)



if __name__=="__main__":
    main()