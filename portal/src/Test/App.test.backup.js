jest.setTimeout(60000);
const fs = require('fs');
const pino = require('pino');
const logFilePath = './src/Test/request.log';
fs.openSync(logFilePath, 'w')
const fileLogger = require('pino')(pino.destination(logFilePath))

const basePath = 'C:\\Users\\combo\\Desktop\\upload-test\\mojito';
const files = fs.readdirSync(basePath).map(path => basePath + '\\' + path);
let page;
let page2;

describe('VRE', async () => {
    beforeAll(async () => {
        page = await context.newPage();
        await page.goto('http://localhost:3001');
        //await page.setViewport({ width: 1366, height: 768 });
        page.on('requestfinished', (request) => {
            const info = {
                headers: request.headers(), data: request.postData(),url:request.url(),response:request.response(),failure:request.failure(),
            }
            fileLogger.info(info);
        })
    });
    it('VRE', async () => {
        const username = 'jzhang';
        await expect(page.title()).resolves.toMatch('Charite VRE');
        await page.waitForSelector('.ant-btn.ant-btn-primary.ant-btn-sm');
        await page.click('.ant-btn.ant-btn-primary.ant-btn-sm');
        await page.type('#normal_login_username', username);
        await page.type('#normal_login_password', 'Indoc1234567!');
        await page.click('#auth_login_btn');
        await page.waitForSelector("#header_username");
        const usernameDom = await page.$("#header_username");
        const usernameDomText = await page.evaluate(element => element.textContent, usernameDom);
        await expect(usernameDomText).toMatch(username);
        await page.waitForSelector('ul.ant-list-items>li a')
        await page.click('ul.ant-list-items>li a');
        await page.waitForSelector('#raw_table_upload');
        await page.$eval('#raw_table_upload', elem => elem.click());
        await page.waitForSelector('#form_in_modal_file');
        const inputUploadHandler = await page.$('#form_in_modal_file');
        let fileToUpload = files.slice(16, 18);
        inputUploadHandler.uploadFile(...fileToUpload);
        await page.waitForSelector('#file_upload_submit_btn');
        await page.$eval('#file_upload_submit_btn', elem => elem.click());
        await page.waitForSelector('span.ant-tag');
        await page.waitForFunction(selector => Array.from(document.querySelectorAll(selector)).every(item => { return item.textContent === 'Success' || item.textContent === 'Error' }), {}, 'span.ant-tag');
        await page.waitFor(3000)
    });
    it('VRE tab2', async () => {
        page2 = await context.newPage();
        await page2.goto('http://localhost:3001');
        await expect(page2.title()).resolves.toMatch('Charite VRE');
        await page2.waitForSelector('ul.ant-list-items>li a')
        await page2.click('ul.ant-list-items>li a');
        await page2.waitForSelector('#raw_table_upload');
        await page2.$eval('#raw_table_upload', elem => elem.click());
        await page2.waitForSelector('#form_in_modal_file');
        const inputUploadHandler = await page2.$('#form_in_modal_file');
        let fileToUpload = files.slice(18, 20);
        inputUploadHandler.uploadFile(...fileToUpload);
        await page2.waitForSelector('#file_upload_submit_btn');
        const submitBtn = await page2.$('#file_upload_submit_btn');
        await submitBtn.click();
        await page2.waitForFunction(selector => Array.from(document.querySelectorAll(selector)).every(item => { return item.textContent === 'Success' || item.textContent === 'Error' }), {}, 'span.ant-tag');
        await page.waitFor(3000)
    });
});



