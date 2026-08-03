---
document_id: AOS-L3-DATA-DDL
title: AI Office de SEO データDDL設計 v3.7
version: 3.7
layer: L3
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO データDDL設計

L2の各集約（AOS-L2-DOMAIN-MODEL §4）をPostgreSQLの論理DDLへ写像する設計正本。列挙済みのtable、key、制約、保存禁止、履歴原則をmigrationへ落とし、物理partition、index、保持実数は負荷試験と運用較正を経てversion固定する。

分類別L1要求とL2を現行の意味正本とする。旧v3.7 IDはLegacy Requirement Migration Mapに従う詳細controlの根拠に限り、旧顧客Role、旧Plan、WordPress固定、Office監視専用をtableやenumへ持ち込まない。`REQ-AGENT-*`／`REQ-PACK-*`は分類別要求が代替していない実行契約として併用する。

## 0. 全テーブル共通の不変条件（先に固定・変更不可）

- 境界キー: 全テーブルに `tenant_id` を必須とし、サイトに閉じるものは `site_id` も必須（REQ-PRODUCT-10 / REQ-SEC-07 / REQ-SEC-11。検証: AC-TENANT-01/02, AC-SEC-11）。
- 単一強制ポイント: 直接クエリを許さず、Repository層でスコープを自動付与。default-deny。可能な範囲でRLS併用（REQ-SEC-07）。
- 保存禁止列の不存在: 記事本文全文 / HTML全文 / Gutenbergブロック全文 / 競合本文全文 / プロンプト全文 / フォーム入力 / 個別行動ログ / APIキー原文 / secret復号値 / provider raw response全文（REQ-SEC-11。検証: AC-DATA-01/02, AC-SEC-11）。
- 一時本文: `tenant_id`/`site_id`/`job_id` 必須・TTL・完了後削除・管理画面から閲覧不可（REQ-PRODUCT-04。検証: AC-DATA-03）。
- 監査ログ: append-only、スキーマは REQ-ADM-06 の `{id, timestamp, actor_id, actor_type, action, resource_type, resource_id, tenant_id, changes, ip, user_agent, metadata}` を正本とする。

## 1. Tenancy & Access（Site / SiteSandboxContext 集約）

対象: contract_accounts / customer_organizations / organization_units / users / memberships / membership_business_permissions / membership_site_assignments / permission_bundle_versions / authorization_policy_versions / authorization_decision_audit / internal_role_assignments / delegated_access_grants / connected_accounts / sites。
根拠: REQ-ORG-01〜12、REQ-ACCESS-01〜18。検証: AC-L1-ORG-01〜13, AC-L1-ACCESS-01〜18。

- `memberships`: organization_id、user_id、base_role(`contract_holder/site_owner/user`)、status、primary_membership等を持つ。`Viewer`を保存値にせず、業務Permissionなしの`user`で表現する。
- `membership_business_permissions`: 初期は`goal_management / keyword_site_strategy / content_production / site_analysis`だけをversion付きbundle参照で付与する。低水準Permissionを顧客設定値として直接保存しない。
- `membership_site_assignments`: 0件を全Site、1件以上を指定Siteだけと解釈するため、全件削除操作は影響確認eventと監査を必須とする。
- `internal_role_assignments`は顧客Membershipと別namespace・別付与経路を持つ。Managerの顧客代理権限は`delegated_access_grants`へ対象、operation、期限、付与者を保存する。
- `authorization_decision_audit`は全readを無制限保存せず、拒否、step-up、approval、重要副作用、代理・break-glass、policy差分を有界に記録する。append-only監査eventとの参照を持つ。

- 主キーはUUID、境界外部キーは必ず`tenant_id`を含む複合参照とし、別tenantのIDだけでは参照を成立させない。`memberships`は`unique(organization_id,user_id)`、`membership_business_permissions`は`unique(membership_id,bundle_key,bundle_version)`、Site付与は`unique(membership_id,site_id)`とする。
- `customer_organizations.representative_contract_holder_membership_id`を必須参照とし、同一組織の有効な`contract_holder`だけを設定可能にする。契約者は複数可だが、有効な最後の契約者の取消・退会はreplacement指定を伴わなければ拒否する。
- Site Assignmentは行0件=`all_sites`、1件以上=`listed_sites`と解決する。意味をNULLやbooleanへ重複保存せず、認可Decisionに解決結果を記録する。全件削除は範囲拡大になるためstep-up、影響確認、監査を要求する。
- Permission bundle改版は新versionを追記し、Membershipの参照をmigration eventで切り替える。権限、Site付与、Membership、委任の変更時は`authorization_epoch`を進め、旧epochのsession／tokenによる新規副作用を拒否する。
- OAuth／CMS／GSC／Stripe等の資格情報は`secret_refs(secret_ref,tenant_id,provider,purpose,kms_key_ref,ciphertext_ref,version,status,rotated_at,expires_at?)`へ分離する。業務tableは`secret_ref`だけを持ち、復号値、access token、refresh token、API keyを列・log・eventへ保存しない。

