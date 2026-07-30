---
document_id: AOS-L1-SECURITY-ACCESS-REQUIREMENTS
title: AI Office de SEO セキュリティ・権限要求 v1.0
version: 1.0
layer: L1
kind: security_access_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO セキュリティ・権限要求

## 責務

認証、認可、テナント分離、秘密情報、監査、データ保護を定義する。

重点:

- User / Tenant / Site / Role / Jobの境界
- SiteSandboxContextとdefault-deny
- 共有DB上のID型論理分離
- Repository単一強制ポイントとRLS
- OAuth token、API key、Webhook secret、KMS
- step-up認証、招待、全端末失効、Owner回復
- Executorの直DB禁止
- 監査ログ、なりすまし、越境負テスト
- 一時本文、ログ、キャッシュ、キュー、オブジェクトの分離

既存ソース: `ai-office-de-seo-security-observability-requirements_v3.7.md`、`ai-office-de-seo-product-requirements_v3.7.md` §2/8/10。

## 要求

### REQ-ACCESS-01 管理面の分離

顧客ユーザー面と開発管理面は、認証対象、セッション、認可ポリシー、ルートまたはホスト、監査を分離する。顧客側UserまたはCustomer Organization Roleでは開発管理面のトークンを取得できず、URLまたはAPIを直接指定してもdefault-denyで拒否する。

### REQ-ACCESS-02 内部Role境界

Adminは内部権限の付与、Managerは期限・顧客・Site・操作種別を限定した顧客運用、Operatorは機微情報を除去した開発ログ・メトリクス・トレースの閲覧に限定する。Operatorの観測面に記事本文、秘密情報、プロンプト全文、不要な個人情報を表示しない。

### REQ-ACCESS-03 期限付き顧客アクセス

Managerが顧客データへアクセスする場合、Adminによる付与を必須とし、対象、目的、理由、Permission、有効期限、付与者を記録して期限到達時に自動失効する。アクセスと変更はacting user、target organization、対象resource、変更前後を監査する。

## 受入条件

- [ ] AC-ACCESS-01: 顧客ユーザーの資格情報で開発管理画面・APIへアクセスできない。
- [ ] AC-ACCESS-02: Operatorが顧客データ変更、本文、秘密情報へアクセスできない。
- [ ] AC-ACCESS-03: AdminだけがManagerの顧客アクセスを付与でき、許可範囲外と期限後のアクセスが拒否される。
