---
document_id: AOS-L3-PROTO-IMPL-MAP
title: AI Office de SEO プロトタイプ実装マップ（L4ハンドオフ用） v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-07-08
related_plan: PLAN-L3-02-ai-office-de-seo-screen-prototype
---

# プロトタイプ実装マップ（L4ハンドオフ用）

DCプロト `prototype/AI Office de SEO.dc.html`（単一ファイル・約8,900行/900KB）を本実装（L4）へ翻訳するための対応表。**プロト自体の共通化リファクタは行わない**（DC形式はストリーミング描画のためインラインstyle維持が既定。prototype/CLAUDE.md 方針9）。正本参照: トークン=Gate A-4（`gate-a-4-design-tokens_v1.md` / design-tokens.css）、画面責務=AOS-L3-SCREEN-INVENTORY、データ契約=AOS-L3-CONTRACT-SCHEMAS。

## 0. 現行要求との差分（2026-08-03）

本書の行番号、定数、state、vals関数は2026-07-08時点の実装資産台帳であり、現行要求の完成状態を意味しない。L4へ翻訳する前に次を追補する。

| 差分 | 現在の実装 | 必要な変更 |
|---|---|---|
| Site導入 | S7の接続・設定部品 | 新規／既存の構築Stepper、big keyword方向確認、GSC/upload/CMS availability、段階開放 |
| 戦略／診断Report | S1/S2/S5へ断片化 | 新規戦略Reportと既存診断ReportをW1共通枠で構成し、Market→Share→施策を一続きで表示 |
| Recommendation Intake | `recVals`とS3 preset | `recommendation_id+version / intake_ref / correlation_id`をfixture正本にし、S3再入力を廃止 |
| Workflow分岐 | 新規／リライト中心 | CTA Patch、内部link Patch、観測、技術エスカレーション、Automation変更を型付き分岐 |
| 公開条件 | 旧full_auto／承認表現 | 15記事、解放後自動投稿、リライト承認、hard gate例外を別状態化 |
| 評価Loop | S1/S5の実績表示 | 公開／更新event→1/3/6か月→SEO／CTA-CV／認知→学習→再推薦を相関表示 |
| Office | 監視・詳細中心 | 会話、Proposal、影響・credit、条件／Task変更、共通Command/Eventへの接続 |
| 設定・課金 | 旧価格・旧credit fixture | version付きPlan Configurationと現行Billing要求から生成 |
| 権限 | `memberRoles`と旧Role | 基本区分＋業務Permission＋Site付与＋Automation委任へ置換 |

既存のカード、Modal、Tab、Office scene、Agent asset、通知、Task進捗、詳細Panelは再利用可能である。旧fixtureと旧mutation handlerを本番Store/API設計の種として無条件に採用しない。

## 1. デザイントークン実測インベントリ（2026-07-08 実測・WCAG比は白背景基準）

### 1.1 カラー（Standard SaaS light）

| 実測値 | 役割 | コントラスト | 備考 |
|---|---|---|---|
| `#16294B` | テキスト主（見出し・本文強） | 13.9:1 | |
| `#51637F` | テキスト副（ラベル・列見出し） | 6.4:1 | |
| `#64748B` | テキスト弱（注記・メタ・セカンダリボタン） | 4.8:1 | 旧 `#7A8BA6`(3.4)・`#8496B0`/`#8A97AD`(3.0) を2026-07-08にAA適合へ統合 |
| `#2F6FE4` | プライマリ（リンク・アクション文字） | 4.6:1 | |
| `linear-gradient(180deg,#4A87F2,#2A63D4)` | プライマリボタン面（白文字） | — | |
| `#1F7A5C` | ポジティブ（増加値・成功） | 5.3:1 | 旧 `#339B7D`(3.4) をAA適合へ変更。濃色面用は `#3ED598` |
| `#21725C` | ポジティブ濃（金額・順位改善） | 6.0:1 | |
| `#8F6A25` | 注意（アンバー文字） | 4.9:1 | 旧 `#B5893A`(3.2) をAA適合へ変更。淡面は `rgba(181,137,58,.07〜.12)` のまま |
| `#7C6230` | 注意濃（アンバー面上の文字） | — | |
| `#C2543F` / `#B54A4A` | デンジャー（削除・エラー） | 4.5〜5.0:1 | 旧 `#D25B5B`(3.9) を2026-07-08に `#C2543F` へ統合（AA適合）。淡面は `rgba(210,91,91,.05〜.1)` のまま |
| `#6C59CE` | アクセント紫（おすすめ・新規記事） | 5.3:1 | 旧 `#7E6BD9`(4.2) をAA適合へ変更。淡面 `rgba(126,107,217,.07〜.12)`・ダーク面用 `#9B7BFF` は不変 |
| `#FFFFFF` / `#F6F9FD` / `#F4F7FB` / `#FBFCFE` | 面（カード・淡面・フッター） | — | |
| `#D5DEEB` / `#E5EBF4` / `#EEF2F8` / `#C9D4E4` | 罫線（カード枠・区切り・入力枠） | — | |
| `linear-gradient(180deg,#FDFEFF 0%,#F0F4FA 55%,#E4EBF5 100%)` | セクションヘッダー面 | — | +`inset 0 1px 0 #FFFFFF` |

