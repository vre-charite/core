const { baseUrl, serverUrl } = require('../config');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage, checkErrorMessage } = require('../Utility/errorMessage');
const { login, logout } = require('../Utility/login');
const { clearInput } = require('../Utility/inputBox');
const { inValidTest } = require('./inValidTest');
const { validTest } = require('./validTest');

const _ = require('lodash');
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
    login(it, getPage, username, oldPassword);
    it('new password not follow the password pattern', async () => {
        await page.click('#header_username');
        await page.waitForSelector('#header_reset_password');
        await page.click('#header_reset_password');
        await page.waitForSelector('div.ant-modal-content .ant-modal-title');
        const title = await page.$eval('div.ant-modal-content .ant-modal-title', div => div.textContent);
        await expect(title).toMatch('Reset Password');

        const usernameDom = await page.$eval('#basic_username', input => input.value);
        await expect(usernameDom).toMatch(username);
        await clearInput(page, '#basic_password');
        await page.type('#basic_password', oldPassword);
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', 'hello');

        await page.waitForSelector('#basic .ant-form-item-explain div');
        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = 'The password must be 11-30 characters, at least 1 uppercase, 1 lowercase, 1 number and 1 special character(-_!%&/()=?*+#,.;).';
        await expect(_.includes(explains, explain)).toBeTruthy();

    });

    it('Confirmed new password does not match new password', async () => {
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', newPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', newPassword + 1);

        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = 'The two passwords that you entered do not match!';
        await expect(_.includes(explains, explain)).toBeTruthy();
    });

    it('use the previous password as the new password', async () => {
        await clearInput(page, '#basic_newPassword');
        await page.type('#basic_newPassword', oldPassword);
        await clearInput(page, '#basic_newPassword2');
        await page.type('#basic_newPassword2', oldPassword);

        const explains = await page.$$eval('#basic .ant-form-item-explain div', divs => divs.map(item => item.textContent));
        const explain = 'New password can not be the same as the old password';
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
        const isSuccess = await checkErrorMessage(page, 'Reset password successfully');
        await expect(isSuccess).toBeTruthy();
        await page.screenshot({path:'C:\\Users\\combo\\projects\\VRE-portal\\portal\\src\\Test\\Log\\resetPassword\\screenShot\\logout.png'})
    })
    logout(it, 'logout after submit form', getPage);
    login(it, getPage, username, newPassword);
    it(`change password back`, async () => {
        await page.click('#header_username');
        await page.waitForSelector('#header_reset_password');
        await page.click('#header_reset_password');
        await page.waitForSelector('div.ant-modal-content .ant-modal-title');
        const title = await page.$eval('div.ant-modal-content .ant-modal-title', div => div.textContent);
        await expect(title).toMatch('Reset Password');

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
        const isSuccess = await checkErrorMessage(page, 'Reset password successfully');
        await expect(isSuccess).toBeTruthy();
    });
    it(`test invalid password`, async () => {
        await page.click('#header_username');
        await page.waitForSelector('#header_reset_password');
        await page.click('#header_reset_password');
        await page.waitForSelector('div.ant-modal-content .ant-modal-title');
        const title = await page.$eval('div.ant-modal-content .ant-modal-title', div => div.textContent);
        await expect(title).toMatch('Reset Password');
        await inValidTest(page, oldPassword, invalidTestcases);
        const  cancelBtn = await page.waitForSelector('#reset_password_modal_cancel');
        cancelBtn.click();
    })
    logout(it, 'logout after testing invalid password', getPage);
    it(`test the valid password testcases`, async () => {
        await validTest(page, username, oldPassword, validTestcases);
    })
})