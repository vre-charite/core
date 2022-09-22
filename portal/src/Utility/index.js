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

import { fileUpload, uploadStarter } from './fileUpload';
import reduxActionWrapper from './reduxActionWrapper';
import { objectKeysToCamelCase, objectKeysToSnakeCase } from './caseConvert';
import getChildrenTree from './getChildrenTree';
import protectedRoutes from './protectedRoutes';
import { getTags } from './tagsDisplay';
import { validateEmail } from './tokenRefresh';
import {
  sleep,
  getFileSize,
  trimString,
  currentBrowser,
  toFixedNumber,
} from './common';
import {
  useCurrentProject,
  withCurrentProject,
  getCurrentProject,
} from './useCurrentProject';
import { usePrevious } from './usePrevious';
import { resetReduxState } from './resetReduxState';
import { useIsMount } from './useIsMount';
import { validateTag } from './validateTag';
import { formatRole, convertRole } from './roleConvert';
import { convertUTCDateToLocalDate, formatDate, timeConvert, timezone } from './timeCovert';
import { partialString } from './column';
import { displayTitle, nestedLoop } from './fileTree';
import { fileNameOrPathDisplay } from './fileNameOrPathDisplay';
import { getHighlightedText, hightLightCaseInsensitive } from './highlight';

import {
  checkIsVirtualFolder,
  checkUserHomeFolder,
  checkRootFolder,
  checkGreenAndCore,
} from './panelKey';
export { useQueryParams } from './useQueryParams';
export {
  fileUpload,
  uploadStarter,
  reduxActionWrapper,
  objectKeysToCamelCase,
  objectKeysToSnakeCase,
  getChildrenTree,
  protectedRoutes,
  validateEmail,
  useCurrentProject,
  withCurrentProject,
  resetReduxState,
  sleep,
  getFileSize,
  getCurrentProject,
  useIsMount,
  validateTag,
  formatRole,
  convertRole,
  convertUTCDateToLocalDate,
  timeConvert,
  formatDate,
  timezone,
  trimString,
  partialString,
  fileNameOrPathDisplay,
  displayTitle,
  nestedLoop,
  getHighlightedText,
  hightLightCaseInsensitive,
  currentBrowser,
  toFixedNumber,
  checkIsVirtualFolder,
  checkUserHomeFolder,
  checkRootFolder,
  checkGreenAndCore,
  getTags,
  usePrevious,
};
export { randomTxt } from './randomTxt';
export { logout, refresh, login } from './keycloakActions';
export {
  actionType,
  broadcastAction,
  keepAlive,
  debouncedBroadcastAction,
} from './triggerAction';
