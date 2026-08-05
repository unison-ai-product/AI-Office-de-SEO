---
document_id: AOS-PRE-L3-CMS-PUBLICATION-UI-VALIDATION
title: 生成成果・CMS下書き・承認・公開反映 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# 生成成果・CMS下書き・承認・公開反映 画面検証仕様

分類別L1を現行要求の正本とし、本書の画面案とfixtureはpre-L3の検証入力である。`REQ-WPA-*`等の詳細要求は現行分類別要求を補足する参照であり、衝突時に優先しない。

## 1. 目的

記事が完成した事実、CMSへ下書きを作成した事実、ユーザーが公開を承認した事実、公開処理を予約・実行した事実、外部CMSで公開・更新を確認した事実、評価対象へ登録した事実を一つの「完了」へ丸めない画面を検証する。全ページは常に到達可能とし、CMSや外部確認が長時間化しても、データ画面は標準利用条件P95 3秒以内に判断可能な既存データ、部分結果、または理由付き状態を表示する。

## 2. Lifecycleと画面文言

`Generation Outcome → CMS Delivery → CMS下書き → Publication Decision → 承認／自動運用判定 → Publication Job → 外部検証 → Publication Fact → Evaluation Registration`

| 状態 | 通常ビューの文言 | 意味しないもの |
|---|---|---|
| Generation Outcome成立 | 成果が完成しました | CMSへの下書き作成、外部公開の完了 |
| CMS Delivery準備中 | CMSへ送信準備中 | 生成の再実行 |
| draft_created／verified | 下書きを作成しました | ユーザー承認、公開完了 |
| Approval待ち | 確認をお願いします | Previewを開いた事実だけでの承認 |
| Publication Job予約 | 予約済み（公開待ち） | 公開済み、15件への算入 |
| Job handoff／API受付 | 公開処理へ引き渡し済み | 外部反映の確認 |
| verification_pending | 外部反映を確認中 | 失敗または成功の確定 |
| Publication Fact成立 | 公開／更新を確認済み | 外部変更をAI Office実績へ算入すること |
| Evaluation Registration | 評価を開始 | 施策成功の確定 |

## 3. 通常ビュー

通常ビューは現在地、次に必要なユーザー判断、WordPressで編集、実表示をプレビュー、承認、差し戻し、予約／公開の操作だけを優先表示する。内部のhash、idempotency key、再照合方式を操作項目にしない。CMS待機中も記事画面、成果、差分、Task Shelf、別画面を利用でき、画面全体をspinnerで塞がない。

最初の15件は「AI Officeで作成した新規記事」「完成記事への人間承認」「confirmedなAI Office Publication Fact」の三条件を満たした件数だけを表示する。予約、API受付、下書き、外部変更、既存記事、リライト、記事置換を進捗へ算入しない。15件到達後も版付き同意とAutomation Policyが未設定なら自動投稿を解放しない。

## 4. Agent Office

Officeは同じProjectionを使い、Generation Outcome、CmsDelivery、Publication Decision、Approval、Publication Job、Publication Fact、Evaluation Registrationを別objectとして詳しく見せる。Delivery状態、Capability、retry、成果hash、Decision version、Factの時刻Source・精度・帰属・reconciliation、15件・Activation・Evaluation Laneへの派生を表示できるが、内部Sourceや接続経路をユーザーへ選択させない。

## 5. Previewと編集

CMS送信前の製品内HTML Previewは内容確認用であり、Siteの実テーマ再現を保証しない。CMS下書き作成後はAdapterが返す検証済みPreview URLを正規プレビューとし、埋込みできない場合はCMSを新規タブで開く。Previewを開く操作と承認操作は分離し、最初の15件でもPreview URLの閲覧ログ自体を必須証拠にしない。

初期WordPress連携では下書き投入後の内容をAI Officeから上書きしない。WordPress側で編集された可能性がある場合は、現在のWordPress下書きを正規確認対象として案内する。差分取得・再QA・WordPress内編集支援は後続機能であり、初期版が自動追従するように見せない。

## 6. 新規記事・リライト・例外

- 新規記事は最初の15件まで完成記事の承認を必須とし、解放後は有効なAutomation Policyの範囲だけ自動投稿できる。
- リライトと記事置換は常にCMS下書きへ送り、ユーザー承認後に更新する。全文置換を禁止はしないが、変更範囲、差分、復元availabilityを提示する。
- WordPress Revisionがなく専用backupもない場合でも、復元不能の説明と同意後に進められる。
- hard gate該当時は同一権限者の二段階確認と版付き同意を別操作で記録する。一般の承認一回へ丸めない。

## 7. 障害・再開

