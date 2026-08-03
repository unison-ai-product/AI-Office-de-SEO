---
document_id: AOS-L2-DOMAIN-MODEL
title: AI Office de SEO ドメインモデル（DDD） v3.7
version: 3.7
layer: L2
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L2-01-ai-office-de-seo-domain-model
---

# AI Office de SEO ドメインモデル（DDD）

L1要求（REQ）を、DDDの語彙で構造化する。用語は用語一覧（AOS-L2-GLOSSARY）に従う。本書はL2（ドメイン設計）であり、実装（DDL/JSONスキーマ）はL3で確定する。

現行の業務判断は分類別L1要求を正本とし、`REQ-AGENT-*`／`REQ-PACK-*`は分類別要求が代替していない実行詳細、その他のv3.7 IDはLegacy Requirement Migration Mapに従う補助根拠として扱う。旧IDだけから価格、顧客権限、公開条件、CMS境界、Office責務を導出しない。

## 1. サブドメイン分類

- Core（差別化＝SEO運用LifecycleとRecommendation）: Content Index / Keyword Market & Site Share / Search Performance / Planning & Recommendation / Generation / Quality / Rewrite / Evaluation。
- Supporting（中核を支える）: External Intelligence / Publishing & Automation / Provider / Config & Governance。
- Generic（汎用・置換可能）: Tenancy & Access / Billing & Credit（Stripe）/ Observability & Audit / Experience(UI) / Notification / Support / Platform Operations。

### 1.1 要求所有の原則

要求の所有境界は `ai-office-de-seo-domain-invariant-registry_v1.json` を機械可読な正本とする。各 `REQ-*` は必ず1つの境界づけられたコンテキストだけが所有し、他コンテキストは公開ContractまたはDomain Eventを通じて参照する。画面分類、文書分類、実装サービス、Officeの部屋をドメイン境界として扱わない。

| 要求所有コンテキスト | Aggregate Root | 所有する要求群 | 業務上の責務 |
|---|---|---|---|
| Customer Account & Access | ContractAccount | ORG, ACCESS, PRODUCTの認可詳細 | 契約者、顧客組織、Site付与、基本権限、業務権限、認可 |
| Site Onboarding & Strategy | SiteOperatingCycle | BUS, UJ, PRODUCTの導入・月次運用詳細 | Site設定、新規／既存導入、月次計画、週次実行、評価Loop |
| Keyword Market Intelligence | SiteKeywordPortfolio | KGA, KRL, KPD, SRC, CAV, PRODUCTのNetwork Learning詳細 | Keyword市場、Site Share、Cluster、診断、外部検索情報、AI検索観測 |
| Content Knowledge | SiteContentIndex | DATA, ASUM, PRODUCTの記事索引詳細 | URL、記事Summary、記事遍歴、内部Link、Site構造の検索用正本 |
| Recommendation Planning | RecommendationPortfolio | LOGIC, PRODUCTの自動運用統制 | 目的・制約・費用・保護条件から施策候補を選択し、状態遷移を管理 |
| Content Production | ContentProductionJob | AGENT, PACK, CQR, RWR, PRODUCTの執筆設定詳細 | 新規記事、リライト、Research、Outline、Writing、QA、Repair |
| CMS Publication | CmsDelivery | WPA, INT, PRODUCTのCMS詳細 | CMS接続、下書き送信、承認後反映、外部変更通知、CV集計入力 |
| Customer Outcome | CustomerOutcomeSnapshot | MEASUREの顧客計測・成果要求 | 顧客Siteの成果、施策評価、市場影響、運営指標との分離 |
| Commercial Entitlement | SubscriptionAccount | BILL, BILLING, COST, UPSELL | Plan、契約、Credit、原価、利用権、追加購入、アップセル |
| Platform Control & Reliability | PlatformControlPolicy | PAC, ADM, IRG, SEC, NFR, DUR, TECH, MEASUREの運用要求, PRODUCTの運営詳細 | 運営管理、障害、保証、セキュリティ、可用性、技術基盤 |
| Agent Execution Experience | AgentTaskProjection | SCREEN, DESIGN, AOUI, NAV, PRODUCTの通知・検索・出力詳細 | 通常ビューの簡単操作と成果分析、Officeの詳細運用・Agent操作を同じ業務状態から投影 |

Conversion MeasurementとPublication Attributionは独立した要求所有コンテキストではなく、CMS PublicationからCustomer Outcomeへ渡す明示的な下位モデルである。これにより、CVの保存制約とAI Office経由／外部変更の帰属規則を局所的な不変条件として検証する。

