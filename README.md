# Smart Check-in App

無人宿泊施設向けのセルフチェックインWebアプリケーション。生体認証（WebAuthn）とSecret Codeによる二段階認証でセキュアなチェックインを実現します。

## 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: WebAuthn (@simplewebauthn)
- **Deployment**: Vercel

## 主な機能

### 1. Admin Dashboard (`/admin`)
- 予約の作成と管理
- Secret Code自動生成
- ゲスト登録URLの発行

### 2. Guest Registration (`/register/[id]`)
- 宿泊者名簿の入力
- 生体認証デバイスの登録（パスキー）
- Secret Code表示

### 3. Check-in (`/checkin`)
- 生体認証（ユーザー名なし認証）
- Secret Code検証
- スマートロックPIN表示

## セットアップ手順

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com) にアクセスし、新規プロジェクトを作成
2. プロジェクト設定から以下の情報を取得：
   - Project URL
   - Anon public key
   - Service role key (秘密情報)

### 2. データベース初期化

Supabase Dashboard → SQL Editor で以下を実行：

```bash
# supabase/migrations/001_initial_schema.sql の内容をコピー&ペースト
```

### 3. 環境変数設定

`.env.local` を編集して、Supabase接続情報を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_RP_NAME=Smart Check-in
NEXT_PUBLIC_RP_ID=localhost
NEXT_PUBLIC_ORIGIN=http://localhost:3000

ADMIN_PASSWORD=your-secure-password
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能になります。

## ディレクトリ構造

```
smart-checkin-app/
├── app/
│   ├── admin/              # 管理者ダッシュボード
│   ├── register/[id]/      # ゲスト事前登録
│   ├── checkin/            # 当日チェックイン
│   └── api/                # API Routes
│       ├── reservations/   # 予約管理API
│       └── webauthn/       # WebAuthn API
├── lib/
│   ├── supabase/           # Supabaseクライアント
│   ├── webauthn/           # WebAuthn設定
│   └── utils/              # ユーティリティ
└── supabase/
    └── migrations/         # DBマイグレーション
```

## 開発ガイド

### WebAuthn について

このアプリは**ユーザー名なし認証**（Usernameless Authentication）を採用しています。

- **Registration**: `residentKey: 'required'` で Discoverable Credential を有効化
- **Authentication**: `allowCredentials` を指定せず、クライアント側で全パスキーを検索
- **User Discovery**: 認証成功後、`credentialID` から該当の予約を特定

### Secret Code について

- **フォーマット**: `XXX-XXX-XXX` (3グループ × 3文字)
- **文字セット**: `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (32文字)
  - 紛らわしい文字を除外: `0/O`, `1/I/l`
- **エントロピー**: 32^9 ≈ 35兆通り

### セキュリティ考慮事項

1. **HTTPS必須**: WebAuthnは本番環境でHTTPS必須（localhost除く）
2. **Service Role Key**: `.env.local` をgitに含めない（`.gitignore`で除外）
3. **RLS**: 開発環境は全許可、本番環境では厳格化すること
4. **RP ID**: 本番環境では実際のドメインに変更必須

## 本番環境デプロイ

### Vercelデプロイ

```bash
# GitHub にプッシュ後、Vercel でインポート
vercel --prod
```

### 環境変数更新

Vercel Dashboard → Settings → Environment Variables で設定：

```env
NEXT_PUBLIC_RP_ID=yourdomain.com  # プロトコル・ポート除く
NEXT_PUBLIC_ORIGIN=https://yourdomain.com
ADMIN_PASSWORD=本番用強力パスワード
```

### RLS厳格化

`supabase/migrations/001_initial_schema.sql` のコメントアウトされた本番用ポリシーを有効化。

## トラブルシューティング

### WebAuthn が動作しない

- **localhost以外**: HTTPSが必須
- **RP ID不一致**: `.env.local` のRP_IDがドメインと一致しているか確認
- **対応ブラウザ**: Chrome, Safari, Firefox の最新版を使用

### Challenge期限切れエラー

- Challengeは5分で期限切れ
- 再度認証フローをやり直してください

### Supabase接続エラー

- `.env.local` の URL と Key が正しいか確認
- Supabase Dashboard でプロジェクトが起動しているか確認

## ライセンス

MIT
