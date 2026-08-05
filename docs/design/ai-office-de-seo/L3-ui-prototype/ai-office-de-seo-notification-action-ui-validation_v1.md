---
document_id: AOS-PRE-L3-NOTIFICATION-ACTION-UI-VALIDATION
title: 業務通知・Dashboard要対応・通知Center 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# 業務通知・Dashboard要対応・通知Center 画面検証仕様

分類別L1と`AOS-L1-NOTIFICATION-RECIPIENT-ROUTING`を現行要求の正本とし、本書はpre-L3の画面検証入力である。顧客向け業務通知、ユーザー向けTask History、内部alert／incident／監査logを混同しない。

## 1. 目的

ユーザーが必要な判断を見落とさず、通知過多にもならず、対象業務へ2遷移以内で到達できる画面を検証する。popup、通知Center、Dashboard、emailは別々の業務事実を作らず、同じNotificationと対象Resourceを異なるchannel／表示密度で投影する。

## 2. 表示面の責務

| 表示面 | 主な役割 | 表示対象 | 正本性 |
|---|---|---|---|
| Dashboard要対応 | 今日判断すべきものを優先順で集約 | 承認期限、停止、今週予定、Recommendation、完了・評価 | Resource状態から導出する業務inbox |
| popup／toast | ログイン中の即時注意 | 即時設定された新しいevent | 補助。閉じても履歴を消さない |
| 通知Center | 後から確認・検索・遷移 | 全通知class、状態、対象、期限 | 顧客向け通知の正本 |
| email | 非ログイン時の補助到達 | 購読・必須Policyに合う要約 | 補助。本文・secretを持たない |
| Office詳細 | 通知に関連するTask・Agent・原因・履歴・影響 | 同じNotification／Resource | 別Notificationを作らない |

Dashboardは通知Centerの未読件数順ではなく、`承認期限 → 停止 → 期限付き今週予定 → 新Recommendation → 完了・評価`の業務優先順を使う。同じResourceに複数通知があっても、Dashboardでは必要判断を一件へ集約し、Centerでevent履歴を確認できる。

## 3. Notification・Recipient・channel

一つの業務eventからNotificationを生成し、recipientごとのdelivery、read、acknowledgedを持つ。popup、Center、emailを別Notificationとして数えない。同一correlation・同一状態・同一recipientの再送は重複させないが、状態変更、期限接近、重要度上昇、再発は新しい通知versionまたはreminderとして表示できる。

受信者はResourceの可視Scope、必要Permission、起動者、購読、Site／tenant既定、必須Policyからserverで解決する。action requiredで実行可能者が0人ならサイトオーナー、契約・請求は契約者へfallbackする。fallbackはPermission付与ではないため、操作不能な受信者には適格者への権限／Site付与または受信者設定の導線を示す。

membership、Site付与、Permissionが通知後に変わった場合、通知を受け取った事実でResourceを開けるようにしない。開く時点で再認可し、閲覧不能なら機密detailを隠してアクセス変更と次の相談先を表示する。

## 4. 状態

| 状態 | Scope | 意味 |
|---|---|---|
| unread／read | recipient個人 | 見たかどうか |
| acknowledged | recipient個人 | 内容を確認した記録 |
| actioned | Resource／Notification共通 | 対象業務が完了・解消した |
| archived | recipient個人または保持Policy | 通常一覧から退避した |

既読は対応済みを意味しない。誰かが承認、再認可、支払い等を完了した場合は対象Resource eventから全recipientの通知を`actioned`へ同期し、他ユーザーに未処理として残さない。一方、あるユーザーのreadを他ユーザーのreadへ伝播しない。対象が削除・移管・失効した場合は消去せず、結果状態と安全な遷移先を表示する。

## 5. 通知class・OFF・digest

- `action_required`と`continuity`はin-app Centerを完全OFFにできない。
- `task_result`、`recommendation`、`informational`はOFF／digestを選べる。
- emailをOFFにしてもSite既定で黙って再有効化しない。
- email bounce／suppressionはemail deliveryだけを止め、in-appへ影響させない。
- action_requiredのdigest設定は判断期限を越えて遅延させず、Centerへ即時登録する。
- 通知OFFでもDashboardのResource由来の必須判断項目を消さない。

購読設定画面はuser、Site既定、tenant既定、Platform必須Policyの適用結果を説明し、最終的に何がどのchannelへ届くかをPreviewできる。内部event名やtopicをユーザーへ設定させない。

## 6. Lifecycle文言

| event | 表示文言 |
|---|---|
| Generation Outcome | 成果が完成しました |
| CMS draft verified | CMSに下書きを作成しました |
| approval required | 確認をお願いします |
| Publication Job handoff | 公開処理へ引き渡し済み |
| scheduled | 予約済み（公開待ち） |
| Publication Fact | 公開／更新を確認済み |
| Evaluation Registration | 評価を開始 |
| Loop Completion | 運用サイクルを開始できました／評価予定を登録しました等、評価成功と誤認しない表現 |

予約、API受付、Job handoff、外部変更、unknown_sourceを公開完了通知にしない。`task_result`としての成果完成とCMS／公開状態を別通知eventのまま保つ。

