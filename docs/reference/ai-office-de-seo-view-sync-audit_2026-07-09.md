# 通常ビュー⇄Officeビュー 画面マップ・不整合監査（2026-07-09）

## 背景・目的

2026-07-08〜09にかけて通常ビュー（S1〜S7）を繰り返し大改修（タブの新設・分割・改名・移設）した結果、
Officeビューの各部屋パネル（`ROOM_DATA[room].options` → `WB_MAP` → `openWb()`）が古いタブ構成を参照したまま
取り残されている箇所を確認した。本書はその全量監査結果（画面マップ）と修正方針を記録する。

正本: `prototype/AI Office de SEO.dc.html`（単一DC）。通常ビューのタブ構成そのものは
`docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md` §1 が正本で、
コードと一致していることを確認済み（今回の不整合はOfficeビュー側のみ）。

## 現在の通常ビュー タブ構成（正本・コード確認済み）

| 画面 | state key | タブ（key: label） |
|---|---|---|
| S2 キーワード管理 | `kwTab` | list: キーワード一覧 / map: クラスター図 / inq: 流入クエリ / query: クエリ分析 / watch: 順位モニタリング / promo: 対策候補キーワード |
| S3 コンテンツ作成 | `ctTab` | create: 作成する / progress: ライブ生成 / calendar: カレンダー / output: 生成履歴 |
| S4 オートメーション | `auTab` | approve: 承認 / sched: 予約 / auto: おまかせ運用 / budget: 予算管理 / goal: 目標管理 / kill: 緊急停止 |
| S5 サイトページ管理 | `anTab` | pages: ページ一覧 / traffic: 流入ページ / topo: カテゴリーツリー / rewrite: リライト（種別: link/rank/cv/flash） / bench: 上位ベンチマーク / index: テクニカル分析 |
| S6 ナレッジ管理 | `knTab` | strategy: 戦略入力 / wish: 要望・NG / style: 文体 / rule: 執筆ルール / winner: 成功学習 / cv: CVポイント台帳 |
| S7 設定 | `seTab` | site: 組織設定 / acq: データ設定 / billing: お支払い・通知 / security: セキュリティ / other: その他 |

## 根本原因（コード上のバグ）

`openWb(roomId, opt)`（`AI Office de SEO.dc.html:7281`）はOffice部屋パネルの選択肢クリックを通常ビューへ着地させる
唯一の経路だが、`WB_MAP[opt]` から拾って`next`へ反映するstateキーが**ハードコードされた許可リスト**になっている:

```js
if (m.kwTab) next.kwTab = m.kwTab;
if (m.anTab) next.anTab = m.anTab;
if (m.anRwKind) next.anRwKind = m.anRwKind;
if (m.unassigned) next.kwFilters = {...};
if (m.ctKind) { next.ctKind = m.ctKind; next.ctSel = 0; }
if (m.job1) next.jobDetail = {...};
```

S2（`kwTab`）とS5（`anTab`）は許可リストに含まれているため正しく機能するが、**S3の`ctTab`・S4の`auTab`・
S6の`knTab`・S7の`seTab`が抜けている**。これらは2026-07-08のタブ分割（S3カレンダー新設・S4予算/目標管理新設・
S6成功学習/CVポイント台帳新設・S7 5タブ再編）で導入されたキーであり、`openWb()`は当時更新されなかった。
結果、これら4画面をOfficeから開くと**必ず既定タブ（create/approve/strategy/site）に着地し、
クリックした選択肢の内容には辿り着けない**。

## 部屋ごとの監査結果

### ✅ 問題なし

| 部屋 | 備考 |
|---|---|
| `keyword_research`（S2） | `WB_MAP`が`kwTab`を正しく指定済み。軽微な冗長（「クラスター図」「ギャップマトリクス」が同じ`kwTab:'map'`）はあるが実害なし。`流入クエリ`/`順位モニタリング`は選択肢に未反映（対応不要判断・後述） |
| `technical_seo` | `anTab:'rewrite'/'index'`を正しく指定済み。修正不要 |

### 🔴 要修正

