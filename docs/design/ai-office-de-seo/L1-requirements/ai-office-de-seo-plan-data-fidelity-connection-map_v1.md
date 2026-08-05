---
document_id: AOS-L1-PLAN-DATA-FIDELITY
title: AI Office de SEO Plan別Data Fidelity・平均化回避 接続マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-05
---

# Plan別Data Fidelity・平均化回避 接続マップ

## 1. 目的

上位Planの価値を、結果への恣意的な加点ではなく、観測coverage、freshness、粒度、詳細保持期間、再計算頻度、Site固有特徴量、外部データ予算の拡張として提供する。低いPlanでも顧客のSite実測を他社平均で上書きせず、上位Planほどglobal priorへfallbackする割合を減らす。

## 2. 階層較正

推定・推薦は次の順に利用可能性を評価する。

1. `site_observed`: 当該SiteのGSC、記事、CV、分類修正、施策実績
2. `site_industry_cohort`: 当該Siteと業界／業種・横断軸を組み合わせた固有較正
3. `industry_cohort`: k匿名等の共有条件を満たす業界／業種cohort
4. `global_prior`: 公共市場資産と全体prior

単純な優先上書きではなく、有効標本数、freshness、欠損、分散、provenanceからblend weightを決める。出力は各階層のweight、availability、confidence、fallback理由、使用期間、calibration versionを持つ。Planはweightへ直接bonusを加えず、利用可能な入力とCapacityを決める。

## 3. Plan差分のDimension

| Dimension | Planで変更可能なもの | 変更してはいけないもの |
|---|---|---|
| coverage | 観測Keyword／cluster／競合／locale／deviceの上限 | 観測済みSite事実の改変 |
| freshness | 外部市場・SERP・順位・分類の再取得周期 | 古い値を最新と偽ること |
| granularity | 日次／週次／月次、cluster／Query／記事の詳細 | 集計値を実測明細と偽ること |
| retention | 詳細時系列、較正Snapshot、比較期間 | 法定・監査・削除境界 |
| recalculation | 全体／増分再計算の頻度と対象数 | 同じversionの決定性 |
| feature depth | Site固有特徴、cohort分割、比較軸、予測可能記事数 | 標本不足の最低条件 |
| external budget | Provider取得件数、競合・市場sample、任意拡張 | 未取得値の捏造 |
| search history | 製品内検索で辿れる許可済み履歴の深さ | 現在Objectの基本検索品質とtenant境界 |

具体件数はβ原価実測後にPlan Configurationへ登録する。UI、ロジック、JobへPlan名を直接分岐実装せず、version付きEntitlement SnapshotのDimension値を使う。

## 4. 初期の商品差

- Entry: Site実測と公共Keyword poolを利用できる。観測対象、詳細履歴、外部取得、再計算Capacityを抑え、fallbackが増える場合は理由とconfidenceを示す。
- Standard: Site固有較正、追加の観測coverage、詳細履歴、予測機能を提供する。高品質生成と同様、Entitlementで解放する。
- Premium: より長い詳細比較、広い競合・Keyword coverage、細かいcohort、再計算頻度、複数Site比較、専用backup等を提供する。
- Enterprise: 個別契約のdata capacity、保持、locale／device、専用処理枠、custom cohortを設定できる。custom cohortでも他Tenantの識別可能データを渡さない。

この初期差はCatalog固定値ではなく商品仮説であり、管理設定からversion改版できる。

## 5. 平均化を避ける不変条件

- Site実測が有効なら、Planを理由にglobal平均だけへ置換しない。
- 上位Planでも標本不足の最低条件を緩めず、推定精度を保証しない。
- 下位Planを販売上不利に見せるため、同じ保存済み事実の順位・CV・市場値を劣化させない。
- Plan変更で過去のObservation Factを書き換えない。新Entitlementから取得・保持・再計算範囲を変更する。
- Downgrade時は失われる詳細、rollup予定、削除予定、export期限を事前表示し、既存集計結果を突然別の平均値へ差し替えない。
- 公共Keyword pool、顧客固有事実、匿名cohortを別provenance・Scopeで保持する。

## 6. 画面

通常ビューでは「Site実績中心／業界参考あり／全体参考あり」「データ十分／一部参考値／追加観測で改善」を平易に表示する。Officeでは階層weight、観測coverage、freshness、保持窓、fallback、Plan上限、次回再計算を表示する。

Upgrade提案は「精度が上がる」と断定せず、追加されるKeyword数、比較軸、詳細期間、再計算頻度、予測可能対象、外部観測枠を具体的に示す。内部検索はEntitlementで許可された履歴だけを索引化するが、現在の許可Objectを見つける基本検索をPlanごとに意図的に劣化させない。

## 7. 根拠

`REQ-DATA-10/17`、`REQ-KRL-09/11`、`REQ-BILLING-17`、`REQ-SCREEN-22`、`REQ-PAC-14`。