## 2. Content Index（UrlMaster / ArticleSummary / KeywordMap 集約）

対象: url_master（raw_url / canonical_url / canonical_url_hash / cms_content_ref / gsc_page_url / redirect_target_url / url_alias_type）、url_alias_history、article_summaries（title / meta / h1 / headings_tree / word_count / article_type / digest / topics / intent / audience / funnel_stage / questions / claims / unit_types / entities / keyword_groups / tier / categories / tags / cta_types / outbound_topics / linkable_topics / freshness / gaps / quality / completeness / confidence / content_hash / summary_schema_version / analyzer_version / analyzed_at / published_at / modified_at / last_synced_at）、keywords（raw / normalized_keyword / keyword_group_id / intent / priority / target_url_hash）、same_serps_clusters、article_map。
根拠: REQ-PRODUCT-03/04、REQ-KGA-02/07/12、REQ-SEC-11。検証: AC-DATA-04/05, AC-KGA-01/02/14。

- `url_master`は内部UUIDを主キー、`unique(tenant_id,site_id,canonical_url_hash)`を現在URLの一意制約とする。alias／redirect履歴は別tableへappendし、raw URLの表記差を別Articleとして作らない。取込候補の重複はstagingで検出・通知し、既存正本へ自動統合またはhard lockしない。
- カニバリ判定は`article_keyword_distribution_v`（cluster×articleのimpressions、clicks、position、coverage、SERP overlap、期間、calculation_version）と`cluster_competition_v`を導出viewとして持つ。判定値は保存された事実ではなくConfig version付きassessmentへ記録する。
- keyword_attributes（intent / commercial / target_fit / industry_fit / ymyl_adjacent / locality / freshness。決定論付与・辞書version参照。REQ-KGA-13）、keyword_assignments（keyword_group_id一意・status・primary記事は内部ID参照・履歴。REQ-KGA-14。検証: AC-KGA-17/18）、gsc_query_matches（query正規化形 / keyword_group_id / method / confidence / matched_at / 辞書version。未マッチは明示行。夜間バッチで再計算。REQ-KGA-15。検証: AC-KGA-19）、topology_nodes/edges（tier=pillar/cluster/leaf・category/tags・リンク再調整キュー。REQ-KGA-19）、keyword_watchlists（しきい値・通知設定。REQ-KGA-20）、engagement_daily（url_hash×日次のdwell/scroll分位。個人非特定。REQ-WPA-11）、index_status（state/issue/checked_at。REQ-KGA-21）、site_build_runs / site_build_stage_progress / site_build_input_conditions / big_keyword_reviews（Site導入、新規／既存、入力成立、段階開放。`schema.site.build_progress.v1`）、monthly_plans / monthly_plan_allocations / weekly_execution_selections（目標・配分・予算・週次枠・確定方式・Report version・未実行再評価。`schema.plan.monthly.v1`／`schema.plan.weekly_selection.v1`）、derived_facts（fact_key/value/observed_at/confidence/source_ref・サイズ上限・月次ロールアップ。REQ-PRODUCT-19）、intervention_ledger（施策参照と由来。評価正本はCustomer Outcomeが所有）、automation_change_budget（日次/週次消費・クールダウン・振動検知状態。REQ-PRODUCT-18）、cv_points / cv_assignments（カタログ・記事割当・有効期間。REQ-WPA-13）、lightweight_patch_actions（patch_action_id・type・対象article/part・before_hash・提案ref・記事目的・intent・CV/link先・Recommendation/Intake/correlation・承認batch・CMS job・計測policy・状態）、patch_approval_batches（batch_id・action refs・承認者・結果）、cms_patch_jobs（patch_action_id・cms_adapter_key・対象・operation・Revisionまたはbackup参照・CMS応答・反映確認・conflict／retry／rollback状態。REQ-WPA-12）、patch_measurements（patch_action_id・月次/累積・availability・評価起点・結果。Customer OutcomeのLane Projection）、article_summaries（契約準拠・content_hash差分更新・配列/短文上限・解析品質・直前有効版参照。本文列を作らない。REQ-PRODUCT-20）、summary_embeddings（対象ref・model_version・vector。実装方式はL3。REQ-PRODUCT-20）、tenant_schedule（timezone・静穏窓・割当オフセット。REQ-SRC-10）、mail_suppressions（宛先hash・理由・停止/再有効化。REQ-PRODUCT-21）、invitation_tokens（期限・単回・失効。REQ-SEC-16）、tenants.kind（internal/customer区分・開発者アカウント配下の所有参照。REQ-PRODUCT-23）、showcase_consents / showcase_cases（許諾範囲・撤回状態・転用スナップショット。REQ-PRODUCT-23）、support_tickets / support_messages（チケット・会話・AI要約・文脈参照。記事本文/プロンプト全文の列を作らない。保持期間Config。REQ-PRODUCT-22）、longtail_clusters（中核トークン / modifierパターン / 集計clicks・impressions / 昇格状態 / 親グループ参照。REQ-KGA-16）、keyword_value_scores（value_score / demand / realizable_ctr / aio_pressure / paid_pressure / domain_credibility_fit / serp_features / intent_cv / fit / availability / confidence / baseline_version。REQ-KGA-17。検証: AC-KGA-21）、keyword_strategy_profiles（site_id / profile / site_necessity_weight / traffic_weight / conversion_weight / valid_from / version。REQ-KGA-23）、keyword_dynamic_priorities（keyword_group_id / strategic_need / attainable_value / urgency / confidence / cost / risk / dynamic_priority / reason_components / recalculated_at / expires_at。REQ-KGA-23）。

