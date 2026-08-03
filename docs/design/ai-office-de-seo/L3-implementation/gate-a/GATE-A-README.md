---
document_id: AOS-L3-GATE-A-README
title: Gate A 成果物一覧
version: 1.1
layer: L3
kind: index
status: active
updated_at: 2026-08-03
---

# Gate A 成果物（画面検証前の暫定baseline）

| # | 成果物 | 状態 | 主な消費者 |
|---|---|---|---|
| A-1 | gate-a-1-event-envelope_v1.md | current-draft | 実装・画面 |
| A-2 | gate-a-2-repository-scope-api_v1.md | current-draft | 実装 |
| A-3 | gate-a-3-office-layout_v1.md ＋ office_layout.initial.json | current-draft | 画面 |
| A-4 | gate-a-4-design-tokens_v1.md ＋ design-tokens.css | current-draft | 画面 |
| A-5 | gate-a-5-contract-freeze_v1.md | current-draft | 実装・画面 |

利用条件: 画面検証ではA-3/A-4と必要最小限のevent／fixture形状を暫定利用し、L3全体の確定を開始条件にしない。通常ビュー／Officeの検証findingをL1/L2へ反映した後、A-1〜A-5を再監査して実装用versionを固定する。画面を暫定Contractへ無理に合わせず、tenant／Site分離、default-deny、append-only台帳、保存禁止等の安全不変条件だけは常に維持する。特定の開発ツールやモデルを引渡先として固定しない。
