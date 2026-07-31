---
document_id: AOS-L1-PLATFORM-ADMINISTRATION-CONTROL-REQUIREMENTS
title: AI Office de SEO 開発管理・画面制御要求
version: 1.0
layer: L1
kind: requirements
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 開発管理・画面制御要求

## 1. 責務

開発・運用担当者が、通常の運用調整、顧客支援、障害回避、段階公開、表示変更をコード変更、再デプロイ、DB直接更新なしで安全に実施するための管理面を定義する。顧客組織内の所属と権限は `customer-organization-governance-requirements_v1.md` を正本とする。

## 2. 原則

- 一般ユーザー画面とプラットフォーム管理画面を分離する。
- 内部Roleと顧客Roleを分離し、内部権限を顧客組織へ継承しない。
- 管理画面は安全境界を迂回する裏口にしない。
- 変更は原則としてPreview、Validate、Approve、Apply、Observe、Rollbackの順に行う。
- 本番DBの直接更新を通常運用手順に含めない。

## 3. 要求

### REQ-PAC-01 内部権限階級

内部RoleはAdmin、Manager、Operatorを基本階級とする。Adminだけが内部RoleとManagerの顧客アクセス権限を付与・変更・取消できる。Managerは担当顧客のデータと運用操作へ、対象Customer Organization・Site・操作種別・期限を限定した権限でアクセスできる。Operatorは開発側のログ、メトリクス、トレース、ジョブ状態の確認に限定し、顧客データ本文と変更操作へアクセスできない。ユーザー側Roleを内部Roleへ昇格させず、顧客ユーザーは開発管理面へアクセスできない。

運用で即時解決できる設定・状態・再実行等と、プログラム修正が必要な障害調査・変更を分類する。前者はManagerの期限付き権限付与と監査の範囲で操作可能とし、後者は開発変更管理へ移す。課金、権限、公開、秘密情報、品質安全条件は個別Permissionと追加承認を要求する。

### REQ-PAC-02 機能公開制御

機能、画面、メニュー、タブ、操作を、環境、プラン、Customer Organization、Site、Role、割合、期間の条件で有効化・無効化できなければならない。master、canary、限定顧客、一般の段階公開と、旧状態へのロールバックを扱う。

基本機能以外はFeature Object Registryから、利用可能、インストール済み、設定待ち、稼働中、停止中、更新必要、依存不足、削除予定を管理する。Object単位またはPackage単位で互換性検証、限定公開、version昇格、Kill Switch、rollbackを行える。Feature Flagは未契約ObjectのEntitlementを付与せず、Object導入はCoreの安全不変条件を解除しない。

### REQ-PAC-03 画面構成制御

表示ラベル、説明、注意、同意、ヘルプ導線、障害バナー、メンテナンス表示、入力必須性、選択肢、上限値を版管理された設定から制御できなければならない。任意HTML・任意スクリプトの注入は許可せず、定義済みコンポーネントと安全なスキーマに限定する。

### REQ-PAC-04 状態別画面制御

契約状態、支払状態、外部連携状態、障害状態、権限、予算残高、機能公開状態に応じて、画面の閲覧、編集、実行、承認、公開を制御する。画面非表示は認可の代替にせず、サーバー側の操作許可と同一ポリシーを参照する。

### REQ-PAC-05 業務フロー制御

承認段数、自動公開許可、実行上限、クレジット承認しきい値、投稿頻度、保留条件、再実行条件を管理画面から設定できなければならない。顧客別例外には理由、有効期限、承認者を必須とする。

### REQ-PAC-06 ジョブ・外部連携制御

ジョブの保留、停止、再試行、再開、取消と、Provider、WordPress、GSC、課金Webhook等の外部連携を全体・顧客・Site・機能単位で停止できなければならない。再実行は冪等性と二重課金・二重公開防止を満たす。

### REQ-PAC-07 レコメンド制御

