const { baseUrl, serverUrl } = require('../config');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage, checkErrorMessage } = require('../Utility/errorMessage');
const { login, logout, loginPlain } = require('../Utility/login');
const { clearInput } = require('../Utility/inputBox');
const { inValidTest } = require('./inValidTest');
const { validTest } = require('./validTest');
const errorMessage = require('../../../public/locales/en/formErrorMessages.json');
const successMessage = require('../../../public/locales/en/success.json');
const passwordSuccessMessage = successMessage.resetPassword;
const _ = require('lodash');
const passwordFormatError = errorMessage.common.password.valid;
const sameAsOldPassword = errorMessage.resetPassword.newPassword.valid;
const twoPasswordNotMatch = errorMessage.common.confirmPassword.valid;
jest.setTimeout(7 * 60 * 1000);

let page;
const moduleName = 'resetPassword';
const getPage = () => page;

const username = 'jzhang';
const oldPassword = 'Indoc1234567!';
const newPassword = 'Indoc12345678!';

const invalidTestcases = [
    '1234567-_!%&/()=?*+#,.;',
    'indoc-_!%&/()=?*+#,.;',
    'indoc123456789',
    'INDOC-_!%&/()=?*+#,.;',
    'INDOC123457',
    'INDOCresearch',
    'Indocin1!',
    'INDOC12345!#&()indoc12345Indoc!',
    'Indoc1234567@',
    'Indoc1234567$',
    'Indoc1234567^',
    'Indoc1234567`',
    'Indoc1234567~',
    'Indoc1234567<',
    'Indoc1234567>',
    'Indoc1234567\\',
    'Indoc1234567|',
];

const validTestcases = [
    'Indoc1234567-_!%&/()=?*+#,.;11',
    'Indoc1234567-_!%&/()=?*+#,.;',
    'Indoc12345!',
    'Indoc1234567-_!%&/()=?*+#,.;89',
]
describe('resetPassword', () => {
    beforeAll(async () => {
        page = await context.newPage();
        await page.goto(baseUrl);
        await page.setViewport({ width: 1366, height: 768 });
        const reduxLogger = reduxLog(moduleName);
        const screenShotLogger = screenShot(getPage, moduleName);
        const apiLogger = apiLog(moduleName);
        page.on('requestfinished', (request) => {
            const info = {
                headers: request.headers(),
                data: request.postData(),
                url: request.url(),
                response: request.response(),
                failure: request.failure(),
            };
            apiLogger(info);
        });
        catchErrorMessage(getPage, (msg) => {
            const reduxState = msg[1];
            reduxLogger(reduxState);
            screenShotLogger(String(Date.now()))
        })
    });
    it('new password not follow the password pattern', async () => {
        await loginPlain(page, username, oldPassword);
        await openResetModal(page)
        const usernameDom = await page.$eval('#basic_username', input => input.value);
        await expect(usernameDom).toMatch(username);
        await clearInput(page, '#basic_password');
        await page.type('#basic_password', oldPassword);
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', 'hello');

        await page.waitForSelector('#basic .ant-form-item-explain div');
        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = passwordFormatError;
        await expect(_.includes(explains, explain)).toBeTruthy();

    });

    it('Confirmed new password does not match new password', async () => {
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', newPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', newPassword + 1);

        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = twoPasswordNotMatch;
        await expect(_.includes(explains, explain)).toBeTruthy();
    });

    it('use the previous password as the new password', async () => {
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', oldPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', oldPassword);

        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = sameAsOldPassword;
        await expect(_.includes(explains, explain)).toBeTruthy();
    })

    it('Reset new password and login back with new password', async () => {
        await clearInput(page, '#basic_password');
        await page.type('#basic_password', oldPassword);
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', newPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', newPassword);
        await page.click('#reset_password_modal_submit');
        await page.waitForResponse(`${serverUrl}/users/password`);
        const isSuccess = await checkErrorMessage(page, passwordSuccessMessage);
        await expect(isSuccess).toBeTruthy();
        await page.screenshot({ path: 'C:\\Users\\combo\\projects\\VRE-portal\\portal\\src\\Test\\Log\\resetPassword\\screenShot\\logout.png' })
    })
    logout(it, 'logout after submit form', getPage);
    login(it, getPage, username, newPassword);
    it(`change password back`, async () => {
        await openResetModal(page);
        const usernameDom = await page.$eval('#basic_username', input => input.value);
        await expect(usernameDom).toMatch(username);
        await clearInput(page, '#basic_password');
        await page.type('#basic_password', newPassword);
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', oldPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', oldPassword);
        await page.click('#reset_password_modal_submit');
        await page.waitForResponse(`${serverUrl}/users/password`);
        const isSuccess = await checkErrorMessage(page, passwordSuccessMessage);
        await expect(isSuccess).toBeTruthy();
    });
    it(`test invalid password`, async () => {
        await openResetModal(page);
        await inValidTest(page, oldPassword, invalidTestcases);
        const cancelBtn = await page.waitForSelector('#reset_password_modal_cancel');
        cancelBtn.click();
    })
    logout(it, 'logout after testing invalid password', getPage);
    it(`test the valid password testcases`, async () => {
        await validTest(page, username, oldPassword, validTestcases);
    })
})

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