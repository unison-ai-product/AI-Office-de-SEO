---
document_id: AOS-L1-PACK-TICKET-SCHEMA
title: AI Office de SEO Pack / Ticket / Schema要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO Pack / Ticket / Schema要求 v3.7

## 分類別正本への移行

Agent関連変更の横断責務と追加前監査は `ai-office-de-seo-agent-requirements-map_v1.md` を起点とする。分類別要求へ業務施策を追加するだけで新しいPack、Ticket、Schemaを作らず、既存Catalog／Workflow／Source Needの組合せで表現できるかを先に確認する。

業務Workflowは `categories/business-requirements_v1.md`、判定・状態は `categories/logic-requirements_v1.md`、正本データは `categories/data-requirements_v1.md`、job・schema・version境界は `categories/technical-architecture-requirements_v1.md` を現在の正本とする。本書の `REQ-PACK-*` はPack・Ticket・Schema固有詳細として維持する。

## 1. 分離原則  ［REQ-PACK-01］

- Ticket = 作業命令
- Workflow = ステージ列・遷移・ループ・停止条件を定義する実行手順（`workflowKey`で参照、版固定）
- Prompt Pack = 構造 + few-shot + 制約（注入系）
- Source Pack = 問い合わせ先 + 抽出契約 + 情報（取得系、site_idスコープでJSON取得）
- Catalog / Registry = 版固定の参照集合（Purpose Element Catalog、Quality Gate Registry、Article Type / Heading Structure等）。注入・参照される
- Source Need = Ticketが必要とする情報要求
- Source Extract = Source Packから必要部分だけ切り出したJSON。外部由来は指示ではなくデータとして扱い、`content_role`（requirement=要件 / reference=参考 / derived=外部由来のLLM導出成果）で役割分離する（derivedの扱いは`REQ-AGENT-07`）
- Schema = Ticket入力とSnapshot出力の型契約（`schemaKeys`で参照、JSON検証）
- Snapshot = Executorが返す成果・自己チェック・メタデータ
- returnTo = Snapshotの返却先（Ticketが指定。既定はOrchestrator）
- Router（Packキーインジェクター）= 各サブエージェント側に置く機構。Orchestratorが選択したキー（`promptPackKeys` / `workflowKey` / `catalog.*`）を解決し、Pack・Workflow・Catalog由来の固定制約をサブエージェントのsystem promptとして強制注入する。Pack本文・Workflow定義はここでsystem promptに入り、Ticketには本文を持たせない

Ticketは本文（Pack本文・Workflow定義・Schema定義）を内包しない。Ticketは `workflowKey`、`promptPackKeys`、`sourceNeedKeys`、`schemaKeys`、`returnTo`、`userPrompt` の**キーのみ**を発行する。Orchestratorが見るのはCatalogと対応キーで、キーの解決とsystem promptへの強制注入はサブエージェント側のPackキーインジェクターが、データ取得はSource Packが行う。Ticketがキーとして書いたPack/Workflowはサブエージェントのsystem prompt（固定制約）に入り、`userPrompt`（自由入力）はuser promptに分離される。SnapshotはTicketの`returnTo`に従いOrchestratorへ返し、Orchestratorが次工程・失敗時の遷移を決める（`REQ-AGENT-01`）。利用する Workflow / Pack / Schema / Catalog のversionは、ジョブ開始時に固定する（`REQ-PACK-04`）。

## 2. Pack分類  ［REQ-PACK-02］

各分類は §1 の種別（Prompt Pack / Source Pack / Catalog）に属する。サイトに保持されるデータ（Domain Positioning / Content Regulation / User Order）は、まず Source Pack として `site_id` スコープで取得し、その内容を Router が Prompt Pack として system prompt に注入する（取得→注入の2段。直テーブル禁止は `REQ-PACK-06`）。

### Domain Positioning Pack（Source Pack取得 → Prompt Pack注入）

サイトの立ち位置、誰に向けるか、どんなCV方向に寄せるか、許容される主張を定義する。主にResearch / Outlineに効かせる。

### Content Regulation Pack（Source Pack取得 → Prompt Pack注入）

文体、段落リズム、語尾、表、FAQ、禁止表現、AI臭回避、few-shot圧縮、WP出力制約を定義する。Writing / QA / Repairへ常時注入する。

### User Order Pack（Source Pack取得 → Prompt Pack注入）

ユーザーが書いた要望。影響度はsoft / normal / strongで制御し、SEO証跡、規制、投稿形式、サンドボックス境界を上書きできない。

### Article Type Structure Pack（Catalog）

記事全体の構成型。転職ガイド、比較、ランキング、FAQハブ、ナレッジ記事、ニュースコラムなどの構成を定義する。

### Heading Structure Pack（Catalog）

H2/H3内の意味ユニットの並びを定義する。H2/H3を作業単位にしないための構造Packである。

### Purpose Element Pattern Catalog（Catalog）

主張＋理由、具体例、比較、判断基準、表、FAQ、接続文など、意味ユニットごとの文章パターンを管理する。

### Competitor Structure Pack（Source Pack）

競合上位記事から、記事タイプ、見出しパターン、共通論点、不足論点、差別化余地を抽象化したもの。競合本文全文は保存しない。

## 3. Ticket分類  ［REQ-PACK-03］

- Writing Ticket: 本文断片、表JSON、FAQ、接続文、内部リンク文脈などを作る。
- QA Ticket: 整合性、根拠、CTAタイミング、表崩れ、記事タイプ、WP出力形式などを検査する。
- Repair Ticket: QAで落ちた意味ユニットだけを修復する。
- Automation Ticket: WP下書き、予約投稿、CTAボタン配置、公開イベント、CVイベントなどを扱う。

## 4. Key命名規則  ［REQ-PACK-04］

キーは `namespace.name.version` とし、namespaceは種別に対応する。

```txt
workflow.new_article.v2
workflow.rewrite.v2
prompt.domain_positioning.v1
prompt.content_regulation.v1
prompt.user_order.v1
catalog.article_type.transfer_guide.v1
catalog.heading_flow.experience_translation.v1
catalog.purpose_element.claim_reason.v1
catalog.quality_gate.cta_timing.v1
source.gsc.page_query_matrix.v1
source.keyword.same_serps.v1
source.competitor.top5_structure.v1
schema.ticket.writing.v1
schema.snapshot.qa.v1
```

旧`workflow.new_article.v1`／`workflow.rewrite.v1`は履歴再生・移行専用aliasとし、新規IntakeのroutingまたはTicket発行へ使用しない。v2はGeneration OutcomeとCMS Delivery／Approvalを別stage・別Aggregate参照として保持する。

namespace対応:

- `workflow.*` = Workflow
- `prompt.*` = Prompt Pack（Domain Positioning / Content Regulation / User Order 等の注入内容）
- `catalog.*` = Catalog / Registry（article_type / heading_flow / purpose_element / quality_gate / writing_method / review_lens / reader_segment 等）
- `source.*` = Source Pack（内部・外部の取得データ。一覧は `REQ-PACK-07`）
- `schema.*` = Schema（Ticket入力・Snapshot出力の型）

ジョブ開始時に利用Workflow / Pack / Catalog / Schemaのversionを固定する。更新後も過去ジョブの再現性を壊さない。

## 5. テーブルJSON契約  ［REQ-PACK-05］

テーブルは自由HTMLやmarkdown表で返さない。Table Writing SnapshotはJSONを正本とする。