### 1.2 SEO業務Lifecycle

```text
Site設定・接続
  → Keyword市場／既存実績の構築
  → 戦略・診断Report
  → 月次計画
  → Recommendation
  → 週次選択
  → 新規記事／リライト制作
  → CMS下書き・承認・反映
  → GSC／CV／市場観測
  → 1・3・6か月評価
  → 次回計画・Recommendation補正
```

各段階は前段の画面表示を読み直して状態を再構築せず、次の公開Contractを渡す。

| 上流 → 下流 | Contract | 必須情報 |
|---|---|---|
| Onboarding → Keyword Intelligence | SiteAnalysisIntake | Site、業界／業種、地域、商品、顧客、横断軸、GSC／登録Keywordの可用性 |
| Keyword Intelligence → Strategy | KeywordPortfolioSnapshot | Cluster、主従Keyword、市場、Share、検索Intent、記事対応、信頼度、version |
| Strategy → Recommendation | MonthlyStrategy | 目的、重点領域、記事配分、予算配分、保護対象、期間、version |
| Recommendation → Production | RecommendationIntake | 施策、Cluster、記事目的、Intent、CTA、内部Link、品質、予算、根拠、version |
| Production → CMS Publication | ContentDeliveryPackage | 成果物、差分、装飾、画像参照、QA結果、承認条件、idempotency key |
| CMS Publication → Customer Outcome | PublicationFact | AI Office経由／外部変更／取得元確認中、URL、外部post ID、Delivery／correlation、対象version／hash、公開／更新時刻、変更種別 |
| Conversion Measurement → Customer Outcome | DailyUrlGoalAggregate | 日×URL×Goal、直前遷移元の単ホップ集計、source、定義version。user／session／経路は持たない |
| Measurement → Strategy | InterventionOutcome | Keyword段階、CV、認知寄与、市場影響、評価可否、観測窓、version |

### 1.3 CommandとDomain Event

| Aggregate | 主Command | 主Domain Event |
|---|---|---|
| SiteOperatingCycle | ConfigureSite, StartAnalysis, ConfirmMonthlyPlan, SelectWeeklyWork | SiteConfigured, AnalysisStarted, MonthlyPlanConfirmed, WeeklyWorkSelected |
| SiteKeywordPortfolio | AddSeedKeyword, ConfirmDirection, ReclassifyCluster | KeywordDirectionConfirmed, PortfolioBuilt, ClusterReclassified |
| RecommendationPortfolio | GenerateRecommendations, AcceptRecommendation, HoldRecommendation | RecommendationProposed, RecommendationAccepted, RecommendationHeld |
| ContentProductionJob | StartProduction, ReviseOutline, ResumeRepair | ProductionStarted, OutlineFrozen, ContentQualified, ProductionSuspended |
| CmsDelivery | SendDraft, ApproveDelivery, ApplyUpdate | DraftDelivered, PublicationReflected, ExternalChangeObserved |
| CustomerOutcomeSnapshot | RecordObservation, EvaluateIntervention | OutcomeObserved, InterventionEvaluated |
| SubscriptionAccount | ReserveCredit, CommitCredit, ChangePlan | CreditReserved, CreditCommitted, EntitlementChanged |

UIはCommandを発行しEventからProjectionを更新する。UIが順位段階、市場影響、公開成否、Credit残高、権限を独自計算してはならない。Agent Officeは `AgentTaskProjection` と各成果Projectionを起点に玄人向け詳細分析を行い、選択式Actionまたは自由文会話を型付きProposalへ変換し、影響・Credit・認可の確認後に所有BCの共通Commandを利用できる。Office独自の業務正本・認可・Command・成果計算は作らない。

## 2. 内部能力コンポーネント（要求所有境界の内部分解）

以下は既存L2の実装能力分解であり、1.1の要求所有コンテキストと同格の要求正本ではない。複数の内部能力が同じ要求所有コンテキストに属する場合がある。

