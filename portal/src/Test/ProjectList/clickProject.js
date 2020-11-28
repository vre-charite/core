/**
 * click on the project with project code
 * @param {*} page 
 * @param {*} projectCode the unique project code. if not specified, select the first one
 */
async function clickProject(page,projectCode){
    if(projectCode===undefined){
        const projectDom = await page.waitForSelector('.ant-list-items h4 a');
        projectDom.click();
        return projectDom;
    }
    const projectDom = await page.waitForSelector(`#uploader_content_${projectCode} h4 a`)
    if(projectDom){
        projectDom.click();
    }
    return projectDom;
};

async function searchAndClickProject(page,projectCode){
    let projectDom = null;
    try{
        projectDom = await page.waitForSelector(`#uploader_content_${projectCode} h4 a`,{timeout:10*1000});
        projectDom.click();
    }catch(err){
        console.log(err);
    }
    
    while(await page.$eval('.ant-pagination li[title="Next Page"] button',btn=>!btn.disabled)){
        await page.click('.ant-pagination li[title="Next Page"] button');
        try{
            projectDom = await page.waitForSelector(`#uploader_content_${projectCode} h4 a`,{timeout:5*1000});
        }catch(err){
            console.log(err)
        }
        
        if(projectDom){
            projectDom.click();
            return;
        }
    }
}

module.exports = {clickProject,searchAndClickProject}