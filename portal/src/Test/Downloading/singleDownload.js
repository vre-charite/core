const {devServerBaseUrl} = require('../config');
const _ = require('lodash');
function singleDownload(it,testTitle,getPage,fileName,basePath){
    it(testTitle,async ()=>{
        const page = getPage();
        const url = new URL(page.url());
        const pathName = url.pathname;
        const projectId =  pathName.split('/').map(item=>parseInt(item)).find(item=>!isNaN(item));
        const response = await page.waitForResponse(`${devServerBaseUrl}/v1/files/containers/${projectId}/file`);
    })
}