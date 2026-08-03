---
plan_id: PLAN-L2-01-ai-office-de-seo-domain-model
title: AI Office de SEO L2 ドメインモデル 計画
kind: design
layer: L2
status: draft
updated_at: 2026-08-03
generates:
  - artifact_path: docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-model_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-invariant-registry_v1.json
    artifact_type: schema
  - artifact_path: docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-requirement-context-map_v1.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L1-01-ai-office-de-seo-requirements
  requires: []
  blocks: []
---

# PLAN-L2-01 AI Office de SEO ドメインモデル

L1要求（REQ）をDDDのドメインモデル（用語一覧・境界づけられたコンテキスト・集約・イベント）へ落とす。

完了条件:

- Site Build、Keyword Market／Site Share、戦略／診断Report、月次Plan、週次Selection、Recommendation Intake、Generation／Rewrite、Publication Decision、1・3・6か月Evaluationを集約・Eventへ写像する。
- 顧客組織、基本権限、業務Permission、Site Assignmentと内部Admin／Manager／Operatorを別Contextとして保持する。
- CMS、Provider、Feature ObjectをAdapter／Context Envelope境界で分離し、WordPressや特定LLMをCore用語へ固定しない。
- L3 Contract／DDLへ渡すすべてのroot、ID、version、正本、履歴、不変条件が定義される。
