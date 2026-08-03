---
document_id: AOS-L2-DOMAIN-MODEL
title: AI Office de SEO ドメインモデル（DDD） v3.7
version: 3.7
layer: L2
kind: design
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L2-01-ai-office-de-seo-domain-model
---

# AI Office de SEO ドメインモデル（DDD）

L1要求（REQ）を、DDDの語彙で構造化する。用語は用語一覧（AOS-L2-GLOSSARY）に従う。本書はL2（ドメイン設計）であり、実装（DDL/JSONスキーマ）はL3で確定する。

## 1. サブドメイン分類

- Core（差別化＝SEOコンテンツ生成エンジン）: Content Index / Search Performance / Generation / Quality / Rewrite。
- Supporting（中核を支える）: External Intelligence / Publishing & Automation / Provider / Config & Governance。
- Generic（汎用・置換可能）: Tenancy & Access / Billing & Credit（Stripe）/ Observability & Audit / Experience(UI) / Notification / Support / Platform Operations。

## 2. 境界づけられたコンテキスト（Bounded Context）

| BC | 責務 | 主な集約 | 根拠REQ |
|---|---|---|---|
| Tenancy & Access | テナント・サイト・権限・サンドボックス境界・アカウントライフサイクル・マスターテナント | Tenant, Site(SiteSandboxContext) | REQ-PRODUCT-02/08/10/23, REQ-SEC-07/08/15/16 |
| Content Index | URL正本・記事メタ（サマリー契約・意味索引）・キーワード/記事マップ・属性・アサイン台帳・起点候補・サイトトポロジー・導出事実/施策台帳 | UrlMaster, ArticleSummary, KeywordMap(AssignmentLedger), SiteTopology, DerivedFacts(InterventionLedger) | REQ-PRODUCT-03/04/19/20, REQ-KGA-01〜04/07/12/13/14/18/19 |
| Search Performance | GSC実績・被覆・ドリフト・カニバリ・リライト候補・マッチカスケード・ロングテール昇格・市場圧力・動的キーワード戦略・ウォッチ/変動監視・インデックス状況・月次プランニング・Recommendation | GscDataMart, CoverageAssessment, RewriteCandidate, QueryMatch, KeywordMarketPressure, KeywordStrategyProfile, Watchlist, MonthlyPlan, Recommendation | REQ-KGA-05/06/08/11/15/16/17/20/21/23, REQ-PRODUCT-05/17/24, REQ-KRL-01〜10, REQ-DATA-06 |
| External Intelligence | SERP/競合/Fanoutの取得・キャッシュ・バッチ・静穏窓スケジューリング | SourcePack, CompetitorStructure, FetchBatch | REQ-SRC-01〜10 |
| Generation | Workflow状態機械・Ticket・Pack注入・執筆・QA/Repair・中断/再開・全体整合パス・実行冪等性・執筆技法レイヤ | GenerationJob, Ticket, PackCatalog, OutlineContract | REQ-AGENT-01〜11, REQ-PACK-01〜21 |
| Quality | 品質ゲート・計測・few-shot・合否・コヒーレンス検査・ゴールデン評価・検品レンズ・AIらしさ検査・転生検証 | QualityGateEvaluation, GateRegistry, ReaderSegment | REQ-PACK-09/10/12/20/21, REQ-AGENT-08/11, REQ-ADM-10 |
| Rewrite | Article-as-Code・パッチ・原因分析・好調保護/波及・フラッシュリライト(TDH) | RewriteJob(ArticleWorkspace) | REQ-RWR-01〜09 |
| Publishing & Automation | WP能力・Dynamic Post Schema・予約・CV・エンゲージメント計測・部分パッチ・CVポイント台帳 | PublicationJob(PostEnvelope), AutomationPolicy, CvPointLedger | REQ-WPA-01〜13 |
| Billing & Credit | プラン・購読・クレジット台帳・見積・実行レーン(Batch) | CreditAccount(Ledger), Subscription | REQ-BILL-01〜08/11, REQ-SEC-04/12 |
| Provider | プロバイダ登録・アダプタ・ルーティング | ProviderProfile, RoutingPolicy | REQ-BILL-04/09, REQ-AGENT-04 |
| Config & Governance | 設定レジストリ・Flag・安全不変条件・資源/変更ガバナンス・ネットワーク学習の適用統制 | ConfigRegistry, FeatureFlag | REQ-ADM-09, REQ-BILL-10, REQ-DUR-04, REQ-PRODUCT-13/18 |
| Observability & Audit | トークン/契約検証・監査・SLO・表示ラベルレジストリ | UsageTrace, AuditLog | REQ-SEC-02/03/10/13, REQ-ADM-04/06/07/08/11 |
| Experience (Agent Office UI) | 2モード・部門/ペルソナ/フロア・2軸・グローバル検索・エクスポート・レスポンシブ/i18n・アクセシビリティ品質床 | OfficeLayout(Room, Persona) | REQ-AOUI-01〜07, REQ-NAV-01〜09, REQ-PRODUCT-14/15 |
| Notification | ドメインイベントからの通知導出・受信者解決・チャネル配信・通知センター・運営お知らせ・メール送達性 | NotificationDelivery, MailSuppression | REQ-PRODUCT-11/16/21 |
| Support | サポートチケット・AI一次応答（Role/スコープ内参照限定）・エスカレーション・ナレッジ還流 | SupportTicket | REQ-PRODUCT-22 |
| Platform Operations | 実行基盤/デプロイ規約・キャパシティ/密度・バックアップ/DR・コンテナ移管性・自動復旧/保守 | （集約なし・横断運用契約） | REQ-DUR-06〜10 |

