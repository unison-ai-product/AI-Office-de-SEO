---
document_id: AOS-L1-DATA-REQUIREMENTS
title: AI Office de SEO データ要求 v1.0
version: 1.0
layer: L1
kind: data_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO データ要求

## 責務

データの正本、境界、保持、鮮度、容量、履歴、削除を定義する。

必須項目:

- データ所有者とtenant/site境界
- 業務上の正本と外部正本
- 主キー、参照キー、version
- 増加単位と想定増加率
- 保持期間、容量上限、ロールアップ、削除
- freshness、availability、confidence、source reference
- 本文非保持、一時本文TTL、ArticleSummary
- 移行、エクスポート、復元、オフボーディング

原則:

- DBを取得データの無制限保管庫にしない。
- 本文、生HTML、LLM raw response、プロンプト全文を恒久DBへ置かない。
- 検索・推薦に必要な小さい事実と事前計算read modelを保持する。

既存ソース: `ai-office-de-seo-product-requirements_v3.7.md`、`ai-office-de-seo-keyword-gsc-article-map-requirements_v3.7.md`、`ai-office-de-seo-security-observability-requirements_v3.7.md`。

