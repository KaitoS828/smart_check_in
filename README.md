# Smart Check-in App

無人宿泊施設向けのセルフチェックインWebアプリケーション。生体認証（WebAuthn）とSecret Codeによる二段階認証でセキュアなチェックインを実現します。

## 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + RLS)
- **Authentication**: WebAuthn / FIDO2 (@simplewebauthn)
- **Deployment**: Vercel
- **Validation**: Zod

## 主な機能

### 1. Admin Dashboard (`/admin`)
- Basic認証による管理者保護
- 予約の作成と管理
- Secret Code自動生成（XXX-XXX-XXX形式）
- ゲスト登録URLの発行

### 2. Guest Registration (`/register/[id]`)
- 宿泊者名簿の入力（氏名・住所・連絡先）
- 生体認証デバイスの登録（Discoverable Credential / パスキー）
- Secret Code表示

### 3. Check-in (`/checkin`)
- 生体認証（ユーザー名なし認証 / Usernameless Authentication）
- Secret Code検証
- スマートロックPIN表示

### 4. セキュリティ
- FIDO2/WebAuthn準拠のパスキー認証
- 生体認証 + Secret Code の二段階認証
- セキュリティヘッダー（X-Frame-Options, CSP等）
- Admin Basic認証ミドルウェア
- 期限切れChallenge自動削除（Vercel Cron）

## セットアップ手順

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com) にアクセスし、新規プロジェクトを作成
2. プロジェクト設定から以下の情報を取得：
   - Project URL
   - Publishable key (anon key)
   - Secret key (service_role key)

### 2. データベース初期化

Supabase Dashboard → SQL Editor で `supabase/migrations/001_initial_schema.sql` の内容を実行。

以下のテーブルが作成されます：
- `reservations` - 予約情報
- `passkeys` - WebAuthnパスキー認証情報
- `challenges` - WebAuthnチャレンジ（5分で期限切れ）

### 3. 環境変数設定

`.env.local` を編集：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key

# WebAuthn
NEXT_PUBLIC_RP_NAME=Smart Check-in
NEXT_PUBLIC_RP_ID=localhost                    # 本番: yourdomain.com
NEXT_PUBLIC_ORIGIN=http://localhost:3000       # 本番: https://yourdomain.com

# Admin Authentication
ADMIN_PASSWORD=your-secure-password           # ユーザー名は "admin"

# Cron (optional, for Vercel)
CRON_SECRET=your-cron-secret
```

### 4. 開発サーバー起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス可能になります。

## 本番環境デプロイ (Vercel)

### 1. デプロイ

```bash
# GitHub にプッシュ後、Vercel でインポート
vercel --prod
```

### 2. 環境変数設定

Vercel Dashboard → Settings → Environment Variables で以下を設定：

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard から |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Secret key |
| `NEXT_PUBLIC_RP_NAME` | `Smart Check-in` | |
| `NEXT_PUBLIC_RP_ID` | `yourdomain.com` | ドメイン名のみ |
| `NEXT_PUBLIC_ORIGIN` | `https://yourdomain.com` | HTTPS必須 |
| `ADMIN_PASSWORD` | 強力なパスワード | Basic認証用 |
| `CRON_SECRET` | ランダム文字列 | Cron認証用 |

### 3. RLS厳格化

`supabase/migrations/001_initial_schema.sql` のコメントアウトされた本番用ポリシーを有効化。

## ディレクトリ構造

```
src/
├── app/
│   ├── admin/              # 管理者ダッシュボード
│   ├── checkin/            # 当日チェックイン
│   ├── register/[id]/      # ゲスト事前登録
│   ├── api/
│   │   ├── reservations/   # 予約管理API
│   │   ├── webauthn/       # WebAuthn API
│   │   └── cron/           # 定期実行API
│   ├── error.tsx           # エラーページ
│   ├── not-found.tsx       # 404ページ
│   ├── loading.tsx         # ローディング
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # ランディングページ
├── lib/
│   ├── supabase/           # Supabaseクライアント
│   ├── webauthn/           # WebAuthn設定
│   └── utils/              # ユーティリティ
└── middleware.ts            # Admin認証ミドルウェア
```

## トラブルシューティング

### WebAuthn が動作しない
- **localhost以外**: HTTPSが必須
- **RP ID不一致**: `.env.local` の `RP_ID` がドメインと一致しているか確認
- **対応ブラウザ**: Chrome, Safari, Firefox の最新版を使用
- **127.0.0.1**: `localhost` でアクセスしてください

### Challenge期限切れエラー
- Challengeは5分で期限切れ → 再度認証フローをやり直してください

### Supabase接続エラー
- `.env.local` の URL と Key が正しいか確認
- サーバー再起動: `npm run dev` を停止→再実行

### Admin認証
- ユーザー名: `admin`
- パスワード: `.env.local` の `ADMIN_PASSWORD` の値

## ライセンス

MIT
