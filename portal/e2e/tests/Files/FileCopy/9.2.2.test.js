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
const { collaborator } = require('../../../users');
const { baseUrl, mailHogHost, mailHogPort } = require('../../../config');
const {
  requestToCore,
} = require('../../../utils/greenroomActions.js');
const mailhog = require('mailhog')({
  host: mailHogHost,
  port: mailHogPort,
});

describe('9.2 File Copy', () => {
  let page;

  const projectId = 61390;
  const fileName = '3.png';
  jest.setTimeout(700000); //sets timeout for entire test suite

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'collaborator');
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

  it('9.2.2 - File copy from raw to VRE core requires confirmation from Project Admin', async () => {
    const projectTitle = await page.waitForXPath(
      '//span[contains(@class, "ant-page-header-heading-title")]/descendant::span',
    );
    const projectName = await page.evaluate(
      (ele) => ele.innerText,
      projectTitle,
    );
    await requestToCore(page, collaborator.username, fileName);
    await page.waitForTimeout(5000);

    const result = await mailhog.messages(0, 5);
    const emailConfirmation = result.items.find((item) => {
      const hasSubject = item.subject
        .replace(/_/g, ' ')
        .includes('A new request to copy data to Core needs your approval');
      const hasContent =
        item.html.includes(`b>Project:</b> ${projectName}`) &&
        item.html.includes('<b>Requested by:</b> kaiyao zhang9200');

      if (hasSubject && hasContent) {
        return item;
      }
    });

    expect(emailConfirmation).toBeTruthy();
    await mailhog.deleteMessage(emailConfirmation.ID);
  });
});
