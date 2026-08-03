---
document_id: AOS-L3-CONTRACT-SCHEMAS
title: AI Office de SEO 契約スキーマ設計（L3スケルトン） v3.7
version: 3.7
layer: L3
kind: design
status: skeleton
updated_at: 2026-07-05
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO 契約スキーマ設計（L3スケルトン）

L1/L2の契約（Ticket入力・Snapshot出力・Source Extract・ドメインイベント）をJSON Schemaへ確定する。キーは `namespace.name.version` で版固定（REQ-PACK-04。検証: AC-PACK-02）。

## 0. Recommendation Intake Contract

採用RecommendationからAgentic Workflowへ渡す正規入力を`schema.intake.recommendation.v1`とする。画面、Office、Executorが独自に入力を再構築してはならない。

```text
{
  recommendation_id, recommendation_version,
  tenant_id, site_id, requested_by,
  recommendation_type, recommendation_subtype?, target_ref,
  objective_ref, keyword_cluster_ref,
  search_intent, article_purpose,
  reason_evidence_refs[],
  cta_policy_ref?, internal_link_plan_ref?,
  quality_tier, budget_estimate,
  protection_policy, availability,
  dependencies[], score_components,
  accepted_at, correlation_id
}
```

- `recommendation_type`: `new_article / rewrite / cta_patch / internal_link_patch / request_input / observe / protect / no_action / structure_change_proposal / technical_escalation / automation_change`。判定側aliasとroutingは`ai-office-de-seo-recommendation-action-routing-map_v1.md`へ従う。Coreが実行できない施策は、実行Workflowへ偽装せずユーザー対応Taskへ変換する。
- `recommendation_subtype`: `refresh / index_diagnostic / merge / canonical_candidate`等の細分を保持する。Workflow名や画面表示名をtypeへ混入させない。
- `target_ref`: Keyword Cluster、記事、Site、CTA/CV Goal等の型付き参照を持つ。
- `reason_evidence_refs[]`: 表示した推薦理由と実行入力が同じ根拠を指すための参照である。
- `availability`: 入力Sourceの存在・鮮度・欠損理由を保持し、欠損値をLLMで補完しない。
- 採用時にversionをfreezeする。実行前Preflightで権限、予算、接続、重複、カニバリ、保護、鮮度を再判定し、変化があれば元Recommendationを改変せず`held / superseded`へ遷移させる。
- ユーザー手動起動も同Schemaへ正規化して由来を保持し、同じPreflightへ通す。
- ユーザー指定Taskは維持し、衝突時は依存・影響・推奨順序を提示する。自動予定だけを`needs_review / held / superseded`へ戻せる。月次計画変更は実行済み施策を変更しない。

根拠: `REQ-KRL-08/09`、`REQ-DATA-06/07`、`REQ-LOGIC-03`、`REQ-SCREEN-09/15/18`、Agent要求マップ。

## 0.0.1 Lightweight Patch Contract

CTA・内部linkの限定更新入力を`schema.patch.action.v1`、結果を`schema.patch.result.v1`とする。

```text
schema.patch.action.v1 {
  patch_action_id, patch_type,
  recommendation_ref?, intake_ref?, correlation_id,
  tenant_id, site_id, target_article_ref, target_part_ref,
  before_hash, proposed_value_ref,
  article_purpose, search_intent,
  cv_goal_ref?, destination_article_ref?,
  reason_evidence_refs[], approval_batch_ref?,
  permission_action, cms_capability_ref,
  measurement_policy, requested_at
}

schema.patch.result.v1 {
  patch_action_id, cms_job_ref, status,
  applied_part_ref?, resulting_hash?, revision_ref?,
  error_class?, retryable?, verified_at?,
  seo_evaluation_reset, metric_evaluation_started_at?,
  correlation_id
}
```

- `patch_type`: `add_cta / replace_cta_part / replace_cta_destination / move_cta / remove_cta / add_internal_link / replace_internal_link / remove_internal_link`。
- `status`: `scheduled / applying / applied / failed / conflict`。`applied`はCMS応答と反映確認の両方を必要とする。
- CTA Patchの`seo_evaluation_reset`はfalse固定とし、CTA/CV評価起点だけを更新する。内部link Patchも本文・見出し・titleを変更しない限りfalseとする。
- 承認Batchは複数`patch_action_id`の集合であり、結果をBatch単位へ丸めない。
- 接続文の意味修正が必要な場合だけ既存Repair Ticketを参照し、専用Writing Ticketを作らない。