```json
{
  "table_id": "string",
  "caption": "string",
  "columns": [{"key": "string", "label": "string"}],
  "rows": [{"cells": {"key": "value"}}],
  "notes": ["string"],
  "qa_hints": ["string"]
}
```

最終HTML/Gutenberg変換はWP出力スキーマ側で行う。

## 6. データ取得はPack経由（直テーブル禁止・site_id分離・JSON出力）  ［REQ-PACK-06］

Semantic／Hybrid Executorは、アプリDBのテーブルへ直接アクセスしない。必要なデータは Source Need を発行し、Source Pack が解決して Source Extract を **JSON** で返す、Pack経由でのみ受け取る。Action Executorも業務テーブルを直接参照せず、認可済みCommand／Tool契約だけを利用する。

- 直テーブル・生SQL・生クエリ結果をExecutorへ渡さない。Executorが扱うのはPack由来のJSONだけである。
- 内部データ（GSC Data Mart、Keyword Map、Article Map、記事digest、カバー率、Query Drift等）も、外部情報源（SERP/PAA/AIO/News/YouTube等）も、すべて Source Pack として抽象化し、JSONで受け取る。
- Source Packの解決は、固定された `SiteSandboxContext` の `tenant_id` / `site_id` スコープ内で行う。Packは site_id で分離され、別サイト・別テナントのデータを引けない。
- サンドボックス内から参照できる**テナント非含有の共有物**はホワイトリストで限定する: グローバルCatalog（`catalog.*`・辞書・タクソノミ）、共有外部観測キャッシュ（`REQ-SEC-07`の2層区分）、セグメントprior（`REQ-PRODUCT-13`）。いずれも**読み取り専用**で、ジョブ開始時にversion freezeされる（`REQ-PACK-04`）。共有物への書き込みはジョブ・Executorから構造的に不可能とし（成果は常にSnapshot＝テナントスコープ）、ホワイトリスト外の共有参照は境界検証（`REQ-SEC-13`）でfail-closeする。外部データPack（`source.serp.*`等）は、認可・予算計上・アクセスログをサンドボックス内で行い、内容は共有観測キャッシュから解決する。
- Source Extract は `schemaKeys` で型を固定し、JSONで返す。スキーマ検証に失敗した抽出はExecutorへ渡さず、エラーまたは再取得とする。
- Executorの成果も直テーブル書き込みではなく Snapshot として返し、Assembly／永続化は管理された層が行う。

この原則により、`REQ-SEC-07` の単一強制ポイントとPackが一致し、Executorからの越境アクセス・直接クエリを構造的に不可能にする。Packが、site_id分離とJSON入出力を同時に担保するデータ境界になる。

## 7. Source Pack カタログ  ［REQ-PACK-07］

Executorが引ける Source Pack を、キー・スコープ・出力JSONの契約として定義する。JSON項目はドラフトであり、確定はL3で行う。内部データは `site_id` スコープで解決し、外部データはコスト予算とキャッシュTTL配下で取得して抽象化する（本文は非保持）。

内部データ（`SiteSandboxContext` 内で解決）:

| キー | 取得データ | 主なJSON項目 |
|---|---|---|
| `source.gsc.page_query_matrix.v1` | URL×クエリ日次実績 | `rows[{url_hash, query_group, clicks, impressions, position, ctr, date}]` |
| `source.article.summary.v1` | 記事能力サマリー（契約準拠） | `{articles[{url_hash, digest, headings_tree, topics[], intent, audience[], funnel_stage?, questions[], claims[], unit_types[], entities[], keywords[], tier, categories[], tags[], cta_types[], outbound_topics[], linkable_topics[], freshness, gaps[], quality, completeness, confidence, content_hash, summary_schema_version, analyzed_at}]}`（各配列・短文に上限、本文なし、`REQ-PRODUCT-20`） |
| `source.showcase.cases.v1` | 事例素材（許諾済み転用・マスターテナント限定） | `{cases[{consent_ref, industry, before_after_metrics, period, display_name?}]}`（撤回で削除、`REQ-PRODUCT-23`） |
| `source.site.cv_points.v1` | CVポイント台帳 | `{points[{cv_id, kind, target_ref, valid_until?}], assignments[{article_ref, cv_id}]}`（`REQ-WPA-13`。CTA Placementの解決先） |
| `source.site.facts.v1` | 導出事実（低変化・小型） | `{facts[{fact_key, value, observed_at, confidence, source_ref}]}`（本文なし、`REQ-PRODUCT-19`） |
| `source.site.topology.v1` | サイトトポロジー（幹枝葉・タグ網目・対象記事の位置） | `{nodes[{article_ref, tier(pillar/cluster/leaf), category, tags[]}], link_queue[]}`（`REQ-KGA-19`） |
| `source.site.engagement.v1` | エンゲージメント集計（滞在・スクロール） | `{pages[{url_hash, dwell_p50, scroll_p50, date}], enabled}`（個人非特定・`REQ-WPA-11`） |
| `source.gsc.index_status.v1` | インデックス状況 | `{pages[{url_hash, state, issue_type?, checked_at}], quota_note}`（`REQ-KGA-21`） |
| `source.gsc.ai_report.v1` | Generative AIレポート（Beta・impressionsのみ） | `{pages[{url_hash, ai_impressions, date}], availability}`（クエリ・クリックなし、`REQ-KGA-17`） |
| `source.gsc.query_group.v1` | GSCクエリグループ | `groups[{group_id, queries[], clicks, impressions, match{keyword_group_id, method(exact/synonym/containment/co_landing/serp_verified), confidence}}]`（未マッチはmatch=null、`REQ-KGA-15`） |
| `source.keyword.map.v1` | キーワード市場・獲得シェア | `clusters[{cluster_id,representative,state,keywords[{normalized,role,market_state}],market{size,value,seasonality,aio_pressure,paid_pressure,competition,traffic_potential_range,availability},share{observed_site_share,estimated_search_share,article_distribution[],trend,confidence},serp_similarity,intent_mix,assigned_articles[],competitor_cohort[],site_attainability{components,confidence},strategy{site_necessity,traffic_opportunity,conversion_opportunity,content_feasibility,profile,dynamic_priority,components,confidence},provenance[],version}]`（市場とシェアを分離、`REQ-KGA-13/17/23`・`REQ-KRL-01〜08`） |
| `source.keyword.same_serps.v1` | 同一SERPsクラスタ | `clusters[{cluster_id, members[], evidence}]` |
| `source.keyword.coverage.v1` | カバー率 | `{url_hash, registered_coverage, click_weighted_coverage, uncovered[], drift_queries[]}` |
| `source.keyword.intent_cluster.v1` | intentクラスタ | `clusters[{cluster_id, intent, members[]}]` |
| `source.keyword.synonym_related.v1` | 類語・関連語（自然な言い換え候補） | `{keyword, synonyms[], related[]}` |
| `source.keyword.assignment.v1` | キーワード⇔記事アサイン台帳 | `assignments[{keyword_group_id, status, primary_article_id, canonical_url_hash}]`（`REQ-KGA-14`） |
| `source.article.map.v1` | 記事マップ | `articles[{canonical_url_hash, title, headings_summary, article_type, target_keyword_groups, observed_query_groups, coverage, content_hash, published, modified, url_alias_history}]` |
| `source.article.digest.v1` | 記事digest/構造 | `{url_hash, digest, section_hash[], outline_snapshot}` |
| `source.article.query_drift.v1` | Query Drift | `{url_hash, drift[{type, query_group, severity}]}` |
| `source.competitor.top5_structure.v1` | 競合上位5抽象構造 | `{keyword, competitors[{article_type, heading_pattern, common_points, missing_points, diff_opportunity}]}` |
| `source.cv.daily.v1` | CV日次集計 | `rows[{url_hash, goal, date, count}]` |

