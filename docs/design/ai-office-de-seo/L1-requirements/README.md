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

### 3.1 画面検証とL3確定の順序

開発順序は `L1要求整理 → L2業務・ドメイン整理 → 通常ビュー／Officeビューの画面・遷移・fixture検証 → 発見差分をL1/L2へ反映 → L3実装詳細確定` とする。画面を作ることで要求が変わることを通常の検証結果として扱い、L3のAPI、DDL、Event、Config、採用技術を画面検証前に最終凍結しない。

画面検証中に使う既存L3 Contract、Gate A、DDL、Eventは、安全境界、相関、冪等性、保存禁止等を壊さないための暫定baselineである。画面側を暫定L3へ無理に合わせず、不足情報、不要状態、操作不能、責務ずれを`screen finding`として記録し、先にL1/L2の意味を直す。L3はその結果から再生成・改版し、実装着手時にversion固定する。セキュリティ境界、tenant／Site分離、課金台帳のappend-only等の安全不変条件は、この順序変更でも緩和しない。

## 4. 詳細ロジック文書

| 対象 | 文書 | 状態 |
|---|---|---|
| キーワード動的レコメンド | `logic/keyword-dynamic-recommendation-logic-requirements_v1.md` | 初版 |
| Article Summary抽出・不足判定 | `logic/article-summary-completeness-logic-requirements_v1.md` | 初版 |
| Query Drift・カニバリ・カバー率 | `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md` | 初版 |
| 品質ゲート・Repair・Routing | `logic/content-quality-repair-routing-logic-requirements_v1.md` | 初版 |
| SEO／AIクローラー取得性・AI回答表示性 | `logic/crawler-ai-visibility-logic-requirements_v1.md` | 初版 |

## 4.1 エージェント要求体系

Agent関連要求は分類別正本だけからゼロベースで追加しない。変更前に `ai-office-de-seo-agent-requirements-map_v1.md` を起点として、既存の `REQ-AGENT-*`、`REQ-PACK-*`、`REQ-AOUI-*` との接続を確認する。

| 対象 | 正本／索引 |
|---|---|
| 横断責務・変更監査 | `ai-office-de-seo-agent-requirements-map_v1.md` |
| Executor・Workflow・状態機械 | `ai-office-de-seo-agent-runtime-requirements_v3.7.md` |
| Pack・Ticket・Source・Schema・Gate | `ai-office-de-seo-pack-ticket-schema-requirements_v3.7.md` |
| Agent Officeのペルソナ・工程表示 | `ai-office-de-seo-agent-office-ui-requirements_v3.7.md` |

分類別文書へAgent関連の業務入力・判断を追加する場合も、実行方式は既存REQ-IDを参照する。既存構造で表現できない場合だけ、影響する旧要求と受入条件を同一変更で改版する。

## 4.2 認可・業務操作体系

顧客基本権限、業務権限、Site Assignment、Agent、Automation、CMS副作用、内部Roleの操作別接続は`ai-office-de-seo-authorization-operation-matrix_v1.md`を索引とする。権限変更時は、顧客画面だけでなくAPI、worker、Agent tool、Automation Policy、外部Adapter、管理面の同一操作を同時に確認する。

## 4.3 Keyword Market・Site Share体系

公共Keyword資産、公共Market Cluster、Site Keyword Universe、Site Cluster、Observed／Estimated／Article Share、Recommendation、補正学習の接続は`ai-office-de-seo-keyword-market-share-connection-map_v1.md`を索引とする。公共データと顧客固有データのID、store、provenance、再計算を混在させない。

Recommendation Actionの正規名、判定側alias、Agentic Workflow／軽量Patch／監視／ユーザー対応へのrouting、月次計画・手動Task・自動予定の競合規則は`ai-office-de-seo-recommendation-action-routing-map_v1.md`を正本とする。個別ロジック、画面または実装層で別Catalogを作らない。

CTA・内部linkの既存公開記事向け軽量施策は`ai-office-de-seo-lightweight-content-patch-connection-map_v1.md`を接続正本とし、候補、承認Batch、対象part、CMS結果、部分失敗、月次／累積評価を同じ`patch_action_id`で追跡する。

新規SiteのKeyword戦略Reportと既存SiteのKeyword・Site診断Reportは`ai-office-de-seo-keyword-report-connection-map_v1.md`を情報設計と業務接続の正本とする。両者を同じ記事一覧や同じ章立てへ縮退させない。

CMSの変更発見、記事読取り、投稿・更新、Media、Editor、Preview、Revision、反映確認、計測、Capacityは`ai-office-de-seo-cms-connection-routing-map_v1.md`を接続正本とする。ユーザーに内部経路やfallbackを選択させず、読取り成功を書込み許可へ流用しない。

権限、Plan、接続、データ、credit、承認、処理中、障害等の画面利用可否と表示優先順位は`ai-office-de-seo-ui-availability-state-map_v1.md`を正本とする。各画面で独自のロック理由や優先順を作らない。

初期リリースのアイキャッチPattern、Style Profile、variation、ロゴ、生成Job、CMS Media登録、再生成creditの接続は`ai-office-de-seo-featured-image-pattern-connection-map_v1.md`を正本とする。本文中画像等の後続機能を初期範囲へ混入させない。

業務eventから通知受信者、popup／通知Center／email、購読、fallback、既読／対応済みを解決する規則は`ai-office-de-seo-notification-recipient-routing-map_v1.md`を正本とする。通知目的の固定担当者割当を要求しない。

契約、credit、自動チャージ、Capacity、Plan変更、支払失敗の顧客画面接続は`ai-office-de-seo-billing-capacity-ui-connection-map_v1.md`を正本とする。価格表の表示だけで課金・利用制御を完了扱いにしない。

旧v3.7 ID群と分類別正本の責務・優先順位・下流参照規則は`ai-office-de-seo-legacy-requirement-migration-map_v1.md`を移行索引とする。旧IDを一括改番せず、新規実装が旧IDだけを根拠にしないようにする。

## 5. 横断監査

確定した横断判断と未確定事項の監査には `ai-office-de-seo-requirements-decision-summary_v1.md` を使用する。同文書は進捗管理表ではなく、分類別正本への索引である。

## 6. 既存文書の移行方針

既存文書は一度に分解しない。要求を更新するタイミングで、該当要求を分類別正本へ移し、元文書には移行先を記録する。移行完了までは既存要求IDと本文が有効である。
