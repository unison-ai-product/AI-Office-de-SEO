---
document_id: AOS-L3-UI-PARTS-CATALOG
title: AI Office de SEO UIパーツカタログ（オブジェクト定義） v1
version: 1.1
layer: L3
kind: design
status: draft
updated_at: 2026-07-10
related: AOS-L3-SCREEN-INVENTORY / AOS-L3-SCREEN-CONNECTION-MAP / AOS-L3-PROTO-IMPL-MAP
---

# 0. 本書の位置づけ

- **目的**: プロトタイプ（`AI Office de SEO.dc.html` / `Admin Console.dc.html`）に繰り返し出現するUIパーツを**オブジェクト（名前＋props＋状態＋使用箇所）として定義**し、本実装（React）のコンポーネント分割の正本にする。
- **背景**: DCランタイムにはパーシャル/コンポーネント機構が無く、プロトでは同一パターンをインラインstyleのコピーで表現している（例: 白カード92回・主ボタングラデ106回・999px丸チップ148回・hover定義199回）。この「コピーの群れ」を本実装で1コンポーネント=1オブジェクトに畳み込むための対応表が本書。
- **読み方**: §1がデザイントークン（全パーツの前提）、§2が通常ビュー共通パーツ、§3がOfficeビュー専用パーツ、§4が管理コンソール、§5がロジック層（クラスメソッドの責務分解）、§6が本実装への移行指針。**出現数・メソッド数はプロト実測値**（2026-07-10 grep全数抽出）。

---

# 1. デザイントークン（パーツの前提レイヤー）

パーツのpropsに色を直接持たせず、トークン参照にする。プロトのインライン値→トークン名の対応:

## 1.1 通常ビュー（ライト）

| トークン | 値（プロト実測） | 用途 |
|---|---|---|
| `text-primary` | `#16294B` | 見出し・本文強調 |
| `text-secondary` | `#51637F` | 説明文・ラベル |
| `text-muted` | `#64748B` / `#76869F` / `#7A8BA6` | 注記・補助（本実装で1値に統合を推奨） |
| `brand` | `#2F6FE4` | リンク・アクセント |
| `brand-gradient` | `linear-gradient(180deg,#4A87F2,#2A63D4)` | 主ボタン・ONチップ |
| `border` | `#D5DEEB`（カード）/ `#C9D4E4`（入力・副ボタン）/ `#E5EBF4`・`#EEF2F8`（区切り） | 枠線4階調 |
| `card-shadow` | `inset 0 1px 0 #FFF, 0 1px 2px rgba(23,43,77,.07), 0 10px 28px -14px rgba(23,43,77,.2)` | SectionCardの署名的シャドウ |
| `ok` / `warn` / `err` | `#21725C` / `#8F6A25`・`#B5893A` / `#C2543F` | 状態色（bgは各 `rgba(...,.1〜.16)`） |
| `selected-bg` | `#F2F7FE`（選択行）/ `#F6F9FD`（hover行） | 一覧の選択・hover |

## 1.2 Officeビュー（ダーク）

`prototype/config/design-tokens.css` が正本: `primary #4DA3FF` / `done #3ED598` / `accent #9B7BFF` / `warn #F5C544` / `error #FF6B6B` / `text-2 #93A2C0` / surface系 `rgba(5,10,24,.88)`。部屋の色相は `FLOOR_HUE`（`buildRoom()`算出）を親要素の static filter で適用（keyframes filterとの分離原則は prototype/CLAUDE.md 参照）。

---

# 2. 通常ビュー共通パーツ（オブジェクト定義）

## 2.1 `SectionCard` — 白カード（出現 92）

```
SectionCard {
  title: string            // h2 14.5px/700 'Zen Kaku Gothic New'
  subtitle?: string        // 10.5px text-muted（見出し直下の説明）
  headerRight?: ReactNode  // 「変更」ボタン・件数チップ等
  footerNote?: string      // 上罫線つき 10.5px 注記
  children: ReactNode
}
```
- 署名: `background #FFF / border 1px #D5DEEB / radius 10px / card-shadow / padding 14-16px`。
- 全S画面のセクション単位。**1タブ=1目的の原則**により、カードの追加が増えたらタブ分割を検討（screen-inventory §0）。

