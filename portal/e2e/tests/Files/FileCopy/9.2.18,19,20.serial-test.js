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

const { login } = require('../../../utils/login.js');
const { init } = require('../../../utils/commonActions.js');
const { admin } = require('../../../users');
const { baseUrl } = require('../../../config');
const {
  fileName,
  coreFolderName,
  selectGreenroomFile,
  selectUserFolderDestination,
  coreSubFolderName,
} = require('../../../utils/greenroomActions.js');

// this is a serialized test that depends on the large copy serial test on deleting all folders except Test Folder in core
describe('9.2 File Copy', () => {
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

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  beforeEach(async () => {
    await page.setCacheEnabled(false);
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
  });

  it('9.2.18 - User should select destination when copying files/folder otherwise an error message should display', async () => {
    await selectGreenroomFile(page, fileName);

    await page.click('span[aria-label="copy"]');
    const confirmCopy = await page.waitForXPath(
      '//button/span[contains(text(), "Copy to Core")]/parent::button',
    );
    await confirmCopy.click();

    const xCode = await page.waitForXPath(
      '//div[contains(@class, "ant-modal-body")]/descendant::b',
    );
    const verificationCode = await page.evaluate(
      (xCode) => xCode.textContent,
      xCode,
    );
    await page.type('input[placeholder="Enter Code"]', verificationCode);

    const confirmFolder = await page.waitForXPath(
      '//span[contains(text(), "Confirm")]/parent::button',
    );
    await confirmFolder.click();

    const errorMessage = await page.waitForXPath('//div[contains(@class, "ant-modal-content")]/descendant::span[contains(text(), "*Select Destination") and contains(@style, "font-style: italic")]')

    expect(errorMessage).toBeTruthy();
  });

  it('9.2.19 - In destination drop down menu, user could choose Core Home and all folder displayed in the Core Home', async () => {
    await selectGreenroomFile(page, fileName);

    await page.click('span[aria-label="copy"]');
    const confirmCopy = await page.waitForXPath(
      '//button/span[contains(text(), "Copy to Core")]/parent::button',
    );
    await confirmCopy.click();

    await selectUserFolderDestination(page, admin.username);
    const coreFolder = await page.waitForXPath(
      `//span[contains(@title, '${coreFolderName}')]`,
      { timeout: 5000 },
    );
    expect(coreFolder).toBeTruthy();
  })

   it('9.2.20 - When selecting destination, if user selected folder contains sub folder, folder should expand to display sub folders for user to choose', async () => {
     await selectGreenroomFile(page, fileName);

     await page.click('span[aria-label="copy"]');
     const confirmCopy = await page.waitForXPath(
       '//button/span[contains(text(), "Copy to Core")]/parent::button',
     );
     await confirmCopy.click();

     await selectUserFolderDestination(page, admin.username);
     const coreFolder = await page.waitForXPath(
       `//span[contains(@title, '${coreFolderName}')]`,
       { timeout: 5000 },
     );
     await coreFolder.click();

     const coreSubFolder = await page.waitForXPath(
       `//span[contains(@title, '${coreSubFolderName}')]`,
       { timeout: 5000 },
     );

     expect(coreSubFolder).toBeTruthy();
   });
})