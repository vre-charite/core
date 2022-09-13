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
const {
  init,
  openSupportDrawer,
  openAndWaitForTarget,
} = require('../../../utils/commonActions.js');
const { clearInput } = require('../../../utils/inputBox.js');
const { collaborator } = require('../../../users');
const { baseUrl, mailHogHost, mailHogPort } = require('../../../config');
const mailhog = require('mailhog')({
  host: mailHogHost,
  port: mailHogPort,
});

describe('5.5 Test Contact us form should receive an email confirmation', () => {
  let page;
  jest.setTimeout(10000000);
  const adminEmail = 'jzhang@indocresearch.org';

  beforeAll(async () => {
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
    await page.goto(baseUrl);
    await page.setViewport({ width: 1920, height: 1080 });
    await login(page, 'collaborator');
    await init(page);
  });

  afterAll(async () => {
    await logout(page);
    await page.waitForTimeout(3000);
  });

  beforeEach(async () => {
    await page.setCacheEnabled(false);
  });

  it('Username and email prefilled, user should receive email confirmation', async () => {
    const title = 'Test inquiry';
    const description = 'This is the test body';

    await openSupportDrawer(page);
    const usernameInput = await page.$eval('#name', (input) => input.value);
    const emailInput = await page.$eval('#email', (input) => input.value);

    expect(usernameInput).toBe(collaborator.username);
    expect(emailInput.replace(/\+/g, '')).toBe(collaborator.email);

    await page.type('#title', title);
    await page.type('#description', description);
    const submitButton = await page.waitForXPath(
      '//div[contains(@id, "support-drawer")]/descendant::span[contains(text(), "Submit")]/parent::button',
    );
    await submitButton.click();

    await page.waitForResponse(
      (response) =>
        response.status() === 200 && response.url().includes('/v1/contact'),
    );

    const result = await mailhog.messages(0, 10);
    const userEmailConfirmation = result.items.find((item) => {
      const hasEmail = item.to.replace(/\+/g, '').includes(collaborator.email);
      const hasSubject = item.subject
        .replace(/_/g, ' ')
        .includes('Confirmation of Contact Email');
      const hasContent =
        item.html.includes(`Issue title: ${title}`) &&
        item.html.includes(description);

      if (hasEmail && hasSubject && hasContent) {
        return item;
      }
    });
    const adminEmailConfirmation = result.items.find((item) => {
      const hasEmail = item.to.replace(/\+/g, '').includes(adminEmail);
      const hasSubject = item.subject
        .replace(/_/g, ' ')
        .toLowerCase()
        .includes('support request submitted');
      const hasContent =
        item.html.includes(`Issue title: ${title}`) &&
        item.html.includes(description);

      if (hasSubject && hasEmail && hasContent) {
        return item;
      }
    });

    expect(userEmailConfirmation).toBeTruthy();
    expect(adminEmailConfirmation).toBeTruthy();

    await mailhog.deleteMessage(userEmailConfirmation.ID);
    await mailhog.deleteMessage(adminEmailConfirmation.ID);
  });

  it('Contact us form description is limited between 10 to 10,000 characters, display error message if any information is incorrect', async () => {
    await page.reload();
    const charErrorMessage =
      'The description must be between 10 and 1000 characters';
    const descErrorMessage = 'Please provide a description';

    let upperLimitChar = '';
    for (let i = 0; i < 1001; i++) {
      upperLimitChar += 'a';
    }
    const lowerLimitChar = 'aaa';
    const withinLimitChar = 'aaaaaaaaaaa';
    const inputChars = [upperLimitChar, lowerLimitChar, withinLimitChar];

    await openSupportDrawer(page);

    for (let char of inputChars) {
      await page.type('#description', char);
      let charErrorLabel;
      try {
        charErrorLabel = await page.waitForXPath(
          `//div[contains(@id, 'support-drawer')]/descendant::div[contains(text(), '${charErrorMessage}')]`,
          { timeout: 2500 },
        );
      } catch {}
      if (char.length > 1000 || char.length < 10) {
        expect(charErrorLabel).toBeTruthy();
      } else {
        expect(charErrorLabel).toBeFalsy();
      }

      await clearInput(page, '#description');
      const descErrorLabel = await page.waitForXPath(
        `//div[contains(@id, 'support-drawer')]/descendant::div[contains(text(), '${descErrorMessage}')]`,
      );
      expect(descErrorLabel).toBeTruthy();
    }
  });

  it('Description message should not contain only space and line breaks', async () => {
    await page.reload();
    const invalidChars = '     \n\n    \n  ';
    const charErrorMessage =
      'The description must be between 10 and 1000 characters';

    await openSupportDrawer(page);
    await page.type('#description', invalidChars);

    const charErrorLabel = await page.waitForXPath(
      `//div[contains(@id, 'support-drawer')]/descendant::div[contains(text(), '${charErrorMessage}')]`,
      { timeout: 2500 },
    );
    expect(charErrorLabel).toBeTruthy();
  });

  it('Documentation should redirect user to xwiki user guide page', async () => {
    await openSupportDrawer(page);

    const wikiLink = await page.waitForXPath(
      '//div[contains(@id, "support-drawer")]/descendant::button/a[contains(text(), "User Guide")]',
    );
    const newPage = await openAndWaitForTarget(browser, page, wikiLink);

    expect(newPage.url().includes('/xwiki/wiki/')).toBeTruthy();
    await newPage.close();
  });
});