サイト方針データ（Source Pack取得 → Prompt Pack注入）:

| キー | 取得データ | 主なJSON項目 |
|---|---|---|
| `source.site.domain_positioning.v1` | ドメインポジショニング | `{positioning, audience, target_axes[{segment, literacy, situation}], allowed_claims[], avoided_claims[]}`（target_axes/avoided_claimsはユーザー戦略入力の写像先、`REQ-PRODUCT-12`） |
| `source.site.content_regulation.v1` | コンテンツレギュレーション | `{tone, ng_expressions[], cta_strength, evidence_strictness}` |
| `source.site.user_order.v1` | ユーザー要望 | `{orders[{text, strength, enabled}]}`（`enabled`既定true。soft-disableされた要望は`enabled=false`でコンパイル/注入対象から除外し削除はしない＝`REQ-PRODUCT-07`） |

外部データ（キーワード/クエリスコープ、予算・TTL配下、抽象化して返す）:

| キー | 取得データ | 主なJSON項目 |
|---|---|---|
| `source.serp.result.v1` | SERP上位 | `{keyword, results[{rank, url, title, type}]}` |
| `source.serp.paa.v1` | PAA | `{keyword, questions[]}` |
| `source.serp.aio.v1` | AIO観測（best-effort） | `{keyword, observed[], availability}` |
| `source.news.google.v1` | Googleニュース | `{keyword, items[]}` |
| `source.youtube.search.v1` | YouTube検索/字幕 | `{keyword, videos[{id, title, captions_summary}]}` |

## 8. Workflow × Pack ステージ別バインディング  ［REQ-PACK-08］

Workflowの各ステージが、どのPrompt Pack / Source Pack / Schemaを使うかをバインディングとして固定する。以下はステージ粒度の初期定義であり、Workflow定義（`REQ-AGENT-06`）と対応する。

これはPack/Catalogスコープ階層（`REQ-PACK-14`）のうちフェーズ・スコープに当たり、上位にフロー・スコープ（フロー単位のパック）、下位に遷移スコープ（遷移駆動の選択）が乗る。

| ステージ | 主なSource Pack | 主なPrompt Pack / Catalog | Schema |
|---|---|---|---|
| Research & Outline | `source.serp.*` / `source.gsc.*` / `source.keyword.*` / `source.competitor.top5_structure.v1` / `source.site.domain_positioning.v1` / SERP面構成＋起点に応じ `source.news.google.v1`・`source.youtube.search.v1`（`REQ-KGA-18`） / `source.site.topology.v1`（幹枝葉の位置づけ・内部リンク文脈、`REQ-KGA-19`） | `catalog.article_type.*` / `catalog.heading_flow.*` / `catalog.writing_method.*`（選択・Contract封入、`REQ-PACK-19`） | `schema.snapshot.research_brief.v1` / `schema.snapshot.outline_contract.v1` |
| Meaning Unit Writing | `source.article.digest.v1` / `source.keyword.map.v1` | `prompt.content_regulation.v1`（style_color含む） / `catalog.purpose_element.*` / `catalog.writing_method.*`（凍結済み選択のprinciples注入） / `prompt.user_order.v1` | `schema.ticket.writing.v1` / `schema.snapshot.writing.v1` / テーブルJSON（`REQ-PACK-05`） |
| QA | `source.keyword.coverage.v1` / `source.article.query_drift.v1` | `catalog.quality_gate.*` / `catalog.review_lens.*`（gate束への展開、`REQ-PACK-20`） / `prompt.content_regulation.v1`（style_color=human_voice対比アンカー） | `schema.snapshot.qa.v1` |
| Repair | QAが指すSource Extract | `catalog.purpose_element.*` / `catalog.writing_method.*`（Writingと同一の凍結選択） / `prompt.content_regulation.v1` | `schema.ticket.repair.v1` / `schema.snapshot.writing.v1` |
| Automation | `source.article.map.v1` / `source.cv.daily.v1` | WP出力スキーマ（`REQ-WPA-02`） | `schema.ticket.automation.v1` |

バインディングはWorkflow versionに固定され、ジョブ再現性を壊さない。

## 9. Quality Gate カタログ（Google公式ベースの機械判定シグナル）  ［REQ-PACK-09］

`REQ-AGENT-08` の枠組みを、`catalog.quality_gate.*` の具体ゲートへ落とす。各ゲートは、生成物から機械判定可能な代理シグナルで評価する。しきい値は初期値・要調整。出典:

- Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Spam policies for Google web search: https://developers.google.com/search/docs/essentials/spam-policies
- ランキングシステムガイド: https://developers.google.com/search/docs/appearance/ranking-systems-guide?hl=ja

### 9.1 hardゲート（生成してはならない＝Lowest/スパム回避）

自動公開を止め、保留・人手判断へ回す（`REQ-AGENT-08`, `REQ-PRODUCT-09`）。

- `catalog.quality_gate.scaled_content_abuse`: 付加価値のない量産の回避。シグナル＝独自情報/一次データ/独自分析の有無、既存上位・競合との内容重複率、外部の要約・言い換えのみで構成されていないか、検索キーワードのためだけの意味の薄い段落の割合。
- `catalog.quality_gate.scraping_thin`: コピー/わずかな改変/類義語置換/機械翻訳のみで付加価値がない、アフィリエイトで販売元説明の丸写し等の薄さ。シグナル＝外部本文との近似度、独自の比較・検証・追加情報の有無。
- `catalog.quality_gate.keyword_stuffing`: キーワード/数値/地名の不自然な羅列・反復。シグナル＝語の密度と不自然反復、文脈外リスト、自然な言い換えでの被覆かどうか。
- `catalog.quality_gate.deceptive_claim`: 誤解を招くタイトル・約束。シグナル＝タイトルと本文の一致、誇張/煽り、未確定事項（未発表の発売日等）の断定、存在しない答えの約束、偽の機能・主張。
- `catalog.quality_gate.authorship_integrity`: 著者情報の正直さ。シグナル＝架空の著者・偽の経歴/資格・偽の一次体験を書かない、AI利用の適切な開示（How）、責任主体の明示。
- `catalog.quality_gate.injected_link_or_hidden`: リンクスパム/隠しテキストの混入回避。シグナル＝最適化アンカーの不自然な挿入、購入/相互リンク誘導、非表示テキスト/リンクを生成しない。
- `catalog.quality_gate.site_reputation_fit`: サイト評判濫用の回避。シグナル＝生成トピックがサイトの主目的・Domain Positioningと整合し、評判目的の無関係な第三者的コンテンツを載せない。

### 9.2 advisoryゲート（満たすべき＝helpful/people-first）

不足はRepairループの入力とする（`REQ-AGENT-02`）。

