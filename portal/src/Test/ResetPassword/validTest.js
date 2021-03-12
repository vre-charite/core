const { loginPlain, logoutPlain } = require('../Utility/login');
const { clearInput } = require('../Utility/inputBox');
const { checkErrorMessage } = require('../Utility/errorMessage');
const { serverUrl } = require('../config');
const successMessage = require('../../../public/locales/en/success.json');
const passwordSuccessMessage = successMessage.resetPassword;
async function validTest(page, username, oldPassword, testcases) {
    testcases.unshift(oldPassword);
    testcases.push(oldPassword);
    let prePassword;
    let curPassword;
    for (let i = 1; i < testcases.length; i++) {
        prePassword = testcases[i - 1];
        curPassword = testcases[i];
        await loginPlain(page, username, prePassword);
        await openResetModal(page);
        const usernameDom = await page.$eval('#basic_username', input => input.value);
        await expect(usernameDom).toMatch(username);

        await clearInput(page, '#basic_password');
        await page.type('#basic_password', prePassword);
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', curPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', curPassword);
        await page.screenshot({ path: `C:\\Users\\combo\\projects\\VRE-portal\\portal\\src\\Test\\Log\\resetPassword\\screenShot\\validTest.png` })
        await page.waitForSelector('#basic .ant-form-item-explain div', { hidden: true });
        await page.click('#reset_password_modal_submit');
        await page.waitForResponse(`${serverUrl}/users/password`);
        const isSuccess = await checkErrorMessage(page, passwordSuccessMessage);
        await expect(isSuccess).toBeTruthy();
        await logoutPlain(page);
    };

    await loginPlain(page, username, curPassword);
};

async function openResetModal(page) {
    const headerUsernameBtn = await page.waitForSelector('#header_username');
    if (headerUsernameBtn) {
        await page.$eval("#header_username", ele => { ele.click() })
    }
    //await headerUsernameBtn.click();
    const resetPasswordBtn = await page.waitForSelector('#header_reset_password');
    if (resetPasswordBtn) {
        await page.$eval("#header_reset_password", ele => { ele.click() })
    }
    //await page.click('#header_reset_password');
    await page.waitForSelector('div.ant-modal-content .ant-modal-title');
    const title = await page.$eval('div.ant-modal-content .ant-modal-title', div => div.textContent);
    await expect(title).toMatch('Reset Password');
    await page.$$eval('.anticon-eye-invisible', (eles) => { eles.forEach(item => { item.click() }) });
}

module.exports = { validTest };