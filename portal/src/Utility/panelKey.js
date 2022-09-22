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

/**
 *
 * @param {string} panelKey the current open panel key
 * @returns {boolean} true if the current panel is a virtual folder
 */
export const checkIsVirtualFolder = (panelKey) => {
  if (!panelKey) {
    return false;
  }
  return !(
    panelKey.includes('trash') ||
    panelKey.startsWith('greenroom') ||
    panelKey.startsWith('core')
  );
};

export const checkUserHomeFolder = (tabPanelKey) => {
  return tabPanelKey === 'greenroom-home' || tabPanelKey === 'core-home';
};

export const checkRootFolder = (tabPanelKey) => {
  return tabPanelKey === 'greenroom' || tabPanelKey === 'core';
};

export const checkGreenAndCore = (tabPanelKey) => {
  return checkUserHomeFolder(tabPanelKey) || checkRootFolder(tabPanelKey);
};