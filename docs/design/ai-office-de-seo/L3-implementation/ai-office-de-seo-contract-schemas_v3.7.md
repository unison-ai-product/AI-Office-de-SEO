---
document_id: AOS-L3-CONTRACT-SCHEMAS
title: AI Office de SEO 契約スキーマ設計（L3スケルトン） v3.7
version: 3.7
layer: L3
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO 契約スキーマ設計（L3スケルトン）

L1/L2の契約（Ticket入力・Snapshot出力・Source Extract・ドメインイベント）をJSON Schemaへ確定する。キーは `namespace.name.version` で版固定（REQ-PACK-04。検証: AC-PACK-02）。

分類別L1要求とL2集約を現行の意味正本とし、`REQ-AGENT-*`／`REQ-PACK-*`はTicket・Snapshot・Workflowの詳細契約、その他のv3.7 IDはLegacy Requirement Migration Mapに従う補助参照とする。旧IDだけを根拠にfield、enum、defaultを追加しない。

## 0.0 Recommendation Presentation／Decision Contract

内部候補、判断可能な提示、ユーザー／委任Policyの判断を分離し、`schema.recommendation.presentation.v1`と`schema.recommendation.decision.v1`を正本とする。

```text
schema.recommendation.presentation.v1 {
  decision_eligibility_id, eligibility_version,
  recommendation_id, recommendation_version, tenant_id, site_id,
  source_report_ref, monthly_plan_ref?, weekly_selection_ref?,
  availability_ref, reason_evidence_refs[], allowed_decisions[], adjustable_fields[],
  available_surfaces[], presented_at, expires_at?, contract_hash
}

schema.recommendation.decision.v1 {
  decision_id, decision_version, decision_eligibility_ref,
  recommendation_id, recommendation_version, tenant_id, site_id,
  result(accepted|accepted_with_edit|held|excluded),
  decision_mode(manual|automatic), decided_by, delegation_policy_ref?,
  edit_delta_ref?, intake_ref?, authorization_decision_ref,
  decided_at, idempotency_key, correlation_id
}
```

- `presented`はRecommendation versionが通常ビュー／OfficeのQueueへ判断可能な状態で公開されたDomain factであり、ブラウザ表示・click・既読eventではない。同じ`decision_eligibility_id + eligibility_version`を再表示しても採用率の分母を増やさない。
- `accepted_with_edit`で変更できるのは`adjustable_fields`に宣言された品質、時期、実行枠、補足指示等に限る。Recommendation type、target、主Objective、Keyword Cluster、Action route等の意味境界を変える指示は同じRecommendationの採用として記録せず、provenance付きManual Intakeまたは新Recommendation versionへ分ける。
- `accepted / accepted_with_edit`はfreeze済み`recommendation_intakes`の作成と同一transaction／transactional outboxで確定し、`intake_ref`を必須とする。`held / excluded`はIntakeを作らない。ユーザー判断の`held`と、接続・予算等の実行条件による`recommendation.held`を同じ事実へ潰さない。
- 自動判断は`decision_mode=automatic`、Service actor、`delegation_policy_ref`を必須とし、人間の手動採用に見せない。手動／自動は同じ採用率定義で集計できるが、別系列を保持する。

根拠: `REQ-BUS-05/07`、`REQ-LOGIC-03`、`REQ-KRL-08/09`、`REQ-MEASURE-13`、`REQ-SCREEN-09/18`。

## 0. Recommendation Intake Contract

採用Recommendationから正規Actionへ渡すfreeze済み入力を`schema.intake.recommendation.v1`とする。ActionはAgent Workflowに限らず、軽量Patch、観測、保護Policy、Domain Command、ユーザー対応、終端を含む。画面、Office、Executorが独自に入力を再構築してはならない。

```text
{
  intake_id, intake_version,
  recommendation_id, recommendation_version,
  tenant_id, site_id, requested_by,
  source_report_ref?, monthly_plan_ref?, weekly_selection_ref?,
  recommendation_type, recommendation_subtype?, target_ref,
  objective_ref, keyword_cluster_ref,
  search_intent, article_purpose,
  reason_evidence_refs[],
  cta_policy_ref?, internal_link_plan_ref?,
  quality_tier, budget_estimate,
  protection_policy, availability,
  dependencies[], score_components,
  route{class, action_key, target_service, requires_agent_job},
  accepted_at, frozen_at, contract_hash, correlation_id
}
```

- `recommendation_type`: `new_article / rewrite / cta_patch / internal_link_patch / request_input / observe / protect / no_action / structure_change_proposal / technical_escalation / automation_change`。判定側aliasとroutingは`ai-office-de-seo-recommendation-action-routing-map_v1.md`へ従う。Coreが実行できない施策は、実行Workflowへ偽装せずユーザー対応Taskへ変換する。
- `recommendation_subtype`: `refresh / index_diagnostic / merge / canonical_candidate`等の細分を保持する。Workflow名や画面表示名をtypeへ混入させない。
- `target_ref`: Keyword Cluster、記事、Site、CTA/CV Goal等の型付き参照を持つ。
- `reason_evidence_refs[]`: 表示した推薦理由と実行入力が同じ根拠を指すための参照である。
- `availability`: 入力Sourceの存在・鮮度・欠損理由を保持し、欠損値をLLMで補完しない。
- `route`: Recommendation Action Routing Mapの正規Actionから決定論的に解決する。`observe / protect / no_action / request_input / structure_change_proposal / technical_escalation / automation_change`へ記事生成Jobを偽造しない。
- 採用時にversionをfreezeする。実行前Preflightで権限、予算、接続、重複、カニバリ、保護、鮮度を再判定し、変化があれば元Recommendationを改変せず`held / superseded`へ遷移させる。
- `contract_hash`確定後はfieldを更新しない。Preflightの再判定、保留、再開、route結果は別のExecution Decision／eventとして追記し、Intakeを現在値へ書き換えない。
- ユーザー手動起動はRecommendation採用と偽装せず、次の`schema.intake.manual.v1`へ正規化し、同じPreflightへ通す。
- ユーザー指定Taskは維持し、衝突時は依存・影響・推奨順序を提示する。自動予定だけを`needs_review / held / superseded`へ戻せる。月次計画変更は実行済み施策を変更しない。

