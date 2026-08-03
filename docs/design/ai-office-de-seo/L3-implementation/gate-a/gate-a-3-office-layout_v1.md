---
document_id: AOS-L3-GATE-A3-OFFICE-LAYOUT
title: Gate A-3 office_layout.json スキーマ v1（凍結）
layer: L3
version: 1.4
kind: contract
status: current-draft
updated_at: 2026-08-03
---

# Gate A-3: office_layout.json スキーマ v1

Agent Officeの部屋・フロア・ペルソナをconfig駆動で描画するための形（REQ-AOUI-07）。初期インスタンスは `office_layout.initial.json`（同梱）。現行要求監査後にスキーマversionの必須フィールドを固定する。フロア割当・暫定ポーズ割当・persona数は初期モック構成であり、製品要求上の固定数ではない。JSONとCatalogの変更で追加・統合・差し替え可能にする。

## スキーマ要旨

```json
{
  "$id": "aos.office_layout.v1",
  "required": ["version", "floors", "rooms", "hub", "personas"],
  "floors":   [{"required": ["floor_id", "label", "order"]}],
  "rooms":    [{"required": ["room_id", "section_no", "label", "floor_id", "order", "sign_asset", "screen_refs", "persona_ids"]}],
  "hub":      {"required": ["label", "screen_refs"]},
  "personas": [{"required": ["persona_id", "label", "char_asset", "asset_confidence", "mapping"],
                "mapping": {"required": ["stages", "service_keys", "interaction_capabilities", "proposal_types"],
                            "properties": {"executors": [], "stages": [], "service_keys": [],
                                           "interaction_capabilities": [], "proposal_types": []}}}]
}
```

規約（凍結）:
- `screen_refs` は第一階層ルートID（dashboard / keywords / content / automation / analytics / knowledge / settings）またはワークベンチルート（w1〜w10）の配列。部屋⇄画面は1:1固定しない（REQ-AOUI-07）。W10（サポート）はグローバル要素からの起動が正であり（REQ-PRODUCT-22）、部屋への割当は任意（初期インスタンスでは未割当）。
- `sign_asset` / `char_asset` はASSET-MAPPINGの命名規約（sign_NN_* / char_*）。状態オーバーレイは全ペルソナ共通の `state_idle/working/done/error`（個別指定不要）。
- `asset_confidence`: "confirmed" | "provisional"。provisionalは差し替え前提（ASSET-MAPPING準拠）。
- `mapping.stages` はREQ-AGENT-09の状態ID。キャラ状態はイベント（gate-a-1）の stage_entered/gate_* から導出し、手書きアニメ禁止（PT-E）。
- `mapping.service_keys` はペルソナが読取・説明・探索・Task化へ接続する決定論Service／業務Service、`interaction_capabilities` は顧客へ提供する会話能力、`proposal_types` は会話から作成できる型付き変更案である。これらはペルソナを専用runtimeへ固定する識別子ではない。`executors/stages` が空でもService能力を持てるが、全4集合が空の飾りキャラクターは禁止する。
- `interaction_capabilities` は全ペルソナ共通のOffice Conversation Runtimeが解決する。各personaのconfigはRole Profileと許可能力を示すだけで、persona数だけLLM instance、modelまたは独立processを生成しない。会話からの変更は`proposal_types`に列挙された型へ変換し、認可済みCommandを経ずに状態を更新しない。
- ペルソナは工程表示だけではなく担当業務の継続的窓口である。質問・説明・探索はServiceへ、状態変更はProposal→共通Commandへ、生成・検査・配置は既存Executor／Workflowへ接続する。Office configに表示名だけを登録して機能を別コードへハードコードしない。
- 追加・改名・並替はJSON変更のみで完結し、コード変更を要さない（AC-AOUI-07の検証対象）。
- v1.1追補（任意フィールド=minor規則内）: `rooms[].holo{ type: chips|bars|doc|flow|books|toggles|net, title }`（部屋のホログラム表示タイプ。プロト実装からの収穫。未指定時は既定表示）。
- v1.2追補（許容値拡張=minor規則内）: `screen_refs` のワークベンチ範囲を w1〜w9 → w1〜w10 へ拡張（v3.7.33のW10サポート追加に追随）。既存フィールド・必須集合は不変。
- v1.3追補（初期インスタンス改訂・スキーマ不変）: `office_layout.initial.json` を **7フロア構成（1部屋=1フロア＋ハブ、config v2.1.0）** へ改訂。初期baselineは部屋7・ペルソナ13だが、必要なLLM runtime数または将来のpersona上限を意味しない。エレベーター表示はfloors配列から生成する。
- v1.4追補（ペルソナ業務能力）: `service_keys`、`interaction_capabilities`、`proposal_types`を必須化し、旧configの工程表示専用mappingを現行のAgent Interaction／Advisory／Executionへ接続する。v1.3インスタンスはmigration時にペルソナID別既定値を補い、空の能力で現行扱いしない。