Site導入の4段階Capabilityは、`site_build_runs`の補助として`site_readiness_states / site_readiness_transitions`へ保存する。

- `site_readiness_states`は`readiness_key(site_identified/analysis_ready/content_read_ready/delivery_ready)`、`scope_kind(site/analysis_version/article/operation)`、非NULLの`scope_key`、`operation_key`、`state`、`evidence_ref`、`source_version`、`valid_until?`、`reason_codes`、`last_event_id`を持ち、`unique(tenant_id,site_id,readiness_key,scope_kind,scope_key,operation_key)`とする。Site scopeでは`scope_key=site_id`、operationを持たない行は予約値`none`を使用し、NULL一意制約の抜けを作らない。
- `site_readiness_transitions`は同じscope key、before／after state、evidence、reason、event ID、occurred_atをappend-onlyで保持する。current projectionは`site.readiness_changed`から再構築可能にし、`sites`、`connected_accounts`、`site_build_runs`へ`connected`、`content_read_ready`、`delivery_ready`の重複boolean列を置かない。
- `content_read_ready`のcurrent rowはArticle Read Snapshotの有効期限、本文・見出し・公開状態、source versionへ参照し、Snapshot失効・対象記事変更で再判定する。`delivery_ready`はoperationとConnection Profile／Capability Snapshot／Permission evidenceを参照し、credential失効、Capability変更、権限変更時に該当operationだけを失効させる。過去のReportやGeneration Outcomeを削除せず、新規副作用をheldへ遷移させる。

移行元に旧称`wp_patch_jobs`が存在する場合だけmigration aliasとして読み、現行DDLの`cms_patch_jobs`へ移す。旧名を共通Domainのtable、event、APIには露出しない。

