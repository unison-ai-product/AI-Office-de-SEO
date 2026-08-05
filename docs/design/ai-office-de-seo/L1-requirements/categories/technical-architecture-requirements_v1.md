---
document_id: AOS-L1-TECHNICAL-ARCHITECTURE-REQUIREMENTS
title: AI Office de SEO 技術・アーキテクチャ要求
version: 1.0
layer: L1
kind: requirements
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 技術・アーキテクチャ要求

## 1. 責務

システム全体が実装方式にかかわらず守る技術方針、構成境界、処理方式、変更可能性および禁止事項を定義する。性能値と可用性目標は `non-functional-requirements_v1.md`、データ項目と保持期間は `data-requirements_v1.md`、具体的なコンポーネント・API・テーブル設計はL2/L3を正本とする。

## 2. 技術原則

- 画面応答と重い処理を分離し、ユーザーに処理の重さを感じさせない。
- 本文、生HTML、外部レスポンス全文を恒久データベースへ蓄積しない。
- 常駐プロセスに全顧客状態を保持せず、イベント・ジョブ・差分駆動で処理する。
- 外部Provider、モデル、ストレージ、配信先を交換可能な境界で扱う。
- 重要な処理は再実行可能、監査可能、ロールバック可能にする。
- 安全不変条件を設定、Feature Flag、管理画面で解除しない。

## 3. 要求

### REQ-TECH-01 論理構成と責務境界

システムを少なくとも、ユーザーUI、プラットフォーム管理UI、アプリケーションAPI、認可、ジョブ制御、AI実行、外部連携、課金台帳、観測の責務へ分離する。各責務間の入力、出力、所有データ、失敗時の扱いをL2で定義し、UIまたはAI Executorが他責務のデータを直接更新しない。

Core Productへ固定するのは、tenant／Site境界、認証・認可、契約・Entitlement、課金台帳、Feature Object Registry、command／event／job実行、監査、設定・version、共通UI／Office slotに加え、SEO代行の基本Lifecycleを完結する業務機能である。Site設定、キーワード市場探索・分類・戦略、Recommendation、新規記事、リライト、品質確認、承認、CMS引渡し、公開・更新後評価、基本計測・レポート、通常ビュー、基本Agent Officeを、追加Object購入なしで成立させる。

Feature Objectは基本SEO業務を分割販売する境界ではなく、Core業務へ新しいContext、外部データSource、分析レンズ、Provider／CMS Connector、専門評価、追加実行Capability、レポート表現、Office設備を接続する境界とする。Objectがなくても基本Workflowは完了でき、Object停止時は追加Context／能力だけをavailability付きで外してCoreの既定入力・判定へ縮退する。

Feature Objectはclass継承ではなく、安定IDとversionを持つ構成オブジェクトである。`manifest、capabilities、commands、events、workflows、Pack keys、tools、schemas、data ownership、UI slots、Office scene、permissions、entitlements、billing meters、dependencies、lifecycle` を宣言する。アプリは1個以上のFeature Objectを販売・導入単位として束ねるPackageであり、Feature Objectそのものと同一視しない。

接続モデルはCoreへコードを埋め込む従来型Pluginより、MCP ServerのようにFeature Providerが利用可能なCapability、Tool、Resource、Prompt／Pack、Schemaを公開し、CoreがManifestを発見・検証して呼び出す方式を基準とする。ただしMCP protocol自体を必須実装へ固定せず、同一のFeature Object Contractをin-process module、別process、remote service、将来のMCP Adapterで実装できるようにする。

用語は、内部の最小機能単位を `Feature Object`、それを提供する接続先を `Feature Provider`、接続設定を `Feature Connection`、複数Objectを束ねる販売・導入単位を `App Package` とする。「Plugin」はWordPress Plugin等の実在する連携方式または一般向け説明に限定し、Core内部へ任意コードを挿入できる意味では使用しない。

### REQ-TECH-02 軽量データ構成

トランザクションDBには業務上の正本、短い派生事実、参照キー、状態、監査メタデータだけを保持する。記事本文全文、生HTML、長い外部レスポンス、無制限配列を通常テーブルへ保持してはならない。用途別に容量上限、索引上限、ロールアップ、削除条件を持つ。

### REQ-TECH-03 記事本文の一時処理

