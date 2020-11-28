const fs = require('fs');
const path = require('path');
const { login } = require('../Utility/login');
const { uploadSingleFile, checkStatus, checkFirstItem } = require('./singleUpload');
const { uploadMultipleFiles, checkMultipleStatus } = require('./multipleUpload');
const { gotoGenerate, uploadMultipleFilesGenerate } = require('./generateUpload');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
const { waitClickRefresh } = require('../Utility/refreshToken');
const {searchAndClickProject} = require('../ProjectList/clickProject')
const { baseUrl, testFileBasePath } = require('../config');
const moduleName = 'uploading';
const basePath = testFileBasePath;
const testProjectCode = 'firefoxcreation';
const multipleFilesSubFolder = 'mojito10'

const start = 0; //the start index of the test set
const amount = 12;//amount for each test
const round = 0; // test round
const fileNames = fs.readdirSync(path.resolve(basePath, multipleFilesSubFolder));
const fileNamesBeforeRefresh = fileNames.slice(start + amount * (2 * round), start + amount * (2 * round + 1));
const fileNamesAfterRefresh = fileNames.slice(start + amount * (2 * round + 1), start + amount * (2 * round + 2));
console.log(fileNamesBeforeRefresh)
jest.setTimeout(20 * 60 * 1000);

let page;
const getPage = () => page;
const smallFileName = 'test_Prüfung99999.png';
const largeFileName = '5GB.bin';
describe('uploading', () => {
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
            const reduxState = msg.args[1];
            reduxLogger(reduxState);
            screenShotLogger(String(Date.now()))
        })
    })
    login(it, getPage, 'admin', 'admin');
    it('select project', async () => {
        await searchAndClickProject(page,testProjectCode)
       // await page.click(`#uploader_content_${testProjectCode} h4 a`)
    });
    uploadSingleFile(it, 'Test small file upload', getPage, smallFileName, basePath);
    checkStatus(it, 'Upload status includes: uploading, success, error', getPage, smallFileName);
    checkFirstItem(it, 'Check if File explorer has the uploading item as first item', getPage, smallFileName, expect);

    uploadSingleFile(it, 'Test big file upload > 5GB', getPage, largeFileName);
    checkStatus(it, 'Upload status includes: uploading, success, error', getPage, largeFileName);
    checkFirstItem(it, 'Check if File explorer has the uploading item as first item', getPage, largeFileName, expect);

    uploadMultipleFiles(it, 'Upload multiple files(>10)', getPage, fileNamesBeforeRefresh, path.resolve(basePath, multipleFilesSubFolder));
    checkMultipleStatus(it, 'Upload status includes: uploading, success, error', getPage, fileNamesBeforeRefresh);

    waitClickRefresh(it, 'wait and click refresh token', getPage);

    uploadMultipleFiles(it, 'Upload multiple files(>10) after refresh token', getPage, fileNamesAfterRefresh, path.resolve(basePath, multipleFilesSubFolder));
    checkMultipleStatus(it, 'Upload status includes: uploading, success, error', getPage, fileNamesAfterRefresh);

    gotoGenerate(it, 'go to generate project', getPage, baseUrl);
    uploadMultipleFilesGenerate(it, 'Upload multiple files(>10) for GENERATE', getPage, fileNamesBeforeRefresh, path.resolve(basePath, multipleFilesSubFolder));
    checkMultipleStatus(it, 'Upload status includes: uploading, success, error for GENERATE', getPage, fileNamesBeforeRefresh);
})