## 2.2 `PrimaryButton` / `SecondaryButton` / `GhostPill`（出現 106 / 多数）

```
PrimaryButton { label, onClick, disabled?, size: 'md'|'sm' }   // brand-gradient・白文字・radius 7-8px
SecondaryButton { label, onClick, tone?: 'brand'|'neutral'|'danger' } // 白地+border #C9D4E4・hoverでborder brand
GhostPill { label, onClick, dashed?: bool }                    // 999px・検証用スイッチ等（例: 版更新の再現）
```
- 全ボタンに `roGuard()` 相当（閲覧専用ロール時は編集系を無効化）を必ず通す（方針: roGuard on edit handlers）。

## 2.3 `StatusChip` — 状態チップ（999px丸チップ群・出現 148 の主用途）

```
StatusChip { label, tone: 'ok'|'warn'|'err'|'brand'|'neutral', size?: 'xs'|'sm' }
```
- 実装形: `font-size 10-10.5px/700・radius 999px・padding 2px 9-10px・色=tone色＋rgba薄bg＋(任意)薄border`。
- 使用例: S4承認の種別、S5問題一覧のsev、S7同意書の版チップ（`v1.1 ・ 再同意が必要`）、ADM-S12のsev/state。

## 2.4 `FilterChips` — 絞り込みチップ列

```
FilterChips { options: {key,label}[], value: key, onChange(key) }
```
- ON状態= brand-gradient白文字/700、OFF= 白地 `#51637F`/500。プロトの `idxFilters` / `apFilters` / `ctOrigins` が同型。
- **必須挙動**: フィルタ変更時に従属選択をリセット（例: S4 `apSel` クリア、W7 `ncShowAll:false`）。「すべて選択」はフィルタ後の集合のみ対象。

## 2.5 `TabBar` — 画面内タブ（第二階層・全画面43タブ）

```
TabBar { tabs: {key,label,badge?}[], value, onChange, stateKey: string } // s1Tab/kwTab/ctTab/auTab/anTab/knTab/seTab
```
- 1タブ=1目的。タブはグローバル検索インデックス（`GS_TABS` 43件）と1:1で同期させる＝**タブを追加したらGS_TABS/WB_MAP/ROOM_DATA/GS_SETTINGSの追随を横断確認**（過去に漏れが頻発）。

## 2.6 `DataTable` — 一覧テーブル

```
DataTable {
  columns: { key, label, sortable?, width?, align? }[]
  rows: object[]
  sort?: { key, dir, onSort(key) }        // S5流入ページ atMk 型
  search?: { value, onInput, matcher }     // タイトル+id+種別まで含めて検索（W6の教訓）
  csv?: { filename, rows }                 // 単一ソース原則: 表示行と同じ配列から生成（seLedgerCsvの_seLedgerRows方式）
  empty: string                            // 空状態文言（必須・5類型の'空'）
  rowAction?: 'select'|'detail'            // 行クリックの役割は1つに固定
}
```
- **一覧行は「選択と表示」だけを持ち、操作は詳細パネル/モーダルに寄せる**（ADM-S12掃除で確立した責務分離）。選択行bg= `selected-bg`。
- 表示状態5類型（通常/読込中/計算中/空/エラー）は代表テーブルのみに適用するデモ設計（PT-C追認）。本実装では全テーブル標準装備にする。

## 2.7 `Modal` — モーダル基盤（fixed inset overlay 出現 47・eatClick 36）

```
Modal {
  open, onClose,                 // 背景クリック=onClose・内側は stopPropagation（eatClick）
  title, children, footer,       // footer= キャンセル(Secondary)+実行(Primary) 右寄せ
  width?: 460|520|number,
  escClose: true                 // onEsc の状態リストに必ず登録（bizEdit/reconsentOpen等の前例）
}
ConfirmDialog extends Modal      // 不可逆操作のみ。可逆な削除はUndoToastを使う（方針11）
```

