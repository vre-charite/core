const { clearInput } = require('../Utility/inputBox');
const _ = require('lodash');
/**
 * 
 * @param {string} oldPassword 
 * @param {string[]} testcases 
 */
async function inValidTest(page, oldPassword, testcases) {
    await clearInput(page, '#basic_password');
    await page.type('#basic_password', oldPassword);
    for (let i = 0; i < testcases.length; i++) {
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', testcases[i]);
        await page.waitForSelector('#basic .ant-form-item-explain div');
        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = 'The password must be between 11-30 characters long and must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character(-_!%&/()=?*+#,.;).';
        await expect(_.includes(explains, explain)).toBeTruthy();
    }
}



module.exports = {inValidTest};