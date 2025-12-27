# デプロイ手順書

## 概要

| コンポーネント | プラットフォーム | URL形式 |
|---------------|-----------------|---------|
| フロントエンド | Vercel | `https://xxx.vercel.app` |
| バックエンド | Render | `https://xxx.onrender.com` |
| データベース | Neon (PostgreSQL) | 既存のNeon DBを使用 |

---

## 1. バックエンド (Render)

### 手順

1. **Render ダッシュボード** → New → Web Service
2. GitHub リポジトリを接続
3. 設定:
   - **Name**: `restaurant-reservation-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | Neon PostgreSQL接続URL | `postgresql+asyncpg://...` |
| `SECRET_KEY` | アプリシークレット | 自動生成推奨 |
| `JWT_SECRET_KEY` | JWT署名キー | 自動生成推奨 |
| `CORS_ORIGINS` | フロントエンドURL | `["https://xxx.vercel.app"]` |
| `STRIPE_SECRET_KEY` | Stripe秘密鍵 | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripeウェブフック秘密 | `whsec_...` |
| `DEBUG` | デバッグモード | `false` |

---

## 2. フロントエンド (Vercel)

### 手順

1. **Vercel ダッシュボード** → New Project
2. GitHub リポジトリをインポート
3. 設定:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_API_URL` | バックエンドAPI URL | `https://xxx.onrender.com/api/v1` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe公開鍵 | `pk_live_...` |

---

## 3. データベースマイグレーション

```bash
# Render Shell または ローカルから実行
cd backend
alembic upgrade head
```

---

## 4. デプロイ後の確認

1. ヘルスチェック: `GET https://xxx.onrender.com/health`
2. API ドキュメント: `https://xxx.onrender.com/api/v1/docs`
3. フロントエンド: `https://xxx.vercel.app`

---

## 5. Stripe Webhook設定

1. Stripe ダッシュボード → Developers → Webhooks
2. エンドポイント追加: `https://xxx.onrender.com/api/v1/payments/confirm`
3. イベント選択: `payment_intent.succeeded`
4. Webhook Secret を `STRIPE_WEBHOOK_SECRET` に設定
