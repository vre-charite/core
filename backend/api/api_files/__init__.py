from .upload_ops import CheckUploadStateRestful, CheckUploadStatusRestful, PreUploadRestful, ChunkUploadSuccessRestful
from .folder_ops import Folders
from .vfolder_ops import VirtualFolderFiles, VirtualFolder, VirtualFolderInfo
from .file_ops import FileExistCheck, FileDownloadLog, FilePreDownload, FileInfo, ProcessedFile, TotalFileCount, DailyFileCount, FileTransfer, FileActionLogs, FileDeletion
from .file_ops_v2 import FileInfoV2, FileTags
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
nfs_entity_ns.add_resource(FileTransfer, '/transfer')
nfs_entity_ns.add_resource(FileActionLogs, '/actions/logs')
nfs_entity_ns.add_resource(FileDeletion, '/actions')

nfs_entity_ns_v2 = Namespace(
    'NFS Data Operation Version 2', description='Operation on NFS', path='/v2/files'
)

nfs_entity_ns_v2.add_resource(FileInfoV2, '/containers/<dataset_id>/files/meta')
nfs_entity_ns_v2.add_resource(FileTags, '/containers/<dataset_id>/files/tags')

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

nfs_vfolder_ns = Namespace(
    'NFS Data vFolder', description='vFolder on NFS', path='/v1/vfolder')
nfs_vfolder_ns.add_resource(VirtualFolderFiles, '/<folderId>/files')
nfs_vfolder_ns.add_resource(VirtualFolder, '/')
nfs_vfolder_ns.add_resource(VirtualFolderInfo, '/<folderId>')