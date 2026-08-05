---
document_id: AOS-L1-MEASUREMENT-PRECISION-CONNECTION-MAP
title: AI Office de SEO 正確値・事前集計・近似・Sampling接続マップ
version: 1.0
layer: L1
kind: connection_map
status: current
updated_at: 2026-08-05
---

# 正確値・事前集計・近似・Sampling接続マップ

## 1. 目的

大量データの処理を軽くしながら、顧客成果、Recommendation、課金、公開等の意味をSampling誤差で変えない。計算方式を`exact fact → exact rollup → approximate sketch → sampled estimate`の順で選び、下流が精度区分、母集団、誤差、coverageを判断できる契約にする。

## 2. 計算方式

| mode | 用途 | 必須情報 | 使用禁止 |
|---|---|---|---|
| `exact_fact` | Credit、権限、契約、公開Fact、GSC／CVの取得済み集計、記事別確定評価 | Source、grain、window、欠損、watermark | 欠損を0として補完 |
| `exact_rollup` | Dashboard、月次、Cluster／記事成果、Capacity | 入力Fact version、group key、watermark、rebuild lineage | 異なるgrain／windowの混合 |
| `approximate_sketch` | 巨大集合のdistinct、percentile、頻度分布、探索facet | algorithm／version、precision、error bound、merge条件 | 個別対象の順位・CV・金額・公開判定 |
| `sampled_estimate` | 匿名cohort傾向、市場探索Preview、原価観測、仮説生成 | population、frame、method、strata、sample size、inclusion probability／weight、random seedまたは決定論key、confidence interval、bias note | 顧客成果の確定値、Recommendation採否の唯一根拠、Site補正の無承認自動適用 |

Sampling前に、期間・粒度を固定した事前集計、incremental rollup、bounded query、Sketchで解決できないか判定する。母数の小さい記事、CV、ロングテール、極端値はSampling誤差が大きいため、個別判断へ使用しない。

## 3. Sampling設計

- 単純無作為抽出を既定万能方式にせず、業界、locale、device、Intent、Cluster規模、順位帯、Planではない利用特性等による層化、重要度Sampling、reservoir等を目的別にversion管理する。
- Planを母集団の統計weightへ使わない。Planは観測coverageと処理Capacityを変えられるが、同じObservationの採用確率、推定量、誤差計算へ有利な係数を加えない。
- Sampling frameの欠落、selection bias、survivorship bias、provider coverage、季節性をbias noteとして保持する。confidence intervalが出せない推定は`directional_only`とし、数値の確定表示をしない。
- 小標本、偏り、急変、Source欠損ではfallbackを全体平均の強制適用にせず、正確値の待機、対象拡張、観測継続、非数値Recommendationへ切り替える。

## 4. 表示と下流利用

通常ビューは`実測 / 集計 / 推定 / 参考傾向`、対象期間、coverage、更新時刻、誤差幅または`参考値`を表示する。Officeはmode、algorithm、sample design、population／sample size、weight、confidence interval、bias、watermark、versionを表示する。

Recommendation、Report、Calibration、Customer Outcomeは利用したMetric Snapshotのmodeとversionを記録する。確定評価または課金処理は`approximate_sketch / sampled_estimate`だけから生成しない。推定から作った施策候補は理由へ推定であることを残し、正確Factが到着したら同じversionを上書きせず再評価する。

## 5. 検証

- Exact fixtureを基準に、Sketch／Samplingの誤差、bias、coverage、再現性を測る。
- small-N、heavy-tail、rare CV、long-tail keyword、季節急変、Source欠損を含める。
- 同じseed／frame／algorithm versionで再現し、違うsampleで信頼区間coverageを検証する。
- Samplingを無効化してもCore業務を完了でき、処理待ちまたは方向性表示へ縮退できることを確認する。

正本要求: `REQ-DATA-18`。実装契約: `schema.metric.snapshot.v1`、`schema.calibration.snapshot.v1`。
