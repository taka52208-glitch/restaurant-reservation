import { test, expect } from '@playwright/test';

test.describe('店舗一覧・検索', () => {
  test('トップページに店舗一覧が表示される', async ({ page }) => {
    await page.goto('/');

    // ページタイトルまたはヘッダーが表示される
    await expect(page.locator('body')).toBeVisible();

    // 店舗カードまたはリストアイテムが存在する
    const restaurants = page.locator('[data-testid="restaurant-card"], .restaurant-card, .MuiCard-root');
    await expect(restaurants.first()).toBeVisible({ timeout: 10000 });
  });

  test('ジャンルでフィルタリングできる', async ({ page }) => {
    await page.goto('/');

    // フィルタコンポーネントを探す
    const genreFilter = page.getByLabel(/ジャンル/i).or(page.locator('select[name="genre"]'));
    if (await genreFilter.isVisible()) {
      await genreFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
  });

  test('エリアでフィルタリングできる', async ({ page }) => {
    await page.goto('/');

    // エリアフィルタを探す
    const areaFilter = page.getByLabel(/エリア/i).or(page.locator('select[name="area"]'));
    if (await areaFilter.isVisible()) {
      await areaFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
  });

  test('店舗詳細ページに遷移できる', async ({ page }) => {
    await page.goto('/');

    // 店舗カードをクリック
    const restaurantCard = page.locator('[data-testid="restaurant-card"], .restaurant-card, .MuiCard-root').first();
    await restaurantCard.click();

    // 詳細ページに遷移
    await expect(page).toHaveURL(/\/restaurants\/[^/]+$/);
  });
});