## 2.8 `Toast` / `UndoToast`

```
Toast { message }                            // LABELS.msg 辞書キー経由（直書き禁止・PT-Q引き継ぎ）
UndoToast { message, onUndo, timeoutMs }     // 削除系の既定。確認ダイアログは不可逆のみ
```

## 2.9 `FormField` — 入力行

```
FormField { label, input: TextInput|Select|Textarea, hint?, error? }
TextInput { value, onInput, maxlength,        // 上限は必ず明示（watchKw/cvPtName=60等）
            validate?: regex,                 // 例: 電話 /^[0-9-]+$/・URL形式
            mono?: bool }                     // 電話・URL・IDは IBM Plex Mono
```
- モーダル内の下書きは閉じても保持（`knSampleDraft` 方式: closeで退避・saveでクリア）。

## 2.10 `ChipInput` — チップ＋追加入力（S6対応エリアの型）

```
ChipInput { items: {label,onRemove}[], input: {value,onInput,placeholder,maxlength}, onAdd, dedupe: true }
```
- 重複チェック＋削除はUndoToast連動。

## 2.11 `OfficeLink` — 「オフィスで見る」ピル（出現 16）

```
OfficeLink { resolve: () => officePageId|null, room: roomId }
```
- ラベル付きピル＋グロードット（旧●ボタンは全廃）。**resolverが null を返す行には出さない**（デッドリンク防止＝relatedOf/#33の教訓）。id解決は文字列連結でなく必ず resolver 関数（`kwPageId`/`articlePageId`/`technicalPageId`/`knowledgePageId`/`automationPageId`）経由。

## 2.12 `NoticeBanner` — 常設バナー（再同意バナーの型）

```
NoticeBanner { tone: 'warn'|'info', message, action: {label,onClick},
               visibleWhen }   // 例: standardモードのみ・該当モーダル表示中は隠す
```

## 2.13 `StagedList` — 段階表示リスト（W7通知の型）

```
StagedList { rows, limit: 8, moreLabel: 'すべて表示（残りn件）', resetOn: [filterChange] }
```

## 2.14 `KpiCard` / `Sparkline`

```
KpiCard { label, value, delta, deltaColor, note, spark?: number[] }  // S1/ADM共通。SVG polyline
```
- **SVG内にテキストを置く場合の注意**: バインディングは tspan で描画される（support.js修正済み）。検収は `getBBox().width===0 && textContent` の全数スキャン。

---

# 3. Officeビュー専用パーツ

## 3.1 `OfficeDetailPage` — 詳細ページの器（型A〜E）

screen-inventory §3 の型分類と1:1。共通ヘッダ（部屋へ戻る/元のページへ戻る・タイトル・サイト名）＋左サイドの`dPages`メニュー＋左下エージェント＋右下CTA。

```
OfficeDetailPage {
  id, label, msg,                  // msg= エージェント吹き出し（ワンメッセージ原則）
  kind: 'A'|'B'|'C'|'D'|'E',
  cta: { label, onClick },         // 復路。必ず通常ビューの具体タブ+フィルタ/選択状態まで積む
  liveOverride?: (state) => patch  // 動的値の合成（st_credit/cc_rewrite/tk_localの cur 分岐パターン）
}
```
- 1ページ=1キーワード/1記事/1監視対象・スクロール禁止（office-detail-page-granularity）。

## 3.2 型E（ステータス盤）内部パーツ

```
StatusRows { rows: {dot,label,v,vFg}[] }                 // 4行前後
HealthGauge { pct, label, color }                        // SVG半円弧＋中央数値（tspan描画）
VisPanel { kind: 'graph'|'cells'|'cwv',                  // リンクグラフ/セル格子/CWVバー
           graph?: {center,nodes,edges}, cells?: {cols,n,amber,red,legend}, cwvRows? }
AuditLog { rows: {text,fg}[] }
FixRows { rows: {chip,chipFg,chipBorder,text}[] }        // 影響・修正候補
AnalysisPanel { text }                                    // エージェントの分析
```