根拠: `REQ-WPA-12/13`、`REQ-KGA-09/19`、`REQ-RWR-08/09`、軽量Patch接続マップ。

## 0.0.2 Keyword Report Contract

新規戦略と既存診断の共通Envelopeを`schema.report.keyword.v1`とする。

```text
{
  report_id, version, report_type, tenant_id, site_id,
  status, analysis_period?, generated_at,
  market_snapshot_ref, site_cluster_refs[],
  source_availability[], coverage,
  calculation_versions[], sections[],
  user_adjustments[]{cluster_ref, state, reason?, adjusted_by, adjusted_at},
  supersedes_ref?, next_actions[]{kind, target_ref, available}
}
```

- `report_type`: `new_site_strategy / existing_site_diagnosis`。
- `status`: `draft / partially_available / ready / user_adjusted / superseded`。
- 新規戦略のsectionsはmarket overview、distribution、site fit、priority cluster、structure proposal、production order、monthly allocationを必須とする。
- 既存診断のsectionsはmarket baseline、cluster share、acquired／unacquired keyword、asset state、diagnostics、external factors、action mix、monthly orderを必須とする。
- `coverage`は分析済みCluster／記事／Queryと未分析範囲を分ける。partialをcompleteとして表示しない。
- MonthlyPlanとRecommendationは`source_report_ref=report_id+version`を保持し、画面からReportを再解釈しない。

根拠: `REQ-BUS-02/04/05/06`、`REQ-SCREEN-02/09/18`、Keyword Report接続マップ。

## 0.0.3 CMS Connection Profile Contract

Siteごとの接続結果を`schema.cms.connection_profile.v1`へ固定する。

```text
{
  connection_profile_id, version, tenant_id, site_id,
  cms{kind, version?, site_url_ref, authenticated, diagnosed_at},
  capabilities[]{key, status, evidence_ref?, confidence, checked_at},
  discovery_routes[]{adapter_key, state, health_ref},
  read_routes[]{adapter_key, role(primary/standby/disabled), health_ref, selected_reason},
  write_routes[]{operation, adapter_key, permission_state, capability_ref},
  editor_profile{editor_kind, post_type, builder_ref?, block_namespaces[], confidence},
  assurance{preview, revision, verification, backup_entitlement},
  measurement{tracker_state, event_contract_version?},
  capacity{article_count, initial_import, monthly_changes, storage, processing, plan_ref},
  state, required_user_actions[], policy_version, updated_at
}
```

- capability statusは`full / degraded / update_required / unsupported / unknown`。
- `required_user_actions`は再接続、権限確認、Plugin更新、手動取込等の業務操作を返し、内部Adapter優先度を含めない。
- read route変更でwrite permissionを変更しない。`permission_state=unknown`は書込み不可とする。
- ProfileのPolicy versionと選択理由から同じ入力でroutingを再現できる。

記事取得結果は共通Article Snapshot Contractへ、投稿結果はPublication Contractへ、軽量更新は`schema.patch.result.v1`へ接続する。

根拠: `REQ-INT-05/06/09`、`REQ-WPA-01〜14`、CMS接続・取得・投稿経路マップ。

## 0.0.4 Agent Office Conversation・Proposal Contract

Office会話を質問と状態変更へ分け、変更案を`schema.office.proposal.v1`へ正規化する。

```text
{
  proposal_id, version, tenant_id, site_id, conversation_ref,
  persona_key, room_key, source_view_ref,
  intent_kind, target_ref, operation,
  base_state_ref, base_version,
  requested_change, normalized_patch,
  evidence_refs[], assumptions[], missing_inputs[],
  impact{affected_refs[], plan_delta?, schedule_delta?, recommendation_delta?, risk_notes[]},
  estimate{credit, monetary?, capacity?, calculation_version, availability},
  authorization{action, decision_ref?, required_permission, step_up_required},
  reversibility{kind, rollback_ref?, cancel_until?},
  status, confirmed_by?, confirmed_at?, command_ref?, result_ref?,
  correlation_id, created_at, expires_at
}
```

