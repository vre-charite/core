//const basePath = 'C:\\Users\\combo\\Desktop\\upload-test\\';
const _ = require('lodash');
const path = require('path')
function uploadMultipleFiles(it, testTitle, getPage, fileNames, basePath, isGenerate = false, generateId='ABC-1234') {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();
        const filePaths = fileNames.map(filePath => path.resolve(basePath, filePath));
        await page.waitForSelector('#raw_table_upload');
        await page.$eval('#raw_table_upload', elem => elem.click());
        await page.waitForSelector('#form_in_modal_file');
        if (isGenerate) {
            await page.type('#form_in_modal_gid', generateId);
            await page.type('#form_in_modal_gid_repeat', generateId);
        }
        const inputUploadHandler = await page.$('#form_in_modal_file');
        inputUploadHandler.uploadFile(...filePaths);
        await page.waitForSelector('#file_upload_submit_btn');
        await page.$eval('#file_upload_submit_btn', elem => elem.click());
    })
}

/**
 * check if the status first error/uploading, then error/success
 * @param {*} it 
 * @param {*} getPage 
 */
function checkMultipleStatus(it, testTitle, getPage, fileNames) {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();
        await Promise.all(fileNames.map(item => {
            return checkSingleStatus(page, item);
        }))
    })
};

async function checkSingleStatus(page, fileName) {
    await page.waitForSelector(`#upload_item_${_.escapeRegExp(fileName)}`)
    await page.waitForFunction((fileName) => {
        const dom = document.querySelector(`#upload_item_${_.escapeRegExp(fileName)} .ant-tag`);
        if (dom.textContent === 'Error' || dom.textContent === 'Uploading') {
            return true;
        } else {
            return false;
        }

    }, { timeout: 0 }, fileName);
    await page.waitForFunction((fileName) => {
        const dom = document.querySelector(`#upload_item_${_.escapeRegExp(fileName)} .ant-tag`);
        if (dom.textContent === 'Error' || dom.textContent === 'Success') {
            return true;
        } else {
            return false;
        }
    }, { timeout: 0 }, fileName)
    const statusDom = await page.waitForSelector(`#upload_item_${_.escapeRegExp(fileName)} span.ant-tag`);
    const status = await page.evaluate(element => element.textContent, statusDom);
    if (status === 'Success') {
        /*         await page.waitForResponse(response => {
                    const url = new URL(response.url());
                    const pathName = url.pathname;
                    //return pathName.startsWith('/vre/api/vre/portal/v1/files/containers/')&&pathName.endsWith('/files/meta');
                    console.log(pathName);
                    return pathName==='/vre/api/vre/portal/v1/files/containers/425/files/meta'
                },{timeout:0})
                console.log(`${fileName} is uploaded, new table received`) */
        /*  await page.waitForTimeout(5000)
         //const firstCell = await page.waitForSelector('#files_table tbody tr td:nth-child(2)>div');
         //const firstFileName = await page.evaluate(element => element.textContent, firstCell);
         //await expect(fileName).toMatch(firstFileName);
         await page.waitForSelector('#files_table tbody tr');
         await page.waitForFunction((selector,fileName)=>{ 
            const firstPageNames = Array.from(document.querySelectorAll(selector)).map(item=>item.textContent);
            return _.some(firstPageNames,(item)=>item===fileName);
          },{timeout:20*1000},'#files_table tbody tr td:nth-child(2)>div:nth-child(1)',fileName)
         //const firstPageNames = await page.$$eval('#files_table tbody tr td:nth-child(2)>div:nth-child(1)',elements =>elements.map(item=>item.textContent)); */
    }
}

function checkFirstItem(it, testTitle, getPage, fileName, expect) {
    if (!_.isFunction(getPage)) throw new TypeError('getPage should be a function');
    it(testTitle, async () => {
        const page = getPage();

    })
}


module.exports = { checkMultipleStatus, uploadMultipleFiles, checkFirstItem }
