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
