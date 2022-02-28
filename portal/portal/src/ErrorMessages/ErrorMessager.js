import namespace from './namespace';
import { message } from 'antd';
import _ from 'lodash';
import { store } from '../Redux/store';
import i18n from '../i18n';
import { SUPPORT_EMAIL } from '../config';
/**
 * Create a error message object to trigger the error message
 * @param {string} name the namespace of the API
 */

export default function ErrorMessager(name) {
  const _namespaces = {
    [namespace.landing.createProject]: {
      403: (err, params) => {
        message.error(i18n.t('errormessages:createProject.403.0'));
      },
      409: (err, params) => {
        message.error(i18n.t('errormessages:createProject.409.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:createProject.default.0'));
      },
    },
    [namespace.login.auth]: {
      400: (err, params) => {
        message.error(i18n.t('errormessages:login.400.0'));
      },
      401: (err, params) => {
        message.error(i18n.t('errormessages:login.401.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:login.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:login.default.0'));
      },
    },
    [namespace.login.resetPassword]: {
      400: (err, params) => {
        message.error(i18n.t('errormessages:resetPassword.400.0'));
      },
      403: (err, params) => {
        message.error(i18n.t('errormessages:resetPassword.403.0'));
      },
      406: (err, params) => {
        message.error(i18n.t('errormessages:resetPassword.406.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:resetPassword.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:resetPassword.default.0'));
      },
    },
    [namespace.login.forgotPassword]: {
      403: (err, params) => {
        message.error(i18n.t('errormessages:forgotPassword.403.0'));
      },
      406: (err, params) => {
        message.error(i18n.t('errormessages:forgotPassword.406.0'));
      },
      404: (err, params) => {
        message.error(i18n.t('errormessages:forgotPassword.404.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:forgotPassword.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:forgotPassword.default.0'));
      },
    },
    [namespace.login.forgotUsername]: {
      404: (err, params) => {
        message.error(i18n.t('errormessages:forgotUserName.404.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:forgotUserName.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:forgotUserName.default.0'));
      },
    },
    [namespace.login.checkToken]: {
      400: (err, params) => {
        message.error(i18n.t('errormessages:checkToken.400.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:checkToken.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:checkToken.default.0'));
      },
    },
    [namespace.login.resetForgottenPassword]: {
      403: (err, params) => {
        message.error(i18n.t('errormessages:resetForgottenPassword.403.0'));
      },
      400: (err, params) => {
        message.error(i18n.t('errormessages:resetForgottenPassword.400.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:resetForgottenPassword.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:resetForgottenPassword.default.0'));
      },
    },
    [namespace.login.refresh]: {
      403: (err, params) => {
        message.error(i18n.t('errormessages:refresh.403.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:refresh.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:refresh.default.0'));
      },
    },
    [namespace.login.parseInviteHashAPI]: {
      401: (err, params) => {
        message.error(i18n.t('errormessages:parseInviteHashAPI.401.0'));
      },
      404: (err, params) => {
        message.error(i18n.t('errormessages:parseInviteHashAPI.404.0'));
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:parseInviteHashAPI.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:parseInviteHashAPI.default.0'));
      },
    },
    [namespace.project.files.uploadFileApi]: {
      403: (err, params) => {
        message.error(
          `${params.fileName} ${i18n.t('errormessages:uploadFileApi.403.0')}`,
        );
      },
      500: (err, params) => {
        message.error(
          `${i18n.t('errormessages:uploadFileApi.500.0')} ${
            params.fileName
          }. ${i18n.t('errormessages:uploadFileApi.500.1')}`,
        );
      },
      502: (err, params) => {
        message.error(
          `${i18n.t('errormessages:uploadFileApi.502.0')} ${
            params.fileName
          }. ${i18n.t('errormessages:uploadFileApi.502.1')}`,
        );
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:uploadFileApi.default.0')} ${
            params.fileName
          }`,
        );
      },
    },
    [namespace.project.files.uploadRequestFail]: {
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:uploadRequestFail.default.0')} ${
            params.fileName
          }, ${i18n.t('errormessages:uploadRequestFail.default.1')}`,
        );
      },
    },
    [namespace.project.files.combineChunk]: {
      default: (err, params) => {
        message.error(
          i18n.t('errormessages:combineChunks.default.0') + params.fileName,
        );
      },
    },
    [namespace.project.files.getChildrenDataset]: {
      403: (err, params) => {
        message.error(`${i18n.t('errormessages:getChildrenDataset.403.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:getChildrenDataset.500.0')}`);
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:getChildrenDataset.default.0')}`,
        );
      },
    },
    [namespace.project.files.traverseFoldersContainersAPI]: {
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:traverseFoldersContainersAPI.403.0')}`,
        );
      },
      500: (err, params) => {
        message.error(
          `${i18n.t('errormessages:traverseFoldersContainersAPI.500.0')}`,
        );
      },
      404: (err, params) => {
        message.error(
          `${i18n.t('errormessages:traverseFoldersContainersAPI.404.0')}`,
        );
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:traverseFoldersContainersAPI.default.0')}`,
        );
      },
    },
    [namespace.project.files.getFilesByTypeAPI]: {
      403: (err, params) => {
        message.error(`${i18n.t('errormessages:getFilesByTypeAPI.403.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:getFilesByTypeAPI.500.0')}`);
      },
      default: (err, params) => {
        message.error(`${i18n.t('errormessages:getFilesByTypeAPI.default.0')}`);
      },
    },
    [namespace.project.files.downloadFilesAPI]: {
      400: (err, params) => {
        message.error(`${i18n.t('errormessages:downloadFilesAPI.400.0')}`);
      },
      404: (err, params) => {
        message.error(`${i18n.t('errormessages:downloadFilesAPI.404.0')}`);
      },
      403: (err, params) => {
        message.error(`${i18n.t('errormessages:downloadFilesAPI.403.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:downloadFilesAPI.500.0')}`);
      },
      default: (err, params) => {
        message.error(`${i18n.t('errormessages:downloadFilesAPI.default.0')}`);
      },
    },
    [namespace.project.files.processingFile]: {
      default: (err, params) => {
        message.error(`${i18n.t('errormessages:processingFile.default.0')}`);
      },
    },
    [namespace.project.files.preUpload]: {
      403: (err, params) => {
        message.error(i18n.t('errormessages:preUpload.403.0'));
      },
      409: (err, params) => {
        message.error(
          `${i18n.t('errormessages:preUpload.409.0')} ${
            params.fileName
          } ${i18n.t('errormessages:preUpload.409.1')}`,
        );
      },
      500: (err, params) => {
        message.error(i18n.t('errormessages:preUpload.500.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:preUpload.default.0'));
      },
    },
    [namespace.dataset.files.downloadFilesAPI]: {
      400: (err, params) => {
        message.error(
          `${i18n.t('errormessages:downloadDatasetFilesAPI.400.0')}`,
        );
      },
      404: (err, params) => {
        message.error(
          `${i18n.t('errormessages:downloadDatasetFilesAPI.404.0')}`,
        );
      },
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:downloadDatasetFilesAPI.403.0')}`,
        );
      },
      500: (err, params) => {
        message.error(
          `${i18n.t('errormessages:downloadDatasetFilesAPI.500.0')}`,
        );
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:downloadDatasetFilesAPI.default.0')}`,
        );
      },
    },
    [namespace.selfRegister.selfRegistration]: {
      400: (err, params) => {
        message.error(`${i18n.t('errormessages:selfRegistration.400.0')}`);
      },
      401: (err, params) => {
        message.error(`${i18n.t('errormessages:selfRegistration.401.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:selfRegistration.500.0')}`);
      },
      default: (err, params) => {
        message.error(`${i18n.t('errormessages:selfRegistration.default.0')}`);
      },
    },
    [namespace.teams.inviteUser]: {
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:selfRegistration.403.0')} ${
            params.email
          }, ${i18n.t('errormessages:selfRegistration.403.1')}`,
        );
      },
      404: (err, params) => {
        message.error(
          `${i18n.t('errormessages:selfRegistration.404.0')} ${
            params.email
          } ${i18n.t('errormessages:selfRegistration.404.1')}`,
        );
      },
      500: (err, params) => {
        message.error(
          `${i18n.t('errormessages:selfRegistration.500.0')} ${
            params.email
          } ${i18n.t('errormessages:selfRegistration.500.1')}`,
        );
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:inviteUser.500.0')} ${params.email} ${i18n.t(
            'errormessages:inviteUser.500.1',
          )}`,
        );
      },
    },
    [namespace.teams.checkEmailExistAPI]: {
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:checkEmailExistAPI.403.0')} ${
            params.email
          } ${i18n.t('errormessages:checkEmailExistAPI.403.1')}`,
        );
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:checkEmailExistAPI.500.0')}`);
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:checkEmailExistAPI.default.0')}`,
        );
      },
    },
    [namespace.teams.checkUserPlatformRole]: {
      403: (err, params) => {
        message.error(`${i18n.t('errormessages:checkUserPlatformRole.403.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:checkUserPlatformRole.500.0')}`);
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:checkUserPlatformRole.default.0')}`,
        );
      },
    },
    [namespace.teams.addUsertoDataSet]: {
      403: (err, params) => {
        message.error(
          `${params.email} ${i18n.t('errormessages:addUsertoDataSet.403.0')} ${
            params.email
          } ${i18n.t('errormessages:addUsertoDataSet.403.1')}`,
        );
      },
      500: (err, params) => {
        message.error(
          `${i18n.t('errormessages:addUsertoDataSet.500.0')} ${
            params.email
          } ${i18n.t('errormessages:addUsertoDataSet.500.1')}`,
        );
      },
      default: (err, parames) => {
        message.error(i18n.t('errormessages:addUsertoDataSet.default.0'));
      },
    },
    [namespace.teams.changeRoleInDataset]: {
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:changeRoleInDataset.403.0')} ${
            params.name
          }, ${i18n.t('errormessages:changeRoleInDataset.403.1')}`,
        );
      },
      404: (err, params) => {
        message.error(
          `${i18n.t('errormessages:changeRoleInDataset.403.0')} ${
            params.name
          }, ${i18n.t('errormessages:changeRoleInDataset.403.1')}`,
        );
      },
      500: (err, params) => {
        message.error(
          `${i18n.t('errormessages:changeRoleInDataset.500.0')} ${
            params.name
          }, ${i18n.t('errormessages:changeRoleInDataset.500.1')}`,
        );
      },
    },
    [namespace.teams.getUsersOnDataset]: {
      403: (err, params) => {
        message.error(`${i18n.t('errormessages:getUsersOnDataset.403.0')}`);
      },
      404: (err, params) => {
        message.error(`${i18n.t('errormessages:getUsersOnDataset.404.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:getUsersOnDataset.500.0')}`);
      },
    },
    [namespace.teams.removeUserFromDataset]: {
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:removeUserFromDataset.403.0')} ${
            params.username
          } ${i18n.t('errormessages:removeUserFromDataset.403.1')}`,
        );
      },
      404: (err, params) => {
        message.error(`${i18n.t('errormessages:removeUserFromDataset.404.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:removeUserFromDataset.500.0')}`);
      },
    },
    [namespace.teams.restoreUserFromDataset]: {
      403: (err, params) => {
        message.error(
          `${i18n.t('errormessages:removeUserFromDataset.403.0')} ${
            params.username
          } ${i18n.t('errormessages:removeUserFromDataset.403.1')}`,
        );
      },
      404: (err, params) => {
        message.error(`${i18n.t('errormessages:removeUserFromDataset.404.0')}`);
      },
      500: (err, params) => {
        message.error(`${i18n.t('errormessages:removeUserFromDataset.500.0')}`);
      },
    },
    [namespace.common.getDataset]: {
      default: (err, params) => {
        message.error(`${i18n.t('errormessages:getDataset.default.0')}`);
      },
    },
    [namespace.common.listAllContainersPermission]: {
      401: (err, params) => {
        message.error(
          `${i18n.t('errormessages:listAllContainersPermission.401.0')}`,
        );
      },
      404: (err, params) => {
        message.error(
          `${i18n.t('errormessages:listAllContainersPermission.404.0')}`,
        );
      },
      default: (err, params) => {
        message.error(
          `${i18n.t('errormessages:listAllContainersPermission.default.0')}`,
        );
      },
    },
    [namespace.contactUs.contactUsAPI]: {
      401: (err, params) => {
        message.error(
          `${i18n.t('errormessages:contactUsAPI.401.0', {
            SUPPORT_EMAIL: SUPPORT_EMAIL,
          })}`,
        );
      },
      404: (err, params) => {
        message.error(
          `${i18n.t('errormessages:contactUsAPI.404.0', {
            SUPPORT_EMAIL: SUPPORT_EMAIL,
          })}`,
        );
      },
      413: (err, params) => {
        message.error(
          `${i18n.t('errormessages:contactUsAPI.413.0', {
            SUPPORT_EMAIL: SUPPORT_EMAIL,
          })}`,
        );
      },
      default: (err, parames) => {
        message.error(
          `${i18n.t('errormessages:contactUsAPI.default.0', {
            SUPPORT_EMAIL: SUPPORT_EMAIL,
          })}`,
        );
      },
    },

    [namespace.userManagement.inviteUserApi]: {
      400: (err, params) => {
        message.error(
          `${i18n.t('errormessages:inviteUserApi.400.0')} ${
            params.email
          } ${i18n.t('errormessages:inviteUserApi.400.1')}`,
        );
      },
    },
    [namespace.userManagement.getPortalUsers]: {
      400: (err, params) => {
        message.error(`${i18n.t('errormessages:getPortalUsers.400.0')}`);
      },
      default: (err, parames) => {
        message.error(`${i18n.t('errormessages:getPortalUsers.default.0')}`);
      },
    },
    [namespace.userManagement.updateUserStatusAPI]: {
      400: (err, params) => {
        message.error(`${i18n.t('errormessages:updateUserStatusAPI.400.0')}`);
      },
      default: (err, parames) => {
        message.error(
          `${i18n.t('errormessages:updateUserStatusAPI.default.0')}`,
        );
      },
    },
    [namespace.userManagement.getInvitationsAPI]: {
      400: (err, params) => {
        message.error(`${i18n.t('errormessages:getInvitationsAPI.400.0')}`);
      },
      default: (err, parames) => {
        message.error(`${i18n.t('errormessages:getInvitationsAPI.default.0')}`);
      },
    },
    [namespace.userManagement.getServiceRequestAPI]: {
      default: () => {
        message.error(
          `${i18n.t('errormessages:userManagement.getServiceRequestAPI')}`,
        );
      },
    },
    [namespace.announcement.getAnnouncementApi]: {
      default: (err, parames) => {
        message.error(
          i18n.t('errormessages:announcement.getAnnouncementApi.default.0'),
        );
      },
    },
    [namespace.announcement.getUserAnnouncementApi]: {
      default: (err, params) => {
        message.error(
          i18n.t('errormessages:announcement.getUserAnnouncementApi.default.0'),
        );
      },
    },
    [namespace.manifest.getManifestById]: {
      default: (err, parames) => {
        message.error(
          i18n.t('errormessages:getManifestById.default.0') +
            parames.manifestId,
        );
      },
    },
    [namespace.fileExplorer.createFolder]: {
      409: (err, params) => {
        message.error(i18n.t('errormessages:createFolder.409.0'));
      },
      default: (err, params) => {
        message.error(i18n.t('errormessages:createFolder.default.0'));
      },
    },
  };

  this.messageObj = _namespaces[name];
  this.namespace = name;
  if (this.messageObj === undefined) {
    throw new Error(`the namespace doesn't exist`);
  }

  if (!this.messageObj['401']) {
    this.messageObj['401'] = () => {};
  }
}
/**
 * the method to trigger the message
 *
 * @param {string | number} errorCode typically the HTTP status code. you can also define your own under the corresponding namespace.
 * @param {Error} err the error object from axios. If the message needs some arguments, you can get from here.
 * @param {object} params some other useful context. If the message needs some arguments besides err, you can get from here.
 */
ErrorMessager.prototype.triggerMsg = function (errorCode, err, params) {
  if (typeof errorCode !== 'string') {
    errorCode = String(errorCode);
  }
  const messageFunc =
    this.messageObj[errorCode] !== undefined
      ? this.messageObj[errorCode]
      : this.messageObj['default'];
  _.isFunction(messageFunc) && messageFunc(err, params);
  if (
    this.namespace === namespace?.project?.files?.preUpload &&
    parseInt(errorCode) === 409
  ) {
    return;
  }
};
