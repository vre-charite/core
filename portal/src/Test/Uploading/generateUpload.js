//const basePath = 'C:\\Users\\combo\\Desktop\\upload-test\\';
const _ = require('lodash');
const path = require('path')
function uploadMultipleFilesGenerate(it, testTitle, getPage, fileNames, basePath) {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();
        const filePaths = fileNames.map(filePath => path.resolve(basePath, 'mojito10\\', filePath));
        await page.waitForSelector('#raw_table_upload');
        await page.$eval('#raw_table_upload', elem => elem.click());
        await page.waitForSelector('#form_in_modal_gid');
        await page.type('#form_in_modal_gid', 'ABC-1234');
        await page.waitForSelector('#form_in_modal_gid_repeat')
        await page.type('#form_in_modal_gid_repeat', 'ABC-1234');
        await page.waitForSelector('#form_in_modal_file');
        const inputUploadHandler = await page.$('#form_in_modal_file');
        inputUploadHandler.uploadFile(...filePaths);
        await page.waitForSelector('#file_upload_submit_btn');
        await page.$eval('#file_upload_submit_btn', elem => elem.click());
    })
}

function gotoGenerate(it,testTitle,getPage,baseUrl){
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle,async ()=>{
        const page = getPage();
        await page.goto(`${baseUrl}/vre/dataset/17/canvas`);
        await expect(page.url()).toMatch(`${baseUrl}/vre/dataset/17/canvas`);
    })
}
module.exports = { uploadMultipleFilesGenerate,gotoGenerate }