```text
schema.intake.manual.v1 {
  intake_id, intake_version, manual_request_id,
  tenant_id, site_id, requested_by, requested_at,
  action_key, target_ref, user_request_ref,
  objective_ref, keyword_cluster_ref?, search_intent?, article_purpose?,
  reason_evidence_refs[], cta_policy_ref?, internal_link_plan_ref?,
  quality_tier, budget_estimate, protection_policy, availability,
  dependencies[], route, frozen_at, contract_hash, correlation_id
}
```

手動Intakeは、ユーザーが指定していない目的・Keyword・根拠を「Recommendation済み」として捏造しない。不足fieldは`input_required`、機械分析で導出したfieldはprovenance付きで提示し、ユーザー確認後にfreezeする。Ticketの`intakeRef`はRecommendation IntakeまたはManual Intakeの型付き参照を受ける。

根拠: `REQ-KRL-08/09`、`REQ-DATA-06/07`、`REQ-LOGIC-03`、`REQ-SCREEN-09/15/18`、Agent要求マップ。

## 0.0.0 Execution Admission Contract

freeze済みIntakeを実行してよいかを判定するPreflight正本を`schema.execution.admission.v1`とする。Recommendation採用、Intake、実行許可、Credit予約、Dispatchを一つの状態へ丸めない。

```text
schema.execution.admission.v1 {
  admission_id, admission_version, tenant_id, site_id,
  intake_ref, route{class, action_key, target_service, requires_agent_job},
  action_subject_ref,
  state(requested|evaluating|reservation_pending|ready|held|rejected|expired|consumed|superseded),
  checks{
    authorization_decision_ref, authorization_epoch,
    entitlement_snapshot_ref, input_availability_ref, source_freshness_ref,
    duplicate_assessment_ref?, cannibalization_assessment_ref?, protection_decision_ref?,
    connection_readiness_refs[], capacity_snapshot_ref, kill_switch_version
  },
  quote{
    estimate_ref, estimate_version, billing_mode(billable|non_billable),
    credit_unit, expected_credit, reserved_max_credit, fixed_customer_credit,
    pricing_version, cost_model_version, valid_until
  },
  reservation_ref?, reason_codes[], required_actions[], return_context,
  config_versions[], evaluated_at?, ready_at?, consumed_at?,
  idempotency_key, correlation_id
}
```

- `requested → evaluating → reservation_pending → ready → consumed`を有償Actionの正常経路とする。非課金Actionは`billing_mode=non_billable`を明示して`reservation_pending`を省略できるが、架空の0 credit reserveを作らない。回復可能な不足は`held`、Policy上実行不能は`rejected`、見積・入力・認可等のversion更新は旧Admissionを`superseded`として新versionで再評価する。
- `ready`は短時間有効な実行許可Snapshotであり、Intakeを書き換えない。有償Actionの`ready`には同じAdmission／estimate versionを参照する成功済み`reservation_ref`を必須とする。Provider有償呼出し、外部write、Agent Job、Patch適用は`ready`を一度`consumed`へ遷移させた後だけ開始する。
- `consumed`と`recommendation.dispatched`またはManual Action dispatchは同一transactional outbox境界で一度だけ確定する。dispatch直前にauthorization epoch、Kill Switch、Connection、Capacity等の可変Gateを再検証し、変化時は消費せず`held / superseded`へ戻す。
- reserveの冪等性はTicketではなく`admission_id + admission_version + estimate_version`で保証する。Agentを使わないPatch／Policy／Domain Commandにも同じAdmissionを利用できる。同一Jobのretry、checkpoint再開、限定Repairは既存Reservationを参照し、新しいAdmission／reserveを作らない。
- 複数Recommendationの一括操作は各IntakeにAdmissionを作り、合算表示はProjectionとする。一件の不足で他項目を実行済みにせず、Batch合計だけをreserve正本にしない。

根拠: `REQ-LOGIC-11`、`REQ-SEC-12`、`REQ-BILLING-04`、`REQ-AGENT-10`、`REQ-SCREEN-15/18`。

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

## 0.0.2.1 Site構築・分析進捗Contract

Site導入からReport開放までを`schema.site.build_progress.v1`とする。

```text
{
  build_id, version, tenant_id, site_id, site_mode(new|existing),
  setup{site_profile_ref, industry_refs[], cross_axis_ref?, cms_profile_ref,
    gsc_connection_ref?, keyword_upload_ref?},
  readiness{
    site_identified{state, site_identity_ref, diagnosed_routes[], evidence_ref, verified_at},
    analysis_ready{state, source_refs[], eligible_cluster_count, analysis_version?, reason_codes[]},
    content_read_ready{state, article_scope_ref, eligible_article_count, snapshot_coverage,
      snapshot_version?, reason_codes[]},
    delivery_ready[]{operation, state, connection_profile_version,
      capability_snapshot_ref, permission_evidence_ref?, reason_codes[]}
  },
  input_conditions[]{kind, state, source_ref?, required_for[]},
  stages[]{stage_key, state, processed, total?, coverage?, availability,
    started_at?, updated_at, completed_at?, next_release_at?},
  big_keyword_review{candidate_refs[], accepted_refs[], excluded_refs[], user_note?, state}?,
  report_refs[], recommendation_ready, required_user_actions[], correlation_id
}
```

- `site_identified`は対象Siteの同一性、到達性、利用可能経路を確認した状態であり、CMS writeまたは公開権限の成立を意味しない。
- 新規SiteはSite設定と`site_identified`成立後にbig keyword方向確認を行い、採用・除外・追加を経て市場探索へ進む。CMS write未成立でも市場探索は停止しない。
- 既存SiteはGSCまたはKeyword uploadを分析開始条件とし、CMS記事を利用できる場合は記事対応へ統合する。
- `analysis_ready`はSite／分析version単位で保持する。`content_read_ready`は記事範囲の集約表示であり、各リライト開始時に対象記事の有効なArticle Read Snapshotを再検証する。Site全体の単一boolで全記事を許可しない。
- `delivery_ready`は`create_draft / update_post / upload_media / publish`等のoperation単位で保持し、副作用直前にConnection Profile version、Capability、Permissionを再検証する。あるoperationの成立を別operationへ流用しない。
- `partially_available`を許し、完了領域からReportを開放する。全体未完了を空画面または完了として扱わない。
- `cms.connection_profile_verified`は接続対象と診断結果を確定したOnboarding milestoneであり、`delivery_ready`の代替ではない。記事送信は別途operation別CMS write capabilityを必要とし、分析可能または接続Profile確認済みであることを送信可能へ読み替えない。

