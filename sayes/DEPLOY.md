# SAYES デプロイ手順

## 1. Supabase セットアップ

1. https://app.supabase.com でプロジェクト作成
2. SQL Editorで以下を順番に実行：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_stripe_fields.sql`
3. Settings → API から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 2. Google OAuth セットアップ

1. https://console.cloud.google.com → 新規プロジェクト作成
2. APIとサービス → 認証情報 → OAuthクライアントID作成
3. アプリケーションの種類：Webアプリケーション
4. 承認済みのリダイレクトURI：
   - `http://localhost:3000/api/auth/callback/google`（開発用）
   - `https://your-domain.vercel.app/api/auth/callback/google`（本番用）
5. クライアントID・シークレットを取得

## 3. Netlify セットアップ（生成HTML用）

1. https://app.netlify.com → 新規サイト作成（空のサイト）
2. User settings → Applications → Personal access tokens → 新規トークン作成
3. サイトのSettings → General → Site ID をコピー

## 4. Stripe セットアップ

1. https://dashboard.stripe.com → 商品カタログ → 商品を追加
2. 商品名：SAYES プロ / 価格：490円 / 請求期間：毎月
3. 作成された価格ID（`price_xxxx`）をコピー → `STRIPE_PRICE_ID`
4. 開発者 → APIキー → シークレットキーをコピー → `STRIPE_SECRET_KEY`
5. Webhooks → エンドポイントを追加：
   - URL：`https://your-domain.vercel.app/api/stripe/webhook`
   - イベント：`customer.subscription.created` `customer.subscription.updated` `customer.subscription.deleted`
   - 署名シークレットをコピー → `STRIPE_WEBHOOK_SECRET`

## 5. Vercel デプロイ

1. https://vercel.com → New Project → GitHubリポジトリを選択
2. Root Directory：`sayes`
3. Environment Variables に以下を設定：

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET        # openssl rand -base64 32 で生成
NEXTAUTH_URL           # https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NETLIFY_ACCESS_TOKEN
NETLIFY_SITE_ID
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

4. Deploy → 本番URLが発行される
5. Google OAuthのリダイレクトURIに本番URLを追加
6. StripeのWebhook URLを本番URLに更新
