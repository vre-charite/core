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