exports.sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * convert the size to human readable
 * @param {number} size 
 * @returns 
 */
exports.getFileSize = (size) => {
  return size < 1024
    ? size.toString().concat(' B')
    : size < 1024 * 1024
    ? (size / 1024).toFixed(2).toString().concat(' KB')
    : size < 1024 * 1024 * 1024
    ? (size / (1024 * 1024)).toFixed(2).toString().concat(' MB')
    : (size / (1024 * 1024 * 1024)).toFixed(2).toString().concat(' GB');
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

exports.toFixedNumber = (x) => {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}