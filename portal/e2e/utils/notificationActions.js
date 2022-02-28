const moment = require('moment-timezone');
const { baseUrl } = require('../config');
const { closeAllBanners } = require('./commonActions');

const navigateToNotifications = async (page, { urlNavigate = true } = {}) => {
  if (urlNavigate) {
    await page.goto(`${baseUrl}users`);
  }
   await closeAllBanners(page);
   await page.waitForSelector('#tab-notifications', { timeout: 45000 });
   await page.click('#tab-notifications');
};

const createNotification = async (page, inputDate) => {
  const formatDate = (utc) => {
    const date = new Date(utc);
    if (!isNaN(date)) {
      const t = moment.tz.guess();
      const timezone = moment.tz(t).zoneAbbr();
      utc = moment(date).format('MMMM DD, YYYY - HH:mm') + ' ' + timezone;
    }

    return utc;
  };

  await navigateToNotifications(page);
   
  let createNotificationButton;
  try {
    createNotificationButton = await page.waitForXPath(
      '//span[contains(text(), "Create New Notification")]/parent::button',
    );
  } catch {}

  if ( !createNotificationButton ) {
    const openCreateNewNotification = await page.waitForXPath(
      '//div[contains(@class, "NotificationList_new-notification-listItem")]',
    );
    await openCreateNewNotification.click();
  }

  await page.evaluate((ele) => ele.click(), createNotificationButton); // DOM fires click event instead of having puppeteer mimic interaction. This works well for items that are normally blocked by another element (eg., banners)

  const dateInput = await page.waitForSelector('.ant-form #date');
  let dateValue = await page.evaluate((date) => date.value, dateInput);
  if (typeof inputDate === 'function') {
    await inputDate('.ant-form #date', dateValue);
  } else {
    dateValue = formatDate(dateValue);
  }

  const messageInput = await page.waitForXPath(
    '//div[contains(@class, "NoticationInfo_input1")]//textarea',
  );
  const messageTxt = await page.evaluate(
    (element) => element.value,
    messageInput,
  );
  expect(messageTxt).not.toBe('');
  await messageInput.type('Automation Test - ');

  const duration = '1';
  const durationUnit = 'Hours';
  await page.type('.ant-form #duration', duration);
  await page.click('.ant-form #unit');

  const durationUnitOption = await page.waitForXPath(
    `//div[contains(@class, "ant-select-item-option")]/div[contains(text(), "${durationUnit}")]`,
  );
  await durationUnitOption.click();

  const publish = await page.waitForXPath(
    '//span[contains(text(), "Publish Now")]/parent::button',
  );
  await page.evaluate(ele => ele.click(), publish)

  if (!inputDate) {
    return `${dateValue} - Estimated Duration: ${duration} ${durationUnit[0].toLowerCase()}`;
  }
};

const disableNotification = async (page, evaluate) => {
  const notificationItem = await page.waitForXPath(
    '//li[contains(@class, "ant-list-item")]//div[contains(@class, "NotificationList_list-content")]',
  );
  await notificationItem.click();

  let evalItem;
  if (typeof evaluate === 'function') {
    evalItem = await evaluate();
  }

  const disableBtn = await page.waitForXPath(
    '//div[contains(@class, "NoticationInfo_notification-header")]//button[contains(@class, "ant-btn")]//span[contains(text(), "Disable")]',
  );
  await disableBtn.click();
  const modalDisableBtn = await page.waitForXPath(
    '//div[contains(@class, "ant-modal-footer")]//button[contains(@class, "NoticationInfo_disable-notification-modal__disable-button")]',
  );
  await modalDisableBtn.click();
  await page.waitForResponse(
    (response) =>
      response.url().includes('/notifications?all=true&page_size=1000') &&
      response.status() === 200,
  );

  if (evalItem){
    return evalItem;
  }
}

const closeNotificationBanner = async (page, xBanners, xButton) => {
  let selectedBanner;
  const index = 1;
  try {
    selectedBanner = await page.waitForXPath(`${xBanners}[${index}]`);
  } catch (e) {
    console.log('There are no banner notifications');
  }

  const selectedBannerId = await page.evaluate(
    (ele) => ele?.getAttribute('data-id'),
    selectedBanner,
  );
  const selectedBannerClose = await page.waitForXPath(
    `(${xBanners})[${index}]${xButton}`,
  );

  await page.evaluate((ele) => ele.click(), selectedBannerClose);
  await page.waitForTimeout(2000);

  let closedBanner;
  try {
    // should return null as the banner has been closed
    closedBanner = await page.waitForXPath(
      `//li[contains(@data-id, '${selectedBannerId}')]`,
      { timeout: 2000 },
    );
  } catch (e) {}

  return { closedBanner, id: selectedBannerId };
};

module.exports = {
  createNotification,
  disableNotification,
  closeNotificationBanner,
  navigateToNotifications,
};
