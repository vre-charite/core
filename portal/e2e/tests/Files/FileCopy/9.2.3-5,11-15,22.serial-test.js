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
  copyFileToCore,
  selectGreenroomFile,
  selectCoreFile,
  navigateToCore,
  deleteAction,
  deleteFileFromCore,
  waitForTimeHash,
  fileName,
  folderName,
  coreFolderName,
} = require('../../../utils/greenroomActions.js');

describe('9.2 File Copy', () => {
  let page;

  const dupeFileName = fileName.replace('.zip', '');
  const projectId = 61268;

  jest.setTimeout(700000); //sets timeout for entire test suite

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page);

    // await page.goto(`${baseUrl}project/${projectId}/canvas`);
  });

  beforeEach(async () => {
    await page.setCacheEnabled(false);
    await page.goto(`${baseUrl}project/${projectId}/canvas`);
  });

  afterAll(async () => {
    // delete all files in test project
    // await page.goto(`${baseUrl}project/${projectId}/canvas`);
    // const selectAllGreenRoomFiles = await page.waitForXPath(
    //   '//div[contains(@id, "rawTable-sidePanel")]/descendant::thead/descendant::div[contains(@class, "ant-table-selection")]/descendant::input[not(@disabled)]',
    //   { visible: true },
    // );
    // await selectAllGreenRoomFiles.click();
    // await deleteAction(page);
    // await page.waitForTimeout(5000);

    // await navigateToCore(page);
    // const selectAllCoreFiles = await page.waitForXPath(
    //   `//div[contains(@role, 'tabpanel') and contains(@style, 'visibility: visible')]/descendant::div[contains(@id, "rawTable-sidePanel")]/descendant::thead/descendant::div[contains(@class, "ant-table-selection")]/descendant::input[not(@disabled)]`,
    // );
    // await selectAllCoreFiles.click();
    // // unselect test folder
    // await selectCoreFile(page, coreFolderName);
    // await deleteAction(page);

    await logout(page);
    await page.waitForTimeout(3000);
  });

  //TODO: upload a file prior to running the tests below - save a dummy file in project and upload that one ['Test Files', 'tinified.zip']
  it('Upload files for test environment', async () => {
    await page.waitForXPath(
      `//div[contains(@class, "FileExplorer_file_folder_path")]/descendant::span[contains(text(), "${admin.username}")]`,
    );
    const uploadButton = await page.waitForXPath(
      '//div[contains(@class, "file_explorer_header_bar")]/descendant::span[contains(text(), "Upload")]/ancestor::button[not(@disabled)]',
    );
    await uploadButton.click();

    const uploadInputField = await page.waitForSelector('#form_in_modal_file');
    await uploadInputField.uploadFile(
      `${process.cwd()}/e2e/uploads/Test Files/${fileName}`,
    );
    await page.click('#file_upload_submit_btn');

    await uploadButton.click();
    await uploadInputField.uploadFile(
      `${process.cwd()}/e2e/uploads/${folderName}`,
    );
    await page.click('#file_upload_submit_btn');

    const [uploadedFile, uploadedFolder] = await Promise.all([
      page.waitForXPath(
        `//tr[contains(@class, 'ant-table-row')]/descendant::span[contains(text(), '${fileName}')]`,
        { timeout: 60000 },
      ),
      page.waitForXPath(
        `//tr[contains(@class, 'ant-table-row')]/descendant::span[contains(text(), '${folderName}')]`,
        { timeout: 60000 },
      ),
    ]);

    expect(uploadedFile).toBeTruthy();
    expect(uploadedFolder).toBeTruthy();
  });
  // // 9.2.14 in this test suite depends on this test to copy a file
  // it('9.2.3, 9.2.4, 9.2.12, 9.2.22 - Greenroom raw copied files displayed in core', async () => {
  //   // click on checkbox of tinified.zip
  //   await copyFileToCore(page, admin.username, fileName);

  //   // navigate to core and find copied file
  //   await navigateToCore(page);

  //   const xCopiedFile = `//div[contains(@class, 'ant-tabs-tabpane-active')]/descendant::span[contains(text(), '${fileName}')]/ancestor::tr`;
  //   await page.waitForXPath(xCopiedFile, { timeout: 120000, visible: true });
  //   const copiedFile = await page.$x(xCopiedFile);

  //   expect(copiedFile.length).toBe(1);
  // });

  // it('9.2.11 - Folder can be copied to a folder within core and displayed in core folder', async () => {
  //   const fileName = 'Test Files';
  //   const coreFolderName = 'Test Folder';

  //   await copyFileToCore(page, admin.username, fileName, coreFolderName);

  //   // navigate to core and find copied fille = `//div[contains(@class, 'ant-tabs-tabpane-active')]/descendant::span[contains(text(), '${fileName}')]/ancestor::tr`;
  //   await page.waitForXPath(xCopiedFile, { timeout: 300000, visible: true });
  //   const copiedFile = await page.$x(xCopiedFile);

  //   expect(copiedFile.length).toBe(1);
  // })e
  //   await navigateToCore(page);

  //   const xCoreFolder = `//div[contains(@class, 'ant-tabs-tabpane-active')]/descendant::span[contains(text(), '${coreFolderName}')]`;
  //   const coreFolder = await page.waitForXPath(xCoreFolder, {
  //     timeout: 120000,
  //     visible: true,
  //   });
  //   await coreFolder.click();

  //   await page.waitForTimeout(3000);
  //   const xCopiedFi

  // it('9.2.14 - Files within a folder with the same name will have time hash added at the end of the file name', async () => {
  //   await copyFileToCore(page, admin.username, fileName);
  //   await navigateToCore(page);

  //   const timeHash = await waitForTimeHash(page, dupeFileName);

  //   expect(timeHash).toBeTruthy();
  // });

  // 9.2.15 in this test suite depends on this test to copy a folder
  // it('9.2.13 - files that are in concurrent operations will be locked', async () => {
  //   await page.goto(`${baseUrl}project/${projectId}/canvas`);

  //   await copyFileToCore(page, admin.username, folderName);
  //   await deleteFileFromGreenroom(page, folderName);

  //   const fileLog = await page.waitForXPath(
  //     '//header/descendant::li/descendant::span[contains(@class, "Layout_badge")]',
  //   );
  //   await fileLog.click();
  //   await page.waitForSelector('.ant-popover-inner-content');

  //   // find folderName with copy icon
  //   await page.waitForXPath(
  //     `//div[contains(@class, "ant-tabs-content")]/descendant::span[contains(@aria-label, "copy")]/parent::span[contains(text(), '${folderName}')]`,
  //   );
  //   // find folderName with delete icon
  //   await page.waitForXPath(
  //     `//div[contains(@class, "ant-tabs-content")]/descendant::span[contains(@aria-label, "rest")]/parent::span[contains(text(), '${folderName}')]`,
  //   );

  //   await page.click('#tab-deleted');
  //   const deleteFailed = await page.waitForXPath(
  //     `//div[contains(@class, "Layout_deleted_list")]/descendant::li/descendant::span[contains(@aria-label, "close")]/following-sibling::span[contains(text(), "${folderName}")]/following-sibling::span[contains(text(), "Green Room")]`,
  //     { timeout: 120000 },
  //   );
  //   const file = await page.waitForXPath(
  //     `//tr[contains(@class, 'ant-table-row')]/descendant::span[contains(text(), '${folderName}')]/ancestor::tr`,
  //   );

  //   expect(deleteFailed).toBeTruthy(); // delete fail in file log
  //   expect(file).toBeTruthy(); // file still present in greenroom
  // });

  // it('9.2.15 - Folder with the same name will be merged with internal files in core, files with the same name will have time hash added to file name', async () => {
  //   const fileName = folderName;
  //   await copyFileToCore(page, admin.username, fileName);
  //   await navigateToCore(page);

  //   const copiedFolder = await page.waitForXPath(
  //     `//div[contains(@class, 'ant-tabs-tabpane-active')]/descendant::span[contains(text(), '${folderName}')]`,
  //   );
  //   await copiedFolder.click();

  //   await page.waitForTimeout(5000);
  //   const timeHash = await waitForTimeHash(page, dupeFileName);
  //   expect(timeHash).toBeTruthy();
  // });

  //   }

  //   expect(tagText).toBe('copied-to-core');
  // });

  // it('9.2.5, 9.2.23 - check for copy tag of recently copied', async () => {
  //   await selectGreenroomFile(page, fileName);
  //   await page.click('span[aria-label="copy"]');

  //   let tag;
  //   let tagText;
  //   try {
  //     tag = await page.waitForXPath(
  //       `//tr[contains(@class, 'ant-table-row')]/descendant::span[contains(text(), '${fileName}')]/preceding::span[contains(@class, 'ant-tag')]`,
  //       { timeout: 2500 },
  //     );
  //     tagText = await tag.evaluate((el) => el.textContent);
  //   } catch (e) {
  //     console.log(e);
});
