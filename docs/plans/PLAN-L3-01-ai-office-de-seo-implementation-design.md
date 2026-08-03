---
plan_id: PLAN-L3-01-ai-office-de-seo-implementation-design
title: AI Office de SEO L3 実装設計 計画
kind: design
layer: L3
status: draft
updated_at: 2026-08-03
generates:
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-data-ddl_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-quality-gate-implementation_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-config-registry-defaults_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-handoff-gate_v3.7.md
    artifact_type: design_doc
  - artifact_path: docs/design/ai-office-de-seo/L3-implementation/gate-a/GATE-A-README.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L2-01-ai-office-de-seo-domain-model
  requires:
    - PLAN-L1-01-ai-office-de-seo-requirements
  blocks: []
---

# PLAN-L3-01 AI Office de SEO 実装設計

L2ドメインモデル §7「L3への引き渡し」を成果物へ落とす: 各集約→テーブルDDL、各値/契約→JSONスキーマ（schema.ticket.* / schema.snapshot.* / イベント）、各ゲート→検証実装、しきい値・価格→Config Registry初期値テンプレート。

確定条件（DoD）:

- 全テーブルが境界キー（`tenant_id`、サイトに閉じるものは `site_id`）を持ち、保存禁止データ（REQ-SEC-11）の列が存在しないこと。
- 全契約スキーマが `REQ-PACK-04` のキー命名（`namespace.name.version`）で版固定されること。
- 各Quality Gateが計測実装・しきい値参照（Config Registry）・hard/advisory区分を持つこと（REQ-PACK-09/10）。
- Config初期値がすべて「初期値・要調整」の出典REQ付きで登録され、安全不変条件（REQ-ADM-09）が設定対象外として明記されること。
- 受入トレース: 各成果物セクションが検証対象のREQ-ID/AC-IDを明記すること。
- Site設定→入力／探索→キーワード分析・分類→戦略／診断レポート→月次計画→週次選択→Recommendation→制作／更新→公開判断→1・3・6か月評価の状態とイベントが、L2・L3・画面遷移で一致すること。
- 契約者／サイトオーナー／ユーザー、業務権限、Site付与、内部運営権限を旧Roleへ逆戻りさせないこと。
- 価格、契約周期、利用量、公開条件、CMS接続条件をConfig／契約／画面表示で同じ正本から参照できること。