## 3. コンテキストマップ（関係とDDDパターン）

- Tenancy & Access → 全BC: **Shared Kernel**（SiteSandboxContextを全BCが共有）。越境は構造的に不可（REQ-SEC-07）。
- Content Index / Search Performance / External Intelligence → Generation: **Customer/Supplier**。GenerationはこれらをSource Pack経由でのみ取得する。**Pack＝Anti-Corruption Layer**（直テーブル・生SQLを遮断、JSONへ正規化、REQ-PACK-06）。
- Generation ⇄ Quality: **Partnership**。Generationは品質ゲートを工程内で呼び、fail-closeで公開を止める（REQ-PACK-09, REQ-RWR-05）。
- Search Performance → Generation / Rewrite / Publishing & Automation: **Customer/Supplier**。採用Recommendationをversion付きIntake Contractとして渡し、目的・Keyword Cluster・検索インテント・記事目的・CTA・内部リンク・品質・予算・保護条件を再入力させない。Generation側がRecommendationを画面表示から再構築することを禁止する。
- Generation / Rewrite → Publishing & Automation: **Customer/Supplier**。Snapshot→PostEnvelope→CMS下書き。新規記事は最初の15記事まで完成記事承認を必須とし、解放後はAutomation Policyに従う。リライト・記事置換はCMS下書き後のユーザー承認を必須とする（REQ-LOGIC-04）。
- Generation / Rewrite → Billing & Credit: **Customer/Supplier**。実行前にreserve、成功commit・失敗release（REQ-BILL-07, REQ-SEC-12）。
- Generation → Provider: **ACL**（Provider Adapter Contractがプロバイダ差異を吸収し、品質段階、必要Capability、原価、latency、health、契約条件からversion付きRouteを解決する。特定Provider優先をドメイン不変条件にしない。REQ-TECH-10、REQ-AGENT-04）。
- Config & Governance → 全BC: **Conformist / Published Language**。価格・しきい値・Flagはレジストリから解決。安全不変条件は設定対象外（REQ-ADM-09）。
- 全BC → Observability & Audit: **ドメインイベント購読**（消費・契約検証・監査を横断収集、REQ-SEC-13）。
- Experience(UI) → 全BC: **Conformist**。業務entity・権限・Command/Eventは通常ビューとOfficeで共通化する。一方、Officeの部屋、会話、探索、設備、表示位置等の体験状態は独自に保持できるが、業務正本・認可・実行状態を複製しない（REQ-AOUI-01、REQ-SCREEN-18）。

