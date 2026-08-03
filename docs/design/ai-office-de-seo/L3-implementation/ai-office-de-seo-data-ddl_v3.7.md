---
document_id: AOS-L3-DATA-DDL
title: AI Office de SEO データDDL設計（L3スケルトン） v3.7
version: 3.7
layer: L3
kind: design
status: skeleton
updated_at: 2026-07-30
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO データDDL設計（L3スケルトン）

L2の各集約（AOS-L2-DOMAIN-MODEL §4）をテーブルDDLへ確定する作業台。本書はスケルトンであり、`TODO(L3)` を埋めて `status: draft → review → fixed` へ進める。

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

- TODO(L3): 各テーブルの列・型・一意制約、代表契約者1名制約、最後の契約者取消防止、Site Assignment空集合の意味、Permission bundle migration、権限変更時session失効を確定する。
- TODO(L3): OAuthトークンの暗号化列（KMS参照）と `secret_refs` 分離（REQ-SEC-09）。

## 2. Content Index（UrlMaster / ArticleSummary / KeywordMap 集約）

対象: url_master（raw_url / canonical_url / canonical_url_hash / wp_post_id / gsc_page_url / redirect_target_url / url_alias_type）、url_alias_history、article_summaries（title / meta / h1 / headings_tree / word_count / article_type / digest / topics / intent / audience / funnel_stage / questions / claims / unit_types / entities / keyword_groups / tier / categories / tags / cta_types / outbound_topics / linkable_topics / freshness / gaps / quality / completeness / confidence / content_hash / summary_schema_version / analyzer_version / analyzed_at / published_at / modified_at / last_synced_at）、keywords（raw / normalized_keyword / keyword_group_id / intent / priority / target_url_hash）、same_serps_clusters、article_map。
根拠: REQ-PRODUCT-03/04、REQ-KGA-02/07/12、REQ-SEC-11。検証: AC-DATA-04/05, AC-KGA-01/02/14。

- TODO(L3): 一意キー `tenant_id + site_id + canonical_url_hash` と、内部ID（照会=URL・管理=ID、REQ-PRODUCT-03）の二重キー構造。重複検出はアラート（ハードロックしない）。
- TODO(L3): カニバリ判定に使う被覆・分散の導出列/ビュー（REQ-KGA-07。しきい値はConfig Registry参照）。
- keyword_attributes（intent / commercial / target_fit / industry_fit / ymyl_adjacent / locality / freshness。決定論付与・辞書version参照。REQ-KGA-13）、keyword_assignments（keyword_group_id一意・status・primary記事は内部ID参照・履歴。REQ-KGA-14。検証: AC-KGA-17/18）、gsc_query_matches（query正規化形 / keyword_group_id / method / confidence / matched_at / 辞書version。未マッチは明示行。夜間バッチで再計算。REQ-KGA-15。検証: AC-KGA-19）、topology_nodes/edges（tier=pillar/cluster/leaf・category/tags・リンク再調整キュー。REQ-KGA-19）、keyword_watchlists（しきい値・通知設定。REQ-KGA-20）、engagement_daily（url_hash×日次のdwell/scroll分位。個人非特定。REQ-WPA-11）、index_status（state/issue/checked_at。REQ-KGA-21）、monthly_plans（目標・配分・予測レンジversion・実績。REQ-PRODUCT-17）、derived_facts（fact_key/value/observed_at/confidence/source_ref・サイズ上限・月次ロールアップ。REQ-PRODUCT-19）、intervention_ledger（施策タイプ×文脈×効果デルタ。REQ-PRODUCT-19）、automation_change_budget（日次/週次消費・クールダウン・振動検知状態。REQ-PRODUCT-18）、cv_points / cv_assignments（カタログ・記事割当・有効期間。REQ-WPA-13）、lightweight_patch_actions（patch_action_id・type・対象article/part・before_hash・提案ref・記事目的・intent・CV/link先・Recommendation/Intake/correlation・承認batch・CMS job・計測policy・状態）、patch_approval_batches（batch_id・action refs・承認者・結果）、wp_patch_jobs（patch_action_id・対象・操作・リビジョン参照・CMS応答・反映確認・競合/再試行/ロールバック状態。REQ-WPA-12）、patch_measurements（patch_action_id・月次/累積・availability・評価起点・結果）、article_summaries（契約準拠・content_hash差分更新・配列/短文上限・解析品質・直前有効版参照。本文列を作らない。REQ-PRODUCT-20）、summary_embeddings（対象ref・model_version・vector。実装方式はL3。REQ-PRODUCT-20）、tenant_schedule（timezone・静穏窓・割当オフセット。REQ-SRC-10）、mail_suppressions（宛先hash・理由・停止/再有効化。REQ-PRODUCT-21）、invitation_tokens（期限・単回・失効。REQ-SEC-16）、tenants.kind（internal/customer区分・開発者アカウント配下の所有参照。REQ-PRODUCT-23）、showcase_consents / showcase_cases（許諾範囲・撤回状態・転用スナップショット。REQ-PRODUCT-23）、support_tickets / support_messages（チケット・会話・AI要約・文脈参照。記事本文/プロンプト全文の列を作らない。保持期間Config。REQ-PRODUCT-22）、longtail_clusters（中核トークン / modifierパターン / 集計clicks・impressions / 昇格状態 / 親グループ参照。REQ-KGA-16）、keyword_value_scores（value_score / demand / realizable_ctr / aio_pressure / paid_pressure / domain_credibility_fit / serp_features / intent_cv / fit / availability / confidence / baseline_version。REQ-KGA-17。検証: AC-KGA-21）、keyword_strategy_profiles（site_id / profile / site_necessity_weight / traffic_weight / conversion_weight / valid_from / version。REQ-KGA-23）、keyword_dynamic_priorities（keyword_group_id / strategic_need / attainable_value / urgency / confidence / cost / risk / dynamic_priority / reason_components / recalculated_at / expires_at。REQ-KGA-23）。

