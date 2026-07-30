---
document_id: AOS-L1-REQUIREMENTS-INDEX
title: AI Office de SEO 要求体系
version: 1.0
layer: L1
kind: requirements_index
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 要求体系

## 1. 目的

要求を機能別の大文書へ混在させず、判断の種類ごとに分離する。各要求は1つの分類を正本とし、他分類からは要求IDで参照する。

既存のv3.7要求文書は削除しない。移行期間中の詳細ソースとして維持し、新規要求・大幅改訂は以下の分類別正本へ追加する。既存要求を移す場合も要求IDを変更しない。

## 2. 要求分類

| # | 分類 | 正本 | 主な問い |
|---|---|---|---|
| 1 | 業務要求 | `categories/business-requirements_v1.md` | 誰が何を達成するか |
| 2 | ロジック要求 | `categories/logic-requirements_v1.md` | 何を入力にどう判定するか |
| 3 | データ要求 | `categories/data-requirements_v1.md` | 何を正本として保持・削除するか |
| 4 | 画面・操作要求 | `categories/screen-operation-requirements_v1.md` | 何を表示し、どう操作するか |
| 5 | 外部連携要求 | `categories/integration-requirements_v1.md` | 外部サービスと何を交換するか |
| 6 | 非機能要求 | `categories/non-functional-requirements_v1.md` | どの品質水準で動かすか |
| 7 | セキュリティ・権限要求 | `categories/security-access-requirements_v1.md` | 誰が何へアクセスできるか |
| 8 | デザイン・体験要求 | `categories/design-experience-requirements_v1.md` | どう理解・体験させるか |
| 9 | 課金・会計要求 | `categories/billing-accounting-requirements_v1.md` | 金銭・クレジットをどう整合させるか |
| 10 | 計測・運用要求 | `categories/measurement-operations-requirements_v1.md` | 何を測り、異常時にどう運用するか |

## 3. 分類ルール

- 1要求1正本: 同じ要求本文を複数文書へコピーしない。
- 接続はID参照: 画面要求がロジックを再定義せず、ロジック要求IDを参照する。
- ロジックは実装可能に書く: 入力、前提、正規化、判定式、状態、例外、出力、再計算、受入条件を持つ。
- データは有界に書く: 所有者、正本、増加単位、保持期間、容量上限、削除・ロールアップを持つ。
- 非機能は数値化する: 初期値が未確定でも、計測点、分位、負荷条件、確定時期を定義する。
- 外部仕様と内部判断を分離する: API制約は外部連携、優先順位計算はロジックへ置く。
- UIは計算しない: UIはロジック結果を表示・操作し、独自判定を持たない。
- 受入条件は各分類の要求IDへ接続し、横断一覧を `ai-office-de-seo-acceptance-trace_v3.7.md` に置く。

## 4. 詳細ロジック文書

| 対象 | 文書 | 状態 |
|---|---|---|
| キーワード動的レコメンド | `logic/keyword-dynamic-recommendation-logic-requirements_v1.md` | 初版 |

## 5. 既存文書の移行方針

既存文書は一度に分解しない。要求を更新するタイミングで、該当要求を分類別正本へ移し、元文書には移行先を記録する。移行完了までは既存要求IDと本文が有効である。

