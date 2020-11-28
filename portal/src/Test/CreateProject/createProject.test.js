const path = require('path');
const { baseUrl } = require('../config');
const { login } = require('../Utility/login.js');
const { checkErrorMessage } = require('../Utility/errorMessage');
jest.setTimeout(30 * 1000);

describe('Create Project', () => {
  let page;
  const getPage = () => page;

  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1008 });
  });

  const DESC = `test desc`;

  login(it, getPage, 'admin', 'admin');

  it('Create Project Successfully', async () => {
    const PROJECT_CODE = `testcode${Math.floor(1000 + Math.random() * 9999)}`;
    const PROJECT_NAME = `testproject${Math.floor(
      1000 + Math.random() * 9999,
    )}`;
    await page.goto(`${baseUrl}/uploader`);

    const createPrjectonBtn = await page.waitForSelector(
      'aside.ant-layout-sider>div>ul>li',
    );

    await createPrjectonBtn.click();

    await page.type('#create_dataset_code', PROJECT_CODE);
    await page.type('#create_dataset_name', PROJECT_NAME);

    await page.type('#create_dataset_description', DESC);

    const submitCreateProjectBtn = await page.waitForSelector(
      'div.ant-modal-footer>div>:nth-child(2)',
    );

    await submitCreateProjectBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/datasets') && response.status() === 200,
    );

    //wait for dom to be updated
    await page.waitFor(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title',
    );

    const projectNameText = await page.evaluate(
      (element) => element.textContent,
      projecTitle,
    );

    expect(`${PROJECT_NAME}`).toBe(projectNameText.trim());
  });

  it.skip('Create Project Successfully after refresh modal', async () => {
    const PROJECT_CODE = `testcode${Math.floor(1000 + Math.random() * 9999)}`;
    const PROJECT_NAME = `testproject${Math.floor(
      1000 + Math.random() * 9999,
    )}`;
    await page.goto(`${baseUrl}/uploader`);
    const refreshModalBtn = await page.waitForSelector(
      '#refresh_modal_refresh',
      {
        timeout: 700000,
      },
    );

    const createPrjectonBtn = await page.waitForSelector(
      'aside.ant-layout-sider>div>ul>li',
    );

    await refreshModalBtn.click();

    await page.waitForTimeout(3000);

    await createPrjectonBtn.click();

    await page.type('#create_dataset_code', PROJECT_CODE);

    await page.type('#create_dataset_name', PROJECT_NAME);

    await page.type('#create_dataset_description', DESC);

    const submitCreateProjectBtn = await page.waitForSelector(
      'div.ant-modal-footer>div>:nth-child(2)',
    );

    await submitCreateProjectBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/datasets') && response.status() === 200,
    );

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title',
    );

    const projectNameText = await page.evaluate(
      (element) => element.textContent,
      projecTitle,
    );

    expect(`${PROJECT_NAME}`).toBe(projectNameText.trim());
  });

  it(`Create project with existing project code`, async () => {
    await page.waitForSelector(
      'ul.ant-list-items li .ant-list-item-meta-description span',
    );
    //get an existing project code
    const projectCode = await page.$eval(
      'ul.ant-list-items li .ant-list-item-meta-description span',
      (span) => span.textContent.split(':')[1].trim(),
    );
    const PROJECT_NAME = `testproject${Math.floor(
      1000 + Math.random() * 9999,
    )}`;

    await page.goto(`${baseUrl}/uploader`);

    const createPrjectonBtn = await page.waitForSelector(
      'aside.ant-layout-sider>div>ul>li',
    );

    await page.waitForTimeout(3000);

    await createPrjectonBtn.click();

    await page.type('#create_dataset_code', projectCode);

    await page.type('#create_dataset_name', PROJECT_NAME);

    await page.type('#create_dataset_description', DESC);

    const submitCreateProjectBtn = await page.waitForSelector(
      '.ant-modal-footer .ant-btn.ant-btn-primary',
      { visible: true },
    );
    await submitCreateProjectBtn.click();
    //wait for the request get a 403
    await page.waitForResponse(
      (response) =>
        response.url().includes('/datasets') && response.status() === 403,
    );
    //wait for error message shown
    await checkErrorMessage(page, 'The project code has been taken');
  });

  it('Upload file after creating Project', async () => {
    const PROJECT_CODE = `testcode${Math.floor(1000 + Math.random() * 9999)}`;
    const PROJECT_NAME = `testproject${Math.floor(
      1000 + Math.random() * 9999,
    )}`;
    await page.goto(`${baseUrl}/uploader`);

    const createPrjectonBtn = await page.waitForSelector(
      'aside.ant-layout-sider>div>ul>li',
    );

    await createPrjectonBtn.click();

    await page.type('#create_dataset_code', PROJECT_CODE);
    await page.type('#create_dataset_name', PROJECT_NAME);

    await page.type('#create_dataset_description', DESC);

    const submitCreateProjectBtn = await page.waitForSelector(
      'div.ant-modal-footer>div>:nth-child(2)',
    );

    await submitCreateProjectBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/datasets') && response.status() === 200,
    );

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    await projecTitle.click();

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    const FILENAME = 'projectList.test.js';
    const filePath = path.resolve('./src/Test/ProjectList/', FILENAME);
    await page.waitForSelector('#raw_table_upload');
    await page.$eval('#raw_table_upload', (elem) => elem.click());
    await page.waitForSelector('#form_in_modal_file');
    const inputUploadHandler = await page.$('#form_in_modal_file');
    inputUploadHandler.uploadFile(filePath);

    await page.click('#file_upload_submit_btn');

    await page.waitForResponse(
      (response) =>
        response.url().includes('action=all') && response.status() === 200,
    );

    //get first file name from table
    let fileNamefileExplorer = await page.waitForSelector(
      '.ant-table-row.ant-table-row-level-0 > td:nth-child(2)',
    );

    const fileNameText = await page.evaluate(
      (element) => element.textContent,
      fileNamefileExplorer,
    );

    expect(FILENAME).toBe(fileNameText);
  });
});
