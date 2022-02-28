const { login, logout } = require('../../../utils/login.js');
const { baseUrl } = require('../../../config');

describe('Platform member should not be able to access the notification page', () => {
  jest.setTimeout(50000);
  let page;

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'collaborator');
  });

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('7.2.1 - 404 page displayed instead of notification page for platform member', async () => {
    await page.goto(`${baseUrl}/users`);
    const url = await page.url();

    expect(url.includes('404')).toBe(true);
  });
});