補足: Workflow状態機械（REQ-AGENT-09）は Generation 内の **Process Manager / Saga** であり、工程間遷移とゲートを調停する。

## 4. 中核集約（Aggregate：ルート・不変条件）

### 4.1 GenerationJob（Generation）
- ルート: GenerationJob（1 job = 1 workflow instance）。
- 内包: Ticket（値）, OutlineContract, Snapshot群, 適用Pack/Catalog version。
- 値: WorkflowKey, PackExtract, MeaningUnitPlan, StageState。
- 不変条件: 作成時に `tenant_id`/`site_id`/`job_id` と Workflow/Pack/Catalog/Config version を freeze（REQ-PACK-04）／実行中にsite変更不可／工程順序は状態機械が強制しゲートを飛ばさない（REQ-AGENT-09）／Ticketは本文を内包しない（REQ-PACK-01）／H2/H3を直接執筆単位にしない（REQ-PACK-18）。

### 4.2 QualityGateEvaluation（Quality）
- ルート: QA Snapshot（schema.snapshot.qa.v1）。
- 値: GateVerdict{gate_key, kind, verdict, score, evidence}, Metrics。
- 不変条件: hardゲート不合格は自動公開を止め保留・人手へ（REQ-PACK-09）／few-shotとQAは同一gate定義を単一ソースにする（REQ-PACK-12）。

### 4.3 ArticleSummary / KeywordMap（Content Index）
- ルート: ArticleSummary（url_master単位）, KeywordMap（site単位グラフ）。
- ArticleSummaryの値: ArticleIdentity、ContentInventory（topics / intent / audience / questions / claims / unit types / entities）、BusinessInventory（tier / category / tags / CTA / linkability / freshness）、GapInventory、SummaryQuality（completeness / confidence / schema version / analyzed_at）。
- KeywordMapの値: KeywordMarketPressure（aio / paid / domain credibility）、KeywordStrategicNeed（site necessity / traffic / conversion）、KeywordStrategyProfile、DynamicPriorityComponents。
- 不変条件: 記事本文全文を保持しない（REQ-PRODUCT-04）／各配列・短文は上限つき／content hash未変更時は再解析しない／解析失敗で直前の有効サマリーを消さない／recommendationは使用したsummary fieldと外部根拠を説明できる／canonical_url_hashが正本で照会はURL・管理はID（REQ-PRODUCT-03）／正規化で表記ゆれを寄せ修飾語違いは別キーワード（REQ-KGA-02）／1キーワードグループの主担当記事は高々1で、オーファン・二重アサインはアラート（REQ-KGA-14）。

### 4.3.1 Recommendation（Search Performance）

- ルート: Recommendation。候補抽出時点から採用、実行、評価、再推薦まで同じ`recommendation_id`とversionで追跡する。
- 値: RecommendationType、TargetRef、ObjectiveRef、KeywordClusterRef、SearchIntent、ArticlePurpose、ReasonEvidence、CtaPolicyRef、InternalLinkPlanRef、QualityTier、BudgetEstimate、ProtectionPolicy、Availability、Dependencies、ScoreComponents、Status。
- 状態: `candidate → proposed → accepted / held / excluded / expired → dispatched → executing → completed → evaluating → learned / superseded`。市場急変時は`watching`へ分岐し、通常推薦から隔離する。
- 不変条件: 採用後はIntake Contractをfreezeし、Agent Workflowへ再入力なしで渡す／未実行Recommendationだけが目的・市場・分類変更による再計算対象／実行済みは履歴として保持／根拠、入力availability、予測credit、依存関係、保護条件を欠くものは実行可能にしない／手動起動もRecommendation由来と同じPreflight・重複・カニバリ・権限・予算判定へ通す。

### 4.4 RewriteJob / ArticleWorkspace（Rewrite）
- ルート: RewriteJob（ArticleWorkspaceを内包）。
- 不変条件: パッチはEdit Plan宣言のsection_id内に限定（REQ-RWR-03）／未変更セクションのhashを保持（REQ-RWR-05）／ワークスペースは完了・承認・期限で破棄（REQ-RWR-02）／品質ゲートfail-close。