| BC | 責務 | 主な集約 | 根拠REQ |
|---|---|---|---|
| Tenancy & Access | 契約者・顧客組織・Membership・Site付与・基本権限・業務権限・認可判断・サンドボックス境界・アカウントライフサイクル・マスターテナント | ContractAccount, CustomerOrganization, Membership, Site(SiteSandboxContext), AuthorizationDecision | REQ-ORG-01〜12, REQ-ACCESS-01〜18 |
| Content Index | URL正本・記事メタ（サマリー契約・意味索引）・期限付き記事読取・Site Keyword Universe・Site Cluster Projection・属性・アサイン台帳・起点候補・サイトトポロジー・導出事実/施策台帳 | UrlMaster, ArticleSummary, ArticleReadSnapshot, SiteKeywordUniverse, SiteClusterProjection(AssignmentLedger), SiteTopology, DerivedFacts(InterventionLedger) | REQ-DATA-02/07/10/11/15, REQ-KGA-01〜04/07/12/13/14/18/19 |
| Search Performance | Site構築進捗・GSC実績・被覆・ドリフト・カニバリ・リライト候補・マッチカスケード・ロングテール昇格・市場圧力・動的キーワード戦略・ウォッチ/変動監視・インデックス状況・戦略／診断Report・月次／週次計画・Recommendation・公開後評価 | SiteBuildRun, GscDataMart, CoverageAssessment, RewriteCandidate, QueryMatch, KeywordMarketPressure, KeywordStrategyProfile, Watchlist, KeywordReport, MonthlyPlan, WeeklyExecutionSelection, Recommendation, InterventionEvaluation | REQ-BUS-02〜10, REQ-KGA-05/06/08/11/15/16/17/20/21/23, REQ-PRODUCT-05/17/24, REQ-KRL-01〜10, REQ-DATA-06 |
| External Intelligence | 公共Keyword Asset・Public Market Cluster、SERP/競合/Fanoutの取得・cache・batch・静穏窓スケジューリング | KeywordAssetPool, PublicMarketCluster, SourcePack, CompetitorStructure, FetchBatch | REQ-DATA-10, REQ-SRC-01〜10 |
| Generation | Workflow状態機械・Ticket・Pack注入・執筆・QA/Repair・中断/再開・全体整合パス・実行冪等性・執筆技法レイヤ | GenerationJob, Ticket, PackCatalog, OutlineContract | REQ-AGENT-01〜11, REQ-PACK-01〜21 |
| Quality | 品質ゲート・計測・few-shot・合否・コヒーレンス検査・ゴールデン評価・検品レンズ・AIらしさ検査・転生検証 | QualityGateEvaluation, GateRegistry, ReaderSegment | REQ-PACK-09/10/12/20/21, REQ-AGENT-08/11, REQ-ADM-10 |
| Rewrite | Article-as-Code・パッチ・原因分析・好調保護/波及・フラッシュリライト(TDH) | RewriteJob(ArticleWorkspace) | REQ-RWR-01〜09 |
| Publishing & Automation | CMS能力・Dynamic Post Schema・成果保持／下書きDelivery・公開判定・15記事解放・承認・予約・CV・エンゲージメント計測・部分パッチ・CVポイント台帳 | CmsConnectionProfile, CmsDeliveryJob, PublicationJob(PostEnvelope), PublicationDecision, AutomationPolicy, CvPointLedger | REQ-WPA-01〜14, REQ-LOGIC-03〜05, REQ-INT-05/06/10 |
| Billing & Credit | プラン・購読・クレジット台帳・見積・実行レーン(Batch) | CreditAccount(Ledger), Subscription | REQ-BILL-01〜08/11, REQ-SEC-04/12 |
| Provider | プロバイダ登録・アダプタ・ルーティング | ProviderProfile, RoutingPolicy | REQ-BILL-04/09, REQ-AGENT-04 |
| Config & Governance | 設定レジストリ・Flag・安全不変条件・資源/変更ガバナンス・ネットワーク学習の適用統制 | ConfigRegistry, FeatureFlag | REQ-ADM-09, REQ-BILL-10, REQ-DUR-04, REQ-PRODUCT-13/18 |
| Observability & Audit | トークン/契約検証・監査・SLO・表示ラベルレジストリ | UsageTrace, AuditLog | REQ-SEC-02/03/10/13, REQ-ADM-04/06/07/08/11 |
| Experience (Agent Office UI) | 2モード・部門/ペルソナ/フロア・2軸・会話受付・グローバル検索・エクスポート・レスポンシブ/i18n・アクセシビリティ品質床 | OfficeLayout(Room, Persona), PersonaConversationSession | REQ-AOUI-01〜07, REQ-NAV-01〜09, REQ-PRODUCT-14/15 |
| Notification | ドメインイベントからの通知導出・受信者解決・チャネル配信・通知センター・運営お知らせ・メール送達性 | NotificationDelivery, MailSuppression | REQ-PRODUCT-11/16/21 |
| Support | サポートチケット・AI一次応答（Role/スコープ内参照限定）・エスカレーション・ナレッジ還流 | SupportTicket | REQ-PRODUCT-22 |
| Platform Operations | 実行基盤/デプロイ規約・キャパシティ/密度・バックアップ/DR・コンテナ移管性・自動復旧/保守 | （集約なし・横断運用契約） | REQ-DUR-06〜10 |

