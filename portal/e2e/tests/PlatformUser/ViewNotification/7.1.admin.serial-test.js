const { login, logout } = require('../../../utils/login.js');
const { init, closeAllBanners } = require('../../../utils/commonActions.js');
const {
  navigateToNotifications,
  createNotification,
  disableNotification
} = require('../../../utils/notificationActions.js');
const { baseUrl } = require('../../../config');

describe('Platfrom admin could publish the maintenance notification', () => {
  jest.setTimeout(100000);
  let page;

  async function notificationActions() {
    await closeAllBanners(page, { wait: false });
    await navigateToNotifications(page);
    await createNotification(page);
    await closeAllBanners(page, { wait: false });
  }

  async function notificationCount() {
    let notificationNum;
    const allNotificationList = await page.waitForXPath(
      '//header[contains(@class,"ant-layout-header")]//ul[contains(@class,"Notifications_banner-notifications")]',
    );
    notificationNum = await page.evaluate(
      (element) => element.childElementCount,
      allNotificationList,
    );
    return notificationNum;
  }

  async function getBellTextbefore() {
    let bellTextBefore;
    const bellBefore = await page.waitForXPath(
      '//li[contains(@class, "ant-menu-item")]//span[contains(@class, "anticon-bell")]/following-sibling::span',
    );
    bellTextBefore = await page.evaluate(
      (element) => element.textContent,
      bellBefore,
    );
    return bellTextBefore;
  }

  async function getBellTextAfter() {
    let bellTextAfter;
    const bellAfter = await page.waitForXPath(
      '//li[contains(@class, "ant-menu-item")]//span[contains(@class, "anticon-bell")]/following-sibling::span',
    );
    bellTextAfter = await page.evaluate(
      (element) => element.textContent,
      bellAfter,
    );
    return bellTextAfter;
  }

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page);
  });

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('7.1.1 - In Platform management, there should be User management and Notification two tabs', async () => {
    await page.goto(`${baseUrl}users`);

    const userTabs = await page.waitForXPath(
      '//div[contains(@class, "ant-tabs-tab")]//span[contains(text(), "User Management")]',
    );
    expect(userTabs).not.toBe(null);
    const notificationTabs = await page.waitForXPath(
      '//div[contains(@class, "ant-tabs-tab")]//span[contains(text(), "Notifications")]',
    );
    expect(notificationTabs).not.toBe(null);
  });

  it('7.1.3 & 7.1.4 & 7.1.5 - Platform admin can enter the tab Notification and publish the portal banner notification', async () => {
    await navigateToNotifications(page);
    const bellTextBefore = await getBellTextbefore();
    await createNotification(page);
    await page.waitForResponse(
      (response) =>
        response.url().includes('/notifications') && response.status() === 200,
    );
    await page.waitForTimeout(1000);
    const notificationItem = await page.waitForXPath(
      '//li[contains(@class, "Notifications_banner-notifications__item")]',
    );
    expect(notificationItem).not.toBe(null);
    const bellTextAfter = await getBellTextAfter();
    await disableNotification(page);
    expect(parseInt(bellTextBefore)).toBeLessThan(parseInt(bellTextAfter));
  });
  it('7.1.7 - In Platform admin could publish multiple notifications', async () => {
    await navigateToNotifications(page);
    const bellTextBefore = await getBellTextbefore();
    await createNotification(page);
    await page.waitForResponse(
      (response) =>
        response.url().includes('/notifications') && response.status() === 200,
    );
    await page.waitForTimeout(1000);
    const bellTextAfter = await getBellTextAfter();
    expect(parseInt(bellTextBefore)).toBeLessThan(parseInt(bellTextAfter));
  });
  it('7.1.8 - In Platform admin could review all ongoing and published notifications', async () => {
    const allNotificationList = await page.waitForXPath(
      '//header[contains(@class,"ant-layout-header")]//ul[contains(@class,"Notifications_banner-notifications")]',
    );
    const notificationCount = await page.evaluate(
      (element) => element.childElementCount,
      allNotificationList,
    );
    expect(notificationCount).not.toBe(0);
  });
  it('7.1.9 Platform admin could edit the notification content', async () => {
    await navigateToNotifications(page);
    const notificationItem = await page.waitForXPath(
      '//li[contains(@class, "ant-list-item")]//div[contains(@class, "NotificationList_list-content")]',
    );
    await notificationItem.click();
    const prevMessageContent = await page.waitForXPath(
      '//div[contains(@class, "NoticationInfo_line-one")]//p[contains(@class, "NoticationInfo_line-one__contents")]',
    );
    const prevMessage = await page.evaluate(
      (element) => element.textContent,
      prevMessageContent,
    );
    const editBtn = await page.waitForXPath(
      '//div[contains(@class, "NoticationInfo_notification-header")]//button[contains(@class, "NoticationInfo_notification-header__edit-btn")]',
    );
    await editBtn.click();
    const cancelBtn = await page.waitForXPath(
      '//div[contains(@class, "NoticationInfo_edit-cancel")]//button[contains(@class, "NoticationInfo_edit-cancel__cancel-button")]',
    );
    await cancelBtn.click();
    const currentMessageContent = await page.waitForXPath(
      '//div[contains(@class, "NoticationInfo_line-one")]//p[contains(@class, "NoticationInfo_line-one__contents")]',
    );
    const currentMessage = await page.evaluate(
      (element) => element.textContent,
      currentMessageContent,
    );
    await disableNotification(page);
    expect(prevMessage).toBe(currentMessage);
  });
  it('7.1.10-a - disable notification will take down the banner', async () => {
    await notificationActions();
    const notificationNum = await notificationCount();
    expect(notificationNum).toBe(0);
  });
  it('7.1.10-b - disable notification will remove notification from notification icon', async () => {
    const getNotificationDate = async () => {
      const dateSection = await page.waitForXPath(
        '//div[contains(@class, "NoticationInfo_notification-header__right")]//span[contains(@class, "NoticationInfo_notification-header__right__pubished-date")]',
      );
      const dateInfo = await page.evaluate(
        (element) => element.textContent,
        dateSection,
      );
      return dateInfo;
    }
    await navigateToNotifications(page);
    const dateInfo = await disableNotification(page, getNotificationDate);

    const notificationIcon = await page.waitForXPath(
      '//li[contains(@class, "ant-menu-item")]//span[contains(@class, "anticon-bell")]',
    );
    await notificationIcon.click();
    const notificationIconDate = await page.waitForXPath(
      '//ul[contains(@class, "Notifications_notification_container")]//li[1]//p[contains(text(), "EST")]',
    );
    const notificationIconDateInfo = await page.evaluate(
      (element) => element.textContent,
      notificationIconDate,
    );
    expect(dateInfo).not.toBe(notificationIconDateInfo);
  });
  it('7.1.10-d - the number on the notification should minus 1 when notification disabled', async () => {
    await navigateToNotifications(page);
    await createNotification(page);
    await page.waitForTimeout(5000);
    const bellTextBefore = await getBellTextbefore();
    await disableNotification(page);
    await page.waitForTimeout(1000);
    const bellTextAfter = await getBellTextAfter();
    expect(parseInt(bellTextAfter)).toBe(parseInt(bellTextBefore) - 1);
  });
});
