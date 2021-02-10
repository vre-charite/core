const { devServerBaseUrl, devOpServerUrl,testFileBasePath } = require('../config');
const _ = require('lodash');
const http = require('http');
const fs = require('fs');
const path = require('path')
function singleDownload(it, testTitle, getPage, expect) {
    it(testTitle, async () => {
        const page = getPage();
        const url = new URL(page.url());
        const pathName = url.pathname;
        const projectId = pathName.split('/').map(item => parseInt(item)).find(item => !isNaN(item));
        const firstCell = await page.waitForSelector('#files_table tbody tr td:nth-child(2)>div');
        const firstFileName = await page.evaluate(element => element.textContent, firstCell);
        const downloadBtn = await page.waitForSelector('#files_table tbody tr td:last-child .ant-space-item')
        downloadBtn.click();
        const response = await page.waitForResponse(`${devServerBaseUrl}/v1/files/containers/${projectId}/file`);
        const request = response.request();
        const postData = JSON.parse(request.postData());
        await expect(postData.files[0].file).toMatch(firstFileName);
        const responseJson = await response.json();
        const { result } = responseJson;
        const downloadUrl = `${devOpServerUrl}/v1/files/download?token=${result}`;
        const downloadDest = path.resolve(testFileBasePath,firstFileName);
        await downloadFile(downloadUrl,downloadDest);
        await expect(fs.existsSync(downloadDest)).toBeTruthy();
    })
}

function downloadFile(link, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = http.get(link, (response) => {
            if(response.statusCode!==200){
                fs.unlink(dest,()=>{});
                reject(`download status is not 200`);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    resolve();
                });
            });
            file.on('error', (err) => {
                fs.unlink(dest);
                reject();
            });
        })
    })
}

module.exports = {singleDownload}