- `catalog.quality_gate.original_value`: 独自情報・報道・調査・分析があり、検索結果の他ページ比で実質的な付加価値がある（当たり前を超える洞察）。
- `catalog.quality_gate.comprehensiveness`: トピックを実質的・網羅的に説明し、読後に再検索が要らない充足感がある。
- `catalog.quality_gate.needs_met_intent`: 検索意図タイプ（Know/Do/Website/Visit）を満たし、具体性と（必要時）鮮度がある。
- `catalog.quality_gate.title_honesty`: 見出し/タイトルが内容を的確に要約し、誇張・煽りがない。
- `catalog.quality_gate.eeat_trust`: 明確な出典、専門性の根拠、著者/About整合、評判整合、容易に検証できる事実誤りがない。
- `catalog.quality_gate.first_hand_experience`: 該当トピックで一次経験・深い知識を示す（実使用・訪問等）。
- `catalog.quality_gate.production_quality`: 誤字・スタイルが整い、雑・拙速でない。
- `catalog.quality_gate.freshness_honesty`: 実質更新なしの日付詐称や「新鮮に見せるだけ」の増減をしない。
- `catalog.quality_gate.coherence_flow`: 記事全体のまとまり（論旨の流れ・重複主張・トーン/用語の一貫性・ユニット間の事実整合）。シグナル＝Cohesion QAの読み通し検査＋`inter_unit_redundancy`・`term_consistency`（`REQ-AGENT-11`。不合格は接続部の限定Repairへ）。
- `catalog.quality_gate.argument_structure`: 論証構造（主張に根拠と限定が伴い、飛躍・論点先取がない）。シグナル＝`claim_evidence` / `nuance_qualification` ユニットとの整合・`citation_ratio`（`REQ-PACK-20`の論文記述レンズで使用。advisory）。
- `catalog.quality_gate.human_voice`: AIらしさの除去（機械的な定型句・空虚な前置きと締め・過剰な網羅羅列・単調な文長リズム）。シグナル＝①AI頻出定型表現の決定論検出（表現辞書はADM-S8管理・改版統制、metrics `ai_phrase_density`） ②**参照アンカー対比**——`gate_tags` に本ゲートを持つ手書きfew-shot例示（グローバル基準）と `style_color`（サイト別基準、`REQ-PACK-16`）を対比素材としてQA判定に注入し、「人間の声」からの乖離を評価する。例示は教材（生成時）と物差し（検査時）の両面で単一ソース（`REQ-PACK-12`）。対比素材の注入はキャッシュ層規約（`REQ-AGENT-03`）に従う——グローバル例示はゲート定義と同域（Layer A/B安定側）、style_colorはLayer B（Regulation同梱）で、QAプロンプトのバイト安定を保つ。初期はadvisory・較正後にhard昇格可（`REQ-ADM-10`のゴールデン評価で判別力を確認してから）。

### 9.3 修飾ゲート（トピック/記事タイプ依存）

- `catalog.quality_gate.ymyl_bar`: YMYL分類（健康・安全/金融/行政・社会）に該当する場合、正確性・専門家コンセンサス基準を引き上げ、重大不合格はhardとする（`REQ-AGENT-08`）。
- `catalog.quality_gate.review_depth`: レビュー系記事タイプでは、一次的な検証・比較・証拠（テスト内容/長所短所）を要求する。

各ゲートは`catalog.quality_gate.*`としてQuality Gate Registryに版固定し、QA Executorが適用する。hard/advisoryの区分としきい値・YMYL分類は初期値であり、L3で確定・較正する。判定の機械化できる部分は一般システムで、最終品質判断のLLM部分はエージェント内で行う（`REQ-KGA-08`）。

## 10. Quality Gate の計測指標と初期しきい値（第三者SEOヒューリスティック）  ［REQ-PACK-10］

`REQ-PACK-09` の各ゲートを機械判定するための計測指標と初期しきい値を定義する。Google公式は理想のキーワード密度・文字数・可読性数値を出さないため、以下は第三者SEOツール/実務（Yoast、Ahrefs、Clearscope/Surfer等）の計測ヒューリスティックであり、**公式基準ではなく経験則・要調整**である。これらはQA内部スコアリングの代理指標であって順位保証ではない（各種検証でコンテンツスコアの順位相関は約0.17〜0.28にとどまり、網羅の検証であって順位予測ではない）。機械判定は一般システム、最終品質判断のLLM部分はエージェント内（`REQ-KGA-08`）。値は`schema.snapshot.qa.v1`の出力項目候補とする。

- keyword_stuffing: 主要語のキーフレーズ密度。健全域0.5〜3%（中庸1〜2%）、>3%は要見直し。配置の偏り（フッター等への詰め込み）も検出。※公式は理想密度を否定。
- production_quality（可読性）: 日本語向け可読性指標をL3で検証・選定し、選定まではadvisoryとして扱う。文長、見出し配下の文章量、段落長等は日本語の読者層とSite文体に合わせて警告する。英語向けFlesch Reading Easeや英語の受動態率を日本語記事の合否基準へ流用しない。※可読性は直接の順位要因ではなく読者層で調整する。
- comprehensiveness / needs_met: 上位ランキング競合の推奨語（エンティティ・関連語）カバー率。目標の目安≥80%。競合セットは記事タイプ・ロケール一致で上位から選び、3件以上の一致を確認する。※カバー率はvalidatorであり順位予測ではない。SERP丸写しに寄せない。
- original_value: 独自要素（独自データ/一次経験/独自分析/独自比較）の存在数。最低1つ以上、YMYLや競合が濃いテーマはより高く。独自要素ゼロかつ高類似はscaled_content_abuse側へ。
- scaled_content_abuse / scraping_thin: 競合・既存本文との近似度（n-gram重複・near-duplicate類似度）。高類似かつ独自要素ゼロをhard。近似度しきい値は初期値・要調整。
- eeat_trust: 主張に対する出典付与率、権威ドメインへの引用有無、著者・About情報の有無。YMYLは基準を引き上げる。
- title_honesty: タイトルと本文の意味的一致度、煽り語彙・誇張の検出。

注意: 以上は相関の弱い代理指標である。hard/advisoryの最終確定と数値較正はL3で実データに基づき行い、スコア追従のためにnarrative品質やoriginal_valueを犠牲にしない。

## 11. Pack Type カタログと型定義  ［REQ-PACK-11］

各名前空間の具体タイプを列挙し、タイプごとの型（フィールド）を定義する。列挙は拡張可能・初期集合であり、値・型の最終確定はL3で行う。

### 11.1 catalog.article_type.*（記事タイプ）  ［REQ-PACK-11.1］

列挙（初期）: `transfer_guide` / `comparison` / `ranking` / `faq_hub` / `knowledge` / `news_column`。

型: `{ article_type, target_intent(Know/Do/Website/Visit), required_meaning_units[], optional_meaning_units[], heading_flow_ref, cta_policy, few_shot_ref }`

### 11.2 catalog.heading_flow.*（見出し内の意味ユニット並び）  ［REQ-PACK-11.2］

列挙（初期）: `experience_translation` / `problem_solution` / `comparison_matrix` / `step_by_step` / `faq_stack` / `conclusion_first`（PREP/SDS系＝結論先行） / `listicle`（SEO頻出のリスト記事型） / `pas_persuasion`（PAS/BAB系＝問題→煽らない共感→解決） / `story_arc`（ストーリーテリング系＝場面→変化→学び）。構成フレームワーク（PREP/SDS/PAS/BAB/AIDA/QUEST等）は本列挙とh2_sequenceのユニット並びテンプレで表現し、新レイヤを作らない（`REQ-PACK-19`）。

型: `{ heading_flow, h2_sequence[ { h2_role, meaning_units[] } ] }`

### 11.3 catalog.purpose_element.*（意味ユニット＝記述タイプ＝作業単位）  ［REQ-PACK-11.3］

意味ユニットを機能別にグルーピングして列挙する（本カタログを正本とし、`REQ-AGENT-02`は代表例）。各ユニットはfew-shot（`REQ-PACK-12`）と主なQuality Gate（`REQ-PACK-09`）に紐づく。列挙は拡張可能・初期集合。