Agent Office（dark）は `bg_office_dark`・ネオン系（`#3ED598` 等）で別系統。`deltaColor` / `deltaColorDark` のペアで両テーマに供給している（s1Vals参照）。

### 1.2 タイポグラフィ

- 書体: 見出し=`'Zen Kaku Gothic New', sans-serif`、数値=`'IBM Plex Mono', monospace`、本文=UI既定。
- 実測スケール: 9 / 9.5 / 10 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 17 / 21〜27px の混在（0.5px刻み12段が主）。
- **L4凍結提案（5段+display）**: 10px(バッジ・タグ) / 11px(注記・メタ) / 12px(本文) / 13px(強調本文・ボタン) / 14.5px(セクション見出し) / 18px超(KPI数値=Mono)。0.5px刻みは廃止。

### 1.3 形状・エフェクト

- 角丸: セクション=10px（全86セクションで統一） / ボタン=6〜8px / モーダル=14px / チップ・バッジ=999px。
- カード影: `inset 0 1px 0 #FFFFFF, 0 1px 2px rgba(23,43,77,.07), 0 10px 28px -14px rgba(23,43,77,.2)`（33回出現＝カードの正）。
- モーダル: `rgba(16,24,40,.55)` オーバーレイ + `backdrop-filter: blur(2px)` + 影 `0 24px 60px rgba(16,24,40,.35)`。

## 2. ロジック構造マップ（行番号は 2026-07-08 時点）

### 2.1 データ定数 → データ契約の対応

| 定数 | 内容 | 対応契約（AOS-L3-CONTRACT-SCHEMAS / REQ-PACK-07） |
|---|---|---|
| `STAGES` | ジョブ13状態（実務9＋強制ゲート4） | REQ-AGENT-09 状態機械 |
| `KW_ROWS` / `KW_CLUSTER_DETAIL` / `GAP` | キーワード一覧・クラスタ詳細・ギャップ | `source.keyword.map.v1` / `source.keyword.assignment.v1` |
| `PROMOS` / `DEMOTES` | 昇格候補・除外候補 | REQ-KGA-16/13（recommendation_items） |
| `SITES` / `MEMBERS` / `DEFAULT_INVITES` | サイト・メンバー・招待 | memberships |
| `CHART_DATA` / `JOB_ROWS` | 成長サマリー・ジョブ履歴 | `source.gsc.page_query_matrix.v1` 集約 / ジョブイベント |
| `CT_NEW` / `CT_REWRITE` / `CT_NEWS_ORG` / `CT_VIDEO_ORG` / `CT_OUTLINE` | S3起点別プリセット・構成案 | `schema.snapshot.research_brief.v1` / `outline_contract.v1` |
| `KN_NG` / `KN_WISHES` / `KN_RULES` | NG表現・要望・レギュレーション | `source.site.user_order.v1`（enabled=soft-disable） / `content_regulation.v1` |
| `W8_HOLD` | 変更予算超過の保留キュー | REQ-PRODUCT-18 |
| `SUP_KB` | サポートQAナレッジ | REQ-PRODUCT-22 |
| `TXT`（en 870語超） | UI文言レジストリ（JA→EN） | REQ-NAV-07/09 |
| `config/office_layout.json`（外部・v2.1.0） | 7フロア・部屋・ペルソナ | REQ-AOUI-07（config駆動） |

### 2.2 vals関数 × 画面

