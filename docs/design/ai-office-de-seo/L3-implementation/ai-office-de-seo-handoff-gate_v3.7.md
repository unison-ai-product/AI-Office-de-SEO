---
document_id: AOS-L3-HANDOFF-GATE
title: AI Office de SEO L3先行確定リスト（設計・実装引き渡しゲート） v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-08-03
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# L3先行確定リスト（設計・実装引き渡しゲート）

L2以降を画面設計と実装へ渡す前に、**先に確定しないと手戻りが全体へ波及する項目**を優先度順に列挙する。判断基準は「未確定のまま着手した場合の手戻り半径」。現行要求への文書・Contract・DDL・Event・受入の追随を先に完了し、プロト更新はその後に行う。

## Gate A: 着手前に確定必須（未確定だと全面手戻り）

**互換baseline作成済み・現行要求監査中**: 全5件を `gate-a/` に作成済み（GATE-A-README.md参照）。ここでいう契約の「凍結」は、要求整理を停止する意味ではなく、実行ジョブや下流実装が参照する公開済みversionを途中変更しない互換性規則を指す。現行要求への追従監査が完了するまではGate A文書を`current-draft`として改版し、監査後に新versionを固定する。

| # | 項目 | 内容 | 根拠 | 主な消費者 |
|---|---|---|---|---|
| A-1 | イベント共通エンベロープ | `{event_id, event_type, occurred_at, tenant_id, site_id?, job_id?, actor, payload, schema_version}` の確定とevent_type列挙（Gate A-1 v1.5）。Site構築、Report、月次／週次計画、Recommendation、生成、公開判定、公開・更新、評価、通知、Officeの全状態が依存する | AOS-L3-CONTRACT-SCHEMAS §5、Gate A-1 | 画面設計 / 実装 |
| A-2 | Repository層スコープ強制のAPI形 | `tenant_id`/`site_id` 自動付与の関数シグネチャ・default-denyの実装方式・RLS併用方針・グローバル信号ストアの物理配置（別スキーマ/別DB）。**DU-01（フェーズ0）で全コードの土台** | REQ-SEC-07, DDL §0/§8 | Code |
| A-3 | office_layout.json スキーマ | 部屋・フロア・ペルソナ・部屋⇄画面対応・アセット参照のconfig形。Office画面を作る前提（ハードコード禁止 `REQ-AOUI-07`） | AOS-L3-PROTOTYPE-PLAN §3 | 画面設計 |
| A-4 | デザイントークン | Design.md §6（ダークネイビー＋ネオン、2テーマ）の色・タイポ・余白・状態色のトークン化。**全コンポーネントの前提**。frontend-design skillの制約に合わせて確定 | Design.md, REQ-AOUI-01 | Design |
| A-5 | schema.ticket.* / schema.snapshot.* の必須フィールド凍結 | 名称・必須/任意・content_ref方式（一時領域参照）。**Executor・QA・Assembly・W2/W3画面の共通契約**。値の意味論変更は全面手戻り | AOS-L3-CONTRACT-SCHEMAS §1/§2 | Code / Design(W2/W3) |

## Gate B: 早期に確定推奨（未確定だと該当領域が手戻り）

| # | 項目 | 内容 | 根拠 | 主な消費者 |
|---|---|---|---|---|
| B-1 | config_key 命名規約 | `kga.match.*` 等は例示済み。namespace規約（domain.feature.param）・型・スコープ表現を正式化。ADM-S7画面と全較正コードが依存 | REQ-ADM-09, CONFIG-DEFAULTS | Code / Design(ADM-S7) |
| B-2 | 状態機械の機械可読インスタンス | `new_article_workflow` 13状態（9工程＋4ゲート）を workflow型JSON（`REQ-PACK-11.6`）の具体1本として確定。Layer A格納形式・W5表示・モックイベント系列の正本 | REQ-AGENT-09 | Code / Design(W5) |
| B-3 | 認可判定のAPI形 | 基本権限`契約者/サイトオーナー/ユーザー`＋4業務Permission＋Site Assignment＋内部Role分離を、Repository/API/worker/Agent tool/画面Availabilityへ同じPolicyで返す関数シグネチャ | REQ-ORG-03〜07, REQ-ACCESS-14〜18, Authorization Operation Matrix | 実装 / 画面設計 |
| B-4 | Source Extract JSON Schemaの第一陣 | プロトP0画面が使う分を先行確定: `source.keyword.map.v1`（attributes込み）/ `source.gsc.query_group.v1`（match込み）/ `source.keyword.assignment.v1` / `source.gsc.page_query_matrix.v1` / `schema.snapshot.qa.v1`。残りは画面到達順で | REQ-PACK-07 | Design(モック) / Code |
| B-5 | 形態素解析エンジン選定 | KGA-15 exact段の正規化（分かち書き・助詞除去）の実装選定（MeCab系等・決定論）。辞書versionの持ち方に影響 | REQ-KGA-15 | Code |
| B-6 | AWS初期配置・復旧ADR | AWS Operations Recovery Map v1の論理境界を維持してcompute、DB、queue、cache、Multi-AZ、backup隔離先、SLO、障害注入・復元演習方法を負荷・人数・費用から確定する。製品選定前でもcorrelation、bulkhead、circuit、Runbook、RPO/RTOの契約は変更しない | REQ-NFR-06〜08/14/15, REQ-TECH-19 | Code / Operations |

## Gate C: 先行確定不要（設計上、後から吸収できる）

- 品質しきい値・重み・k値・優先度等の**実数**: すべて設定レジストリ/Catalog吸収設計（`REQ-BILL-10`/`REQ-ADM-09`）のため、TODO(L3)のままDesign/Code着手可。較正は運用データで。
- 辞書・タクソノミの中身、few-shot本文、セグメントpriorの式: Catalog版管理＋ADM-S8統制で後追い可能。
- 日本語可読性指標の選定: 検証ログのオープン項目。確定まで可読性ゲートはadvisory運用で影響を限定済み。
- Plan価格階段、契約期間、主要Entitlementは確定済み。credit付与量、品質別消費係数、週次上限、Provider上限等の実数は構築・負荷・原価計測後にCatalogへ吸収する。
- Generative AIレポートの取得経路: availability設計で吸収（検証ログの再確認運用）。

## 進め方の提案

1. 現行要求からL2、Contract、DDL、Event、画面遷移、受入までの追随監査を完了する。Gate A-1/A-5（契約）とA-2（境界API）を実装の最初のTask、A-3/A-4（config/token）を画面設計の最初のTaskとし、相互review後にプロト更新／実装へ進む。
2. Gate Bは該当領域の着手直前にジャストインタイムで確定する（B-4は画面到達順）。
3. Gate Cは着手をブロックしない。要求、設計、運用較正、将来構想、移行債務を含む未確定事項の全件索引は **Open Items Register** を正本とする。**L3 Decision Table** はL3技術判断のowner・期限・状態を管理し、全D-IDをOpen Items Registerの分類へ接続する。`TODO(L3)` key family、Config台帳、検証ログの項目をDecision Tableだけへ閉じ込めない。
