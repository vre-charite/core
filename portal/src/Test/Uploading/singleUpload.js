const path = require('path');
const _ = require('lodash');

function uploadSingleFile(it, testTitle, getPage, fileName,basePath, isGenerate = false, generateId='ABC-1234') {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();
        const filePath = path.resolve(basePath, fileName);
        await page.waitForSelector('#raw_table_upload');
        await page.$eval('#raw_table_upload', elem => elem.click());
        await page.waitForSelector('#form_in_modal_file');
        if (isGenerate) {
            await page.type('#form_in_modal_gid', generateId);
            await page.type('#form_in_modal_gid_repeat', generateId);
        }
        const inputUploadHandler = await page.$('#form_in_modal_file');
        inputUploadHandler.uploadFile(filePath);
        await page.waitForSelector('#file_upload_submit_btn');
        await page.$eval('#file_upload_submit_btn', elem => elem.click());
    })
}

/**
 * check if the status first error/uploading, then error/success
 * @param {*} it 
 * @param {*} getPage 
 */
function checkStatus(it, testTitle, getPage, fileName) {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();
        await page.waitForSelector(`#upload_item_${fileName.replace('.', '\\.')}`)
        await page.waitForFunction((fileName) => {
            const dom = document.querySelector(`#upload_item_${fileName.replace('.', '\\.')} .ant-tag`);
            if (dom.textContent === 'Error' || dom.textContent === 'Uploading') {
                return true;
            } else {
                return false;
            }

        }, {timeout:0}, fileName);
        await page.waitForFunction((fileName) => {
            const dom = document.querySelector(`#upload_item_${fileName.replace('.', '\\.')} .ant-tag`);
            if (dom.textContent === 'Error' || dom.textContent === 'Success') {
                return true;
            } else {
                return false;
            }
        }, { timeout: 0 }, fileName);
    })
};

function checkFirstItem(it, testTitle, getPage, fileName, expect) {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();
        const statusDom = await page.waitForSelector(`#upload_item_${fileName.replace('.', '\\.')} span.ant-tag`);
        const status = await page.evaluate(element => element.textContent, statusDom);
        if (status === 'Success') {
            await page.waitFor(3000);
            const firstCell = await page.waitForSelector('#files_table tbody tr td:nth-child(2)>div');
            const firstFileName = await page.evaluate(element => element.textContent, firstCell);
            await expect(fileName).toMatch(firstFileName);
        }
    })
}


module.exports = { checkStatus, uploadSingleFile, checkFirstItem }
