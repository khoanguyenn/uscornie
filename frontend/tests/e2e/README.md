# E2E Testing Guide (Playwright)

Thư mục này được chừa sẵn để tích hợp Playwright E2E testing trong tương lai.

## Hướng dẫn cài đặt khi cần thêm E2E tests

1. Cài đặt Playwright test runner trong thư mục `frontend`:

   ```bash
   bun add -d @playwright/test
   ```

2. Cài đặt các trình duyệt cần thiết cho Playwright:

   ```bash
   npx playwright install
   ```

3. Tạo file cấu hình `playwright.config.ts` ở thư mục `frontend/`:

   ```typescript
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:5173',
       trace: 'on-first-retry',
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
       },
       {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] },
       },
       {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] },
       },
     ],
     webServer: {
       command: 'bun run dev',
       url: 'http://localhost:5173',
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

4. Tạo một bài test mẫu tại `tests/e2e/navigation.spec.ts`:

   ```typescript
   import { test, expect } from '@playwright/test';

   test('should navigate to the home page and have correct title', async ({ page }) => {
     await page.goto('/');
     await expect(page).toHaveTitle(/Home - Uscornie/);
   });
   ```

5. Chạy test E2E:

   ```bash
   bun run test:e2e
   ```
