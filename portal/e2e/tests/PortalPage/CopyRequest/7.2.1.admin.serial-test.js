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

const { login, logout } = require('../../../utils/login.js');
const { init } = require('../../../utils/commonActions.js');
const { baseUrl, mailHogHost, mailHogPort } = require('../../../config');
jest.setTimeout(700000);
const mailhog = require('mailhog')({
  host: mailHogHost,
  port: mailHogPort,
});

describe('CopyRequest', () => {
  let page;
  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './e2e/downloads',
    });
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page, { closeBanners: false });
  });
  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });
  it('7.2.1 All project admins could receive email notification with correct information including project code, username and user email', async () => {
    const adminEmail = 'jzhang@indocresearch.org';
    const result = await mailhog.messages(0, 10);
    const emailConfirmation = result.items.find((item) => {
      const hasEmail = item.from.replace(/\+/g, '').includes(adminEmail);
      const hasSubject = item.subject
        .replace(/_/g, ' ')
        .toLowerCase()
        .includes('a new request to copy data');

      if (hasEmail && hasSubject) {
        return item;
      }
    });
    expect(emailConfirmation).toBeTruthy();
    await mailhog.deleteMessage(emailConfirmation.ID);
  });
});
