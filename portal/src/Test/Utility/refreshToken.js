function waitClickRefresh(it,testTitle,getPage){
    it(testTitle,async ()=>{
        const page = getPage();
        await page.waitForSelector('#refresh_modal_refresh',{timeout:6*60*1000});
        await page.waitForTimeout(6000);
        await page.click('#refresh_modal_refresh');
    })
};

module.exports = {waitClickRefresh}