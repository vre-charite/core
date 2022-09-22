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
const { baseUrl } = require('../../../config');

jest.setTimeout(700000);
/*
this test runs as a project admin test
Create a project admin account first
then change the login function username, and password
*/

describe('Admin Canvas', () => {
  let page;
  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'admin');
  });
  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });
  it('see general statistics', async () => {
    const projectId = 61390;
    await page.goto(`${baseUrl}project/${projectId}/canvas`);

    const [response] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/files/statistics'),
      ),
    ]);
    const generalStatistics = await response.json();
    const greenRoomDom = await page.waitForXPath(
      '//div[@class="ant-row" and contains(span, "Green Room")]/preceding-sibling::div/span',
    );
    const greenRoomText = await page.evaluate(
      (element) => element.textContent,
      greenRoomDom,
    );
    expect(Number(generalStatistics.result.greenroom)).toBe(
      Number(greenRoomText),
    );

    await page.waitForTimeout(4000);
  });
});
