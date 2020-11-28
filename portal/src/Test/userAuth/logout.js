function autoLogout(it, getPage, testTitle) {
    it(testTitle, async () => {
        const page = getPage();
        await page.waitForSelector('#refresh_modal_refresh', { timeout: 6 * 60 * 1000 });
        await page.waitForTimeout(60 * 1000);
        const url = new URL(await page.url());
        await expect(url.pathname === '/vre/' || url.pathname === '/').toBeTruthy();
    })
}

function refreshModalLogout(it, getPage, testTitle) {
    it(testTitle, async () => {
        const page = getPage();
        await page.waitForSelector('#refresh_modal_refresh', { timeout: 6 * 60 * 1000 });
        const logoutBtn = await page.waitForSelector('#refresh_modal_logout', { timeout: 6 * 60 * 1000,visible:true });
        logoutBtn.click();
        await page.waitForTimeout(1000);
        const url = new URL(await page.url());
        await expect(url.pathname === '/vre/' || url.pathname === '/').toBeTruthy();
    })
}

module.exports = { autoLogout, refreshModalLogout };