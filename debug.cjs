const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('UNCAUGHT_EXCEPTION:', err.message);
  });

  console.log('Navigating...');
  await page.goto('https://dashboard.merlin.com.ar/login');
  console.log('Filling form...');
  await page.fill('input[type="email"]', 'admin@merlin.com');
  await page.fill('input[type="password"]', 'Admin1234!');
  await page.click('button[type="submit"]');
  console.log('Waiting 8 seconds for crash...');
  await page.waitForTimeout(8000);
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('BODY TEXT EXTRACTED:', bodyText.substring(0, 500));

  await browser.close();
})();
