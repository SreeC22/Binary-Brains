// @ts-check
const { test, expect } = require('@playwright/test');

test('homepage loads correctly and main elements are present', async ({ page }) => {
  // Navigate to the local development server
  await page.goto('http://localhost:3000/');

  // Check if the main heading is present
  await expect(page.locator('text=Transform Your Code with Ease and Efficiency')).toBeVisible();

  // Check if the Get Started button leads to the correct path
  await page.click('text=Get Started');
  await expect(page).toHaveURL('http://localhost:3000/translate');

  // Add more checks for other elements based on their text content or CSS selectors
});

test.describe('Navbar tests', () => {
  // Before each test, navigate to the home page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should navigate to the translate page', async ({ page }) => {
    await page.click('text=Translate Code');
    await expect(page).toHaveURL('http://localhost:3000/translate');
  });

  test('should open the more menu', async ({ page }) => {
    await page.click('text=More');
    await expect(page.locator('text=Documentation')).toBeVisible();
  });

  test('should navigate to the feedback page', async ({ page }) => {
    await page.click('text=Feedback');
    await expect(page).toHaveURL('http://localhost:3000/feedback');
  });

  test('should navigate to the login page when logged out', async ({ page }) => {
    // This test assumes that when not logged in, a 'Login/Register' button is visible
    await page.click('text=Login/Register');
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

});


