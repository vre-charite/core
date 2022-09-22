// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

const common = {
  // for app.js
  getDataset: 'common.getDataset',
  listAllContainersPermission: 'common.listAllContainersPermission',
  emailFileList: 'common.emailFileList',
  logout: 'common.logout',
};
const login = {
  auth: 'login.auth',
  refresh: 'login.refresh',
  parseInviteHashAPI: 'login.parseInviteHashAPI',
  forgotPassword: 'login.forgotPassword',
  resetForgottenPassword: 'login.resetForgottenPassword',
  checkToken: 'login.checkToken',
  forgotUsername: 'login.forgotUsername',
};
const landing = {
  createProject: 'landing.createProject',
};

const project = {
  files: {
    uploadFileApi: 'project.files.uploadFileApi',
    uploadRequestFail: 'project.files.uploadRequestFail',
    getChildrenDataset: 'project.files.getChildrenDataset',
    traverseFoldersContainersAPI: 'project.files.traverseFoldersContainersAPI',
    getFilesByTypeAPI: 'project.files.getFilesByTypeAPI',
    downloadFilesAPI: 'project.files.downloadFilesAPI',
    processingFile: 'project.files.processingFile',
    preUpload: 'project.files.preUpload',
    combineChunk: 'project.files.combineChunks',
  },
};
const dataset = {
  files: {
    downloadFilesAPI: 'dataset.files.downloadFilesAPI',
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
  restoreUserFromDataset: 'teams.restoreUserFromDataset',
  checkUserPlatformRole: 'teams.checkUserPlatformRole',
};

const contactUs = {
  contactUsAPI: 'contactUs.contactUsAPI',
};

const userManagement = {
  inviteUserApi: 'userManagement.inviteUserApi',
  getPortalUsers: 'userManagement.getPortalUsers',
  updateUserStatusAPI: 'userManagement.updateUserStatusAPI',
  getInvitationsAPI: 'userManagement.getInvitationsAPI',
  getServiceRequestAPI: 'userManagement.getServiceRequestAPI',
};

const announcement = {
  getAnnouncementApi: 'announcement.getAnnouncementApi',
  getUserAnnouncementApi: 'announcement.getUserAnnouncementApi',
};

const manifest = {
  getManifestById: 'manifest.getManifestById',
};

const fileExplorer = {
  createFolder: 'fileExplorer.createFolder',
};

export default {
  common,
  login,
  landing,
  project,
  dataset,
  selfRegister,
  teams,
  contactUs,
  userManagement,
  announcement,
  manifest,
  fileExplorer,
};
