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
        'error: error thrown because no popup for cookie burron',
        err,
      );
    }
    await page.type('#normal_login_username', username);
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

module.exports = { login };
