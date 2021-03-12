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
    //await expect(page.title()).resolves.toMatch('Charite VRE');
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

    const loginBtn = await page.waitForSelector('#auth_login_btn')
    loginBtn.click();

    try {
      const usernameInput = await page.waitForSelector('input');
    } catch (err) {
      console.log(err)
    }

    await clearInput(page, '#username');
    await page.type('#username', username);
    await clearInput(page, '#password');
    await page.type('#password', password);
    await page.click('#kc-login');


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

  await page.click('#auth_login_btn');

  try {
    const usernameInput = await page.waitForSelector('#username');
  } catch (err) {
    console.log(err)
  }

  await clearInput(page, '#username');
  await page.type('#username', username);
  await clearInput(page, '#password');
  await page.type('#password', password);
  await page.click('#kc-login');


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
    await logoutPlain(page);
  });
}

async function logoutPlain(page) {
  const headerUsernameBtn = await page.waitForSelector('#header_username');
  if (headerUsernameBtn) {
    await page.$eval("#header_username", ele => { ele.click() })
  }
  const headerLogoutBtn = await page.waitForSelector('#header_logout');
  if (headerLogoutBtn) {
    await page.$eval("#header_logout", ele => { ele.click() })
  }
  await page.waitForSelector('.ant-modal-body .ant-btn.ant-btn-primary');
  await page.click('.ant-modal-body .ant-btn.ant-btn-primary');
  const url = new URL(await page.url());
  await expect(url.pathname === '/vre/' || url.pathname === '/').toBeTruthy();
}



module.exports = { login, logout, loginPlain, logoutPlain };
