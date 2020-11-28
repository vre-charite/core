const { login } = require('../Utility/login.js');
const { baseUrl } = require('../config');
const path = require('path');

jest.setTimeout(700000);
/*
this test runs as a project admin test
Create a project admin account first
then change the login function username, and password
*/
const USERNAME = 'aprinceprojectadmin';
const PASSWORD = 'ProjectAdmin1!';
const INVITE_USER_EMAIL = `aprince.indoc+adminCanvas${Math.floor(
  1000 + Math.random() * 9000,
)}@gmail.com`;
describe('Admin Canvas', () => {
  let page;
  const getPage = () => page;
  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
  });

  login(it, getPage, USERNAME, PASSWORD);

  it('Project Admin should be edit admin canvas', async () => {
    await page.goto(`${baseUrl}/uploader`);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    await page.waitForSelector(
      '.react-grid-layout > .react-grid-item > .ant-card > .ant-card-body > .ant-btn',
    );
    await page.click(
      '.react-grid-layout > .react-grid-item > .ant-card > .ant-card-body > .ant-btn',
    );

    const projectNameInput = await page.waitForSelector(
      `div.ant-descriptions-view textarea`,
    );

    await projectNameInput.click();

    await projectNameInput.type('Auto test');

    const saveButton = await page.waitForSelector(
      'div.ant-card-body > div > button.ant-btn-primary',
    );

    await saveButton.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/datasets') && response.status() === 200,
    );

    await page.waitForTimeout(9000);
  });

  it('Project Admin can invite user', async () => {
    await page.goto(`${baseUrl}/uploader`);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    const teamIcon = await page.waitForSelector(
      '[aria-label="team"].anticon.anticon-team',
    );

    await teamIcon.click();

    const addUserBtn = await page.waitForSelector(
      'div.ant-page-header-heading>span>button.ant-btn.mb-2.ant-btn-primary',
    );

    await addUserBtn.click();

    const addUserModalOkBtn = await page.waitForSelector(
      'div.ant-modal-footer > div > button:last-child',
    );

    await page.type('#email', INVITE_USER_EMAIL);

    await addUserModalOkBtn.click();

    const confirmOkBtn = await page.waitForSelector(
      'div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary',
    );

    await confirmOkBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/invitations') && response.status() === 200,
    );

    await page.waitForTimeout(3000);
  });

  it('See General Statistics', async () => {
    await page.goto(`${baseUrl}/uploader`);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );
    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),
      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];
    await projecTitle.click();

    const [response] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('count/total'),
      ),
    ]);

    const generalStatistics = await response.json();

    const rawFilesDom = await page.waitForSelector(
      'div.ant-statistic > div.ant-statistic-content > span.ant-statistic-content-value',
    );

    const rawFilesText = await page.evaluate(
      (element) => element.textContent,
      rawFilesDom,
    );

    const processedFilesDom = await page.waitForSelector(
      'div > div.ant-col.ant-col-22 > div:nth-child(2) > div > div:nth-child(2) > div > div.ant-card-body > div:nth-child(2) > div > div.ant-statistic-content > span.ant-statistic-content-value',
    );

    const processedFilesText = await page.evaluate(
      (element) => element.textContent,
      processedFilesDom,
    );

    expect(Number(generalStatistics.result.raw_file_count)).toBe(
      Number(rawFilesText),
    );

    expect(Number(generalStatistics.result.process_file_count)).toBe(
      Number(processedFilesText),
    );

    await page.waitForTimeout(4000);
  });

  it('Admin can see upload activities', async () => {
    await page.goto(`${baseUrl}/uploader`);
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );
    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),
      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];
    await projecTitle.click();

    const FILENAME = 'projectList.test.js';
    const GENERATE_ID = `TES-${Math.floor(1000 + Math.random() * 9000)}`;

    const filePath = path.resolve('./src/Test/ProjectList/', FILENAME);

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
        response.url().includes('/count/daily') && response.status() === 200,
    );

    //wait for dom to be udpated
    await page.waitForTimeout(1000);

    const firstTimelineItem = await page.waitForSelector(
      'div[tabindex="0"] > ul.ant-timeline > li',
    );

    const firstTimelineItemText = await page.evaluate(
      (element) => element.textContent,
      firstTimelineItem,
    );

    const arrUploadTimelineItem = firstTimelineItemText.trim().split(' ');

    expect(arrUploadTimelineItem[0]).toBe(USERNAME);
    expect(arrUploadTimelineItem[1]).toBe('uploaded');
    expect(arrUploadTimelineItem[2]).toBe(`${GENERATE_ID}_${FILENAME}`);

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    const downloadItem = await page.waitForSelector(
      '#files_table > div > div > table > tbody > tr:nth-child(1) span[role=img]',
    );

    await downloadItem.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/file') && response.status() === 200,
    );

    const downloadTab = await page.waitForSelector('#tab-2');

    await downloadTab.click();

    await page.waitForTimeout(4000);

    const downloadLogItem = await page.waitForSelector(
      'div[tabindex="0"] > ul.ant-timeline > li',
    );

    const downloadLogItemText = await page.evaluate(
      (element) => element.textContent,
      downloadLogItem,
    );

    const arrDownloadTimelineItem = downloadLogItemText.trim().split(' ');

    expect(arrDownloadTimelineItem[0]).toBe(USERNAME);
    expect(arrDownloadTimelineItem[1]).toBe('downloaded');
    expect(arrDownloadTimelineItem[2]).toBe(`${GENERATE_ID}_${FILENAME}`);
  });
});