### 4.5 PublicationJob / PostEnvelope（Publishing）
- ルート: PublicationJob（PostEnvelopeを内包）。
- 不変条件: QA・権限・予算・接続・Automation Policyを副作用直前に再判定する／最初の新規15記事およびリライト・記事置換は所定の承認を要求する／解放済み新規記事はAutomation Policyの範囲で自動公開できる／hard gate例外は判定を残した二段階確認・版付き同意による手動公開だけを許可する／CMS能力にないslot/blockはfail-close（REQ-WPA-08）／最終HTML全文は恒久保存しない（REQ-WPA-09）。

### 4.6 CreditAccount（Billing）
- ルート: CreditAccount（append-only Ledgerを内包）。
- 不変条件: 台帳はappend-only・残高を直接書換えない／reserve→commit/release／`stripe_event_id`+`idempotency_key`で二重付与防止（REQ-BILL-07）／activeのみ月次付与（REQ-BILL-08）。

### 4.7 Site / SiteSandboxContext（Tenancy）
- ルート: Site。
- 不変条件: 全データ・キャッシュ・キュー・ログが `tenant_id`/`site_id` 境界を持ち越境不可（REQ-SEC-07/11）。

## 5. 主要ドメインイベント

- Content Index: KeywordMapUpdated, ArticleSummaryUpserted。
- Search Performance: GscDataIngested, CoverageAssessed, QueryDriftDetected, RewriteCandidateRaised, RecommendationProposed, RecommendationAccepted, RecommendationHeld, RecommendationExpired, RecommendationDispatched, RecommendationEvaluationStarted, RecommendationLearned。
- External Intelligence: FanoutExpanded, CompetitorStructureExtracted, FetchBatchThrottled。
- Generation: GenerationJobStarted, OutlineContractFrozen, MeaningUnitDrafted, QualityGateEvaluated(Passed/Failed), RepairRequested, ArticleAssembled。
- Rewrite: RewriteJobStarted, PatchApplied, RewriteQualityFailed。
- Publishing: PostEnvelopeSealed, ContentPublished, PublicationFailed, CvRecorded。
- Billing: CreditReserved, CreditCommitted, CreditReleased, MonthlyCreditGranted。
- Provider: ProviderRouteDecided, ProviderHealthDegraded, CanaryRolledBack。
- Config/Governance: ConfigVersionActivated, FeatureFlagToggled, KillSwitchEngaged。
- Notification: NotificationDispatched, NotificationRead（通知はイベント購読の下流であり、独自ドメインイベントを増やさない。運営お知らせは `platform.announcement_published` として同一エンベロープに投入、REQ-PRODUCT-16）。
- Support: SupportTicketCreated, SupportEscalated, SupportResolved（REQ-PRODUCT-22）。

補: 本節はL2粒度の代表列挙である。event_typeの全カタログと凍結規則は Gate A-1（AOS-L3-GATE-A1-EVENT-ENVELOPE）を正本とし、種数は同文書の表を正とする（本書に数を複製しない）。

## 6. ドメインサービス / ポリシー

- Pack Compiler（REQ-PACK-16）, Router/Injector（REQ-AGENT-07）, Query Fanout Service（REQ-SRC-09）。
- Cannibalization Policy（REQ-KGA-07）, Rewrite Cause Analysis（REQ-RWR-06）, Coverage Policy（REQ-KGA-05）。
- Preflight Estimator（REQ-SEC-12）, Fair-share Scheduler（REQ-SRC-07）, Routing Policy（REQ-BILL-09）。
- Config Resolution（グローバル→プラン→テナント/サイトの上書き、REQ-ADM-09）。
- Network Aggregation Service（k匿名集約→辞書候補/prior/較正提案の生成。一方向・Config & Governance経由でのみ適用、REQ-PRODUCT-13）。

## 7. L3への引き渡し（次レイヤー）

各集約→テーブルDDL、各値/契約→JSONスキーマ（schema.ticket.*, schema.snapshot.*）、各ゲート→検証実装、各イベント→イベントスキーマ、をL3で確定する。しきい値・価格はConfig Registryの初期値テンプレートとして起こす（REQ-ADM-09）。
