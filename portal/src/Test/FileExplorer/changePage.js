const _ = require('lodash');
const {serverUrl} = require('../config')
/**
 * change items/page and pagination index
 * @param {*} it 
 * @param {*} testTitle 
 * @param {*} getPage 
 * @param {number} numberPerPage change items/page
 * @param {number|'Next Page'|'Previous Page'} index jump to 
 */
function changePage(it,testTitle,getPage,numberPerPage,index){
    it(testTitle,async ()=>{
        const page = getPage();
        if(_.isNumber(numberPerPage)){
            const selector = await page.waitForSelector('ul.ant-pagination .ant-select-selector');
            selector.click();
            const dropdowns = await page.waitForSelector('.ant-pagination-options .ant-select-item.ant-select-item-option div');
            const dropDownNum = await page.$$eval('.ant-pagination-options .ant-select-item.ant-select-item-option div',options=>options.map(item=>item.textContent));
            const index = dropDownNum.findIndex(numberPerPage);
            if(index!==-1){
                await page.click(`.ant-pagination-options .ant-select-item.ant-select-item-option:nth-child(${index+1})`);
                await page.waitForTimeout(1500);
            }else{
                console.log(`the number per page doesn't match any option`)
            }
        }
        const parsedIndex = parseInt(index);
        if(index==='Next Page'||index==='Previous Page'){
           await page.click(`.ant-pagination li[title='${index}']`);
        }
        if(!_.isNaN(parsedIndex)){
            try{
                await page.focus('.ant-pagination .ant-pagination-options-quick-jumper');
                await page.type('.ant-pagination .ant-pagination-options-quick-jumper');
                await page.keyboard.press('Enter');
            }catch(err){
                try{
                    await page.click(`.ant-pagination li[title='${parsedIndex}']`)
                }catch(err){
                    console.log(err);
                }
            }
            
        }
    })
};

module.exports = {changePage};