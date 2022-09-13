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
const { baseUrl } = require('../../../config');
const moment = require('moment-timezone');
const fs = require('fs');
jest.setTimeout(700000);

const projectId = 60023;

describe('CopyRequest', () => {
  let page;
  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './e2e/downloads',
    });
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
    await init(page, { closeBanners: false });
  });
  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });
  async function findReqWithOneLeftItem(isFile = false, isEmptyFolder = null) {
    for (let i = 1; i <= 10; i++) {
      const req = await page.waitForXPath(
        `//ul//li[contains(@class, "NewRequestsList_list_item") and position()=${i}]`,
      );
      await req.click();
      await page.waitForTimeout(3000);
      const fileList = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr',
      );
      const checkBox = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[@class="ant-checkbox"]',
      );
      const isFileList = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[contains(@class,"anticon-file")]',
      );
      const firstItemNameNode = await page.waitForXPath(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//td[position()=3]//span',
        {
          visible: true,
        },
      );
      const firstItemName = await page.evaluate((firstItemNameNode) => {
        return firstItemNameNode.textContent;
      }, firstItemNameNode);

      if (isFile) {
        if (isFileList.length == 1 && checkBox.length && fileList.length == 1) {
          return;
        }
      } else {
        if (isEmptyFolder) {
          if (firstItemName === 'test-empty-folder') {
            return;
          }
        } else {
          if (firstItemName === 'test-empty-folder') {
            continue;
          }
          if (
            isFileList.length == 0 &&
            checkBox.length &&
            fileList.length == 1
          ) {
            return;
          }
        }
      }
    }
  }
  async function findReqWithZeroLeftItem() {
    for (let i = 1; i <= 10; i++) {
      const req = await page.waitForXPath(
        `//ul//li[contains(@class, "NewRequestsList_list_item") and position()=${i}]`,
      );
      await req.click();
      await page.waitForTimeout(3000);
      const fileList = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr',
      );
      const checkBox = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[@class="ant-checkbox"]',
      );
      if (checkBox.length === 0 && fileList.length === 1) {
        return;
      }
    }
  }
  async function findCompletedReqWithOneFile() {
    for (let i = 1; i <= 10; i++) {
      const req = await page.waitForXPath(
        `//ul//li[contains(@class, "CompletedRequests_list_item") and position()=${i}]`,
      );
      await req.click();
      await page.waitForTimeout(3000);
      const fileList = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr',
      );
      const isFile = await page.$x(
        '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[contains(@class,"anticon-file")]',
      );
      if (isFile.length && fileList.length == 1) {
        return;
      }
    }
  }
  async function openApporveModal() {
    const firstCheckBox = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[@class="ant-checkbox"]',
      {
        visible: true,
      },
    );
    await firstCheckBox.click();
    const approveBtn = await page.waitForXPath(
      '//button[contains(@class, "Widget_accept-icon")]',
      {
        visible: true,
      },
    );
    await approveBtn.click();
  }
  async function openDenyModal() {
    const firstCheckBox = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[@class="ant-checkbox"]',
      {
        visible: true,
      },
    );
    await firstCheckBox.click();
    const approveBtn = await page.waitForXPath(
      '//button[contains(@class, "Widget_deny-icon")]',
      {
        visible: true,
      },
    );
    await approveBtn.click();
  }
  async function approveFirstItem() {
    await openApporveModal();
    const verificationPart = await page.waitForXPath(
      '//b[contains(@class, "Widget_no_select")]',
    );
    const verificationCode = await page.evaluate(
      (element) => element.textContent,
      verificationPart,
    );
    await page.type('.ant-modal-body input', verificationCode);
    await page.waitForTimeout(1000);
    await page.click('.ant-modal-footer button.approve-btn');
    await page.waitForTimeout(1000);
  }

  async function denyFirstItem() {
    await openDenyModal();
    const verificationPart = await page.waitForXPath(
      '//b[contains(@class, "Widget_no_select")]',
    );
    const verificationCode = await page.evaluate(
      (element) => element.textContent,
      verificationPart,
    );
    await page.type('.ant-modal-body input', verificationCode);
    await page.waitForTimeout(1000);
    await page.click('.ant-modal-footer button.deny-btn');
    await page.waitForTimeout(1000);
  }
  async function getFirstRecordStatus() {
    const firstItemInTable = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]',
      {
        visible: true,
      },
    );
    const rowClassList = await page.evaluate((element) => {
      const rawList = element.classList;
      let classList = [];
      Object.keys(rawList).map((key) => {
        classList.push(rawList[key]);
      });
      return classList;
    }, firstItemInTable);
    return rowClassList.indexOf('record-approved') !== -1
      ? 'approved'
      : 'denied';
  }
  async function testWarningStyle(status) {
    const className = status === 'approved' ? 'approve-item' : 'deny-item';
    const warningNoteSection = await page.waitForXPath(
      `//li[@class="${className}"]`,
    );
    const warningNoteSectionTxt = await page.evaluate(
      (warningNoteSection) => warningNoteSection.textContent,
      warningNoteSection,
    );
    const fileCnt = warningNoteSectionTxt.split(' ')[0];
    expect(parseInt(fileCnt)).not.toBe(0);
    await page.click('span.ant-modal-close-icon');
  }
  async function clickIntoFirstFolder() {
    const firstItemNameNode = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//td[position()=3]//span',
      {
        visible: true,
      },
    );
    await firstItemNameNode.click();
    await page.waitForTimeout(5000);
  }

  it('7.2.2 each new requests should displayed properly', async () => {
    await page.goto(`${baseUrl}project/${projectId}/requestToCore`);
    const firstReq = await page.waitForXPath(
      '//ul//li[contains(@class, "NewRequestsList_list_item") and position()=1]',
    );
    const firstReqText = await page.evaluate(
      (element) => element.textContent,
      firstReq,
    );
    const firstReqArr = firstReqText.split(' / ');
    expect(firstReqArr[0]).not.toBe('');
    expect(firstReqArr[1]).not.toBe('');
    const requestDetails = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_header_left_part")]',
      {
        visible: true,
      },
    );
    const { reqNote, source, destination } = await page.evaluate(
      (requestDetails) => {
        function getValueAfterColons(string) {
          if (string && string.indexOf(': ') !== -1) {
            return string.split(': ')[1];
          } else {
            return '';
          }
        }
        if (requestDetails && requestDetails.children) {
          const reqNote = requestDetails.children[0]
            ? getValueAfterColons(requestDetails.children[0].textContent)
            : '';
          const source = requestDetails.children[1]
            ? getValueAfterColons(requestDetails.children[1].textContent)
            : '';
          const destination = requestDetails.children[2]
            ? getValueAfterColons(requestDetails.children[2].textContent)
            : '';
          return {
            reqNote,
            source,
            destination,
          };
        }
      },
      requestDetails,
    );
    expect(reqNote).not.toBe('');
    expect(source).not.toBe('');
    expect(destination).not.toBe('');
    await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//td[position()=3]',
      {
        visible: true,
      },
    );
    const firstItemInTable = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]',
      {
        visible: true,
      },
    );
    const { name, addedBy, createdAt } = await page.evaluate(
      (firstItemInTable) => {
        if (firstItemInTable && firstItemInTable.children)
          return {
            name: firstItemInTable.children[2].textContent,
            addedBy: firstItemInTable.children[3].textContent,
            createdAt: firstItemInTable.children[4].textContent,
          };
      },
      firstItemInTable,
    );

    expect(name).not.toBe('');
    expect(addedBy).not.toBe('');
    expect(createdAt).not.toBe('');
  });
  it('7.2.3 each completed requests should displayed properly', async () => {
    const completedBtn = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_completed") and text()="Completed"]',
    );
    await completedBtn.click();
    const firstReqTitle = await page.waitForXPath(
      '//ul//li[contains(@class, "CompletedRequests_list_item") and position()=1]//div//p[position()=1]',
    );
    const firstReqTitleText = await page.evaluate(
      (element) => element.textContent,
      firstReqTitle,
    );
    const firstReqArr = firstReqTitleText.split(' / ');
    expect(firstReqArr[0]).not.toBe('');
    expect(firstReqArr[1]).not.toBe('');
    const firstReqNote = await page.waitForXPath(
      '//ul//li[contains(@class, "CompletedRequests_list_item") and position()=1]//div//p[position()=2]',
    );
    const firstReqNoteText = await page.evaluate(
      (element) => element.textContent,
      firstReqNote,
    );
    const firstReqNoteArr = firstReqNoteText.slice(3).split(' / ');
    expect(firstReqNoteArr[0]).not.toBe('');
    expect(firstReqNoteArr[0]).not.toBe('');
    await findCompletedReqWithOneFile();
    const requestDetails = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_header_left_part")]',
      {
        visible: true,
      },
    );
    const { reqNote, source, destination, reviewNote } = await page.evaluate(
      (requestDetails) => {
        function getValueAfterColons(string) {
          if (string && string.indexOf(': ') !== -1) {
            return string.split(': ')[1];
          } else {
            return '';
          }
        }
        if (requestDetails && requestDetails.children) {
          const reqNote = requestDetails.children[0]
            ? getValueAfterColons(requestDetails.children[0].textContent)
            : '';
          const source = requestDetails.children[1]
            ? getValueAfterColons(requestDetails.children[1].textContent)
            : '';
          const destination = requestDetails.children[2]
            ? getValueAfterColons(requestDetails.children[2].textContent)
            : '';
          const reviewNote = requestDetails.children[3]
            ? getValueAfterColons(requestDetails.children[3].textContent)
            : '';
          return {
            reqNote,
            source,
            destination,
            reviewNote,
          };
        }
      },
      requestDetails,
    );
    expect(reqNote).not.toBe('');
    expect(source).not.toBe('');
    expect(destination).not.toBe('');
    expect(reviewNote).not.toBe('');
    const firstItemInTable = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]',
      {
        visible: true,
      },
    );
    const { name, addedBy, createdAt, reviewedAt, reviewedBy } =
      await page.evaluate((firstItemInTable) => {
        if (
          firstItemInTable &&
          firstItemInTable.children &&
          firstItemInTable.children.length > 6
        )
          return {
            name: firstItemInTable.children[2].textContent,
            addedBy: firstItemInTable.children[3].textContent,
            createdAt: firstItemInTable.children[4].textContent,
            reviewedAt: firstItemInTable.children[5].textContent,
            reviewedBy: firstItemInTable.children[6].textContent,
          };
      }, firstItemInTable);

    expect(name).not.toBe('');
    expect(addedBy).not.toBe('');
    expect(createdAt).not.toBe('');
    expect(reviewedAt).not.toBe('');
    expect(reviewedBy).not.toBe('');
  });
  it('7.2.4 Project admin could download file in the request table', async () => {
    const actionButton = await page.waitForXPath(
      '//button[contains(@class, "ant-dropdown-trigger")]',
    );
    await actionButton.click();
    const downloadBtn = await page.waitForXPath(
      '//li[contains(@class, "ant-dropdown-menu-item") and text()="Download"]',
    );
    await downloadBtn.click();
    await page.waitForTimeout(10000);
    const firstItemInTable = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]',
      {
        visible: true,
      },
    );
    const fileName = await page.evaluate((firstItemInTable) => {
      if (
        firstItemInTable &&
        firstItemInTable.children &&
        firstItemInTable.children.length > 6
      )
        return firstItemInTable.children[2].textContent;
    }, firstItemInTable);
    // if no error raised, that means the file has been downloaded
    fs.readFileSync(`./e2e/downloads/${fileName}`);
    //remove file when test ends
    fs.unlinkSync(`./e2e/downloads/${fileName}`);
  });
  it('7.2.5 Project admin should be able to select files/folders and approve. Once approved the copy will start immediately', async () => {
    await page.goto(`${baseUrl}project/${projectId}/requestToCore`);
    await findReqWithOneLeftItem(true);
    await approveFirstItem();
    const firstItemInTable = await page.waitForXPath(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]',
      {
        visible: true,
      },
    );
    const fileName = await page.evaluate((firstItemInTable) => {
      if (
        firstItemInTable &&
        firstItemInTable.children &&
        firstItemInTable.children.length > 6
      )
        return firstItemInTable.children[2].textContent;
    }, firstItemInTable);
    const filePanelBtn = await page.waitForXPath(
      '//span[contains(@class, "Layout_badge")]',
    );
    await filePanelBtn.click();
    const downloadItem = await page.waitForXPath(
      `//div[contains(@class, "Layout_progress_list")]//li//span[contains(text(),"${fileName}")]`,
    );
    expect(downloadItem).not.toBe(null);
  });
  it('7.2.6 Project admin should be able to select files/folders and deny', async () => {
    await page.goto(`${baseUrl}project/${projectId}/requestToCore`);
    await findReqWithOneLeftItem(false, true);
    await denyFirstItem();
    const successMsg = await page.waitForXPath(
      '//span[text()="Selected file(s) have been denied successfully"]',
      {
        visible: true,
      },
    );
    expect(successMsg).not.toBe(null);
  });
  it('7.2.7 Files will display status for approved or denied, but folders has no status', async () => {
    await page.goto(`${baseUrl}project/${projectId}/requestToCore`);
    await findReqWithZeroLeftItem();
    const status = await getFirstRecordStatus();
    if (status == 'approved') {
      const approvedIcon = await page.waitForXPath(
        '//td//span[contains(@class, "anticon-check")]',
        {
          visible: true,
        },
      );
      expect(approvedIcon).not.toBe(null);
    } else {
      const denyIcon = await page.waitForXPath(
        '//td//span[contains(@class, "anticon-close")]',
        {
          visible: true,
        },
      );
      expect(denyIcon).not.toBe(null);
    }
  });
  it('7.2.9 If project admin select subfolder/file approve, and then in outside folder select deny/approve folder, a modal should pop to show how n files approved n files denied && 7.2.11 Once approved or denied, the decision cannot be changed/revert', async () => {
    await findReqWithOneLeftItem(false, false);
    await clickIntoFirstFolder();
    const previousStatus = await getFirstRecordStatus();
    const checkBox = await page.$x(
      '//div[contains(@class, "RequestToCore_request_content")]//tbody[contains(@class,"ant-table-tbody")]//tr[position()=1]//span[@class="ant-checkbox"]',
    );
    const parentDir = await page.waitForXPath(
      '//span[contains(@class, "ant-breadcrumb-link") and text()="Request"]',
    );
    await parentDir.click();
    await page.waitForTimeout(5000);
    if (checkBox.length !== 0) {
      await denyFirstItem();
      await approveFirstItem();
      await testWarningStyle('denied');
      await clickIntoFirstFolder();
      const curStatus = await getFirstRecordStatus();
      expect(curStatus).toBe('denied');
    } else {
      if (previousStatus === 'approved') {
        await denyFirstItem();
        await testWarningStyle('approved');
        await clickIntoFirstFolder();
        const curStatus = await getFirstRecordStatus();
        expect(curStatus).toBe('approved');
      } else {
        await approveFirstItem();
        await testWarningStyle('denied');
        await clickIntoFirstFolder();
        const curStatus = await getFirstRecordStatus();
        expect(curStatus).toBe('denied');
      }
    }
  });
  it('7.2.12 Only when all files/folders marked as approve/deny project admin could mark as completed', async () => {
    await page.goto(`${baseUrl}project/${projectId}/requestToCore`);
    await findReqWithOneLeftItem(true);
    const closeReqBtn = await page.waitForXPath(
      '//button[contains(span, "Close Request & Notify User")]',
    );
    await closeReqBtn.click();
    const modelWarning = await page.waitForXPath(
      '//div[@class="ant-modal-body"]//p[contains(text(),"are still under review.")]',
      {
        visible: true,
      },
    );
    expect(modelWarning).not.toBe(null);
  });
});
