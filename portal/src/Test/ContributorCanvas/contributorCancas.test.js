const { login } = require('../Utility/login.js');
const { baseUrl } = require('../config');
const path = require('path');

jest.setTimeout(700000);

const USERNAME = 'aprincecontributor';
const PASSWORD = 'Password123!';

describe('Contributor Canvas', () => {
  let page;
  const getPage = () => page;
  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1008 });
  });

  login(it, getPage, USERNAME, PASSWORD);
  it('Contributor should be able to stats', async () => {
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
        response.url().includes('count/daily'),
      ),
    ]);
    const contributorStatistics = await response.json();

    const uploaderCountDom = await page.waitForSelector(
      'div.ant-statistic-content > span.ant-statistic-content-value > span',
    );

    const uploaderCountText = await page.evaluate(
      (element) => element.textContent,
      uploaderCountDom,
    );

    const contrivutorStatisticsHeader = await page.waitForSelector(
      '#root > section > main > section > section > main > div > div.ant-col.ant-col-22 > div:nth-child(2) > div > div:nth-child(2) > div > div.ant-card-head > div > div.ant-card-head-title',
    );

    const contrivutorStatisticsHeaderText = await page.evaluate(
      (element) => element.textContent,
      contrivutorStatisticsHeader,
    );

    expect(Number(contributorStatistics.result.upload_count)).toBe(
      Number(uploaderCountText),
    );

    expect(contrivutorStatisticsHeaderText.trim()).toBe(
      'Contributor Statistics',
    );
  });

  it('Contributor can see his file in timeline', async () => {
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

    const firstTimelineItem = await page.waitForSelector(
      'ul.ant-timeline > li.ant-timeline-item',
    );

    const firstTimelineItemText = await page.evaluate(
      (element) => element.textContent,
      firstTimelineItem,
    );

    const arrTimelineItem = firstTimelineItemText.trim().split(' ');

    expect(arrTimelineItem[0]).toBe(USERNAME);
    expect(arrTimelineItem[2]).toBe(`${GENERATE_ID}_${FILENAME}`);
  });
  it('Contributor cannot see file tree', async () => {
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
    const antTree = await page.$('div.ant-tree');

    expect(antTree).toBe(null);
    await page.waitForTimeout(8000);
  });
});