- ArticleSummaryの配列・短文は件数/文字数上限をConfigで持つ。検索頻度の高いintent、tier、freshness、quality、content_hashは索引可能な小さい列とし、可変インベントリは上限つきJSONへ分離する。巨大JSON、本文断片、全世代コピーを作らない。
- 推薦生成はarticle_summaries、Keyword Map、GSC read model、intervention_ledgerを入力とし、recommendation_itemsへ使用summary field、根拠ref、confidence、freshness、反証条件を保存する。推薦一覧の生成時にWP本文を再取得しない。
- `recommendation_items`は`recommendation_id + version`を安定keyとし、正規type、subtype、target_ref、objective_ref、keyword_cluster_ref、search_intent、article_purpose、reason_evidence_refs、cta_policy_ref、internal_link_plan_ref、quality_tier、budget_estimate、protection_policy、availability、dependencies、score_components、status、expires_at、supersedes_ref、origin（monthly_plan/weekly_refresh/triggered_event）を保持する。statusは`candidate/proposed/presented/accepted/accepted_with_edit/held/excluded/expired/dispatched/executing/completed/evaluating/learned/superseded/watching`へ制約し、画面閲覧を`presented`として上書きしない。typeはAction Routing MapのCatalogへ制約し、判定alias、Workflow名、画面名を保存しない。
- `recommendation_presentations`は`schema.recommendation.presentation.v1`に従い、`unique(tenant_id,site_id,recommendation_id,recommendation_version,eligibility_version)`、contract hash、判断可能なAction、adjustable fields、提示surface、提示時刻を保持する。`recommendation_decisions`はappend-onlyのdecision version、result、manual／automatic、actor／delegation Policy、edit delta、Authorization Decision、Intake参照、idempotency keyを保持する。UIの既読・click・再表示を保存する`recommendation_feedback`は分析補助であり、Presentation／Decision正本を更新しない。
- `accepted / accepted_with_edit`のDecision rowと`recommendation_intakes`は同一transactionで作成し、transactional outboxから`recommendation.decision_recorded`を発行する。採用Decisionだけ、またはIntakeだけが存在するcommitを禁止する。意味境界を変える編集は`accepted_with_edit`にせず`manual_intakes`へ保存する。両Intakeは画面表示値から再構築せず、Preflight結果をIntake rowへ上書きしない。ユーザー指定Taskとの衝突では自動予定側をneeds_reviewへ戻し、手動Taskを暗黙取消ししない。
- `execution_admissions`は`admission_id + admission_version`、Intake、正規route、Action subject、state、Authorization epoch、Entitlement／入力／鮮度／重複／カニバリ／保護／Connection／Capacity／Kill Switchの証拠ref、見積・価格・原価model version、billing mode、Reservation ref、valid_until、return context、idempotency、correlationを保持する。`execution_admission_transitions`はbefore／after、reason、evidence、event IDをappend-onlyで保持する。Admission結果をIntakeまたはRecommendation rowへ上書きしない。
- 有償Admissionの`state=ready`は非NULLの`reservation_ref`と同一Admission／estimate versionを参照するLedger reserveを必要とする。`state=consumed`へのcompare-and-setとAction dispatch outboxを同一transactionで一度だけ作成し、二重Consumerによる二重Job／Patchを防ぐ。非課金Actionは`billing_mode=non_billable`かつReservationなしとし、0額Ledger行を作らない。一括操作はAdmission単位のrowを維持し、合算値を正本にしない。
- `keyword_reports`は`report_id + version`を安定keyとし、type、Site、status、analysis period、Market Snapshot、Source availability、coverage、計算version、section refs、supersedes_refを保持する。`keyword_report_cluster_states`はReport versionごとのCluster状態、優先、記事目的、根拠、ユーザー調整を保持する。`monthly_plans.source_report_ref`と`recommendation_items.source_report_ref`は使用versionを参照し、最新Reportへの暗黙差替えを禁止する。

## 3. Search Performance（GscDataMart / CoverageAssessment / RewriteCandidate 集約）

対象: gsc_site_metrics_daily / gsc_page_metrics_daily / gsc_query_metrics_daily / gsc_page_query_metrics_daily、gsc_ingest_metadata（匿名化・切り捨て・取得次元・データ日）、coverage_assessments、query_drift、rewrite_candidates（28d比較・cv_28d・keyword_match_score・cannibalization_score・rewrite_priority_score・rewrite_reason）、page_views_daily、transitions_daily、cta_events_daily、cv_daily、cv_previous_page_daily、tracker_ingest_quality_daily、publication_fact_projections、publication_attribution_projections。
根拠: REQ-PRODUCT-05、REQ-KGA-05/06/08/11、REQ-WPA-05、REQ-SEC-11。検証: AC-KGA-03/04/06/11/12, AC-CV-01。

- 保持の確定事項（v3.7.1で解消済みの矛盾を踏襲）: GSC/CV日次実績は判定正本として日次粒度で保持（初期16か月・要調整）。1週間保持は日次より細かいリアルタイム系のみ。月/年集約は日次正本から導出（REQ-KGA-08）。
- Trackerの恒久tableは集計tableだけとする。`page_views_daily=day×url`、`transitions_daily=day×previous_url×current_url`、`cta_events_daily=day×url×cta`、`cv_daily=day×conversion_url×goal`、`cv_previous_page_daily=day×previous_url×conversion_url×goal`を一意keyとし、count、excluded_count、missing_count、definition_versionを保持する。個別event、user、session、occurrence、複数ページpathを保存するtableを作らない。event IDとoccurrence IDのhashは期限付きdedupe cacheだけへ置き、TTL後に削除する。
- Search PerformanceはPublishing所有の`publication_facts`／`publication_attribution_events`を直接更新せず、`publication_fact_projections`へfact ID、Site、article、external post、effect kind、effective／verified time、resulting hash、attribution、reconciliation state、Intervention／correlation参照だけを投影する。unknownを時刻近似でAI Office実績へ配分せず、外部変更の影響分類は別のchange classificationを参照し、軽微変更だけでSEO／CV評価を無効化しない。Projectionは再構築可能とし、Fact正本をSearch Performanceへ複製所有しない。
- TODO(L3): パーティション設計（日次・大規模サイト）、月次/年次集約テーブル、BigQuery Bulk Export併用時の取り込み経路（REQ-KGA-11）。

