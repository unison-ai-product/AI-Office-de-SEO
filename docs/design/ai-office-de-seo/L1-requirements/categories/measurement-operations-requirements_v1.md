---
document_id: AOS-L1-MEASUREMENT-OPERATIONS-REQUIREMENTS
title: AI Office de SEO 計測・運用要求 v1.0
version: 1.0
layer: L1
kind: measurement_operations_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 計測・運用要求

## 責務

製品、SEO、品質、性能、コスト、障害を何で測り、異常時にどう対応するかを定義する。

計測対象:

- レコメンド生成数、採用率、編集率、却下率、反復率、実施後効果
- ArticleSummaryの本文取得省略率、保存量、再解析率、完全性
- GSCマッチ率、カバー率、Query Drift、カニバリ
- 生成品質、Repair収束、hard gate、公開成功率
- API、DB、画面、キュー、バッチの性能
- token、cache、credit、Provider原価、粗利
- SLO、エラー率、再試行、復旧、サポートSLA

運用対象:

- alert、incident、runbook、Kill Switch
- backup、restore、retention、cleanup
- model/config/catalog rolloutとrollback
- support escalationとナレッジ還流
- capacityとスケール判断

incident発生後の封じ込め、顧客連絡、復旧、補償、postmortemは `incident-warranty-requirements_v1.md` を正本とする。

既存ソース: `ai-office-de-seo-admin-console-requirements_v3.7.md`、`ai-office-de-seo-security-observability-requirements_v3.7.md`、`ai-office-de-seo-development-unit-roadmap_v3.7.md`。

## 要求

### REQ-MEASURE-01 確実性優先のページイベント

記事の行動計測は、ページ表示、遷移元・遷移先、明示的に識別できるCTAまたはボタン遷移、指定サンクスページ到達を基本イベントとする。推測によるクリック・CV補完を行わず、重複排除、bot除外、同意状態、計測欠損を記録する。

### REQ-MEASURE-02 CV定義

CVはSiteごとに到達URLまたは明示イベントを設定し、定義versionと有効期間を持つ。サンクスページ到達等の決定条件を満たした場合だけCVとして計上し、複数到達・再読込・戻る操作の重複規則を定義する。

### REQ-MEASURE-03 軽量保持

詳細イベントは推薦・施策効果の判定に必要な最小項目だけを取得し、短期保持後に記事・日・イベント種別単位へ集約する。生イベントの保持期間、Site当たり上限、遅延到着、削除、再集計を定義し、分析要望ごとに無制限なイベント項目を追加しない。

## 受入条件

- [ ] AC-MEASURE-01: 同一のページ遷移から再現可能なイベント結果が得られる。
- [ ] AC-MEASURE-02: CV定義versionと重複規則に従いサンクスページ到達を計上できる。
- [ ] AC-MEASURE-03: 生イベントが期限後に集約・削除され、記事遍歴と施策評価は維持される。
