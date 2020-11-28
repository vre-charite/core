async function clearInput(page, selector) {
  try {
    const value = await page.$eval(selector, input => input.value);
    if (value === '') {
      return;
    }
    await page.focus(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
  } catch (err) {
    console.log(err)
  }
}

module.exports = { clearInput }