### 3.1 Customer Outcome（InterventionEvaluation / EvaluationLane 集約）

対象: `intervention_evaluations`（記事・目的・Intent・Cluster・CV Goal・version）、`evaluation_lanes`（lane ID、type、Intervention、Origin Publication Fact、origin_at、supersedes、cadence、state、availability）、`evaluation_lane_checkpoints`（SEOの1／3／6か月または月次窓）、`evaluation_lane_observations`（SEO／CTA-CV／内部link／認知の型付き指標、月次／累積、source freshness、outcome、next action）、`evaluation_lane_confounders`（外部変更、影響指標、effective_at、rule version）。`schema.evaluation.intervention.v1`を正本とする。

- `seo_content` Laneだけが1／3／6か月checkpointを持つ。`cta_cv / internal_link / awareness`は月次と起点からの累積を保持し、CTA／内部link変更でSEO Laneを更新しない。
- title、主要見出し、実質本文のAI Office更新は旧Laneを上書きせず、新Laneを`supersedes_lane_ref`で接続する。実質的外部変更はLaneを作らずconfounderへ、軽微変更は記事履歴へ送る。
- Recovery Backupの最長3か月と評価保持を同一TTLへ結合しない。Backup削除後も評価Lane、集計、6か月checkpointを保持し、復元可否は別availabilityで表す。
- Search Performanceは観測Projectionを提供するだけで、Evaluation Lane、Outcome、Confounder正本を直接更新しない。

## 4. Generation / Quality / Rewrite（GenerationJob / QualityGateEvaluation / RewriteJob 集約）

対象: generation_jobs（freeze済み workflow/pack/catalog/config version、SiteSandboxContext、intake_ref、correlation_id）、tickets（キーのみ・本文非内包・intake_ref）、snapshots_meta（snapshot_hash・schema_key・returnTo・結果参照）、outline_contracts、qa_results（schema.snapshot.qa.v1 準拠のgates/metrics/ymyl/hard_gate_block）、rewrite_jobs / edit_plans / patch_audit（patch_id / section_id / operation / reason / quality result / cost / approved_by）。
根拠: REQ-PACK-01/04、REQ-AGENT-09、REQ-RWR-02/03/05、REQ-SEC-02。検証: AC-PACK-01/02, AC-AGENT-14, AC-RWR-01/02。

- Snapshot本文・組立本文・PostEnvelope本文は暗号化一時objectへ置き、`snapshots_meta`は`content_ref/content_hash/size/created_at/expires_at/deleted_at`だけを保持する。TTL延長は保留policyの上限内に限定し、完了・取消・期限切れを削除queueへ送る。恒久DBへ本文列を追加しない。
- `article_read_snapshots_meta`は`REQ-DATA-15`および`schema.snapshot.article_read.v1`のmetadataとして、tenant/site/job、article/url、connection/read route、source kind、取得・source更新時刻、public state、content/structure hash、size、availability、provenance、一時object ref、expires/deletedだけを保持する。title、meta、heading tree、本文は一時object側にまとめ、恒久DB列へ複製しない。Rewrite Intakeは有効期限内かつbody・headings・public stateが成立したSnapshot IDを必須外部参照とする。
- 新規`generation_jobs.current_state`は`intake_gate / sandbox_seal / keyword_intent / serp_research / site_strategy / outline_architect / section_brief / draft_writer / self_evolution / quality_gate / generation_outcome / cms_delivery_approval / cleanup`へ制約する。`self_evolution`は互換keyとして`semantic_assembly`成果refを持つ。`generation_stage_phases`へ、Generation Outcome側の`presentation_assemble / decorate / featured_image / placement / cms_validate / deliverable_provided`と、CMS Delivery側の`cms_prepare / cms_deliver / cms_verify / preview / approval_or_automation`を別stageで記録する。旧`cms_draft / preview_approval`は移行alias列でのみ受け、新規state値として書き込まない。`job_state_transitions`は`from_state,to_state,event_id,reason_code,checkpoint_ref,occurred_at`をappend-onlyで保持し、遷移表にない更新を拒否する。保留理由はstateを増殖させず`job_holds`へ種別・解除条件・期限を保存する。
- 冪等性: tickets.ticket_idを実行・Snapshotの冪等キーとし、snapshots_metaにticket_id一意制約を置く。Credit reserveはAction種別に依存しない`admission_id + admission_version + estimate_version`、生成credit commitはGeneration Outcome、その他Actionのcommitは型付きAction Resultをbilling subjectとして冪等化する。Ticketのない非Agent Actionへ架空Ticketを作らず、retry／checkpoint再開は既存Reservationを参照する（REQ-AGENT-10。検証: AC-AGENT-18）。
- golden_eval_sets / golden_eval_runs（改版時の品質回帰評価: タスク定義参照・対象version・gateスコア・比較デルタ。REQ-ADM-10。検証: AC-ADM-11）。