根拠: `REQ-BUS-02〜06`、`REQ-LOGIC-02`、`REQ-INT-05/06`、`REQ-SCREEN-02/18`。

## 0.0.2.2 月次計画・週次実行Contract

月次計画を`schema.plan.monthly.v1`、週次選択を`schema.plan.weekly_selection.v1`とする。

```text
schema.plan.monthly.v1 {
  monthly_plan_id, version, tenant_id, site_id, target_month,
  source_report_ref, objective, objective_mode,
  focus_cluster_refs[], directional_allocation[], budget_allocation,
  weekly_limits, assumptions[], availability, state,
  confirmation_mode(manual|automatic), confirm_deadline?, confirmed_by?, confirmed_at?,
  supersedes_ref?, created_at
}

schema.plan.weekly_selection.v1 {
  weekly_selection_id, version, monthly_plan_ref, week_start,
  candidate_recommendation_refs[], selected_items[]{recommendation_ref, order, reason},
  constraints{credit, capacity, dependencies, protection, quality},
  execution_mode(manual|automatic), state,
  confirmed_by?, confirmed_at?, recalculated_at?, correlation_id
}
```

- 目的は達成保証または固定本数ではなく、Site単位の月次方向性と記事・施策配分を表す。
- 月途中の目的変更は新versionを作り、実行済み項目を変更せず未実行Recommendationだけを再評価する。
- ユーザー指定Taskを維持し、必要な先行記事、内部link、予算・週次枠への影響を相談として返す。システム自動予定だけを後方移動または要確認へ戻す。
- 週末・月末の未実行項目は単純繰越せず、維持、順位変更、監視、失効を再判定する。

根拠: `REQ-BUS-06/07`、`REQ-LOGIC-01/03`、`REQ-SCREEN-09`、`REQ-UJ-09`。

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

### 0.0.3.1 Article Read Snapshot Contract

本文変更を伴うリライト、記事置換、Article Summary再生成、公開表示検証へ渡す取得結果を`schema.snapshot.article_read.v1`へ固定する。

```text
{
  article_read_snapshot_id, schema_version,
  tenant_id, site_id, article_ref, url_ref,
  connection_profile_ref, read_route_ref, source_kind,
  fetched_at, source_modified_at?,
  public_state(published|draft|private|redirected|not_found|unknown),
  title, meta?, heading_tree,
  content_ref, content_hash, structure_hash, size_bytes,
  availability{body, headings, public_state, freshness, reason_codes[]},
  workspace_ref, expires_at, destroyed_at?,
  correlation_id, provenance_ref
}
```

- `content_ref`はSite／jobへscopeした暗号化一時objectだけを指し、本文全文をDB、event、log、Notification、Recommendationへ格納しない。
- 本文変更を伴う`rewrite`／`article_replacement`では`availability.body / headings / public_state`がすべて利用可能で、`content_hash`と`expires_at`が有効なSnapshotを必須とする。不成立時は`read_connection_required`または`input_required`で保留する。
- Article Summaryだけで候補説明はできるが、Article Read SnapshotなしにEdit Plan、Repair Ticketまたは記事置換Ticketを発行しない。
- 取得経路の切替、source更新、hash変更、TTL切れで旧Snapshotを再利用しない。CMS保存値は編集入力、公開表示はSEO評価、Plugin Snapshotは変更通知という用途別正本を`source_kind`とprovenanceで区別する。
- job完了、取消、期限切れ後は一時本文を破棄し、残すのはSnapshot ID、hash、取得時刻、availability、provenance、destroyed_atだけとする。

根拠: `REQ-DATA-15`、`REQ-PRODUCT-04/20`、`REQ-BUS-02`、`REQ-LOGIC-02/12/13`、`REQ-INT-09`、`REQ-RWR-01〜06`。

## 0.0.4 Agent Office Interaction・Proposal Contract

Office操作は、LLMを使わない選択式Actionと、自由文を型付き変更案へ正規化するProposalに分ける。どちらも同じ`schema.office.interaction.v1`を使い、確認済み変更だけを所有BCの共通Commandへ渡す。

```text
{
  interaction_id, tenant_id, site_id, user_id,
  persona_key, room_key, task_ref, workflow_ref,
  stage, status, waiting_reason?, progress?, credit_used?,
  result_summary?, analysis_refs[], evidence_refs[],
  input_kind, action_key?, free_text?, llm_used, llm_reason?,
  proposal?{proposal_id, version, target_ref, operation, base_version,
    normalized_patch, impact, estimate, required_permission,
    reversibility, status, confirmed_by?, command_ref?, result_ref?},
  normal_view_target{screen_key, resource_ref, tab_key?, filter?},
  authorization_decision_ref, source_event_version,
  correlation_id, observed_at, expires_at
}
```

- `stage`、`status`、`waiting_reason`、`progress`、`credit_used`、成果値は各正本event／Projectionから取得し、Officeで別計算しない。
- `input_kind=choice`は選択式ポップアップから`action_key`を決定論Serviceへ渡し、LLMを呼ばない。
- `input_kind=free_text`でも、既知のActionへ決定論的に解決できる場合はLLMを呼ばない。曖昧な意図解釈、非定型の意味説明、自由文からの構造化が必要な場合だけ`llm_used=true`と理由を記録する。
- Proposalは影響、Credit／Capacity、認可、取消・復元可否を確認できない限り確定不可とする。自由文をDB、CMS、Billing、Policyへ直接送らない。
- 詳細分析は共通Projectionを使い、条件変更はProposalへ分離する。
- Persona、部屋、Office入室は認可根拠にならない。

根拠: `REQ-AOUI-01/04/07`、`REQ-SCREEN-18`、Agent要求マップ。

### `schema.office.session_summary.v1`

```text
{
  session_summary_id, tenant_id, site_id, persona_id, user_id,
  task_ref?, conversation_started_at, conversation_ended_at,
  summary, unresolved_questions[], confirmed_command_refs[], proposal_refs[],
  source_message_count, retention_class,
  expires_at?, user_visible, deleted_at?, schema_version
}
```

- Officeペルソナとの一般会話は、生messageをSite永久記憶へ一律昇格せず、終了時の短いSession Summaryを次回文脈に使用する。
- `persona_id`を必須とし、plannerとの戦略相談、content_writerへの記事指示、support_agentの問い合わせを同じ「Agent会話」として混在させない。
- Summaryは業務正本ではない。確定変更は`confirmed_command_refs`、記事指示はTask/User Order、SupportはSupport Ticket、Executor成果はSnapshotを参照する。
- Summaryから設定、権限、公開状態、学習Factを暗黙更新しない。ユーザーは閲覧・削除でき、保持期間はretention policyで解決する。