## 3. コンテキストマップ（関係とDDDパターン）

- Tenancy & Access → 全BC: **Shared Kernel**（SiteSandboxContextを全BCが共有）。越境は構造的に不可（REQ-SEC-07）。
- Content Index / Search Performance / External Intelligence → Generation: **Customer/Supplier**。GenerationはこれらをSource Pack経由でのみ取得する。**Pack＝Anti-Corruption Layer**（直テーブル・生SQLを遮断、JSONへ正規化、REQ-PACK-06）。
- External Intelligence → Content Index / Search Performance: **Published Language**。公共`keyword_asset_id`と`public_cluster_id+version`を公開し、Site側は参照によって候補を投影する。公共ClusterをSite固有Cluster、記事割当、GSC Queryの正本にしない。
- Generation ⇄ Quality: **Partnership**。Generationは品質ゲートを工程内で呼び、fail-closeで公開を止める（REQ-PACK-09, REQ-RWR-05）。
- Search Performance → Generation / Rewrite / Publishing & Automation: **Customer/Supplier**。採用Recommendationをversion付きIntake Contractとして渡し、目的・Keyword Cluster・検索インテント・記事目的・CTA・内部リンク・品質・予算・保護条件を再入力させない。Generation側がRecommendationを画面表示から再構築することを禁止する。
- Generation / Rewrite → Publishing & Automation: **Customer/Supplier**。Snapshot→PostEnvelope→CMS下書き。新規記事は最初の15記事まで完成記事承認を必須とし、解放後はAutomation Policyに従う。リライト・記事置換はCMS下書き後のユーザー承認を必須とする（REQ-LOGIC-04）。
- Generation / Rewrite → Billing & Credit: **Customer/Supplier**。実行前にreserveし、QA済み成果がsealされOutput Vaultから利用可能になった`deliverable_provided`で生成creditをcommitする。CMS送信・公開は別Lifecycleであり、接続待ち・再送で再commitしない。提供前の未使用分はreleaseする（REQ-BILL-07, REQ-SEC-12）。
- Generation → Provider: **ACL**（Provider Adapter Contractがプロバイダ差異を吸収し、品質段階、必要Capability、原価、latency、health、契約条件からversion付きRouteを解決する。特定Provider優先をドメイン不変条件にしない。REQ-TECH-10、REQ-AGENT-04）。
- Config & Governance → 全BC: **Conformist / Published Language**。価格・しきい値・Flagはレジストリから解決。安全不変条件は設定対象外（REQ-ADM-09）。
- 全BC → Observability & Audit: **ドメインイベント購読**（消費・契約検証・監査を横断収集、REQ-SEC-13）。
- Experience(UI) → 全BC: **Conformist**。業務entity・権限・Command/Eventは通常ビューとOfficeで共通化する。一方、Officeの部屋、会話、探索、設備、表示位置等の体験状態は独自に保持できるが、業務正本・認可・実行状態を複製しない（REQ-AOUI-01、REQ-SCREEN-18）。

Office Conversation RuntimeはExperienceのApplication Serviceとして置く。選択中のPersona Role Profile、Site Context、表示中Resource、認可済みServiceとProposal Schemaを解決し、回答・型付きProposal・Ticket候補を返す。PersonaごとのAggregate、専用LLMまたは独立した業務データストアを作らず、確定操作は影響・Credit・認可確認後に所有BCの共通Commandへ渡す。

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

### 4.3.0 KeywordAssetPool / SiteKeywordUniverse / SiteClusterProjection

- `KeywordAssetPool`: 公共外部Sourceから独立取得したKeyword、locale／地域／device別Market観測、edge、provenance、利用条件を保持するglobal集約。tenant、Site、URL、顧客別順位・CVを持たない。
- `PublicMarketCluster`: 公共SERP／intentから導出したversion付き市場cluster。代表語変更は同じIDの改版、分割・統合はlineageで表す。
- `SiteKeywordUniverse`: 公共asset参照、GSC Query、user upload、Site抽出語、業界・商品・顧客候補、採否を統合するSite集約。顧客固有語を公共Poolへ自動昇格しない。
- `SiteClusterProjection`: Site目的、業界／横断軸、記事成立性、Article Summary、Assignmentを反映したSite固有cluster。公共Clusterと1対1を前提にせず、primary／secondary、記事割当、ユーザー確定状態を持つ。
- `MarketShareSnapshot`: Market属性、Observed Query Share、Estimated Search Share、Article Shareを別成分・別provenanceで保持する期間read model。
- 不変条件: global IDとSite IDを別namespaceにする／公共改版でユーザー確定Site Clusterを上書きしない／MarketとShareを単一値へ潰さない／GSC Query集合を市場全体とみなさない。