- 導入・骨格: `problem_framing`（課題提起） / `summary_tldr`（結論先出し） / `definition`（用語・概念の定義） / `key_takeaways`（要点まとめ） / `section_bridge`（接続文） / `internal_link_context`（内部リンク文脈、`REQ-KGA-09`） / `video_reference`（動画参照・埋め込み文脈、`REQ-KGA-18`。埋め込み可否はWP Capability配下）
- 主張・論証: `claim_reason`（主張＋理由） / `claim_evidence`（主張＋根拠・出典・データ →eeat_trust） / `causal_explanation`（因果・仕組み） / `misconception_break`（誤解の解体） / `counterargument_rebuttal`（反論＋再反論 →original_value） / `nuance_qualification`（例外・条件「ただし」→eeat_trust）
- 具体・一次情報: `concrete_example`（具体例） / `case_study`（事例詳細 →original_value） / `first_hand_experience`（一次経験 →first_hand_experience） / `expert_quote`（専門家引用・一次情報 →eeat_trust） / `analogy`（たとえ・比喩）
- 比較・評価: `comparison`（比較） / `pros_cons`（長所短所） / `tradeoff`（トレードオフ） / `ranking_or_priority`（ランキング/優先度） / `decision_criteria`（判断基準 →needs_met_intent） / `recommendation_fit`（適合＝こんな人向け） / `scoring_rubric`（評価軸・採点 →review_depth）
- 手順・実務: `step_by_step`（手順） / `checklist`（チェックリスト） / `prerequisite`（前提・必要なもの） / `troubleshooting`（問題→原因→対処） / `best_practice_tip`（コツ・ベストプラクティス） / `risk_warning`（注意・落とし穴 →deceptive_claim回避） / `template_block`（テンプレ・記入例）
- 情報整理・データ: `table_block`（表＝JSON、`REQ-PACK-05`） / `faq_answer`（FAQ） / `categorization`（分類・種類整理） / `timeline`（時系列・経緯） / `cost_breakdown`（料金・数値内訳） / `eligibility_check`（対象・条件判定） / `glossary`（用語集）

型: `{ purpose_element, group, pattern, few_shot[ { role(positive/negative), gate_tags[], example_ref } ], constraints[], primary_gate }`（few-shotの構築は`REQ-PACK-12`）

### 11.4 catalog.quality_gate.*（品質ゲート）  ［REQ-PACK-11.4］

列挙: `REQ-PACK-09`（hard/advisory/修飾）。

型: `{ gate_key, kind(hard/advisory/modifier), signals[], threshold_ref(REQ-PACK-10), source_framework }`

### 11.5 prompt.*（注入系）  ［REQ-PACK-11.5］

取得元はサイト方針データ `source.site.*`（`REQ-PACK-07`）で、内容をPrompt Packとして注入する（取得→注入、`REQ-AGENT-07`）。

- `prompt.domain_positioning`: `{ positioning, audience, target_axes[], allowed_claims[], avoided_claims[] }`（`REQ-PRODUCT-12`のターゲット軸・主張軸を含む）
- `prompt.content_regulation`: `{ tone, ng_expressions[], cta_strength, evidence_strictness }`
- `prompt.user_order`: `{ orders[ { text, strength(soft/normal/strong) } ] }`（`source`側で`enabled=false`の要望は除外済みで注入＝soft-disable、`REQ-PRODUCT-07`）

### 11.6 workflow.*（実行手順）  ［REQ-PACK-11.6］

列挙: `REQ-AGENT-06`（new_article / rewrite / automation）。

型: `{ workflow_key, flow_pack_keys[], stages[ { stage, phase_bindings, transitions[ { to, transition_bindings } ], loop{ converge, stop_guards[] } } ], permissions[], bindings_ref(REQ-PACK-08, REQ-PACK-14) }`

### 11.7 schema.*（Ticket入力・Snapshot出力の型）  ［REQ-PACK-11.7］

- `schema.ticket.<stage>.v1`（Ticket入力、`REQ-PACK-01`）: `{ workflowKey, promptPackKeys[], sourceNeedKeys[], schemaKeys[], returnTo, userPrompt, content_role_map }`
- `schema.snapshot.research_brief.v1` / `schema.snapshot.outline_contract.v1`: Research Brief / Outline Contract のfreeze成果（Outline ContractはMeaningUnitPlanを含む、`REQ-PACK-18`。`REQ-PACK-08`のResearch & Outlineステージ出力。項目確定はL3）
- `schema.snapshot.writing.v1`: `{ url_hash, sections[ { h2_role, meaning_units[], content_ref } ], self_check, meta }`
- `schema.snapshot.qa.v1`（保留分をここで確定）: 
  ```txt
  {
    url_hash,
    gates[ { gate_key, kind, verdict(pass/fail/warn), score, evidence } ],
    metrics{
      keyword_density, readability[{metric_key,value,advisory}],
      competitor_term_coverage, original_element_count,
      near_duplicate_similarity, citation_ratio, title_body_match,
      inter_unit_redundancy, term_consistency, ai_phrase_density
    },
    ymyl(bool),
    hard_gate_block(bool),
    anonymization_note, truncation_note,
    notes
  }
  ```

metricsの計測法・初期しきい値は`REQ-PACK-10`、gatesは`REQ-PACK-09`に対応する。version固定でジョブ再現性を壊さない（`REQ-PACK-04`）。

## 12. Few-shot 構築と品質チェックの単一整合  ［REQ-PACK-12］

few-shotはPrompt Packの一部（`REQ-PACK-01`: Prompt Pack = 構造 + few-shot + 制約）であり、記述タイプ（意味ユニット＝`catalog.purpose_element.*`）・記事タイプ（`catalog.article_type.*`）・見出しフロー（`catalog.heading_flow.*`）ごとにここで作り込む。few-shot（生成の教示）とQuality Gate（生成物の検査）は同一の品質仕様を共有し、二重管理とドリフトを防ぐ。

構造:

- 正例（quality-gate適合の模範）: 各タイプに、E-E-A-T・独自価値・Needs Met等を満たす短い模範を持たせる。記事タイプの必須意味ユニット（`REQ-PACK-11`）には最低1つの正例を用意する。
- 反例（任意、gate不適合の回避教示）: keyword_stuffing / scraping・thin / deceptive_title / 無付加価値コピー等のLowest級パターンを「やってはいけない例」として明示する。正例と明確に区別し、正例として学習させない。
- 各few-shotエントリは、実証するQuality Gate（`REQ-PACK-09`のgate_key）を`gate_tags`でタグ付けし、few-shot↔QAを対応づける。

品質チェックとの整合（単一ソース）:

- 同じgate定義（`REQ-PACK-09`）と計測指標（`REQ-PACK-10`）が、few-shotの正例/反例の選定基準とQAの合否基準の両方を駆動する。「教える基準」と「検査する基準」を単一ソースにし、乖離させない。
- few-shot自体がLowest/スパムを模範化しない（正例にkeyword stuffing等を含めない）。反例は必ず反例として提示する。

運用:

- few-shotは`catalog.*`としてversion固定し、injectorがsystem promptへ強制注入する（`REQ-AGENT-07`）。userPromptでは上書きできない。
- Prompt Cacheとトークン原価のため圧縮する（`REQ-AGENT-03`、Content Regulationのfew-shot圧縮＝`REQ-PACK-02`）。coverage（十分な教示）とtokenコストのバランスを取る。
- 較正: 正例/反例の追加・改訂は、QA実績（どのgateが落ちやすいか）に基づきreview-improveでL3で更新する。