根拠: Agent Requirements Map §3.0／§7.1、`REQ-DATA-08/10`、`REQ-ACCESS-17`。

## 0.0.5 UI Availability Decision Contract

利用可否を`schema.ui.availability.v1`とする。

```text
{
  decision_id, tenant_id, site_id?, principal_ref?, resource_ref, operation?,
  state, primary_reason,
  reasons[]{class, code, source_ref, resolvable_by, retry_at?},
  available_capabilities[], unavailable_capabilities[],
  coverage?, progress?, entitlement_ref?, authorization_decision_ref?,
  actions[]{kind, label_key, target_ref?},
  evaluated_at, policy_version, expires_at?
}
```

- `state`: `blocked / degraded / preview / partial / pending / ready`。
- primary reasonの優先順はUI Availability State Mapへ従うが、全reasonsを保持する。
- `out_of_scope`は対象存在を漏らすpayloadを返さない。
- incidentをPlan lock、permission denialをcredit不足、connection不足をdata不足へ正規化しない。
- 通常ビュー、Office、API action、worker Preflightが同じdecisionまたは同じ入力Policyを使用する。

根拠: `REQ-SCREEN-01/03/15/18`、`REQ-ACCESS-14〜16`、UI Availability State Map。

## 0.0.6 Featured Image Pattern・Job Contract

Patternを`schema.image.featured_pattern.v1`、生成を`schema.image.generation_job.v1`とする。

```text
schema.image.featured_pattern.v1 {
  pattern_id, version, tenant_id, site_id, name, status, is_default,
  style_profile_ref,
  canvas{aspect, cms_size_refs[], background, safe_area},
  regions[]{region_id, kind, bounds, layer, visible, fixed, constraints},
  slots[]{slot_id, source_kind, region_id, transform_policy},
  palette, forbidden_elements[], fixed_elements[], variable_elements[],
  variation{mode, allowed_attributes[], ranges},
  logo{asset_ref?, region_id?, outer_margin?, min_size?, preserve_aspect, contrast_rule, composition_capability_ref?},
  reference_image_refs[], created_by, created_at, supersedes_ref?
}

schema.image.generation_job.v1 {
  image_job_id, idempotency_key, pattern_ref, style_profile_ref,
  article_ref, article_slots, cms_size_ref, quality,
  model_route_ref, prompt_version, reference_hashes[],
  estimate_ref, credit_reservation_ref,
  state, outputs[]{output_ref, content_hash, technical_checks[], advisories[], selected},
  media_registration{state, cms_media_id?, url_ref?, derived_sizes[], error?},
  usage, actual_cost_ref, correlation_id, created_at
}
```

- variation modeは`fixed / controlled / creative`。
- Patternのversion作成とwireframe previewはImage Jobを発行しない。
- stateは`estimated / generating / generated / selected / rejected / optimized / media_registering / media_registered / featured_assigned / blocked / failed`。
- `blocked`は技術的不成立またはPattern設定不一致、主観差はadvisoryとする。
- ユーザー再生成は新しいimage_job_idとreserve、障害再開は既存jobのcheckpointを使用する。

根拠: `REQ-LOGIC-10`、`REQ-DATA-12`、`REQ-INT-07`、Featured Image Pattern接続マップ。

## 0.0.7 Notification Recipient Decision Contract

通知解決を`schema.notification.recipient_decision.v1`とする。

```text
{
  decision_id, event_ref, tenant_id, site_id?, resource_ref?,
  notification_class, required_action?, severity,
  candidates[]{user_id, membership_ref, visible, actionable, subscription_ref?, excluded_reason?},
  recipients[]{user_id, reason, channels[], delivery_mode, fallback},
  mandatory_policy_ref?, dedupe_key, digest_key?,
  unresolved_action, evaluated_at, policy_version
}
```

- `notification_class`: `action_required / continuity / task_result / recommendation / system_notice / informational`。
- recipientはサーバー側MembershipとAuthorizationから導出し、event payloadの任意宛先を採用しない。
- action requiredでactionable recipientが0ならSite owner、契約・支払はcontract holderへfallbackし、`unresolved_action=true`を保持する。
- 通知状態は`unread / read / acknowledged / actioned / archived`。readだけで業務eventを完了させない。
- in-app Centerを先に作成し、popup／email失敗でCenter記録をrollbackしない。

根拠: `REQ-SCREEN-19`、`REQ-PRODUCT-11/21`、Notification Recipient Routing Map。

## 0.0.8 Billing Overview・AutoCharge・Capacity Contract

顧客画面とOfficeが独自に残高、利用権、Capacityを合成せず、次のread modelを使用する。

### `schema.billing.overview.v1`

```text
{
  tenant_id, as_of,
  subscription{subscription_id, state, plan_key, price_catalog_version,
    plan_config_version, billing_cycle, period_start, period_end, renewal_at,
    cancel_at?, tax_exclusive_amount, tax_inclusive_amount, currency},
  entitlement_snapshot_ref,
  credit{available, reserved, committed_this_period,
    lots[]{lot_ref, source, remaining, expires_at}, next_expiry?},
  auto_charge{policy_ref?, state, enabled, threshold?, purchase_product_ref?,
    purchase_amount?, spent_this_period, monthly_limit_mode, monthly_limit_amount?},
  payment{state, next_retry_at?, grace_ends_at?, payment_update_url_ref?},
  capacity_snapshot_ref, availability
}
```

### `schema.billing.auto_charge_policy.v1`

```text
{
  policy_id, tenant_id, version, status,
  enabled, balance_threshold, purchase_product_ref, purchase_amount,
  monthly_limit{mode: finite|unlimited, amount?},
  spent_period, spent_amount, authorization_decision_ref,
  step_up_ref?, confirmation_version?, idempotency_key, updated_at
}
```

### `schema.capacity.snapshot.v1`

```text
{
  snapshot_id, tenant_id, site_id?, measured_at, aggregation_lag,
  dimensions[]{dimension_key, usage, soft_limit, hard_limit, unit,
    utilization, forecast_reach_at?, state, sellable, add_on_entitlement_ref?},
  plan_config_version, source_refs[], availability
}
```

規則:

