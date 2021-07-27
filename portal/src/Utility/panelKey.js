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