推薦種別、入力データ、重み、しきい値、鮮度、cooldown、抑制条件、アップセル接続を版管理し、対象範囲と予測影響を確認して適用できなければならない。特定候補または推薦種別を顧客・Site単位で抑制でき、理由を監査する。

### REQ-PAC-08 品質・生成制御

Provider Routing、Model Catalog、Prompt Pack、few-shot、Quality Gate、修復回数、token・コスト上限を管理できなければならない。変更前にスキーマ検証、ゴールデン評価、品質・原価・レイテンシ比較を行い、重大劣化時は公開を阻止する。

### REQ-PAC-09 顧客支援操作

権限に応じ、接続状態確認、エラー診断、ジョブ状態確認、通知再送、期限付き機能解放、クレジット調整、返金起票、組織管理支援を管理画面から行える。操作前に「運用操作で解決可能」「プログラム修正が必要」「判定不能」を分類し、プログラム問題を顧客データの直接変更で回避しない。秘密情報、記事本文全文、プロンプト全文は表示せず、変更操作は操作種別に応じた権限、理由、有効期限、追加承認を要求する。

### REQ-PAC-10 障害時制御

Kill Switch、read-onlyモード、機能別停止、キュー保留、公開停止、Provider切替、障害バナー、ステータス通知を一つのインシデント操作面から実行できなければならない。操作対象、影響範囲、復旧条件、担当、時刻を記録する。

### REQ-PAC-11 変更管理

管理変更はdraftとして作成し、差分、対象、依存、予測コスト、権限・契約・進行中ジョブへの影響をPreviewする。Validate、必要な二者承認、予約適用、段階適用、観測、自動または手動Rollbackを提供する。

### REQ-PAC-12 安全不変条件

次の条件は管理画面、設定、Feature Flag、内部Roleでも解除できない。

- tenant・site境界と顧客間データ分離
- 記事本文非保持と秘密情報非表示
- 課金・クレジット台帳の改変禁止
- 認可のサーバー側強制
- 監査対象操作の記録
- 二重課金・二重公開防止
- 成果保証表現の禁止
- 法令・契約上必要な同意とデータ保護

### REQ-PAC-13 監査と環境分離

管理操作は実行者、内部Role、対象環境、対象顧客、変更前後、理由、承認、結果、Rollbackを不変監査ログへ記録する。本番、staging、developmentの権限と設定を分離し、非本番操作が本番へ波及しない。

### REQ-PAC-14 Plan Configuration

プラン名、価格参照、契約期間、年契割引、申込経路、Site数、ユーザー数、月間・週次credit、品質段階、利用可能機能、自動投稿、バックアップ容量・保持期間、予測、監査、外部連携、サポート、追加購入可否、および `REQ-NFR-15` のCapacity Dimension別soft/hard limitを、コード変更なしにversion付きPlan Configurationとして変更できなければならない。

Planは固定4行として実装せず、安定した `plan_key`、表示名、説明、表示順、対象顧客、状態、販売期間を持つCatalog entityとする。管理画面から既存Planの複製、新規Planのdraft作成、Validate、公開、販売終了、後継Plan指定を行える。契約参照中のPlan/versionは削除・再利用せず、表示名を変更しても契約・台帳・Entitlementの安定キーを変えない。

変更は適用対象を新規契約、更新契約、指定契約、Customer Organization、Siteから選び、適用開始日と終了日を持つ。既存契約へ遡及適用せず、契約version、Price Catalog、Entitlement Snapshotを保持する。個別overrideは理由、承認者、期限を必須とし、標準Planへ戻る条件を持たせる。

将来の内部アプリストアでは、拡張アプリをCatalog entityとしてdraft、検証、限定公開、一般公開、停止、販売終了、後継指定できる。app versionごとに対応するCore version、必要Capability、権限、外部接続、料金、対象Plan、地域、依存app、migration、rollback、Kill Switchを保持する。初期は自社開発アプリだけを対象とし、第三者出品、売上分配、公開SDK市場は別判断とする。