| 関数（行） | 供給先 |
|---|---|
| `stage2Vals()` (6440〜) | 最大の集約点。S2キーワード（フィルタ/一覧/分類・削除/ギャップ/昇格・除外）・S3・S4・S6・設定系・W8ガバナンス・事例許諾・メンバー管理ほか |
| `s1Vals()` (8596) / `kwTopoWatchVals()` (8514) | S1ダッシュボード・月次プランニング／S2トポロジー・ウォッチリスト |
| `s5Vals()` (8404) / `cvModalVals()` (8324) | S5検索流入分析（インデックス技術・ローカル順位ほか）／S6 CVポイント台帳モーダル |
| `s7Vals()` (8214) | S7補完（静穏窓・TZ・バウンス・SEC-16・メンバー・登録時同意書W9） |
| `wjVals()` (6994) / `ncVals()` (7034) / `supportVals()` (7126) | W5ジョブ進捗（一時停止/再開/キャンセル）／W7通知（個別・全既読/フィルタ）／W10サポート |
| `recVals()` (6175) / `gsVals()` (7416) / `kwAddVals()` (7331) / `buyVals()` (7492) / `tourVals()` (7569) / `stdVals()` (7667) / `renderVals()` (8684) | おすすめ採用/却下・グローバル検索・手動KW追加・クレジット購入・ツアー・共通・ルート合成 |
| i18n系: `curLocale` / `applyI18n` / `_i18nSwapAll` / `_mt*` (5907〜6048) | テキストノード走査でTXT差し替え＋MTフォールバック（REQ-NAV-07） |
| イベント/オフィス系: `mkEnv` (4864) / `derivePersonaStates` (4888) / `openRoom` / `rideElevator` / `buildRoom` (6285〜6438) | 本番同形イベントエンベロープ（Gate A-1適合: `generation.job_suspended` 等）／ペルソナ4状態導出／部屋描画 |
| ガード: `roGuard()` (5043) | なりすまし閲覧モードの書込禁止。**全mutationハンドラの先頭で呼ぶ規約** |

### 2.3 主要stateキー（本実装のストア設計の種）

`mode`(standard/office) / `screen` / 第二階層タブ=`dashTab?・kwTab・ctTab・auTab・anTab・knTab・seTab` / `disp`(表示5類型) / `locale` / `kwFilters・kwSort・kwSel・kwPick・kwCls・kwRemoved・kwExtra` / `wishes・wishOff・rules・ngList` / `approvals・schedRows・autoRun・w8*` / `linkFb・recFb・demote(recFb共用)` / `notifRead・ncReadIds・ncFilter` / `memberRoles・memberRemoved・invites` / `quietHoursVal・quietWindowVal・quietTzVal・mailBounced` / `regConsent・scGrant系・dataOptOut` / `job1Idx・job1Hold・jobDetail` / `imp`(サポート閲覧) / `balance・buyStep`。

## 3. 頻出インラインスタイル → コンポーネント候補（出現回数は実測）

| 候補コンポーネント | 実測の正 | 出現目安 |
|---|---|---|
| `Card` / `CardHeader` | §1.3のカード影＋10px角丸＋ヘッダーグラデ | 33回超 |
| `NoteText` | 10.5px `#64748B` | 39回超 |
| `LabelText` | 11.5px 700 `#51637F` | 29回超 |
| `PrimaryButton` / `SecondaryButton` / `GhostButton` | 青グラデ白字／白面+`#C9D4E4`枠+青字／透明+`#64748B` | 多数 |
| `Chip` / `Badge` | 999px角丸・9〜10px 700・色ペア（fg/bg） | 多数 |
| `Toggle` | 40×22px・ノブ18px・ON=青 | 10回超 |
| `SegmentedTabs` | `seg(on)`ヘルパー（青グラデON/白OFF）＝第二階層タブ・フィルタ共通 | 全画面 |
| `ModalShell` | §1.3モーダル構成（overlay+eatClick+ヘッダー/フッター） | 15回超 |
| `SkeletonRow` / `Spinner` / `ErrorState` / `EmptyState` | 表示5類型の正（`aosSkel`/`aosSpin`アニメ） | 全画面 |

インラインstyle総数2,827・`style-hover`125。上記10種で大半を吸収できる。

## 4. 既知の残課題（L4持ち越し・報告済み）

- タイポの0.5px刻み12段は§1.2の5段案に凍結する（唯一の残課題）。
- 任意（要ユーザー判断）: タスクID接頭辞 `J-####` の `T-####` 化（書面・イベント例との同期が必要）。
- 解消済み（2026-07-08）: ~~ヘッダー未読バッジの個別既読非連動~~（ncReadIds連動化）／~~S5概要タブの過密~~（クエリ・マッチ品質タブ分離・検索実績に列ソート・問題一覧に種別フィルタ）／~~AA境界下の赤・紫~~（`#C2543F`・`#6C59CE`へ統合）／~~2軸ラベル非明示~~（`EXPLORE — じぶんで選ぶ`をS2マップ・S3新しく作る・S5検索実績に付与、`RECOMMENDED — おすすめ`と対）／~~カード高さ差の空白~~（S2グリッドを`columns`メーソンリー化＝`.kw-masonry`）。