- ArticleSummaryの配列・短文は件数/文字数上限をConfigで持つ。検索頻度の高いintent、tier、freshness、quality、content_hashは索引可能な小さい列とし、可変インベントリは上限つきJSONへ分離する。巨大JSON、本文断片、全世代コピーを作らない。
- 推薦生成はarticle_summaries、Keyword Map、GSC read model、intervention_ledgerを入力とし、recommendation_itemsへ使用summary field、根拠ref、confidence、freshness、反証条件を保存する。推薦一覧の生成時にWP本文を再取得しない。
- `recommendation_items`は`recommendation_id + version`を安定keyとし、正規type、subtype、target_ref、objective_ref、keyword_cluster_ref、search_intent、article_purpose、reason_evidence_refs、cta_policy_ref、internal_link_plan_ref、quality_tier、budget_estimate、protection_policy、availability、dependencies、score_components、status、expires_at、supersedes_ref、origin（monthly_plan/user_manual/automation）を保持する。typeはAction Routing MapのCatalogへ制約し、判定alias、Workflow名、画面名を保存しない。採用時は`recommendation_intakes`へ`schema.intake.recommendation.v1`準拠のfreeze済み入力とcorrelation_idを保存し、各workflow/patch/user taskから参照する。画面表示値からIntakeを再構築しない。ユーザー指定Taskとの衝突では自動予定側をneeds_reviewへ戻し、手動Taskを暗黙取消ししない。
- `keyword_reports`は`report_id + version`を安定keyとし、type、Site、status、analysis period、Market Snapshot、Source availability、coverage、計算version、section refs、supersedes_refを保持する。`keyword_report_cluster_states`はReport versionごとのCluster状態、優先、記事目的、根拠、ユーザー調整を保持する。`monthly_plans.source_report_ref`と`recommendation_items.source_report_ref`は使用versionを参照し、最新Reportへの暗黙差替えを禁止する。

## 3. Search Performance（GscDataMart / CoverageAssessment / RewriteCandidate 集約）

対象: gsc_site_metrics_daily / gsc_page_metrics_daily / gsc_query_metrics_daily / gsc_page_query_metrics_daily、gsc_ingest_metadata（匿名化・切り捨て・取得次元・データ日）、coverage_assessments、query_drift、rewrite_candidates（28d比較・cv_28d・keyword_match_score・cannibalization_score・rewrite_priority_score・rewrite_reason）、cv_daily。
根拠: REQ-PRODUCT-05、REQ-KGA-05/06/08/11、REQ-WPA-05、REQ-SEC-11。検証: AC-KGA-03/04/06/11/12, AC-CV-01。

- 保持の確定事項（v3.7.1で解消済みの矛盾を踏襲）: GSC/CV日次実績は判定正本として日次粒度で保持（初期16か月・要調整）。1週間保持は日次より細かいリアルタイム系のみ。月/年集約は日次正本から導出（REQ-KGA-08）。
- TODO(L3): パーティション設計（日次・大規模サイト）、月次/年次集約テーブル、BigQuery Bulk Export併用時の取り込み経路（REQ-KGA-11）。

## 4. Generation / Quality / Rewrite（GenerationJob / QualityGateEvaluation / RewriteJob 集約）

対象: generation_jobs（freeze済み workflow/pack/catalog/config version、SiteSandboxContext、intake_ref、correlation_id）、tickets（キーのみ・本文非内包・intake_ref）、snapshots_meta（snapshot_hash・schema_key・returnTo・結果参照）、outline_contracts、qa_results（schema.snapshot.qa.v1 準拠のgates/metrics/ymyl/hard_gate_block）、rewrite_jobs / edit_plans / patch_audit（patch_id / section_id / operation / reason / quality result / cost / approved_by）。
根拠: REQ-PACK-01/04、REQ-AGENT-09、REQ-RWR-02/03/05、REQ-SEC-02。検証: AC-PACK-01/02, AC-AGENT-14, AC-RWR-01/02。

