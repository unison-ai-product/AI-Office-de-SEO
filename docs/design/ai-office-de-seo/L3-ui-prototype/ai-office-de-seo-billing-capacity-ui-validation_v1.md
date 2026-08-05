---
document_id: AOS-PRE-L3-BILLING-CAPACITY-UI-VALIDATION
title: 契約・Credit・自動チャージ・Capacity 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# 契約・Credit・自動チャージ・Capacity 画面検証仕様

## 1. 目的

顧客への請求、Credit台帳、利用権、処理Capacity、運営原価を別概念として表示する。画面用Projectionは検索系Projectionと同様に再構築可能とし、金銭の正本をappend-only台帳、商品条件の正本をversion付きPrice Catalogに置く。

## 2. Planと価格表示

| Plan | 税別 | 税込 | 契約・表示 |
|---|---:|---:|---|
| Entry | 39,800円 | 43,780円 | 月額。年契約選択時は割引条件と年額総額を併記する |
| Standard | 98,000円 | 107,800円 | 月額。年契約選択時は割引条件と年額総額を併記する |
| Premium | 198,000円 | 217,800円 | 月額換算、年契約のみ。年額請求総額、税込総額、更新日を同じ領域へ出す |
| Enterprise | 398,000円〜 | 437,800円〜 | 月額換算、年契約、問い合わせ。確定前checkoutを出さない |

表示値はPrice Catalogのversionから解決し、画面へ固定値として埋め込まない。Provider、model、決済手数料、記事一本あたりの内部原価仮説は運営原価であり、商品保証または追加請求として表示しない。明示的な商品・法的根拠がある料金だけを請求項目にする。

## 3. Credit

利用可能、予約中、消費済み、解放・返還、失効予定lotを分ける。月額付与分は請求期間末、追加購入分は最大180日を期限とし、期限の早いlotから使う。実行前見積、reserve、Generation Outcome完成時のcommit、成果未提供時のreleaseを別eventで示す。CMS送信失敗・再送は生成成果完成後のDelivery問題であり、再commitも自動返還も行わない。

品質選択はEntryを基本品質、Standard以上を品質別Credit消費とする。固定記事本数や特定modelを保証せず、不足時に無断で品質を下げない。

## 4. 自動チャージ

初期OFFとし、有効化時にstep-up認証を要求する。閾値、購入額、月間上限または無制限、今月購入額、次回候補を表示する。上限到達、決済失敗、Catalog変更時は実行を止め、再確認可能な状態を作る。Webhook再送から同じ購入lotを重複作成しない。

## 5. Capacity

Site、User、保存容量、月間取込、週次生成、同時実行、外部API負荷をDimension別に表示し、Creditと合算しない。soft limitは予測とUpgrade候補、hard limitは新規処理停止と削減・購入・Plan変更導線を出す。既存dataの閲覧・export・削減・支払修正は維持する。Entry／StandardにはPremiumを推奨し、Premium／Enterpriseでは容量購入も比較可能にする。安全目的の同時実行上限は購入で解除しない。

## 6. 契約変更・支払失敗

Upgradeは差額、税、適用時刻、追加EntitlementをPreviewし、計画適用を選べる。Downgradeは次回更新時に適用し、超過するSite・User・容量・Automationの解消条件を先に示す。解約は支払済み期間末まで利用可能、日割返金なしを基本とする。年契約の返金候補は契約開始後14日以内かつ有償利用履歴なしに限定する。

支払失敗は14日の猶予と最大8回の再試行状態を表示する。past_due中は新規有償Job、自動投稿、新規課金を止め、閲覧、export、支払修正を維持する。回復eventは冪等に処理する。

## 7. 権限・通常ビュー・Office

閲覧、予算配分、購入、Plan変更、解約を権限で分離する。購入、上限変更、自動チャージ、解約はstep-upと影響Previewを通す。通常ビューとOfficeは同じBilling ProjectionとCommandを使用する。Officeでの会話・選択操作は変更案を作るだけで、確認なしに課金操作を行わない。

## 8. 3秒表示とstale制御

