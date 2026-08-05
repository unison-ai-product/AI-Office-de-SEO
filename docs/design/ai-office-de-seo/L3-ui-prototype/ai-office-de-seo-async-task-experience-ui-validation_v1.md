---
document_id: AOS-PRE-L3-ASYNC-TASK-EXPERIENCE-UI-VALIDATION
title: 同期・非同期Task／待機体験 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# 同期・非同期Task／待機体験 画面検証仕様

## 1. 目的

処理量が増えても画面を処理完了待ちで占有せず、ユーザーが別業務を継続できる体験を検証する。待ち時間を隠すのではなく、即時受付、バックグラウンド継続、実stage、復帰、必要時だけの通知によって「待たされている時間」を「システムが働いている時間」へ変換する。

## 2. 同期／非同期の判定

| 分類 | 主な処理 | UI契約 |
|---|---|---|
| 同期 | 入力検証、選択、フィルター、表示切替、軽い設定参照、Command受付 | 操作結果を即時feedback。長い外部処理を待たない |
| 非同期interactive | ユーザー起動の分析、記事生成、リライト、画像、CMS送信、再診断 | 受付後にTask参照を返し、画面離脱可能。対話処理用Capacityを優先 |
| 非同期scheduled | 月次・週次計画、定期同期、差分解析、観測、再評価 | 実行窓とCapacityへ分散。予定と実行を分ける |
| 外部確認待ち | Provider、CMS反映、GSC、承認、ユーザー入力 | 処理中と区別し、誰／何を待つか、再確認予定を表示 |

同期APIが非同期Taskを受け付ける場合、`受付済み`は完了ではない。受付結果、Task参照、現在状態、取消可否、次に利用可能な業務を返す。

## 3. 通常ビューのTask Shelf

通常ビューには画面を塞がない小型Task Shelf／ヘッダーIndicatorを常設する。

- 受付直後に対象、目的、状態、開始見込みを追加する。
- 進行中Taskの件数だけでなく、`確認が必要／作業中／待機中／完了`を分ける。
- ユーザー判断が不要な進行更新でtoastを連発しない。
- 確認待ち、失敗、完了等の意味ある変化だけをpopup／通知Centerへ送る。
- Taskを開くと元のSite、記事、カテゴリー／テーマ戦略、Recommendation Contextへ復帰する。
- 画面遷移、tabを閉じる、再ログイン、端末変更でTaskを失わない。
- 他画面を操作できること、処理は継続することを初回だけ明示する。

### 3.1 全ページ表示と3秒data contract

- 顧客向けの全Navigation／page routeを表示し、裏側の処理未完了を理由にページを消さない。
- データ画面は標準利用条件のP95で3秒以内に、既存data、前回snapshot、部分結果、または理由付き状態を表示する。
- 3秒以内に最新分析を完了できない場合は、前回値＋更新中、分析済み範囲＋残範囲、またはTask状態を表示する。
- Plan／権限／接続不足でもページを非表示にせず、利用価値、現在利用できる範囲、解消操作を表示する。
- 3秒後も全面spinnerまたは空白のままにしない。

## 4. 進捗表現

| 計測可能性 | 表示 |
|---|---|
| 件数・stage総数が確定 | `12/40件`、完了stage、残stage、更新時刻 |
| stageは確定、作業量は不確定 | stage stepper＋現在stage。percentを出さない |
| 外部待ちで時間不確定 | 待機理由、最後の確認、次回確認、timeout／対応期限 |
| queue待ち | 実行待ち、優先区分、概算開始窓。内部queue順位は保証しない |
| 部分完了 | 利用可能になった成果と未完了範囲を分ける |

残り時間は観測値から範囲で算出できる場合だけ表示し、固定animation、一定速度で増えるpercent、最終段階で止まる偽progressを使わない。見込み変更時は更新理由を示す。

## 5. Agent Officeの仕事演出

Officeは同じTask／Event Projectionから次を表現する。

- `working`: 対応stageの机・設備・担当ペルソナで作業中。
- `waiting`: 外部応答、Capacity、依存Task、ユーザー判断待ちを別の姿勢・場所で表示。
- `blocked`: 対応が必要な対象を強調し、通常操作またはOfficeの型付き操作へ案内。
- `completed`: 成果が利用可能になった実event後だけ完了演出。

