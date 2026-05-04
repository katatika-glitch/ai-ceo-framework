# SAYES プロダクトステータス

## 概要
- **プロダクト名**：SAYES（セイイェス）
- **事業区分**：事業①（ウェブサイト制作）
- **位置づけ**：KATAkitの第一弾プロダクト / ウェブ制作事業のショーケース兼実績

## 現在のフェーズ
**実装完了 → 環境変数設定中（ローカル動作確認前）**

## ステータス
| 項目 | 状態 |
|------|------|
| アイデア | ✅ 確定 |
| 仮説検証 | ✅ 完了（CONDITIONAL GO） |
| 要件定義 | ✅ 完了 |
| 設計 | ✅ 完了 |
| 実装（Sprint 1・2） | ✅ 完了 |
| 環境変数設定 | 🔄 進行中 |
| ローカル動作確認 | ⏳ 未着手 |
| Vercelデプロイ | ⏳ 未着手 |
| Stripe設定 | ⏳ 未着手 |
| リリース | ⏳ 未着手 |

## 環境変数設定状況
| 変数 | 状態 |
|------|------|
| GOOGLE_CLIENT_ID / SECRET | ✅ 設定済み |
| NEXTAUTH_SECRET | ✅ 設定済み |
| NEXT_PUBLIC_SUPABASE_URL | ✅ 設定済み |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ 設定済み |
| SUPABASE_SERVICE_ROLE_KEY | ✅ 設定済み |
| NETLIFY_ACCESS_TOKEN | ✅ 設定済み |
| NETLIFY_SITE_ID | ✅ 設定済み（sayes-app-62e765e7.netlify.app） |
| ANTHROPIC_API_KEY | ⏳ 未設定 |
| STRIPE_SECRET_KEY | ⏳ 未設定（後回しOK） |
| STRIPE_PRICE_ID | ⏳ 未設定（後回しOK） |
| STRIPE_WEBHOOK_SECRET | ⏳ 未設定（後回しOK） |

## 技術スタック（確定）
- フロントエンド：Next.js 14 + Tailwind CSS
- ホスティング（本体）：Vercel
- 認証：NextAuth.js + Google OAuth
- DB：Supabase（PostgreSQL）
- AI：Claude Sonnet 4.6
- 生成HTMLデプロイ：Netlify API
- 決済：Stripe（月額490円）

## 実装済み機能
- Googleログイン・認証ガード
- 属性登録フォーム（5項目・選択式）
- セッション起動YES/NO（AI生成・2〜3問）
- AI提案エンジン（プロフィール×コンテキスト、重複排除）
- YES/NO精緻化インターフェース（最大4往復）
- 1ファイルHTML自動生成（Claude Sonnet 4.6）
- Netlify自動デプロイ → URL発行
- 実装ガイド生成（アフィリエイトリンク付き）
- コードダウンロード（.html）
- 無料2件制限・アップグレード誘導
- Stripe課金フロー（サブスク・Webhook）
- ランディングページ（/lp）
- ナビゲーションヘッダー

## 次のアクション
1. ANTHROPIC_API_KEY を設定
2. `npm run dev` でローカル動作確認（T-12）
3. Stripe商品作成（490円/月）
4. Vercelデプロイ
5. Google OAuthに本番URLを追加

## KPI（目標）
- Q3 2026：ベータリリース
- Q3 2026：初回ユーザー獲得

## 関連ドキュメント
- 要件定義書：`.company/products/sayes/REQUIREMENTS.md`
- Sprint 1計画：`.company/products/sayes/SPRINT-1.md`
- デプロイ手順：`sayes/DEPLOY.md`
- 決定ログ：`.company/decisions/2026-05.md`

---
最終更新：2026-05-04