## 7. 遷移・安全・保持

通知は対象Resourceの正本画面・tabへ直接遷移し、AvailabilityとAuthorizationを再判定する。通常ビューでは必要判断、期限、影響、推奨操作を簡潔に示し、Officeでは同じ対象のTask、Agent、原因、履歴、影響へ進める。通知からのActionも正規Commandを使い、email linkやpopupだけで承認・公開・支払いを確定しない。

emailは短い要約と認証付き製品URLだけを持ち、記事本文、差分全文、Prompt、secret、支払情報を埋め込まない。通常通知は既定90日で削除または集約できるが、課金、権限、公開、同意等の監査記録は通知Center保持と別の監査Policyで保持する。

## 8. 3秒表示契約

Dashboard、通知Center、通知設定、対象Resourceを常時表示対象にする。標準利用条件P95 3秒以内に保存済み通知、未処理数、部分結果、または理由付き状態を表示する。recipient再計算、digest生成、email delivery、関連Task集約を待って全面spinnerにしない。大量通知はserver-side pagingとclass／状態／Site filterを使う。

## 9. 検証fixture

| ID | 条件 | 期待表示・操作 | 禁止する実装 |
|---|---|---|---|
| NOTIFY-UI-01 | 承認期限あり | Dashboard最上位＋Center | 未読順だけで配置 |
| NOTIFY-UI-02 | 接続停止あり | 承認後の停止枠 | 完了通知より下へ埋没 |
| NOTIFY-UI-03 | 同一eventを3channel配信 | 一つのNotification | 3件としてbadge加算 |
| NOTIFY-UI-04 | popupを閉じる | Centerに残る | Notification削除 |
| NOTIFY-UI-05 | Aだけread | Aはread、Bはunread | 全員read |
| NOTIFY-UI-06 | Bが承認完了 | 全員actioned | Aへ未処理を残す |
| NOTIFY-UI-07 | 同一event再送 | 重複抑止 | toast再表示 |
| NOTIFY-UI-08 | 期限接近 | reminderとして更新 | dedupeで完全抑止 |
| NOTIFY-UI-09 | 状態が再発 | 新version／再発表示 | 過去actionedへ吸収 |
| NOTIFY-UI-10 | 実行可能recipient 0 | Site owner fallback | 通知消失 |
| NOTIFY-UI-11 | fallback ownerにPermissionなし | 付与・設定導線 | 操作可能と偽装 |
| NOTIFY-UI-12 | 請求通知 | 契約者fallback | 記事業務者へ一斉送信 |
| NOTIFY-UI-13 | 通知後にSite付与取消 | detailをdenyし案内 | 通知を権限として閲覧 |
| NOTIFY-UI-14 | action_requiredをOFF操作 | Center必須を説明 | 完全OFF |
| NOTIFY-UI-15 | task_resultをOFF | popup／emailを停止可能 | 必須通知まで停止 |
| NOTIFY-UI-16 | email OFF | 設定維持 | Site既定で再ON |
| NOTIFY-UI-17 | email bounce | in-app継続 | 全channel停止 |
| NOTIFY-UI-18 | digest期限後に配信予定 | Center即時＋期限前通知 | 期限後まで隠す |
| NOTIFY-UI-19 | 通知OFF・承認待ち | Dashboard要対応は維持 | 判断項目も非表示 |
| NOTIFY-UI-20 | Outcome成立 | 成果完成 | 公開完了 |
| NOTIFY-UI-21 | CMS draft成立 | 下書き作成 | 公開完了 |
| NOTIFY-UI-22 | Job handoff | 公開処理へ引渡し済み | 公開確認済み |
| NOTIFY-UI-23 | 予約成立 | 公開待ち | 公開済み |
| NOTIFY-UI-24 | Publication Fact | 公開／更新を確認済み | API受付時点で通知 |
| NOTIFY-UI-25 | external_change | 外部変更 | AI Office公開完了 |
| NOTIFY-UI-26 | Evaluation登録 | 評価開始 | 成功判定 |
| NOTIFY-UI-27 | 通知から承認へ | W4へ直接、2遷移以内 | Dashboardを経由強制 |
| NOTIFY-UI-28 | Officeで詳しく見る | 同じResource詳細 | 別Notification生成 |
| NOTIFY-UI-29 | email link | ログイン・再認可後に表示 | link clickだけで承認 |
| NOTIFY-UI-30 | Resource削除済み | 終端状態と代替導線 | 無説明404 |
| NOTIFY-UI-31 | 通常通知90日超 | 削除／集約 | 監査記録も同時削除 |
| NOTIFY-UI-32 | 通知10万件 | paging・filter | 全件初期取得 |
| NOTIFY-UI-33 | Recipient計算遅延 | 3秒以内に保存済み状態 | 全面spinner |
| NOTIFY-UI-34 | 内部incident | 内部管理面だけ | 顧客Centerへ表示 |

## 10. Finding記録

検証結果は`SF-UI-13`へ記録する。意味変更は`REQ-SCREEN-01/19`、Notification Recipient Routing Map、Authorization Operation Matrix、`INV-NOTIFY-UI-001`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
