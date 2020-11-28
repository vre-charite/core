const { timeout } = require('async');
const _ = require('lodash');
/**
 * take screen shot when there is an error message excepts file already exist
 * @param {*} getPage 
 * @param {(msg:ConsoleMessage)=>void} callback the callback that when the first console.log msg param is 'error message logging'
 */
function catchErrorMessage(getPage, callback) {
    const page = getPage();
    page.on('console', async msg => {
        const consoleMsgs = await Promise.all(msg.args().map(arg => arg.jsonValue()))
        if (consoleMsgs[0] === 'error message logging') {
            callback(consoleMsgs);
        }
    });
}

/**
 * 
 * @param {string} msg check if this message is shown
 */
async function checkErrorMessage(page,msg){
    await page.waitForSelector('.ant-message .ant-message-notice',{timeout:10*1000});
    const messages = await page.$$eval('.ant-message .ant-message-notice span:nth-child(2)',elems=>elems.map(item=>item.textContent));
    const isMsgIncluded = _.includes(messages,msg);
    return isMsgIncluded;
}

module.exports = {catchErrorMessage,checkErrorMessage}
