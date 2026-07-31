---
document_id: AOS-L1-CRAWLER-AI-VISIBILITY-LOGIC
title: SEO／AIクローラー取得性・AI回答表示性ロジック要求 v1.0
version: 1.0
layer: L1
kind: logic_requirements
status: draft
updated_at: 2026-07-31
---

# SEO／AIクローラー取得性・AI回答表示性ロジック要求

## 1. 目的

検索エンジンとAIサービスについて、ページを取得できることと、検索結果・AI回答へ表示されることを混同せず評価する。ユーザーには取得性と表示性の二軸で示し、内部では原因を特定できる段階別ファネルを維持する。

## 2. 共通入力契約

- Site、canonical URL、Article Summary、公開・更新日時
- robots、meta robots、canonical、HTTP応答、redirect、取得本文の完全性、JavaScript依存
- 外部probe結果と、利用可能なserver／edge log集約
- Provider、Bot識別子、Bot用途、検証方法、HTTP状態、latency、bytes、cache、観測日時
- GSCのindex、impression、順位、clickとavailability
- SERP／AIO観測、AI surface、prompt cluster、回答、ブランド言及、引用URL、AI referral、CV

入力はsource、観測条件、version、freshness、confidenceを必須とする。未接続、分離不能、標本不足、取得不可を0として補完しない。

## 3. 要求

### REQ-CAV-01 Crawler分類・検証

Crawlerを `seo_search、ai_search_index、ai_answer_fetch、ai_training、ads_validation、unknown` の用途へ分類する。同一事業者でも用途が異なるBotは別に扱う。User-Agent一致だけは `claimed` とし、公式IP範囲、reverse DNSまたはedgeの検証済み識別と一致した場合だけ `verified` とする。不一致は `spoof_suspected`、情報不足は `unverified` とし、実Crawler到達数へ混入させない。

### REQ-CAV-02 取得性判定

URLごとに `declared_access、probe_access、observed_crawl、content_readability、freshness` を別成分として判定する。robots許可だけで取得成功にせず、probe成功だけで実Crawler訪問にせず、実crawlだけでindex・引用済みにしない。

取得性状態は `unknown、blocked、degraded、ready` とする。robots／認証等で対象Botを明示拒否、または継続する403／429／5xxで本文取得不能なら `blocked`、取得はできるがredirect loop、空HTML、主要本文のJavaScript依存、著しいlatency、stale等があれば `degraded`、必要成分が観測期限内に成立すれば `ready` とする。Provider・Bot用途別状態を総合状態で上書きしない。

### REQ-CAV-03 表示性・回答面Share判定

SEO表示性はclusterに対するimpression、順位、click、検索結果featureを用いる。AI表示性はprompt clusterとAI surfaceごとに `surface_trigger、brand_mention、url_citation、citation_share、position、sentiment、repeat_stability、referral` を評価する。回答の一回取得を安定した表示とせず、観測回数とばらつきを併記する。

初期の対象候補は Google AI Overview／AI Mode、Microsoft Copilot／Bing AI回答、ChatGPT Search、Perplexity、Gemini、Claude Web Searchとする。Grok等の新規surfaceを同じ契約へ追加可能にする。名称を記載しただけでは対応済みとせず、直接観測、公式Webmasterデータ、正規API等の取得方法と再現条件を検証できたsurfaceだけを有効化する。

観測promptは全Know queryを網羅せず、Buy／Commercial investigation queryと、ブランド・商品・サービス名を含むcitation確認を優先する。Keyword cluster、商品・サービス、対象顧客、比較対象、地域、ファネルから「比較、選び方、推奨、費用、導入、代替、課題解決」等の候補を生成し、ユーザーが追加・除外・固定できる。単純Know queryは事業価値または引用機会が認められる場合だけ追加し、表示回数だけで高価値としない。

ブランド観測は、自社ブランド／商品／サービスが回答へ言及されること、正しい自社URLがcitationされること、第三者URLだけが根拠となることを分離し、対象Buy query群に対するcitation coverageと競合shareを推定する。観測promptは実ユーザーqueryそのものと断定せず、生成規則とversionを持つ評価セットとして扱う。

Google等のAI面が通常検索値へ合算され、専用値を取得できない場合は `combined` とし、通常検索値から推定差引してAI値を捏造しない。AI回答にURL引用がなくブランドだけが現れる場合と、URLだけが引用されブランド言及がない場合を別状態にする。

