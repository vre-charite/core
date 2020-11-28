const { clearInput } = require('./inputBox')
/**
 * login
 * @param {*} it
 * @param {*} getPage
 * @param {*} username
 * @param {*} password
 */
function login(it, getPage, username, password) {
  it('login', async () => {
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
    await page.waitForSelector('#header_username');
    const usernameDom = await page.$('#header_username');
    const usernameDomText = await page.evaluate(
      (element) => element.textContent,
      usernameDom,
    );
    await expect(usernameDomText).toMatch(username);
  });
}

async function loginPlain(page, username, password) {
  await clearInput(page, '#normal_login_username');
  await page.type('#normal_login_username', username);
  await clearInput(page, '#normal_login_password');
  await page.type('#normal_login_password', password);
  await page.click('#auth_login_btn');
  await page.waitForSelector('#header_username');
  const usernameDom = await page.$('#header_username');
  const usernameDomText = await page.evaluate(
    (element) => element.textContent,
    usernameDom,
  );
  await expect(usernameDomText).toMatch(username);
}



function logout(it, testTitle, getPage) {
  it(testTitle, async () => {
    const page = getPage();
    await page.waitForSelector("#header_username");
    await page.click('#header_username');
    await page.waitForSelector("#header_logout");
    await page.click('#header_logout');
    await page.waitForSelector('.ant-modal-body .ant-btn.ant-btn-primary');
    await page.click('.ant-modal-body .ant-btn.ant-btn-primary');
    const url = new URL(await page.url());
    console.log(url.pathname);
    await expect(url.pathname === '/vre/' || url.pathname === '/').toBeTruthy();
  });
}

async function logoutPlain(page){
  await page.waitForSelector("#header_username");
    await page.click('#header_username');
    await page.waitForSelector("#header_logout");
    await page.click('#header_logout');
    await page.waitForSelector('.ant-modal-body .ant-btn.ant-btn-primary');
    await page.click('.ant-modal-body .ant-btn.ant-btn-primary');
    const url = new URL(await page.url());
    await expect(url.pathname === '/vre/' || url.pathname === '/').toBeTruthy();
}



module.exports = { login, logout, loginPlain,logoutPlain };
