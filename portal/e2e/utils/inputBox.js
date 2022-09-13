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

async function clearInput(page, selector) {
  try {
    const input = await page.waitForSelector(selector)
    const value = await page.$eval(selector, input => input.value);
    if (value === '') {
      return;
    }
    await input.click({ clickCount: 3 }); // selects entire input field
    await page.keyboard.press('Backspace');
  } catch (err) {
    console.log(err)
  }
}

module.exports = { clearInput }