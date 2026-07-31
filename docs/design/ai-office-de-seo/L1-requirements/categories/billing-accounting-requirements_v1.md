---
document_id: AOS-L1-BILLING-ACCOUNTING-REQUIREMENTS
title: AI Office de SEO 課金・会計要求 v1.2
version: 1.2
layer: L1
kind: billing_accounting_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 課金・会計要求

## 責務

料金、請求、クレジット、原価、返金、残高、会計整合を定義する。

重点:

- システム利用料とAI実行クレジットの分離
- 見積、reserve、commit、release、refund
- append-only ledgerと残高導出
- 有効期限、繰越、失効、消費順
- Stripe subscription、invoice、webhook、idempotency
- upgrade、downgrade、解約、返金
- Provider原価、為替、粗利、価格改定
- 顧客・サイト・タスク・モデル別の原価帰属

利用量の技術観測は計測・運用要求、提供原価はコスト要求、価格判断はL0ビジネス要求を参照する。

障害時の返還・補償判断は障害対応・保証要求、上位プラン・追加購入の提案条件は成長・アップセル要求を参照する。

既存ソース: `ai-office-de-seo-billing-credit-provider-requirements_v3.7.md`、L0ビジネス要求。

## 要求

### REQ-BILLING-01 商品・価格カタログ

契約プラン、追加クレジット、バックアップ容量、保持延長等の商品は、商品ID、価格ID、通貨、税区分、請求周期、付与量、利用上限、有効期間、販売開始・終了、適用対象を持つversion付きPrice Catalogを正本とする。既存契約へ価格改定を遡及適用せず、契約が参照したcatalog versionを保持する。

品質段階は `economy / standard / high / premium` 等の安定した商品コードで管理し、Provider名・モデル名を商品コードにしない。`GPT Luna / GPT tera / Sonnet / Opus` 等の名称を表示する場合は商品上の暫定ラベルまたはrouting aliasとして扱い、実際のProvider、model、snapshot、調査量、検査、Repair、fallbackはversion付きModel Registryで解決する。

### REQ-BILLING-02 契約・Subscription正本

法人・個人の契約は、契約主体、Price Catalog version、状態、開始日、更新日、請求周期、支払方法、通貨、税情報、解約予定、外部決済IDを持つ。内部契約状態とStripe等の外部状態を区別し、外部イベントだけで認可・利用可能状態を直接上書きせず、検証済み状態遷移を通す。

### REQ-BILLING-03 利用枠・クレジットLot

各プランは月間クレジット利用上限と週次生成枠を持つ。記事本数を固定で請求せず、選択品質とPreflight予測消費から作成可能本数を算出する。追加クレジットは商品上の利用枠を増やすが、技術的な同時実行数、rate limit、queue制御を解除しない。

クレジットは付与元、付与量、残量、有効開始、失効日、繰越可否、返金可否、契約・購入・補償との参照を持つlotとして管理する。消費順は期限が近いlotを優先し、同一期限では付与時刻順とする。失効・繰越はPrice Catalogと契約versionに従い、後から規則を変えて既存lotを再計算しない。

### REQ-BILLING-04 Reserve・Commit・Release

有償ジョブは実行前に見積version、請求単位、最大請求額を確定し、利用可能残高からreserveする。成果の提供条件を満たした時だけcommitし、未使用予約はreleaseする。reserve不足時はProvider呼出し前に保留し、追加購入、品質変更または中止を選択可能にする。

同一ジョブの限定Repair、サービス障害による再試行、checkpoint再開では新しいreserve・commitを作らない。ユーザーが別成果を求める再生成は新しいjob・見積・reserveとして扱う。

### REQ-BILLING-05 Append-only Ledger・残高導出

付与、購入、reserve、commit、release、失効、繰越、refund、manual adjustmentはappend-only ledger eventとして記録する。eventはtenant、契約、credit lot、job、外部取引、金額・数量、通貨、理由、actor、idempotency key、発生時刻、記帳時刻、参照eventを持つ。確定eventを更新・削除せず、訂正は逆仕訳と正しいeventの追加で行う。

利用可能残高、予約残高、消費済み、失効済み、返還済みはledgerから導出し、mutableな残高列だけを会計正本にしない。高速表示用balance projectionは再構築・照合可能にする。

### REQ-BILLING-06 Stripe・外部決済イベント

Stripe等のWebhookは署名、timestamp、event ID、対象account、livemodeを検証し、受信eventを不変保存して冪等処理する。重複・順不同・遅延・再送を許容し、invoice、payment、subscription、refundの各状態を外部IDと内部契約・ledgerへ照合する。Webhook処理失敗はqueueへ退避し、二重請求・二重付与なしに再実行できる。

