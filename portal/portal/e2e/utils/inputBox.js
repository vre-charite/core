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