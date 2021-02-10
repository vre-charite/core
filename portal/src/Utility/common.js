exports.sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

exports.getFileSize = (text) => {
  return text < 1024
    ? text.toString().concat(' B')
    : text < 1024 * 1024
    ? (text / 1024).toFixed(2).toString().concat(' KB')
    : text < 1024 * 1024 * 1024
    ? (text / (1024 * 1024)).toFixed(2).toString().concat(' MB')
    : (text / (1024 * 1024 * 1024)).toFixed(2).toString().concat(' GB');
};

exports.trimString = (str) => {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

exports.currentBrowser = () => {
  let userAgentString = window.navigator.userAgent

  let safariAgent = userAgentString.indexOf("Safari") > -1; 
  let chromeAgent = userAgentString.indexOf("Chrome") > -1; 
  // Discard Safari since it also matches Chrome 
  if ((chromeAgent) && (safariAgent)) safariAgent = false; 

  return safariAgent;
}