---
document_id: AOS-L3-GATE-A4-DESIGN-TOKENS
title: Gate A-4 デザイントークン v1
layer: L3
version: 1.0
kind: contract
status: current-draft
updated_at: 2026-07-05
---

# Gate A-4: デザイントークン v1

Design.md §6のブリーフ（ダークネイビー＋ネオンブルー/パープル、2テーマ、猫型ロボット、テキストは常にHTML/CSS）を実装するトークン。`design-tokens.css`（同梱）が現行baseline。要求・画面監査後にセマンティックトークン名を版固定し、実値の微調整はminorとして扱う。

現行要求では通常ビューをRecommendation中心の簡単操作面、Officeを玄人向け詳細分析・運用・Agent操作面とし、両者は同じProjection、認可、Domain Commandを使う（`REQ-DESIGN-01・09〜11`、`REQ-SCREEN-18・19`）。本書は色・文字・状態表現のbaselineであり、旧モックの部屋数やAgent数を固定しない。

- パレット（Office=dark）: 基調 `ink-900 #0A1224` / 面 `ink-800 #111B31` / 浮面 `ink-700 #18243E`。プライマリ=ネオンブルー `neon-blue #4DA3FF`、アクセント=パープル `neon-purple #9B7BFF`。AI定番の「クリーム+テラコッタ」「黒+アシッドグリーン」は不採用（ブリーフ優先）。
- 状態色（キャラ4状態＝state_*アセットと同義）: idle `#8A97AD` / working `#4DA3FF`（pulse可） / done `#3ED598` / error `#FF6B6B` / hold(保留系) `#F5B93E`。W5/W7/バッジで同一マッピングを使う。
- シグネチャ: **ステータスリング**——キャラ・ジョブカードの周囲に状態色のネオングロー（`--aos-glow-*`）。楽しさの担い手をこの1点に集中させ、他は静かに保つ（アンチパターン: 装飾の氾濫）。
- タイポ: 見出し `Zen Kaku Gothic New`（角ゴの骨格でオフィスの看板感）、本文 `Noto Sans JP`、数値/コード `IBM Plex Mono`。サイズ階段 12/13/14/16/20/24/32、行間1.6（本文）。
- Standard SaaS（light）: 基調 `#F6F8FC` / 面 `#FFFFFF` / テキスト `#101828`。プライマリ/アクセントは同系の低輝度版（コントラスト確保）。
- 品質床: フォーカスリング可視、`prefers-reduced-motion` 尊重（pulse/glowを停止）、コントラストWCAG AA目安、テキストの画像焼き込み禁止（REQ-NAV-05）。品質床の要求正本はREQ-NAV-08（v3.7.44で要求化。トークン・値は不変）。