## 3.3 モード切替演出・入口

```
ModeVeil { label: '▲ AGENT OFFICE'|'▼ 通常ビュー' }   // ホログラム走査ワイプ（aosScanWipe .58s・reduced-motionで非表示）
StdReturnSnapshot {}                                    // 通常→Office時に screen+全タブkeyを退避、「元のページへ戻る」で復元
HubCard / RoomCard / PersonaAvatar { state: idle|working|done|error }  // 俯瞰・部屋・キャラ（色/グローはトークン準拠）
```

---

# 4. 管理コンソール（Admin Console）

通常ビューのトークン・パーツをそのまま共有（SectionCard/StatusChip/DataTable/Modal/Toast同型）。固有:

```
MetricCard { label, value, note, good: bool }        // sdMetrics/opsの4枚組
TicketRow { sev, id, state, subj, tenant, plan, sla, assignee, selected }  // 選択と表示のみ・操作は詳細パネル
ImpersonationBanner { text, onEnd }                   // 全画面常設
AuditPush { type, action, res, tenant?, diff?, reason? }  // 操作系パーツは必ずpushAuditとセット
TenantScope { value: tScope, appliesTo: [tickets, ...] }
```

---

# 5. ロジック層カタログ（クラスメソッドのオブジェクト定義）

プロトのロジックは単一クラス（ユーザー面**95メソッド**＋クラスフィールド定数**48**、管理コンソール**14メソッド**）に集約されている。本実装ではこの1クラスを以下の**7つの責務オブジェクト**に分解する。メソッド名は実クラスからの全数抽出（2026-07-10）。

## 5.1 `ViewModelBuilders` — 画面のvals関数群 → セレクタ/フック

| プロトのメソッド | 責務 | 本実装 |
|---|---|---|
| `renderVals()` | 全画面共通の巨大view-model（毎render合成） | 画面別フックに分割（`useS1Vals()`等）。**「JSでprecompute・テンプレは単純バインド」の原則はセレクタ層に引き継ぐ** |
| `s1Vals` / `s5Vals` / `s7Vals` / `detailVals` / `stdVals` | S1/S5/S7/Office詳細/通常ビュー共通 | 各画面のセレクタ |
| `gsVals`・`ncVals`・`recVals`・`kwAddVals`・`kwTopoWatchVals`・`buyVals`・`cvModalVals`・`stage2Vals`・`tourVals`・`i18nVals`・`supportVals`・`wjVals` | 機能単位のvals | 機能フック。**戻り値オブジェクトへの乗せ忘れがアプリ全滅級**（ncVals baseバグの教訓）→ 型定義で防止 |

## 5.2 `Resolvers` — ID・参照解決 → ドメインサービス

`kwPageId` / `articlePageId` / `resolveKwOfficeId`（fuzzy: `kwTokenMatch`）/ `resolveArticleOfficeId`（完全一致のみ）/ `knowledgePageId` / `technicalPageId`（3値: local/links/crawl）/ `automationPageId` / `relatedOf` / `artForKw` / `kwRowForArt` / `articleForOutput` / `officePagesFor` / `topOfficePages` / `officeNavGroups`

- **規約**: 画面間リンクは文字列連結禁止・必ずresolver経由（`'ar_'+slug`デッドリンク #33の教訓）。resolverはnull返却可＝呼び出し側はnullで導線非表示。

## 5.3 `Builders` — 派生データ生成 → メモ化された派生状態

`buildKwPages` / `buildArticlePages`（KW_ROWS/ARTICLES全件→詳細ページ・固定定義をdeep-merge）/ `buildRoom`（FLOOR_HUE等）/ `derivePersonaStates` / `clusterKD` / `stageIdxOf` / `creditForecast` / `mkEnv` / `mdOf` / `aioCell` / `whfOk`（検索マッチャ: title+id+**kind**）/ `recFbOf`・`recFbSet`

- 静的正本（`DETAIL_PAGES`等の定数48種）＋動的上書き（`cur`合成のid分岐: st_credit/cc_rewrite/cc_danball/tk_local）の2層構造は、本実装では「マスタデータ＋セレクタでの実測値合成」に対応。

