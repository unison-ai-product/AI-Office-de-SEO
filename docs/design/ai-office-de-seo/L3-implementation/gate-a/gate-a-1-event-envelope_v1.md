---
document_id: AOS-L3-GATE-A1-EVENT-ENVELOPE
title: Gate A-1 イベント共通エンベロープ v1（凍結）
layer: L3
status: frozen-v1.4
updated_at: 2026-07-05
---

# Gate A-1: イベント共通エンベロープ v1（凍結）

全ドメインイベント・モックイベント・通知導出・W5/キャラ状態・監査写像の共通形。**v1の必須フィールドは凍結**（追加は任意フィールド＋minor、破壊変更は.v2）。

## エンベロープ（JSON Schema要旨）

```json
{
  "$id": "aos.event.envelope.v1",
  "type": "object",
  "required": ["event_id", "event_type", "occurred_at", "actor", "schema_version", "payload"],
  "properties": {
    "event_id":       {"type": "string", "format": "uuid"},
    "event_type":     {"type": "string", "pattern": "^[a-z]+\\.[a-z_]+$"},
    "occurred_at":    {"type": "string", "format": "date-time"},
    "tenant_id":      {"type": ["string", "null"]},
    "site_id":        {"type": ["string", "null"]},
    "job_id":         {"type": ["string", "null"]},
    "ticket_id":      {"type": ["string", "null"]},
    "lane":           {"enum": ["interactive", "scheduled", null]},
    "actor":          {"type": "object", "required": ["type"],
                       "properties": {"type": {"enum": ["user", "system", "agent"]}, "id": {"type": ["string","null"]}}},
    "schema_version": {"type": "string"},
    "dedupe_key":     {"type": ["string", "null"]},
    "payload":        {"type": "object"}
  }
}
```

規約: tenant_id/site_id/job_idはスコープに応じてnull可（グローバルイベントは全null）。**payloadに記事本文全文・プロンプト全文・シークレットを含めない**（REQ-SEC-11）。laneはREQ-BILL-11。schema_versionはevent_type別payloadスキーマの版。

## event_type カタログ v1（凍結・追加はminor）

凡例: 消費者 W=W5進捗/キャラ状態, N=通知(REQ-PRODUCT-11), O=観測(REQ-SEC-13), A=監査写像

