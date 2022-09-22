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

const fileName = 'tinified.zip';
const folderName = 'Test Files';
const coreFolderName = 'Test Folder';
const coreSubFolderName = 'Test Sub Folder';

const navigateToCore = async (page) => {
  await page.waitForXPath('//div[contains(@class, "FileExplorer_file_dir")]');
  const home = await page.$x(
    '//span[contains(text(), "Home") and contains(@class, "ant-tree-title")]',
  );
  // await page.evaluate(ele => console.log(ele), home[1])
  await home[1].click();
};

const selectGreenroomFile = async (page, fileName) => {
  const fileCheckbox = await page.waitForXPath(
    `//tr[contains(@class, 'ant-table-row')]/descendant::span[contains(text(), '${fileName}')]/ancestor::tr/descendant::input`,
  );
  await fileCheckbox.click();
};

const selectCoreFile = async (page, fileName) => {
  const fileCheckbox = await page.waitForXPath(
    `//div[contains(@class, 'ant-tabs-tabpane-active')]/descendant::span[contains(text(), '${fileName}')]/ancestor::tr/descendant::input`,
  );
  await fileCheckbox.click();
};

const copyAction = async (page) => {
  await page.click('span[aria-label="copy"]');
  const confirmCopy = await page.waitForXPath(
    '//button/span[contains(text(), "Copy to Core")]/parent::button',
  );
  await confirmCopy.click();
}

const findUserFolderDestination = async (page, username) => {
  // navigate to user folders
  const [selectDestination] = await page.$x(
    '//button/span[contains(text(), "Select Destination")]/parent::button',
  );
  selectDestination.click();
  const coreFolder = 'span[title="Core"]';
  await page.waitForSelector(coreFolder);
  await page.click(coreFolder);

  // find correct folder
  let destinationFolder;
  while (!destinationFolder) {
    try {
      destinationFolder = await page.waitForXPath(
        `//span[contains(@title, '${username}')]`,
        { timeout: 5000 },
      );
      await destinationFolder.click();
    } catch (e) {
      // user not found, click on ellipsis to expand user list
      await page.click('span[title="..."');
    }
  }
};

const copyFileToCore = async (page, username, fileName, folderName) => {
  await selectGreenroomFile(page, fileName);
  // click on copy
  await copyAction(page);
  // type in verification code
  const xCode = await page.waitForXPath(
    '//div[contains(@class, "ant-modal-body")]/descendant::b',
  );
  const verificationCode = await page.evaluate(
    (xCode) => xCode.textContent,
    xCode,
  );
  await page.type('input[placeholder="Enter Code"]', verificationCode);

  await findUserFolderDestination(page, username);

  if (folderName) {
    const coreFolder = await page.waitForXPath(
      `//div[contains(@class, "Copy2Core_copy_to_core_modal")]/descendant::span[contains(@class, "ant-tree-title") and contains(text(), "${folderName}")]`,
    );
    await coreFolder.click();
  }

  const [selectFolder] = await page.$x(
    '//span[contains(text(), "Select")]/parent::button',
  );
  await selectFolder.click();

  const confirmFolder = await page.waitForXPath(
    '//span[contains(text(), "Confirm")]/parent::button',
  );
  await confirmFolder.click();
  const closeButton = await page.waitForXPath(
    '//span[contains(text(), "Close")]/parent::button',
  );
  await closeButton.click();
};

const requestToCore = async (page, username, fileName, folderName) => {
  await selectGreenroomFile(page, fileName);
  // click on copy
  await page.click('span[aria-label="pull-request"]');

  // navigate to user folders
  const [selectDestination] = await page.$x(
    '//button/span[contains(text(), "Select Destination")]/parent::button',
  );
  selectDestination.click();
  const coreFolder = await page.waitForXPath(
    '//div[contains(@class, "ant-modal-content")]/descendant::span[contains(text(), "Core") and contains(@class, "ant-tree-title")]',
  );
  await coreFolder.click()

  // find correct folder
  let destinationFolder;
  while (!destinationFolder) {
    try {
      destinationFolder = await page.waitForXPath(
        `//span[contains(@title, '${username}')]`,
        { timeout: 5000 },
      );
      await destinationFolder.click();
    } catch (e) {
      // user not found, click on ellipsis to expand user list
      await page.click('span[title="..."');
    }
  }

  if (folderName) {
    const coreFolder = await page.waitForXPath(
      `//div[contains(@class, "Copy2Core_copy_to_core_modal")]/descendant::span[contains(@class, "ant-tree-title") and contains(text(), "${folderName}")]`,
    );
    await coreFolder.click();
  }

  const [selectFolder] = await page.$x(
    '//span[contains(text(), "Select")]/parent::button',
  );
  await selectFolder.click();

  await page.type('#notes', 'Test request to core')

  const confirmFolder = await page.waitForXPath(
    '//span[contains(text(), "Confirm")]/parent::button',
  );
  await confirmFolder.click();
};

const deleteAction = async (page) => {
  let ellipsis;
  try {
    ellipsis = await page.waitForXPath(
      '//div[contains(@class, "ant-tabs-tabpane-active")]/descendant::span[contains(@aria-label, "ellipsis")]/parent::button',
      { timeout: 5000, visible: true },
    );
  } catch {}
  if (ellipsis) {
    await ellipsis.hover();
    const deleteFile = await page.waitForXPath(
      '//div[contains(@class, "ant-dropdown FileExplorer_drop-down")]/descendant::span[contains(@aria-label, "delete")]/parent::button',
    );
    await deleteFile.click();
  } else {
    const deleteButton = await page.waitForXPath(
      '//div[contains(@id, "rawTable-sidePanel")]/descendant::span[contains(text(), "Delete")]/parent::button',
      { visible: true },
    );
    await deleteButton.click();
  }
  await page.waitForXPath(
    '//div[contains(@class, "ant-modal-title") and contains(text(), "Delete Files")]',
  );
  const modalConfirmButton = await page.waitForXPath(
    '//div[contains(@class, "ant-modal-footer")]/descendant::button/descendant::span[contains(text(), "OK")]/ancestor::button',
  );
  await modalConfirmButton.click();
};

const deleteFileFromCore = async (page, fileName) => {
  await selectCoreFile(page, fileName);
  await deleteAction(page)
};

const deleteFileFromGreenroom = async (page, fileName) => {
  await selectGreenroomFile(page, fileName);
  await deleteAction(page)
};

const waitForTimeHash = async (page, fileName) => {
  const xDuplicateFile = `//div[contains(@class, 'ant-tabs-tabpane-active')]/descendant::span[contains(text(), '${fileName}_')]`;
  await page.waitForXPath(xDuplicateFile, { timeout: 300000, visible: true });
  const [copiedFile] = await page.$x(xDuplicateFile);
  const timeHash = await page.evaluate(
    (ele) => ele.textContent.split('_')[1],
    copiedFile,
  );

  return timeHash;
};

module.exports = {
  navigateToCore,
  selectGreenroomFile,
  selectCoreFile,
  findUserFolderDestination,
  copyAction,
  copyFileToCore,
  requestToCore,
  deleteAction,
  deleteFileFromCore,
  deleteFileFromGreenroom,
  waitForTimeHash,
  fileName,
  folderName,
  coreFolderName,
  coreSubFolderName,
};
