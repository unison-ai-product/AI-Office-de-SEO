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
  recommendation_type, target_ref,
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

- `recommendation_type`: `new_article / rewrite / cta_patch / internal_link_patch / observe / technical_escalation / automation_change`。Coreが実行できない施策は、実行Workflowへ偽装せずユーザー対応Taskへ変換する。
- `target_ref`: Keyword Cluster、記事、Site、CTA/CV Goal等の型付き参照を持つ。
- `reason_evidence_refs[]`: 表示した推薦理由と実行入力が同じ根拠を指すための参照である。
- `availability`: 入力Sourceの存在・鮮度・欠損理由を保持し、欠損値をLLMで補完しない。
- 採用時にversionをfreezeする。実行前Preflightで権限、予算、接続、重複、カニバリ、保護、鮮度を再判定し、変化があれば元Recommendationを改変せず`held / superseded`へ遷移させる。
- ユーザー手動起動も同Schemaへ正規化して由来を保持し、同じPreflightへ通す。

根拠: `REQ-KRL-08/09`、`REQ-DATA-06/07`、`REQ-LOGIC-03`、`REQ-SCREEN-09/15/18`、Agent要求マップ。

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