### 4.3.0.1 ArticleReadSnapshot（Content Index / Rewrite）

- ルート: ArticleReadSnapshot。記事取得1回の結果と一時本文のライフサイクルを、ArticleSummaryやCMS write Capabilityから独立して管理する。
- 値: ArticleRef、UrlRef、ConnectionProfileRef、ReadRouteRef、SourceKind、FetchedAt、SourceModifiedAt、PublicState、Title、Meta、HeadingTree、ContentRef、ContentHash、StructureHash、Size、Availability、WorkspaceRef、ExpiresAt、DestroyedAt、Correlation、Provenance。
- 不変条件: 本文全文はSite／job scopedの暗号化一時objectにだけ置く／DB・event・log・Notification・Recommendationへ複製しない／本文変更を伴うRewrite Intakeはbody・headings・public state・freshnessが成立した有効Snapshotを必須とする／経路切替、source更新、hash変更、期限切れで旧Snapshotを再利用しない／完了・取消・期限切れ後は本文objectを破棄し、metadataと破棄証跡だけを残す／読取成功をCMS write permissionへ流用しない（REQ-DATA-15）。
- 本文を含み得る保管境界は、実行中のArticle Read／Workspace、生成成果受渡しのOutput Vault、変更前復元のRecovery Backupに限定する。前者はJob／Snapshot期限、Output Vaultは既定14日、Recovery BackupはSite容量上限内かつ最長3か月とし、相互転用・学習・分析Corpus化を禁止する。CMS Revisionは外部正本として参照する。

### 4.3.1 Recommendation（Search Performance）

- ルート: Recommendation。候補抽出時点から採用、実行、評価、再推薦まで同じ`recommendation_id`とversionで追跡する。
- 値: RecommendationType、RecommendationSubtype、TargetRef、ObjectiveRef、KeywordClusterRef、SearchIntent、ArticlePurpose、ReasonEvidence、CtaPolicyRef、InternalLinkPlanRef、QualityTier、BudgetEstimate、ProtectionPolicy、Availability、Dependencies、ScoreComponents、Status。Typeは`new_article / rewrite / cta_patch / internal_link_patch / request_input / observe / protect / no_action / structure_change_proposal / technical_escalation / automation_change`を正規Catalogとする。
- 状態: `candidate → proposed → accepted / held / excluded / expired → dispatched → executing → completed → evaluating → learned / superseded`。市場急変時は`watching`へ分岐し、通常推薦から隔離する。
- 不変条件: 採用後はRecommendation Intakeをfreezeし、Action Routingが選ぶAgent Workflow／Patch／Policy／Domain Command／ユーザー対応へ再入力なしで渡す／未実行Recommendationだけが目的・市場・分類変更による再計算対象／実行済みは履歴として保持／根拠、入力availability、予測credit、依存関係、保護条件を欠くものは実行可能にしない／手動起動はManual Intakeとして由来を分離しつつ同じPreflight・重複・カニバリ・権限・予算判定へ通す／ユーザー指定Taskは維持し、衝突時は相談と依存順序を提示する／自動予定だけを再検証でheld、needs_review、supersededへ遷移させる／観測、保護、no action、ユーザーエスカレーションにAgent Jobを偽造しない。
- リライト不変条件: `recommendation_type=rewrite`は、対象記事のArticleSummaryと、本文・見出し・公開状態を取得したArticle Read Snapshot、原因・根拠、取得時刻・hash・availabilityを参照する。GSCまたはKeyword実績だけの候補は`request_input`、`observe`または`technical_escalation`に留め、本文変更を伴うRewrite Intakeへdispatchしない。

### 4.3.2 KeywordStrategyReport / KeywordSiteDiagnosisReport

