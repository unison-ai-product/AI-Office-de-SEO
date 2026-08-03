---
document_id: AOS-L1-DATAFORSEO-COMPETITOR-BATCH
title: AI Office de SEO 外部情報源・競合構造・分散バッチ要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-01
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 外部情報源・競合構造・分散バッチ要求 v3.7

## 分類別正本への移行

外部API契約は `categories/integration-requirements_v1.md`、取得値の判断は `categories/logic-requirements_v1.md`、保持は `categories/data-requirements_v1.md`、取得原価は `categories/cost-requirements_v1.md`、batch実行基盤の境界は `categories/technical-architecture-requirements_v1.md` を現在の正本とする。本書の `REQ-SRC-*` 等はProvider固有・batch固有の詳細として維持する。

## 1. 外部情報源  ［REQ-SRC-01］

外部情報源はSource Packとして扱う。外部取得結果をそのまま本文生成へ流さず、抽象化してResearch / Outlineへ渡す。

対象:

- Google SERP
- PAA
- AIO / AI検索面観測
- Google News
- YouTube検索
- YouTube動画情報
- YouTube字幕
- YouTubeコメント
- 自サイトGSC Discover / Google News / News Tab実績

Discover競合取得は前提にしない。Discoverは認証済み自サイトGSC実績として扱う。

## 2. Query Fanout  ［REQ-SRC-02］

Research工程でQuery Fanoutを行う。

展開例:

- 同一SERPs候補
- PAA候補
- AIO向け疑似要求
- Google News向けクエリ
- YouTube向けクエリ
- 類語・関連語
- modifier
- entity
- 地域SEO候補

Fanoutには停止条件を設ける。

- max_depth
- max_keywords
- max_serp_fetches
- max_news_fetches
- max_youtube_fetches
- max_cost
- min_confidence
- stop_when_no_new_cluster

## 3. 競合上位5記事  ［REQ-SRC-03］

競合記事は上位SERPからeligible competitor articleを5件選ぶ。

除外候補:

- 自サイト
- PDF
- SNS
- 掲示板/UGC
- 求人一覧
- カテゴリ一覧
- 広告LP
- 重複ドメイン
- noindex
- 本文が薄いページ
- 検索意図が明らかに違うページ

構造取得は自前軽量抽出器を優先し、取得できない場合は外部APIへfallbackする。

保存するのは競合本文ではなく、Competitor Structure Packである。

## 4. Crawler Compliance  ［REQ-SRC-04］

自前軽量抽出器は以下を守る。

- robots.txt確認
- noindex確認
- canonical確認
- User-Agent明示
- domain別rate limit
- timeout上限
- retry上限
- 取得失敗理由保存
- 競合本文全文を恒久保存しない

## 5. 夜間バッチ・定期実行  ［REQ-SRC-05］

重い処理は画面表示時に走らせない。tenant/site単位で分散し、checkpoint、idempotency、memory budget、cost budgetを持つ。

事前計算対象:

- Keyword Map
- Same SERPs Cluster
- Competitor Top5 Pack
- Article Map
- GSC Query Group
- Keyword Coverage
- Query Drift
- Rewrite Candidate
- Token / Credit Estimate

優先度:

- P0: GSCで急増した未登録クエリ
- P1: CVありURLのQuery Drift
- P2: index待ちからGSC取得可能になった記事
- P3: 主要キーワードのSERP freshness期限切れ
- P4: ユーザーが手動追加したmain keyword
- P5: 低優先の探索fanout

## 6. コスト管理  ［REQ-SRC-06］

外部APIの結果はキャッシュする。

- SERPは日次〜週次
- News / YouTube / AIO観測は短いTTL
- 競合構造Packは上位URL hashが変わったら再生成

テナント・サイト・プラン別に外部API予算を持ち、超過時は低優先ジョブを停止する。

## 7. 取得分散とグローバルレート/クォータ配分  ［REQ-SRC-07］

テナント/サイト単位の分割と個別予算（`REQ-SRC-05`, `REQ-SRC-06`）だけでは、テナント横断で共有される外部上限を守れない。外部APIにはテナントをまたいで共有される上限があり（GSC APIのプロジェクト単位クォータ、DataForSEO等プロバイダのアカウント単位レート・コスト）、各テナントが個別予算内でも合算がこれを超えうる。取得は以下でグローバルに分散する。

