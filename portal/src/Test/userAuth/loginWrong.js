const {clearInput} = require('../Utility/inputBox');
const {checkErrorMessage} = require('../Utility/errorMessage');
function loginWrong(it, testTitle, getPage, username, password) {
    it(testTitle, async () => {
        const page = getPage();
        await expect(page.title()).resolves.toMatch('Charite VRE');
        try {
            await page.waitForSelector('.ant-btn.ant-btn-primary.ant-btn-sm', {
                timeout: 3000,
            });
            await page.click('.ant-btn.ant-btn-primary.ant-btn-sm');
        } catch (err) {
            console.log(
                'error: error thrown because no popup for cookie banner',
                err,
            );
        }
        await clearInput(page, '#normal_login_username');
        await page.type('#normal_login_username', username);
        await clearInput(page, '#normal_login_password');
        await page.type('#normal_login_password', password);
        await page.click('#auth_login_btn');
        const isMsgIncluded = await checkErrorMessage(page, 'Please input the correct username and password');
        await expect(isMsgIncluded).toBeTruthy();
        const url = new URL(await page.url());
        await expect(url.pathname === '/vre/' || url.pathname === '/').toBeTruthy();
    })
}

module.exports = { loginWrong };