- ルート: KeywordReport。`report_type=new_site_strategy / existing_site_diagnosis`で同一識別基盤を使うが、章・判定目的・入力availabilityを分ける。
- 値: ReportId、Version、SiteRef、SourceAvailability、Coverage、MarketSnapshotRef、SiteClusterRefs、CalculationVersion、Sections、UserAdjustments、Status。
- 新規戦略: 市場、適合、優先Cluster、Site必要性、流入／CV機会、構造提案、制作順、月次配置を扱い、実績不在を障害にしない。
- 既存診断: 同じ市場基線にObserved／Estimated／Article Share、獲得／未獲得Keyword、記事・Query対応、保護、Drift、カニバリ、index、CTA／linkを接続する。
- 不変条件: 単一Keywordを基本単位にしない／ObservedとEstimatedを合算しない／部分開放時にcoverageを隠さない／ユーザー調整後も旧versionと実行済み施策を保持／MonthlyPlanとRecommendationは使用Report versionを参照する。

### 4.3.3 SiteBuildRun / MonthlyPlan / WeeklyExecutionSelection

- `SiteBuildRun`: Site設定、新規／既存、`site_identified / analysis_ready / content_read_ready / delivery_ready`のCapability別成立、CMS・GSC・Keyword uploadの入力状態、big keyword方向確認、分析Stage、coverage、段階開放、必要なユーザー操作を追跡する。4状態を単一の`connected`へ丸めない。
- `MonthlyPlan`: 対象月、使用Report version、目的、重点Cluster、方向性配分、予算、週次枠、確定方式、仮定、availabilityを持つ。
- `WeeklyExecutionSelection`: 月次計画とRecommendation集合から、credit、Capacity、依存、保護、品質に収まる当週候補と順序をfreezeする。
- 不変条件: 新規Siteと既存Siteの入力条件を混同しない／CMS write未成立だけで分析を止めない／Article Read未成立でリライトを開始しない／部分完了を全体完了にしない／目的配分を達成保証にしない／月途中変更で実行済みを変更しない／ユーザー指定Taskを暗黙取消ししない／未実行Recommendationを単純繰越ししない。

### 4.3.4 InterventionEvaluation

- ルート: InterventionEvaluation。制作時の「新規／リライト」ではなく、検証済みPublication Factの`effective_at`を評価起点とする。`ai_office_publication`は主介入、実質的`external_change`は交絡要因、`unknown_source`は帰属確認中として分離する。
- 値: ArticlePurpose、SearchIntent、Keyword Cluster、CV Goal、1／3／6か月Checkpoint、SEO、CTA/CV、認知、外部市場調整、availability、Outcome、NextAction。
- 不変条件: 割当Keyword集合が意図どおり順位を獲得したかを第一に評価する／CVなしだけを異常にしない／CTA変更でSEO周期をresetしない／急変を即時Recommendationにしない／直近1か月1,000 click未満の予測対象をデータ不足と分離する／Site補正が順位へ悪影響を及ぼす変更はユーザー承認を要求する。

### 4.4 RewriteJob / ArticleWorkspace（Rewrite）
- ルート: RewriteJob（ArticleWorkspaceを内包）。
- 不変条件: パッチはEdit Plan宣言のsection_id内に限定（REQ-RWR-03）／未変更セクションのhashを保持（REQ-RWR-05）／ワークスペースは完了・承認・期限で破棄（REQ-RWR-02）／品質ゲートfail-close。

### 4.4.1 LightweightPatchAction（Content Index / Publishing）

- ルート: LightweightPatchAction。CTAまたは内部linkの候補1件を成功・失敗・評価の最小単位とし、承認Batchの一部としても同一IDを維持する。
- 値: PatchActionType、TargetArticleRef、TargetPartRef、BeforeHash、ProposedValueRef、ReasonEvidence、ArticlePurpose、Intent、CvGoalRef／DestinationArticleRef、RecommendationRef、IntakeRef、ApprovalBatchRef、CmsJobRef、MeasurementPolicy、Status。
- 状態: `candidate → proposed → accepted/rejected/held/expired → approved → scheduled → applying → applied/failed/conflict → measuring → evaluated`。
- 不変条件: 全文リライトへ偽装しない／CTA専用Agent・専用Writing Ticketを必須にしない／Batchの一部失敗を全件成功へ丸めない／CMS反映確認前にappliedとしない／内部link削除は追加と別確認／CTA変更はSEO評価周期をリセットしない／ユーザー編集競合時は古い位置へ適用しない。