記事本文は同期、生成、リライトまたは検証に必要な期間だけ隔離された一時ワークスペースへ取得する。本文からArticle Summary、hash、構造、短い派生事実、根拠参照を生成した後、成功・失敗にかかわらず期限内に本文を破棄する。ログ、キュー、例外、トレース、通知へ本文を複製しない。

### REQ-TECH-04 差分・変化駆動

外部同期、記事解析、キーワード評価、レコメンド再計算は、content hash、checkpoint、更新イベントまたは鮮度期限を用いて変更対象だけを処理する。全件走査・全件再解析は、明示された保守バッチと予算・時間枠がある場合に限定する。

CMS変更検知は利用可能な場合に署名付きWebhookを優先し、通知payloadをmetadataへ限定して対象だけを差分取得する。公開Feedしか利用できない環境ではRSS／Atomを発見経路にできるが、非公開状態の正本にはしない。REST Pollingは常時監視ではなく、手動同期、再接続、欠落復旧、低頻度の整合確認へ限定する。

### REQ-TECH-05 同期・非同期処理の分離

認証、設定参照、一覧取得、操作受付等の短時間処理は同期APIで扱い、外部取得、AI実行、記事解析、バッチ推薦、公開処理等の長時間処理はジョブとして非同期実行する。同期APIは長時間処理の完了を待たず、受付結果、状態参照先、取消可否を返す。

非同期実行は単一の共通worker poolへ無制限投入せず、少なくとも `interactive／analysis・sync／generation／image／CMS side effect` の資源クラスを識別する。Global、資源クラス、Provider／接続先、tenant、Siteの各階層で同時実行数、投入率、実行時間またはcost budgetをAdmission時に検査し、利用可能slotがなければジョブを失敗扱いせず待機または次窓へ繰り延べる。重いbatchが対話API、承認、公開状態確認、課金、権限操作のCapacityを枯渇させないよう、別poolまたは予約Capacityを持つ。

### REQ-TECH-06 ジョブ契約と状態管理

非同期処理は、`tenant_id`、`site_id`、`job_id`、処理種別、入力参照、設定version、予算、期限、冪等キーを持つジョブ契約で起動する。状態遷移は列挙制とし、開始、保留、再開、成功、失敗、取消、期限切れを監査可能にする。ワーカーのメモリ状態を処理状態の正本にしない。

### REQ-TECH-07 冪等性・再試行・排他

課金、クレジット、CMS下書き作成・公開・更新、Media登録、Webhook、ジョブ起動、通知等の副作用を伴う処理は冪等キーを必須とする。初期WordPress Adapterを含む各CMS Adapterは共通の副作用契約に従う。再試行は指数バックオフ、上限、再試行可能エラー分類を持ち、同一対象への競合実行は排他またはversion検証で制御する。再試行による二重課金、二重公開、二重更新、二重通知を禁止する。

WordPress AdapterはPortとして抽象化し、Core REST、Tracking、Thin Pluginの実装を分離する。業務Workflowは特定プラグインのPHP hook、Gutenberg内部Data Store、DOM構造、非公開APIを直接参照しない。WordPressのCapability、Compatibility Matrix、縮退順序、下書き応答は `REQ-INT-05`、CMS共通Publication Contractと他CMSの検証条件は `REQ-INT-06` を正本とし、本要求では再定義しない。

Tracking runtimeはCMS Adapterと分離した小さい非同期scriptとし、同一buildをSite Configurationで動作させる。初期bundleへheatmap、session replay、全DOM監視等の未使用機能を同梱しない。script取得失敗、event送信失敗、設定取得失敗はWeb表示・CTA・フォーム送信を妨げず、送信queue、batch、再試行には厳しい上限を持たせる。

公開基盤は `REQ-INT-06` のPublication ContractをPortとして実装し、WordPress固有形式を内部記事モデルの正本にしない。Fake／MockによるContract Testは業務WorkflowとAdapter境界の検証に使用できるが、実CMS互換性の根拠には使用しない。

### REQ-TECH-08 整合性境界

強い整合性が必要な契約、請求、クレジット、権限変更はトランザクション境界を明示する。AI実行、外部連携、分析、通知は結果整合性を許容するが、outbox等の確実なイベント連携、再処理、照合手段を持つ。分散トランザクションを前提にしない。

### REQ-TECH-09 マルチテナント実装

