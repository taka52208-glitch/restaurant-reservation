import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = 'http://localhost:8432/api/v1';

describe('API Integration Tests', () => {
  describe('Restaurants API', () => {
    it('GET /restaurants - 店舗一覧を取得できる', async () => {
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('genre');
      expect(data[0]).toHaveProperty('area');
    });

    it('GET /restaurants/:id - 店舗詳細を取得できる', async () => {
      // まず店舗一覧を取得
      const listResponse = await fetch(`${API_BASE_URL}/restaurants`);
      const restaurants = await listResponse.json();
      const restaurantId = restaurants[0].id;

      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.id).toBe(restaurantId);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
    });

    it('GET /restaurants/:id/availability - 空席確認ができる', async () => {
      const listResponse = await fetch(`${API_BASE_URL}/restaurants`);
      const restaurants = await listResponse.json();
      const restaurantId = restaurants[0].id;

      const params = new URLSearchParams({
        date: '2025-01-15',
        time: '18:00',
        party_size: '2'
      });

      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/availability?${params}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('available');
      expect(data).toHaveProperty('restaurant_id');
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('time');
      expect(data).toHaveProperty('party_size');
    });
  });

  describe('Auth API', () => {
    it('POST /auth/login - ログインできる', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'customer@reservation.local',
          password: 'Customer123!'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data).toHaveProperty('token_type');
    });

    it('POST /auth/login - 無効な認証情報でエラー', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'invalid@test.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
    });

    it('GET /users/me - 認証済みユーザー情報を取得できる', async () => {
      // ログインしてトークンを取得
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'customer@reservation.local',
          password: 'Customer123!'
        })
      });
      const { access_token } = await loginResponse.json();

      // ユーザー情報を取得
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('email');
      expect(data.email).toBe('customer@reservation.local');
    });
  });

  describe('Reservations API', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'customer@reservation.local',
          password: 'Customer123!'
        })
      });
      const data = await loginResponse.json();
      accessToken = data.access_token;
    });

    it('GET /reservations/my - 自分の予約一覧を取得できる', async () => {
      const response = await fetch(`${API_BASE_URL}/reservations/my`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Admin API', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'admin@reservation.local',
          password: 'Admin123!'
        })
      });
      const data = await loginResponse.json();
      accessToken = data.access_token;
    });

    it('GET /admin/restaurants - 管理者が店舗一覧を取得できる', async () => {
      const response = await fetch(`${API_BASE_URL}/admin/restaurants`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /admin/sales/summary - 売上サマリーを取得できる', async () => {
      const response = await fetch(`${API_BASE_URL}/admin/sales/summary`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('total_sales');
      expect(data).toHaveProperty('total_reservations');
    });
  });
});