- 残高はLedgerから、機能はEntitlement Snapshotから、CapacityはDimension別集計から導出し、Client計算を認可・Preflightへ使用しない。
- 自動チャージ有効化、無制限、上限引上げはstep-upと再確認を要求する。Agent会話はPolicy Proposalまでで決済を確定しない。
- payment failureまたはlimit reached時は同一idempotency keyの購入を再発行せず、Jobを保留して選択肢を返す。
- Price Catalog／Plan Configurationの新版を既存Subscription／Lotへ遡及適用しない。

根拠: `REQ-BILLING-01〜16`、`REQ-NFR-15`、課金・Capacity画面接続マップ v1。

## 0.0.8.1 Generation Outcome Contract

QA済み生成成果の提供事実を`schema.generation.outcome.v1`へ固定する。これはCMS下書き、公開／更新結果ではなく、生成サービスが契約上の成果をユーザーへ利用可能にした事実の正本である。

```text
{
  generation_outcome_id, version, tenant_id, site_id,
  workflow_ref, intake_ref, recommendation_ref?, correlation_id,
  presentation_snapshot_ref, content_hash,
  output_vault_ref, output_vault_expires_at,
  deliverable_provided_at, credit_commit_ref,
  created_at
}
```

- `presentation_snapshot_ref`のQA完了・seal、content hash一致、Output Vaultからの表示・copy・download可能性が成立した時だけ作成する。
- 同一Intake／成果version／content hashに対して一意とし、再表示、download、CMS再送で新しいOutcomeまたはcredit commitを作らない。
- ユーザーが別成果を求める再生成は、元Outcomeを`parent_generation_outcome_ref`で参照する新しいGeneration Job、見積、reserve、Outcomeとする。同一Jobの障害再試行、checkpoint再開、限定Repairを再生成へ付け替えない。
- CMS未接続、送信失敗、承認待ち、公開失敗でもOutcomeを取消さない。保証期間内に製品側原因で成果を利用不能にした場合は、台帳を上書きせず調整eventの判断へ接続する。
- 本Schemaへ本文、HTMLまたはblock payloadを格納せず、期限付きOutput Vault参照だけを保持する。

根拠: `REQ-BILLING-04`、`REQ-INT-10`、`REQ-DATA-03`、`REQ-WPA-14`。

## 0.0.8.2 CMS Delivery Contract

Generation Outcome確定後のCMS write再診断、下書き作成、反映確認、再送または持ち出しを`schema.cms.delivery.v1`へ固定する。記事生成の完了とCMS送信成功を同じ状態にしない。生成成果提供、CMS下書き、公開／更新も同じ状態にしない。

```text
{
  cms_delivery_id, version, tenant_id, site_id,
  workflow_ref, intake_ref?, recommendation_ref?, correlation_id,
  operation(new_draft|rewrite_draft|article_replacement_draft|lightweight_patch|media_upload),
  generation_outcome_ref,
  presentation_snapshot_ref, post_envelope_ref?, content_hash,
  connection_profile_ref, connection_profile_version,
  write_route_ref?, write_capability_ref?, authorization_decision_ref?,
  idempotency_key,
  state(prepared|connection_required|permission_required|delivering|draft_created|
    verification_pending|verified|failed_retryable|failed_terminal|carried_out|cancelled),
  hold{reason_codes[], required_user_actions[], resume_from?, retry_after?}?,
  cms_result{external_post_refs[], edit_url?, preview_url?, media_refs[], resulting_hash?}?,
  verification{state, checked_at?, evidence_ref?, error_class?}?,
  carryout{format(html|markdown|json), artifact_ref, expires_at}?,
  attempt_count, last_error_ref?, created_at, updated_at, completed_at?
}
```

- `prepared`到達時点で生成成果は完成しており、接続・権限不足を生成失敗へ変換しない。
- `prepared`は、参照するGeneration Outcomeが成立し、同じcontent hashの成果をOutput Vaultから期限内に利用できる場合だけ到達する。生成credit確定はGeneration Outcomeの事実であり、Deliveryが再計算または再commitしない。
- `connection_required / permission_required`ではPresentation SnapshotとPostEnvelopeをTTL付き一時領域へ保持し、再接続後に同じ`idempotency_key`で`resume_from`から再開する。再生成や二重creditを要求しない。
- 下書き作成APIの成功だけで`verified`にせず、外部post参照、反映hash、必要なMedia参照を確認する。検証待ち・cache反映待ちと失敗を分ける。
- 持ち出しは`carried_out`として履歴とRecommendation／Job相関を維持する。持ち出したことをCMS公開・更新成功として扱わない。
- リライト／記事置換は`verified`後も`schema.publication.decision.v1`のユーザー承認を必須とする。新規記事は15記事条件とAutomation Policyへ従う。

根拠: `REQ-INT-10`、`REQ-LOGIC-03/08/09/10`、`REQ-INT-01/05/06/09`、`REQ-SCREEN-15/16`、`REQ-WPA-04/09/12`、画面遷移図§2。

## 0.0.9 公開判定・実行・反映Fact Contract

CMS下書き以降の判定を`schema.publication.decision.v1`とする。

```text
{
  publication_decision_id, version, tenant_id, site_id,
  article_ref, workflow_ref, intake_ref?, correlation_id,
  operation(new_publish|rewrite_update|article_replacement|lightweight_patch),
  cms_draft_ref, content_hash, diff_ref?, quality_result_ref,
  approval_policy{first_new_article_gate, approved_new_article_count,
    approved_new_article_counter_ref, automation_enabled, consent_version?,
    hard_gate_state, rewrite_requires_approval},
  authorization_decision_ref, budget_ref, connection_capability_ref,
  decision(approval_required|automation_allowed|approved_for_execution|blocked|rejected),
  reasons[], confirmations[]{kind, actor_ref, confirmed_at, consent_version?},
  decided_at, expires_at?
}
```

判定後の予約・実行・検証を`schema.publication.job.v1`とする。

```text
{
  publication_job_id, version, tenant_id, site_id,
  publication_decision_ref, cms_delivery_ref, generation_outcome_ref?,
  article_ref, operation(new_publish|rewrite_update|article_replacement|lightweight_patch),
  target_content_hash, correlation_id, idempotency_key,
  schedule{mode(immediate|scheduled), execute_at?, timezone?},
  state(pending|scheduled|executing|verification_pending|verified|
    failed_retryable|failed_terminal|cancelled),
  attempt_count, external_command_ref?, last_error_ref?,
  created_at, updated_at, completed_at?
}
```