| 部屋 | 選択肢（現状） | 現状の着地先 | 本来の着地先 | 問題 |
|---|---|---|---|---|
| `automation`（S4） | 承認待ち | `screen:'automation'`（タブ指定なし＝既定`approve`） | `auTab:'approve'` | たまたま既定と一致（脆弱） |
| | 投稿予約・下書き | 同上 | `auTab:'sched'` | ❌ 常に`approve`に誤着地 |
| | おまかせ運用の設定 | 同上 | `auTab:'auto'` | ❌ 常に`approve`に誤着地 |
| | 緊急停止 | 同上 | `auTab:'kill'` | ❌ 常に`approve`に誤着地（最重要機能なのに到達不可） |
| | （欠落） | — | `auTab:'budget'`（予算管理） | 選択肢が存在しない |
| | （欠落） | — | `auTab:'goal'`（目標管理） | 選択肢が存在しない |
| `knowledge`（S6） | ユーザー要望の管理 | `screen:'knowledge'`（タブ指定なし） | `knTab:'wish'` | ❌ 常に`strategy`に誤着地 |
| | ターゲット軸・主張軸 | 同上 | `knTab:'strategy'` | たまたま既定と一致（脆弱） |
| | サイト方針・執筆ルール | 同上 | `knTab:'rule'` | ❌ 常に`strategy`に誤着地 |
| | サンプル記事の型 | 同上 | `knTab:'style'` | ❌ 常に`strategy`に誤着地 |
| | （欠落） | — | `knTab:'winner'`（成功学習） | 本セッションで大幅拡充した目玉機能が非掲載 |
| | （欠落） | — | `knTab:'cv'`（CVポイント台帳） | 選択肢が存在しない |
| `settings`（S7） | サイト・メンバー管理 / Google連携・WordPress連携 / 通知設定 / クレジット・請求 | 全て`screen:'settings'`（タブ指定なし） | site / acq / billing / billing | ❌ 全項目が旧6タブ時代の粒度のまま。全て`site`に誤着地。**ユーザーが指摘した不整合はここ** |
| `traffic_report`（S5） | クエリ一致の品質 / AI検索の影響 | `screen:'keywords', kwTab:'query'` | （着地先自体は正しい） | ⚠️ 2026-07-08のIA再編でこの内容はS2「クエリ分析」へ移設済み。**"レポート分析"の部屋にいるのに別の部屋（キーワード管理）へ飛ぶ**導線になっており、部屋の文脈と一致しない |
| | （欠落） | — | `anTab:'traffic'`（流入ページ） | 部屋名の由来そのものの新タブが選択肢に無い |
| | （欠落） | — | `anTab:'bench'`（上位ベンチマーク） | 選択肢が存在しない |
| `content_creation`（S3） | 生成プレビュー・品質チェック結果 | `screen:'content'`（タブ指定なし＝既定`create`） | `ctTab:'progress'`（ライブ生成） | ❌ 常に`create`に誤着地（`ctTab`もopenWbの許可リストに無いため） |
| | （欠落） | — | `ctTab:'calendar'`（カレンダー） | 新設タブが選択肢に無い |

グローバル検索（`GS_SETTINGS`/`gsIndex()`, `AI Office de SEO.dc.html:8722-8743`）も同根の問題を持つ:
`gsIndex()`は設定項目のみ`state: {}`で登録しており（キーワード・記事・タスクの検索結果は`state`にタブ情報を積んでいる）、
検索結果から設定項目を選んでも`seTab`が渡らない。ただし`gsGo()`自体は`e.state`をそのまま展開する作りのため、
`GS_SETTINGS`側に`seTab`を追加するだけで解決できる（`openWb()`のような改修は不要）。

## 修正方針

