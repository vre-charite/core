const { FILE } = require('dns');
const path = require('path');
const { devServerBaseUrl, baseUrl } = require('../config');
const { login } = require('../Utility/login.js');
jest.setTimeout(700000);

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
    await page.goto(`${baseUrl}/vre/uploader`);

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
        response.url() === `${devServerBaseUrl}/v1/datasets/` &&
        response.status() === 200,
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

  it('Create Project Successfully after refresh modal', async () => {
    const PROJECT_CODE = `testcode${Math.floor(1000 + Math.random() * 9999)}`;
    const PROJECT_NAME = `testproject${Math.floor(
      1000 + Math.random() * 9999,
    )}`;
    await page.goto(`${baseUrl}/vre/uploader`);
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

    await page.waitFor(3000);

    await createPrjectonBtn.click();

    await page.waitFor(10000);

    await page.type('#create_dataset_code', PROJECT_CODE);

    await page.type('#create_dataset_name', PROJECT_NAME);

    await page.type('#create_dataset_description', DESC);

    const submitCreateProjectBtn = await page.waitForSelector(
      'div.ant-modal-footer>div>:nth-child(2)',
    );

    await submitCreateProjectBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url() === `${devServerBaseUrl}/v1/datasets/` &&
        response.status() === 200,
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

  it('Upload file after creating Project', async () => {
    const PROJECT_CODE = `testcode${Math.floor(1000 + Math.random() * 9999)}`;
    const PROJECT_NAME = `testproject${Math.floor(
      1000 + Math.random() * 9999,
    )}`;
    await page.goto(`${baseUrl}/vre/uploader`);

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
        response.url() === `${devServerBaseUrl}/v1/datasets/` &&
        response.status() === 200,
    );

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    await projecTitle.click();

    const projectId = page.url().split('/')[5];

    const FILENAME = 'projectList.test.js';
    const filePath = path.resolve('./src/Test/ProjectList/', FILENAME);
    await page.waitForSelector('#raw_table_upload');
    await page.$eval('#raw_table_upload', (elem) => elem.click());
    await page.waitForSelector('#form_in_modal_file');
    const inputUploadHandler = await page.$('#form_in_modal_file');
    inputUploadHandler.uploadFile(filePath);
    await page.waitForSelector('#file_upload_submit_btn');
    await page.$eval('#file_upload_submit_btn', (elem) => elem.click());

    await page.waitForResponse(
      (response) =>
        response.url() ===
          `${devServerBaseUrl}/v1/files/containers/${projectId}/files/count/daily?action=all` &&
        response.status() === 200,
    );

    await page.waitForTimeout(2000);

    //get first file name from table
    let fileNamefileExplorer = await page.waitForSelector(
      '.ant-table-row.ant-table-row-level-0 > td:nth-child(2) > div',
    );

    const fileNameText = await page.evaluate(
      (element) => element.textContent,
      fileNamefileExplorer,
    );

    expect(FILENAME).toBe(fileNameText);
  });
});
