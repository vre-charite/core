const { login } = require('../Utility/login.js');

const { baseUrl } = require('../config');
jest.setTimeout(60000);

describe('supportPage', () => {
  let page;
  const getPage = () => page;
  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1366, height: 768 });
  });
  login(it, getPage, 'admin', 'admin');
  it('Able to see Support Drawer', async () => {
    await page.goto(baseUrl);

    await page.click('#root >section > header > ul > li:nth-child(8)');

    await page.waitForSelector(
      'div.ant-drawer.ant-drawer-right.ant-drawer-open.no-mask',
    );

    const supportDrawerTitle = await page.waitForSelector(
      'div.ant-drawer-header',
    );

    const supportTitle = await page.evaluate(
      (element) => element.textContent,
      supportDrawerTitle,
    );

    expect('Support').toBe(supportTitle.trim());

    await page.waitForTimeout(2000);
  });

  it('Support sidebar has PDF link', async () => {
    await page.goto(baseUrl);

    await page.click('#root >section > header > ul > li:nth-child(8)');

    await page.waitForSelector(
      'div.ant-drawer.ant-drawer-right.ant-drawer-open.no-mask',
    );

    const downloadGuideButton = await page.waitForSelector('button a');

    const pdfLink = await page.evaluate(
      (element) => element.getAttribute('href'),

      downloadGuideButton,
    );

    const fileExt = pdfLink.slice(-3);

    expect(fileExt).toBe('pdf');
  });

  it('Support sidebar has contact form', async () => {
    await page.type('#title', 'Test Contact Form title');
    await page.type('#description', 'Testing Contact Form!!!!');

    const contactFormButton = await page.waitForSelector(
      'div.ant-drawer-body > form  button',
    );

    contactFormButton.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/contact') && response.status() === 200,
    );
  });
});
