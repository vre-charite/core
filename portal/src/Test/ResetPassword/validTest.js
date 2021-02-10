const {loginPlain,logoutPlain} = require('../Utility/login');
const { clearInput } = require('../Utility/inputBox');
const { checkErrorMessage } = require('../Utility/errorMessage');
const {serverUrl} = require('../config');

async function validTest(page,username,oldPassword,testcases){
    testcases.unshift(oldPassword);
    testcases.push(oldPassword);
    let prePassword;
    let curPassword;
    for(let i=1;i<testcases.length;i++){
        prePassword = testcases[i-1];
        curPassword = testcases[i];
        await loginPlain(page,username,prePassword);
        await page.click('#header_username');
        await page.waitForSelector('#header_reset_password');
        await page.click('#header_reset_password');
        await page.waitForSelector('div.ant-modal-content .ant-modal-title');
        const title = await page.$eval('div.ant-modal-content .ant-modal-title', div => div.textContent);
        await expect(title).toMatch('Reset Password');
        const usernameDom = await page.$eval('#basic_username', input => input.value);
        await expect(usernameDom).toMatch(username);

        await clearInput(page, '#basic_password');
        await page.type('#basic_password', prePassword);
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', curPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', curPassword);
        await page.screenshot({path:`C:\\Users\\combo\\projects\\VRE-portal\\portal\\src\\Test\\Log\\resetPassword\\screenShot\\validTest.png`})
        await page.waitForSelector('#basic .ant-form-item-explain div',{hidden:true});
        await page.click('#reset_password_modal_submit');
        await page.waitForResponse(`${serverUrl}/users/password`);
        const isSuccess = await checkErrorMessage(page, 'Reset password successfully');
        await expect(isSuccess).toBeTruthy();
        await logoutPlain(page);
    };

    await loginPlain(page,username,curPassword);
};

module.exports = {validTest};