## 5. Publishing & Automation（PublicationDecision / PublicationJob / PublicationFact / PostEnvelope 集約）

対象: cms_capability_snapshots（connection_profile_id / capability_key / status / evidence_ref / checked_at / schema_version）、content_output_schemas（cms_kind / editor_kind / post_type / slot contract / version）、publication_decisions（副作用前の不変判定version）/ publication_confirmations、publication_jobs（Decision・Delivery・Outcome参照、operation、target hash、schedule、idempotency key、実行・検証state、attempt）、publication_facts（外部post、canonical URL、effect kind、resulting hash、effective／verified time、verification evidence、attribution、reconciliation）、approved_new_article_counters（人間承認済み・新規・`ai_office_publication` Factから導出し任意更新しない）、scheduled_actions / automation_policies / approval_requests / content_calendar_slots、recommendation_feedback / saved_views / user_exploration_sessions。`recommendation_items`と`recommendation_intakes`の所有ContextはSearch Performanceとし、Publishingは参照だけを持つ。WordPress固有post ID、Block metadata等が必要な場合はWordPress Adapter所有のextension payloadへ置き、共通table名・共通列・業務eventをWordPressへ固定しない。

CMS接続は`cms_connection_profiles`（profile_id+version、CMS identity、状態、Policy version、required user actions）、`cms_capability_results`（capability key、status、evidence、confidence、checked_at）、`cms_discovery_routes`、`cms_read_routes`（primary/standby/disabled、health、選択理由）、`cms_write_routes`（operation、permission、capability）、`cms_editor_profiles`、`cms_connection_health`（error class、latency、success、freshness、Site負荷、費用、rate limit、連続失敗、cooldown）、`cms_route_transitions`（before/after、reason、probe、observed period）、`cms_capacity_usage`（記事、初回取込、月間変更、storage、processing、Plan）へ分離する。read routeの更新でwrite permissionを更新せず、unknown permissionを許可へ正規化しない。

Agent Office会話は本文全文を業務正本へ保存せず、`office_conversations`（scope、persona、room、保持policy）、`office_interactions`（input kind、action key、llm used/reason、task context、source event version）、`office_proposals`（target、operation、base version、型付きpatch、impact、estimate、authorization、reversibility、状態、command ref）、`office_view_contexts`へ分離する。Officeは成果・Task・設定の正本を複製せず、共通ProjectionとDomain Commandを参照する。選択式操作はLLMを呼ばない。

画像は`image_style_profiles`（site、version、Style Feature、provenance）、`featured_image_patterns`（pattern_id+version、status、default、canvas、variation、logo policy、supersedes）、`featured_image_regions / slots / references`、`image_generation_jobs`（freeze済みPattern／Profile／記事slot／CMS size／route／prompt／予算、idempotency、状態、correlation）、`image_generation_outputs`（hash、検査、advisory、採否。原画像blobを恒久列へ置かない）、`image_media_registrations`（CMS Media ID／URL、派生size、状態）、`image_analysis_cache`（content/perceptual hash、model/prompt version、Style Feature、期限）、`image_usage_costs`へ分離する。Pattern編集履歴とImage Jobを同じ表へ混ぜず、ユーザー再生成は新Job、障害再開は同Job transitionとして記録する。
根拠: REQ-WPA-02/04/08/09、REQ-AOUI-05、REQ-SEC-11。検証: AC-WPA-08, AC-AUTO-01/02, AC-AOUI-03。

- `post_envelope_snapshots`は暗号化一時objectの`content_ref`、hash、schema、CMS capability snapshot、slot assignment、TTLだけを保持し、最終HTML／block全文をDBへ保存しない。CMS下書きの外部投稿ID、CMS edit／preview URL、Media参照、validationは`cms_delivery_jobs`、公開／更新Commandと再試行は`publication_jobs`、検証済み反映結果は`publication_facts`へ分ける。
- `generation_outcomes`はjob、Intake、Presentation Snapshot、content hash、Output Vault ref、`deliverable_provided_at`、credit commit refを一意に保持する。`cms_delivery_jobs`は`REQ-INT-10`および`schema.cms.delivery.v1`に従い、同じGeneration Outcome、Recommendation／Intake／Workflow／Presentation／PostEnvelope参照、operation、Connection Profile version、write route／Capability、Authorization Decision、idempotency key、delivery state、hold理由、再開点、attempt、CMS結果、verification、carryout artifact metadata、correlationを保持する。本文・HTML・block payloadは一時object参照だけとし、`connection_required`からの再開で別Job・別creditを作らない。PublicationDecision、PublicationJob、PublicationFactは別table・別versionとし、一つの`publication_status`またはsuccess列へ丸めない。

