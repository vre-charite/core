const moment = require('moment-timezone');
const { init } = require('../../../utils/commonActions.js');
const { login, logout } = require('../../../utils/login.js');
const {
  createNotification,
  disableNotification,
  navigateToNotifications,
} = require('../../../utils/notificationActions.js');
const { clearInput } = require('../../../utils/inputBox.js');
const { baseUrl } = require('../../../config');

describe('Before maintenance starts in 10 minutes, modal should popup', () => {
  jest.setTimeout(7000000);
  let page;

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(baseUrl);
    await login(page, 'admin');
    await init(page, { closeBanners: false });

    const inputDate = async (dateSelector, date) => {
      const maintenanceTime = new Date(moment(date).add(11, 'minutes'));
      const newDate = moment(maintenanceTime).format('YYYY-MM-DD HH:mm:ss');

      await clearInput(page, dateSelector);
      await page.type(dateSelector, newDate);
      await page.keyboard.press('Enter');
    };

    await createNotification(page, inputDate);
  });

  afterAll(async () => {
    await navigateToNotifications(page);
    await disableNotification(page);

    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('7.2.4a and 7.2.4b - User can choose to close the modal and continue working or logout immediately', async () => {
    const confirmButton = await page.waitForXPath(
      '//button[contains(@class, "MaintenanceWarningModel_maintenance-modal__ok-button")]',
      { timeout: 120000 },
    );
    const logoutButton = await page.waitForXPath(
        '//button[contains(@class, "MaintenanceWarningModel_maintenance-modal__logout-button")]',
        { timeout: 120000 },
      );

    expect(confirmButton).toBeTruthy();
    expect(logoutButton).toBeTruthy();
  });
});
