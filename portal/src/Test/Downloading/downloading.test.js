const {baseUrl,testFileBasePath} = require('../config')
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
const {singleDownload} = require('./singleDownload');
const {login} = require('../Utility/login')
const moduleName = 'downloading';
const testProjectCode = 'testcode5196';
let page;
const getPage = () => page;
jest.setTimeout(20 * 60 * 1000);
describe('downloading',()=>{
    beforeAll(async () => {
        const reduxLogger = reduxLog(moduleName);
        const screenShotLogger = screenShot(getPage, moduleName);
        const apiLogger = apiLog(moduleName);
        page = await context.newPage();
        await page.goto(baseUrl);
        await page.setViewport({ width: 1366, height: 768 });
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
            const reduxState = msg.args[1];
            reduxLogger(reduxState);
            screenShotLogger(String(Date.now()))
        })
    })
    login(it,getPage,'admin','admin');
    it('select project', async () => {
        await page.waitForSelector(`#uploader_content_${testProjectCode}`);
        await page.click(`#uploader_content_${testProjectCode} h4 a`)
    });
    singleDownload(it,'download single File',getPage,expect);
})