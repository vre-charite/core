from .upload_ops import CheckUploadStateRestful, CheckUploadStatusRestful, PreUploadRestful, ChunkUploadSuccessRestful
from .folder_ops import Folders
from .file_ops import FileExistCheck, FileDownloadLog, FilePreDownload, FileInfo, ProcessedFile, TotalFileCount, DailyFileCount
from flask_restx import Api, Resource, fields, Namespace
from config import ConfigClass

nfs_entity_ns = Namespace(
    'NFS Data Operation', description='Operation on NFS', path='/v1/files')

nfs_entity_ns.add_resource(
    TotalFileCount, '/containers/<dataset_id>/files/count/total')
nfs_entity_ns.add_resource(
    DailyFileCount, '/containers/<dataset_id>/files/count/daily')
nfs_entity_ns.add_resource(FilePreDownload, '/containers/<dataset_id>/file')
nfs_entity_ns.add_resource(FileDownloadLog, '/files/download/log')
nfs_entity_ns.add_resource(ProcessedFile, '/files/processed')
nfs_entity_ns.add_resource(FileInfo, '/containers/<dataset_id>/files/meta')
nfs_entity_ns.add_resource(Folders, '/folders')
nfs_entity_ns.add_resource(FileExistCheck, '/containers/<container_id>/files/exist')

nfs_upload_ns = Namespace(
    'NFS Data Upload', description='Upload on NFS', path='/v1/upload')

# upload entity
nfs_upload_ns.add_resource(PreUploadRestful, '/containers/<dataset_id>/pre')
nfs_upload_ns.add_resource(ChunkUploadSuccessRestful,
                           '/containers/<dataset_id>/on-success')
nfs_upload_ns.add_resource(CheckUploadStatusRestful,
                           '/containers/<dataset_id>/status')
nfs_upload_ns.add_resource(CheckUploadStateRestful,
                           '/containers/<container_id>/upload-state')