### REQ-CAV-04 ファネル・二軸診断

内部状態は `fetchable → crawled → retrieved_or_indexed → ranked_or_cited_or_mentioned → referred → converted` とし、各遷移は直接観測または明示された推定根拠を持つ。飛び越し観測を許容するが、欠けた中間段階を成功として補完しない。

画面上の二軸はXを取得性、Yを表示性とし、次の決定表を使用する。

| 取得性 | 表示性 | 診断・Recommendation |
|---|---|---|
| 高 | 高 | 維持、保護、競合・引用変化の監視 |
| 高 | 低 | 検索意図、内容、根拠、entity、競合、引用選択性を診断 |
| 低 | 高 | cache、過去取得、第三者言及等を確認し、技術要監視へ |
| 低 | 低 | 取得阻害を先にユーザーへエスカレーションし、表示改善の断定を保留 |

総合点を表示する場合も、SEO／AI、Bot用途、構成成分を展開できなければならない。

### REQ-CAV-05 再計算・推薦接続

robots、header、WAF、canonical、公開・更新、Crawler観測、GSC、SERP／AIO、AI回答観測、referral、CVの更新で、影響URLとclusterだけを再計算する。急変は即時リライトへ送らず、既存の要監視キューと1か月・3か月・6か月評価へ接続する。

取得障害はサイト設定の自動修復ではなく、原因、影響Provider／Bot／URL、確認証拠、推奨確認手順をユーザーへ返す。取得可能だが表示されない場合だけ、内容・構造・根拠・競合に関するRecommendation候補へ進める。

AIOおよびAI回答面の定期観測は月次を基本とする。急変を理由に反復取得せず、月次では対象評価セット全体を観測する。追加観測はユーザー明示実行、Provider仕様変更の検証、障害復旧確認等に限定し、頻度追加はPlan／creditとProvider原価の対象にできる。日次・週次の常時観測を初期既定にしない。

## 4. 段階的リリース

| 段階 | 提供範囲 | 判定できること | 提供しない断定 |
|---|---|---|---|
| Release 1 外形診断 | robots、meta、canonical、HTTP、redirect、HTML本文、JS依存、WAF／認証兆候の外部probe。GSC・SERP／AIO・prompt cluster観測との二軸表示 | 「現在のprobe条件で取得可能か」「検索／AI回答で観測されたか」 | 実Botが訪問した、index・引用されたという断定 |
| Release 2 任意ログ実測 | AWS CloudFront／WAF、XServerの取得可能なaccess log等をConnectorまたは手動取込で受け、Bot検証、日次URL集約、取得頻度・status・latency・coverage・freshnessを算出 | 対応環境におけるSEO／AI Botの実crawlと阻害原因 | 未接続環境の実crawl、crawlからの引用因果 |
| Release 3 Adapter拡張 | Cloudflare等のedge Adapter、hosting／CMS別診断、Provider別Bot Catalog更新 | 複数環境を同一契約で比較、運用通知 | 実環境未検証Adapterの互換保証 |
| Release 4 高度較正 | crawl・検索順位・AI回答・referral・CVの時系列較正、Site／業界prior | 選択性、引用安定性、施策前後差のconfidence付き評価 | 表示・成果の保証、crawlだけを根拠にした因果断定 |

各段階はFeature FlagでSite単位に開放し、前段データを再登録させず後段へ移行する。Release番号は商品versionを固定せず、依存順を表す。

## 5. 受入条件

- [ ] AC-L1-CAV-01: Googlebot等のSEO BotとAI Botを共通契約で取り込み、事業者・用途・検証状態を分離してspoof疑いを実crawlから除外できる。
- [ ] AC-L1-CAV-02: robots許可、外部probe、検証済み実crawl、本文可読性、freshnessを別成分として取得性を再現可能に判定できる。
- [ ] AC-L1-CAV-03: Buy／ブランドquery中心の評価セットについて、SEO順位・表示と複数AI surfaceの言及・URL引用・share・安定性をcluster単位で分離し、分離不能値をunknown／combinedとして扱える。
- [ ] AC-L1-CAV-04: 取得性×表示性の4象限から異なる診断を返し、crawl、index／retrieval、順位／引用、referral、CVを同一成果として混同しない。
- [ ] AC-L1-CAV-05: 月次の外形・回答面診断から任意ログ実測、Adapter拡張、高度較正へ段階開放し、未実装・未接続段階を観測済みとして表示しない。