共有基盤上で `tenant_id` と必要な `site_id` による論理分離を既定とし、認可済みのサーバー側Contextからスコープを注入する。クライアント、AI、外部入力が指定したtenant/site識別子を信頼しない。キャッシュ、キュー、検索索引、オブジェクトキー、ログにも同じ境界を適用する。

### REQ-TECH-10 Provider・外部サービス抽象化

LLM、検索・競合データ、メール、WordPress、GSC、課金等の外部サービスはAdapterとversion付き契約で分離する。特定Providerのモデル名、レスポンス形、認証方式を業務ロジックへ直接埋め込まない。timeout、rate limit、circuit breaker、fallback、停止条件をProviderごとに定義する。

LLM境界は共通のModel Capability Contractを持ち、少なくともtext生成、structured output、tool calling、streaming、context・output上限、画像入力、cache、batch、rate limit、データ取扱地域、保持方針を能力として宣言する。WorkflowはProvider名ではなく必要Capability、品質段階、latency、原価上限からrouteを選択し、未対応能力を推測で呼び出さない。OpenAI互換APIであることだけを完全互換の根拠にしない。

商用API Providerに加え、Kimi、Grok、Qwen系を含む将来の低コストモデルおよび自己管理・ローカル推論基盤を同じAdapter境界へ接続可能にする。自己管理モデルではendpointだけでなく、serving engine、model weight・quantization、GPU/CPU構成、warm-up、concurrency、license、利用規約、更新versionをRegistryへ記録する。候補名の記載は採用・品質保証を意味せず、評価Gateを通過したrouteだけを本番有効化する。

Provider・model追加時は共通Contract Test、代表SEO taskのgolden evaluation、structured output適合率、tool実行、長文破損、言語品質、latency、失敗率、実効原価、fallback互換性を現行routeと比較する。品質段階の最低基準を満たさない低コストrouteは、価格優位だけを理由に昇格させない。

将来の拡張アプリはCore内部コードへ無制限に組み込まず、version付きApp ManifestとCapability Contractを介して、画面slot、command、event購読、job、外部Connector、保存schemaを宣言する。Coreはapp key／version、tenant／Site、Entitlement、Permission、予算、rate limitを検証してから実行する。アプリ停止・削除時もCore Workflowを壊さず、固有データのexport、保持、削除、再導入を定義する。特定AI・CMS・hostingの変化は可能な範囲でアプリ更新へ隔離する。

Agent拡張は既存のPack問い合わせ方式を正規経路とする。App ManifestはRole Profile、Workflow、Prompt Pack、Source Pack、Schema、Catalog、Tool Capabilityのkeyと互換versionだけを宣言し、Pack本文や任意system promptを埋め込まない。インストール済みappのkeyだけをCatalogへ公開し、Ticket発行時にEntitlementとSite Scopeを検証して、既存Pack Resolver／Injectorからversion固定して解決する。

### REQ-TECH-11 API・イベント契約

API、Webhook、イベント、ジョブ、Pack、Snapshotはversion付きスキーマを持ち、入力検証、後方互換期間、廃止手順を定義する。イベントは発生元、tenant/site、actor、相関ID、冪等キー、schema version、発生時刻を持ち、本文全文・秘密情報を含めない。

Feature Object間は直接テーブル参照・内部関数呼出しへ依存せず、公開command、query、event、Source Pack、Snapshot契約で連携する。Objectは自分が所有する状態だけを更新し、他Objectの変更はcommandまたはeventで依頼する。依存は安定keyと互換version範囲で宣言し、循環依存、未宣言依存、同じ業務事実の複数Object所有を検査する。

Feature Connectionは `initialize／capability discovery／health／invoke／cancel／event subscription／version negotiation／shutdown` を共通操作として持つ。remote Providerは認証、署名、tenant／Site Scope、timeout、rate limit、idempotency、stream上限、egress allowlist、監査を必須とし、接続先が返す説明文・Prompt・Schemaを信頼済みsystem指示として無条件に採用しない。公開されたTool／ResourceはPlatform側Catalogで承認したkeyとversionだけを有効化する。