CMSで検証できた公開／更新事実と帰属を`schema.publication.fact.v1`とする。

```text
{
  publication_fact_id, version, tenant_id, site_id, article_ref,
  effect_kind(new_publish|content_update|status_change|lightweight_patch),
  attribution(ai_office_publication|external_change|unknown_source),
  publication_job_ref?, publication_decision_ref?, cms_delivery_ref?,
  recommendation_ref?, intervention_ref?, correlation_id?,
  external_post_ref, canonical_url_ref, resulting_content_hash,
  cms_status, effective_at, verified_at, verification_evidence_ref,
  approval_evidence_ref?, source_observation_refs[], rule_version,
  reconciliation{state(confirmed|pending), retry_until?, missing_sources[]}
}
```

- Decisionは副作用前入力に対する不変versionであり、公開結果、失敗、外部post参照を後書きしない。条件変化または承認成立時は新versionを作る。
- Jobは予約確定、実行、反映検証を追跡する。予約から実行までに認可、Automation同意、hard gate、Kill Switch、接続、対象hash、公開時間等が変化した場合は副作用直前にDecisionの新versionを作り、古いDecision参照のまま実行しない。`scheduled`、CMS API受付、外部post ID取得だけを`verified`または公開成功としない。同じ副作用は同一idempotency keyで再開する。
- Factは公開表示またはCMS状態の外部検証後だけ作る。AI Office Command／Decision／Delivery／Jobとcontent hashが相関した場合だけ`ai_office_publication`とし、相関なしは`external_change`、証拠不足は`unknown_source / pending`とする。時刻の近さだけで帰属を推定しない。
- `PublicationJob.state=verified`と`publication.fact_recorded`は同じ外部検証結果からtransactional outboxで接続し、JobだけverifiedのままFactが欠落しないよう再送・照合する。同じSite、外部post、effect kind、resulting content hash、effective time、verification evidenceからFactを冪等化し、Webhook再送やpolling重複で15記事count・Activation・実績を二重計上しない。
- `unknown_source`は再照合できるが、既存Factを上書きせず新versionまたはreconciliation eventで確定する。`external_change`と`unknown_source`を15件解放、Activation、AI Office公開実績へ算入しない。

- 最初の15件へ数えるのは、本システムで新規作成し、完成記事の人間承認証拠を持ち、`effect_kind=new_publish / attribution=ai_office_publication / reconciliation=confirmed`のPublication Factが成立した記事だけとする。予約、下書き、API受付、外部変更、帰属確認中、既存記事、外部記事、リライトは除外する。
- 15件到達後も、権限者の版付き同意、対象範囲、予算、品質、公開時間、停止条件が成立した場合だけ新規記事の自動投稿を許可する。
- リライトと記事置換はCMS下書きまで自動化できるが、公開記事への更新はユーザー承認を必須とする。
- hard gate例外は同一権限者の二段階確認と版付き同意を別confirmationとして記録する。別人2名を要求しない。

根拠: `REQ-BUS-08/09`、`REQ-LOGIC-04/05`、`REQ-SCREEN-04/15`、`REQ-WPA-04`。

## 0.0.10 公開・更新後評価Contract

公開後の評価を`schema.evaluation.intervention.v1`とする。記事に単一の評価時計を持たせず、介入種別ごとの評価Laneを同じ台帳へ束ねる。

```text
{
  evaluation_id, version, tenant_id, site_id, article_ref,
  article_change_history_ref, correlation_id,
  article_purpose, search_intents[], keyword_cluster_refs[], cv_goal_refs[],
  lanes[]{
    lane_id, lane_type(seo_content|cta_cv|internal_link|awareness),
    intervention_ref, origin_publication_fact_ref, origin_at,
    supersedes_lane_ref?, state, availability,
    schedule{
      cadence(one_three_six_month|monthly_and_cumulative),
      checkpoints[]{window, due_at, state}
    },
    observations[]{window_start, window_end, source_freshness,
      seo?{acquired_keywords, ranked_keywords, primary_secondary_fit,
        position_distribution, impressions, clicks, market_adjustment,
        aio_paid_adjustment, availability},
      conversion?{monthly, cumulative, transition_rate?, cv_count?,
        previous_url_single_hop?, availability},
      internal_link?{graph_delta, transitions, destination_contribution?, availability},
      awareness?{cluster_coverage, branded_signal?, recognition_contribution?, availability},
      outcome, reasons[], next_action?},
    confounders[]{change_ref, change_class, effective_at, affected_metrics[], rule_version}
  }
}
```

- 評価起点は新規／リライトという制作時の呼称ではなく、各Laneへ接続した検証済みPublication Factの`effective_at`とする。予約、CMS API受付、下書き作成、帰属確認中だけでは評価を開始しない。
- `ai_office_publication`は施策評価の主介入、実質的な`external_change`は交絡要因、`unknown_source`は帰属確認中として扱う。外部変更だけからAI Office施策の評価を新規作成しない。
- 成功の第一条件は、記事へ割り当てた主＋補助Keyword集合が意図どおり順位を獲得することとする。CV目的の記事はCV実績を追加評価するが、CVなしだけで異常としない。
- `seo_content` Laneだけが1／3／6か月checkpointを持つ。title、主要見出し、検索意図へ影響する本文の実質変更は、旧Laneと結果を保持したまま新しい`seo_content` Laneを開始し、`supersedes_lane_ref`で接続する。
- `cta_cv`、`internal_link`、`awareness` Laneは変更月と起点からの累積を評価する。CTAまたは内部linkだけの変更で`seo_content` Laneをreset・supersedeしない。本文変更にCTA変更も含まれる場合だけ、それぞれのLaneへ同じFactを別介入として接続する。
- 実質的な外部変更は影響するLaneへconfounderを付与するが、AI Office介入の新Laneを作らず、既存評価結果を上書きしない。軽微変更は記事履歴だけへ残す。
- Recovery Backupの最長3か月は復元可能期間であり、3か月・6か月の評価保持期間ではない。Backup削除後も履歴・集計・6か月評価を継続し、復元可能と表示しない。
- 市場需要・表示回数の変化、AIO・広告出現率を外部要因として分離する。急変は即時施策へせず要監視へ送る。
- Siteが直近1か月1,000 click未満の領域は予測値を作らず、予測可能記事とデータ不足記事を分離する。

根拠: `REQ-BUS-09/10`、`REQ-LOGIC-06〜09`、`REQ-MEASURE-01〜04`、`REQ-KRL-*`。

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

