import namespace from './namespace';
import { message } from 'antd';
import _ from 'lodash';
/**
 * Create a error message object to trigger the error message
 * @param {string} name the namespace of the API
 */
export default function ErrorMessager(name) {
  const _namespaces = {
    [namespace.landing.createProject]: {
      403: (err, params) => {
        message.error('The project code has been taken');
      },
      default: (err, params) => {
        message.error('something went wrong when creating new project');
      },
    },
    [namespace.login.auth]: {
      401: (err, params) => {
        message.error('Please input the correct username and password');
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to login, please try again later',
        );
      },
      default: (err, params) => {
        message.error(
          'Internal Error occurs when trying to login, please try again later',
        );
      },
    },
    [namespace.login.resetPassword]: {
      400: (err, params) => {
        message.error('Your old password is not correct');
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to reset password, please try again later',
        );
      },
      default: (err, params) => {
        message.error('something wrong when reset password');
      },
    },
    [namespace.login.refresh]: {
      403: (err, params) => {
        message.error('Refresh was forbidden');
      },
      500: (err, params) => {
        message.error(
          'An Internal Error has occurred while attempting to refresh. Please try again later.',
        );
      },
      default: (err, params) => {
        message.error('something wrong when refresh');
      },
    },
    [namespace.login.parseInviteHashAPI]: {
      404: (err, params) => {
        message.error('Sorry, your invitation is not found.');
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to fetch invitation details please try again later',
        );
      },
      default: (err, params) => {
        message.error('something wrong when refresh');
      },
    },
    [namespace.dataset.files.uploadFileApi]: {
      403: (err, params) => {
        message.error(
          `${params.fileName} file already exists within the project.`,
        );
      },
      500: (err, params) => {
        message.error(
          `An Internal Error has occurred while attempting to upload file ${params.fileName}. Please try again later.`,
        );
      },
      502: (err, params) => {
        message.error(
          `An Internal Error has occurred while attempting to upload file ${params.fileName}. Please try again later.`,
        );
      },
      default: (err, params) => {
        message.error(`Something went wrong when uploading ${params.fileName}`);
      },
    },
    [namespace.dataset.files.uploadRequestFail]: {
      default: (err, params) => {
        message.error(`Failed to upload ${params.fileName}, please try again`);
      },
    },
    [namespace.dataset.files.getRawFilesAPI]: {
      403: (err, params) => {
        message.error(
          "Sorry, you don't have access to get raw files from this project",
        );
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to get raw files, please try again later',
        );
      },
      404: (err, params) => {
        message.error(
          `Sorry, Cannot find raw files in project ${params.datasetId}`,
        );
      },
      default: (err, params) => {
        message.error('Something went wrong when getting raw files');
      },
    },
    [namespace.dataset.files.getChildrenDataset]: {
      403: (err, params) => {
        message.error(
          "Sorry, you don't have access to get children dataset from this project",
        );
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to get children dataset, please try again later',
        );
      },
      default: (err, params) => {
        message.error('Something went wrong when getting children dataset');
      },
    },
    [namespace.dataset.files.traverseFoldersContainersAPI]: {
      403: (err, params) => {
        message.error(
          "Sorry, you don't have access to traverse folders in this project",
        );
      },
      500: (err, params) => {
        message.error(
          'An Internal Error has occurred while attempting to traverse folders. Please try again later.',
        );
      },
      404: (err, params) => {
        message.error(
          `Sorry, cannot find the folders in project ${params.datasetId}`,
        );
      },
      default: (err, params) => {
        message.error(
          'An Internal Error has occurred while attempting to traverse folders. Please try again later.',
        );
      },
    },
    [namespace.dataset.files.getFilesByTypeAPI]: {
      403: (err, params) => {
        message.error('You do not have access to retrieve processed files.');
      },
      500: (err, params) => {
        message.error(
          'An Internal Error has occurred while trying to process files. Please try again later.',
        );
      },
      default: (err, params) => {
        message.error(
          'An Internal Error has occurred while trying to process files. Please try again later.',
        );
      },
    },
    [namespace.dataset.files.downloadFilesAPI]: {
      403: (err, params) => {
        message.error(
          'Sorry your access does not permit you to download file(s).',
        );
      },
      500: (err, params) => {
        message.error(
          'An Internal Error has occurred while attempting to download file(s). Please try again later.',
        );
      },
      default: (err, params) => {
        message.error(
          'An Internal Error has occurred while attempting to download file(s). Please try again later.',
        );
      },
    },
    [namespace.dataset.files.processingFile]: {
      default: (err, params) => {
        message.error(
          `failed to process file ${params.fileName}, please upload again later`,
        );
      },
    },
    [namespace.dataset.files.preUpload]: {
      403: (err, params) => {
        message.error(`Sorry, ${params.fileName} cannot be uploaded.`);
      },
      409: (err, params) => {
        message.error(`File ${params.fileName} already exists!`);
      },
      500: (err, params) => {
        message.error(
          `An Internal Error has occurred while attempting to upload file ${params.fileName}. Please try again later.`,
        );
      },
      default: (err, params) => {
        message.error(`Failed to upload ${params.fileName}`);
      },
    },
    [namespace.selfRegister.selfRegistration]: {
      400: (err, params) => {
        message.error(
          'Invalid input. Please ensure all information has been entered correctly and try again.',
        );
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to register, please try again later',
        );
      },
      default: (err, params) => {
        message.error(
          'Internal Error occurs when trying to register, please try again later',
        );
      },
    },
    [namespace.teams.inviteUser]: {
      403: (err, params) => {
        message.error(
          `User ${params.email} was not invited due to an authorization error.`,
        );
      },
      404: (err, params) => {
        message.error(
          `An Internal Error has occurred while inviting ${params.email} to the project. Please try sending an invitation later.`,
        );
      },
      500: (err, params) => {
        message.error(
          'Internal Error occurs when trying to invite user, please try again later',
        );
      },
      default: (err, params) => {
        message.error(
          'Internal Error occurs when trying to invite user, please try again later',
        );
      },
    },
    [namespace.teams.checkEmailExistAPI]: {
      403: (err, params) => {
        message.error(
          `User by email ${params.email} already exists in the project.`,
        );
      },
      500: (err, params) => {
        message.error(
          'An Internal Error occurred while validating user list. Please try again later.',
        );
      },
      default: (err, params) => {
        message.error(
          'An Internal Error occurred while validating user list. Please try again later.',
        );
      },
    },
    [namespace.teams.addUsertoDataSet]: {
      403: (err, params) => {
        message.error(
          `User ${params.email} is already a project member. To modify permissions for ${params.email} please use the user management module. `,
        );
      },
      500: (err, params) => {
        message.error(
          'Internal error when trying add user to project, please try again later',
        );
      },
    },
    [namespace.teams.changeRoleInDataset]: {
      403: (err, params) => {
        message.error(
          `Unable to change role for ${params.name}, please try again later`,
        );
      },
      404: (err, params) => {
        message.error(`User ${params.name} not exist in this project.`);
      },
      500: (err, params) => {
        message.error(
          `An Internal Error occurred while attempting to modify role for user ${params.name}. Please try again later.`,
        );
      },
    },
    [namespace.teams.getUsersOnDataset]: {
      403: (err, params) => {
        message.error(
          `Unable to fetch users on dataset, please try again later`,
        );
      },
      404: (err, params) => {
        message.error(
          `Something went wrong when trying to fetch users on dataset, please try again later`,
        );
      },
      500: (err, params) => {
        message.error(
          'An Internal Error has occurred. Cannot fetch users from dataset. Please try again later.',
        );
      },
    },
    [namespace.teams.removeUserFromDataset]: {
      403: (err, params) => {
        message.error(
          `Removal of user ${params.username} from dataset unsuccessful. Please try again later.`,
        );
      },
      404: (err, params) => {
        message.error(`User ${params.username} not exist in this project.`);
      },
      500: (err, params) => {
        message.error(
          'An Internal Error occurred while attempting to remove user from dataset. Please try again later.',
        );
      },
    },
    [namespace.common.getDataset]: {
      default: (err, params) => {
        message.error('Internal Error: Unable to load projects list');
      },
    },
    [namespace.common.listAllContainersPermission]: {
      401: (err, params) => {
        message.error('Unauthorized to set containers permission');
      },
      404: (err, params) => {
        message.error('Error when trying to set containers permission');
      },
      default: (err, params) => {
        message.error(
          'An Internal Error occurred when trying to set containers permission',
        );
      },
    },
    [namespace.common.emailFileList]: {
      default: (err, params) => {
        message.error('Failed to clean the file upload list');
      },
    },
    [namespace.common.logout]: {
      default: (err, params) => {
        message.error(
          'Internal Error occurs when trying to logout, please try again later',
        );
      },
    },
    [namespace.contactUs.contactUsAPI]: {
      401: (err, params) => {
        message.error('Unauthorized to send a request to admin');
      },
      404: (err, params) => {
        message.error('Error when trying to send a request to admin');
      },
      default: (err, parames) => {
        message.error('Failed sending email to admin.');
      },
    },
  };

  this.messageObj = _namespaces[name];

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
};
