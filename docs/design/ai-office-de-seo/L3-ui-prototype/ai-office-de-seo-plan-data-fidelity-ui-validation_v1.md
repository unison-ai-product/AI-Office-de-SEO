---
document_id: AOS-PRE-L3-PLAN-DATA-FIDELITY-UI-VALIDATION
title: Plan別Data Fidelity・予測解放・較正表示 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# Plan別Data Fidelity・予測解放・較正表示 画面検証仕様

## 1. 目的

Plan、データ十分性、接続、権限、処理、障害を別Availability理由として扱い、Plan別Data Fidelityを実測値の改変や根拠のない精度保証にしない。通常ビュー、Office、成果、Keyword Report、月次計画、契約画面、内部検索で同じEntitlement、Metric、Calibration Projectionを使用する。

## 2. 予測の二段階Gate

数値予測は次の両方を満たす対象だけ表示する。

1. `plan_entitled`: Standard以上等、version付きPlan Configurationで予測機能が許可される。
2. `data_sufficient`: 直近28日1,000 clickのSite条件を満たし、さらに記事／cluster単位の入力・標本条件を満たす。

Entryには実予測値をblurしてDOMへ置かず、出力例、予測可能対象数、必要Plan、必要データを表示する。Standard以上でも条件未達はUpgrade導線を主表示にせず、不足データ、次回判定、現在利用できる方向性推薦を示す。

## 3. 較正表示

通常ビューは`Site実績中心／Site＋業界参考／業界参考中心／全体参考`とconfidenceを平易に表示する。Officeは`site_observed / site_industry_cohort / industry_cohort / global_prior`のweight、標本、期間、freshness、fallback、calibration version、Plan上限を表示する。

Plan変更前後の比較ではscore差そのものより、追加・削減される観測Keyword、cluster、競合、locale／device、詳細期間、再計算頻度、予測可能対象を示す。上位Planでも標本条件は変えず、同じ入力・versionなら同じ結果にする。

## 4. Upgrade・Downgrade

Upgradeは将来の取得・保持・再計算範囲が増えることを示し、「順位が上がる」「予測が正確になる」と保証しない。Downgradeは詳細履歴のrollup、削除予定、export期限、検索可能履歴の変化をPreviewし、過去Observation Fact、当時のMetric Snapshot、確定評価を変更しない。

Downgrade後も現在の許可Objectを基本検索できる。失効予定の詳細履歴は期限と影響を示し、検索結果から突然消える前にexport／比較期間変更を案内する。

## 5. Semantic Metricと3秒表示

通常ビューとOfficeは同じMetric key、Fact source、grain、window、attribution、versionを使う。表示詳細が異なっても同じ条件の値は一致する。pre-aggregationがstaleまたはpartialの場合はwatermark、取得日時、対象範囲を示し、0件・最新値・完全値として扱わない。

全routeを先に表示し、P95 3秒以内に前回確定値、部分集計、理由付き状態のいずれかへ到達する。詳細weight・履歴・比較表は遅延読込できるが、利用可否と次操作を隠さない。

## 6. 検証fixture

| ID | 検証内容 |
|---|---|
| FID-UI-01 | EntryをPlan lock、データ条件達成を別状態で表示する |
| FID-UI-02 | Entryの実予測値をDOMへ埋めたblurにしない |
| FID-UI-03 | Entryへ出力例・必要Plan・必要データを示す |
| FID-UI-04 | Standardの1,000 click未達をdata insufficientにする |
| FID-UI-05 | Site条件達成後も記事単位で可否を分ける |
| FID-UI-06 | 予測可能数と不足数を同時表示する |
| FID-UI-07 | 不足記事へ方向性推薦を維持する |
| FID-UI-08 | 接続不足をPlan lockにしない |
| FID-UI-09 | 権限不足をPlan lockにしない |
| FID-UI-10 | 製品障害をUpgrade誘導にしない |
| FID-UI-11 | Site実測中心を通常ビューで平易に示す |
| FID-UI-12 | 業界参考とglobal参考を区別する |
| FID-UI-13 | Officeで四階層weightを表示する |
| FID-UI-14 | weightの合計・calibration versionを追跡する |
| FID-UI-15 | fallback理由と次回再評価条件を示す |
| FID-UI-16 | 低confidenceを0または失敗にしない |
| FID-UI-17 | Planを理由にSite実測を平均へ置換しない |
| FID-UI-18 | 上位Planでも最低標本を緩めない |
| FID-UI-19 | 同一入力・versionでPlan bonusを加えない |
| FID-UI-20 | Upgradeで追加coverageを具体表示する |
| FID-UI-21 | Upgradeで追加詳細期間を表示する |
| FID-UI-22 | Upgradeで再計算頻度と予測可能対象を表示する |
| FID-UI-23 | Upgradeを順位・精度保証として表示しない |
| FID-UI-24 | Downgradeでrollup・削除予定を表示する |
| FID-UI-25 | Downgradeでexport期限を表示する |
| FID-UI-26 | 過去Observation Factを変更しない |
| FID-UI-27 | 確定評価と当時のMetric versionを維持する |
| FID-UI-28 | 現在Objectの基本検索を全Planで維持する |
| FID-UI-29 | 失効予定履歴の検索影響を事前表示する |
| FID-UI-30 | 検索IndexでEntitlementを迂回しない |
| FID-UI-31 | 通常とOfficeで同じMetric値を表示する |
| FID-UI-32 | grain・window・attribution差を明示する |
| FID-UI-33 | stale pre-aggregationへwatermarkを出す |
| FID-UI-34 | partial集計を完全値として表示しない |
| FID-UI-35 | 3秒以内に値または理由付き状態を出す |
| FID-UI-36 | 詳細遅延中も利用可否と次操作を維持する |

## 7. Finding

検証結果は`SF-UI-16`へ記録する。意味変更は`REQ-SCREEN-16/17/21/22`、Plan別Data Fidelity接続マップ、`REQ-DATA-17`、`REQ-KRL-11`、`REQ-BILLING-17`、`REQ-TECH-21`、`INV-DATA-FIDELITY-001`へ先に戻す。ブラウザ操作前は`open`とする。