test.describe('Login and Registration Flow', () => {
  // Assuming your local server runs on port 3000
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${BASE_URL}/login`);
  });

  test('User can login', async ({ page }) => {
    // Fill the email and password fields
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password');

    // Submit the form
    await page.click('button[type="submit"]');

    // Add your assertion to verify login was successful
    // This can be checking for a redirect, local storage item, etc.
  });

  test('User can switch to registration form', async ({ page }) => {
    // Click on the link to switch to the registration form
    await page.click('text="Not registered? Create account now"');

    // Check if the form switched by checking for a unique element
    await expect(page.locator('button[type="submit"]')).toHaveText('Register');
  });


  test('User cannot login with invalid credentials', async ({ page }) => {
    // Fill the email and password fields with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check if the login error message is shown
    await expect(page.locator('text="Authentication failed."')).toBeVisible();
  });
});

test.describe('Feedback Page Tests', () => {
  test('user can submit feedback', async ({ page }) => {
    // Navigate to the feedback page
    await page.goto('http://localhost:3000/feedback');

    // Interact with the rating system
     // This clicks the first star. Adjust selector as needed.

    // Fill out the feedback form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phoneNumber"]', '123-456-7890');
    await page.fill('textarea[name="message"]', 'This is a test feedback message.');

    // Submit the form
    await page.click('button[type="submit"]');
  });
});

test.describe('Translation and History Verification', () => {
  // Log in before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'user@example.com'); // Use the actual `name` attribute of your email input
    await page.fill('input[type="password"]', 'password'); // Use the actual `name` attribute of your password input
    await page.click('text="Login"');
  });

  test('perform a translation and verify it in history', async ({ page }) => {
    await page.goto('http://localhost:3000/translate');

    await page.selectOption('select#source-language-dropdown', 'python'); // Adjust selector and value
    await page.selectOption('select#target-language-dropdown', 'java'); // Adjust selector and value
    await page.fill('textarea#source-code-textarea', 'print("Hello, World!")'); // Adjust selector

    await page.click('button#convert'); // Adjust selector

    await page.goto('http://localhost:3000/translation-history');


    await expect(page.locator('text="Your identifiable translation text or element"')).toBeVisible(); // Adjust text or selector

    // Optionally, perform additional verifications as needed, such as checking for correct source and target languages, the exact translation, etc.
  });
});

// test.describe('TranslateCode page tests', () => {
//   let page;

//   test.beforeEach(async ({ browser }) => {
//     page = await browser.newPage();
//     await page.goto('http://localhost:3000/translate');
//   });

//   test.afterEach(async () => {
//     await page.close();
//   });

//   test('Language dropdowns work correctly', async ({ page }) => {
//     // Open source language dropdown and select Python
//     await page.click('[aria-label="Source Language"]');
//     await page.click('text=Python');
//     await expect(page.locator('[aria-label="Source Language"]')).toHaveText('Python');
  
//     // Open target language dropdown and select Java
//     await page.click('[aria-label="Target Language"]');
//     await page.click('text=Java');
//     await expect(page.locator('[aria-label="Target Language"]')).toHaveText('Java');
//   });
  

//   test('Input and output editors function as expected', async ({ page }) => {
//     // Assume `sourceLanguage` and `targetLanguage` have been set appropriately before this
  
//     // Input code in the Ace Editor
//     await page.type('textarea.ace_text-input', 'print("Hello, World!")', { delay: 100 });
    
//     // Trigger conversion process
//     await page.click('text=Convert');
    
//     // Check if output contains expected result
//     // This step may require waiting for the conversion to complete
//     await page.waitForSelector('text=Expected Output'); // Adjust the selector/text as necessary
//   });
  
//   test('Conversion and download functionality', async ({ page }) => {
//     // Setup steps to populate input, select languages, and trigger conversion
    
//     // Simulate clicking the download button
//     await page.click('text=Download'); // Adjust the selector as necessary
    
//     // Playwright's handling of downloads:
//     const [ download ] = await Promise.all([
//       page.waitForEvent('download'), // Start waiting for the download
//       page.click('text=Download') // Triggering the download
//     ]);
  
//     // Verify the download's filename
//     expect(await download.suggestedFilename()).toBe('output_code.txt');
  
//     // Further actions like saving the download can be performed here
//   });
  

//   test('Copy to clipboard functionality', async ({ page }) => {
//     // Assuming code has been inputted/converted at this point
    
//     // Click copy button for input code
//     await page.click('#copyInputButton'); // Use the appropriate selector for your copy button
//     // Verify clipboard content
//     await expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Expected input code');
  
//     // Click copy button for output code
//     await page.click('#copyOutputButton'); // Use the appropriate selector for your copy button
//     // Verify clipboard content
//     await expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Expected output code');
//   });
  

//   test('Zoom in and out functionality', async ({ page }) => {
//     // Assume initial font size is known, e.g., 14px
//     let initialFontSize = 14;
  
//     // Click zoom in button
//     await page.click('text=Zoom In'); // Adjust selector as needed
//     // Verify font size has increased
//     let newFontSize = await page.evaluate(() => {
//       // Return the actual font size of the editor content
//       return parseInt(window.getComputedStyle(document.querySelector('.ace_editor')).fontSize, 10);
//     });
//     expect(newFontSize).toBeGreaterThan(initialFontSize);
  
//     // Click zoom out button
//     await page.click('text=Zoom Out'); // Adjust selector as needed
//     // Verify font size has decreased back to initial
//     newFontSize = await page.evaluate(() => {
//       return parseInt(window.getComputedStyle(document.querySelector('.ace_editor')).fontSize, 10);
//     });
//     expect(newFontSize).toBe(initialFontSize);
//   });

//   test('API status is checked and displayed correctly', async ({ page }) => {
//     // Wait for the status element to appear
//     const statusElement = page.locator('selector-for-status-element'); // Use the correct selector
//     await expect(statusElement).toBeVisible();
  
//     // Check if the status is "Active" or "Inactive"
//     const statusText = await statusElement.textContent();
//     expect(['Active', 'Inactive']).toContain(statusText);
//   });

//   test('Error messages are shown when expected', async ({ page }) => {
//     // Trigger an action that you expect to fail
//     // For example, clicking convert without selecting languages or input code
  
//     // Check if the error message is displayed
//     const errorMessage = page.locator('selector-for-error-message'); // Adjust selector as needed
//     await expect(errorMessage).toBeVisible();
//     await expect(errorMessage).toHaveText('Expected error message'); // Adjust expected message as needed
//   });
  




//   test('UI elements react to hover', async () => {
//     // Hover over the language icons and check for the expected behavior
//   });

//   // Further tests can be added as necessary.
// });