//for  logging
const path = require('path');
const { login } = require('../Utility/login.js');
jest.setTimeout(60000);

describe('File Explorer', () => {
  let page;
  const getPage = () => page;

  beforeAll(async () => {
    page = await context.newPage();
    await page.goto('http://localhost:3000');
    await page.setViewport({ width: 1920, height: 1008 });
  });
  login(it, getPage, 'admin', 'admin');
  it('Sorting File Explorer', async () => {
    await page.goto('localhost:3000/vre/dataset/17/canvas');
    //frist file name text
    let fileName = await page.waitForSelector(
      '.ant-table-row.ant-table-row-level-0 > td:nth-child(2)',
    );

    const text1 = await page.evaluate(
      (element) => element.textContent,
      fileName,
    );

    //selecing table columns from file explorer
    let name = await page.waitForSelector(
      '[class=ant-table-thead]>tr>:nth-child(2)',
    );

    let createdBy = await page.waitForSelector(
      '[class=ant-table-thead]>tr>:nth-child(3)',
    );

    let generate = await page.waitForSelector(
      '[class=ant-table-thead]>tr>:nth-child(4)',
    );

    let created = await page.waitForSelector(
      '[class=ant-table-thead]>tr>:nth-child(5)',
    );

    let fileSize = await page.waitForSelector(
      '[class=ant-table-thead]>tr>:nth-child(6)',
    );

    await name.click({ clickCount: 2 });
    await createdBy.click({ clickCount: 2 });
    await generate.click({ clickCount: 2 });
    await created.click({ clickCount: 2 });
    await fileSize.click({ clickCount: 2 });
    await page.waitFor(9000);

    let fileName2 = await page.waitForSelector(
      '.ant-table-row.ant-table-row-level-0 > td:nth-child(2)',
    );

    const text2 = await page.evaluate(
      (element) => element.textContent,
      fileName2,
    );

    expect(text1).not.toBe(text2);
  });

  it('Auto refreshes', async () => {
    const FILENAME = 'projectList.test.js';
    const GENERATE_ID = `TES-${Math.floor(1000 + Math.random() * 9000)}`;

    const filePath = path.resolve('./src/Test/ProjectList/', FILENAME);

    await page.goto('localhost:3000/vre/dataset/17/canvas');
    await page.waitForSelector('#raw_table_upload');
    await page.$eval('#raw_table_upload', (elem) => elem.click());
    await page.type('#form_in_modal_gid', GENERATE_ID);
    await page.type('#form_in_modal_gid_repeat', GENERATE_ID);
    await page.waitForSelector('#form_in_modal_file');
    const inputUploadHandler = await page.$('#form_in_modal_file');
    inputUploadHandler.uploadFile(filePath);
    await page.waitForSelector('#file_upload_submit_btn');
    await page.$eval('#file_upload_submit_btn', (elem) => elem.click());

    await page.waitForResponse(
      (response) =>
        response.url() ===
          'http://10.3.7.220/vre/api/vre/portal/v1/files/containers/17/files/count/daily?action=all' &&
        response.status() === 200,
    );

    //wait for dom to be updated
    await page.waitFor(2000);

    //get first file name from table
    let fileNamefileExplorer = await page.waitForSelector(
      '.ant-table-row.ant-table-row-level-0 > td:nth-child(2)',
    );

    const text1 = await page.evaluate(
      (element) => element.textContent,
      fileNamefileExplorer,
    );

    expect(`${GENERATE_ID}_${FILENAME}`).toBe(text1);
  });

  it('Upload from differnt pagination and check page number', async () => {
    const FILENAME = 'projectList.test.js';
    const GENERATE_ID = `TES-${Math.floor(1000 + Math.random() * 9000)}`;

    const filePath = path.resolve('./src/Test/ProjectList/', FILENAME);
    await page.goto('localhost:3000/vre/dataset/17/canvas');

    const page2Button = await page.waitForSelector(
      '.ant-pagination.ant-table-pagination.ant-table-pagination-right > li:nth-child(3)',
    );

    await page2Button.click();

    await page.waitForSelector('#raw_table_upload');
    await page.$eval('#raw_table_upload', (elem) => elem.click());
    await page.type('#form_in_modal_gid', GENERATE_ID);
    await page.type('#form_in_modal_gid_repeat', GENERATE_ID);
    await page.waitForSelector('#form_in_modal_file');
    const inputUploadHandler = await page.$('#form_in_modal_file');
    inputUploadHandler.uploadFile(filePath);
    await page.waitForSelector('#file_upload_submit_btn');
    await page.$eval('#file_upload_submit_btn', (elem) => elem.click());

    await page.waitForResponse(
      (response) =>
        response.url() ===
          'http://10.3.7.220/vre/api/vre/portal/v1/files/containers/17/files/count/daily?action=all' &&
        response.status() === 200,
    );

    const page1Button = await page.waitForSelector(
      '.ant-pagination.ant-table-pagination.ant-table-pagination-right > li:nth-child(2)',
    );

    const classActive = await page.evaluate(
      (element) => element.classList,
      page1Button,
    );

    //check by class name if active page in file explorer is 1 after uploading
    expect(Object.values(classActive).pop()).toBe('ant-pagination-item-active');
  });

  it('Check role on Canvas and Teams Page', async () => {
    await page.goto('localhost:3000/vre/dataset/17/canvas', {
      waitUntil: 'networkidle0',
    });

    const subHeading = await page.waitForSelector(
      'span.ant-page-header-heading-sub-title',
    );

    const subHeadingText = await page.evaluate(
      (element) => element.textContent,
      subHeading,
    );

    await page.goto('http://localhost:3000/vre/dataset/17/teams', {
      waitUntil: 'networkidle0',
    });

    const subHeadingTeamsPage = await page.waitForSelector(
      'span.ant-page-header-heading-sub-title',
    );

    const subHeadingTeamsPageText = await page.evaluate(
      (element) => element.textContent,
      subHeadingTeamsPage,
    );

    expect(subHeadingTeamsPageText).toMatch(subHeadingText);
  });

  it('Check Mail to Link', async () => {
    await page.goto('localhost:3000/vre/dataset/17/canvas', {
      waitUntil: 'networkidle0',
    });

    const projectAdminFirst = await page.waitForSelector(
      'div.ant-typography.ant-typography-ellipsis > a',
    );
    //returns firstname lastname,
    const adminText = await page.evaluate(
      (element) => element.textContent,
      projectAdminFirst,
    );

    const hrefAttr = await page.evaluate(
      (element) => element.getAttribute('href'),
      projectAdminFirst,
    );

    //check if shows fist name, last name
    expect(adminText.replace(',', '')).toBe('admin admin');
    //check if attribute is mail to link
    expect(hrefAttr.split(':')[0]).toBe('mailto');
  });
});