1. **`openWb()`に`ctTab`/`auTab`/`knTab`/`seTab`の反映を追加**（根本原因の解消。4行追加のみ）。
2. **`ROOM_DATA.automation` / `.knowledge` / `.settings` / `.traffic_report` / `.content_creation` の
   `options`配列と`recTarget`、および`WB_MAP`の対応エントリを現行タブ構成に合わせて全面更新**。
   - automation: 6項目（承認待ち／投稿予約・下書き／おまかせ運用の設定／予算管理／目標管理／緊急停止）に拡張。
   - knowledge: 6項目（＋成功学習／CVポイント台帳）に拡張。
   - settings: 現行5タブに合わせて4項目→5項目に更新（旧6タブ時代の粒度を廃止）。
   - traffic_report: 他部屋（キーワード管理）へ越境する2項目を、部屋固有の新タブ（流入ページ／上位ベンチマーク）に差し替え。
   - content_creation: 「生成プレビュー・品質チェック結果」の着地先を`ctTab:'progress'`に修正し、「カレンダー」を追加（5項目）。
3. **`GS_SETTINGS`に`seTab`を追加し`gsIndex()`のsettings行で`state:{seTab:s.seTab}`を渡す。**
4. 新規・変更ラベルはUI文言（chrome）として`TXT.en`に追加（対象タブの既存ラベル文字列と一致させれば辞書を再利用できる箇所は再利用）。
5. `keyword_research`と`technical_seo`は変更不要（現状で正しく機能している対照群として確認済み）。

修正は `prototype/CLAUDE.md` 方針・memory `orchestrate-with-sonnet-workers` に従い実装をSonnetワーカーへ委任し、
本メイン（オーケストラ）がpreview実機で検収する。

## 実施結果（第1ラウンド・完了）

上記1〜5すべて実装・検収済み。`openWb()`に4行追加、`WB_MAP`22エントリ更新（旧8キー削除）、`ROOM_DATA`5部屋の
`options`/`recTarget`更新、`GS_SETTINGS`/`gsIndex()`更新、`TXT.en`に新規11キー追加。preview実機で6ルーティング
（automation/knowledge/settings/content_creation/traffic_report/keyword_research回帰）＋`gsGo()`経由の1件を
`window.__aos`直接呼び出しで検証、全て期待どおりの着地を確認。タグバランス変更前と完全一致（sc-if 352/352・
sc-for 169/169・div 1563/1563・button 425/425・svg 89/89・section 94/94）。consoleエラー0。

## 追加監査（第2ラウンド）: `openWb`/`WB_MAP`経路以外の直接`setState`呼び出し

ユーザー確認「もれなし？」を受け、`this.setState({screen:'automation'|'settings', ...})` を直接呼ぶ全箇所を
grepで再監査（`openWb`/`WB_MAP`を経由しない、通知・DETAIL_PAGES CTA・S3カレンダー・CRO/リライト系「適用」ボタン等）。
同じ「タブキー未指定→既定タブに固定着地」バグが**12箇所**で見つかり、修正済み。

| # | 箇所 | 呼び出し元 | 修正内容 |
|---|---|---|---|
| 1 | `AI Office de SEO.dc.html`（DETAIL_PAGES kw_gift cta） | Office詳細ページ「通常ビューで差分を承認」 | `auTab:'approve'` を追加 |
| 2 | 同（`ctCalGoAuto`） | S3カレンダー「予約の変更はオートメーションへ」 | `auTab:'sched'` を追加 |
| 3 | 同（`ncVals()`内 通知「承認依頼」） | ヘッダー通知「差分を確認」 | `auTab:'approve'` を追加 |
| 4 | 同（`ncVals()`内 通知「WordPress接続」） | ヘッダー通知「設定へ」 | `seTab:'acq'` を追加 |
| 5 | 同（`gsIndex()` job J-1018） | グローバル検索結果 | `state:{}` → `state:{auTab:'approve'}` |
| 6 | 同（`stubBilling`） | クレジット購入完了後の導線 | `seTab:'billing'` を追加 |
| 7 | 同（`s5Vals()` cvCatalog `onFix`） | S5 CVポイント台帳「有効期限切れ→直す」 | `auTab:'approve'` を追加 |
| 8 | 同（`s5Vals()` cvCro `onApply`） | S5 コンバージョン改善CRO提案「適用」 | `auTab:'approve'` を追加 |
| 9 | 同（`s5Vals()` winnerRows `onRipple`） | S5 好調記事分析「波及リンクを適用」 | `auTab:'approve'` を追加 |
| 10 | 同（`s5Vals()` `flashApply`） | S5 スモールリライト「案を適用」 | `auTab:'approve'` を追加 |
| 11 | 同（`s5Vals()` idxIssues `onFix`） | S5 テクニカル分析「問題を直す」 | `auTab:'approve'` を追加 |
| 12 | 同（S1おすすめ `rec_fix.run`） | S1ダッシュボードおすすめ「内部リンクを実行」 | `auTab:'approve'` を追加 |

