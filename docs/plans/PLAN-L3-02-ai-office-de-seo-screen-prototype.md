---
plan_id: PLAN-L3-02-ai-office-de-seo-screen-prototype
title: AI Office de SEO L3 画面プロトタイプ 計画
kind: design
layer: L3
status: draft
updated_at: 2026-07-02
generates:
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-admin-screen-inventory_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L1-01-ai-office-de-seo-requirements
  requires:
    - PLAN-L3-01-ai-office-de-seo-implementation-design
  blocks: []
---

# PLAN-L3-02 AI Office de SEO 画面プロトタイプ

画面プロトモデルの作り込みに向けた準備。画面一覧（責務・データ・状態・アセット対応）と、プロトタイプ構築計画（範囲・技術方針・モックデータ契約・ビルド順序・検証観点）を定義する。

確定条件（DoD）:

- 全画面が REQ-NAV / REQ-AOUI の責務に対応づき、探索/おすすめの2軸（REQ-AOUI-05）と表示状態（読込中/計算中/空/エラー、REQ-SEC-06）を持つこと。
- モックデータが Source Pack / Snapshot のJSON契約（REQ-PACK-07 / schema.snapshot.*）に準拠すること。プロト用の独自データ形を作らない。
- 画像化するのは背景・キャラ・部屋・装飾・看板枠のみで、テキスト・数値・表・グラフ・フォームはHTML/CSS描画であること（REQ-NAV-05 / REQ-AOUI-03）。
- 通常ビューとAgent Officeビューが同一の詳細コンポーネント・モックAPI・状態を共有すること（REQ-AOUI-01）。