- グローバル/共有クォータ予算: プロバイダ別に、全テナント横断のグローバルなレート・クォータ・コスト予算を持つ。個別テナント予算の合算がプロバイダのプロジェクト/アカウント上限を超えないよう配分する。GSCは per-property と per-project（共有）の両方を尊重する（`REQ-KGA-11`）。
- 時間的分散（スタッガリング/ジッタ）: 夜間バッチの一斉起動を避け、テナント/サイト/ジョブをジッタ付きで時間窓に分散して起動し、バーストを平準化する。
- 同時実行・レート整形: プロバイダ別およびグローバルの同時実行上限と、トークンバケット的レート整形を設ける（`REQ-SRC-04`のdomain別rate limitを全体へ拡張）。
- テナント間フェアシェア: 共有クォータと夜間窓を重み付きで公平配分し、大規模テナントが占有・枯渇させない。優先度P0〜P5（`REQ-SRC-05`）はテナント内で適用し、テナント間はフェアシェアで調停する。
- バックオフと繰り延べ: 共有クォータ/レート超過（429等）はバックオフ・再試行し、継続時は低優先ジョブを次窓へ繰り延べる（`REQ-SRC-06`のコスト停止と整合）。
- 観測: グローバル/プロバイダ/テナント別のレート・クォータ・コスト消費と、繰り延べ・スロットルを観測する（`REQ-SEC-02`）。

窓・同時実行数・フェアシェア重み・しきい値は初期値であり、L3で較正する。

## 8. 分散実行単位・Batch Priority・DataForSEO Cache  ［REQ-SRC-08］

（正本: 旧 distributed-batch-precompute / catalog-graph-crawler-contract を移植）

- 分散実行単位: tenant/site単位で分散し、checkpoint・idempotency・memory budget・cost budgetを持つ（`REQ-SRC-05`, `REQ-SRC-07`）。メモリ安定性を保ち、大規模サイトでも破綻しない。
- Batch Priority Queue: P0（GSC急増未登録クエリ）〜P5（低優先探索fanout）で事前計算対象（Keyword Map / Same SERPs / Competitor Top5 / Article Map / GSC Query Group / Coverage / Query Drift / Rewrite Candidate / Token・Credit Estimate）を優先処理する。
- DataForSEO Cache: SERP/PAA/AIO等はTTL付きキャッシュし、freshness期限で再取得する。取得不可・期限切れはavailability理由を返し捏造しない。
- Batch Observability: バッチのレート・クォータ・コスト消費・繰り延べ・スロットルを観測する（`REQ-SRC-07`, `REQ-SEC-13`）。

## 9. Query Fanout Agent（公開ロジック準拠）  ［REQ-SRC-09］

Query Fanout（`REQ-SRC-02`）を、Google AI Mode / AI Overviews の公開技術 query fan-out の考え方に沿って具体化する（根拠と出典は参照ノート、Google公式: AI Features and Your Website）。本製品はGoogle内部実装を複製せず、網羅（自サイトがサブクエリを被覆する）に応用する。

- 分解: シードキーワード/GSCクエリを、facet別サブクエリへ分解する。facet＝エンティティ / 制約 / 意図 / 時間参照 / 比較 / 類語・言い換え。複雑・多面的なクエリほど多く分解し、単純な事実クエリは広げない。
- 取得: 各サブクエリを Source Pack（`source.serp.*` / `source.serp.paa.v1` / `source.serp.aio.v1` / `source.keyword.synonym_related.v1`、`REQ-PACK-07`）で並列取得する。取得不可（AIO等）は捏造せず availability 理由を返す（`REQ-WPA-10`）。
- 網羅への接続: サブクエリ群をサブトピックへ写像し、記事の網羅（`REQ-PACK-09` comprehensiveness、`REQ-KGA-10`）とアウトライン（`REQ-AGENT-02`）へ渡す。検索ボリューム0のダーククエリも網羅候補に含めうる。
- 制御: サブクエリ数・facet重みは初期値・L3較正（第三者の「8種類」「9〜11本」等は非公式）。負荷・コストは `REQ-SRC-07` / `REQ-SRC-08` の分散・予算・キャッシュに従う。
- Column / Knowledge記事対応: ニュース/コラム/ナレッジ系は freshness と一次情報の扱いを facet に反映する。

## 10. 営業時間スケジューリングと負荷平準化  ［REQ-SRC-10］

- テナント設定: サイト/テナント単位でタイムゾーンと稼働時間帯（業務時間・静穏時間帯）を設定できる（既定はJST夜間静穏。設定はS7）。
- ジョブ配置: 夜間バッチ（`REQ-SRC-05`）・scheduledレーン（`REQ-BILL-11`）・部分パッチの分散適用（`REQ-WPA-12`）は、**テナントの静穏時間帯**に配置する。interactive需要の高い業務時間帯には重いバッチを避ける。
- プラットフォーム平準化: 全テナントの静穏窓が同時刻（例: 深夜2時）に集中してサーバー全体がスパイクしないよう、**窓内オフセットを分散**（テナント別の割当スロット・キュー水位による流量制御）し、ノード単位の同時実行上限を設ける。優先度は既存のBatch Priority（`REQ-SRC-08`）に従い、interactiveジョブはバッチと資源プールを分離または優先確保する。
- 例外: 鮮度highジョブ（`REQ-KGA-18`）とユーザー起動のinteractiveは営業時間内でも即時実行。しきい値・窓・上限は設定レジストリ（`REQ-ADM-09`）。