全routeの外枠を先に表示し、データ系はP95 3秒以内に判断可能状態へ到達させる。Ledger集計が間に合わない場合は前回値、更新時刻、更新中表示を出すが、購入・Plan変更・解約の確定前には最新Catalogと残高を再取得して再見積する。

## 9. 検証fixture

| ID | 検証内容 |
|---|---|
| BILL-UI-01 | Entryの税別を主、税込を同一領域に表示する |
| BILL-UI-02 | Standard年契約で割引条件と年額総額を表示する |
| BILL-UI-03 | Premiumを年契約として年額請求総額まで表示する |
| BILL-UI-04 | Enterpriseは問い合わせへ進み未確定checkoutを出さない |
| BILL-UI-05 | Catalog version更新後に旧価格を確定へ使わない |
| BILL-UI-06 | Provider route変更で顧客価格を勝手に変えない |
| BILL-UI-07 | 決済手数料を未明示の追加請求にしない |
| BILL-UI-08 | 利用可能Creditと予約中Creditを分ける |
| BILL-UI-09 | 月額付与lotの失効日を表示する |
| BILL-UI-10 | 追加購入lotの180日以内の失効日を表示する |
| BILL-UI-11 | 期限の早いlotから消費する見込みを示す |
| BILL-UI-12 | 実行前に品質別Credit見積を示す |
| BILL-UI-13 | Job受付時にreserveを表示する |
| BILL-UI-14 | Generation Outcome完成時にcommitする |
| BILL-UI-15 | CMS失敗・再送で再課金も自動返還もしない |
| BILL-UI-16 | 成果未提供で予約Creditをreleaseする |
| BILL-UI-17 | Entryの高品質選択を理由付きでロックする |
| BILL-UI-18 | Standard以上で品質と消費量を比較できる |
| BILL-UI-19 | Credit不足時に追加購入・品質変更・延期を選べ、無断変更しない |
| BILL-UI-20 | 自動チャージ初期OFFを表示する |
| BILL-UI-21 | 有効化時にstep-upする |
| BILL-UI-22 | 無制限設定で金額影響を再確認する |
| BILL-UI-23 | 月間上限到達後の自動購入を止める |
| BILL-UI-24 | 決済失敗理由と修正導線を出す |
| BILL-UI-25 | Webhook retryで購入lotを重複しない |
| BILL-UI-26 | Capacity soft limitで予測と選択肢を出す |
| BILL-UI-27 | hard limitでも既存dataの閲覧・export・削減を維持する |
| BILL-UI-28 | Entry／Standard容量超過でPremiumを推奨する |
| BILL-UI-29 | Premium以上で容量購入とPlan変更を比較する |
| BILL-UI-30 | 同時実行安全上限を容量購入で解除しない |
| BILL-UI-31 | Upgrade前に差額・税・適用時刻・権利差分を示す |
| BILL-UI-32 | Upgradeの計画適用を選べる |
| BILL-UI-33 | Downgradeを次回更新へ予約し超過解消を案内する |
| BILL-UI-34 | 解約後も期間末まで利用できる |
| BILL-UI-35 | 年契約14日以内・未利用だけ返金候補とする |
| BILL-UI-36 | 有償利用履歴があれば返金対象外理由を示す |
| BILL-UI-37 | past_dueの猶予日、再試行、停止対象を示す |
| BILL-UI-38 | past_dueでも閲覧・export・支払修正を維持する |
| BILL-UI-39 | 支払回復Webhook retryを冪等処理する |
| BILL-UI-40 | 権限なし利用者は購入せず申請・確認へ進む |
| BILL-UI-41 | Office操作は課金変更案から共通確認へ進む |
| BILL-UI-42 | Ledger集計遅延時に前回値・時刻・更新中を3秒以内に出す |
| BILL-UI-43 | stale状態で確定しようとしたら再取得・再見積する |
| BILL-UI-44 | 一般提供画面に限定Trial申込を常設しない |

## 10. Finding

検証結果は`SF-UI-14`へ記録する。意味変更は`REQ-SCREEN-16/17/22`、Billing & Capacity UI Connection Map、Billing／Accounting要求、`INV-COMMERCIAL-001`と`INV-BILLING-UI-001`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
