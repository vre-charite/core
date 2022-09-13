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
const { init } = require('../../../utils/commonActions.js');
const { admin } = require('../../../users');
const { baseUrl } = require('../../../config');
const {
  navigateToCore,
  copyAction,
  findUserFolderDestination,
  selectGreenroomFile,
  fileName,
  folderName,
} = require('../../../utils/greenroomActions.js');

describe('9.1 Manual Copy Workflow', () => {
  let page;
  const projectId = 61268;
  jest.setTimeout(700000); //sets timeout for entire test suite

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page);
  });

  beforeEach(async () => {
    await page.setCacheEnabled(false);
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
  });

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  it('9.1.1 - Only project admin should be able to see the file copy button - "Copy to Core"', async () => {
    const projectId = 61390;
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
    let adminCopyButton = await page.waitForSelector('span[aria-label="copy"]');
    expect(adminCopyButton).toBeTruthy();

    await logout(page);
    await login(page, 'collaborator');
    await page.goto(`${baseUrl}project/${projectId}/canvas`);

    let collabCopyButton;
    try {
      collabCopyButton = await page.waitForSelector('span[aria-label="copy"]', {
        timeout: 5000,
      });
    } catch {}
    expect(collabCopyButton).toBeFalsy();

    await logout(page);
    await login(page, 'admin');
  });

  it('9.1.2 - Both the files in greenroom home and files located inside folders have "Copy to Core" button', async () => {
  // add upload file and delete file
    await selectGreenroomFile(page, fileName);
    const copyButton = await page.waitForSelector('span[aria-label="copy"]');
    expect(copyButton).toBeTruthy();

    const selectFolder = await page.waitForXPath(
      `//tr[contains(@class, 'ant-table-row')]/descendant::span[contains(text(), '${folderName}')]`,
    );
    await selectFolder.click();
    await selectGreenroomFile(page, fileName);
    const folderCopyButton = await page.waitForSelector(
      'span[aria-label="copy"]',
    );
    expect(folderCopyButton).toBeTruthy();
  });

  it('9.1.3 - File cannot be uploaded to VRE core folder', async () => {
    await navigateToCore(page);
    await page.waitForTimeout(3000);
    let uploadButton;
    try {
      uploadButton = await page.waitForXPath('//div[contains(@class, "ant-tabs-tabpane") and not(contains(@style, "visibility: hidden"))]/descendant::span[contains(text(), "Upload")]/parent::button', { timeout: 7500 })
    } catch {}
    expect(uploadButton).toBeFalsy();
  });

  it('9.1.4, 9.1.5 - File copy to core requires code input confirmation and modal should have title "Copy to Core" and description detailing files being copied to core', async () => {
    await selectGreenroomFile(page, fileName);
    await copyAction(page);
    await findUserFolderDestination(page, admin.username);
    const [selectFolder] = await page.$x(
      '//span[contains(text(), "Select")]/parent::button',
    );
    await selectFolder.click();

    const confirmButton = await page.waitForXPath(
      '//span[contains(text(), "Confirm")]/parent::button',
    );
    await confirmButton.click();
    const verificationCodeMessage = await page.waitForXPath(
      '//div[contains(@class, "Copy2Core_copy_to_core_modal")]/descendant::span[contains(text(), "*Enter code")]',
    );
    expect(verificationCodeMessage).toBeTruthy();

    const modalHeader = await page.waitForXPath('//div[contains(@class, "Copy2Core_copy_to_core_modal")]/descendant::div[contains(@class, "ant-modal-header")]/descendant::span[contains(text(), "Copy to Core")]');
    expect(modalHeader).toBeTruthy();

    const fileDestinationDescription = await page.waitForXPath(
      `//div[contains(@class, "Copy2Core_copy_to_core_modal")]/descendant::p[contains(text(), "Selected file(s) will be copied to")]/following-sibling::p[contains(text(), 'Core / ${admin.username}')]`,
    );
    expect(fileDestinationDescription).toBeTruthy();
  });
});