公開前に差分、対象契約数、売上・粗利、利用可能機能、保存データ、実行中jobへの影響をPreviewし、Validate、承認、予約適用、Rollbackを行う。tenant分離、台帳不変性、サーバー側認可等の安全不変条件はPlan設定で解除できない。

### REQ-PAC-15 マスターテナント・Trial管理

Admin管理面からだけ、開発者スーパーアカウント配下へ `tenant.kind=internal` のマスターテナントと、その配下の自社運用Site・デモSiteを作成、変更、停止できる。セルフサインアップや顧客管理面からinternal区分を作成・昇格できない。

マスターテナントは内部請求mode、実原価計測、master先行Feature Flag、showcase素材を持てるが、顧客と同じtenant境界、品質ゲート、承認、公開、変更予算、監査を通る。内部Roleでも顧客データを自由に転用できず、`REQ-DATA-13` の許諾済みShowcase Snapshotだけを参照する。

限定Trialは初期検証全体の累計発行数を10社までとし、終了枠を再利用しない。招待先、1～3カ月の期間、Standard相当のPlan version、固定credit、個別検証Entitlement、状態、終了処理を管理できる。同一Customer Organizationまたは実質同一主体への重複発行を検出し、一般公開用の無制限なTrial作成経路を持たない。

## 4. 接続要求

- 既存の詳細管理面は `ai-office-de-seo-admin-console-requirements_v3.7.md` を移行元として参照する。
- 顧客組織と顧客Roleは `customer-organization-governance-requirements_v1.md` を参照する。
- 認証、秘密情報、監査保護は `security-access-requirements_v1.md` を参照する。
- 障害判断、復旧、補償は `incident-warranty-requirements_v1.md` を参照する。
- 推薦判定本体は `logic/keyword-dynamic-recommendation-logic-requirements_v1.md` を参照する。

## 5. 受入条件

- [ ] AC-L1-PAC-01: Admin、Manager、Operatorの管理画面とAPI権限が分離され、Admin以外がManager権限を付与できず、Operatorと顧客ユーザーが顧客データ変更へ到達できない。
- [ ] AC-L1-PAC-02: 機能を対象、割合、期間別に段階公開しロールバックできる。
- [ ] AC-L1-PAC-03: コード変更なしで定義済みUI文言・状態・上限を変更できる。
- [ ] AC-L1-PAC-04: UIを直接呼び出さなくてもサーバー側で同じ操作制限が働く。
- [ ] AC-L1-PAC-05: 承認、公開、予算、実行条件を版管理して変更できる。
- [ ] AC-L1-PAC-06: ジョブ再実行で二重課金・二重公開が発生しない。
- [ ] AC-L1-PAC-07: 推薦設定変更の対象と予測影響を適用前に確認できる。
- [ ] AC-L1-PAC-08: 品質・生成設定の劣化を検証し公開を阻止できる。
- [ ] AC-L1-PAC-09: 支援操作で秘密情報・本文全文・プロンプト全文が表示されない。
- [ ] AC-L1-PAC-10: 障害時に機能停止、通知、復旧を同一インシデントへ記録できる。
- [ ] AC-L1-PAC-11: 本番変更に差分、理由、承認、適用、Rollback記録が残る。
- [ ] AC-L1-PAC-12: いずれの内部Roleでも安全不変条件を解除できない。
- [ ] AC-L1-PAC-13: 本番・非本番の権限、秘密情報、設定が分離され、管理操作を環境別に監査できる。
- [ ] AC-L1-PAC-14: Planをコード変更なしに追加・複製・改版・販売終了でき、価格・契約・利用枠・機能・品質・バックアップを設定し、既存契約を維持したまま対象と適用日を指定して変更・Rollbackできる。
- [ ] AC-L1-PAC-15: internalマスターテナントと累計10社までの1～3カ月TrialをAdminだけが発行・停止でき、終了枠を再利用せず、通常の品質・承認・境界・監査を迂回できない。