## 6. Billing & Credit（CreditAccount 集約）

対象: price_catalog_versions／catalog_products／catalog_prices、plan_configuration_versions、subscriptions（catalog/config version固定）、entitlement_snapshots、credit_lots、credit_reservations、usage_credit_ledger（append-only。monthly_grant / purchase_grant / promo_grant / manual_grant / reserve / release / commit / adjustment / expire / refund_reversal / chargeback_hold、stripe_event_id + idempotency_key 一意）、auto_charge_policies（version、閾値、購入商品、月間有限／無制限上限、当月購入額、step-up／確認参照、状態）、auto_charge_attempts（policy/version、period、trigger balance、purchase idempotency、payment result、lot/ledger ref）、capacity_snapshots／capacity_dimension_usage／capacity_entitlements、invoices／payments／reconciliation_exceptions、preflight_estimates。
根拠: REQ-BILL-01/02/06/07/08/10、REQ-BILLING-01〜16、REQ-NFR-15、REQ-SEC-12。検証: AC-BILL-03/04, AC-SEC-12, AC-L1-BILLING-01〜16。

- 残高はビュー/導出（台帳を直接書き換えない）。予約はmiss上限側で仮押さえ（REQ-BILL-06）。CapacityはDimension別に保存し相殺しない。自動チャージ試行はperiod＋policy version＋purchase idempotencyで一意とし、決済成功とlot／ledger作成をoutbox／reconciliationで追跡する。
- `preflight_estimates`はexpected、reserved max、fixed customer credit、credit unit、pricing／cost model／route／quality／cache assumption version、有効期限を保持し、実績原価で過去見積を更新しない。`credit_reservations`はAdmission／estimate version、billing subject、lot allocation、reserved、committed、released、state、idempotencyを保持し、Ledger eventから再構築可能にする。reserveは消費またはcommitではなく、未使用分だけをreleaseする。

## 7. Provider / Config & Governance / Observability

対象: llm_provider_profiles / provider_adapter_registry / model_catalog / capability_matrix / cost_tables / routing_policies(+versions) / health_checks、config_registry（version / effective_from / effective_to / status、グローバル→プラン→テナント/サイト上書き）、feature_flags / kill_switches、usage_traces（REQ-SEC-02の記録項目）、audit_logs、pack_catalog_definitions（`prompt.*` / `catalog.*`（writing_method / review_lens / reader_segment含む）/ `workflow.*` の版管理正本・ADM-10統制）、few_shot_entries（gate_tags / segment_refs / human_authored / reference_anchor）、ai_phrase_dictionary(+versions)。
根拠: REQ-BILL-09/10、REQ-ADM-06/09、REQ-DUR-04、REQ-SEC-02/10/13。検証: AC-BILL-06/07, AC-ADM-03/06, AC-SEC-06, AC-REL-01〜03。

