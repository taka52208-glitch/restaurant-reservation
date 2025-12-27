import { test, expect } from '@playwright/test';

test.describe('予約フロー', () => {
  test.beforeEach(async ({ page }) => {
    // 顧客としてログイン
    await page.goto('/login');
    await page.getByLabel(/メールアドレス/i).fill('customer@reservation.local');
    await page.getByLabel(/パスワード/i).fill('Customer123!');
    await page.getByRole('button', { name: /ログイン/i }).click();
    await page.waitForURL(/\//);
  });

  test('マイページで予約履歴が表示される', async ({ page }) => {
    await page.goto('/mypage');

    // マイページのコンテンツが表示される
    await expect(page.getByText(/予約|履歴|マイページ/i)).toBeVisible();
  });

  test('店舗詳細で予約フォームが表示される', async ({ page }) => {
    await page.goto('/');

    // 店舗カードをクリック
    const restaurantCard = page.locator('[data-testid="restaurant-card"], .restaurant-card, .MuiCard-root').first();
    await restaurantCard.click();

    // 店舗詳細ページで予約関連の要素が表示される
    await expect(page.getByText(/予約|空席|日時/i)).toBeVisible();
  });
});

test.describe('店舗管理者フロー', () => {
  test.beforeEach(async ({ page }) => {
    // 店舗として ログイン
    await page.goto('/login');
    await page.getByLabel(/メールアドレス/i).fill('store@reservation.local');
    await page.getByLabel(/パスワード/i).fill('Store123!');
    await page.getByRole('button', { name: /ログイン/i }).click();
    await page.waitForURL(/\/store/);
  });

  test('予約管理ページが表示される', async ({ page }) => {
    await page.goto('/store/reservations');
    await expect(page.getByText(/予約/i)).toBeVisible();
  });

  test('店舗設定ページが表示される', async ({ page }) => {
    await page.goto('/store/settings');
    await expect(page.getByText(/店舗|設定/i)).toBeVisible();
  });

  test('売上管理ページが表示される', async ({ page }) => {
    await page.goto('/store/sales');
    await expect(page.getByText(/売上/i)).toBeVisible();
  });
});
