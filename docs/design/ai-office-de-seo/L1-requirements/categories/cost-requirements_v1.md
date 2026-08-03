---
document_id: AOS-L1-COST-REQUIREMENTS
title: AI Office de SEO コスト要求 v1.0
version: 1.0
layer: L1
kind: cost_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO コスト要求

## 1. 責務  ［REQ-COST-01］

機能・ジョブ・テナントを運用するために発生する原価を、見積、実績、配賦、予算、停止判断へ利用できる形で定義する。

課金・会計要求との境界:

- コスト要求: サービス提供側が何にいくら使ったか。
- 課金・会計要求: 顧客へ何をいくら請求し、残高・売上・返金をどう整合させるか。
- 価格は原価だけで決めないが、原価を観測できない商品・機能を本番提供しない。

## 2. コスト分類  ［REQ-COST-02］

| 分類 | 主な費目 |
|---|---|
| AI Provider | input/output token、cache write/read、tool call、retry、fallback |
| 外部データ | SERP、PAA、AIO、競合、ニュース、動画、その他API |
| インフラ | compute、DB、storage、backup、network、queue、observability |
| データ処理 | crawl、同期、集計、embedding、再計算、保持、削除 |
| 配信・連携 | メール、Webhook、WordPress、決済手数料 |
| 人的運用 | support、consulting、review、incident、manual adjustment |
| 品質損失 | 失敗、再生成、返金、無効成果物、過剰取得、重複処理 |

固定費、変動費、準変動費を区別する。クレジット対象外の処理も原価ゼロとして扱わない。

顧客成果の市場補正に使う検索volume、外部順位、AIO・listing出現率は外部データ費へ計上する。Provider Cost Tableはprovider、endpoint／dataset、地域、device、取得単位、単価version、取得頻度、cache hit、再取得、失敗費用、対象Plan Capacityを持つ。GSC・CMS・自前Trackerによる基本成果表示は全Plan、外部SERP市場補正も全Planの重点Clusterへ月次提供し、Plan差は機能ON／OFFではなく観測Cluster・Keyword・地域・device・追加再取得のCapacityで管理する。具体上限はβ原価実測後にPlan Configurationへ登録する。

決済原価はPayment処理、Subscription管理、税計算、通貨換算、返金、chargeback、銀行振込等を分け、売上総額へ単一率を固定しない。Stripe標準構成の初期見積は国内カード3.6%＋Billing 0.7%＝4.3%とするが、実績は支払方法、利用製品、契約rate、発生日を持つProvider Cost Tableから計算する。Enterprise等の高額契約はカードと銀行振込の回収原価を比較する。

## 3. コスト帰属単位  ［REQ-COST-03］

実績コストは可能な範囲で次へ帰属する。

`provider → model → tenant → site → workflow → ticket/job → stage → attempt`

最低限、`tenant_id / site_id / workflow_key / job_id / cost_category / quantity / unit / unit_price_version / amount / occurred_at` を持つ。記事本文、プロンプト全文、raw responseは含めない。

共有費は次の規則で配賦する。

- インフラ固定費: 健全テナント密度または実測資源比率。
- 共有キャッシュ・公共観測: hit/read/write、利用回数、保存量等の選択したdriver。
- 運用・サポート: 計測した人的時間またはチケット件数。
- 配賦不能分: `shared_unallocated` として明示し、顧客原価へ恣意的に押し込まない。

## 4. 事前見積  ［REQ-COST-04］

ジョブ開始前に、次を分けて見積もる。

- `expected_cost`: 通常経路の期待値。
- `reserved_cost`: 実行開始に必要な予約額。
- `worst_case_cost`: cache miss、上限retry、fallback、外部取得上限を含む安全上限。

見積はworkflow version、Provider route、品質グレード、入力規模、ArticleSummary利用可否、cache状態、外部取得範囲を入力とする。見積式と単価表はversion固定する。

初期企画では標準的な記事生成1件当たり提供原価を約350円と仮置きする。ただし記事数・販売枠の根拠にはせず、実装後に品質段階別のtoken、画像、外部取得、Repair、cache、インフラ、失敗原価を実測して置換する。350円との差異と内訳をβ期間中に計測し、Price Catalog確定前に採算性を再評価する。

## 5. 実績精算  ［REQ-COST-05］

- 各attemptの使用量と費用をappend-onlyで記録する。
- 完了時に見積、予約、実績、解放、返還を突合する。
- retry、fallback、repair、外部再取得を元ジョブへ帰属する。
- システム障害による失敗コストと、ユーザー起因の再実行を区別する。
- Provider請求値と内部集計を定期照合し、差異を記録する。

## 6. 予算と停止  ［REQ-COST-06］

予算はサービス全体、Provider、テナント、サイト、workflow、job単位で持つ。

- soft limit: 警告し、低優先ジョブを遅延または代替経路へ回す。
- hard limit: 新しい費用発生前に停止・保留し、承認または予算変更を要求する。
- Kill Switch: 異常増加、単価急変、retry storm、cache崩壊時に対象経路を停止する。
- 実績見込みが事前見積の許容差を超える場合、追加費用発生前に再承認する。

## 7. レコメンドとの接続  ［REQ-COST-07］

recommendationは価値だけでなく、実行コストと維持コストを入力にする。

