const { clearInput } = require('../Utility/inputBox');
const _ = require('lodash');
const errorMessage = require('../../../public/locales/en/formErrorMessages.json');
const passwordFormatError = errorMessage.common.password.valid
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
        const explain = passwordFormatError;
        await expect(_.includes(explains, explain)).toBeTruthy();
    }
}



module.exports = {inValidTest};