- `intent_kind`: `question / exploration / change_proposal / new_task_proposal / task_revision_proposal`。質問・探索はProposal確定を要求せず、状態変更Commandを発行しない。
- `status`: `draft / input_required / estimated / awaiting_confirmation / confirmed / dispatched / applied / failed / cancelled / superseded / expired`。
- `base_version`不一致時は古い差分を適用せず、再計算して`superseded`または再確認へ戻す。
- `normalized_patch`は対象Domainの既存Command Schemaへ変換可能な型付き差分であり、自由会話文をそのままDB、CMS、Policyへ送らない。
- 影響、credit、Capacityまたは権限を確定できない場合、`availability`と不足入力を表示して確定不可とする。
- 確定時と副作用直前に`schema.authorization.decision.v1`を使用する。persona、部屋、Office入室は認可根拠にならない。
- 通常ビューとOfficeは同じCommand Result eventを購読し、別々の業務状態を保存しない。

根拠: `REQ-AOUI-01/04/07`、`REQ-AGENT-06/09`、`REQ-SCREEN-15`、Agent要求マップ。

## 0.1 Authorization Decision Contract

すべての実行面で使用する認可入力・出力を`schema.authorization.decision.v1`として固定する。

```text
input {
  principal{type, id, authentication_strength},
  action,
  resource{type, id, tenant_id, site_id?},
  context{
    active_organization_id, membership_id?,
    base_role?, business_permissions[], site_assignment_mode?,
    delegated_policy_ref?, plan_entitlement_ref?,
    budget_ref?, connection_scope_ref?, job_id?, policy_version
  }
}
output {
  decision(allow/deny/step_up_required/approval_required),
  applied_permissions[], scope, reason_codes[],
  policy_version, expires_at?, audit_ref?
}
```

- actionは少なくとも`read / create / update / delete / execute / approve / write_draft / schedule / publish / connect / purchase / export / impersonate`を区別する。
- 顧客基本権限、業務Permission bundle、内部Roleを同じassignment namespaceへ格納しない。
- Recommendation採用時の判定結果はIntakeへ参照できるが、後続副作用の権限をfreezeする証明には使わない。job起動、Agent tool、CMS write、公開時に現在policyで再判定する。
- UI／Officeはreason codeを平易な表示へ変換するだけで、allow／denyを計算しない。

根拠: `REQ-ORG-03〜07`、`REQ-ACCESS-14〜18`、認可・業務操作接続マトリクス。

## 1. schema.ticket.*（Ticket入力）

正本フィールド（REQ-PACK-01 / REQ-PACK-11.7）: `{ workflowKey, intakeRef, promptPackKeys[], sourceNeedKeys[], schemaKeys[], returnTo, userPrompt, content_role_map }`。Ticketは本文やRecommendationの複製を内包せず、freeze済み`schema.intake.recommendation.v1`を`intakeRef`で参照する。

- 対象: `schema.ticket.writing.v1` / `schema.ticket.repair.v1` / `schema.ticket.automation.v1` / QA用。
- TODO(L3): 各ステージ別の追加フィールド（Writing: 対象MeaningUnitPlan参照、Repair: QA issue参照とpatch target、Automation: slot assignment参照）。全stageで`correlation_id`からRecommendation→Intake→Ticket→Snapshot→Publication→評価を追跡できること。
- TODO(L3): `content_role_map` の型（requirement / reference の割当先、REQ-AGENT-07）。

## 2. schema.snapshot.*（Snapshot出力）

- `schema.snapshot.research_brief.v1` / `schema.snapshot.outline_contract.v1`（MeaningUnitPlan・headingStructurePackKeyを含む、REQ-PACK-18）。
- `schema.snapshot.writing.v1`: `{ url_hash, sections[{h2_role, meaning_units[], content_ref}], self_check, meta }`（content_refは一時領域参照。本文を恒久テーブルへ入れない）。
- `schema.snapshot.qa.v1`（REQ-PACK-11.7で確定済みの正本）: gates[{gate_key, kind, verdict, score, evidence}] / metrics{keyword_density, flesch_reading_ease, passive_ratio, competitor_term_coverage, original_element_count, near_duplicate_similarity, citation_ratio, title_body_match, inter_unit_redundancy, term_consistency, ai_phrase_density} / ymyl / hard_gate_block / anonymization_note / truncation_note / notes。
- TODO(L3): 未達理由付きSnapshot（停止ガード到達・ハード失敗、REQ-AGENT-01）の共通エンベロープ。

