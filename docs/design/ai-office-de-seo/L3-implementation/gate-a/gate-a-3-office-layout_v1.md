---
document_id: AOS-L3-GATE-A3-OFFICE-LAYOUT
title: Gate A-3 office_layout.json スキーマ v1（凍結）
layer: L3
status: frozen-v1.3
updated_at: 2026-07-05
---

# Gate A-3: office_layout.json スキーマ v1（凍結）

Agent Officeの部屋・フロア・ペルソナをconfig駆動で描画するための形（REQ-AOUI-07）。初期インスタンスは `office_layout.initial.json`（同梱）。**スキーマの必須フィールドを凍結**。フロア割当・暫定ポーズ割当は初期値であり、JSONの変更のみで差し替え可能（それがこのスキーマの目的）。

## スキーマ要旨

```json
{
  "$id": "aos.office_layout.v1",
  "required": ["version", "floors", "rooms", "hub", "personas"],
  "floors":   [{"required": ["floor_id", "label", "order"]}],
  "rooms":    [{"required": ["room_id", "section_no", "label", "floor_id", "order", "sign_asset", "screen_refs", "persona_ids"]}],
  "hub":      {"required": ["label", "screen_refs"]},
  "personas": [{"required": ["persona_id", "label", "char_asset", "asset_confidence", "mapping"],
                "mapping": {"required": ["stages"], "properties": {"executors": [], "stages": []}}}]
}
```

規約（凍結）:
- `screen_refs` は第一階層ルートID（dashboard / keywords / content / automation / analytics / knowledge / settings）またはワークベンチルート（w1〜w10）の配列。部屋⇄画面は1:1固定しない（REQ-AOUI-07）。W10（サポート）はグローバル要素からの起動が正であり（REQ-PRODUCT-22）、部屋への割当は任意（初期インスタンスでは未割当）。
- `sign_asset` / `char_asset` はASSET-MAPPINGの命名規約（sign_NN_* / char_*）。状態オーバーレイは全ペルソナ共通の `state_idle/working/done/error`（個別指定不要）。
- `asset_confidence`: "confirmed" | "provisional"。provisionalは差し替え前提（ASSET-MAPPING準拠）。
- `mapping.stages` はREQ-AGENT-09の状態ID。キャラ状態はイベント（gate-a-1）の stage_entered/gate_* から導出し、手書きアニメ禁止（PT-E）。
- 追加・改名・並替はJSON変更のみで完結し、コード変更を要さない（AC-AOUI-07の検証対象）。
- v1.1追補（任意フィールド=minor規則内）: `rooms[].holo{ type: chips|bars|doc|flow|books|toggles|net, title }`（部屋のホログラム表示タイプ。プロト実装からの収穫。未指定時は既定表示）。
- v1.2追補（許容値拡張=minor規則内）: `screen_refs` のワークベンチ範囲を w1〜w9 → w1〜w10 へ拡張（v3.7.33のW10サポート追加に追随）。既存フィールド・必須集合は不変。
- v1.3追補（初期インスタンス改訂・スキーマ不変）: `office_layout.initial.json` を **7フロア構成（1部屋=1フロア＋ハブ、config v2.1.0）** へ改訂。PO決定（ゆとり重視）とプロトのconfig駆動実証（PT-G: コード変更なしで2F⇄7F追従）に基づく。部屋7・ペルソナ13・screen_refs・必須フィールドは不変。エレベーター表示はfloors配列から生成する。
