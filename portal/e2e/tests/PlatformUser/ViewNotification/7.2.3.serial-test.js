// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

const { login, logout } = require('../../../utils/login.js');
const { baseUrl } = require('../../../config');
const { init } = require('../../../utils/commonActions.js');
const { navigateToNotifications, createNotification, disableNotification } = require('../../../utils/notificationActions.js');

describe('User can access notification list to review published notifications', () => {
  jest.setTimeout(7000000);
  let page;

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(baseUrl);
    await login(page, 'admin');
    await init(page);
  });

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('7.2.3a, 7.2.3b - Clicking a notification item will open up the modal and modal can be closed', async () => {

    // Open modal via notification item
    const bellNotification = await page.waitForXPath(
      '//header/descendant::li[contains(@class, "ant-menu-item")]/descendant::span[contains(@aria-label, "bell")]',
    );
    await bellNotification.click();

    await page.waitForXPath(
      '//ul[contains(@class, "Notifications_notification_container")]',
    );
    const bellItems = await page.$x(
      '//li[contains(@class, "Notifications_bell-item")]',
    );
    await bellItems[0].click();

    await page.waitForXPath('//div[contains(@class, "ant-modal-wrap")]');
    const modal = await page.$x('//div[contains(@class, "ant-modal-content")]');

    // Close Modal
    const closeModalButton = await page.waitForXPath(
      '//button[contains(@class, "maintenance_maintenance-modal__primary-button")]',
    );
    await closeModalButton.click();

    let isModalHidden;
    try {
      isModalHidden = await page.waitForXPath(
        '//div[contains(@class, "ant-modal-mask-hidden")]',
        { timeout: 5000 },
      );
    } catch {}

    expect(modal).toBeTruthy();
    expect(isModalHidden).toBeTruthy();
  });

  it('7.2.3c - User cannot view disabled notification from the notification list', async () => {
    await navigateToNotifications(page);
    await createNotification(page);
    await page.waitForTimeout(5000);

    await disableNotification(page);
    await page.waitForTimeout(2000);

    const bellNotification = await page.waitForXPath(
      '//header/descendant::li[contains(@class, "ant-menu-item")]/descendant::span[contains(@aria-label, "bell")]',
    );
    await bellNotification.click();

    let disabledNotification;
    try {
      disabledNotification = await page.waitForXPath(
        `//ul[contains(@class, "Notifications_notification_container")]/li/p[contains(text(), "${notificationDateValue}")]`,
        { timeout: 5000}
      );
    } catch {}

    expect(disabledNotification).toBeFalsy();
  });
});