## 5.4 `NavigationController` — モード・画面遷移

`setMode`（`_stdReturn`スナップショット＝screen+全タブkey退避・modeVeil演出）/ `officeNav` / `openRoom`（officePageリセット）/ `openWb`（WB_MAP経由の通常画面オーバーレイ）/ `rmOn`（reduced-motion）/ `gsIndex`・`gsGo`（グローバル検索→直接ジャンプ。タブ追加時はGS_TABS同期必須）

## 5.5 `UXGuards` — 横断ガード → ミドルウェア/共通フック

`roGuard()`（閲覧専用ロールの編集ブロック・全編集ハンドラ先頭）/ `showToast`・`showUndoToast`（LABELS.msg辞書キー経由）/ `rejectApproval` / `exportCsv`（表示行と同一配列から生成）/ `kwAddRegister` / onEsc状態リスト（モーダル追加時に登録必須）

## 5.6 `Platform` — 基盤系

- **i18n**: `applyI18n` / `_i18nSwapAll` / `_i18nRestoreAll` / `curLocale`（描画後テキスト差し替え方式。本実装はメッセージキー方式に置換＝PT-Q）
- **マルチタブ同期**: `_mtEnabled` / `_mtFlush` / `_mtGet` / `_mtParse` / `_mtGuardOk` / `_mtToast`（localStorage経由。本実装はサーバ状態＋購読に置換）
- **ツアー**: `startTour` / `endTour` / `tourGo`（officeブランチあり） / `curTour` / `measureTour`
- **サポートチャット**: `spAsk` / `spSend` / `spEscalate` / `spNewSubmit` / `_spScore` / `SUP_GREETING` / `helpCtxFor`
- **ライフサイクル/演出**: `componentDidMount/DidUpdate/WillUnmount` / `tick` / `animateKpis` / `startBubbles` / `_overlays` / `_dlReceipt` / `_acqCur`・`_acqDirty`・`_w8Cur`・`_w8Dirty`（編集フォームのdirty管理→フォームライブラリへ）

## 5.7 管理コンソール（14メソッド）

`renderVals` / `supportDeskVals` / `admExpandVals` / `gsIndex`・`gsGo`・`gsVals`（ユーザー面と同型＝共通化候補）/ `pushAudit`（**操作系は必ずセット**）/ `flowOf`・`setFlow`（5ステップ統制フロー）/ `verOf`・`draftOf`（版・draft解決）/ `showToast`

---

# 6. 本実装への移行指針

1. **対応表として使う**: 本書のオブジェクト名をそのままReactコンポーネント名にする（`<SectionCard>`, `<FilterChips>` …）。プロトのインラインstyleはトークン（§1）＋バリアントpropsに畳む。
2. **文言はコンポーネントに持たせない**: label/message は全て i18n メッセージキーで受ける（PT-Q の本実装対応）。動的組み立て文（検出文・トースト・分析文）はキー＋パラメータ形式で設計。
3. **横断規約はコンポーネントに内蔵する**: roGuard（編集系の閲覧専用ガード）・onEscリスト登録・Undo/確認の使い分け・空状態必須・CSV単一ソース・フィルタ変更時の従属リセット。プロトで「毎回手で書いて漏れた」ものほど部品側に埋める。
4. **プロト側の追加改修は非推奨**: DCランタイムに部品機構が無いため、プロトでの共通化は行わない（コピーのまま凍結）。新パーツが必要になったら本書に追記してからプロトに書く。

---

# 7. 変更履歴

- v1.1（2026-07-10）: §5 ロジック層カタログを追加（クラスメソッド95＋管理14＋定数48の全数抽出→7責務オブジェクトに分解）。旧§5/§6は§6/§7に繰り下げ。
- v1.0（2026-07-10）: 初版。プロト実測（白カード92・主ボタン106・999pxチップ148・モーダル47・style-hover199・オフィスで見るピル16）に基づき通常ビュー14種＋Office 3群＋管理5種を定義。
