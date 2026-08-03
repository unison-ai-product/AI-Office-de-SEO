---
document_id: AOS-L1-KEYWORD-MARKET-SHARE-CONNECTION-MAP
title: AI Office de SEO Keyword Market・Site Share接続マップ v1
version: 1.0
layer: L1
kind: requirements_map
status: draft
updated_at: 2026-08-03
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO Keyword Market・Site Share接続マップ

## 1. 目的

公共キーワード資産をシステム資産として再利用しながら、顧客固有Keyword、GSC Query、記事、商品・顧客・CV、Site戦略をtenant外へ漏らさず、市場→Site Share→戦略→Recommendation→評価へ接続する。

## 2. データ層

| 層 | 主なデータ | Scope | 保持・共有 |
|---|---|---|---|
| Public Keyword Asset | 正規化Keyword、locale、地域、device、検索量、CPC、競争性、SERP feature、AIO／広告圧力、related edge、取得元・利用条件 | global | 再利用条件を満たす公共外部データだけ。大量・長期保持可 |
| Public Market Cluster | 公共SERP／intentに基づくcluster version、代表語候補、member、類似根拠、観測期間 | global | locale・device・期間・計算versionごとに共有可 |
| Site Keyword Universe | 公共asset参照、GSC Query、user upload、Site抽出語、商品・顧客候補、採用・除外、業界／横断軸 | tenant + Site | 顧客固有正本。globalへそのまま出さない |
| Site Cluster Projection | Site目的に合わせたcluster、代表語、primary／secondary、記事割当、Market属性参照 | tenant + Site | Public clusterを参照できるが、Site固有境界・重み・割当を共有しない |
| Observed Query Share | GSC表示・click・順位・CTRと匿名化／切り捨て注記 | tenant + Site | 市場全体ではなく観測Share |
| Estimated Search Share | SERP順位、推定CTR、競合traffic等による補助推定 | tenant + Site | 推定値、confidence、算式versionを明示 |
| Article Share | cluster内で各記事が獲得するQuery、表示、click、CVの分布 | tenant + Site | Article Summary・Assignment・実績に接続 |
| Calibration Signal | ユーザー修正、施策結果、Site補正、匿名全体補正候補 | Site／global proposal | Site内は直接適用可。globalはk匿名・管理承認・version公開後のみ |

## 3. IDと正本

- `keyword_asset_id`: 公共Keywordの安定ID。表記変更・metric更新で変えない。
- `public_cluster_id + cluster_version`: 公共SERP／intent cluster。代表語変更でIDを変えずversionを上げる。分割・統合はlineageを持つ。
- `site_keyword_id`: Site固有候補。公共assetへ対応できる場合は参照するが、user uploadやGSCのみの語を無理にglobalへ昇格しない。
- `site_cluster_id + projection_version`: Site固有cluster。Public clusterと1対1を前提にしない。
- `article_assignment_id`: Site clusterと記事のprimary／secondary割当履歴。
- `market_share_snapshot_id`: 期間、入力availability、算式versionを固定したShare read model。

公共IDとSite IDを同じnamespaceへ置かない。画面URL、API、cache key、eventにscopeを含め、`cluster_id`単独で解決しない。

## 4. 接続Lifecycle

```text
公共Source取得
  → Keyword Asset更新
  → Public Market Cluster版生成
  → Site Keyword Universeへ候補投影
  ＋ GSC / upload / Site抽出 / 商品・顧客候補
  → Site Cluster Projection
  → Market属性 + Observed/Estimated/Article Share
  → 戦略Report・診断Report
  → 月次計画
  → Recommendation
  → Agent実行・公開／更新
  → 評価・ユーザー修正
  → Site補正 / 匿名Global補正候補
```

## 5. 新規Siteと既存Site

### 新規Site

1. 業界／業種、商品、顧客、地域、横断軸からbig keyword候補を出す。
2. ユーザーが方向性を確認し、除外・追加する。
3. 公共Poolから関連assetとMarket Clusterを展開する。
4. Site材料と記事成立性を合わせてSite Clusterを作る。
5. 数値実績がないためObserved Shareと数値予測をunknownとし、市場構造、Site必要性、商品・顧客・CV適合を中心に戦略Reportを作る。

### 既存Site

