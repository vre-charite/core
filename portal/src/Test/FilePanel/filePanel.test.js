const { baseUrl,testFileBasePath } = require('../config');
const path = require('path');
const fs = require('fs');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
const { login } = require('../Utility/login');
const { checkMultipleStatus, uploadMultipleFiles } = require('../Uploading/multipleUpload');
const {clickProject} = require('../ProjectList/clickProject')
const _ = require('lodash');
jest.setTimeout(7 * 60 * 1000);

let page;
const moduleName = 'filePanel';
const getPage = () => page;
const username = 'admin';
const password = "admin";
let fileStatus;
const fileNames = fs.readdirSync(path.resolve(testFileBasePath, 'mojito10'));
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
    login(it, getPage,username, password);
    it(`click into the first project`, async ()=>{
        clickProject(page)
    })
    uploadMultipleFiles(it, 'upload files to test file panel', getPage, fileNames.slice(2,4), path.resolve(testFileBasePath, 'mojito10'));
    checkMultipleStatus(it, 'check all uploaded files', getPage, fileNames.slice(2,4));
    it(`check file status after refreshing page`, async () => {
        fileStatus = await page.$$eval('h4.ant-list-item-meta-title', eles => eles.map(item => {
            const fileName = item.lastChild.textContent;
            const status = item.querySelector('span').textContent;
            return { status, fileName };
        }));
        await page.reload({"waitUntil":'networkidle0'});
        await page.waitForSelector('h4.ant-list-item-meta-title');
        const currentFileStatus = await page.$$eval('h4.ant-list-item-meta-title', eles => eles.map(item => {
            const fileName = item.lastChild.textContent;
            const status = item.querySelector('span').textContent;
            return { status, fileName };
        }));
        await expect(fileStatus.length).toBe(currentFileStatus.length);
        const equalArr = [];
        if(fileStatus.length===currentFileStatus){
            for(let i=0;i<fileStatus.length;i++){
                equalArr[i] = _.isEqual(fileStatus[i],currentFileStatus[i]);
            }
        }
        await expect(_.every(equalArr)).toBeTruthy();
    });
    it(`check file panel empty after clean and refresh`,async ()=>{
        await page.$eval(`#file_panel_upload button`,btn=>{btn.click()});
        await page.waitFor(5*1000)
        await page.reload({"waitUntil":'networkidle0'});
        const currentFileStatus = await page.$$eval('h4.ant-list-item-meta-title', eles => eles.map(item => {
            const fileName = item.lastChild.textContent;
            const status = item.querySelector('span').textContent;
            return { status, fileName };
        }));
        await expect(currentFileStatus).toHaveLength(0);
    })
})