- actionは少なくとも`read / create / update / delete / execute / approve / write_draft / schedule / publish / connect / purchase / export / delegate_access`を区別する。`delegate_access`は内部AdminがManagerへ期限付きScopeを発行・取消する管理操作であり、顧客Userへのなりすましを表さない。
- 顧客基本権限、業務Permission bundle、内部Roleを同じassignment namespaceへ格納しない。
- Recommendation採用時の判定結果はIntakeへ参照できるが、後続副作用の権限をfreezeする証明には使わない。job起動、Agent tool、CMS write、公開時に現在policyで再判定する。
- UI／Officeはreason codeを平易な表示へ変換するだけで、allow／denyを計算しない。

根拠: `REQ-ORG-03〜07`、`REQ-ACCESS-14〜18`、認可・業務操作接続マトリクス。

## 1. schema.ticket.*（Ticket入力）

正本フィールド（REQ-PACK-01 / REQ-PACK-11.7）: `{ workflowKey, intakeRef, promptPackKeys[], sourceNeedKeys[], schemaKeys[], returnTo, userPrompt, content_role_map }`。Ticketは本文やRecommendationの複製を内包せず、freeze済み`schema.intake.recommendation.v1`を`intakeRef`で参照する。

- 共通エンベロープ: `{ ticket_id, correlation_id, tenant_id, site_id, job_id, stage, workflowKey, workflow_version, intakeRef, promptPackKeys[], sourceNeedKeys[], schemaKeys[], returnTo, userPrompt?, content_role_map[], issued_at, idempotency_key }`。`userPrompt`は任意の動的suffixであり、固定Pack・境界・品質条件を上書きしない。
- `schema.ticket.writing.v1`: 共通＋`{ outline_contract_ref, outline_node_id, meaning_unit_plan_ref, adjacent_context{previous_summary?, next_brief?}, terminology_lock_ref }`。
- `schema.ticket.qa.v1`: 共通＋`{ assembled_snapshot_ref, gate_keys[], review_lens_keys[], required_evidence_refs[] }`。
- `schema.ticket.repair.v1`: 共通＋`{ base_snapshot_ref, qa_issue_refs[], patch_targets[{unit_id, allowed_operations[], max_change}], preserve_refs[], repair_attempt }`。patch target外を変更しない。
- `schema.ticket.automation.v1`: 共通＋`{ action(draft/schedule/publish_event/update_patch), post_envelope_ref?, slot_assignment_ref?, publication_decision_ref?, schedule_at? }`。
- `content_role_map[]`: `{ content_ref, role(requirement/reference), destination(system_constraint/source_context/user_suffix), source_key?, precedence, immutable }`。外部取得物は`reference/source_context`、固定制約は`requirement/system_constraint/immutable=true`とし、同一contentを両roleへ割り当てない。
- 全stageで`correlation_id`をRecommendation→Intake→Ticket→Snapshot→Publication→評価まで維持する。

## 2. schema.snapshot.*（Snapshot出力）

- `schema.snapshot.research_brief.v1` / `schema.snapshot.outline_contract.v1`（MeaningUnitPlan・headingStructurePackKeyを含む、REQ-PACK-18）。
- `schema.snapshot.writing.v1`: `{ url_hash, sections[{h2_role, meaning_units[], content_ref}], self_check, meta }`（content_refは一時領域参照。本文を恒久テーブルへ入れない）。
- `schema.snapshot.qa.v1`（REQ-PACK-11.7の正本）: gates[{gate_key, kind, verdict, score, evidence_refs[]}] / metrics{keyword_density, readability[{metric_key,value,advisory}], competitor_term_coverage, original_element_count, near_duplicate_similarity, citation_ratio, title_body_match, inter_unit_redundancy, term_consistency, ai_phrase_density} / ymyl / hard_gate_block / anonymization_note / truncation_note / notes。日本語可読性指標の選定前は`readability[].advisory=true`とする。
- Snapshot共通エンベロープ: `{ snapshot_id, correlation_id, tenant_id, site_id, job_id, ticket_id, schema_key, schema_version, state(complete/unmet), created_at, self_check, meta{tokens, credits, model_route_ref?}, content_refs[] }`。
- `state=unmet`では`unmet{ reason_code, guard_type(budget/timeout/repair_limit/hard_gate/connection/permission/kill_switch/input_missing), failed_checks[], retryable, resume_from?, required_action?, estimate_ref? }`を必須とする。未達を空の成功Snapshotとして返さない。

検証: AC-PACK-01/03/10, AC-AGENT-11。

## 3. Source Extract（REQ-PACK-07 カタログの型確定）

REQ-PACK-07の「主なJSON項目」列をJSON Schemaへ確定する。内部は `SiteSandboxContext` スコープ、外部は予算・TTL配下（検証: AC-PACK-05/07, AC-TENANT-07）。

- 全Source Extract共通: `{ source_key, schema_version, tenant_id?, site_id?, scope_ref, observed_at, freshness{fresh_until,state}, availability{state(available/partial/unavailable/stale), reason_code?, retry_after?}, provenance_refs[], truncation_note?, anonymization_note?, payload }`。内部Sourceは`tenant_id/site_id`必須、公共外部Sourceは顧客識別子を持たない。欠損値を0・空文字・推測値で補完しない。
- GSC系は匿名化・行上限・期間・dimension欠落を`anonymization_note/truncation_note/availability`へ記録する。AIO・AI回答面はProvider未対応、未観測、取得失敗、対象面なしを別`reason_code`で返す。
- `source.keyword.intent_cluster.v1`: payload=`{ clusters[{ cluster_id, representative, intent{primary,secondary[]}, funnel_stage?, members[{keyword_ref,role,confidence}], evidence_refs[], calculation_version }] }`。membersを空にしない。
- `source.keyword.synonym_related.v1`: payload=`{ entries[{ keyword_ref, synonyms[{keyword_ref?,text,confidence,source}], related[{keyword_ref?,text,relation,confidence,source}], locale, version }] }`。自然な言い換えと関連概念を区別し、同義と未確認の語をsynonymへ昇格しない。

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
- `new_article_workflow.v2`の状態順は`intake_gate → sandbox_seal → keyword_intent → serp_research → site_strategy → outline_architect → section_brief → draft_writer → self_evolution → quality_gate → generation_outcome → cms_delivery_approval → cleanup`とする。`self_evolution`は互換keyで、Meaning Unitの`semantic_assembly`と限定接続改善を担う。`generation_outcome`のphaseは`presentation_assemble → decorate → featured_image → placement → cms_validate → deliverable_provided`、`cms_delivery_approval`のphaseは`cms_prepare → cms_deliver → cms_verify → preview → approval_or_automation`とする。`intake_gate / sandbox_seal / quality_gate / cms_delivery_approval`を強制gateとし、各stateは`on_enter bindings`、成功遷移、保留遷移、失敗遷移、checkpoint、stop_guardsを持つ。旧`new_article_workflow.v1`の`cms_draft / preview_approval`は履歴読取時だけ`generation_outcome / cms_delivery_approval`へ対応付けるmigration aliasとし、新規Jobへ発行しない。Layer Aにはこのinstance全体をcanonical JSON＋hash＋versionで格納する。

