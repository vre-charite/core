const pino = require('pino');
const fs = require('fs');
const logFilePath = './src/Test/userAuth/userAuth.log';
const {baseUrl} = require('../config')
fs.openSync(logFilePath, 'w')
const fileLogger = require('pino')(pino.destination(logFilePath))

jest.setTimeout(60000);


describe('userAuth', () => {
    let page;
    beforeAll(async () => {
        page = await context.newPage();
        await page.goto(baseUrl);
        await page.setViewport({ width: 1366, height: 768 });
        page.on('requestfinished', (request) => {
            const info = {
                headers: request.headers(), data: request.postData(),url:request.url(),response:request.response(),failure:request.failure(),
            }
            fileLogger.info(info);
        })
    });
    it('login',async ()=>{
        const username = 'admin';
        await expect(page.title()).resolves.toMatch('Charite VRE');
        await page.waitForSelector('.ant-btn.ant-btn-primary.ant-btn-sm');
        await page.click('.ant-btn.ant-btn-primary.ant-btn-sm');
        await page.type('#normal_login_username', username);
        await page.type('#normal_login_password', 'admin');
        await page.click('#auth_login_btn');
        await page.waitForSelector("#header_username");
        const usernameDom = await page.$("#header_username");
        const usernameDomText = await page.evaluate(element => element.textContent, usernameDom);
        await expect(usernameDomText).toMatch(username);
    })
    it('logout',async ()=>{
        await page.waitForSelector("#header_username");
        await page.click('#header_username');
        await page.waitForSelector("#header_logout");
        await page.click('#header_logout');
        await page.waitForSelector('.ant-modal-body .ant-btn.ant-btn-primary');
        await page.click('.ant-modal-body .ant-btn.ant-btn-primary');
        
        const url = new URL(await page.url());
        console.log(url.pathname);
        await expect(url.pathname==='/vre/'||url.pathname==='/').toBeTruthy();
    });
    it('login with another account',async ()=>{
        const username = 'jzhang';
        const password = 'Indoc1234567!';
        await expect(page.title()).resolves.toMatch('Charite VRE');
        await page.type('#normal_login_username', username);
        await page.type('#normal_login_password', password);
        await page.click('#auth_login_btn');
        await page.waitForSelector("#header_username");
        const usernameDom = await page.$("#header_username");
        const usernameDomText = await page.evaluate(element => element.textContent, usernameDom);
        await expect(usernameDomText).toMatch(username);
    })
});



