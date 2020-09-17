# gunicorn_config.py
preload_app = True

import gevent.monkey
import multiprocessing

gevent.monkey.patch_all()
bind = '0.0.0.0:5060'
daemon = 'false'
# worker config
# worker_class = 'gevent'
workers = multiprocessing.cpu_count() * 2 + 1
threads = multiprocessing.cpu_count() * 2
worker_connections = 1200
accesslog = 'gunicorn_access.log'
errorlog = 'gunicorn_error.log'
loglevel = 'debug'
