const { baseUrl, serverUrl,testFileBasePath } = require('../config');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage, checkErrorMessage } = require('../Utility/errorMessage');
const { login, logout } = require('../Utility/login');
const { clearInput } = require('../Utility/inputBox');
const {clickProject,searchAndClickProject} = require('../ProjectList/clickProject');
const { uploadSingleFile, checkStatus, checkFirstItem } = require('../Uploading/singleUpload');
const { uploadMultipleFiles, checkMultipleStatus } = require('../Uploading/multipleUpload');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
jest.setTimeout(7 * 60 * 1000);

let page;
const moduleName = 'projectGenerate';
const getPage = () => page;

const username = 'admin';
const password = 'admin';
const contributor = 'jzhang';
const contriPassword = 'Indoc1234567!';


const basePath = testFileBasePath;
const testProjectCode = 'testcode5196';
const multipleFilesSubFolder = 'mojito10'

const start = 0; //the start index of the test set
const amount = 12;//amount for each test
const round = 0; // test round
const fileNames = fs.readdirSync(path.resolve(basePath, multipleFilesSubFolder));
const fileNamesBeforeRefresh = fileNames.slice(start + amount * (2 * round), start + amount * (2 * round + 1));

const smallFileName = 'test_Prüfung99999.png';
const largeFileName = '5GB.bin';
jest.setTimeout(20 * 60 * 1000);


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
    login(it,getPage,username,password);
    it('In GENERATE project, admin should be able to see dicom_edit folder as well',async ()=>{
        await searchAndClickProject(page,'generate');
        await page.waitForSelector('span.ant-page-header-heading-sub-title');
        const adminText = await page.$eval('span.ant-page-header-heading-sub-title',span=>span.textContent);
        await expect(adminText).toMatch("Your role is Platform Administrator.");
        const projectCode = await page.$eval('.ant-card-body small',small=>small.textContent.split(':')[1].trim());
        await expect(projectCode).toMatch('generate');

        await page.waitForTimeout(3*1000);
        const treeNodes = await page.$$eval('span.ant-tree-title',spans=>spans.map(item=>item.textContent));
        const isContainDicom = treeNodes.includes('dicomEdit');
        await expect(isContainDicom).toBeTruthy();
    })
    logout(it,'logout after test as admin',getPage);
    login(it,getPage,contributor,contriPassword);
    it('In GENERATE project, contributor should not be able to see dicom_edit folder',async ()=>{
        await searchAndClickProject(page,'generate');
        await page.waitForSelector('span.ant-page-header-heading-sub-title');
        const adminText = await page.$eval('span.ant-page-header-heading-sub-title',span=>span.textContent);
        await expect(adminText).toMatch("Your role is Project Contributor.");
        const projectCode = await page.$eval('.ant-card-body small',small=>small.textContent.split(':')[1].trim());
        await expect(projectCode).toMatch('generate');

        await page.waitForTimeout(3*1000);
        await page.waitForSelector('span.ant-tree-title',{hidden:true});
    });
    uploadSingleFile(it, 'Test small file upload', getPage, smallFileName, basePath,true);
    checkStatus(it, 'Upload status includes: uploading, success, error', getPage, smallFileName);
    checkFirstItem(it, 'Check if File explorer has the uploading item as first item', getPage, smallFileName, expect);

    uploadSingleFile(it, 'Test big file upload > 5GB', getPage, largeFileName,true);
    checkStatus(it, 'Upload status includes: uploading, success, error', getPage, largeFileName);
    checkFirstItem(it, 'Check if File explorer has the uploading item as first item', getPage, largeFileName, expect);

    uploadMultipleFiles(it, 'Upload multiple files(>10)', getPage, fileNamesBeforeRefresh, path.resolve(basePath, multipleFilesSubFolder),true);
    checkMultipleStatus(it, 'Upload status includes: uploading, success, error', getPage, fileNamesBeforeRefresh );
})