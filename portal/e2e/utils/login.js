// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

const { admin, collaborator } = require('../users');
const { clearInput } = require('./inputBox');
const dotenv = require('dotenv');
/**
 * login
 * @param {*} getPage
 */

dotenv.config();
async function login(page, role) {
  const username = role === 'admin' ? admin.username : collaborator.username;
  const password = role === 'admin' ? admin.password : collaborator.password;

  try {
    await page.waitForSelector('.ant-btn.ant-btn-primary.ant-btn-sm', {
      timeout: 3000,
    });
    await page.click('.ant-btn.ant-btn-primary.ant-btn-sm');
  } catch (err) {
    console.log('no popup for cookie banner');
  }

  await page.waitForSelector('#auth_login_btn');
  await page.click('#auth_login_btn');

  await page.type('#username', username);
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

async function logout(page) {
  const headerUsernameBtn = await page.waitForSelector('#header_username');
  if (headerUsernameBtn) {
    await page.$eval('#header_username', (ele) => {
      ele.click();
    });
  }
  const headerLogoutBtn = await page.waitForSelector('#header_logout');
  if (headerLogoutBtn) {
    await page.$eval('#header_logout', (ele) => {
      ele.click();
    });
  }
  await page.waitForSelector('.ant-modal-body .ant-btn.ant-btn-primary');
  await page.click('.ant-modal-body .ant-btn.ant-btn-primary');

  await page.waitForTimeout(2500);
  const url = new URL(await page.url());
  const pathname =
    process.env.REACT_APP_TEST_ENV === 'dev'
      ? url.pathname === process.env.REACT_APP_PORTAL_PATH || url.pathname === '/'
      : url.pathname === process.env.REACT_APP_PORTAL_PATH ||
        url.pathname === process.env.REACT_APP_PORTAL_PATH + '/login';
  await expect(pathname).toBeTruthy();
}

module.exports = { login, logout };