**対象外と判断**（バグではない）: `goAutomation`/`goSettings`/`goKnowledge`/`goContent`ほかサイドメニュー・
ドロワー・`navXxx`系の一般ナビゲーション。これらは画面の既定タブへ着地させる設計そのものであり、
特定タブへ誘導する必要がない。

**低確信のため見送り（未対応）**: ヘッダー通知「注目キーワード: 3クラスタが基準を超えました」→
`screen:'keywords'`（`kwTab`未指定・既定`list`）。対応するタブが`map`（クラスター図）なのか`promo`
（対策候補）なのか、一意に断定できる根拠がコード上に無いため変更していない。誤った断定で新たな不整合を
作るリスクを避けた。次回この通知の意味を仕様側で明確化できたら着地先を決める。

**検収**: 12箇所すべてを`window.__aos`経由（`stage2Vals().ctCalGoAuto()`／`stdVals().stubBilling()`／
`gsIndex()`+`gsGo()`／`ncVals().ncRows[].onGo()`／`DETAIL_PAGES.keyword_research[kw_gift].cta.onClick()`／
`s5Vals()`の`flashApply`・`idxIssues[].onFix`・`cvCatalog[].onFix`）で直接呼び出し、期待どおりの
screen/tab着地を実機確認。タグバランス・consoleエラーとも第1ラウンドから変化なし（JSオブジェクトのみの変更）。

## 第3ラウンド: `claude-fable-5`による独立監査（ブラインド・アドバーサリアル）

ユーザー指示「あるべき配線では懸念をすべて調査して調査後にFableに相談して報告してくれ」を受け、
第1・第2ラウンドの作業経緯を一切共有しない独立エージェント（`model: fable`, Explore型・読み取り専用）に
`AI Office de SEO.dc.html`全体を再監査させた。狙いは自分自身の監査の見落とし（確証バイアス）を
別モデルの視点で洗い出すこと。

Fableの指摘（A〜H、8項目）はいずれも同じバグパターン（`ctTab`/`kwTab`等のタブキー未指定→既定タブに
固定着地）の追加インスタンスで、第1・第2ラウンドの监査網羅から漏れていた箇所だった。

| # | 箇所 | 問題 | 修正内容 |
|---|---|---|---|
| A | `volWatchGo`/`volPinAdd`（S1 順位変動アラート系） | `kwTab:'list'`固定・本来は`watch`（順位モニタリング） | `kwTab:'watch'`に修正 |
| B | `volAlerts`（S1 アラート一覧） | 全行が単一の`volAlertGo`で同じ画面に固定着地・行ごとの内容と不一致 | 行ごとに`go:{screen,anTab,anRwKind}`を持たせ`.map()`で`onGo`を動的生成。`volAlertGo`削除 |
| C | S3/S4/S6/S7への汎用「見直す」系導線6箇所 | タブ未指定で既定タブに固定着地 | `navAutomationApprove`/`navKnowledgeCv`/`navSettingsAcq`/`navContentProgress`/`knGoStrategy`/`goRewriteGeneric`を新設し8箇所のボタンを再結線 |
| D | `anBenchRows`（S5 上位ベンチマーク） | 行ごとの「新規作成」／「リライト」の別を無視し固定着地 | `.map()`で`make`フラグに応じた`onGo`（`ctKind:'new'|'rewrite'`）を付与 |
| E | S2/S3系「新規記事を作成」「リライトを開始」相当ボタン12箇所（`kwGapCreate`・`promos`の採用ボタン・`whDetailRewrite`・`kwMakeNew`・`kwReserveNew`・`kwGoRewrite`・S5「リライト」`onAct`・`briefStart`・`onProtectRewrite`・レコメンドカード`run`×2） | `ctKind`のみ指定し`ctTab:'create'`が無いため、S3内で別タブを見ていると`ctKind`選択UIが不可視のまま着地（`ctKind`セレクタは`ctTabCreateOn`ブロック内でのみ描画） | 全12箇所に`ctTab:'create'`を追加 |
| F | `WB_MAP`の`'新規記事を作成'`/`'リライトを開始'`エントリ | 同上（`ctKind`のみで`ctTab`欠落） | 両エントリに`ctTab:'create'`を追加 |
| G | `gsIndex()`の通知3件の登録 | `screen:'notifs'`という**存在しない画面名**を指定（正しくは`'notifications'`）。タブ誤着地ではなく**白画面バグ** | `screen:'notifications'`に修正 |
| H | `DETAIL_PAGES.content_creation`の`cc_rewrite`カード CTA | `ctTab`未指定で既定`create`に固定着地・本来は「タスク進捗」（ライブ生成） | `ctTab:'progress'`を追加 |