Coreは `Feature Connection Adapter` Portだけへ依存し、Provider固有SDK、endpoint、認証、pagination、rate limit、webhook、polling、payload、error codeを参照しない。Adapterは外部値を共通の `Capability Descriptor、Context Envelope、Command Result、Connection Health、Usage／Cost` へ正規化する。DataForSEO、GSC、CMS、hosting、AI surface、MCP Server等はこのPortの実装として追加し、同一ProviderでもAPI世代または取得方式が異なる場合はAdapter versionで分離する。

Adapterが提供する能力は `context_source`、`action_tool`、`event_source`、`content_destination` の組合せとして宣言する。分析データだけを返す接続へwrite権限を付与せず、記事送信等の副作用を持つAdapterはread系とcommand系を別Permission・別冪等契約にする。Adapter停止時はConnection Healthとavailabilityを返し、Core entityをProvider固有状態へ書き換えない。

### REQ-TECH-12 設定とversion固定

価格、しきい値、推薦重み、Provider Routing、Prompt Pack、Quality Gate、Feature Flag等は版管理された設定を正本とする。ジョブ開始時に参照versionを固定し、処理途中の設定変更で結果の再現性を失わない。設定変更は影響Preview、検証、承認、段階適用、Rollbackを経る。

Feature Objectは `draft → validated → installed → configured → active → suspended → uninstalling → removed` のlifecycleを持つ。install／upgrade／suspend／uninstallは依存、権限、Entitlement、data migration、未完了job、rollback、保持・export・削除をPreflightし、実行中jobが参照するObject／Pack／Schema versionを途中で切り替えない。

### REQ-TECH-13 キャッシュ・キュー・オブジェクト利用

キャッシュは正本にせず、TTL、容量、無効化、tenant/siteキーを持つ。キューは少なくとも優先度、可視性期限、dead-letter、重複排除、滞留監視を持つ。一時オブジェクトは暗号化、アクセス期限、自動削除を必須とし、記事本文を恒久オブジェクトとして保管しない。

Queue schedulerは、月初、週初、静穏時間帯またはCron境界で全tenant／Siteを一斉dispatchしない。実行窓内の決定論的offsetとjitter、重み付きfair share、Site別上限、資源クラス別priority、queue水位によるbackpressureを適用する。同一Siteの大量処理が他Siteを飢餓状態にせず、長時間待機にはageによる昇格または期限切れ・次窓繰り延べを適用する。ただし安全上限をpriorityだけで迂回しない。

### REQ-TECH-14 環境・秘密情報分離

development、test、staging、productionのデータ、資格情報、外部送信先、Feature Flag、課金経路を分離する。本番秘密情報を非本番へ複製せず、秘密情報は専用管理基盤から実行時に参照する。リポジトリ、ログ、設定画面、エラーへ原文を残さない。

### REQ-TECH-15 変更・デプロイ・DB移行

変更は自動検査、契約検証、テスト、セキュリティ確認を通過後、段階的に適用する。DB変更は後方互換のあるexpand/migrate/contractを基本とし、アプリとDBの同時切替を前提にしない。失敗時のアプリ、設定、スキーマ、ジョブの復旧手順を変更前に定義する。

### REQ-TECH-16 観測可能性

API、ジョブ、外部連携、AI実行を相関IDで接続し、ログ、メトリクス、トレースから処理経路を追跡できなければならない。レイテンシ、エラー、再試行、キュー滞留、外部費用、キャッシュ利用、保存量を責務別に計測する。観測データには本文、秘密情報、不要な個人情報を含めない。

### REQ-TECH-17 技術選定と例外管理

言語、ランタイム、フレームワーク、DB、キュー、キャッシュ、ホスティング等の具体的選定はADRで決定し、採用理由、代替案、制約、撤退条件を記録する。本書の要求から外れる技術例外は、対象、期間、リスク、補償統制、解消期限、承認者を記録し、恒久的な暗黙例外にしない。

### REQ-TECH-18 技術的禁止事項

次を禁止する。

- UIからDBまたは外部Providerを直接操作すること
- AI出力を検証せず業務正本へ直接書き込むこと
- 本番DB直接更新を通常運用にすること
- 無制限の全件走査、無制限リトライ、無期限キャッシュ
- tenant/siteを含まない顧客データのキャッシュ・キュー・検索キー
- Provider固有仕様を中核業務ロジックへ直接埋め込むこと
- 記事本文、秘密情報、プロンプト全文をログへ出力すること
- Feature Objectが未宣言のDB、command、event、外部接続、画面slotへ到達すること
- アプリ削除によりCore起動、標準Workflowまたは他Objectの正本状態を破壊すること