- TODO(L3): Snapshot本体は本文を含む場合があるため一時領域（TTL）に置き、テーブルはメタ・hashのみ（REQ-SEC-11）。
- TODO(L3): 状態機械の状態カラム（13状態＝実務工程9＋強制ゲート4、REQ-AGENT-09）と遷移履歴。
- 冪等性: tickets.ticket_idを冪等キーとし、snapshots_metaにticket_id一意制約（重複取り込みのdedupe）、usage_credit_ledgerのreserve/commitはticket_id参照で冪等（REQ-AGENT-10。検証: AC-AGENT-18）。
- golden_eval_sets / golden_eval_runs（改版時の品質回帰評価: タスク定義参照・対象version・gateスコア・比較デルタ。REQ-ADM-10。検証: AC-ADM-11）。

## 5. Publishing & Automation（PublicationJob / PostEnvelope 集約）

対象: wp_capability_snapshots（snapshotKey / schemaVersion）、dynamic_post_schemas、publication_jobs（dynamicPostSchemaKey・slot assignment metadata・content hash・validation result・WP draft URL・job result・correlation_id）、scheduled_actions / automation_policies / approval_requests / content_calendar_slots、recommendation_feedback / saved_views / user_exploration_sessions。`recommendation_items`と`recommendation_intakes`の所有ContextはSearch Performanceとし、Publishingは参照だけを持つ。

CMS接続は`cms_connection_profiles`（profile_id+version、CMS identity、状態、Policy version、required user actions）、`cms_capability_results`（capability key、status、evidence、confidence、checked_at）、`cms_discovery_routes`、`cms_read_routes`（primary/standby/disabled、health、選択理由）、`cms_write_routes`（operation、permission、capability）、`cms_editor_profiles`、`cms_connection_health`（error class、latency、success、freshness、Site負荷、費用、rate limit、連続失敗、cooldown）、`cms_route_transitions`（before/after、reason、probe、observed period）、`cms_capacity_usage`（記事、初回取込、月間変更、storage、processing、Plan）へ分離する。read routeの更新でwrite permissionを更新せず、unknown permissionを許可へ正規化しない。

Agent Office会話は本文全文を業務正本へ保存せず、`office_conversations`（scope、persona、room、保持policy）、`office_proposals`（proposal_id+version、intent、target、operation、base version、型付きpatch、impact、estimate、authorization、reversibility、状態、correlation）、`office_proposal_evidence`、`office_proposal_transitions`、`office_view_contexts`（通常／Office往復用のtarget/filter/version）へ分離する。確定Proposalは既存Domain Commandを参照し、Office専用の複製状態を更新しない。質問・探索からCommand refを作らない。
根拠: REQ-WPA-02/04/08/09、REQ-AOUI-05、REQ-SEC-11。検証: AC-WPA-08, AC-AUTO-01/02, AC-AOUI-03。

- TODO(L3): PostEnvelopeSnapshot は一時保存（最終HTML/ブロック全文は恒久保存しない）。

## 6. Billing & Credit（CreditAccount 集約）

対象: usage_credit_ledger（append-only。monthly_grant / purchase_grant / promo_grant / manual_grant / reserve / release / commit / adjustment / expire / refund_reversal / chargeback_hold、stripe_event_id + idempotency_key 一意）、subscriptions、billing_plans(+versions) / credit_packs / credit_pack_prices、preflight_estimates。
根拠: REQ-BILL-01/02/06/07/08/10、REQ-SEC-12。検証: AC-BILL-03/04, AC-SEC-12。

- TODO(L3): 残高はビュー/導出（台帳を直接書き換えない）。予約はmiss上限側で仮押さえ（REQ-BILL-06）。

## 7. Provider / Config & Governance / Observability

対象: llm_provider_profiles / provider_adapter_registry / model_catalog / capability_matrix / cost_tables / routing_policies(+versions) / health_checks、config_registry（version / effective_from / effective_to / status、グローバル→プラン→テナント/サイト上書き）、feature_flags / kill_switches、usage_traces（REQ-SEC-02の記録項目）、audit_logs、pack_catalog_definitions（`prompt.*` / `catalog.*`（writing_method / review_lens / reader_segment含む）/ `workflow.*` の版管理正本・ADM-10統制）、few_shot_entries（gate_tags / segment_refs / human_authored / reference_anchor）、ai_phrase_dictionary(+versions)。
根拠: REQ-BILL-09/10、REQ-ADM-06/09、REQ-DUR-04、REQ-SEC-02/10/13。検証: AC-BILL-06/07, AC-ADM-03/06, AC-SEC-06, AC-REL-01〜03。

- TODO(L3): 安全不変条件（REQ-ADM-09）は config_registry の設定対象外であることをスキーマ/検証で強制する方法（許可キーのホワイトリスト等）。
- 通知: notifications（tenant_id / site_id? / recipient_user_id / event_type / severity / payload_meta（本文全文・シークレット禁止）/ read_at / created_at）、notification_settings（user単位＋tenant既定の上書き、種別別ON/OFF・ダイジェスト頻度）、delivery_attempts（外部チャネル配信結果。in-app記録が正本）。根拠: REQ-PRODUCT-11（AC-NOTIF-01〜03）。TODO(L3): 保持期間・既読アーカイブ。

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
