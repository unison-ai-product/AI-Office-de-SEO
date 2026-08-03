---
document_id: AOS-L2-DOMAIN-REQUIREMENT-CONTEXT-MAP
title: AI Office de SEO 要求・画面・連携 ドメイン接続表 v1
version: 1.0
layer: L2
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L2-01-ai-office-de-seo-domain-model
---

# 要求・画面・連携 ドメイン接続表

## 1. 目的

L1の要求分類は監査と文書管理の分類であり、業務データの所有境界ではない。本書は、要求、通常画面、Agent Office、外部連携、計測をDDDのAggregate、Command、Domain Eventへ接続する。機械可読な要求所有の正本は `ai-office-de-seo-domain-invariant-registry_v1.json` とする。

## 2. 全要求の所有

| Bounded Context | REQ接頭辞 | 件数 | Aggregate Root |
|---|---|---:|---|
| Customer Account & Access | ORG, ACCESS + PRODUCT-02/08/10 | 33 | ContractAccount |
| Site Onboarding & Strategy | BUS, UJ + PRODUCT-01/05/09/17/24 | 27 | SiteOperatingCycle |
| Keyword Market Intelligence | KGA, KRL, KPD, SRC, CAV + PRODUCT-13 | 55 | SiteKeywordPortfolio |
| Content Knowledge | DATA, ASUM + PRODUCT-03/04/19/20 | 24 | SiteContentIndex |
| Recommendation Planning | LOGIC + PRODUCT-18 | 15 | RecommendationPortfolio |
| Content Production | AGENT, PACK, CQR, RWR + PRODUCT-07/12 | 57 | ContentProductionJob |
| CMS Publication | WPA, INT + PRODUCT-06 | 25 | CmsDelivery |
| Customer Outcome | MEASURE-01〜04/12/14 | 6 | CustomerOutcomeSnapshot |
| Commercial Entitlement | BILL, BILLING, COST, UPSELL | 47 | SubscriptionAccount |
| Platform Control & Reliability | PAC, ADM, IRG, SEC, NFR, DUR, TECH + MEASURE-05〜11/13 + PRODUCT-16/21/22/23 | 107 | PlatformControlPolicy |
| Agent Execution Experience | SCREEN, DESIGN, AOUI, NAV + PRODUCT-11/14/15 | 51 | AgentTaskProjection |
| **合計** | **35接頭辞** | **447** | |

新しいREQ接頭辞を追加した場合は、同じ変更で所有コンテキストを登録する。未割当、二重割当、存在しない接頭辞の登録はRequirements Auditを失敗させる。

## 3. 画面接続

画面はAggregateを所有しない。Application ServiceへCommandまたはQueryを送り、Domain EventからProjectionを更新する。

| 画面群 | 主Query／Projection | 許可Commandの所有先 | 禁止事項 |
|---|---|---|---|
| S1 Dashboard | SiteOperatingCycle、CustomerOutcomeSnapshot、SubscriptionAccountの要約 | Strategyの月次確定、Recommendationの採否 | 成果、市場影響、CreditをUIで再計算しない |
| S2 Keyword・戦略・診断 | SiteKeywordPortfolio、KeywordReport、RecommendationPortfolio | Keyword分類修正、方向性確認、優先方針変更 | Clusterや主従Keywordを画面ローカル正本にしない |
| S3 Recommendation・計画 | RecommendationPortfolio、MonthlyStrategy、WeeklySelection | 採用、保留、除外、週次選択 | 推薦理由や実行可否をUIで再判定しない |
| S4 記事制作 | ContentProductionJob、Outline、QA結果 | 制作開始、Outline修正、再生成、再開 | 画面から直接CMS公開しない |
| S5 Siteページ管理 | SiteContentIndex、PublicationFact、記事成果 | 内部Link提案採用、リライト起動、CTA Patch採用 | CMSの公開表示とAI Office経由実績を混同しない |
| S6 Site設定・執筆ルール | ContractAccount、Site設定、Style／Decoration Policy | Site設定、業務権限、執筆・装飾設定変更 | 開発者用接続経路や内部閾値を顧客設定にしない |
| S7 契約・利用量 | SubscriptionAccount、Credit Ledger、Capacity | Plan変更、自動入金、上限変更、Credit購入 | 残高、税、Stripe状態をUI計算しない |
| A0〜A8 Agent Office | AgentTaskProjection、Conversation、Proposal、成果要約Link | 所有BCの共通Command。影響・Credit・認可確認を必須とする | 独自の業務正本・認可・Commandを持たず、顧客成果分析をOffice内で完結しない |
| W系Workbench | 対象Aggregateの詳細Projection | 対象BCの型付きCommand | Workbench独自の状態機械を作らない |
| 開発者Console | PlatformControlPolicy、監査・障害Projection | 管理面Command | 顧客面Roleまたは顧客Sessionから到達させない |