## 13. Pack のステージ階層（方針決定＝アウトライン層 / 実装＝執筆層）  ［REQ-PACK-13］

Packは適用ステージで階層が分かれる。方針を決める層と実装する層を同列に扱わない。

方針を決めるCatalog（アウトライン層）:

- `catalog.article_type.*`（マクロ＝記事全体の構成型）と `catalog.heading_flow.*`（メソ＝H2/H3内の意味ユニットの並び）が、「どんな記事か・どう構成するか」という記事方針を決める。Research & Outlineステージで適用し、Outline Contractに凍結する（`REQ-AGENT-02` Stage1、`REQ-PACK-08`）。

実装するCatalog（執筆層）:

- `catalog.purpose_element.*`（ミクロ＝各意味ユニットの文章パターン）は、アウトラインで確定した意味ユニットを執筆時に実装する下位レイヤである。Meaning Unit Writing / Repairステージで適用する（`REQ-PACK-08`）。方針決定Catalogと同列に置かない。

組み合わせ要件（方針を成立させる入力・制約であって、方針そのものを決める層ではない）:

- 入力: Domain Positioning / Content Regulation / User Order（サイト方針、`source.site.*`→`prompt.*`）、Source data（SERP/競合/GSC/キーワード、`REQ-PACK-07`）。
- 品質制約: Quality Gate（`REQ-PACK-09` / `REQ-PACK-10`）と few-shot（`REQ-PACK-12`）。

記事バリエーションは、アウトライン層の構造Catalog（article_type × heading_flow）が方針を決め、執筆層のpurpose_elementがそれを実装し、組み合わせ要件（Positioning / Regulation / Order / Source / Gate / few-shot）が成立させる、という3層（マクロ／メソ／ミクロ）×ステージの階層合成で表現する。層とステージの対応は`REQ-PACK-08`のバインディングに従う。執筆技法（`catalog.writing_method.*`、`REQ-PACK-19`）はこの3層と直交する**横断修飾レイヤ**であり、構造を置き換えずユニット執筆の書き方制約として重畳する（primary 1＋modifier≤2の注入上限）。

## 14. Pack/Catalog のスコープ階層（フロー / フェーズ / 遷移）  ［REQ-PACK-14］

Pack/Catalog の引き当ては、ステージ別の一枚テーブル（`REQ-PACK-08`）だけでは足りない。フロー（Workflow全体）・フェーズ（ステージ）・遷移（フロー内の遷移経路）の3スコープに分ける。

- フロー・スコープ（フロー単位のパック）: Workflow全体に効くPack/Catalog。そのフローの全フェーズに常時適用する（フロー固有の全体制約・共通Catalog）。Workflowに `flow_pack_keys` として束ねる。
- フェーズ・スコープ（ステージ単位）: 各フェーズで引くPack/Catalogは変わる（`REQ-PACK-08` のステージ別バインディング。Research&Outline / Writing / QA / Repair / Automation で異なる）。
- 遷移スコープ（遷移単位）: どのCatalogを引くかは、フロー内の遷移経路で変わる。同じフェーズでも到達した遷移が違えば引くCatalogが変わりうる（例: 初回のWriting遷移と、QA不合格→Repair遷移とでは、引く `catalog.purpose_element.*` / `catalog.quality_gate.*` の集合が異なる）。遷移がCatalog選択を駆動する。

解決順序: injector（`REQ-AGENT-07`）は、現在のフロー状態（flow / phase / last_transition）から「フロー・スコープ（常時）＋現フェーズ＋現遷移」の和集合を解決してsystem promptへ注入する。狭いスコープ（遷移 ＞ フェーズ ＞ フロー）が、必要に応じて上位の既定を差し替え・追加する。

`REQ-PACK-08` はこの3層のうちフェーズ・スコープに当たる。Workflow定義（`REQ-AGENT-06`）は、`flow_pack_keys`（フロー）、phase→bindings（`REQ-PACK-08`）、transition→bindings（遷移別の追加/差し替え）を持ち、versionで固定する（`REQ-PACK-04`）。

このスコープ階層は Prompt Cache Layer（`REQ-AGENT-03`）に対応する: グローバル/フロー＝Layer A（Workflowの状態機械＝遷移図を含む）、サイト方針＝Layer B、フェーズ（工程）＝Layer C、遷移/タスク動的＝Layer D。工程別・遷移別で注入Catalogが変わるのはこの層構造による。工程の順序と遷移は Layer A の状態機械（遷移図）が正本で、Orchestratorがゲート（Intake / Quality Gate / Preview承認 / Cleanup）を強制する。具体的な工程・遷移トポロジは各Workflowの個別設定として状態機械に定義する（`REQ-AGENT-06`）。

## 15. Pack Resolver / Dispatch  ［REQ-PACK-15］

Pack本体はOrchestrator側の正本であり、Executorには必要最小限の **PackExtract** を渡す（`REQ-PACK-06`）。PackExtractには構造・few-shot・制約を必ず含め、巨大なSource Pack全文・Webページ本文全文・記事本文全文は渡さない。PackExtractは可能な限りcanonical JSON化し、同一Pack hashで再利用する（Prompt Cache、`REQ-AGENT-03`）。User PromptはPackより後方のdynamic suffixに置く。Packが存在しない・古い・サイト境界外の場合は、捏造せずTicketを `blocked` / `needs_pack` にする。Pack Dispatch は `Pack + User Prompt` を発行する実行単位である。

将来の拡張アプリは専用Executorを無条件に増設せず、App Manifestから `required_agent_roles[]、workflowKeys[]、promptPackKeys[]、sourceNeedKeys[]、schemaKeys[]、catalogKeys[]、toolCapabilityKeys[]` を登録する。Task起動時は既存Ticketがキーだけを発行し、Pack Resolverがapp Entitlement、Site割当、Permission、app／Pack互換versionを検証して通常と同じPack問い合わせ・注入経路で解決する。アプリの説明文、Officeの部屋名またはAgent外見をPrompt Packとして直接実行しない。

Feature ProviderがMCP等を介してTool／Resource／Prompt候補を公開する場合、Discovery結果をそのままTicketへ入れず、App Manifestとの一致確認とPlatform Catalogへの承認登録を経て安定keyへ変換する。TicketとOrchestratorは接続先固有名や本文ではなく承認済みkeyだけを扱い、Pack Resolverがlocal／remote transport差を隠蔽する。

基本SEO WorkflowはCore所有のWorkflow／Pack／Schemaだけで成立させる。Feature Objectは主として追加 `sourceNeedKey` とContext Envelopeを提供し、必要に応じて承認済みの分析Pack、Tool Capability、表示Schemaを加える。Object未導入・停止・stale時は追加Contextを `unavailable` として外し、Core Workflowを `app_required` で全面停止しない。ただしユーザーが当該追加Contextを必須条件として明示したTaskだけは、理由付きで保留できる。

アプリ固有の専門Agentは新しい人格モデルではなく、原則として既存ExecutorにRole Profile、Workflow、Pack、Tool集合を束ねた実行構成とする。独立Executorが必要な場合は、隔離、費用、latency、失敗domain、追加権限を設計審査で示す。アプリ停止・version不一致・Entitlement失効時は `app_required／app_update_required／permission_required` としてfail-closeし、Packを推測補完しない。

## 16. Pack Compiler と User Knowledge  ［REQ-PACK-16］