検証: AC-PACK-01/03/10, AC-AGENT-11。

## 3. Source Extract（REQ-PACK-07 カタログの型確定）

REQ-PACK-07の「主なJSON項目」列をJSON Schemaへ確定する。内部は `SiteSandboxContext` スコープ、外部は予算・TTL配下（検証: AC-PACK-05/07, AC-TENANT-07）。

- TODO(L3): 各キーの必須/任意、欠損表現（GSC匿名化・切り捨て注記、AIO availability理由。捏造補完しない: REQ-WPA-10 / REQ-SRC-09）。
- TODO(L3): v3.7.1で追補した `source.keyword.intent_cluster.v1` / `source.keyword.synonym_related.v1` の確定。

### 3.1 Keyword Market・Share Source

`source.keyword.map.v1`は次の4層を区別し、同名`cluster_id`だけで結合しない。

```text
{
  site_keyword_universe_version,
  public_market_refs[{public_cluster_id, cluster_version, locale, device, provenance_refs[]}],
  site_clusters[{
    site_cluster_id, projection_version,
    public_cluster_refs[], representative,
    members[{site_keyword_id, keyword_asset_ref?, role, source_type, user_state}],
    market{size, value, seasonality, aio_pressure, paid_pressure, competition,
           traffic_potential_range, availability, observed_at, calculation_version},
    share{observed{value, coverage_note, confidence},
          estimated{range, method, confidence},
          article_distribution[], trend, period, calculation_version},
    intent_mix, cluster_state, market_state,
    assigned_articles[], strategy{}, provenance[], user_confirmed, version
  }]
}
```

- `source_type`は`public_asset / gsc_query / user_upload / site_extract / product_customer_seed / competitor_observation`を区別する。
- `keyword_asset_ref`なしのSite固有語を許可し、global asset IDを捏造しない。
- Observed Share、Estimated Share、Article Shareを別fieldにし、unknownを0へ変換しない。
- Public Market Cluster改版時も、Siteの`user_confirmed`境界・代表語・割当を無条件上書きしない。

根拠: Keyword Market・Site Share接続マップ、`REQ-DATA-10/11`、`REQ-KRL-01〜10`。

## 4. Workflow / Pack 型（REQ-PACK-11 の型確定）

- workflow型: `{ workflow_key, flow_pack_keys[], stages[{stage, phase_bindings, transitions[{to, transition_bindings}], loop{converge, stop_guards[]}}], permissions[], bindings_ref }`。
- TODO(L3): `new_article_workflow` の13状態（実務工程9＋強制ゲート4、REQ-AGENT-09）を本型の具体インスタンスとして記述し、Layer A格納形式を確定。
- TODO(L3): article_type / heading_flow / purpose_element / quality_gate / prompt.* の各型のJSON Schema化（REQ-PACK-11.1〜11.5）。few-shotエントリの `{role(positive/negative), gate_tags[], example_ref}`（REQ-PACK-12）。

検証: AC-PACK-09/10/11, AC-AGENT-05。

## 5. ドメインイベントスキーマ

L2 §5 のイベント（GenerationJobStarted / OutlineContractFrozen / QualityGateEvaluated / PatchApplied / PostEnvelopeSealed / CreditReserved / KillSwitchEngaged 等）に共通エンベロープを定義する。

- 共通: `{ event_id, event_type, occurred_at, tenant_id, site_id?, job_id?, actor, payload, schema_version }`。
- 用途: Observability購読（REQ-SEC-13）、Agent Officeの活動可視化（REQ-AOUI-04。キャラ状態＝待機/作業/完了/エラーはこのイベントから導出）、監査。
- TODO(L3): イベント別payload。画面プロト（PLAN-L3-02）のモックイベントは本エンベロープに準拠させ、本番接続時に差し替え可能にする。

## 6. 契約検証（REQ-SEC-13）との対応

Ticket Schema / PackDispatch / Source Extract completeness / Output Snapshot schema / QA result / RepairInstruction / forbidden output detection / hallucinated source detection / token budget / cache prefix hygiene / sandbox boundary / Dynamic Post Schema compliance の各検証を、本書のスキーマIDに対応づける。TODO(L3): 検証ルール→スキーマの対応表。検証: AC-SEC-12。
