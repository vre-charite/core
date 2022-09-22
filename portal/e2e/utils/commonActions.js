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

const openSupportDrawer = async (page) => {
  const support = await page.waitForXPath('//li[contains(text(), "Support")]');
  await support.click();
  await page.waitForSelector('#support-drawer', { visible: true });
};

const openAndWaitForTarget = async (browser, page, elementHandle) => {
  //save target of original page to know that this was the opener:
  const pageTarget = page.target();
  await elementHandle.click();

  //check that the first page opened this new page:
  const newTarget = await browser.waitForTarget(
    (target) => target.opener() === pageTarget,
  );
  //get the new page object:
  const newPage = await newTarget.page();
  
  return newPage;
};

const closeReleaseNote = async (page, { wait = true } = {}) => {
  if (wait) {
    await page.waitForResponse(
      (response) =>
        response.url().includes('/notifications') && response.status() === 200,
    );
  }
  try {
    const closeModal = await page.waitForXPath(
      '//div[contains(@class, "ant-notification-notice-message")]/b[contains(text(), "Release")]/ancestor::div[contains(@class, "ant-notification-notice")]/descendant::a[contains(@class, "ant-notification-notice-close")]',
      { timeout: 10000, visible: true },
    );
    await closeModal.click();
    await page.waitForTimeout(1000);
  } catch {}
};

const closeAllBanners = async (page, { wait = true } = {}) => {
  if (wait) {
    await page.waitForResponse(
      (response) =>
        response.url().includes('/notifications') && response.status() === 200,
    );
  }
  let bannerLeft = true;
  while (bannerLeft) {
    let bannerLeftBtn;
    try {
      bannerLeftBtn = await page.waitForXPath(
        '//ul[contains(@class, "Notifications_banner-notifications")]//li//button',
        { timeout: 3000 },
      );
      await page.evaluate((ele) => ele.click(), bannerLeftBtn);
      await page.waitForTimeout(100);
    } catch {
      bannerLeft = false;
    }
  }
};

const closeMaintenanceWarning = async (page) => {
  await page.evaluateOnNewDocument(() => {
    setInterval(() => {
      const modalButtons = Array.from(
        document.querySelectorAll('.ant-modal-footer button'),
      );
      if (modalButtons.length) {
        const confirmButton = modalButtons.find(
          (button) => button.textContent === 'OK',
        );
        confirmButton.click();
      }
    }, 15000);
  });
};

const init = async (
  page,
  {
    closeMaintenanceModal = true,
    closeReleaseNoteModal = true,
    closeBanners = true,
  } = {},
) => {
  await page.waitForResponse(
    (response) =>
      response.url().includes('/notifications') && response.status() === 200,
  );
  if (closeMaintenanceModal) {
    await closeMaintenanceWarning(page);
  }
  if (closeReleaseNoteModal) {
    await closeReleaseNote(page, { wait: false });
  }
  if (closeBanners) {
    await closeAllBanners(page, { wait: false });
  }
};

module.exports = {
  init,
  closeReleaseNote,
  closeAllBanners,
  openSupportDrawer,
  openAndWaitForTarget,
};
