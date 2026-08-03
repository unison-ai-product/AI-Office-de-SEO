---
document_id: AOS-L1-UI-AVAILABILITY-STATE
title: AI Office de SEO 画面利用可否・不足状態表示マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# 画面利用可否・不足状態表示マップ

## 1. 原則

利用できない理由を一律の「ロック」へ潰さない。画面、通常ビュー、Office、APIは同じAvailability Decisionを使用し、表示制御だけで認可しない。複数理由がある場合は全reasonを保持し、ユーザーが最初に解消できる`primary_reason`を一つ選ぶ。

## 2. 判定順と表示

| 優先 | reason class | 画面動作 | 主な導線 |
|---:|---|---|---|
| 1 | `out_of_scope / not_found` | 対象自体を表示しない。存在を漏らさない | Site／組織を選び直す |
| 2 | `account_or_site_suspended / security_hold` | 書込みと自動実行を停止。許可された閲覧・出力だけ残す | 契約・security・support |
| 3 | `platform_incident / feature_fault` | ユーザー設定不足やPlanロックに偽装しない | 状況、影響、再試行、status／support |
| 4 | `permission_denied / step_up_required` | 操作不可。データは可視範囲だけ表示 | 権限依頼、再認証 |
| 5 | `unsupported / capability_missing / update_required` | 未対応または一部制限。安全な縮退だけ提示 | Plugin更新、別下書き、持ち出し等 |
| 6 | `plan_locked / capacity_locked` | 上位機能Previewまたは利用量を表示 | Plan変更、容量option。障害時に出さない |
| 7 | `connection_required / auth_expired` | 接続に依存する実行だけ停止 | 再接続、認証、Plugin確認 |
| 8 | `data_insufficient / source_stale / analysis_in_progress` | 推定を実績にせず、利用可能範囲を段階開放 | 入力追加、分析完了待ち、再取得 |
| 9 | `budget_or_credit_insufficient` | Provider呼出し前に保留 | credit購入、品質変更、上限変更、中止 |
| 10 | `consent_or_approval_required` | 成果・差分を保持し副作用だけ停止 | 同意、承認、差し戻し |
| 11 | `queued / processing / verifying` | 重複起動を防ぎ、進捗・取消可否を表示 | Task／Office詳細、停止・再開 |
| 12 | `empty / ready` | 空状態の次操作または通常操作を表示 | Site設定、Keyword登録、推薦等 |

上位priorityだから下位理由を破棄するわけではない。例として、障害中かつPlan対象外なら障害をprimaryにし、障害解消後にPlan条件を再判定する。権限のない機能へPlan購入を勧めず、接続不足をデータ不足として表示しない。

## 3. 状態とCTA

- `blocked`: 操作不能。理由と解消可能性を示す。
- `degraded`: 一部利用可能。利用できる範囲と欠ける結果を示す。
- `preview`: Plan上位機能の価値説明。実データらしい架空値を表示しない。
- `partial`: Source／分析の一部だけ成立。coverageと未分析範囲を示す。
- `pending`: queue、processing、approval、verification。
- `ready`: 操作可能。

CTAは`user_action / wait / contact_support / upgrade / retry / none`へ分類する。開発用の経路名、内部error stack、Provider名、low-level permissionを顧客へ表示しない。Support／FAQ Chatへはdiagnostic code、対象、user-visible原因、試行済み操作を渡す。

## 4. 画面適用

一覧・Card・詳細・Modal・Office設備は同じAvailabilityを使う。一覧で有効なのに詳細で接続不足、通常ビューで不可なのにOffice会話で実行可能等の差を作らない。状態が変化した場合、共通eventから再評価する。

数値予測はPlan条件とデータ条件を分ける。Entryは`plan_locked`、Standard以上でも直近1か月1,000click等を満たさない対象は`data_insufficient`とし、予測可能対象と不足対象を分けて表示する。

## 5. 根拠

`REQ-SCREEN-01/03/15/18`、`REQ-ACCESS-14〜16`、`REQ-BILLING-03/13/14`、`REQ-INT-05/09`、`REQ-NFR-01/02/10`。

