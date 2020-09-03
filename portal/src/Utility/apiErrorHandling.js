const { message } = require("antd");

/**
 * e404,e500,e403,eOthers,eRequest,eNetwork,fe404,fe500,fe403,feOthers,feRequest,feNetwork
 * the params with fe is full error message text. If it's defined, it will override the e params.
 * usage: .catch(apiErrorHandling(errorHandlingObject)) similar to .catch(err=>{})
 * @param {object} param0
 */
function apiErrorHandling({
  e404,
  e500,
  e403,
  eOthers,
  eRequest,
  eNetwork,
  fe404,
  fe500,
  fe403,
  feOthers,
  feRequest,
  feNetwork,
}) {
  return (error) => {
    if (error.response) {
      const { data, status } = error.response;
      console.log(status);
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // Error messages will be printed in `result`.
      if (data.Error) {
        return new Promise((resolve, reject) => reject(error));
      } else {
        const {
          response: {
            config: { baseURL, url },
          },
        } = error;
        switch (status) {
          case 403: {
            if (fe403 || e403) {
              message.error(
                fe403 || "403 Error: you have no permission to " + e403,
              );
            } else {
              message.error("403 Error: " + baseURL + url);
            }
            break;
          }
          case 404: {
            if (fe404 || e403) {
              message.error(fe404 || `404 Error: can not find ${e404}`);
            } else {
              message.error("404 Not Found: " + baseURL + url);
            }
            //

            break;
          }
          case 500: {
            if (fe500 || e500) {
              message.error(
                fe500 || "500 Error: The server encountered an error " + e500,
              );
            } else {
              message.error("Internal Server Error: " + baseURL + url);
            }

            break;
          }
          default: {
            if (status < 200 || status > 300) {
              //
              if (feOthers || eOthers) {
                message.error(feOthers || "Error occurs when " + eOthers);
              } else {
                message.error("Error in API calling: " + baseURL + url);
              }
            }
          }
        }
      }
    } else if (error.request) {
      console.log("TCL: handleApiFailure -> error.request", error.request);
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      message.error(
        feRequest + "Error network: cannot receive a response " + eRequest,
      );
      
    } else {
      // The request has no response nor request -
      // Something happened in setting up the request that triggered an Error
      console.log("handleApiFailure -> error", error);
      message.error(feNetwork && "Error Network: " + eNetwork);
      // If caused by axios canceltoken, it will have an error message.
      /*  if (error.message) {
                      message.error("The input data is invalid");
                  } else {
                      // Else, print the vague message.
                      message.error("The input data is invalid");
                  } */
    }
    return new Promise((resolve, reject) => reject(error));
  };
}

export { apiErrorHandling };
