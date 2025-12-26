# 飲食店予約サイト バックエンドAPI

FastAPI + SQLAlchemy + PostgreSQL で構築された予約管理APIです。

## 技術スタック

- Python 3.12+
- FastAPI 0.115+
- SQLAlchemy 2.0+ (async)
- PostgreSQL (Neon推奨)
- Alembic (マイグレーション)
- JWT認証

## セットアップ

### 1. 依存関係のインストール

```bash
# uvを使用する場合（推奨）
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# または pip を使用する場合
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 2. 環境変数の設定

```bash
cp .env.example .env
# .env を編集して必要な値を設定
```

### 3. データベースのマイグレーション

```bash
alembic upgrade head
```

### 4. 開発サーバーの起動

```bash
uvicorn app.main:app --reload --port 8432
```

## API ドキュメント

サーバー起動後、以下のURLでAPIドキュメントを確認できます：

- Swagger UI: http://localhost:8432/docs
- ReDoc: http://localhost:8432/redoc

## ディレクトリ構造

```
backend/
├── app/
│   ├── api/v1/          # APIエンドポイント
│   │   └── endpoints/
│   ├── core/            # 設定、セキュリティ
│   ├── db/              # データベース設定
│   ├── models/          # SQLAlchemyモデル
│   ├── schemas/         # Pydanticスキーマ
│   ├── services/        # ビジネスロジック
│   └── main.py          # アプリケーションエントリポイント
├── alembic/             # マイグレーション
├── tests/               # テスト
└── pyproject.toml       # 依存関係
```

## テストアカウント

開発環境では以下のモックユーザーが使用できます（フロントエンド側で定義）：

| ロール | メールアドレス | パスワード |
|--------|---------------|-----------|
| 顧客 | customer@reservation.local | Customer123! |
| 店舗 | store@reservation.local | Store123! |
| 管理者 | admin@reservation.local | Admin123! |

## APIエンドポイント

### 認証
- `POST /api/v1/auth/login` - ログイン
- `POST /api/v1/auth/register` - 会員登録

### ユーザー
- `GET /api/v1/users/me` - 現在のユーザー情報

### 店舗
- `GET /api/v1/restaurants` - 店舗一覧
- `GET /api/v1/restaurants/{id}` - 店舗詳細
- `POST /api/v1/restaurants` - 店舗登録（店舗ユーザー）
- `PUT /api/v1/restaurants/{id}` - 店舗更新（店舗ユーザー）

### 予約
- `GET /api/v1/reservations/my` - 自分の予約一覧
- `POST /api/v1/reservations` - 予約作成
- `PUT /api/v1/reservations/{id}/cancel` - 予約キャンセル

### 管理者
- `GET /api/v1/admin/restaurants` - 全店舗一覧
- `PUT /api/v1/admin/restaurants/{id}/approve` - 店舗承認
- `GET /api/v1/admin/sales/summary` - 売上サマリー
