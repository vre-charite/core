const { baseUrl } = require('../config');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
const {login}  = require('../Utility/login')
jest.setTimeout(7 * 60 * 1000);

let page;
const moduleName = 'cookieBanner';
const getPage = () => page;
let page2;
const getPage2 = ()=>page2;
describe('cookieBanner', () => {
    beforeAll(async () => {
        page = await context.newPage();
        const context2 = await browser.createIncognitoBrowserContext();
        // Create a new page inside context.
        page2 = await context2.newPage();
        await page2.goto(baseUrl);
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
    it('Cookies banner appears on top right corner', async () => {
        await page.waitForSelector('.ant-notification-notice-message');
        const title = await page.$eval('.ant-notification-notice-message', ele => ele.textContent);
        expect(title).toMatch('Cookies on this site');
    });
    it(`Click ‘click here for details and controls’ will open a detailed page, click ok button cookies banner will disappeared `, async () => {
        const link = await page.waitForSelector('.ant-notification-notice.ant-notification-notice-closable p button');
        link.click();
        await page.waitForSelector('.ant-modal-title');
        const title = await page.$eval('.ant-modal-title', ele => ele.textContent);
        await expect(title).toMatch('Platform Terms of Use Agreement');
        await page.click('.ant-modal-content .ant-btn.ant-btn-primary')
    })
    it(`Click ok button cookies banner will disappeared`, async () => {
        const context = await browser.createIncognitoBrowserContext();
        // Create a new page inside context.
        const page = await context.newPage();
        await page.goto(baseUrl);
        const btn = await page.waitForSelector('.ant-notification-notice.ant-notification-notice-closable .ant-notification-notice-btn button');
        btn.click();
        const dom = await page.waitForSelector('.ant-notification-notice.ant-notification-notice-closable', { hidden: true });
        await expect(Boolean(dom)).toBeFalsy();
    })
    login(it,getPage2,'admin','admin');
    it(`Cookies banner will disappeared after user login`,async ()=>{
        const dom = await page.waitForSelector('.ant-notification-notice.ant-notification-notice-closable', { hidden: true });
        await expect(Boolean(dom)).toBeFalsy();
    })
    it(`Ignore the cookies banner, go to forgot password and click cancel coma back to login page, the number of cookies banner should not increase`, async ()=>{
        const context = await browser.createIncognitoBrowserContext();
        // Create a new page inside context.
        const page = await context.newPage();
        await page.goto(baseUrl);
        const forgetPasswordBtn = await page.waitForSelector('#normal_login a');
        await forgetPasswordBtn.click();
        const url = new URL(await page.url());
        await expect(url.pathname).toMatch('/vre/account-assistant');
        const btn = await page.waitForSelector('#basic button a');
        btn.click();
        const url2 = new URL(await page.url());
        await expect(url2.pathname).toMatch('/vre');
        await page.waitForSelector('.ant-notification-notice.ant-notification-notice-closable');
        const notifs = await page.$$('.ant-notification-notice.ant-notification-notice-closable');
        await expect(notifs).toHaveLength(1);
    })
})