### REQ-TECH-19 AWS配置・観測

本番基盤はAWSを第一配置先とする。初期構成を過剰なmicroserviceへ分割せず、Web/API、非同期worker、queue、transaction database、object storage、edge delivery、監視の境界を保つ。具体的なcomputeおよびdatabase製品は負荷試験、運用人数、費用からADRで決定する。

初期のFeature Objectはモジュラーモノリス内の論理境界として実装できるが、Object Registry、Resolver、event dispatch、workerのいずれか一つのprocess instanceやローカルmemoryを正本にしない。Web/APIとworkerは複数instanceで再開可能にし、managed DB／queue／object storageの耐障害構成、backup／restore、AZ障害時の動作をADRと演習で確認する。外部Provider単一依存はAdapter、circuit breaker、queue保留、代替routeまたは機能縮退で全体停止へ波及させない。

静的assetとcache可能なread responseはCloudFront等で配信し、動的APIは必要なデータだけを返す。記事本文、生成中間物、画像等の大きいobjectをtransaction databaseへ置かず、期限付きobject storageへ分離する。transaction databaseは契約、権限、状態、台帳、短い派生データ等の正本に限定し、無制限な履歴・本文・生レスポンスを蓄積しない。

非同期jobはAmazon SQS相当のmanaged queueでAPIから分離し、処理種別・優先度・障害domainに応じてqueueを分ける。再試行上限を超えたmessageはdead-letter queueへ隔離し、CloudWatch alarm、原因分類、関連trace、redrive手順を持たせる。

application telemetryはOpenTelemetry互換とし、CloudWatch Application Signals／Logs／Metrics／Trace等へ送信できる構成とする。全経路へ `correlation_id`、`tenant_id`、`site_id`、`job_id`、処理stage、Provider、結果分類を付与するが、本文、秘密情報、不要な個人情報は送信しない。dashboardはユーザー経路、queue、外部Provider、公開、課金、cache、databaseを分け、alertから該当runbookと原因候補へ遷移できるようにする。

### REQ-TECH-20 内部検索Index・再構築

内部検索はversion付きSearch Document ContractとSearch Portへ分離し、特定のRDB機能または専用検索製品を業務ロジックへ埋め込まない。初期技術は日本語lexical検索、構造化filter／facet、更新lag、基準Site規模、同時query、運用人数、AWS費用を負荷試験してADRで決める。Vector検索は補助Capabilityとし、停止してもKeyword、記事、Recommendation、Task、成果の基本検索と絞込みを継続できる。

Index更新は正本transactionのoutbox／Domain Eventから非同期・冪等に行い、Document version比較で順序逆転を防ぐ。schema、analyzer、embedding modelの変更は新世代Indexへbackfillし、件数、hash sample、Scope負テスト、代表query、latencyを検証後にaliasを切り替え、rollback可能にする。全件再indexは専用Capacity、rate limit、checkpoint、再開、backpressureを持ち、対話APIと通常Jobを枯渇させない。

検索APIは認可済みserver contextからtenant／Site Scopeを強制し、query、facet、suggestion、cursor、cacheで越境を防ぐ。検索hitから副作用Commandを直接実行せず、対象正本を再読込して認可・version・状態を再検証する。Index障害・遅延時はDB read model、保存済みProjection、exact-ID参照等へ縮退し、全ページ表示とP95 3秒の理由付き状態を維持する。詳細は`ai-office-de-seo-internal-search-index-connection-map_v1.md`を正本とする。

### REQ-TECH-21 分析Semantic Layer・段階的Analytics Store

顧客成果、Keyword市場、記事share、CV、運営側product metricsは、Fact source、grain、Dimension、time window、filter、attribution、availability、confidence、Authorization、Plan Dimension、versionを持つMetric Contractから算出する。通常ビュー、Office、内部管理、APIが同じSemantic Metricを利用し、UIごとに算式を再実装しない。pre-aggregationはMetric version、tenant／Site Scope、source watermarkを持ち、stale、partial、未計測を0または最新値として扱わない。

