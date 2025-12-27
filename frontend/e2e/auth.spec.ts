import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /ログイン|サインイン/i })).toBeVisible();
  });

  test('顧客アカウントでログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('customer@reservation.local');
    await page.getByLabel(/パスワード/i).fill('Customer123!');
    await page.getByRole('button', { name: /ログイン/i }).click();

    // ログイン成功後、ホームページまたはマイページにリダイレクト
    await expect(page).toHaveURL(/\/(mypage)?$/);
  });

  test('店舗アカウントでログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('store@reservation.local');
    await page.getByLabel(/パスワード/i).fill('Store123!');
    await page.getByRole('button', { name: /ログイン/i }).click();

    // 店舗管理ページにリダイレクト
    await expect(page).toHaveURL(/\/store/);
  });

  test('無効な認証情報でエラーが表示される', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/メールアドレス/i).fill('invalid@test.com');
    await page.getByLabel(/パスワード/i).fill('wrongpassword');
    await page.getByRole('button', { name: /ログイン/i }).click();

    // エラーメッセージが表示される
    await expect(page.getByText(/エラー|失敗|無効/i)).toBeVisible();
  });
});
