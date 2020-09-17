from .upload_ops import CheckUploadStatusRestful, PreUploadRestful, ChunkUploadSuccessRestful
from .folder_ops import folders
from .file_ops import file_predownload, file_download_log, \
    fileInfo, processedFile, totalFileCount, dailyFileCount
from flask_restx import Api, Resource, fields, Namespace
from config import ConfigClass

nfs_entity_ns = Namespace(
    'NFS Data Operation', description='Operation on NFS', path='/v1/files')


nfs_entity_ns.add_resource(
    totalFileCount, '/containers/<dataset_id>/files/count/total')
nfs_entity_ns.add_resource(
    dailyFileCount, '/containers/<dataset_id>/files/count/daily')
nfs_entity_ns.add_resource(file_predownload, '/containers/<dataset_id>/file')
# nfs_entity_ns.add_resource(file_download_log, '/files/download/log')


nfs_entity_ns.add_resource(processedFile, '/files/processed')
nfs_entity_ns.add_resource(fileInfo, '/containers/<dataset_id>/files/meta')
nfs_entity_ns.add_resource(folders, '/folders')


nfs_upload_ns = Namespace(
    'NFS Data Upload', description='Upload on NFS', path='/v1/upload')

# upload entity
nfs_upload_ns.add_resource(PreUploadRestful, '/containers/<dataset_id>/pre')
nfs_upload_ns.add_resource(ChunkUploadSuccessRestful,
                           '/containers/<dataset_id>/on-success')
nfs_upload_ns.add_resource(CheckUploadStatusRestful,
                           '/containers/<dataset_id>/status')