初期構成でClickHouse、Cube、PostHog、Metabase等を必須依存にしない。append-only Factを非同期rollupし、有界ProjectionとcacheでP95 3秒を検証する。scan量、ingestion backlog、storage、latency、AWS費用、運用工数がversion付き移行閾値を超えた領域だけ、Analytics Store Portを介してcolumnar storeまたはpre-aggregation engineへ段階移行する。契約、権限、Credit Ledger、Recommendation、記事状態の正本を分析storeへ移さない。

event ingestionはschema version、冪等key、backpressure、retry、dead-letter、watermark、遅延・重複・欠落診断を持つ。顧客SiteのCV計測では個別session経路・session replay・人物profileを恒久保持せず、既定の日別・URL別・Goal別集計を維持する。外部OSSはarchitecture referenceとし、source code・component・埋込みを採用する場合は対象path／versionのlicenseを審査する。比較根拠は`open-source-analytics-architecture-review_2026-08-05.md`を参照する。

## 4. 接続要求

- 性能、可用性、容量目標は `non-functional-requirements_v1.md` を参照する。
- データ正本、保持、削除は `data-requirements_v1.md` を参照する。
- 認可、暗号化、監査保護は `security-access-requirements_v1.md` を参照する。
- 外部APIの個別契約は `integration-requirements_v1.md` を参照する。
- 開発管理画面と変更統制は `platform-administration-control-requirements_v1.md` を参照する。
- 障害判断、復旧、補償は `incident-warranty-requirements_v1.md` を参照する。

## 5. 受入条件

- [ ] AC-L1-TECH-01: L2構成図で責務、所有データ、同期・非同期境界が追跡できる。
- [ ] AC-L1-TECH-02: 通常DBに本文全文、生HTML、長い外部レスポンスが保存されない。
- [ ] AC-L1-TECH-03: 本文一時処理の成功・失敗双方で期限内削除が検証される。
- [ ] AC-L1-TECH-04: 未変更記事・キーワードが再解析対象から除外される。
- [ ] AC-L1-TECH-05: 長時間処理が同期APIを占有せず状態を追跡できる。
- [ ] AC-L1-TECH-06: ジョブ再起動後も状態と固定versionから処理を継続できる。
- [ ] AC-L1-TECH-07: 再試行で二重課金・二重公開・二重通知が発生しない。
- [ ] AC-L1-TECH-08: 結果整合処理の失敗を検出し再処理・照合できる。
- [ ] AC-L1-TECH-09: DB、キャッシュ、キュー、検索、ログでtenant/site境界が検証される。
- [ ] AC-L1-TECH-10: 商用API・自己管理モデルを共通Capability Contractで評価し、Provider停止・原価変化・品質差に応じて設定変更で停止・切替・fallbackできる。
- [ ] AC-L1-TECH-11: API・イベントのversion互換性が契約テストで検証される。
- [ ] AC-L1-TECH-12: 実行中ジョブが設定変更の影響を受けず再現できる。
- [ ] AC-L1-TECH-13: キャッシュ、キュー、一時オブジェクトに容量・期限・異常監視がある。
- [ ] AC-L1-TECH-14: 非本番から本番データ・秘密情報・課金経路へ到達できない。
- [ ] AC-L1-TECH-15: アプリ・DB変更を段階適用し、失敗時に復旧できる。
- [ ] AC-L1-TECH-16: 相関IDからAPI、ジョブ、外部連携、AI実行を追跡できる。
- [ ] AC-L1-TECH-17: 具体的な技術選定と例外にADRまたは期限付き記録がある。
- [ ] AC-L1-TECH-18: 技術的禁止事項を自動検査またはレビューゲートで検出できる。
- [ ] AC-L1-TECH-19: AWS上の代表E2Eで相関IDがAPI、queue、worker、Provider、CMS Adapter結果まで維持され、初期WordPress Adapterを含むDLQから原因確認と安全なredriveができる。
- [ ] AC-L1-TECH-20: 検索Indexを正本eventから冪等更新・全再構築でき、世代切替・rollback、tenant／Site越境負テスト、更新lag監視、Index停止時の縮退を検証し、検索障害中も正本CommandとP95 3秒のページ状態表示を維持できる。
- [ ] AC-L1-TECH-21: version付きMetric Contractから通常／Office／内部管理の同一指標を再現し、Scope付きpre-aggregationと非同期rollupでP95 3秒を満たし、移行閾値までは重い分析DBを必須化せず、個人sessionを保存せずに遅延・重複・欠落を診断できる。
