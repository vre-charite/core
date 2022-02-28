const { admin } = require('../../../users');
const { login } = require('../../../utils/login.js');
const { init } = require('../../../utils/commonActions.js');
const { baseUrl } = require('../../../config');

describe('9.2 File Copy', () => {
  let page;
  const projectId = 61268;
  jest.setTimeout(700000); //sets timeout for entire test suite

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
    await init(page);
  });
  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  beforeEach(async () => {
    await page.setCacheEnabled(false);
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
  });

  it('9.2.9 - user can select file and folder if they are under the same hierarchy', async () => {
    const folderItem = await page.waitForXPath(
      '//div[contains(@class, "FileExplorer_files_raw_table")]/descendant::td/span[contains(@class, "anticon-folder")]/ancestor::tr/descendant::input[contains(@type, "checkbox")]',
    );
    await folderItem.click();

    const fileItem = await page.waitForXPath(
      '//div[contains(@class, "FileExplorer_files_raw_table")]/descendant::td/span[contains(@class, "anticon-file")]/ancestor::tr/descendant::input[contains(@type, "checkbox")]',
    );
    await fileItem.click();

    await page.click('span[aria-label="copy"]');
    const confirmCopy = await page.waitForXPath(
      '//button/span[contains(text(), "Copy to Core")]/parent::button',
    );

    expect(confirmCopy).toBeTruthy();
  });

  it('9.2.10 - the selection of file and folder will be cleared after entering and exiting another folder', async () => {
    const xFolderItem =
      '//div[contains(@class, "FileExplorer_files_raw_table")]/descendant::td/span[contains(@class, "anticon-folder")]/ancestor::tr/descendant::input[contains(@type, "checkbox")]';
    const xFileItem =
      '//div[contains(@class, "FileExplorer_files_raw_table")]/descendant::td/span[contains(@class, "anticon-file")]/ancestor::tr/descendant::input[contains(@type, "checkbox")]';
    const xChecked = '/parent::span[contains(@class, "ant-checkbox-checked")]';
    const xUnchecked =
      '/parent::span[not(contains(@class, "ant-checkbox-checked"))]';

    const folderItem = await page.waitForXPath(xFolderItem);
    const fileItem = await page.waitForXPath(xFileItem);

    await folderItem.click();
    await fileItem.click();

    const isFolderItemChecked = await page.waitForXPath(xFolderItem + xChecked);
    const isFileItemChecked = await page.waitForXPath(xFileItem + xChecked);

    expect(isFolderItemChecked).toBeTruthy();
    expect(isFileItemChecked).toBeTruthy();

    // navigate to another folder
    const folderItemLink = await page.waitForXPath(
      '//div[contains(@class, "FileExplorer_files_raw_table")]/descendant::td/span[contains(@class, "anticon-folder")]/ancestor::tr/descendant::div[contains(@style, "cursor: pointer")]',
    );
    await folderItemLink.click();

    const folderItemName = await page.evaluate(
      (ele) => ele.textContent,
      folderItem,
    );

    await page.waitForXPath(
      `//div[contains(@class, "FileExplorer_file_folder_path")]/descendant::span[contains(text(), '${folderItemName}')]`,
    );
    await page.waitForTimeout(3000);

    // navigate back to root
    const rootFolderLink = await page.waitForXPath(
      `//div[contains(@class, "FileExplorer_file_folder_path")]/descendant::span[contains(text(), '${admin.username}')]`,
    );
    await rootFolderLink.click();

    await page.waitForXPath(
      '//div[contains(@class, "FileExplorer_files_raw_table")]/descendant::td/span[contains(@class, "anticon-folder")]/ancestor::tr/descendant::input[contains(@type, "checkbox")]',
    );

    const isFolderItemUnchecked = await page.waitForXPath(xFolderItem + xUnchecked)
    const isFileItemUnchecked = await page.waitForXPath(xFileItem + xUnchecked);

    expect(isFolderItemUnchecked).toBeTruthy();
    expect(isFileItemUnchecked).toBeTruthy();
  });
});
