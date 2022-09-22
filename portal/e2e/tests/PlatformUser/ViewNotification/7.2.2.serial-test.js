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

const moment = require('moment-timezone');

const { login, logout } = require('../../../utils/login.js');
const { init } = require('../../../utils/commonActions.js');
const {
  createNotification,
  disableNotification,
  navigateToNotifications,
  closeNotificationBanner,
} = require('../../../utils/notificationActions.js');
const { baseUrl } = require('../../../config');

const xBanners =
  '//li[contains(@class, "Notifications_banner-notifications__item")]';

describe('Banners on top of the page after login', () => {
  jest.setTimeout(7000000);
  let page;

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page, { closeBanners: false });
  });

  afterAll(async () => {
    await navigateToNotifications(page);
    await disableNotification(page);
    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('7.2.2a - Banner information should match the information as published', async () => {
    const maintenanceTime = await createNotification(page);

    let banner;
    try {
      banner = await page.waitForXPath(
        `//ul[contains(@class, "Notifications_banner-notifications")]/descendant::p[contains(@class, "Notifications_banner-notifications__time") and contains(text(), "${maintenanceTime}")]`,
        { timeout: 10000 },
      );
    } catch {}

    expect(banner).toBeTruthy();  
  });

  it('7.2.2e - Multiple banners can be stacked but no more than 5 on the page', async () => {
    await page.reload({ waitUntil: 'load' }); // refresh to show banner created in 7.2.1, in case there are no banners
    let banners;
    try {
      await page.waitForXPath(xBanners, { timeout: 5000 });
      banners = await page.$x(xBanners);
    } catch (e) {
      console.log('There are no banners');
    }

    if (banners?.length > 0) {
      if (banners.length > 1) {
        const siblings = await page.$x(
          `(${xBanners})[1]/following-sibling::li[contains(@class, "Notifications_banner-notifications__item")]`,
        );
        expect(siblings.length).toBeTruthy();
        expect(siblings.length + 1).toBe(banners.length);
      }
      expect(banners.length < 6).toBeTruthy();
    } else {
      expect(banners?.length).toBeFalsy();
    }
  });

  it('7.2.2b - Banner time should be displayed in my timezone', async () => {
    const tz = moment.tz.guess();
    const tzAbbr = moment.tz(tz).zoneAbbr();

    let banners;
    try {
      await page.waitForXPath(
        '//p[contains(@class, "Notifications_banner-notifications__time")]',
      );
      banners = await page.$x(
        '//p[contains(@class, "Notifications_banner-notifications__time")]',
      );
    } catch {
      console.log('There are no banners');
    }

    if (banners?.length) {
      const promises = banners.map((banner) =>  
        page.evaluate((banner) => banner.textContent, banner),
      );
      const timeText = await Promise.all(promises);
      const hasCorrectTimezone = timeText.every((item) =>
        item.includes(tzAbbr),
      );
      const hasInvalidDate = timeText.some((item) =>
        item.includes('Invalid Date'),
      );

      expect(hasCorrectTimezone).toBe(true);
      expect(hasInvalidDate).toBe(false);
    } else {
      expect(banners?.length).toBeFalsy();
    }
  });

  it('7.2.2c - Banner could be closed temporarily', async () => {
    const { closedBanner } = await closeNotificationBanner(
      page,
      xBanners,
      '/descendant::span[contains(@aria-label, "close")]/parent::button',
    );

    expect(closedBanner).toBeFalsy();
  });

  it('7.2.2d - Banner could be closed permanently', async () => {
    // logout and login to clear cookies from temporarily closed banner, in case it is the only banner
    await logout(page);
    await login(page, 'admin');

    const { id } = await closeNotificationBanner(
      page,
      xBanners,
      '/descendant::span[contains(text(), "Don\'t show again")]',
    );

    let permClosedBanner;
    try {
      permClosedBanner = await page.waitForXPath(
        `//li[contains(@data-id, '${id}')]`,
        { timeout: 5000 },
      );
    } catch (e) {}

    expect(permClosedBanner).toBeFalsy();
  });
});
