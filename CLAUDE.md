# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: 飲食店予約サイト
開始日: 2025-12-25
技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v6 + Vite 5
  backend: Python 3.12 + FastAPI + SQLAlchemy
  database: PostgreSQL (Neon)
```

## 開発環境
```yaml
ポート設定:
  frontend: 3247
  backend: 8432
  database: 5433

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - DATABASE_URL
    - STRIPE_SECRET_KEY
    - STRIPE_PUBLISHABLE_KEY
    - JWT_SECRET_KEY
```

## テスト認証情報
```yaml
開発用アカウント:
  顧客:
    email: customer@reservation.local
    password: Customer123!
  店舗:
    email: store@reservation.local
    password: Store123!
  運営:
    email: admin@reservation.local
    password: Admin123!

外部サービス:
  Stripe: テストモードのAPIキーを使用
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: UserProfile.tsx)
  - ユーティリティ: camelCase.ts (例: formatDate.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - 関数行数: 100行以下
  - ファイル行数: 700行以下
  - 複雑度(McCabe): 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/users, /restaurants, /reservations)
  - ケバブケース使用 (/payment-intents)

主要エンドポイント:
  - POST /api/auth/register - 会員登録
  - POST /api/auth/login - ログイン
  - GET /api/restaurants - 店舗一覧
  - GET /api/restaurants/:id - 店舗詳細
  - POST /api/reservations - 予約作成
  - GET /api/reservations - 予約一覧
  - POST /api/payments/create-intent - Stripe決済Intent作成
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: src/schemas/

同期ルール:
  - フロントエンドとバックエンドで型定義を一致させる
  - APIレスポンスの型は自動生成を検討
```

### ディレクトリ構造
```yaml
frontend/:
  src/
    components/     # 共通コンポーネント
    pages/          # ページコンポーネント
    hooks/          # カスタムフック
    stores/         # Zustand ストア
    types/          # 型定義
    utils/          # ユーティリティ関数
    api/            # API呼び出し関数

backend/:
  src/
    api/            # ルーター
    models/         # SQLAlchemyモデル
    schemas/        # Pydanticスキーマ
    services/       # ビジネスロジック
    core/           # 設定、認証など
```

## 最新技術情報（知識カットオフ対応）
```yaml
注意点:
  - Stripe: Payment Intents APIを使用（Charges APIは非推奨）
  - React: useEffectの依存配列に注意
  - FastAPI: async/awaitを積極的に使用
```
