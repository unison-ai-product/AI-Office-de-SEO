---
document_id: AOS-L3-GATE-A5-CONTRACT-FREEZE
title: Gate A-5 Ticket/Snapshot契約 必須フィールド凍結 v1
layer: L3
status: frozen-v1
updated_at: 2026-07-05
---

# Gate A-5: schema.ticket.* / schema.snapshot.* 必須フィールド凍結 v1

進化規則（凍結）: 必須フィールド集合は各`.v1`で固定。任意フィールド追加=minor、必須追加・意味変更・削除=`.v2`新設（REQ-PACK-04の版固定と両立）。`content_ref`は一時領域URI（TTL束縛・恒久保存禁止、REQ-SEC-11）。

## schema.ticket.base.v1（全ステージ共通・必須）
`workflowKey / promptPackKeys[] / sourceNeedKeys[] / schemaKeys[] / returnTo / userPrompt / content_role_map`（REQ-PACK-01。本文非内包）

ステージ別の追加必須:
| schema | 追加必須 |
|---|---|
| ticket.writing.v1 | `outline_node_id, meaning_unit_plan_ref` |
| ticket.repair.v1 | `qa_issue_refs[], patch_targets[{unit_id}]` |
| ticket.automation.v1 | `action(draft/schedule/publish_event), post_envelope_ref?` |

## snapshot共通エンベロープ（必須）
`snapshot_id / job_id / ticket_id / schema_key / created_at / self_check / meta{tokens, credits}`

| schema | 追加必須 | 備考 |
|---|---|---|
| snapshot.research_brief.v1 | `keyword_scope, intents[], differentiation[], sources_used[{source_key, content_role}]` | 外部はデータ扱い（REQ-AGENT-07） |
| snapshot.outline_contract.v1 | 下記JSON Schema | freeze対象・変更禁止（REQ-PACK-18） |
| snapshot.writing.v1 | `url_hash, sections[{h2_role, meaning_units[{unit_id, purpose_element}], content_ref}]` | 本文はcontent_refのみ |
| snapshot.qa.v1 | REQ-PACK-11.7の全項目（gates/metrics/ymyl/hard_gate_block/anonymization_note/truncation_note） | 既凍結を再確認 |
| snapshot.repair.v1 | writing.v1と同形＋`patched_unit_ids[], patch_reason_refs[]` | 未指定unit変更禁止 |

## snapshot.outline_contract.v1（JSON Schema要旨・凍結）
```json
{"$id":"aos.schema.snapshot.outline_contract.v1",
 "required":["url_or_keyword_scope","article_type_key","heading_flow_key","nodes","frozen_at","contract_hash"],
 "nodes":[{"required":["node_id","h2_role","heading_structure_pack_key","meaning_unit_plans"],
   "meaning_unit_plans":[{"required":["unit_id","purpose_element"],"properties":{"constraints":[]}}]}]}
```
サブエージェントはnodesを変更しない（REQ-PACK-18）。Repairは`patch_targets`のunitのみ。

## 進化ノート
- v1.1追補（任意追加=minor規則内）: `snapshot.outline_contract.v1` に任意フィールド `terminology_lock[]`（記事内で固定する用語・表記のリスト、`REQ-AGENT-11`）、`snapshot.qa.v1` のmetricsに `inter_unit_redundancy` / `term_consistency` を追補。必須集合・既存意味論は不変。
- v1.2追補（任意追加=minor規則内）: `snapshot.outline_contract.v1` の `writing_methods` に `primary_variant?`（`REQ-PACK-19`のvariant）、`snapshot.qa.v1` のmetricsに `ai_phrase_density`（`REQ-PACK-09`のhuman_voiceゲート）を追補。必須集合・既存意味論は不変。

## 消費者への確約
W2/W3画面はこの形のみに依存してモック実装可。QA表示は`snapshot.qa.v1`のgates/metricsをそのまま描画（追加加工の禁止＝単一ソース、REQ-PACK-12）。