## 4. 外部連携境界

| 外部System | ACL／Adapter | 入力 | Domain Event／出力 | 障害時の所有先 |
|---|---|---|---|---|
| WordPress／他CMS | CmsAdapter | Capability、記事メタ、下書き、変更通知 | DraftDelivered、PublicationReflected、ExternalChangeObserved | CMS Publication |
| GSC | SearchPerformanceAdapter | URL×Query×日次実績、index状態 | SearchObservationImported | Keyword Market Intelligence／Customer Outcome |
| DataForSEO等 | SerpIntelligenceAdapter | 検索数、SERP構成、競合、AIO／広告signal | MarketSnapshotUpdated | Keyword Market Intelligence |
| Stripe | PaymentAdapter | Checkout、Subscription、Payment Webhook | PaymentRecorded、EntitlementChanged | Commercial Entitlement |
| LLM／画像Provider | ProviderAdapter | Task Contract、品質Capability、予算 | GenerationResult、ProviderUsageRecorded | Content Production／Commercial Entitlement |
| 自前CV Tracker | MeasurementIngress | 日別・URL別・Goal別、直前遷移元 | CvAggregateUpdated | CMS Publication → Customer Outcome |
| 通知Channel | NotificationAdapter | 通知event、受信者、template | DeliverySucceeded／Failed | Agent Execution Experience／Platform Control |

Adapterは外部の状態名を内部Aggregateへ直接持ち込まず、ACLでPublished Languageへ変換する。外部Webhookは冪等keyとSiteSandboxContextを必須とする。

## 5. 計測と帰属

| 事実 | 正本 | 集約先 | 表示先 |
|---|---|---|---|
| AI Office経由の公開／更新 | CmsDeliveryのPublicationFact | CustomerOutcomeSnapshot | S1／S5 |
| CMS側の直接変更 | ExternalChangeObserved | 評価の交絡要因。AI Office実績には算入しない | S5変更履歴 |
| Keyword順位段階 | GSCの7日窓から決定論計算 | CustomerOutcomeSnapshot | S1／S2／S5 |
| CV | 自前Trackerの日別・URL別・Goal別集計 | DailyUrlGoalAggregate | S1／S5 |
| 市場影響 | Keyword市場、表示回数、AIO／広告圧力、外部変更から決定論分類 | InterventionEvaluation | S1／S2／S5 |
| 運営側KPI | Product Event | 運営用Projection | 開発者Console |

顧客成果と運営側KPIを同じAggregateまたはDashboardへ混在させない。Officeは成果の短い要約と通常ビューへのLinkだけを投影する。

## 6. 権限評価

認可の正本はCustomer Account & Accessとし、各Commandの実行前に `contract_account_id`、`customer_organization_id`、`site_id`、基本権限、業務権限を評価する。顧客面と内部管理面はSession、Route、API、監査を分離する。

- 基本権限: 契約者、サイトオーナー、ユーザー。
- 業務権限: 目標管理、Keyword／Site戦略、記事制作、Site分析。記事制作には生成、修正、検収、承認を含め、人間の執筆者と検収者を別Roleにしない。
- Site範囲: 明示付与がある場合は付与Siteのみ、付与がなければ所属組織配下の全Site。
- 予算、契約、Credit購入: 契約者または管理者だけが変更する。
- 上位権限者は下位利用者へ業務権限を付与できる。
- 「閲覧できる」と「設定・確定できる」は別の認可判断とする。

## 7. 変更時のDDD監査手順

1. 変更対象の業務語とAggregate Rootを特定する。
2. Command、Domain Event、不変条件を先に更新する。
3. L1要求、画面、外部Adapter、計測Projectionを同じ変更で追従させる。
4. 正反対の仕様文を負例fixtureとして追加する。
5. Requirements Auditで全REQ所有、正本参照、矛盾fixtureを検証する。

画面だけ、連携だけ、料金表だけを先に変更し、ドメイン状態を後付けする変更を禁止する。
