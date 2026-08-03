---
document_id: AOS-L1-BILLING-CAPACITY-UI-MAP
title: AI Office de SEO 課金・Credit・Capacity画面接続マップ
version: 1.0
layer: L1
kind: requirements_map
status: draft
updated_at: 2026-08-03
---

# AI Office de SEO 課金・Credit・Capacity画面接続マップ

## 1. 目的

`REQ-BILLING-01〜16`、`REQ-SCREEN-16/17`、`REQ-NFR-15`、`REQ-UPSELL-02/04/06`を、顧客の契約・支払・credit・Capacity画面と操作へ接続する。価格表の表示だけで課金画面を完了扱いにしない。

## 2. S7「契約・お支払い」の情報構造

| 区画 | 表示 | 操作 | 正本 |
|---|---|---|---|
| 契約概要 | 現Plan、税別／税込、契約周期、更新日、年契割引、状態 | Upgrade、Downgrade予約、解約予約／取消 | Subscription＋Price Catalog version |
| 利用credit | 残高、今月使用、予約中、失効予定、品質別見積 | 手動購入、自動チャージ設定 | append-only Ledger＋Credit Lot |
| 自動チャージ | ON/OFF、残高閾値、1回購入額、当月使用、月間上限／無制限 | 有効化、上限変更、停止 | AutoChargePolicy version |
| Capacity | Dimension別使用量、soft/hard limit、利用率、予測到達日、集計時刻 | archive／削減、Plan比較、許可Planだけ容量購入 | Capacity Snapshot＋Plan Configuration |
| 支払状態 | 支払方法参照、invoice、次回試行、猶予残日数 | Stripe Portal等で支払方法更新 | 検証済み外部event＋内部Subscription |
| Entitlement | 利用可能機能、品質、Site、予測、backup、API、support | Plan比較 | 契約時Entitlement Snapshot |

Provider/model名を商品保証として表示せず、品質段階と消費creditを表示する。

## 3. 操作権限

- 契約、購入、Plan変更、解約、自動チャージ、月間課金上限は契約者または明示された課金権限だけが変更できる。
- 利用者は許可範囲の残高、利用量、Capacityを閲覧できるが、購入CTAは権限不足理由と権限者への依頼導線へ変える。
- 無制限、有効化、上限引上げは影響額、停止方法、取消不能となる時点を示し、step-up認証と再確認を要求する。
- Officeからの変更も同じBilling Commandと認可を使い、Agent会話から直接決済しない。

## 4. 自動チャージ状態

`disabled → configured → active → threshold_reached → purchasing → active`

例外は`limit_reached / payment_failed / suspended`へ遷移する。`limit_reached`では上限変更、手動購入、品質変更、中止を提示し、Jobを勝手に低品質化しない。`payment_failed`では二重購入を防ぎ、Policyを停止して対象Jobを保留する。手動購入と自動購入は同じCatalog、Lot、Ledger、冪等性を使用する。

## 5. Capacity表示と販売

Capacityは記事、Keyword／Query、保存領域、画像、backup、当月取込、計算量、同時処理等を別Dimensionとして表示する。異なるDimensionを一つの残量へ合算しない。

- soft limit: 利用率、予測到達日、削減／archive、処理延期、Plan比較を表示。
- hard limit: 制限対象、既存データへの影響、再開条件を表示。閲覧、export、削減導線を維持する。
- Entry／Standard: Premiumへの変更を主提案とし、追加容量だけを販売しない。
- Premium／Enterprise: Plan変更と追加容量を比較し、対象Dimension、追加量、価格、期間を確認して購入できる。
- 同時実行、外部rate、DB安全上限等の瞬間的安全限界は販売商品にしない。

## 6. 契約変更・支払失敗

- Upgradeは適用日、日割差額、追加Entitlement、credit影響を表示し、決済成功後に計画的な適用時刻で有効化する。
- Downgradeは次回更新時を既定とし、超過Site、Capacity、backup、予約Job、失効機能を事前解決する。
- 更新支払失敗は14日間・最大8回を初期値とし、`past_due`中は閲覧、export、支払修正を維持し、新規有償Job、自動投稿、追加費用を停止する。
- 支払成功時は二重付与せず復旧し、14日経過後は`unpaid`としてread-only／export導線を維持する。

## 7. 画面状態

通常、読込中、集計中、空、errorに加え、`past_due`、Capacity soft/hard、credit不足、auto-charge limit/payment failureを別状態として表示する。障害、権限不足、Plan不足、データ不足を同じUpgradeロックへ潰さない。

