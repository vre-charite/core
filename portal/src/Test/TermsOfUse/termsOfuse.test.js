const { baseUrl } = require('../config');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
const { login } = require('../Utility/login')
jest.setTimeout(7 * 60 * 1000);

let page;
const moduleName = 'termsOfUse';
const getPage = () => page;

describe(moduleName, () => {
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
            screenShotLogger(String(Date.now()))
        })
    });
    it('Terms of Use could be opened by click ‘Terms of Use’ button on the login page', async () => {
        const btn = await page.waitForSelector('.ant-btn.ant-btn-link small');
        btn.click();
        await page.waitForSelector('.ant-modal-header',{visible:true});
        const title = await page.$eval('.ant-modal-header div',div=>div.textContent);
        await expect(title).toMatch('Platform Terms of Use Agreement');
    })
})