---
document_id: AOS-L3-GATE-A1-EVENT-ENVELOPE
title: Gate A-1 イベント共通エンベロープ v1
layer: L3
version: 1.6
kind: contract
status: current-draft
updated_at: 2026-08-03
---

# Gate A-1: イベント共通エンベロープ v1

全ドメインイベント・モックイベント・通知導出・W5/キャラ状態・監査写像の共通形。現行要求監査後にv1の必須フィールドを固定し、以後は追加を任意フィールド＋minor、破壊変更を.v2で扱う。

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
    "actor":          {"type": "object", "required": ["principal_kind", "id"],
                       "properties": {
                         "principal_kind": {"enum": ["customer_user", "internal_user", "service", "ai_executor", "system"]},
                         "id": {"type": ["string","null"]},
                         "delegation_ref": {"type": ["string","null"]},
                         "authorization_decision_ref": {"type": ["string","null"]}
                       }},
    "acting_context": {"type": ["object","null"],
                       "properties": {
                         "customer_organization_id": {"type": ["string","null"]},
                         "customer_user_id": {"type": ["string","null"]},
                         "site_ids": {"type": "array", "items": {"type": "string"}},
                         "purpose": {"type": ["string","null"]},
                         "expires_at": {"type": ["string","null"], "format": "date-time"}
                       }},
    "schema_version": {"type": "string"},
    "dedupe_key":     {"type": ["string", "null"]},
    "payload":        {"type": "object"}
  }
}
```

`actor.principal_kind`は顧客User、内部運用者、Service、AI Executorを混同しない。内部Managerが期限付き権限で顧客Contextを扱う場合、`actor`は内部Managerのまま記録し、`acting_context`と`delegation_ref`へ対象顧客・Site・目的・期限を記録する。顧客本人へactorを書き換えない。Automationは設定者のSessionをactorとして再利用せず`service`、LLMを用いるExecutorは`ai_executor`とし、認可Decisionと委任契約を参照する。`system`の`id`だけはnullを許可する。

規約: tenant_id/site_id/job_idはスコープに応じてnull可（グローバルイベントは全null）。**payloadに記事本文全文・プロンプト全文・シークレットを含めない**（REQ-SEC-11）。laneはREQ-BILL-11。schema_versionはevent_type別payloadスキーマの版。

## event_type カタログ v1（凍結・追加はminor）

凡例: 消費者 W=W5進捗/キャラ状態, N=通知(REQ-PRODUCT-11), O=観測(REQ-SEC-13), A=監査写像

| event_type | payload要点 | 消費 | 根拠 |
|---|---|---|---|
| generation.job_started | workflow_key, mode, lane, start_kind(recommendation/manual/user_regeneration), parent_generation_outcome_ref?, estimate_ref, reservation_ref | W,O,A | REQ-AGENT-09/10, REQ-BILLING-04 |
| generation.stage_entered | stage_id, state_index(1-13) | W,O | REQ-AGENT-09 |
| generation.stage_completed | stage_id, snapshot_hash | W,O | REQ-AGENT-09 |
| generation.stage_phase_entered | stage_id, phase_key, phase_index, phase_total | W,O | REQ-AGENT-09, REQ-WPA-09 |
| generation.stage_phase_completed | stage_id, phase_key, result_ref?, content_hash? | W,O | REQ-AGENT-09, REQ-WPA-09 |
| generation.gate_passed | gate_id | W,O | REQ-AGENT-08/09 |
| generation.gate_held | gate_id, reason | W,N,O | REQ-AGENT-08/09 |
| generation.outline_frozen | outline_hash | W,O | REQ-PACK-18 |
| generation.meaning_unit_drafted | unit_id, purpose_element | W,O | REQ-AGENT-02 |
| generation.qa_evaluated | verdict, hard_gate_block, failed_gates[] | W,N(hard),O | REQ-PACK-09 |
| generation.repair_requested | unit_ids[], issue_refs[] | W,O | REQ-AGENT-02 |
| generation.semantic_assembled | assembled_snapshot_ref, content_hash, unit_refs[], outline_contract_ref | W,O | REQ-AGENT-02/09/11, REQ-PACK-17/18 |
| generation.presentation_assembled | presentation_snapshot_ref, semantic_snapshot_ref, decoration_profile_ref?, featured_image_ref?, placement_instruction_refs[], cms_format_key | W,O | REQ-AGENT-11, REQ-PACK-17, REQ-LOGIC-09/10 |
| generation.job_suspended | cause(manual/kill_switch/budget/hard_gate/approval), hold_until, reservation_ref, checkpoint_ref | W,N,O,A | REQ-AGENT-10 |
| generation.job_resumed | resumed_from_stage, checkpoint_ref, reservation_ref, customer_credit_delta(0), internal_rewarm_cost_ref? | W,N,O,A | REQ-AGENT-10, REQ-BILLING-04 |
| generation.job_completed | generation_outcome_id, deliverable_provided_at, credit_commit_ref | W,N,O,A | REQ-AGENT-01, REQ-BILLING-04 |
| generation.job_failed | reason, generation_outcome_id(null), reserve_disposition(held/released), retryable, resume_from? | W,N,O,A | REQ-AGENT-01/10, REQ-BILLING-04 |
| generation.job_cancelled | cause, generation_outcome_id?, reserve_disposition(unchanged/released) | W,N,O,A | REQ-AGENT-10, REQ-BILLING-04 |
| workflow.run_completed | workflow_run_id, workflow_key, completion_kind(publication_job_handoff/carried_out/cancelled/failed_terminal), generation_outcome_ref?, cms_delivery_ref?, publication_job_ref?, correlation_id | W,O,A | REQ-AGENT-09/10 |
| rewrite.job_started | workflow_key(rewrite), target_url_hash | W,O | REQ-RWR-01 |
| rewrite.patch_applied | section_id, operation | W,O | REQ-RWR-03 |
| rewrite.quality_failed | failed_gates[] | W,O | REQ-RWR-05 |
| rewrite.flash_applied | url_hash, tdh_diff_ref | O | REQ-RWR-09 |
| content.keyword_map_updated | change_summary | O | REQ-KGA-03 |
| content.article_summary_upserted | url_hash | O | REQ-KGA-07 |
| content.article_read_snapshot_created | article_read_snapshot_id, article_ref, url_ref, source_kind, fetched_at, content_hash, structure_hash, availability, expires_at, provenance_ref | O | REQ-DATA-15, REQ-INT-09 |
| content.article_read_snapshot_destroyed | article_read_snapshot_id, destroyed_at, destroy_reason(completed/cancelled/expired/replaced), content_object_deleted, metadata_retained | O,A | REQ-DATA-15 |
| content.assignment_changed | keyword_group_id, status, article_ref | O | REQ-KGA-14 |
| content.assignment_conflict | keyword_group_id | N,O | REQ-KGA-14 |
| content.duplicate_detected | url_hash | N,O | REQ-PRODUCT-03 |
| content.cv_point_changed | article_ref, cv_id | O | REQ-WPA-13 |
| search.gsc_ingested | data_date, anonymization_note | O | REQ-KGA-11 |
| search.coverage_assessed | url_hash | O | REQ-KGA-05 |
| search.query_drift_detected | url_hash, drift_type | O | REQ-KGA-06 |
| search.cannibalization_detected | url_hashes[], scores | N,O | REQ-KGA-07 |
| search.rewrite_candidate_raised | recommendation_id, version, article_ref, article_summary_ref, article_read_snapshot_ref, content_hash, reason_codes[], evidence_refs[], input_availability, observed_at, priority_score | O | REQ-BUS-02, REQ-RWR-06, REQ-LOGIC-02, REQ-DATA-15 |
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
| site.build_started | build_id, version, site_mode, input_states[] | W,O | REQ-BUS-02/03 |
| site.build_stage_released | build_id, stage_key, coverage, available_capabilities[] | W,N,O | REQ-BUS-02/03, REQ-SCREEN-18 |
| site.big_keyword_direction_confirmed | build_id, accepted_refs[], excluded_refs[], added_refs[] | W,O,A | REQ-BUS-02, REQ-SCREEN-02 |
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
| plan.monthly_proposed | monthly_plan_id, version, target_month, source_report_ref, confirmation_mode | W,N,O | REQ-BUS-06/07, REQ-UJ-09 |
| plan.monthly_confirmed | monthly_plan_id, version, confirmed_by?, confirmation_mode | W,N,O,A | REQ-BUS-06/07, REQ-UJ-09 |
| plan.weekly_execution_selected | weekly_selection_id, version, monthly_plan_ref, selected_recommendation_refs[], execution_mode | W,N,O | REQ-BUS-07, REQ-UJ-09 |
| recommendation.evaluation_started | recommendation_id, intervention_ref, evaluation_window | W,O | REQ-LOGIC-06, REQ-DATA-07 |
| recommendation.learned | recommendation_id, result_class, site_calibration_version, global_candidate_ref? | W,O,A | REQ-KRL-10, REQ-DATA-10 |
| plan.monthly_closed | period, source_report_ref, target_delta, factors[] | N,O | REQ-PRODUCT-17 |
| evaluation.intervention_due | evaluation_id, intervention_ref, article_ref, window | W,N,O | REQ-LOGIC-06 |
| evaluation.intervention_completed | evaluation_id, intervention_ref, article_ref, window, outcome, next_action? | W,N,O | REQ-LOGIC-06/08, REQ-DATA-07 |
| evaluation.intervention_registered | evaluation_id, intervention_ref, publication_fact_ref, lane_id, lane_type(seo_content/cta_cv/internal_link/awareness), evaluation_origin_at, cadence, checkpoints_or_windows[], baseline_ref, correlation_id | W,O,A | REQ-MEASURE-13/14 |
| site.activated | activation_id, site_id, recommendation_ref, publication_fact_ref, activated_at, funnel_version | W,O,A | REQ-MEASURE-13 |
| product.loop_completed | loop_completion_id, site_id, recommendation_ref, publication_fact_ref, evaluation_id, seo_content_lane_ref, completed_at, metric_rule_version | O,A | REQ-MEASURE-13 |
| automation.change_budget_exhausted | budget_ref, queued | N,O,A | REQ-PRODUCT-18 |
| automation.oscillation_detected | targets[] | N,O,A | REQ-PRODUCT-18 |
| cms.connection_diagnosed | connection_profile_id, version, cms_kind, state, required_user_actions[] | W,N,O | REQ-INT-05/06/09 |
| cms.capability_changed | connection_profile_id, capability_key, before_status, after_status, evidence_ref | W,N,O | REQ-INT-05/06 |
| cms.read_route_selected | connection_profile_id, adapter_key, role, reason, policy_version | O,A | REQ-INT-09 |
| cms.read_route_failed_over | connection_profile_id, from_adapter, to_adapter, error_class, cooldown_until | W,N,O,A | REQ-INT-09 |
| cms.read_connection_required | connection_profile_id, failed_routes[], required_user_actions[] | W,N,O | REQ-INT-09 |
| generation.deliverable_provided | generation_outcome_id, intake_ref, presentation_snapshot_ref, content_hash, output_vault_ref, deliverable_provided_at, credit_commit_ref, correlation_id | W,O,A | REQ-BILLING-04, REQ-INT-10 |
| cms.delivery_prepared | cms_delivery_id, generation_outcome_id, operation, presentation_snapshot_ref, post_envelope_ref, content_hash, connection_profile_version, idempotency_key, correlation_id | W,O | REQ-INT-10 |
| cms.delivery_held | cms_delivery_id, state(connection_required/permission_required), reason_codes[], required_user_actions[], resume_from, retry_after? | W,N,O | REQ-INT-10 |
| cms.delivery_resumed | cms_delivery_id, prior_state, resume_from, attempt_count, idempotency_key | W,O,A | REQ-INT-10 |
| cms.delivery_failed | cms_delivery_id, failure_class, retryable, attempt_count, last_error_ref | W,N,O | REQ-INT-10 |
| cms.write_verification_completed | publication_or_patch_ref, post_ref, status, resulting_hash?, verified_at | W,O,A | REQ-WPA-09/12 |
| cms.delivery_verified | cms_delivery_id, external_post_refs[], resulting_hash, media_refs[], verified_at, evidence_ref | W,O,A | REQ-INT-10 |
| cms.delivery_carried_out | cms_delivery_id, format, artifact_ref, expires_at, publication_success(false) | W,O,A | REQ-INT-10 |
| cms.capacity_threshold_reached | connection_profile_id, dimension, usage, limit, forecast_at | W,N,O | REQ-BILLING-03 |
| office.proposal_drafted | proposal_id, version, persona_key, intent_kind, target_ref, operation | W,O | REQ-AOUI-01/04 |
| office.proposal_estimated | proposal_id, version, impact_ref, estimate_ref, availability | W,O | REQ-AOUI-01/04 |
| office.proposal_input_required | proposal_id, missing_inputs[], release_condition | W,N,O | REQ-AOUI-04 |
| office.proposal_confirmed | proposal_id, version, confirmed_by, authorization_decision_ref | W,O,A | REQ-AOUI-01/04 |
| office.proposal_dispatched | proposal_id, command_ref, correlation_id | W,O,A | REQ-AGENT-06/09 |
| office.proposal_applied | proposal_id, command_ref, result_ref, changed_refs[] | W,N,O,A | REQ-AOUI-01 |
| office.proposal_failed | proposal_id, command_ref?, error_class, retryable | W,N,O | REQ-AOUI-01 |
| office.proposal_cancelled | proposal_id, cancelled_by, reason | W,O,A | REQ-AOUI-01 |
| office.proposal_superseded | proposal_id, version, current_base_version, replacement_ref? | W,O | REQ-AOUI-01 |
| ui.availability_changed | resource_ref, operation?, before_state, after_state, primary_reason, reason_codes[] | W,N,O | REQ-SCREEN-01/03/15 |
| image.pattern_versioned | pattern_id, version, site_id, variation_mode, is_default, supersedes_ref? | W,O,A | REQ-LOGIC-10, REQ-DATA-12 |
| image.generation_estimated | image_job_id, pattern_ref, cms_size_ref, quality, estimate_ref | W,O | REQ-LOGIC-10, REQ-COST-10 |
| image.generation_started | image_job_id, pattern_ref, model_route_ref, correlation_id | W,O | REQ-INT-07 |
| image.generation_completed | image_job_id, output_refs[], technical_result, advisory_count, usage_ref | W,N,O | REQ-LOGIC-10 |
| image.output_selected | image_job_id, output_ref, selected_by | W,O,A | REQ-LOGIC-10 |
| image.media_registered | image_job_id, cms_media_id, url_ref, derived_sizes[] | W,O,A | REQ-WPA-09 |
| image.featured_assigned | image_job_id, article_ref, cms_media_id, verified_at | W,O,A | REQ-WPA-09 |
| image.generation_failed | image_job_id, stage, error_class, retryable, resume_same_job | W,N,O | REQ-INT-07 |
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
| notification.recipient_resolved | decision_id, notification_class, selected_recipient_refs, fallback_applied, policy_version | O,A | REQ-PRODUCT-11 |
| notification.dispatched | notification_id, recipient_user_ref, channel, decision_ref | O | REQ-PRODUCT-11 |
| notification.popup_presented | notification_id, recipient_user_ref | O | REQ-PRODUCT-11 |
| notification.read | notification_id | O | REQ-PRODUCT-11 |
| notification.acknowledged | notification_id, actor_ref | O,A | REQ-PRODUCT-11 |
| notification.actioned | notification_id, actor_ref, resource_ref, result | O,A | REQ-PRODUCT-11 |
| notification.digest_created | digest_ref, notification_refs, recipient_user_ref, channel | O | REQ-PRODUCT-11 |
| notification.unresolved_action | decision_id, notification_class, fallback_attempted, reason | N,O,A | REQ-PRODUCT-11 |
| office.session_summarized | session_summary_ref, persona_id, task_ref?, unresolved_count, retention_class | O | REQ-AOUI-04, REQ-DATA-08 |
| office.session_summary_deleted | session_summary_ref, actor_ref, deletion_reason | O,A | REQ-DATA-10 |
| platform.self_healed | action, target, flapping? | O,A | REQ-DUR-10 |
| platform.maintenance_performed | action, target | O | REQ-DUR-10 |
| platform.circuit_state_changed | circuit_key, scope_type, scope_ref, previous_state, current_state, reason, probe_at? | O,A | REQ-NFR-07, REQ-TECH-19 |
| platform.bulkhead_throttled | domain_type, domain_ref, capacity_dimension, observed, limit | O,A | REQ-NFR-07/15 |
| platform.runbook_executed | runbook_key, runbook_version, scope_ref, action, result, rollback_result? | O,A | REQ-MEASURE-07 |
| platform.restore_rehearsed | rehearsal_ref, restore_scope, restore_point, measured_rpo, measured_rto, integrity_result | O,A | REQ-NFR-08, REQ-MEASURE-08 |
| platform.deployment_rolled_back | deployment_ref, canary_ref, trigger_metric, checkpoint_resume_result | O,A | REQ-TECH-19 |
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
| publication.envelope_sealed | post_envelope_ref, content_hash, expires_at | W,O | REQ-WPA-09 |
| cms.draft_created | cms_delivery_id, cms_adapter_key, external_post_refs[], edit_url?, preview_url?, resulting_hash, correlation_id | W,O | REQ-INT-05/06/10, REQ-WPA-04, REQ-SCREEN-15 |
| publication.decision_recorded | publication_decision_id, version, operation, decision, reasons[], expires_at?, correlation_id | W,O,A | REQ-LOGIC-04/05 |
| publication.approval_requested | publication_decision_ref, requester_ref, expires_at?, proposed_schedule_at? | N,O,A | REQ-WPA-04 |
| publication.approval_confirmed | publication_decision_ref, confirmation_ref, approver_ref, consent_version? | N,O,A | REQ-WPA-04 |
| publication.approval_rejected | publication_decision_ref, approver_ref, reason_code | N,O,A | REQ-WPA-04 |
| publication.job_scheduled | publication_job_id, publication_decision_ref, cms_delivery_ref, execute_at, timezone, idempotency_key | W,O,A | REQ-WPA-04 |
| publication.job_started | publication_job_id, publication_decision_ref, attempt_count, target_content_hash, idempotency_key | W,O,A | REQ-WPA-04, REQ-TECH-07 |
| publication.job_verification_pending | publication_job_id, external_command_ref?, external_post_ref?, retry_at?, evidence_ref? | W,N,O | REQ-WPA-04, REQ-INT-06 |
| publication.job_failed | publication_job_id, failure_class, retryable, attempt_count, last_error_ref | W,N,O,A | REQ-WPA-04 |
| publication.job_cancelled | publication_job_id, reason_code, cancelled_by_ref?, prior_state | W,N,O,A | REQ-WPA-04 |
| publication.fact_recorded | publication_fact_id, publication_job_ref?, effect_kind, attribution, external_post_ref, canonical_url_ref, resulting_content_hash, effective_at, verified_at, verification_evidence_ref, correlation_id? | N,O,A | REQ-WPA-04, REQ-INT-06, REQ-MEASURE-13/14 |
| publication.attribution_reconciled | prior_publication_fact_ref, new_publication_fact_ref, from_attribution, to_attribution, evidence_refs[], rule_version | O,A | REQ-MEASURE-14 |
| publication.cv_recorded | goal_ref, date, url_ref, count | O | REQ-WPA-05 |
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
| billing.auto_charge_policy_changed | policy_ref, version, enabled, limit_mode, authorization_ref | N,O,A | REQ-BILLING-14 |
| billing.auto_charge_triggered | policy_ref, attempt_ref, trigger_balance, purchase_product_ref, amount | O,A | REQ-BILLING-14 |
| billing.auto_charge_succeeded | attempt_ref, payment_ref, credit_lot_ref, ledger_ref | N,O,A | REQ-BILLING-14 |
| billing.auto_charge_failed | attempt_ref, failure_class, job_hold_refs | N,O,A | REQ-BILLING-14 |
| billing.auto_charge_limit_reached | policy_ref, spent_amount, monthly_limit, job_hold_refs | N,O,A | REQ-BILLING-14 |
| billing.payment_grace_started | subscription_ref, retry_count, next_retry_at, grace_ends_at | N,O,A | REQ-BILLING-13 |
| billing.payment_recovered | subscription_ref, payment_ref, entitlement_restored, duplicate_grant_prevented | N,O,A | REQ-BILLING-13 |
| capacity.snapshot_measured | snapshot_ref, dimension_states, measured_at, aggregation_lag | O | REQ-NFR-15 |
| capacity.limit_reached | dimension_key, scope_ref, state, usage, limit, allowed_actions | N,O,A | REQ-NFR-15, REQ-UPSELL-02 |
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

移行規則: 旧`generation.article_assembled`は`generation.semantic_assembled`、旧`publish.draft_created`は`cms.draft_created`へ読み替えるmigration aliasであり、新規producerは発行しない。旧`publish.decision_recorded / scheduled / approval_requested / approved / rejected / published / updated / failed / cv_recorded`は、Decision、Approval、Job、Fact、CV集計の該当`publication.*` eventへ移行し、新規producerは発行しない。旧`publish.published / updated`をPublication Factへ移行する場合も外部検証証拠、resulting content hash、effective time、帰属が不足する行を`ai_office_publication`へ補完せず`unknown_source / pending`とする。装飾・アイキャッチ・CTA／内部link配置・CMS形式化の完了をSemantic Assemblyへ混在させず、`generation.presentation_assembled`で表す。

監査対象イベント（A印）の正本は監査ログであり、イベント・通知はその写像（REQ-SEC-10 / REQ-PRODUCT-11）。モックイベント（プロトPT-0）は本カタログと同形で作成する。

v1.1改訂: 通知カタログ（REQ-PRODUCT-11）との突合で4種追加（approval_requested / webhook_failed / reconciliation_mismatch / cache_hit_floor_breached）。凍結規則どおりevent_type追加はminorでありエンベロープ・既存typeは不変。

v1.2改訂: 運営お知らせのイベント投入（REQ-PRODUCT-16のイベント由来原則との整合）で `platform.announcement_published` を追加（minor）。エンベロープ・既存typeは不変。

v1.4改訂: Pack版のゴールデン評価・活性化後監視（REQ-ADM-10拡張）に伴い `config.pack_regression_detected` を追加（minor）。

v1.5改訂: 現行SEO業務Lifecycleへの追随として、Site構築・段階開放・big keyword確認、月次計画・週次選択、公開判定、公開更新、1／3／6か月評価のevent typeを追加した。Envelopeと既存typeは変更しない。

v1.6改訂: 13状態の互換keyを維持したまま、`cms_draft`状態内のAssembly／装飾／アイキャッチ／Placement／CMS検証・送信をAgent OfficeとTask Historyで識別するため、stage phase開始・完了eventを追加した。phaseは独立Workflow stateではなく、親stageを飛び越える遷移には使用しない。

v1.3改訂（表記正規化・型不変）: カタログを **1 event_type = 1行** へ正規化した。旧版の複合行（例: `generation.gate_passed / gate_held`）は複数typeの省略表記であり、機械照合の契約としてregex `^[a-z]+\.[a-z_]+$` に行単位で適合しなかったため分割した。event_typeの集合・エンベロープ・payload意味論は不変（新規type追加なし）。分割時、旧複合行で共有されていた消費印・根拠は各行へ引き継ぎ、区別があったもの（N(held)/N(hard)等）は当該行にのみ付した。
