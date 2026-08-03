---
document_id: AOS-L3-HANDOFF-GATE
title: AI Office de SEO L3先行確定リスト（Design/Code引き渡しゲート） v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-07-05
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# L3先行確定リスト（Claude Design / Claude Code 引き渡しゲート）

L2以降をClaude Design（UI）とClaude Code（実装）で進める前に、**先に確定しないと手戻りが全体へ波及する項目**を優先度順に列挙する。判断基準は「未確定のまま着手した場合の手戻り半径」。

## Gate A: 着手前に確定必須（未確定だと全面手戻り）

**確定済み（v1凍結）**: 全5件を `gate-a/` に作成済み（GATE-A-README.md参照）。以下の表は根拠として維持。

| # | 項目 | 内容 | 根拠 | 主な消費者 |
|---|---|---|---|---|
| A-1 | イベント共通エンベロープ | `{event_id, event_type, occurred_at, tenant_id, site_id?, job_id?, actor, payload, schema_version}` の確定と event_type 列挙（L2 §5＋通知カタログ `REQ-PRODUCT-11` の全種）。**プロトのモックイベント・W5ジョブ進捗・W7通知センター・Agent Officeキャラ状態のすべてがこの形に依存**し、後変更は両トラック手戻り | AOS-L3-CONTRACT-SCHEMAS §5 | Design（PT-0〜）/ Code |
| A-2 | Repository層スコープ強制のAPI形 | `tenant_id`/`site_id` 自動付与の関数シグネチャ・default-denyの実装方式・RLS併用方針・グローバル信号ストアの物理配置（別スキーマ/別DB）。**DU-01（フェーズ0）で全コードの土台** | REQ-SEC-07, DDL §0/§8 | Code |
| A-3 | office_layout.json スキーマ | 部屋・フロア・ペルソナ・部屋⇄画面対応・アセット参照のconfig形。**Claude Designがオフィス画面を作る前提**（ハードコード禁止 `REQ-AOUI-07`） | AOS-L3-PROTOTYPE-PLAN §3 | Design |
| A-4 | デザイントークン | Design.md §6（ダークネイビー＋ネオン、2テーマ）の色・タイポ・余白・状態色のトークン化。**全コンポーネントの前提**。frontend-design skillの制約に合わせて確定 | Design.md, REQ-AOUI-01 | Design |
| A-5 | schema.ticket.* / schema.snapshot.* の必須フィールド凍結 | 名称・必須/任意・content_ref方式（一時領域参照）。**Executor・QA・Assembly・W2/W3画面の共通契約**。値の意味論変更は全面手戻り | AOS-L3-CONTRACT-SCHEMAS §1/§2 | Code / Design(W2/W3) |

## Gate B: 早期に確定推奨（未確定だと該当領域が手戻り）

| # | 項目 | 内容 | 根拠 | 主な消費者 |
|---|---|---|---|---|
| B-1 | config_key 命名規約 | `kga.match.*` 等は例示済み。namespace規約（domain.feature.param）・型・スコープ表現を正式化。ADM-S7画面と全較正コードが依存 | REQ-ADM-09, CONFIG-DEFAULTS | Code / Design(ADM-S7) |
| B-2 | 状態機械の機械可読インスタンス | `new_article_workflow` 13状態（9工程＋4ゲート）を workflow型JSON（`REQ-PACK-11.6`）の具体1本として確定。Layer A格納形式・W5表示・モックイベント系列の正本 | REQ-AGENT-09 | Code / Design(W5) |
| B-3 | 認可判定のAPI形 | Role×操作マトリクス（`REQ-PRODUCT-08`）のサーバー側判定関数シグネチャと、画面側の可視/不可視制御の受け取り形 | REQ-SEC-08 | Code / Design |
| B-4 | Source Extract JSON Schemaの第一陣 | プロトP0画面が使う分を先行確定: `source.keyword.map.v1`（attributes込み）/ `source.gsc.query_group.v1`（match込み）/ `source.keyword.assignment.v1` / `source.gsc.page_query_matrix.v1` / `schema.snapshot.qa.v1`。残りは画面到達順で | REQ-PACK-07 | Design(モック) / Code |
| B-5 | 形態素解析エンジン選定 | KGA-15 exact段の正規化（分かち書き・助詞除去）の実装選定（MeCab系等・決定論）。辞書versionの持ち方に影響 | REQ-KGA-15 | Code |
| B-6 | AWS初期配置・復旧ADR | AWS Operations Recovery Map v1の論理境界を維持してcompute、DB、queue、cache、Multi-AZ、backup隔離先、SLO、障害注入・復元演習方法を負荷・人数・費用から確定する。製品選定前でもcorrelation、bulkhead、circuit、Runbook、RPO/RTOの契約は変更しない | REQ-NFR-06〜08/14/15, REQ-TECH-19 | Code / Operations |

## Gate C: 先行確定不要（設計上、後から吸収できる）

- 品質しきい値・重み・k値・優先度等の**実数**: すべて設定レジストリ/Catalog吸収設計（`REQ-BILL-10`/`REQ-ADM-09`）のため、TODO(L3)のままDesign/Code着手可。較正は運用データで。
- 辞書・タクソノミの中身、few-shot本文、セグメントpriorの式: Catalog版管理＋ADM-S8統制で後追い可能。
- 日本語可読性指標の選定: 検証ログのオープン項目。確定まで可読性ゲートはadvisory運用で影響を限定済み。
- 価格・プラン実数、プロバイダ上限実数: 契約・法務確定待ちで吸収可。
- Generative AIレポートの取得経路: availability設計で吸収（検証ログの再確認運用）。

## 進め方の提案

1. Gate A-1/A-5（契約）とA-2（境界API）をClaude Codeの最初のタスクに、A-3/A-4（config/トークン）をClaude Designの最初のタスクに割り当て、**双方の出力を相互レビューしてから**PT-1/DU-02以降へ進む。
2. Gate Bは該当領域の着手直前にジャストインタイムで確定する（B-4は画面到達順）。
3. Gate Cは着手をブロックしない。未決の一覧・owner・期限は **L3未決事項テーブル（AOS-L3-DECISION-TABLE）** を単一台帳とし、TODO(L3)タグ・Config台帳・検証ログのオープン項目をそこへ集約して追跡する。
