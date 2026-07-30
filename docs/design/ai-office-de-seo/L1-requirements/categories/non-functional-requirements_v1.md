---
document_id: AOS-L1-NON-FUNCTIONAL-REQUIREMENTS
title: AI Office de SEO 非機能要求 v1.0
version: 1.0
layer: L1
kind: non_functional_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 非機能要求

## 責務

機能が成立するための性能、可用性、拡張性、保守性、復旧性、移植性を定義する。

重点:

- 主要一覧初期表示、操作応答、ジョブ投入のP95
- 画面シェル先行表示と部分読込
- クライアント配信量、API本数、DBクエリ数の予算
- DB容量、走査行数、保持量、増加率
- 増分計算、非同期化、キャッシュ、事前計算
- 可用性、RPO/RTO、バックアップ、復元演習
- graceful drain、後方互換migration、ロールバック
- VPSからクラウドへ移せる境界

性能はProduction Hardeningで後付けせず、各開発ユニットの受入条件に含める。

可用性目標に対するincident対応、SLA補償、成果非保証の境界は `incident-warranty-requirements_v1.md` を参照する。

既存ソース: `ai-office-de-seo-security-observability-requirements_v3.7.md` §6、`ai-office-de-seo-development-unit-roadmap_v3.7.md` §6〜10。
