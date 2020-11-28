jest.setTimeout(700000);
const { login } = require('../Utility/login.js');
const { devServerBaseUrl, baseUrl } = require('../config');
describe('Invite User Site Admin', () => {
  let page;
  const getPage = () => page;

  const EMAIL = `aprince.indoc+autotest${Math.floor(
    1000 + Math.random() * 9000,
  )}@gmail.com`;

  const USERNAME = `autotest${Math.floor(1000 + Math.random() * 9000)}`;
  const FIRSTNAME = `autotest`;
  const LASTNAME = `autotest`;
  const PASSWORD = `Autotest123!`;

  beforeAll(async () => {
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1008 });
  });

  login(it, getPage, 'admin', 'admin');

  it('add user not in platform and self register', async () => {
    //Go to first project created
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    await page.goto(`${baseUrl}/project/${projectId}/teams`);

    await page.waitForTimeout(2000);

    const addUserBtn = await page.waitForSelector(
      'div.ant-page-header-heading>span>button.ant-btn.mb-2.ant-btn-primary',
    );

    await addUserBtn.click();

    await page.type('#email', EMAIL);

    const addUserModalOkBtn = await page.waitForSelector(
      'div.ant-modal-footer > div > button:last-child',
    );

    await addUserModalOkBtn.click();

    const confirmOkBtn = await page.waitForSelector(
      'div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary',
    );

    await confirmOkBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/invitations') && response.status() === 200,
    );

    console.log('New user Test Email', EMAIL);

    await page.waitForSelector('#header_username');
    await page.click('#header_username');
    await page.waitForSelector('#header_logout');
    await page.click('#header_logout');
    await page.waitForSelector('.ant-modal-body .ant-btn.ant-btn-primary');
    await page.click('.ant-modal-body .ant-btn.ant-btn-primary');

    //NOTE: You need to get your link from email user and paste on the on url on the page to proceed
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
      timeout: 400000,
    });

    await page.type('#username', USERNAME);
    await page.type('#firstName', FIRSTNAME);
    await page.type('#lastName', LASTNAME);
    await page.type('#password', PASSWORD);
    await page.type('#confirmPassword', PASSWORD);

    const toSCheckBox = await page.waitForSelector(
      '.ant-checkbox-wrapper>span:nth-child(2)>a:nth-child(1)',
    );

    await toSCheckBox.click();

    const tosDiv = await page.waitForSelector(
      'div.ant-modal-body > div:nth-child(1)',
    );

    //scroll page to bottom to have accept enabled
    await page.evaluate((element) => {
      element.scrollBy(0, 9999);
    }, tosDiv);

    await page.waitForTimeout(2000);

    const acceptButton = await page.waitForSelector(
      'button.ant-btn:nth-child(2)',
    );

    await acceptButton.click();

    const submitForm = await page.waitForSelector('.ant-btn.ant-btn-primary');

    await submitForm.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/users/new') && response.status() === 200,
    );
  });
  login(it, getPage, 'admin', 'admin');

  it('Check if add user with empty email shows error', async () => {
    await page.goto(baseUrl);
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    await page.goto(`${baseUrl}/project/${projectId}/teams`);

    const addUserBtn = await page.waitForSelector(
      'div.ant-page-header-heading>span>button.ant-btn.mb-2.ant-btn-primary',
    );

    await addUserBtn.click();

    const addUserModalOkBtn = await page.waitForSelector(
      'div.ant-modal-footer > div > button:last-child',
    );

    await addUserModalOkBtn.click();

    const errorMessage = await page.waitForSelector('div.ant-message');

    const errorMessageText = await page.evaluate(
      (element) => element.textContent,
      errorMessage,
    );

    expect(errorMessageText).toBe('Please input email!');
  });
  it('Add user already in project', async () => {
    await page.goto(baseUrl);

    //Go to first project created
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    await page.goto(`${baseUrl}/project/${projectId}/teams`);

    const addUserBtn = await page.waitForSelector(
      'div.ant-page-header-heading>span>button.ant-btn.mb-2.ant-btn-primary',
    );

    await addUserBtn.click();

    const addUserModalOkBtn = await page.waitForSelector(
      'div.ant-modal-footer > div > button:last-child',
    );

    await page.type('#email', 'siteadmin.test@vre.com');

    await addUserModalOkBtn.click();

    await page.waitForTimeout(4000);

    const errorMessage = await page.waitForSelector('div.ant-message');

    const expectErrorMessage =
      'User siteadmin.test@vre.com is already a project member. To modify permissions for siteadmin.test@vre.com please use the user management module.';

    const errorMessageText = await page.evaluate(
      (element) => element.textContent,
      errorMessage,
    );

    expect(errorMessageText.trim()).toBe(expectErrorMessage);
  });

  it('Change user role in project', async () => {
    await page.goto(baseUrl);

    //Go to first project created
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    await page.goto(`${baseUrl}/project/${projectId}/teams`);

    const changeRole = await page.waitForSelector(
      'tbody>tr:first-child > td:last-child a',
    );

    await changeRole.click();

    await page.evaluate(() => {
      document.querySelector('#teams_role_dropdown > li:last-child').click();
    });

    const confirmOkBtn = await page.waitForSelector(
      'div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary',
    );

    await confirmOkBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/users') && response.status() === 200,
    );
  });
  //Note : only username with autotest can be deleted
  it('Remove user from project', async () => {
    await page.goto(baseUrl);

    //Go to first project created
    const btn = await page.waitForSelector('#uploadercontent_dropdown');
    await btn.click();
    const btn2 = await page.waitForSelector('#uploadercontent_first_created');
    await btn2.click();

    //wait for dom to be updated
    await page.waitForTimeout(2000);

    const projecTitle = await page.waitForSelector(
      'h4.ant-list-item-meta-title>div>a',
    );

    const projectUrl = await page.evaluate(
      (element) => element.getAttribute('href'),

      projecTitle,
    );
    const projectId = projectUrl.split('/')[3];

    await projecTitle.click();

    await page.goto(`${baseUrl}/project/${projectId}/teams`);

    const removeButton = await page.waitForSelector(
      'tbody>tr:first-child> td:last-child > div > div:last-child',
    );

    await removeButton.click();

    const modalContent = await page.waitForSelector(
      'div.ant-modal-confirm-content',
    );

    const modalContentText = await page.evaluate(
      (element) => element.textContent,
      modalContent,
    );

    //Note : this removes extra modal text, and removes numbers from username to check if username is autotest to ensure it can be deleted
    const getUserName = modalContentText
      .replace('Are you sure delete user ', '')
      .replace('?', '')
      .replace(/[0-9]/g, '');

    expect(getUserName).toBe('autotest');

    const removeOkBtn = await page.waitForSelector(
      'div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary',
    );

    removeOkBtn.click();

    await page.waitForResponse(
      (response) =>
        response.url().includes('/users') && response.status() === 200,
    );
  });
});
