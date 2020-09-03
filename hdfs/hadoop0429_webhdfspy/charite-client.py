"""muhc-cli command line syntax.
Usage:
  muhc-cli.py upload STUDY USER
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
from hdfs import InsecureClient
from hdfs import Config


def upload(study, path, user):
    # define path to saved file
    file_name = os.path.basename(path)

    # create path to your username on hdfs
    hdfs_path = os.path.join(os.sep, 'user', user, file_name)
    client = Config().get_client('dev')
    client.upload(hdfs_path, path)

def main():
    args = docopt(__doc__, version='0.9')

    # let user choose which config file to use
    if args["--config"] == 'staging':
        print(args["--config"])
    study = args['STUDY']
    user = args['USER']
    path = args['PATH']
    upload(study, path, user)

if __name__=="__main__":
    main()