Siteの言い回し学習をユーザーがONにした場合だけ、指定された見本記事を本文保持せず抽出後に用途別Packへ圧縮する。10本は学習ON時に使用できる標準サンプル数であり、全Siteの導入必須条件にしない。`compressed_sample_profile_pack` は廃止し、Pack Compilerが次を生成する: Domain Positioning Pack（Research/Outline/Heading Structure/Site Authority上流）、Content Regulation Pack（Writing/QA/Repairへ常時注入）、Site Authority Pack、CTA Policy Pack、Regulation Policy Pack。`User Knowledge Pack` はユーザー指定情報の正本であり、サンプル記事由来の推定より優先する。矛盾は `pack_compile_warnings` に保存する。

Style Color（サイトの声の実例アンカー）: Pack CompilerはContent Regulationに `style_color` を同梱する——サンプル記事からの代表抜粋（token上限は設定・`REQ-ADM-09`）＋構造化文体特徴（一人称・語尾・文長リズム・比喩/口語の頻度・段落呼吸）。抽出ルールだけでは失われる「このサイトの人間の声」を実例として保持し、(a) Writing/Repairへの文体参照（Layer B・サイト安定層）と (b) `human_voice` ゲートのサイト別対比アンカー（`REQ-PACK-09`）に用いる。本文非保持原則との整合: 抜粋はユーザー自身のサンプル記事に由来する学習派生資産であり、全文でなく上限内の抜粋のみ・登録同意フロー内・サイト削除で消去される。生成記事本文の非保持（WP正本）は不変。Pack Compilerは hash と version を発行し、ジョブ開始時にfreeze、更新後も旧version/hashを保持して再現性を担保する（`REQ-PACK-04`）。本文全文は恒久保存しない。

## 17. CTAはQA・Placement  ［REQ-PACK-17］

CTAはWriting Ticketではない。`cta_bridge` をWriting Ticket Typeにせず、CTA専用執筆チケットを作らない。CTAは、CV導線・ボタン・フォーム・相談導線の配置/妥当性/自然さ/訴求強度/WPブロック設置を検査するQA対象である。QA Ticketが `CTAPlacementInstruction` または `WPBlockPlacementInstruction` を返し、OrchestratorがAssembly/Placement段階（`cta_box` slot、`REQ-WPA`）で扱う。配置密度・訴求強度の判断入力には、CTA Policy Pack（`REQ-PACK-16`）に加えてwriting_method variantの `cta_density_hint`（`REQ-PACK-19`。例: assist_onlyは最小密度）を含める。

## 18. Meaning Unit Type Registry と Outline Contract  ［REQ-PACK-18］

H2/H3は構造コンテナであり直接の執筆単位にしない。Outline Contractは `MeaningUnitPlan`（各ノードの `headingStructurePackKey` と `meaningUnitPlans`）を持ち、Orchestratorはこれを見てWriting Ticketを発行する。意味ユニット種別は Meaning Unit Type Registry（`catalog.purpose_element.*`、`REQ-PACK-11.3`）で管理する。Heading Structure PackはDomain Positioning PackとCompetitor Structure Packを参照して選定し、Content Regulation Packは選定後の執筆/QA制約として注入する。QA/Repairループ: Writing Snapshot→Draft組立→QA検査→（Issue/RepairInstruction/CTAPlacementInstruction）→該当Meaning UnitだけRepair、全文・H2丸ごと再生成は原則禁止。サブエージェントはOutline Contractを変更しない。

## 19. Writing Method Catalog（執筆技法カタログ）  ［REQ-PACK-19］

「どう書くか」の技法を、既存の3層階層（article_type × heading_flow × purpose_element）と直交する**横断修飾レイヤ**として定義する。技法は構造を置き換えず、ユニット執筆・Repairの書き方制約として作用する。

### 19.1 catalog.writing_method.*（技法タイプ）

列挙（初期）: `technical_writing`（正確・一義・手順再現性・用語一貫） / `logical_writing`（主張-根拠-限定の明示・飛躍禁止・MECEな分解） / `content_marketing`（読者課題起点・信頼蓄積・売り込み前の価値提供） / `sales_writing`（ベネフィット翻訳・不安の先回り・行動障壁の除去。**ゲート適合の範囲内の説得技法**） / `seo_writing`（検索意図充足・結論先行・スキャナビリティ・クエリ語彙の自然な被覆） / `storytelling`（具体的場面・変化の弧・読者の自己投影。既存ユニット `case_study` / `first_hand_experience` / `analogy` / `problem_framing` 等へマッピングし、新規意味ユニットは追加しない）。

型: `{ method_key, principles[](圧縮済み・token予算内), unit_guidance[{ purpose_element, do[], dont[] }], variants[{ variant_key, stance_notes, cta_density_hint }](同一技法内の強度・姿勢パターン), applicable_article_types[], conflicts[](併用禁止の技法), gate_tags[](この技法を検証するゲート), few_shot_refs[], token_budget }`

variantは技法の列挙爆発を防ぐ強度軸である。`sales_writing` の初期variant: `push`（押し＝直接訴求・行動喚起を明示） / `pull`（引き＝価値提供先行で自然に引き寄せる） / `assist_only`（左手は添えるだけ＝情報充足を最優先し購買判断は読者に委ねる。CTAは最小密度）。`cta_density_hint` はCTA=QA/Placement（`REQ-PACK-17`）の配置判断へ渡すヒントであり、hard上限（`deceptive_claim` / `title_honesty`）はvariantに関係なく不変。

### 19.2 適用規約

- 選択と凍結: 技法はOutline凍結時に決定し、Outline Contractの任意フィールド `writing_methods{ primary, primary_variant?, modifiers[] }` に封入する（Gate A-5任意追加=minor規則）。**primary 1 ＋ modifier 最大2**（上限は設定・`REQ-ADM-09`）。全部盛りはLayer C肥大＝キャッシュ経済の毀損（`REQ-AGENT-03`）と技法間矛盾を招くため構造的に禁止する。
- 優先順位（衝突解決の固定順）: **安全不変条件 ＞ Quality Gate ＞ Content Regulation ＞ User Order ＞ writing_method**。技法はゲート・レギュレーションを上書きできない。特に `sales_writing` は `deceptive_claim` / `title_honesty` / 誇大・煽り・虚偽の希少性の禁止がhard上限であり、「売るための表現がゲートを通らないなら技法側が譲る」ことを型で保証する。
- 構成フレームワーク（PREP / SDS / PAS / BAB / AIDA / QUEST 等）とSEO頻出構成パターンは**新レイヤにしない**。`catalog.heading_flow.*` の列挙拡張（`REQ-PACK-11.2`）およびh2_sequence内の意味ユニット並びテンプレとして表現する。
- 技法と文体の分離: writing_methodは**技法・構造の教材（グローバルCatalog・全テナント共通）**であり、トーン・文体は各サイトのContent Regulation（`REQ-PACK-16`のPack Compiler由来）が常に上書きする。技法カタログにサイト固有の声を混入させない。
- 注入位置: 技法principlesはPackキーインジェクターが注入する固定制約（自由入力との分離原則は`REQ-AGENT-07`）だが、記事ごとに選択が変わるため**Layer C領域（Outline Contract同梱・Layer B境界より後）**に配置する。Layer A/B（フロー/サイト安定層）のバイト安定prefixを変化させない（`REQ-AGENT-03`のキャッシュ経済を毀損しない）。

### 19.3 few-shot（手書き例示）の登録規律

手書きの模範例示は新機構ではなく既存few-shot機構（`REQ-PACK-12`）へ登録する。追加の規律:

