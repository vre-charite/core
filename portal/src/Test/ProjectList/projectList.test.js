//for  logging
const pino = require('pino');
const fs = require('fs');
const logFilePath = './src/Test/ProjectList/projectList.log';
const fileLogger = require('pino')(pino.destination(logFilePath));
const { login } = require('../Utility/login.js');
const { toNamespacedPath } = require('path');
jest.setTimeout(60000);

describe('project List', () => {
  let page;
  const getPage = () => page;
  beforeAll(async () => {
    page = await context.newPage();
    await page.goto('http://localhost:3000');
    await page.setViewport({ width: 1366, height: 768 });
  });
  login(it, getPage, 'admin', 'admin');
  it('First Project Should be Generate', async () => {
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();
    const listProjeects = await page.$('.ant-list-items');
    const fistProjecTitle = await page.evaluate(
      (element) => element.textContent.split(' ')[0],
      listProjeects,
    );
    await expect(fistProjecTitle).toMatch('GENERATE');
  });

  it('Display 20 Projects', async () => {
    const pagination = await page.waitForSelector('.ant-select-selector');
    await pagination.click();

    const select20Page = await page.waitForSelector(
      '#uploadercontent_project_list div.ant-list-pagination > ul > li.ant-pagination-options > div > div:nth-child(3) > div > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div',
    );
    await select20Page.click();

    const listProjeects = await page.$('.ant-list-items');
    const listHas20Projects = await page.evaluate(
      (element) => element.childElementCount,
      listProjeects,
    );
    await expect(listHas20Projects).toBe(20);
  });

  it('My Project Highlted', async () => {
    const attr = await page.$$eval('div[role="tab"]', (el) =>
      el.map((x) => {
        return {
          tabIndex: x.getAttribute('tabindex'),
          tabName: x.textContent,
        };
      }),
    );

    //check tabIndex and name
    expect(attr[0].tabIndex).toBe('0');

    expect(attr[0].tabName).toMatch('My Projects');

    console.log(attr);

    //click secondTab
    const tabs = await page.$$('div[role="tab"]');

    await tabs[1].click();

    const attr2 = await page.$$eval('div[role="tab"]', (el) =>
      el.map((x) => {
        return {
          tabIndex: x.getAttribute('tabindex'),
          tabName: x.textContent,
        };
      }),
    );

    //check tabIndex and name
    expect(attr2[1].tabIndex).toBe('0');

    expect(attr2[1].tabName).toMatch('All Projects');

    console.log(attr2);

    // await myProject[1].console.log(myProject);
  });
  it('Check if Inside Project', async () => {
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    const projectAction = await page.$$('.ant-list-item-action');

    await projectAction[0].click();

    //await page.waitForNavigation();

    let checkUrl = await page.evaluate(() => location.href);

    //chcek if url includes part of project url
    const urlTrue = checkUrl.indexOf('/vre/dataset/') > -1 ? true : false;

    expect(urlTrue).toBe(true);

    const projectTitle = await page.$(
      '#root > section > main > section > section > main > div > div.ant-col.ant-col-22 > div.ant-row > div > div.ant-page-header-heading > div > span.ant-page-header-heading-title',
    );

    const text = await page.evaluate(
      (element) => element.textContent,
      projectTitle,
    );

    expect(text).toMatch('Project: GENERATE');
  });

  it('Shows warning message', async () => {
    const warningMessage = await page.$(
      '#root > section > header > div > span.ant-alert-message',
    );

    const text = await page.evaluate(
      (element) => element.textContent,
      warningMessage,
    );

    expect(text).toMatch(
      'This release of the VRE is exclusively for testing purposes by Charité staff.  The upload of files containing clinical and/or research data of any type is strictly forbidden.  By proceeding, you are agreeing to these terms.',
    );
  });
});
