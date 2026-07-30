---
document_id: AOS-L1-BILLING-ACCOUNTING-REQUIREMENTS
title: AI Office de SEO 課金・会計要求 v1.0
version: 1.0
layer: L1
kind: billing_accounting_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 課金・会計要求

## 責務

料金、請求、クレジット、原価、返金、残高、会計整合を定義する。

重点:

- システム利用料とAI実行クレジットの分離
- 見積、reserve、commit、release、refund
- append-only ledgerと残高導出
- 有効期限、繰越、失効、消費順
- Stripe subscription、invoice、webhook、idempotency
- upgrade、downgrade、解約、返金
- Provider原価、為替、粗利、価格改定
- 顧客・サイト・タスク・モデル別の原価帰属

利用量の技術観測は計測・運用要求、価格判断はL0ビジネス要求を参照する。

既存ソース: `ai-office-de-seo-billing-credit-provider-requirements_v3.7.md`、L0ビジネス要求。

