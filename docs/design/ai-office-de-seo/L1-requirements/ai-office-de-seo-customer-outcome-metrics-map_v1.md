---
document_id: AOS-L1-CUSTOMER-OUTCOME-METRICS-MAP
title: AI Office de SEO 顧客成果指標・画面接続表 v1.0
version: 1.0
layer: L1
kind: metrics_map
status: draft
updated_at: 2026-08-03
---

# AI Office de SEO 顧客成果指標・画面接続表

## 1. 視点と表示階層

| 階層 | 正本画面 | 主な表示 | drill down |
|---|---|---|---|
| Site全体・簡単表示 | S1 サマリー | 検索流入・表示・CV、AI Office公開／更新数、順位段階の分布、成果分類、月次／累積 | Cluster成果を絞り込んだS2へ |
| Keyword Cluster・標準表示 | S2 戦略・診断Report／Cluster詳細／順位・要監視 | 主＋補助Keyword、検索intent、獲得Query、7日平均順位、流入、cluster充足、市場圧力、関連記事 | 記事成果を絞り込んだS5へ |
| 記事・標準表示 | S5 流入・CV／施策評価 | 公開・更新source、獲得Keyword、順位段階、click・impression、直前ページCV、1・3・6カ月評価、外部変更 | 同記事の履歴・Recommendation・S3成果へ |
| Office詳細分析 | A0〜A8の専門Workbench／Knowledge Graph | Site・Cluster・記事成果、根拠、比較軸、市場影響、Task、Recommendation、変更履歴を横断表示 | 条件・期間・比較軸を探索し、変更案を型付きProposal化。成果値はS1／S2／S5と同じProjectionを使用 |

## 2. 公開・更新実績

| 分類 | 判定 | 成果数 | 評価context |
|---|---|---|---|
| `ai_office_publication` | Publication Command／Delivery、外部post ID、対象version／content hash、CMS反映eventが同じcorrelationで検証済み | AI Office公開・更新実績へ算入 | AI Office施策の評価対象 |
| `external_change` | Thin Plugin署名Webhook等で検知した変更に一致するAI Office Commandがない | AI Office実績から除外 | 変更分類に応じ、実質本文等はSEO、CTA／導線はCVの交絡要因、軽微変更は履歴だけへ付与 |
| `unknown_source` | event欠損、correlation不成立、接続切替中 | いずれにも算入しない | 「取得元確認中」として評価準備中へ送る |

変更検知は `REQ-INT-05` とCMS Connection Routing MapのSite別primary経路を使用し、WordPress Thin Plugin署名Webhookが利用可能な場合は優先する。`unknown_source`は再照合期限までDelivery結果、外部post ID、version／hash、変更eventを再照合し、確定後に元分類を上書きせずattribution eventを追記する。期限後も不明ならunknownを維持し、AI Office実績または外部変更へ推測配分しない。外部変更のtitle、見出し、本文、CTA、内部link等の変更分類は `REQ-LOGIC-13` を使用する。実質変更は該当するSEO／CV評価の交絡要因、軽微変更は履歴のみとし、外部変更というsource分類だけで全評価を無効化しない。

## 3. 順位段階

### 3.1 データ源

1. 主データはGSCのURL×Query実績。記事へ割り当てたClusterのQueryだけを対象にし、7日間の `sum(position × impressions) / sum(impressions)` を算出する。
2. GSC欠損時または固定Keyword確認では外部順位計測を補助利用できる。外部値にはProvider、地域、device、取得日時を表示し、GSC値と平均・合算しない。
3. index障害、impression 0、匿名化・取得欠損は順位0として扱わない。

### 3.2 顧客向け段階と内部制御

| 種別 | 条件 | 顧客表示 |
|---|---:|---|
| 内部観測 | 7日平均100位以内 | 顧客成果段階には表示しない |
| `in_range` | 7日平均50位以内 | 圏内到達 |
| `upper` | 7日平均10位以内 | 上位化 |
| `top` | 7日平均3位以内 | トップ確保 |

最も高い段階を表示する。段階上昇は閾値到達時に反映し、下降は `in_range >55位、upper >12位、top >4位` が7日連続した場合に限る。閾値、退出幅、継続日数はversion付きOutcome Ruleとして管理する。`protect` はトップ確保等を入力にする運用flagで、成果段階とは別に保持し、「変更を慎重に扱っています」等の運用状態として表示する。

## 4. 市場・外部変更を含む成果分類

評価窓と比較窓は同じ日数、地域、device、Cluster、source条件を使用する。初期ruleは次の順で評価する。

1. 必須source欠損、評価窓未到達、index障害、impression 0、correlation不明は `insufficient`。
2. 評価期間にtitle・主要見出し・本文等のmaterialな `external_change` がある場合は `externally_confounded`。
3. 検索volume変化率の絶対値が15%以上で、GSC impression変化と同方向、両変化率の差が10 percentage point以内なら `market_demand_change`。
4. AIOまたはlisting出現率が比較窓から15 percentage point以上増加し、organic CTRが10%以上低下した場合は `serp_pressure_change`。
5. 1〜4に該当せず、割当Clusterの順位段階が上昇、またはclickが15%以上増加してimpressionが10%以上減少していない場合は `outcome_improved_after_action`。
6. その他は `insufficient` とし観測を継続する。

顧客表示は `outcome_improved_after_action=施策後に改善`、`market_demand_change/serp_pressure_change=市場変化の影響`、`insufficient=評価準備中` とする。`externally_confounded` は「外部変更を含むため評価準備中」と表示する。「施策後に改善」は時間的対応を示す表現であり、AI Officeだけが原因と断定しない。閾値はOutcome Rule versionで改版し、同じ入力・versionから同じ分類を返す。

## 5. 外部SERP・AIO原価とPlan境界

- GSC、CMS実績、自前Trackerによる基本成果表示は全Planで提供する。
- 検索volume、外部順位、AIO・listing出現率はProvider Cost Tableの `external_data` として、provider、endpoint／dataset、地域、device、取得単位、単価version、cache、再取得、失敗費用を記録する。
- 全Planで月次の重点Clusterを市場補正対象にする。Plan差は成果判定機能の有無ではなく、月次に観測できるCluster数、Keyword数、地域・device組合せ、追加再取得枠というCapacityで表現する。
- Premium／Enterpriseは広い観測Capacityを持ち、上限超過は追加credit／容量商品または次月観測を選択する。具体件数はβ原価実測後にPlan Configurationへ登録する。
- AIO／listing sourceが未提供・古い場合は0として扱わず、availabilityを表示して市場補正を `評価準備中` とする。

## 6. CV・単ホップ貢献

- 正本は自前Tracker。保存単位は日別・URL別・Goal別集計である。
- CV到達時の同一eventに含まれる直前遷移元URLを `previous_url` として、その場で `day × previous_url × conversion_url × goal` へ集約する。個別user、session ID、複数ページ経路を保存しない。
- 記事成果には対象記事URLでの直接CVと、対象記事が直前ページだったCV到達を分けて月次・累積表示する。名称は「CV」「直前ページからのCV到達」とし、「アシストCV」「貢献経路」「multi-touch attribution」と表示しない。
- GA4等の補助値はsourceを分け、Tracker集計へ加算しない。
