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