- Configは`config_key_catalog`へ登録されたkeyだけを保存できる外部キー制約とし、Catalogは`value_schema、allowed_scopes、sensitivity、requires_approval、mutable`を持つ。`mutable=false`の安全不変条件は値tableへのINSERT／UPDATEをDB triggerと管理APIの双方で拒否する。未知keyの自由追加、顧客Scopeからの上位Scope拡張、schema不一致を許可しない。
- 通知受信者決定: notification_recipient_decisions（decision_id / tenant_id / site_id? / source_event_id / notification_class / required_action / resource_ref / policy_version / fallback_applied / resolved_at）、notification_recipient_candidates（decision_id / user_id / site_visible / permission_satisfied / subscribed / selected / exclusion_reason）。受信者はClient指定値を信用せず、Site付与・閲覧範囲・操作権限・購読設定をServer側で解決する。要対応通知で候補が0件の場合はSite owner、契約・課金は契約者へfallbackするが、新しい操作権限は付与しない。
- 通知正本: notifications（notification_id / decision_id / tenant_id / site_id? / recipient_user_id / notification_class / event_type / severity / resource_ref / required_action / payload_meta（本文全文・シークレット禁止）/ dedupe_key / digest_group? / state(unread/read/acknowledged/actioned/archived) / read_at? / acknowledged_at? / actioned_at? / created_at）。notification_subscriptions（user_id / tenant_id / site_id? / notification_class / in_app_enabled / popup_enabled / email_enabled / delivery_mode(immediate/digest) / digest_frequency / updated_at）、notification_delivery_attempts（notification_id / channel / attempted_at / result / failure_class?）、mail_suppressions、notification_action_linksを持つ。in-app記録を正本とし、popup dismissやemail失敗で通知本体を消さない。必須通知はin-appを完全OFFにできず、顧客通知と開発・運用alertは別namespaceとする。根拠: REQ-PRODUCT-11（AC-NOTIF-01〜03）、通知受信者Routing Map v1。TODO(L3): 保持期間・既読アーカイブ。
- Office会話: office_conversation_sessions（tenant/site/persona/user/task?、開始・終了、状態）、office_session_summaries（`schema.office.session_summary.v1`準拠、短い要約、未解決事項、Proposal／確定Command参照、retention class、期限、削除状態）を持つ。生messageは一律の恒久Site記憶にせず、必要な場合だけsession TTL領域またはSupport Ticketの保持Policyへ分離する。Summaryは業務設定、Derived Fact、権限、公開状態の正本にしない。

## 8. グローバル信号ストア（Network Learning、REQ-PRODUCT-13）

テナントスキーマ外を、由来の異なる次の2領域へ分離する。

- `keyword_assets`: 公共外部データとして独立取得でき、保存・再利用条件を満たすキーワード資産。`keywords`（normalized/value/language）、`keyword_locale_metrics`（location/device/provider/freshness）、`keyword_metric_series`（期間集約した検索量・競争性・CPC・市場圧力）、`keyword_edges`（related/synonym/question/entity/category/cluster）、`keyword_provenance`（source/license_or_terms/fetched_at/parser_version）を持てる。キーワード文字列は保持できるが、tenant_id、site_id、URL、顧客別順位・流入・CV、顧客との対応を持つ列は禁止する。
- `global_signals`: 顧客由来信号の集約済み・k匿名派生物。`global_dictionary_candidates`（言語対・観測テナント数・昇格状態。識別子なし）、`segment_priors`（intent/デバイス/業界/AIO有無別のCTR基線・計測分布。version付き）、`threshold_calibration_proposals`を持つ。生のGSCクエリ文字列、URL、テナント識別子を持つ列を作らない。

両領域ともアプリ・Executorから直接書き込めず、認可された公共データ取得パイプラインまたは集約バッチだけを書込主体とする。公共データと顧客由来データを同一provenanceへ混在させず、読み取りはホワイトリスト化されたversion付きViewを経由する。検証: AC-NET-01/02/04。TODO(L3): パーティション、圧縮、履歴粒度、k値、セグメント標本しきい値、集約ジョブ設計。

### 8.1 Keyword MarketとSite Projectionの物理境界

- global `keyword_assets`: `keyword_asset_terms`、`keyword_asset_locale_metrics`、`keyword_asset_metric_series`、`keyword_asset_edges`、`keyword_asset_provenance`。
- global `public_market_clusters`: `public_cluster_versions`、`public_cluster_members`、`public_cluster_lineage(split/merge/supersede)`。locale、device、観測期間、SERP fingerprint、算式versionを必須とする。
- tenant `site_keyword_universes`: Universe version、入力Source集合、構築状態。`site_keywords`はsource_type、keyword_asset_ref nullable、user state、Site内provenanceを持つ。
- tenant `site_cluster_versions / site_cluster_members`: public cluster refs、Site境界、代表語、primary／secondary、user_confirmed、業界／横断軸version、lineageを持つ。
- tenant `site_market_share_snapshots`: site_cluster、期間、Market属性ref、Observed Share、Estimated Share、Article Share、availability、confidence、算式versionを別column／有界JSONで持つ。
- tenant `keyword_classification_feedback`: 修正対象、before／after、理由、入力version、ユーザー確定、Site補正適用状態、匿名較正候補refを持つ。

global tableへtenant_idを追加して顧客対応を保存する方式、tenant tableへ公共metricを全件複製する方式、GSC Queryを`keyword_asset_terms`へ直接INSERTする方式を禁止する。

## 9. 受入との接続

本DDLの完成判定は、負のテストを含む受入（AC-TENANT-02/03、AC-SEC-11、AC-DATA-01〜03）をスキーマレベルで満たせることとする。越境JOIN・スコープ未指定クエリが構造的に失敗することをmigrationテストで検証する。