1. 公共Pool、業界候補、GSC Query、user upload、Site記事、適格な検索競合語を統合する。
2. GSC獲得語だけを市場母集団にしない。
3. Market全体に対する獲得／未獲得、Observed Share、Estimated Share、Article Shareを分ける。
4. Keyword問題と記事問題を同じ診断Reportで接続する。

## 6. Cluster規則

- 意味類似だけでcluster化しない。正規化、検索意図、SERP上位URL重複、上位ページ共通獲得語、co-landing、PAA、関連検索、記事type、時系列類似度を使用する。
- 公共Clusterは市場の近似であり、Site Clusterは記事戦略上の投影である。Siteの商品・顧客・独自材料により分割・統合が異なり得る。
- Cluster状態はstable、mixed intent、volatile、split candidate、merge candidateを持つ。
- 代表語の変更でClusterを作り直さない。primary／secondaryはSite Projection側で保持する。
- 同一SERPの一時一致だけで統合せず、観測期間とconfidenceを持つ。

## 7. MarketとShareの算出境界

- Market: 検索量、traffic potential、季節性、AIO、広告、競争性、SERP構成等。顧客実績を混ぜない。
- Observed Share: GSCで観測できた自Siteの表示・click構成。匿名化・切り捨て・未獲得を注記する。
- Estimated Share: 外部SERPとCTR model等による推定。Observedと合算して単一実績値にしない。
- Article Share: Site内の記事間配分。カニバリ、担当URL不安定、保護、Query Driftへ使用する。
- RecommendationはMarketとShareの双方を入力にするが、各成分・provenance・availabilityを保存する。

## 8. ユーザー修正と学習

- ユーザーが業界、横断軸、Keyword採否、Cluster境界、代表語、primary／secondary、記事割当を修正した場合、修正後をSite正本とする。
- 自動推定でユーザー確定値を上書きしない。乖離は変更候補として提示する。
- Site補正は未実行Recommendationと次回配分へ適用し、実行済み履歴を改変しない。
- 順位悪化リスク、3位以内保護、適用後悪化があるSite補正は承認待ちにする。
- globalへ送れるのは、k匿名・識別子除去済みの集計、辞書候補、prior／threshold補正候補だけ。生Keyword、GSC Query、URL、商品・顧客・CV対応を送らない。
- global補正は自動配信せず、管理承認、golden evaluation、canary、version化を経て公開する。

## 9. 再計算

- Public Asset更新は影響するPublic Clusterだけを再計算する。
- Public Cluster改版は参照中Site Projectionを`stale_dependency`にし、即時全Site再計算せずqueueと予算で段階処理する。
- GSC、Article Summary、Assignment、公開／更新、評価完了、業界・横断軸修正は対象Site Clusterだけを再計算する。
- Market変動とSite実績変動を別trigger・別原因として記録する。
- 急変はRecommendationへ直接流さず要監視へ送る。AIOは原則月次、必要なMarket観測はfreshness期限に従う。

## 10. 画面

- S2の第一表示はMarket全体とSite Shareの対比とし、単一Keyword一覧だけを入口にしない。
- Clusterを基本単位、個別Keywordを詳細単位にする。
- 新規戦略Reportと既存診断Reportを分けるが、両方ともMarket Keyword母集団を基線にする。
- source provenance、availability、Observed／Estimated、公共／Site固有、ユーザー確定／推定を視覚的に区別する。
- OfficeではMarket、Share、Cluster、記事割当、補正version、Recommendation根拠を横断し、条件変更はProposalとして扱う。

## 11. 検証

- 顧客固有Keyword、GSC Query、URL、記事対応が`keyword_assets`または公共cacheへ書き込まれない。
- 同じ公共Keyword観測をSiteごとに複製せず、version付き参照で再利用できる。
- 公共Cluster改版後もSiteのユーザー確定Cluster・割当を無条件上書きしない。
- GSC未接続でも新規Site戦略を作れ、GSC獲得語だけで既存Site市場を作らない。
- Market、Observed Share、Estimated Share、Article Shareから元入力と算式versionを追跡できる。
- ユーザー修正がSiteに反映されても、globalへ生データが流れない。

正本: `REQ-DATA-10/11`、`REQ-KRL-01〜10`、`REQ-KPD-01〜06`、`REQ-KGA-01〜23`。