- **例示自身がゲートに合格すること**: 登録Validate段で例示本文を検品パイプライン（`REQ-PACK-20`のレンズ束）に通し、gate_tagsで主張する全ゲートに合格しない例示は差し戻す。「教える基準＝検査する基準」の単一ソースを人間の執筆物にも適用する。
- メタデータ必須: `{ purpose_element, article_type?, heading_flow?, writing_method?, gate_tags[], segment_refs[]?, human_authored: true, author_ref }`（segment_refsは`REQ-PACK-21`。同一purpose_elementでもセグメント別に例示を並存できる）。human_authoredな例示はネットワーク学習（`REQ-PRODUCT-13`）の集約対象外を既定とする。
- **教材と試験の分離**: few-shot例示とゴールデン評価セット（`REQ-ADM-10`）のタスク・素材は重複禁止。教えた例で検品する自己汚染（リーク）を規約で防ぐ。
- 圧縮: エントリごとのtoken予算（設定）内に収め、長文は抜粋＋注釈形式にする（`REQ-PACK-12`の圧縮規約に従う）。
- 登録経路はADM-S8（`REQ-ADM-10`統制・draft→Preview→Validate→Approve→Publish）。ユーザー自己サーブにはしない（`REQ-PRODUCT-12`の撤回判断を維持）。

技法principlesの実文・例示本文の執筆はL3以降の登録作業（ADM-S8）であり、本書はカタログ構造・検証・優先順位のみを固定する。

## 20. Review Lens Catalog（検品レンズ）  ［REQ-PACK-20］

検品の観点（校正・校閲・推敲・Webライティング原則・SEO・論文記述・マーケティング）を `catalog.review_lens.*` として定義する。**レンズは既存Quality Gateの束ね方（view）であり、ゲート定義の複製・第二の合否体系を作らない**（単一ソース原則＝`REQ-PACK-12`。合否は常にgate単位）。

### 20.1 列挙（初期7レンズ）

型: `{ lens_key, gates[](参照のみ), deterministic_checks[], order, article_type_applicability, notes }`

- `proofread`（校正）: 誤字脱字・表記統一・数字/単位・固有名詞。実体は決定論検査（`term_consistency` / 表記ルール / WP出力検査）＋ `production_quality`。**決定論を先行実行**し、LLM検査より安く早く落とす。
- `fact_review`（校閲）: 事実・整合・差別/不適切表現・法務リスク・引用の正当性。実体は `eeat_trust` / `deceptive_claim` / `ymyl_bar` / Regulation NG表現。**本文非保持・外部取得予算の制約下で全文ファクトチェックは不可能**であるため、本レンズは「sources_used内の根拠との整合検査＋要検証事実の人手確認フラグ（キュー化）」と定義し、断定的な自動修正をしない。
- `revision`（推敲）: 冗長・流れ・言い換え・全体のまとまり。**実体は`REQ-AGENT-11`のCohesion QA**（`coherence_flow` / `inter_unit_redundancy`）。
- `web_writing`（Webライティング原則）: 結論先行・スキャナビリティ・段落長・可読性。実体は可読性metrics（`REQ-PACK-10`）＋ `production_quality` / `comprehensiveness`。
- `seo_review`（SEO観点）: 意図充足・被覆・スタッフィング・タイトル誠実性・内部リンク。実体は `needs_met_intent` / `keyword_stuffing` / `title_honesty` / internal_link検査。
- `academic`（論文記述方式）: 主張-根拠-限定の論証構造・出典率・反証併記。実体は `citation_ratio` / `claim_evidence`系ユニット整合＋**新設 `catalog.quality_gate.argument_structure`**（advisory）。
- `marketing`（マーケティング観点）: 訴求とベネフィットの整合・CTA配置と文脈（`REQ-PACK-17`のCTA=QA/Placementへ接続）・過剰販促の検出。実体は `cta_timing` / `deceptive_claim`（hard上限）。

### 20.2 適用規約

- パイプライン順序: 決定論チェック（proofread先行）→ LLM検査の順で、安い検査で先に落とす。レンズの実行順は `order` で管理し、QA Ticketはレンズ束→gate束へ展開して発行する（`REQ-AGENT-02`のQA工程の内訳定義）。
- article_typeとの適合: レンズはarticle_type別に適用可否・重みを持つ（例: `academic` は knowledge/comparison で標準、news_column では緩和）。バインディングは`REQ-PACK-08`に従う。
- レンズの編集はADM-S8（`REQ-ADM-10`）。ゲート本体の改版と同じ統制（ゴールデン評価・段階ロールアウト）に服する。

## 21. Reader Segment と Persona Simulation（転生検証）  ［REQ-PACK-21］

例示・Pack改版の妥当性を「想定読者が実際にどう受け取るか」で検証するため、読者セグメントのカタログと、LLMをセグメント読者に転生させる検証機構を定義する。

### 21.1 catalog.reader_segment.*（読者セグメント）

軸（初期）: リテラシー（`novice` / `intermediate` / `expert`）・心理パターン（`cautious`=慎重比較型 / `impulsive`=直感即決型 / `authority_seeking`=権威依存型 / `skeptical`=懐疑型）・シチュエーション（`urgent_problem`=緊急課題 / `research_phase`=情報収集 / `pre_purchase`=購入直前）・デモグラフィック（性別・年代等）。

型: `{ segment_key, axis, persona_brief(転生用の圧縮記述), typical_queries[], sensitivity_notes }`

**属性利用の制約**: デモグラフィック軸は例示・記事の検証（受け取られ方の確認）にのみ用いる。読者属性による記事内容の差別的な出し分け・ターゲティング配信への転用は禁止し、`sensitivity_notes` に注意事項を保持する。few-shotエントリのメタデータに `segment_refs[]` を追加し、例示をセグメント別に複数登録できるようにする（同一purpose_element×別セグメントの並存可）。

### 21.2 Persona Simulation（転生検証）

- 実行形: セグメント定義の `persona_brief` からLLMを読者に転生させ、対象（例示・ゴールデン評価出力・任意で記事）を読ませて**構造化出力**を返す検証Ticket——`{ comprehension_score(理解度), friction_points[](違和感・引っかかり箇所), ai_perception(AIっぽさの知覚と根拠), dropout_prediction(離脱予測位置), action_intent(行動意向), segment_key }`。LLM判定はエージェント内限定の原則（`REQ-KGA-08`）に適合する。
- **位置づけ＝advisory**: 合否の正は常にQuality Gate（`REQ-PACK-09`）であり、シミュレーション結果は登録者・管理者の判断補助材料とする。LLM同士の主観判定を合否基準にすると再現性・較正可能性が壊れるため、この線は固定する。
- 実行タイミングとコスト規律: 既定は (a) few-shot例示の登録Validate（`REQ-PACK-19` §19.3）と (b) Pack/Catalog改版のゴールデン評価（`REQ-ADM-10`）の補助のみ。1回のValidateで実行するセグメント数・回数は上限設定（`REQ-ADM-09`）。**記事単体QAへの適用はオプション設定**（既定off・有効化時はPreflight見積へコスト明示、`REQ-SEC-12`）。
- 記録: シミュレーション結果はValidate記録・ゴールデン評価runに紐付けて保存し（`REQ-ADM-06`監査）、セグメント別の傾向はfew-shot較正（`REQ-PACK-12`）の入力にする。
- 実行経路: 転生検証は専用Executorを新設せず、QA Executor経路（`REQ-AGENT-05`の「実行役は少数」原則）の標準Ticket/Snapshot契約に乗せる。
- 転生プロンプト・セグメント初期定義の実文はADM-S8登録作業（L3以降）。本書は型・位置づけ・コスト規律のみ固定する。
