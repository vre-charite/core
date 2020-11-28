const { baseUrl } = require('../config');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
jest.setTimeout(7 * 60 * 1000);

let page;
const moduleName = 'bannerForRelease';
const getPage = () => page;

describe('bannerForRelease', () => {
  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1366, height: 768 });
    const reduxLogger = reduxLog(moduleName);
    const screenShotLogger = screenShot(getPage, moduleName);
    const apiLogger = apiLog(moduleName);
    page.on('requestfinished', (request) => {
      const info = {
        headers: request.headers(),
        data: request.postData(),
        url: request.url(),
        response: request.response(),
        failure: request.failure(),
      };
      apiLogger(info);
    });
    catchErrorMessage(getPage, (msg) => {
      const reduxState = msg[1];
      reduxLogger(reduxState);
      screenShotLogger(String(Date.now()));
    });
  });
  it('Banner appears on top of the page indicate that VRE release is for testing purpose', async () => {
    await page.waitForSelector(
      '.ant-alert.ant-alert-warning .ant-alert-message',
    );
    const text =
      'This release of the VRE is exclusively for testing purposes. The upload of files containing clinical and/or research data of any type is strictly forbidden. By proceeding, you are agreeing to these terms.';
    const textDom = await page.$eval(
      '.ant-alert.ant-alert-warning .ant-alert-message',
      (span) => span.innerText,
    );
    await expect(textDom).toMatch(text);
  });
});
