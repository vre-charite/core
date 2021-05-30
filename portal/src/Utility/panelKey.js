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