### REQ-BILLING-07 Invoice・入金・売上照合

請求書、支払、未収、取消、返金は外部決済状態と内部ledgerを定期照合する。差異は金額、通貨、税、外部ID、対象契約、原因候補を持つreconciliation exceptionとして起票し、自動で残高を合わせ込まない。売上認識・仕訳連携の詳細は採用会計方針と会計システム決定後にL2で定義するが、元取引、期間、商品、税、返金への追跡性をL1で必須とする。

### REQ-BILLING-08 Upgrade・Downgrade・解約

Upgradeは適用時刻、差額、追加付与、既存lotへの影響を事前表示し、決済成功後に有効化する。Downgradeと解約は即時または次回更新時の適用規則をPrice Catalogへ持ち、既存ジョブ、予約残高、バックアップ保持、超過データの扱いを確定してから状態遷移する。失効予定の機能・容量・保持データは期限前に通知する。

### REQ-BILLING-09 Refund・補償・手動調整

障害対応・保証要求が返還対象と判断した場合、課金側は元commitまたはinvoiceを参照してcredit refund、金銭refund、再実行権のいずれかをledgerへ記帳する。成果未提供、二重課金、誤commitは同一取引へ二重補償しない。

手動調整は理由コード、根拠、対象取引、変更量、実行者、承認者を必須とし、高額調整・金銭返金は権限分離された承認を通す。ledgerやStripe管理画面だけを直接変更して内部正本と不一致にしない。

### REQ-BILLING-10 通貨・税・丸め

Price Catalog、契約、invoice、ledger eventはISO通貨コードを持ち、金額は通貨の最小単位整数で保持する。税区分、内税・外税、端数処理、換算rate、rate取得元、適用日時をversion管理する。Provider原価の通貨換算と顧客請求通貨を分離し、為替差を顧客残高へ暗黙反映しない。

### REQ-BILLING-11 課金権限・監査

顧客は権限範囲内で契約、請求、残高、利用明細、失効予定を閲覧できる。購入、Plan変更、解約、返金申請、予算変更は顧客組織のPermissionと必要なstep-up認証に従う。内部担当者の閲覧・調整は開発管理Roleへ従い、Operatorは金銭調整できない。秘密情報や完全な決済情報を製品DB・ログへ保存しない。

### REQ-BILLING-12 原価・粗利との接続

顧客請求は本要求のledger、提供原価は `REQ-COST-*` を正本とする。商品・契約・tenant・Site・workflow・job単位で売上と原価を同じ分析軸へ接続し、粗利を導出できるようにするが、原価eventを顧客請求ledgerへ混在させない。

## 受入条件

- [ ] AC-L1-BILLING-01: 契約時のPrice Catalog versionから商品、価格、付与量、制限、適用期間を再現できる。
- [ ] AC-L1-BILLING-02: 内部契約と外部Subscriptionの状態差を検出し、未検証Webhookで利用権限が直接変更されない。
- [ ] AC-L1-BILLING-03: クレジットlotの付与元、期限、消費順、繰越・失効を契約versionどおりに再現できる。
- [ ] AC-L1-BILLING-04: 有償ジョブがreserve後に開始し、成功時commit、未使用時releaseされ、再試行で二重commitされない。
- [ ] AC-L1-BILLING-05: append-only ledgerから利用可能・予約・消費・失効・返還残高を再構築できる。
- [ ] AC-L1-BILLING-06: Stripe Webhookの重複・順不同・再送を処理しても二重請求・二重付与が発生しない。
- [ ] AC-L1-BILLING-07: invoice・支払・refundと内部ledgerの差異を自動検出し、根拠付きで解消できる。
- [ ] AC-L1-BILLING-08: Upgrade・Downgrade・解約前に差額、適用日、利用枠、保持データへの影響を確認できる。
- [ ] AC-L1-BILLING-09: 障害返還・金銭refund・手動調整が元取引、判断根拠、承認者へ追跡でき、二重補償されない。
- [ ] AC-L1-BILLING-10: 通貨最小単位、税、丸め、換算rateのversionから請求額を再計算できる。
- [ ] AC-L1-BILLING-11: 顧客と内部Roleの課金操作がサーバー側で認可され、Operatorが調整を実行できない。
- [ ] AC-L1-BILLING-12: 請求ledgerと原価eventを混在させず、共通分析軸から商品・契約・job別粗利を導出できる。
