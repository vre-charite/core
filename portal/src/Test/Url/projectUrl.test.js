const { login, logout } = require('../Utility/login.js');

const { baseUrl } = require('../config');
jest.setTimeout(60000);

const projectAdminUsername = 'aprinceprojectadmin';
const projectAdminPassword = 'ProjectAdmin1!';

const projectIdProjectAdminPremission403 = 52;

const contributorUsername = 'aprincecontributor';
const contributorPassword = 'Contributor1!';
const projectIDContributorPremission403 = 52;

describe('ProjectURL', () => {
  let page;
  const getPage = () => page;
  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1366, height: 768 });
  });
  login(it, getPage, 'admin', 'admin');

  it('Test non existing project as site admin', async () => {
    await page.goto(`${baseUrl}/project/00000/canvas
    `);

    await page.waitForNavigation();

    const url = await page.url();

    const urlArr = url.split('/');

    expect(urlArr).toContain('error');
    expect(urlArr).toContain('404');
  });
  logout(it, 'test non exisint poject', getPage);

  login(it, getPage, projectAdminUsername, projectAdminPassword);

  it('Test project for exising project premission as project admin', async () => {
    //note update the project ID here
    await page.goto(`${baseUrl}/project/${projectIdProjectAdminPremission403}/canvas
    `);

    await page.waitForTimeout(4000);

    const url = await page.url();

    const urlArr = url.split('/');

    expect(urlArr).toContain('error');
    expect(urlArr).toContain('403');
  });

  it('Test project for non existing project premission as project admin', async () => {
    //note update the project ID here
    await page.goto(`${baseUrl}/project/00000/canvas
    `);

    await page.waitForTimeout(4000);

    const url = await page.url();

    const urlArr = url.split('/');

    expect(urlArr).toContain('error');
    expect(urlArr).toContain('404');
  });
  logout(it, 'test non exisint poject', getPage);

  login(it, getPage, contributorUsername, contributorPassword);
  it('Test project for non extising project as contributor ', async () => {
    await page.goto(`${baseUrl}/project/0000/canvas
      `);
    await page.waitForTimeout(4000);
    const url = await page.url();
    const urlArr = url.split('/');
    expect(urlArr).toContain('error');
    expect(urlArr).toContain('404');
  });

  it('Test project premission extising project as contributor ', async () => {
    await page.goto(`${baseUrl}/project/${projectIDContributorPremission403}/canvas
      `);
    await page.waitForTimeout(4000);
    const url = await page.url();
    const urlArr = url.split('/');
    expect(urlArr).toContain('error');
    expect(urlArr).toContain('403');
  });

  it('Test project teams page for project as contributor ', async () => {
    await page.goto(`${baseUrl}/uploader`);
    const firstProject = await page.waitForSelector(
      'ul.ant-list-items > li h4 a',
    );

    await firstProject.click();
    await page.waitForTimeout(4000);

    const url = await page.url();

    const teamsPage = String(url.slice().replace('canvas', 'teams'));
    await page.goto(teamsPage);
    await page.waitForTimeout(4000);

    const url2 = await page.url();
    const urlArr = url2.split('/');
    expect(urlArr).toContain('error');
    expect(urlArr).toContain('403');
  });
});