| event_type | payload要点 | 消費 | 根拠 |
|---|---|---|---|
| generation.job_started | workflow_key, mode, lane | W,O | REQ-AGENT-09 |
| generation.stage_entered | stage_id, state_index(1-13) | W,O | REQ-AGENT-09 |
| generation.stage_completed | stage_id, snapshot_hash | W,O | REQ-AGENT-09 |
| generation.gate_passed | gate_id | W,O | REQ-AGENT-08/09 |
| generation.gate_held | gate_id, reason | W,N,O | REQ-AGENT-08/09 |
| generation.outline_frozen | outline_hash | W,O | REQ-PACK-18 |
| generation.meaning_unit_drafted | unit_id, purpose_element | W,O | REQ-AGENT-02 |
| generation.qa_evaluated | verdict, hard_gate_block, failed_gates[] | W,N(hard),O | REQ-PACK-09 |
| generation.repair_requested | unit_ids[], issue_refs[] | W,O | REQ-AGENT-02 |
| generation.article_assembled | content_hash | W,O | REQ-WPA-09 |
| generation.job_suspended | cause(manual/kill_switch/budget/hard_gate/approval), hold_until | W,N,O,A | REQ-AGENT-10 |
| generation.job_resumed | resumed_from_stage, rewarm_estimate | W,N,O | REQ-AGENT-10 |
| generation.job_completed | result_ref | W,N,O | REQ-AGENT-01 |
| generation.job_failed | reason | W,N,O | REQ-AGENT-01 |
| generation.job_cancelled | cause | W,N,O | REQ-AGENT-10 |
| rewrite.job_started | workflow_key(rewrite), target_url_hash | W,O | REQ-RWR-01 |
| rewrite.patch_applied | section_id, operation | W,O | REQ-RWR-03 |
| rewrite.quality_failed | failed_gates[] | W,O | REQ-RWR-05 |
| rewrite.flash_applied | url_hash, tdh_diff_ref | O | REQ-RWR-09 |
| content.keyword_map_updated | change_summary | O | REQ-KGA-03 |
| content.article_summary_upserted | url_hash | O | REQ-KGA-07 |
| content.assignment_changed | keyword_group_id, status, article_ref | O | REQ-KGA-14 |
| content.assignment_conflict | keyword_group_id | N,O | REQ-KGA-14 |
| content.duplicate_detected | url_hash | N,O | REQ-PRODUCT-03 |
| content.cv_point_changed | article_ref, cv_id | O | REQ-WPA-13 |
| search.gsc_ingested | data_date, anonymization_note | O | REQ-KGA-11 |
| search.coverage_assessed | url_hash | O | REQ-KGA-05 |
| search.query_drift_detected | url_hash, drift_type | O | REQ-KGA-06 |
| search.cannibalization_detected | url_hashes[], scores | N,O | REQ-KGA-07 |
| search.rewrite_candidate_raised | url_hash, priority_score | O | REQ-RWR-06 |
| search.longtail_cluster_promoted | cluster_id, target(parent/backlog) | N,O | REQ-KGA-16（通知種別化はv1.2・REQ-PRODUCT-11） |
| search.match_stats_updated | click_weighted_rate, tier_breakdown | O | REQ-KGA-15 |
| search.anomaly_detected | scope, delta, factors[] | N,O | REQ-KGA-20 |
| search.serp_volatility_flagged | volatility_score | N,O | REQ-KGA-20 |
| search.watchlist_threshold_crossed | keyword_group_id, delta | N,O | REQ-KGA-20 |
| search.seasonal_refresh_due | url_hash, season_ref | N,O | REQ-KGA-20 |
| search.index_issue_detected | url_hash, issue_type | N,O | REQ-KGA-21 |
| market.keyword_asset_observed | keyword_asset_id, locale, device, metric_kind, observed_at | O | REQ-DATA-10 |
| market.public_cluster_versioned | public_cluster_id, version, changed_components[], observed_period | O | REQ-DATA-10, REQ-KRL-03 |
| market.public_cluster_lineage_changed | source_cluster_refs[], target_cluster_refs[], change_type(split/merge) | O | REQ-KRL-03 |
| site.keyword_universe_updated | site_keyword_universe_version, source_types[], changed_refs[] | W,O | REQ-KRL-03 |
| site.cluster_projection_updated | site_cluster_id, projection_version, cause, user_confirmed | W,O | REQ-KRL-03/09 |
| site.cluster_dependency_staled | site_cluster_id, public_cluster_ref, reason | O | REQ-KRL-09 |
| site.market_share_calculated | site_cluster_id, snapshot_id, period, observed_availability, estimated_availability | W,O | REQ-KRL-02/09 |
| site.keyword_classification_corrected | target_ref, correction_kind, before_version, after_version | W,O,A | REQ-DATA-11, REQ-KRL-09 |
| report.keyword_section_available | report_id, version, report_type, section_key, coverage | W,N,O | REQ-BUS-02/04 |
| report.keyword_ready | report_id, version, report_type, coverage, market_snapshot_ref | W,N,O | REQ-BUS-02/04 |
| report.cluster_state_adjusted | report_id, version, cluster_ref, before_state, after_state, adjusted_by | W,O,A | REQ-BUS-04/05 |
| report.superseded | report_id, version, superseded_by_ref, cause | W,O | REQ-BUS-05/06 |
| recommendation.proposed | recommendation_id, version, type, subtype?, target_ref, origin, availability | W,O | REQ-KRL-08, REQ-DATA-06 |
| recommendation.accepted | recommendation_id, version, intake_ref, correlation_id | W,O,A | REQ-LOGIC-03, REQ-SCREEN-09 |
| recommendation.held | recommendation_id, version, reason, release_condition | W,N,O | REQ-KRL-07/09 |
| recommendation.expired | recommendation_id, version, cause | W,O | REQ-KRL-09 |
| recommendation.dispatched | recommendation_id, intake_ref, workflow_key, job_id, correlation_id | W,O | REQ-LOGIC-03, REQ-AGENT-09 |
| recommendation.user_action_requested | recommendation_id, intake_ref, action_kind, reason_refs[], release_condition | W,N,O | REQ-KRL-07/08 |
| recommendation.no_action_recorded | recommendation_id, type(protect/observe/no_action), next_evaluation_at? | W,O | REQ-KRL-07/09 |
| recommendation.superseded | recommendation_id, version, superseded_by_ref, cause, origin | W,O | REQ-KRL-09 |
| task.conflict_detected | manual_task_ref, automatic_action_ref, target_ref, conflict_kind, suggested_order[] | W,N,O | REQ-KRL-09, REQ-LOGIC-03 |
| recommendation.evaluation_started | recommendation_id, intervention_ref, evaluation_window | W,O | REQ-LOGIC-06, REQ-DATA-07 |
| recommendation.learned | recommendation_id, result_class, site_calibration_version, global_candidate_ref? | W,O,A | REQ-KRL-10, REQ-DATA-10 |
| plan.monthly_closed | period, source_report_ref, target_delta, factors[] | N,O | REQ-PRODUCT-17 |
| automation.change_budget_exhausted | budget_ref, queued | N,O,A | REQ-PRODUCT-18 |
| automation.oscillation_detected | targets[] | N,O,A | REQ-PRODUCT-18 |
| wp.patch_conflict_detected | url_hash, reason | N,O | REQ-WPA-12 |
| cms.connection_diagnosed | connection_profile_id, version, cms_kind, state, required_user_actions[] | W,N,O | REQ-INT-05/06/09 |
| cms.capability_changed | connection_profile_id, capability_key, before_status, after_status, evidence_ref | W,N,O | REQ-INT-05/06 |
| cms.read_route_selected | connection_profile_id, adapter_key, role, reason, policy_version | O,A | REQ-INT-09 |
| cms.read_route_failed_over | connection_profile_id, from_adapter, to_adapter, error_class, cooldown_until | W,N,O,A | REQ-INT-09 |
| cms.read_connection_required | connection_profile_id, failed_routes[], required_user_actions[] | W,N,O | REQ-INT-09 |
| cms.write_verification_completed | publication_or_patch_ref, post_ref, status, resulting_hash?, verified_at | W,O,A | REQ-WPA-09/12 |
| cms.capacity_threshold_reached | connection_profile_id, dimension, usage, limit, forecast_at | W,N,O | REQ-BILLING-03 |
| patch.candidate_proposed | patch_action_id, type, target_article_ref, target_part_ref, recommendation_ref? | W,O | REQ-WPA-12/13, REQ-KGA-09 |
| patch.batch_approved | approval_batch_ref, patch_action_refs[], approved_by | W,O,A | REQ-WPA-12, REQ-PRODUCT-08 |
| patch.action_scheduled | patch_action_id, cms_job_ref, scheduled_at | W,O | REQ-WPA-12 |
| patch.action_applied | patch_action_id, cms_job_ref, resulting_hash, revision_ref?, verified_at | W,O,A | REQ-WPA-12/13 |
| patch.action_failed | patch_action_id, error_class, retryable, failed_part_ref | W,N,O | REQ-WPA-12 |
| patch.action_conflicted | patch_action_id, before_hash, current_hash, target_part_ref | W,N,O | REQ-WPA-12 |
| patch.measurement_started | patch_action_id, metric_kind, baseline_ref, evaluation_started_at | W,O | REQ-WPA-11/13 |
| patch.evaluated | patch_action_id, window(monthly/cumulative), result, availability | W,O | REQ-WPA-11/13, REQ-PRODUCT-19 |
| notification.email_bounced | channel_ref, reason | O | REQ-PRODUCT-21 |
| notification.email_suppressed | channel_ref, reason | N,O | REQ-PRODUCT-21 |
| notification.dispatched | notification_id, channel | O | REQ-PRODUCT-11 |
| notification.read | notification_id | O | REQ-PRODUCT-11 |
| platform.self_healed | action, target, flapping? | O,A | REQ-DUR-10 |
| platform.maintenance_performed | action, target | O | REQ-DUR-10 |
| platform.announcement_published | audience(all/plan/tenant), announce_ref | N,O,A | REQ-PRODUCT-16 |
| auth.owner_recovery_executed | from_ref, to_ref | N,O,A | REQ-SEC-16 |
| support.ticket_created | ticket_id, severity | N,O | REQ-PRODUCT-22 |
| support.ticket_escalated | ticket_id, reason | N,O | REQ-PRODUCT-22 |
| support.ticket_resolved | ticket_id, resolution_ref | N,O | REQ-PRODUCT-22 |
| showcase.consent_granted | tenant_ref, scope | O,A | REQ-PRODUCT-23 |
| showcase.consent_revoked | tenant_ref, scope | O,A | REQ-PRODUCT-23 |
| source.fanout_expanded | facets[] | O | REQ-SRC-09 |
| source.competitor_structure_extracted | keyword | O | REQ-SRC-03 |
| source.fetch_throttled | provider, deferred_to | N(繰延), O | REQ-SRC-07 |
| publish.envelope_sealed | post_refs | W,O | REQ-WPA-09 |
| publish.draft_created | post_refs | W,O | REQ-WPA-04 |
| publish.scheduled | schedule_at | W,O | REQ-WPA-04 |
| publish.approval_requested | requester, schedule_at? | N,O | REQ-WPA-04 |
| publish.approved | approver | N,O,A | REQ-WPA-04 |
| publish.rejected | approver, reason | N,O,A | REQ-WPA-04 |
| publish.published | wp_url | N,O | REQ-WPA-04 |
| publish.failed | reason | N,O | REQ-WPA-04 |
| publish.cv_recorded | goal, date, count | O | REQ-WPA-05 |
| billing.credit_reserved | amount, ledger_ref | O,A | REQ-BILL-07 |
| billing.credit_committed | amount, ledger_ref | O,A | REQ-BILL-07 |
| billing.credit_released | amount, ledger_ref | O,A | REQ-BILL-07 |
| billing.monthly_granted | amount | N,O,A | REQ-BILL-08 |
| billing.balance_low | threshold | N,O,A | REQ-BILL-02 |
| billing.subscription_state_changed | from, to | N,O,A | REQ-BILL-08 |
| billing.batch_lane_fallback | job_id, delta_estimate | N,O | REQ-BILL-11 |
| billing.webhook_failed | stripe_event_ref | N(admin),O,A | REQ-ADM-02, REQ-BILL-07 |
| billing.reconciliation_mismatch | diff_summary | N(admin),O,A | REQ-ADM-02, REQ-BILL-07 |
| billing.cache_hit_floor_breached | grade, assumed, actual | N(admin),O | REQ-BILL-06 |
| provider.route_decided | provider, model_ref | O,A | REQ-BILL-09 |
| provider.health_degraded | provider | N(admin),O | REQ-BILL-09 |
| provider.canary_rolled_back | provider, model_ref | N(admin),O,A | REQ-BILL-09 |
| config.version_activated | config_key, version | O,A | REQ-ADM-09 |
| config.flag_toggled | flag_key, state | O,A | REQ-DUR-04 |
| config.kill_switch_engaged | scope, target | N,O,A | REQ-DUR-04 |
| config.pack_regression_detected | pack_key, version, delta | N(admin),O | REQ-ADM-10 |
| config.kill_switch_released | scope, target | N,O,A | REQ-DUR-04 |
| security.boundary_violation_attempted | resource, denied_scope | N(admin),O,A | REQ-SEC-07 |
| security.token_reauth_required | connected_account_ref | N,O | REQ-SEC-09 |
| security.plugin_update_available | site_ref, version | N,O | REQ-WPA-07 |
| network.dictionary_candidate_promoted | candidate_ref（**提案生成。適用はADM統制**） | N(admin),O,A | REQ-PRODUCT-13 |
| network.prior_updated | prior_version（**提案生成。適用はADM統制**） | N(admin),O,A | REQ-PRODUCT-13 |

