---
document_id: AOS-L1-RECOMMENDATION-ACTION-ROUTING
title: AI Office de SEO Recommendation Action・実行経路接続マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# Recommendation Action・実行経路接続マップ

## 1. 目的

Keyword分析、記事診断、月次計画等から生じるRecommendationを、すべて記事生成へ流さず、施策に適したWorkflow、軽量Patch、監視、入力依頼またはユーザー対応へ接続する。採用時はRecommendationが既に持つ目的、Keyword Cluster、検索インテント、記事目的、CTA、内部link、品質、予算、根拠および依存関係を`schema.intake.recommendation.v1`へfreezeし、Agent、画面またはOfficeで再入力させない。

本書はAction名と実行経路の正本である。個別ロジック文書は判定条件を正本とし、別名のAction Catalogを作らない。

## 2. 正規Action Catalog

| canonical action | 判定側の別名 | class | 採用後の経路 | 副作用・終端 |
|---|---|---|---|---|
| `new_article` | `create_new` | agentic content | `workflow.new_article.v2` | Generation Outcome後、CMS Delivery、承認またはAutomation Policyに従う公開 |
| `rewrite` | `rewrite` / `refresh` | agentic content | `workflow.rewrite.v2`。`refresh`は原因・変更範囲subtype | Generation Outcome後、CMS下書き。ユーザー承認後に更新 |
| `cta_patch` | `cta_update` | lightweight patch | CTA/CV Pack→差分QA→承認→CMS Patch | SEO評価周期をリセットせず、CTA/CV評価起点だけ更新 |
| `internal_link_patch` | `internal_link` | lightweight patch | Link Candidate batch→差分QA→承認→CMS Patch | 新規／リライト本文内の追加は当該Workflowへ内包可。既存公開記事への追加は承認制。削除は別確認 |
| `request_input` | `request_input` | user input | 不足入力、理由、再開条件を通常ビュー／Officeへ提示 | 入力完了後に同Recommendationの後続versionを再判定 |
| `observe` | `observe` | observation | 要監視Queueまたは評価待ち | 期限・観測条件到達まで実行Workflowを起動しない |
| `protect` | `protect` | policy | 保護Policyへ登録し、変更候補のPreflightを強化 | 記事変更を生成しない。内部link追加・CTAは独立判定 |
| `no_action` | `do_nothing` | terminal | 理由と再評価条件を履歴化 | Taskを発行しない |
| `structure_change_proposal` | `merge_or_canonicalize` | user escalation | 統合、主従、canonical、redirect等の提案書と影響URLを提示 | Site構造を自動変更しない。記事内容の統合を実施する場合だけ別rewriteを発行 |
| `technical_escalation` | `index_diagnostic` | user escalation | index／crawl診断結果、原因候補、影響URL、確認手順を提示 | Site設定を自動修復しない |
| `automation_change` | `automation_change` | configuration proposal | 変更Proposal→影響、費用、対象、差分→権限者確定 | 確定後にAutomation Policyの新versionを発行 |

Actionは`recommendation_type`、細分は`recommendation_subtype`へ格納する。表示名、Workflow名、Pack名をtypeとして保存しない。`structure_change_proposal`と`technical_escalation`を実行済みと見なす条件は、システムが提案・診断を提示しユーザー対応状態へ移した時点であり、外部Siteの修正完了を偽装しない。

## 3. Intakeと実行主体

1. 判定ロジックはRecommendation itemと根拠を生成する。LLMを判定の必須経路にしない。
2. ユーザーまたはAutomation Policyが採用すると、表示済みContextを`schema.intake.recommendation.v1`へfreezeする。
3. Agentを使うかはActionの意味で決める。調査、構成、執筆、QA、説明、変更案作成等、意味判断を要する工程はAgent Workflow／Executorを使用できる。hash比較、閾値判定、状態遷移、権限・予算・接続検査等の決定論処理をAgentへ置換しない。
4. 軽量Patchは記事全文生成とは別Workflowとし、対象part、差分、検査、承認、CMS結果を追跡する。
5. 観測、保護、no actionは記事生成Jobを発行しない。

手動指定はRecommendationの採用履歴を捏造せず、`schema.intake.manual.v1`へ保存する。Recommendation IntakeとManual Intakeは同じPreflight、権限、予算、重複、カニバリ、保護、接続判定を使用するが、source IDとユーザー指定／機械導出のprovenanceを維持する。手動指定からRecommendation Itemを作るのは、後続の分析が独立した提案を生成した場合だけとし、起動のための形式的Recommendationを作らない。

## 4. 月次計画・手動指定・自動予定の競合規則

1. ユーザー指定Task／予定は維持する。重複、カニバリ、内部link前後関係、予算、週次上限または保護条件との衝突を検知した場合、取消せず影響と推奨順序を相談として提示する。
2. システム自動予定の未実行項目は、目的、分類、市場、順位、急変、依存関係または予算変更時に再検証し、`scheduled / needs_review / held / superseded / expired`へ遷移できる。
3. 3位以内の記事をさらに向上させる目的で自動選択した変更は、急変時に`protect`または`observe`へ差し替える。元々低順位の改善予定は急変だけで停止しない。
4. Recommendationを改変して履歴を消さない。再計算結果は新versionまたは`supersedes_ref`を持つ別Recommendationとする。
5. 同じ対象へ手動Taskと自動予定が存在する場合、共通Preflightで対象・目的・変更範囲を比較する。包含できる場合は依存関係へ変換し、両立しない場合は自動予定を`needs_review`へ戻す。
6. 月次計画は配分と優先の基線であり、個別Taskの正本ではない。計画変更は実行済み施策を変更せず、未実行Recommendationと次回配分だけへ反映する。

## 5. 状態と相関

Recommendationは`proposed / accepted / scheduled / dispatched / held / needs_review / superseded / expired / completed / evaluated`を持つ。`observe`、`protect`、`no_action`、ユーザーエスカレーションもRecommendationとして履歴・評価条件を保持するが、Agent Jobの存在を必須にしない。

`recommendation_id + version`、`intake_ref`、`correlation_id`を、月次計画、Task、Workflow、CMS Patch／公開、評価および学習へ引き継ぐ。CTA/CV評価、SEO評価、認知貢献評価は同じ介入を参照しても評価窓を分ける。

## 6. 根拠

- 判定・再計算: `REQ-KRL-07〜10`
- Agent／Workflow: `REQ-AGENT-06/09`、Agent要求マップ
- 画面・Automation: `REQ-SCREEN-09/15/18`、`REQ-LOGIC-03/06`
- CTA・内部link・CMS: `REQ-WPA-02/12/13`、`REQ-KGA-09`
- データ・履歴: `REQ-DATA-06/07`