### 4.5 CmsDeliveryJob / PublicationDecision / PublicationJob / PublicationFact / PostEnvelope（Publishing）
- ルート: CmsDeliveryJob、PublicationDecision、PublicationJob、PublicationFact。PostEnvelopeはDelivery入力としてversion・hash・TTL付き参照で内包する。
- CmsDeliveryJobはPresentation Assembly完了後の成果保持、write再診断、下書き作成、反映確認、再送、持ち出しを追跡する。状態は`prepared / connection_required / permission_required / delivering / draft_created / verification_pending / verified / failed_retryable / failed_terminal / carried_out / cancelled`とし、生成完了とCMS送信成功を同じ状態にしない。
- CmsDeliveryJobは`REQ-INT-10`を正本とし、接続・権限・一時障害後も同一Delivery IDとidempotency keyで再開する。再開を再生成、追加credit消費または別下書き作成へ変換せず、外部反映確認後だけ`verified`へ進める。
- 不変条件: QA・権限・予算・接続・Automation Policyを副作用直前に再判定する／接続不足でも成果を失敗・再生成扱いにせず同一idempotency keyで再開する／持ち出しを公開成功としない／最初の新規15記事およびリライト・記事置換は所定の承認を要求する／解放済み新規記事はAutomation Policyの範囲で自動公開できる／hard gate例外は判定を残した二段階確認・版付き同意による手動公開だけを許可する／CMS能力にないslot/blockはfail-close（REQ-WPA-08）／最終HTML全文は恒久保存しない（REQ-WPA-09）。

`PublicationDecision`はPublicationJobの副作用前判定を不変versionとして記録し、実行結果を後書きしない。15件count、Automation同意、リライト承認、hard gate二段階確認、現在の認可・予算・接続を入力にし、approval required／automation allowed／approved for execution／blocked／rejectedを返す。`PublicationJob`は予約・実行・再試行・反映確認、`PublicationFact`は外部検証済みの公開／更新事実、content hash、effective time、帰属を担う。15件countは、人間承認済み・新規・`ai_office_publication`のFactから導出し、予約、API受付、外部変更、帰属不明、管理画面またはClientから任意加算しない。

### 4.5.1 CmsConnectionProfile / ArticleReadProfile（Publishing & Integration）

- ルート: CmsConnectionProfile。CMS identity、Discovery、Read、Write、Media、Editor、Preview／Revision、Measurement、Capacityを別Capabilityとして集約する。
- ArticleReadProfileは利用可能Adapterごとのhealth、完全性、freshness、latency、Site負荷、費用、rate limit、Plan適合と`primary / standby / disabled`を保持する。
- 状態: `diagnosing / ready / degraded / action_required / unavailable`。個別Capabilityは`full / degraded / update_required / unsupported / unknown`。
- 不変条件: ユーザーに内部経路選択を要求しない／readとwriteを別認可にする／変更発見と本文取得を分離する／初回全件後は差分同期／一時失敗でflappingしない／書込み応答だけで反映済みにしない／公開表示・CMS保存値・変更event・Revisionを用途別正本として混合しない。

### 4.5.2 FeaturedImagePattern / ImageGenerationJob（Generation & Publishing）

- FeaturedImagePatternはSite scoped、version付きで、領域、slot、固定／可変、variation tolerance、ロゴ余白、CMS size policy、状態を持つ。Image Style Profileと別集約・別versionにする。
- ImageGenerationJobはPattern／Profile／記事slot／CMS size／quality／Model Registry route／予算をfreezeし、output、検査、advisory、採否、最適化、Media登録、featured割当を追跡する。
- 不変条件: Pattern編集でProviderを呼ばない／同一入力の二重生成を防ぐ／ユーザー再生成だけ新規課金／障害再開は再課金しない／CMS size以外を初期生成しない／Media登録を本文送信から分離／advisoryだけで自動投稿を停止しない／ロゴ品質不成立時は強制合成しない。

### 4.6 CreditAccount（Billing）
- ルート: CreditAccount（append-only Ledgerを内包）。
- 不変条件: 台帳はappend-only・残高を直接書換えない／reserve→commit/release／`stripe_event_id`+`idempotency_key`で二重付与防止（REQ-BILL-07）／activeのみ月次付与（REQ-BILL-08）。

### 4.6.1 Subscription／Entitlement／AutoChargePolicy／CapacityAccount

- Subscriptionは契約主体、Price Catalog version、Plan Configuration version、状態、周期、更新、外部決済参照を持ち、契約時のEntitlement Snapshotを暗黙改版しない。
- AutoChargePolicyは残高閾値、購入商品、1回購入額、月間上限または無制限、当月購入額、状態、認証・確認versionを持つ。自動購入も通常のCredit LotとLedgerへ記録する。
- CapacityAccountはDimensionごとのusage、soft/hard limit、予測到達日、集計時刻、追加容量Entitlementを持ち、Dimension間を相殺しない。
- 状態変更はBilling Commandで行い、通常ビュー、Office、Automationから同じ認可、step-up、冪等性を使う。支払失敗・上限到達時は新規有償副作用を保留するが、閲覧・export・支払修正を停止しない。