監査対象イベント（A印）の正本は監査ログであり、イベント・通知はその写像（REQ-SEC-10 / REQ-PRODUCT-11）。モックイベント（プロトPT-0）は本カタログと同形で作成する。

v1.1改訂: 通知カタログ（REQ-PRODUCT-11）との突合で4種追加（approval_requested / webhook_failed / reconciliation_mismatch / cache_hit_floor_breached）。凍結規則どおりevent_type追加はminorでありエンベロープ・既存typeは不変。

v1.2改訂: 運営お知らせのイベント投入（REQ-PRODUCT-16のイベント由来原則との整合）で `platform.announcement_published` を追加（minor）。エンベロープ・既存typeは不変。

v1.4改訂: Pack版のゴールデン評価・活性化後監視（REQ-ADM-10拡張）に伴い `config.pack_regression_detected` を追加（minor）。

v1.3改訂（表記正規化・型不変）: カタログを **1 event_type = 1行** へ正規化した。旧版の複合行（例: `generation.gate_passed / gate_held`）は複数typeの省略表記であり、機械照合の契約としてregex `^[a-z]+\.[a-z_]+$` に行単位で適合しなかったため分割した。event_typeの集合・エンベロープ・payload意味論は不変（新規type追加なし）。分割時、旧複合行で共有されていた消費印・根拠は各行へ引き継ぎ、区別があったもの（N(held)/N(hard)等）は当該行にのみ付した。