- `cost_estimate`: 調査、生成/修正、QA、投稿、効果測定の合計期待原価。
- `cost_confidence`: 入力規模、cache、外部取得、過去実績から算出する見積信頼度。
- `cost_efficiency`: 期待する戦略価値をexpected costで割った比較指標。金銭成果を保証するROIとして表示しない。
- 高コスト候補は自動却下せず、戦略必要性、依存関係、将来価値と併記する。
- `no_action`（旧名`do_nothing`）、既存記事の部分修正、内部リンクPatch、軽量リライトを、新規記事生成と同じ候補集合で比較する。

キーワード動的レコメンドの `cost_penalty` は本要求のexpected costとconfidenceを使用する。

## 8. DB・性能コスト  ［REQ-COST-08］

- 1記事当たりArticleSummary保存量、1テナント当たりDB増加量を測定する。
- 全文保持、無制限イベント、巨大JSON、全件再計算による将来コストを設計レビュー対象にする。
- DB、storage、backup、index、query、egressのコストを分ける。
- 性能改善のためのcacheやread modelは、保存・更新・無効化コストを含めて評価する。
- 削除・ロールアップ不能なデータを追加しない。

## 9. 原価KPI  ［REQ-COST-09］

- 記事生成1件当たり原価
- リライト1件当たり原価
- recommendation 1件生成・採用・実施当たり原価
- テナント・サイト当たり月次原価
- Provider/モデル別token・cache・retry原価
- 外部データ取得単価とcache hitによる削減額
- 成果補正用SERP／AIO／listingのPlan別観測件数、取得単価、再取得率、availability
- DB/ストレージ増加量と単価
- 見積誤差、失敗原価、返金原価
- 人的サポート・コンサル原価
- 商品・プラン別粗利への寄与

## 9.1 画像生成原価  ［REQ-COST-10］

- GPT Image 2のinput、reference image、output、quality、size、編集・再生成を画像jobへ帰属する。
- 既存画像解析cache、Image Style Profile、prompt template、重複生成防止による削減額を測定する。
- Featured Image Patternの配置、slot設定、複製、undo／redo、prompt fragment組立は原則として決定論処理とし、画像モデルを呼ばない。Patternと正規化結果をcacheして同じ構成を再処理しない。
- GPT Image 2の費用はユーザーがテスト生成または記事用画像生成を実行した時だけ発生させる。
- cache hitを理由に新規画像output原価をゼロ見積しない。
- 同一生成条件の既存成果を再利用する場合と、新規生成・編集・ユーザー希望の再生成を区別する。
- 画像解析、生成、最適化、CMS Media転送、storage、egressを分けて原価計測する。初期WordPress AdapterのMedia API原価も同じmeterへ接続する。

## 9.2 Provider Route最適化  ［REQ-COST-11］

- Kimi、Grok、Qwen系等の外部APIと、自己管理・ローカルLLMを同じ品質段階のroute候補として比較できるようにする。
- 外部APIはtoken、cache、batch、tool、network、失敗・fallbackを含む実効原価で比較する。
- 自己管理モデルはGPU/CPU稼働、idle、warm-up、autoscaling、storage、network、serving運用、監視、更新・評価工数、失敗・fallbackを含む総提供原価で比較し、token単価だけを原価低下の根拠にしない。
- route変更前後で品質合格率、Repair率、latency、失敗率、記事・workflow当たり実効原価を比較し、品質段階の最低基準を満たす範囲で低コストrouteの比率を上げる。
- model、snapshotまたはweight、quantization、serving engine、prompt・workflow version、評価結果、原価versionを固定し、後からroute判断を再現できるようにする。

## 10. 受入条件

- [ ] AC-L1-COST-01: コストが分類され、tenant/site/workflow/job/stage/attemptへ帰属でき、成果補正用SERP／AIO／listingをProvider Cost TableとPlan Capacityへ追跡できる。
- [ ] AC-L1-COST-02: expected/reserved/worst-caseを実行前に算出できる。
- [ ] AC-L1-COST-03: 見積式、単価、route、workflowのversionを後から再現できる。
- [ ] AC-L1-COST-04: retry、fallback、repair、外部再取得が元ジョブ原価へ含まれる。
- [ ] AC-L1-COST-05: soft/hard limitとKill Switchが追加費用発生前に機能する。
- [ ] AC-L1-COST-06: recommendationがexpected costとconfidenceを持ち、新規・部分修正・見送りを比較できる。
- [ ] AC-L1-COST-07: クレジット対象外処理にも運用原価が記録される。
- [ ] AC-L1-COST-08: Provider請求値と内部実績の照合差異を検出できる。
- [ ] AC-L1-COST-09: DB・ストレージ・バックアップの増加量と原価をテナント単位で観測できる。
- [ ] AC-L1-COST-10: 商品・プラン別粗利を実績原価から算出できる。
- [ ] AC-L1-COST-11: 画像の解析cacheによる削減と新規output原価を分離し、画像job単位で見積・実績を算出できる。
- [ ] AC-L1-COST-12: 外部APIと自己管理LLMの総提供原価・品質・latency・失敗率を同一route単位で比較し、品質基準内で低コストrouteへ段階移行できる。
- [ ] AC-L1-COST-13: 原価の観測・帰属・予算停止と顧客への請求・残高変更が分離され、原価記録から請求台帳を直接変更できない。