キャラクターが動くたびにLLMを呼ばず、Animationは状態機械から決定論的に導出する。複数Taskは全員を常時動かさず、現在見ている部屋では代表Task、Task Panelでは全件を表示する。Office描画やasset取得が遅い場合もTask処理を止めず、軽量2D／一覧へ縮退する。

## 6. 通知と注意の設計

通知強度はTask eventで分ける。

1. 即時対応: 承認期限、接続・課金・権限停止、公開前確認。
2. 通常通知: 成果完成、部分完了、再試行上限到達。
3. Centerのみ: stage進行、queue移動、定期観測完了。
4. 集約: 同一Taskの連続event、同種Batch完了は一件へまとめる。

通知をOFFにしてもアプリ内の確認待ちと失敗を消さない。担当者割当を通知受信の必須条件にしない。

## 7. 取消・離脱・復帰

- 取消可能時は、未開始、現在stage後、即時停止のどれかと影響を表示する。
- 外部副作用送信後など取消不能な段階は、取消ボタンを残して失敗させず、理由と可能な代替操作を示す。
- 再試行は同じTask／correlationを維持し、二重credit、二重生成、二重CMS送信を防ぐ。
- 画面を閉じても処理を取消扱いにしない。
- 完了後は成果、消費credit、CMS状態、次の判断へ直接遷移できる。

## 8. 検証fixture

| ID | 条件 | 期待体験 | 禁止する表現 |
|---|---|---|---|
| ASYNC-UI-01 | 記事生成を開始 | 即時受付、Task Shelfへ追加、他画面操作可 | 完了までModal固定 |
| ASYNC-UI-02 | 受付のみ成功 | `受付済み` | `記事が完成しました` |
| ASYNC-UI-03 | queue待ち | 実行待ちと開始窓 | 処理中percent |
| ASYNC-UI-04 | stageのみ既知 | stepper | 架空の47% |
| ASYNC-UI-05 | 40件中12件完了 | 12/40と部分成果 | 無限spinner |
| ASYNC-UI-06 | Provider待ち | 最終確認と次回確認 | Agentが執筆中と表示 |
| ASYNC-UI-07 | ユーザー承認待ち | 判断内容と期限を優先表示 | 作業中へ混在 |
| ASYNC-UI-08 | 画面離脱 | Task継続 | navigationで取消 |
| ASYNC-UI-09 | 再ログイン | 同じTaskへ復帰 | Task消失・再起動 |
| ASYNC-UI-10 | 複数Task進行 | 状態別件数と優先判断 | toast storm |
| ASYNC-UI-11 | 部分Report完成 | 完了領域を先に利用可能 | 全件完了まで空画面 |
| ASYNC-UI-12 | Office表示 | 実stageと一致した作業演出 | 固定時間の架空作業 |
| ASYNC-UI-13 | Office asset失敗 | 2D／一覧へ縮退 | Task処理も失敗扱い |
| ASYNC-UI-14 | reduced motion | Animationなしで同じ状態 | 状態理解をAnimation依存 |
| ASYNC-UI-15 | 取消可能 | 停止時点と影響Preview | 無条件の即時取消 |
| ASYNC-UI-16 | CMS送信済み | 取消不能理由と次操作 | 取消成功を偽装 |
| ASYNC-UI-17 | retry | 同じcorrelationで再開 | 新規Task・二重credit |
| ASYNC-UI-18 | 成果完成 | 成果・credit・次操作を通知 | 内部QAだけで完了通知 |
| ASYNC-UI-19 | 長時間見込み変化 | 新しい範囲と理由 | 予定時刻を無言で後退 |
| ASYNC-UI-20 | 通知OFF | Centerの確認待ちは維持 | 必須判断も非表示 |
| ASYNC-UI-21 | 全Navigationを初回表示 | 全page routeへ到達可能 | 未計算pageを隠す |
| ASYNC-UI-22 | data再計算が10分 | 3秒以内に前回値＋更新中 | 10分間全面spinner |
| ASYNC-UI-23 | 初回でdataなし | 3秒以内に構築stageと利用可能操作 | 空白page |
| ASYNC-UI-24 | Plan／権限不足 | 3秒以内にlock理由と解放条件 | page routeを削除 |

## 9. Finding記録

検証結果は`SF-UI-09`へ記録する。意味変更は`REQ-TECH-05/06`、`REQ-SCREEN-04/05/11`、`REQ-DESIGN-05/08`、`REQ-NFR-01/04`、Task／Event Projectionへ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
