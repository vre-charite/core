const { login, logout } = require('../../../utils/login.js');
const { init } = require('../../../utils/commonActions.js');
const { baseUrl } = require('../../../config');
jest.setTimeout(700000);

const projectId = 60023;

describe('CopyRequest', () => {
  let page;
  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page, { closeBanners: false });
  });
  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });
  it('7.4.1 Project admin should be able to see all past requests and new requests', async () => {
    await page.goto(`${baseUrl}project/${projectId}/requestToCore`);
  });
});
