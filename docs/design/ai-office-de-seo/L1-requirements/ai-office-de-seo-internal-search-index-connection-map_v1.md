---
document_id: AOS-L1-INTERNAL-SEARCH-INDEX-CONNECTION-MAP
title: AI Office de SEO 内部検索Index接続表 v1.0
version: 1.0
layer: L1
kind: connection_map
status: draft
updated_at: 2026-08-05
---

# AI Office de SEO 内部検索Index接続表

## 1. 境界

本書の内部検索indexは、AI Office内でKeyword、カテゴリー／テーマ戦略、Article Summary、Recommendation、Task、公開・更新、顧客成果を探すための派生read modelである。Google等へのindex登録状態、noindex、canonical、robots、sitemap、crawl障害を扱うSEO index診断とは別境界とする。

内部検索indexは業務正本ではない。検索結果から表示、絞込み、対象選択はできるが、更新・公開・課金・権限変更等のCommandは対象Aggregateを正本から再読込し、認可・version・状態を再検証して実行する。Index喪失時は正本から再構築できなければならない。

## 2. 検索対象

| Document type | 主な入力 | 検索・facet | 本文の扱い |
|---|---|---|---|
| Keyword | 公共Keyword pool、Site Keyword、Query、分類、指標 | 完全一致、正規化、前方、関連語、業界／intent／funnel／地域 | 該当なし |
| CategoryTheme | Site Cluster、主／補助Keyword、記事割当、目的 | 名称、Keyword、intent、充足、優先度、状態 | 該当なし |
| Article | URL、title、見出し名、Article Summary、目的、Keyword、状態 | title、要点、topic、intent、CTA、link、公開・評価状態 | 本文全文・生HTMLを投入しない |
| Recommendation | Action、対象、短い理由、状態、期限、費用 | Action、対象、状態、理由code | 生成本文を投入しない |
| Task | Task名、対象、stage、状態、待機理由 | 状態、対象、期間、Action | Prompt・Source本文を投入しない |
| Outcome | Site／Cluster／記事、Lane、期間、成果分類 | 階層、Lane、順位段階、availability、期間 | 集計値と短い理由だけ |

契約、請求明細、権限、監査原文、秘密情報、Prompt全文、Provider raw responseを一般検索indexへ投入しない。管理用途の検索が必要な場合も別Scope、別Document type、別認可、短い監査metaに限定する。

## 3. 検索方式

初期の必須経路は決定論的なlexical検索と構造化filter／facetとする。日本語正規化、表記揺れ辞書、完全一致、prefix、token、同義語、Keywordの主従・関連関係をversion管理する。Sortは関連度だけでなく、業務優先度、更新日時、状態、順位、費用等を明示的に選択できる。

Vector／embeddingはArticle Summary等の短い許可fieldを対象とする補助Capabilityであり、必須経路にしない。本文全文をembeddingして恒久保持せず、model version、source hash、生成日時、tenant／Site、用途を保持する。Hybrid検索を採用する場合も、権限filter、exact match、業務上の絞込みをvector scoreより優先でき、検索結果の根拠を説明できることを条件とする。Officeの吹き出しや通常検索のたびにLLMを呼ばない。

## 4. Scope・共有Pool

顧客Documentは認可済みserver contextから`tenant_id`と必要な`site_id`を強制注入する。client、LLM、検索文字列が指定したScopeを信頼しない。Index、alias、cache、cursor、suggestionにもScopeを含め、他tenantの存在件数、facet、候補語を漏らさない。検索結果取得後も対象Aggregateの認可を再確認する。

公共Keyword poolは顧客Documentと別Index／namespaceおよびprovenanceで管理できる。公共市場データと顧客固有のGSC Query、登録語、URL、記事対応を同じ共有Documentへ結合しない。Site検索では認可済み公共候補と当該Site文書をquery時に合成する。

## 5. 更新・鮮度・再構築

正本transactionのoutbox／Domain Eventから、Document type、entity ID、source version、operation、tenant／Site、event IDを持つIndex Update Jobを非同期発行する。同じeventの再送は冪等とし、古いversionで新しいDocumentを上書きしない。更新は対象Documentと依存facetだけへ限定し、通常運用で全件再indexしない。

検索Documentは`source_version、indexed_at、source_observed_at、schema_version、analyzer_version、availability`を持つ。UIは許容鮮度を超えた結果を最新と表示せず、更新中・最終更新時刻を示す。公開、削除、Scope変更、同意撤回は高優先度でIndexへ反映し、tombstoneと削除証跡を保持する。

schema／analyzer／embedding model変更時は、新世代Indexをbackfillし、件数、hash sample、Scope負テスト、代表query、latencyを検証してからaliasを原子的に切り替える。旧世代はrollback期間後に削除する。全件再構築は専用Capacity、rate limit、checkpoint、再開、他処理へのbackpressureを持つ。

## 6. 障害・縮退

Index更新遅延、検索cluster障害、部分欠損を画面・Command障害へ丸めない。主要一覧はDB read model、保存済みProjection、exact-ID参照等へ縮退でき、検索だけが利用不能な場合は検索機能の状態と復旧見込みを表示する。Index障害中も公開、承認、課金、権限等の正本CommandをIndex経由にしない。

検索品質・運用は、query latency、zero-result率、click／採用、Scope除外count、更新lag、失敗、DLQ、Document数、容量、再構築進捗、cache hitをDocument type別に観測する。検索語原文を無期限ログへ残さず、顧客由来Keywordの共有資産化をログ経由で迂回しない。

## 7. 技術選定

初期実装はRDBの全文検索／trigram／専用検索service等を候補比較し、基準Site規模、facet数、同時query、更新lag、運用人数、AWS費用を負荷試験してADRで決定する。OpenSearch等の専用clusterは要求ではなく実装候補である。RDB方式が3秒画面SLO、分離、再構築、容量を満たさなくなる観測閾値を定め、専用検索基盤へ移行可能なPortとDocument Contractを維持する。

## 8. 接続

- データ正本・保持・削除: `REQ-DATA-01/03/08/09/10/16`
- 技術構成・Scope・非同期: `REQ-TECH-04/05/08/09/13/20`
- 画面表示: `REQ-SCREEN-04/11`、`REQ-NFR-02/03`
- セキュリティ: `REQ-SEC-02/06`
- SEO index診断: `REQ-BUS-10`、`REQ-LOGIC-09/13`

## 9. 検証観点

1. Indexを全削除して正本から再構築できる。
2. 更新event再送・順序逆転でDocumentが重複・巻戻りしない。
3. tenant／Siteを跨ぐquery、facet、suggestion、cursorが0件またはdenyになる。
4. 記事本文、生HTML、Prompt、secret、監査原文がDocumentへ入らない。
5. stale、部分欠損、Index停止時も全ページが表示され、P95 3秒以内に理由付き状態または縮退結果を返す。
6. CMS公開、削除、Scope変更、Showcase同意撤回が期限内に検索結果へ反映される。
7. analyzer／schema世代切替を検証後にaliasで切り替え、rollbackできる。
8. vector機能停止時もlexical＋filterで基本業務を完了できる。
