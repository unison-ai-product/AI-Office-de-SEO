---
document_id: AOS-L1-BILLING-ACCOUNTING-REQUIREMENTS
title: AI Office de SEO 課金・会計要求 v1.1
version: 1.1
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

利用量の技術観測は計測・運用要求、提供原価はコスト要求、価格判断はL0ビジネス要求を参照する。

障害時の返還・補償判断は障害対応・保証要求、上位プラン・追加購入の提案条件は成長・アップセル要求を参照する。

既存ソース: `ai-office-de-seo-billing-credit-provider-requirements_v3.7.md`、L0ビジネス要求。

## 利用枠要求

### REQ-BILLING-01 プラン内利用上限と追加クレジット

各プランは月間の利用上限と、1週間に作成できる記事数の上限を持つ。プラン内利用枠を超える実行は追加クレジットで購入できる。

週次上限には、商品上のプラン内上限と、WordPress、外部API、実行基盤への集中アクセスを防ぐ技術的レート上限を区別して持つ。追加クレジットは商品上の利用枠を追加するが、安全上の同時実行数、レート、キュー制御を解除しない。

## 受入条件

- [ ] AC-BILLING-01: プラン内月間・週次利用量、追加クレジット消費、残り利用可能量を区別して確認できる。
- [ ] AC-BILLING-02: 追加クレジットを保有していても技術的レート上限を超えて同時実行されない。
