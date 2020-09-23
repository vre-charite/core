const common = {
  // for app.js
  getDataset: 'common.getDataset',
  listAllContainersPermission: 'common.listAllContainersPermission',
  emailFileList:'common.emailFileList',
  logout:'common.logout',
};
const login = {
  auth: 'login.auth',
  refresh: 'login.refresh',
  parseInviteHashAPI: 'login.parseInviteHashAPI',
};
const landing = {
  createProject:'landing.createProject'
};

const dataset = {
  files: {
    uploadFileApi: 'dataset.files.uploadFileApi',
    uploadRequestFail:'dataset.files.uploadRequestFail',
    getRawFilesAPI: 'dataset.files.getRawFilesAPI',
    getChildrenDataset: 'dataset.files.getChildrenDataset',
    traverseFoldersContainersAPI: 'dataset.files.traverseFoldersContainersAPI',
    getFilesByTypeAPI: 'dataset.files.getFilesByTypeAPI',
    downloadFilesAPI: 'dataset.files.downloadFilesAPI',
    processingFile:'dataset.files.processingFile',
  },
};

const selfRegister = {
  selfRegistration: 'selfRegister.selfRegistration',
};

const teams = {
  checkEmailExistAPI: 'teams.checkEmailExistAPI',
  inviteUser: 'teams.inviteUser',
  addUsertoDataSet: 'team.addUsertoDataSet',
  getUsersOnDataset: 'teams.getUsersOnDataset',
  changeRoleInDataset: 'teams.changeRoleInDataset',
  removeUserFromDataset: 'teams.removeUserFromDataset',
};

export default { common, login, landing, dataset, selfRegister, teams };
