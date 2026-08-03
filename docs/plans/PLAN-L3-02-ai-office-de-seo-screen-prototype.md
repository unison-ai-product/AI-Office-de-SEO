---
plan_id: PLAN-L3-02-ai-office-de-seo-screen-prototype
title: AI Office de SEO 画面検証プロトタイプ 計画
kind: design
layer: L3
lifecycle_stage: pre_l3_ui_validation
status: draft
updated_at: 2026-08-03
generates:
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-admin-screen-inventory_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-recommendation-ui-validation_v1.md
    artifact_type: ui_validation_spec
  - artifact_path: docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-standard-office-ui-validation_v1.md
    artifact_type: ui_validation_spec
dependencies:
  parent: PLAN-L1-01-ai-office-de-seo-requirements
  requires:
    - PLAN-L2-01-ai-office-de-seo-domain-model
  blocks: []
---

# PLAN-L3-02 AI Office de SEO 画面検証プロトタイプ

`PLAN-L3-02`のIDと`L3-ui-prototype/`パスは既存参照との互換性のため維持するが、工程上はL3実装詳細確定前の`pre_l3_ui_validation`である。この名称を根拠にL3確定後の工程へ戻さない。

画面プロトモデルを、L3実装詳細を確定する前の要求検証面として作る。L1要求とL2の業務ライフサイクルを画面一覧・画面遷移・操作可能なfixtureへ反映し、通常ビューとOfficeビューを実際に触って不足・過剰・責務ずれを抽出する。検証で生じた差分をL1/L2へ戻してから、L3のAPI・DDL・Event・Config・採用技術を確定する。既存L3文書はモック形状と安全境界の暫定参照であり、画面検証の結果を制約する凍結仕様ではない。

確定条件（DoD）:

- 全画面が REQ-NAV / REQ-AOUI の責務に対応づき、探索/おすすめの2軸（REQ-AOUI-05）と表示状態（読込中/計算中/空/エラー、REQ-SEC-06）を持つこと。
- モックデータはL2 entity・状態・相関を保持し、既存Source Pack / Snapshot案を暫定利用する。画面検証で必要な情報が不足した場合は独自fixtureへ閉じ込めず、L1/L2差分として記録してからL3契約候補を改版する。
- 画像化するのは背景・キャラ・部屋・装飾・看板枠のみで、テキスト・数値・表・グラフ・フォームはHTML/CSS描画であること（REQ-NAV-05 / REQ-AOUI-03）。
- 通常ビューとAgent Officeビューが同一の詳細コンポーネント・モックAPI・状態を共有すること（REQ-AOUI-01）。
- 新規Siteと既存Siteの導入分岐、REST APIの書込Capability、キーワード戦略／診断レポート、月次計画、週次実行予定、承認待ち、公開・更新後評価が画面遷移に存在すること。
- 通常ビューは簡単操作、Officeビューは同じ業務状態の詳細操作・根拠・Agent窓口を提供し、別の業務データを持たないこと。
- プロトタイプ実装の更新はL1・L2・画面遷移の整合監査後に開始し、画面検証結果をL1/L2へ反映した後にL3実装設計のDoDへ渡すこと。
