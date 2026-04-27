const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshots() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();

  console.log('1. Homepage / Login');
  await page.goto('http://localhost:5173/');
  await delay(2000);
  await page.screenshot({ path: path.join(screenshotsDir, '1_home_login.png') });

  // Let's login as admin
  console.log('2. Admin Dashboard');
  await page.type('input[placeholder*="Email"]', 'admin@example.com');
  await page.type('input[placeholder*="Пароль"]', 'admin123');
  await page.click('button[type="submit"]');
  await delay(2000);
  await page.screenshot({ path: path.join(screenshotsDir, '2_admin_dashboard.png') });
  
  // Logout and login as teacher
  await page.click('button.logout-btn');
  await delay(1000);
  
  console.log('3. Teacher Dashboard (CREATE & READ)');
  await page.type('input[placeholder*="Email"]', 'teacher@example.com');
  await page.type('input[placeholder*="Пароль"]', 'teacher123');
  await page.click('button[type="submit"]');
  await delay(2000);
  await page.screenshot({ path: path.join(screenshotsDir, '3_teacher_dashboard.png') });

  // Open test creation form (Forms)
  console.log('4. Create Test Form');
  await page.click('.create-test-btn');
  await delay(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '4_create_test_form.png') });

  // Create a test to get to details page
  await page.type('input[name="title"]', 'Автотест');
  await page.type('textarea[name="description"]', 'Puppeteer арқылы құрылған тест');
  await page.select('select[name="groupName"]', 'БҚ-2305');
  await page.type('input[name="timeLimit"]', '10');
  
  await page.click('button[type="submit"]');
  await delay(2000);

  console.log('5. Test Details (UPDATE, READ)');
  await page.screenshot({ path: path.join(screenshotsDir, '5_test_details.png') });
  
  // Back to teacher dashboard
  await page.goto('http://localhost:5173/teacher');
  await delay(2000);
  
  // Login as student
  await page.click('button.logout-btn');
  await delay(1000);
  
  console.log('6. Student Registration Form (Validation)');
  await page.click('.toggle-auth-btn'); // Switch to register
  await delay(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '6_student_register_form.png') });
  
  await page.type('input[name="name"]', 'Student Test');
  await page.type('input[name="email"]', 'student_test@example.com');
  await page.type('input[name="password"]', 'student123');
  // Assume select role is student by default, group name needs selection
  await page.select('select[name="groupName"]', 'БҚ-2305');
  await page.click('button[type="submit"]');
  await delay(2000);

  console.log('7. Student Dashboard');
  await page.screenshot({ path: path.join(screenshotsDir, '7_student_dashboard.png') });
  
  console.log('Done! Closing browser.');
  await browser.close();
}

takeScreenshots().catch(console.error);
