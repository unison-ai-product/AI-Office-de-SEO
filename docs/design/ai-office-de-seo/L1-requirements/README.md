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
| 11 | コスト要求 | `categories/cost-requirements_v1.md` | 何にいくらかかり、どこで止めるか |
| 12 | 障害対応・保証要求 | `categories/incident-warranty-requirements_v1.md` | 障害時にどう守り、復旧・補償するか |
| 13 | 成長・アップセル要求 | `categories/growth-upsell-requirements_v1.md` | いつ何を根拠に追加提案するか |
| 14 | ユーザー組織・権限統制要求 | `categories/customer-organization-governance-requirements_v1.md` | 顧客組織の所属・承認・予算・権限をどう統治するか |
| 15 | 開発管理・画面制御要求 | `categories/platform-administration-control-requirements_v1.md` | 開発・運用側が画面から何を安全に制御するか |
| 16 | 技術・アーキテクチャ要求 | `categories/technical-architecture-requirements_v1.md` | 実装全体が守る技術方針・境界・処理方式は何か |

## 3. 分類ルール

- 1要求1正本: 同じ要求本文を複数文書へコピーしない。
- 接続はID参照: 画面要求がロジックを再定義せず、ロジック要求IDを参照する。
- ロジックは実装可能に書く: 入力、前提、正規化、判定式、状態、例外、出力、再計算、受入条件を持つ。
- データは有界に書く: 所有者、正本、増加単位、保持期間、容量上限、削除・ロールアップを持つ。
- 非機能は数値化する: 初期値が未確定でも、計測点、分位、負荷条件、確定時期を定義する。
- 外部仕様と内部判断を分離する: API制約は外部連携、優先順位計算はロジックへ置く。
- UIは計算しない: UIはロジック結果を表示・操作し、独自判定を持たない。
- 原価と請求を分離する: コスト要求は提供原価、課金・会計要求は顧客請求と台帳を正本にする。
- 障害と通常運用を分離する: 計測・運用は平常時、障害対応・保証はincident、復旧、補償、責任境界を正本にする。
- アップセルは根拠を持つ: 成長提案は利用上限、実行不足、統制、支援、経済適合から判定し、製品不具合を課金で解決させない。
- 顧客組織と運営組織を分離する: ユーザー企業の階層・所属・承認・予算と、プラットフォーム内部Roleを同じ権限体系へ混在させない。
- UI制御を認可にしない: 画面の非表示・無効化とサーバー側Permission判定は同じポリシーを参照し、UIだけでアクセスを防がない。
- 管理画面も安全境界を越えない: 通常運用は管理画面で解決可能にしつつ、安全不変条件は内部Roleや設定でも解除不能にする。
- 技術方針と詳細設計を分離する: L1技術要求は全実装が守る制約、L2/L3は具体的な構成・API・テーブル・採用技術を正本にする。
- 既存v3.7受入条件は `AC-{領域}-{番号}`、分類別L1正本の受入条件は `AC-L1-{領域}-{番号}` を安定IDとする。世代を示さないIDを分類別正本へ新設しない。
- 受入条件は各分類の要求IDへ接続し、横断一覧を `ai-office-de-seo-acceptance-trace_v3.7.md` に置く。分類別正本のAC追加・変更時は同一変更で横断一覧を更新し、CIで欠落・重複・参照切れを検査する。
- REQとACは1対1を必須としない。1要求を境界値・正常系・異常系の複数ACで検証する場合は、各ACの `検証` が同じREQを明示し、番号一致だけで対応を推測しない。

## 4. 詳細ロジック文書

| 対象 | 文書 | 状態 |
|---|---|---|
| キーワード動的レコメンド | `logic/keyword-dynamic-recommendation-logic-requirements_v1.md` | 初版 |
| Article Summary抽出・不足判定 | `logic/article-summary-completeness-logic-requirements_v1.md` | 未起票 |
| Query Drift・カニバリ・カバー率 | `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md` | 未起票 |
| 品質ゲート・Repair・Routing | `logic/content-quality-repair-routing-logic-requirements_v1.md` | 未起票 |

## 5. 横断監査

確定した横断判断と未確定事項の監査には `ai-office-de-seo-requirements-decision-summary_v1.md` を使用する。同文書は進捗管理表ではなく、分類別正本への索引である。

## 6. 既存文書の移行方針

既存文書は一度に分解しない。要求を更新するタイミングで、該当要求を分類別正本へ移し、元文書には移行先を記録する。移行完了までは既存要求IDと本文が有効である。
