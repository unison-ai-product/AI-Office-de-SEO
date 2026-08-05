---
document_id: AOS-REF-OSS-ANALYTICS-ARCH-20260805
title: Plausible・Cube・PostHog・Metabase 分析基盤参照レビュー
kind: reference_review
status: current
updated_at: 2026-08-05
---

# Plausible・Cube・PostHog・Metabase 分析基盤参照レビュー

## 1. 結論

4製品は導入候補を一括比較する対象ではなく、異なる設計責務の参照元として使う。本製品は顧客向け通常ビュー／Office、SEO固有のKeyword・Article・Recommendation、個人経路を保持しないCV集計を正本とし、外部製品のdata modelやUIへ従属させない。

| 参照先 | 主に学ぶもの | 本製品への適用 | 持ち込まないもの |
|---|---|---|---|
| [Plausible Analytics](https://github.com/plausible/analytics) | 軽量tracker、個人識別を避けた集計、運用DBと分析DBの分離 | 日別・URL別・Goal別Fact、薄い計測、非同期rollup | 個人単位tracking、初期からのClickHouse必須化 |
| [Cube Core](https://github.com/cube-js/cube) | metrics／dimensions／joins／access ruleのsemantic layer、API、cache／pre-aggregation | 通常／Office／内部管理が共有するMetric Contract、Plan／Scope付きquery、pre-aggregation | 顧客画面の外部BI化、初期からの別runtime必須化 |
| [PostHog](https://github.com/PostHog/posthog) | 高量event ingestion、product単位の分離、feature entitlement、非同期処理 | event idempotency、workload分離、Plan Entitlement、運営側product metrics | session replay、個人journey、全操作eventの無制限保存 |
| [Metabase](https://github.com/metabase/metabase) | 非専門家のdrill-down、保存済み分析、collection／permission、埋込み体験 | 顧客成果の段階開示、saved view、内部運営分析の参考 | 通常／Office UIの置換、顧客DBへの任意query開放 |

## 2. 物理構成の判断

Plausibleは一般データをPostgreSQL、分析をClickHouseへ分離している。これは将来のscale参考になるが、本製品は初期からClickHouseを必須にしない。AWS上で次の段階を踏む。

1. transaction／current stateは既存の業務DBを正本とする。
2. append-only Factを非同期rollupし、有界な集計Projectionとcacheを作る。
3. semantic metric contractを通常ビュー、Office、内部管理、APIで共有する。
4. P95、scan量、storage、ingestion backlog、運用工数がversion付き閾値を超えた領域だけ、columnar analytics Adapterへ移す。

Keyword公共poolの大量保持、時系列市場Observation、将来のCrawler集計はcolumnar候補である。一方、契約、権限、Recommendation、記事状態、Credit Ledgerを分析storeへ移さない。

## 3. Semantic Layer

Cubeの考え方を参考に、Metric Definitionは `metric key、意味、Fact source、grain、dimensions、filter、time window、attribution、availability、confidence、authorization、Plan Dimension、version` を持つ。UIは算式を持たず、通常ビューとOfficeは同じMetric Queryを異なる詳細度で表示する。

pre-aggregationはMetric version、tenant／Site Scope、grain、window、filter、source watermarkをkeyにし、staleを0件または最新値として偽らない。Planごとに算式をforkせず、Entitlementから利用可能grain、history、coverage、freshnessを解決する。

## 4. 計測とPrivacy

Plausibleの集計中心設計を採用し、PostHogのsession replay・人物profile型data modelは採用しない。顧客Site計測は既決どおりページ表示、直前遷移元、CTA識別、Thank-you到達等を日別・URL別・Goal別へ集約し、個別session経路を恒久保持しない。

PostHogからはevent ingestionの冪等key、schema version、backpressure、retry、dead-letter、product／workload分離を参照する。顧客行動を細かく取るためではなく、計測の欠落・遅延・重複・schema不整合を早く診断するために使う。

## 5. UI

Metabaseの探索性を参考にしても、顧客へ自由SQLや任意joinを開放しない。通常ビューは既定の成果StoryとRecommendation接続、Officeは許可済みDimensionのdrill-down、比較、filter、saved viewを提供する。Metric Definition、権限、Plan、provenanceをServer側で強制する。

## 6. License境界

- Plausible本体はAGPL-3.0-or-laterで、trackerはMITとREADMEに明記されている。
- Cubeはrepository既定がApache-2.0で、一部MITである。
- PostHogは`ee/`等を除くcoreがMIT Expat、enterprise部分は別licenseである。
- Metabase repositoryはAGPL、embedding、MCL等の複数licenseを含む。

現段階はarchitecture referenceに限定する。source code、schema、UI component、埋込みbinaryを採用する場合は、対象pathとversionごとにlicense／notice／network copyleft／商用埋込み条件を審査し、依存台帳へ記録する。

## 7. 要求への還流

`REQ-TECH-21`、`REQ-DATA-17`、`REQ-KRL-11`、`REQ-BILLING-17`、Plan別Data Fidelity接続マップへ接続する。
