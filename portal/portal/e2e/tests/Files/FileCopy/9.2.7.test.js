const { login } = require('../../../utils/login.js');
const { init } = require('../../../utils/commonActions.js');
const { selectGreenroomFile } = require('../../../utils/greenroomActions.js');
const { baseUrl } = require('../../../config');
const fs = require('fs');

describe('9.2 File Copy', () => {
  let page;
  const fileName = 'tinified.zip';
  const projectId = 61268;
  jest.setTimeout(700000); //sets timeout for entire test suite

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setCacheEnabled(false);
    await login(page, 'admin');
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
    await init(page);
  });

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('9.2.7 - User should be able to download file from VRE Core', async () => {
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './e2e/downloads',
    });
    await selectGreenroomFile(page, fileName);
    const downloadButton = await page.waitForXPath(
      '//div[contains(@class, "FileExplorer_file_explore_actions")]/descendant::span[contains(text(), "Download")]/parent::button',
    );
    await downloadButton.click();
    await page.waitForTimeout(10000);

    fs.readFileSync(`./e2e/downloads/${fileName}`);
    fs.unlinkSync(`./e2e/downloads/${fileName}`);
  });
});