### 4.7 Site / SiteSandboxContext（Tenancy）
- ルート: Site。
- 不変条件: 全データ・キャッシュ・キュー・ログが `tenant_id`/`site_id` 境界を持ち越境不可（REQ-SEC-07/11）。

### 4.8 ContractAccount / CustomerOrganization / Membership（Tenancy & Access）

- `ContractAccount`: 法人または個人の契約主体。複数の契約者Membershipと代表契約者1名を持つ。
- `CustomerOrganization`: 自由階層のOrganization UnitとSiteを所有する顧客組織。代理店横断tenantを作らない。
- `Membership`: UserとCustomer Organizationの関係。基本権限`contract_holder / site_owner / user`、業務権限bundle、Site Assignment、状態を持つ。
- Site Assignmentは空を「全Site」、1件以上を「指定Siteのみ」と解釈する。全件削除による全Site化は確認・監査対象とする。
- 旧`Owner / Admin / Editor / Viewer`を保存・判定の正本にしない。移行情報を保持する場合も、現在の基本権限・業務Permissionへ解決してから認可する。

### 4.9 AuthorizationDecision（Tenancy & Access）

- 値: Principal、Action、Resource、Context、Decision、AppliedPermission、Scope、ReasonCode、PolicyVersion、ExpiresAt。
- 判定順: environment／tenant → resource ownership → principal種別 → Membership／代理権限 → 基本権限・業務Permission → 認証強度・承認 → Plan／予算／接続等の業務条件。
- 通常ビュー、Office、API、worker、Agent tool、Automation、外部Adapter、内部管理面は同じ判定契約を使用する。
- 不変条件: client申告Role、画面表示、Office入室、Feature Flag、Plan購入だけでは前段Scopeを拡張しない／入力欠落と未解決競合はdefault-deny／副作用直前に再判定する。

### 4.10 NotificationDelivery / RecipientResolution（Notification）

- RecipientResolutionはevent Scope、Resource可視性、必要操作、発行者、Membership、基本権限、業務Permission、Site付与、購読、必須Policyからrecipientを導出する。
- NotificationDeliveryはrecipient×event／digest単位で、in-app正本、popup、email試行、状態、対象Resource、action結果を持つ。
- 不変条件: 固定担当者を必須にしない／client指定recipientを信頼しない／通知受信で権限を付与しない／action requiredとcontinuityは最低in-appを完全OFFにしない／popup消去でCenter記録を消さない／readとactionedを分ける／顧客通知と内部alertを混在させない／適格者0人時はSite ownerまたはcontract holderへfallbackするが操作権限は拡張しない。

## 5. 主要ドメインイベント

- External Intelligence: KeywordAssetObserved, PublicMarketClusterVersioned, PublicMarketClusterSplit, PublicMarketClusterMerged, FanoutExpanded, CompetitorStructureExtracted, FetchBatchThrottled。
- Content Index: SiteKeywordUniverseUpdated, SiteClusterProjectionUpdated, SiteClusterDependencyStaled, KeywordMapUpdated, ArticleSummaryUpserted。
- Search Performance: SiteBuildStarted, SiteBuildStageReleased, BigKeywordDirectionConfirmed, KeywordReportVersioned, MonthlyPlanProposed, MonthlyPlanConfirmed, WeeklyExecutionSelected, GscDataIngested, CoverageAssessed, QueryDriftDetected, RewriteCandidateRaised, RecommendationProposed, RecommendationAccepted, RecommendationHeld, RecommendationExpired, RecommendationDispatched, InterventionEvaluationDue, InterventionEvaluated, RecommendationEvaluationStarted, RecommendationLearned。
- Generation: GenerationJobStarted, OutlineContractFrozen, MeaningUnitDrafted, SemanticAssembled, QualityGateEvaluated(Passed/Failed), RepairRequested, PresentationAssembled。
- Rewrite: RewriteJobStarted, PatchApplied, RewriteQualityFailed。
- Publishing: PostEnvelopeSealed, CmsDraftCreated, PublicationDecisionRecorded, PublicationApproved, ContentPublished, ContentUpdated, PublicationFailed, CvRecorded。
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