- `quality_gate`の通過前に装飾・画像・CMS送信を開始しない。`cms_draft`は本文完成物を入力に、Site装飾設定、ユーザー選択した独自part、Featured Image Pattern、CTA／内部link Placement、CMS Capabilityを適用する。初期画像Scopeはアイキャッチだけとし、CMS検証と下書き作成結果を得てから`preview_approval`へ進む。
- `catalog.article_type.v1`: `{ key, version, required_purpose_elements[], optional_purpose_elements[], allowed_heading_flows[], intent_constraints[], gate_keys[] }`。
- `catalog.heading_flow.v1`: `{ key, version, nodes[{role, min, max, allowed_purpose_elements[]}], transition_rules[] }`。
- `catalog.purpose_element.v1`: `{ key, version, purpose, required_inputs[], output_shape, evidence_rules[], placement_rules[] }`。
- `catalog.quality_gate.v1`: `{ gate_key, version, kind(hard/advisory/modifier), signals[], threshold_refs[], evidence_rules[], repair_routes[] }`。
- `prompt.pack.v1`: `{ key, version, scope(global/site/workflow/stage/transition), structure_ref, constraint_refs[], few_shots[{role(positive/negative),gate_tags[],example_ref}], token_budget, content_hash }`。本文例は上限付き参照とし、Pack改版後も旧versionを再現できる。

検証: AC-PACK-09/10/11, AC-AGENT-05。

## 5. ドメインイベントスキーマ

L2 §5 のイベント（GenerationJobStarted / OutlineContractFrozen / QualityGateEvaluated / PatchApplied / PostEnvelopeSealed / CreditReserved / KillSwitchEngaged 等）に共通エンベロープを定義する。

- 共通: `{ event_id, event_type, occurred_at, tenant_id, site_id?, job_id?, actor, payload, schema_version }`。
- 用途: Observability購読（REQ-SEC-13）、Agent Officeの活動可視化（REQ-AOUI-04。キャラ状態＝待機/作業/完了/エラーはこのイベントから導出）、監査。
- payload Catalogは少なくとも次を固定する。`site.build_*={build_run_id,stage,stage_state,released_capabilities[],progress}`、`keyword.report_*={report_id,report_type,source_version,status}`、`plan.monthly_*={plan_id,period,version,status}`、`plan.weekly_execution_selected={selection_id,week,selected_item_refs[],deferred_item_refs[]}`、`recommendation.*={recommendation_id,version,state,reason_codes[]}`、`job/stage/ticket/snapshot.*={workflow_key,stage,ticket_id?,snapshot_id?,state,reason_code?}`、`quality.gate_*={snapshot_id,gate_key,verdict,hard_gate_block}`、`publication.decision_recorded={publication_decision_id,version,operation,decision,reasons[],correlation_id}`、`publication.job_*={publication_job_id,publication_decision_ref,state,idempotency_key,attempt_count?,external_command_ref?}`、`publication.fact_recorded={publication_fact_id,publication_job_ref?,effect_kind,attribution,external_post_ref,resulting_content_hash,effective_at,verified_at,verification_evidence_ref,correlation_id?}`、`publication.attribution_reconciled={prior_publication_fact_ref,new_publication_fact_ref,from_attribution,to_attribution,evidence_refs[],rule_version}`、`evaluation.intervention_*={evaluation_id,lane_id,lane_type,origin_publication_fact_ref,origin_at,cadence,window?,state,outcome?}`、`billing.credit_*={ledger_entry_id,lot_id?,amount,unit,state}`、`connection.*={connection_id,capability,state,reason_code?}`。payloadに本文、secret、Provider生responseを含めない。画面モックも同じevent typeとpayload versionを使用する。

### 5.1 Tracker ingressと集計契約

`schema.tracker.event.v1`は業務Domain Event共通Envelopeとは分離した公開ingress契約とする。

```text
{
  site_id, event_id, event_type(page_view|transition|cta|conversion), occurred_at,
  current_url, previous_url?, cta_id?, goal_id?, occurrence_id?,
  consent_state, tracker_version, definition_version
}
```

`occurrence_id`は同一CV到達の再読込・戻る操作を処理TTL内で重複排除する場合だけ使用し、永続tableへ保存しない。受信契約は追加fieldを既定拒否し、user ID、session ID、cookie ID、IP永続値、複数ページpath、フォーム値、本文、DOM断片を許可しない。集計出力は `schema.measurement.daily.v1` とし、`day / site_id / metric_kind / current_url / previous_url? / cta_id? / goal_id? / count / excluded_count / missing_count / definition_version`を持つ。`previous_url`を連結して経路を復元しない。

## 6. 契約検証（REQ-SEC-13）との対応

| 検証 | 対象契約 | 失敗時 |
|---|---|---|
| Ticket Schema / content role | `schema.ticket.*.v1` | `blocked/schema_invalid` |
| PackDispatch / cache prefix | `prompt.pack.v1`、workflow binding | `blocked/pack_unavailable` |
| Source completeness / sandbox | Source Extract共通Envelope、各`source.*` | `blocked`または`partial`。捏造補完禁止 |
| Output Snapshot | `schema.snapshot.*.v1`共通Envelope | `unmet/schema_invalid` |
| QA / forbidden output / hallucinated source | `schema.snapshot.qa.v1` | hardまたはadvisory判定を保持 |
| RepairInstruction | `schema.ticket.repair.v1` | target外変更を拒否 |
| token／credit budget | Ticket meta、Preflight／reserve参照 | 費用発生前に保留 |
| Dynamic Post Schema | `schema.ticket.automation.v1`、PostEnvelope、CMS Capability | CMS副作用前に拒否 |

検証: AC-SEC-12。