Generation Outcome成立後にCMS接続、権限、rate limit、外部検証で止まっても、成果は提供済みとして保持する。同じDelivery IDとidempotency keyで再開し、再生成、二重credit、二重下書きを起こさない。API受付後に検証できない場合は`外部反映を確認中`、持ち出し可能な場合は成果download／copy等を提示する。外部CMSで確認できたFactだけを公開・更新実績と評価起点にする。

## 8. 3秒表示契約

CMS関連の全ページを最初からNavigationへ出す。接続前、Plan不足、権限不足、成果未完成、送信中、承認待ち、予約済み、検証待ち、外部変更、障害中のいずれでも、P95 3秒以内にページ枠と現在判明している状態、最終更新時刻、必要操作または次回確認を表示する。CMS API、Webhook、polling、外部Previewの応答完了を画面表示の前提にしない。

## 9. 検証fixture

| ID | 条件 | 期待表示・操作 | 禁止する実装 |
|---|---|---|---|
| CMS-UI-01 | Generation Outcome成立 | 成果完成、credit確定、CMS送信へ | 公開完了 |
| CMS-UI-02 | CMS未接続 | 成果を表示し接続導線 | 記事画面を隠す |
| CMS-UI-03 | API受付・検証未完了 | 下書き確認中 | 下書き作成済みと断定 |
| CMS-UI-04 | draft verified | 編集／Preview／承認 | 公開成功 |
| CMS-UI-05 | 送信前HTML Preview | 内容Previewの注記 | 実テーマ完全再現と表示 |
| CMS-UI-06 | CMS Preview URL取得 | 正規Previewとして開く | 別の擬似Previewを正本化 |
| CMS-UI-07 | Preview未閲覧 | 完成記事を承認可能 | 閲覧ログを承認証拠にする |
| CMS-UI-08 | 最初の15件 | 完成記事承認を要求 | Automationだけで迂回 |
| CMS-UI-09 | 公開予約済み | 公開待ち | 15件へ算入 |
| CMS-UI-10 | CMS API成功 | 外部反映確認中 | Publication Fact作成 |
| CMS-UI-11 | 外部変更 | 外部変更と表示 | AI Office実績へ算入 |
| CMS-UI-12 | 15件目のconfirmed Fact | 15件到達を一度だけ派生 | Webhook回数分加算 |
| CMS-UI-13 | 15件到達・同意未完了 | 同意と設定を要求 | 自動投稿を即時解放 |
| CMS-UI-14 | 有効なAutomation Policy | 対象範囲だけ自動運用 | 全Siteへ拡大 |
| CMS-UI-15 | リライト成果完成 | CMS下書きと差分確認 | 公開記事を直接更新 |
| CMS-UI-16 | リライト承認 | 承認後に更新Job | 承認前に反映 |
| CMS-UI-17 | 全文記事置換 | 高変更表示、差分、承認 | 実行経路を削除 |
| CMS-UI-18 | hard gate一次確認 | 二次確認待ち | 公開Job開始 |
| CMS-UI-19 | hard gate二次確認＋同意 | 証拠を保持して実行可能 | 一般承認へ丸める |
| CMS-UI-20 | CMS retry | 同じDeliveryで再開 | 再生成・再課金 |
| CMS-UI-21 | CMS送信不能 | 成果持ち出しと接続修復 | 成果消失 |
| CMS-UI-22 | Publication Job予約 | 予約日時と取消可否 | 公開済み通知 |
| CMS-UI-23 | Publication Job handoff | 公開処理へ引渡し済み | 外部反映日を表示 |
| CMS-UI-24 | Publication Fact confirmed | 外部反映日と帰属 | API受付時刻を流用 |
| CMS-UI-25 | unknown_source | 帰属確認中 | AI Office実績へ算入 |
| CMS-UI-26 | 評価登録済み | 評価開始日と周期 | 成功判定済み |
| CMS-UI-27 | WP側で下書きを編集 | WPの現在下書きを確認対象にする | AI Officeが再上書き |
| CMS-UI-28 | Preview埋込み不可 | 新規タブでCMS Preview | Preview不能でWorkflow失敗 |
| CMS-UI-29 | CMS外部確認が30秒 | 3秒以内に前回状態＋確認中 | 30秒全面spinner |
| CMS-UI-30 | CMSページが未接続 | route、価値、接続操作を表示 | Navigationから削除 |

## 10. Finding記録

検証結果は`SF-UI-10`へ記録する。意味変更は`REQ-SCREEN-04/15/19`、`REQ-INT-10`、`REQ-WPA-04`、CMS Connection Routing Map、Publication Attribution、`INV-CMS-001〜003`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