修正はSonnetワーカーへ委任（既存の`orchestrate-with-sonnet-workers`方針）。1回目の委任は
「修正E: 12件。ひとつずつ探す」で処理途中に停止したことを完了報告から検知し（`grep`で
E/F/G/H未反映を確認）、同一エージェントを`SendMessage`で再開して残り4項目を完遂させた。

**追加修正（Fableの推奨を採用）**: 第2ラウンドで「低確信のため見送り」としていたヘッダー通知
「注目キーワード: 3クラスタが基準を超えました」の着地先について、Fableは以下の根拠から
`kwTab:'promo'`（対策候補タブ）が妥当と判定（中〜高確信）: (1) S2の「対策候補キーワード」タブが
KPIカードで「クラスタ」という語を使っている、(2) `PROMOS`配列の要素数が通知文言の「3クラスタ」と
整合、(3) 通知文言中の「基準を超えました」という用語がpromoタブの表示ロジックと一致。
この判定を採用し、`ncVals()`の該当`onGo`に`kwTab:'promo'`を追加した。

**検収**: A〜Hすべてをgrepで独立再確認（ワーカーの完了報告を鵜呑みにせず、修正前の第1回委任が
E以降未着手だった実績を踏まえて必須の手順とした）。さらに`window.__aos`実機で以下を直接呼び出し
確認: `openWb('content_creation','リライトを開始'/'新規記事を作成')`（F）、`gsIndex()`の通知エントリ
`screen`値（G）、`ncVals().ncRows[]`の該当通知`onGo()`→`kwTab:'promo'`着地（Fable推奨の追加修正）、
`DETAIL_PAGES.content_creation[cc_rewrite].cta.onClick()`（H）、`stdVals()`の`briefStart`/`kwGapCreate`/
`navAutomationApprove`/`navKnowledgeCv`/`navSettingsAcq`/`navContentProgress`/`knGoStrategy`（C・一部E）、
`s5Vals()`の`winnerRows[].onProtectRewrite`（E）、`volWatchGo`/`volPinAdd`（A）、`volAlerts[0].onGo`（B）、
`anBenchRows[].onGo`（D）。全て期待どおりのscreen/tab着地を確認、consoleエラー0。タグバランスは
第1ラウンド以降と完全一致（sc-if 352/352・sc-for 169/169・div 1563/1563・button 425/425・svg 89/89・
section 94/94）——3ラウンド通じて構造変更ゼロ、JSオブジェクトの値のみの修正であることを裏付ける。

**総括**: 3ラウンドの監査で計 4（openWb本体）+ 22（WB_MAP）+ 12（第2ラウンド直接setState）+
8（第3ラウンドFable指摘）+ 1（低確信保留分の確定）= 実質40箇所超のOfficeビュー内ルーティング不整合を
修正。自己監査（第1・第2ラウンド）だけでは第3ラウンドの8箇所を発見できなかった点は、独立視点の
アドバーサリアル監査（Fable）の有効性を裏付ける。
