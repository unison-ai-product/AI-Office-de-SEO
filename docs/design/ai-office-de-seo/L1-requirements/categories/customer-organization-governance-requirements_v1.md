---
document_id: AOS-L1-CUSTOMER-ORGANIZATION-GOVERNANCE-REQUIREMENTS
title: AI Office de SEO ユーザー組織・権限統制要求
version: 1.0
layer: L1
kind: requirements
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO ユーザー組織・権限統制要求

## 1. 責務

法人または個人の契約主体、部門、チーム、ブランド、サイトにまたがるユーザー側の組織構造、所属、権限、承認、予算および移管を定義する。代理店による複数顧客管理は対象外とする。プラットフォーム運営者の内部権限は本書の対象外とし、`platform-administration-control-requirements_v1.md` を正本とする。

## 2. 用語と基本モデル

- `Contract Account`: 法人または個人の契約、請求、全体クレジットおよび利用上限の単位。
- `Customer Organization`: 契約主体が管理するユーザー側組織。個人契約でも本人をOwnerとする組織を1つ持つ。
- `Organization Unit`: 事業部、部門、チーム、ブランド等の組織ノード。
- `Membership`: UserとCustomer Organizationの所属関係。
- `Base Role Assignment`: 基本権限、Resource Scope、有効期間を組み合わせた権限付与。
- `Permission Tag Assignment`: 業務能力を表す権限タグ、Resource Scope、有効期間を組み合わせた追加権限付与。
- `Resource Scope`: 組織、配下組織、サイト、記事、機能等の操作対象範囲。

基本構造は `Contract Account → Customer Organization Tree → Membership → Base Role Assignment + Permission Tag Assignment → Resource Scope → Permission` とする。契約関係、データ所有者、基本権限、業務能力を同一概念にまとめない。

## 3. 要求

### REQ-ORG-01 組織階層

すべての契約でCustomer Organizationを必須とし、その配下にユーザーが名称と親子関係を自由設定できるOrganization Unitを構成し、Siteを任意の組織ノードへ所属させられなければならない。事業部、部門、チーム、ブランドは初期候補であり、固定階級にしない。個人契約はOwner本人だけの初期組織から開始できる。組織階層の深さ、子ノード数、名称長には設定可能な上限を持ち、循環参照を禁止する。

### REQ-ORG-02 複数所属

1人のUserは複数のCustomer Organization、Organization UnitおよびSiteへ所属でき、所属先ごとに異なるBase Role AssignmentとPermission Tag Assignmentを持たなければならない。主所属、兼務、外部委託、期間限定所属を区別する。

### REQ-ORG-03 権限モデル

顧客側権限は「基本権限」と「権限タグ」に分離する。

基本権限は組織内での基礎的な立場と既定の可視範囲を表し、初期値を次の3種類とする。

- `Owner`: 契約主体の最終管理者。契約、請求、Owner移譲、組織、Site、権限を管理できる。
- `Admin`: 組織、Site、Membership、設定を管理できるが、Owner固有操作は実行できない。
- `Member`: 付与されたScope内を閲覧できる。業務状態を変更する能力は権限タグで追加する。

Viewer、SEO Manager、Strategist、Editor、Approver、Analyst、Billing担当等を基本権限として増やさない。閲覧だけの利用者は権限タグを持たないMemberとして表現する。変更能力は、`keyword_strategy`、`recommendation_execute`、`content_create`、`content_rewrite`、`content_edit`、`quality_check`、`publish_approve`、`automation_manage`、`connection_manage`、`budget_use`、`billing_manage`、`analytics_view`、`data_export` 等の版管理された権限タグとして付与する。

各Assignmentは基本権限または権限タグ、Resource Scope、有効開始・終了日時、付与者、理由を持つ。権限タグは単一Permissionまたは相互に関連する最小のPermission bundleへ解決し、名称だけで判定しない。顧客が独自タグを作成できる場合も、既存Permissionの組合せに限定し、新しいsystem Permissionを生成できない。

### REQ-ORG-04 権限継承と競合

Base Role AssignmentおよびPermission Tag Assignmentごとに「配下Organization Unit・Siteへ継承する／このノードだけ」をユーザーが選択できなければならない。継承を既定で強制しない。個別付与、明示拒否、複数Assignmentが競合する場合の評価順を決定論として定義し、画面表示とAPI認可で同一の判定結果を使用する。基本権限、権限タグまたは上位所属を理由にテナント境界、安全不変条件、契約境界を越えてはならない。

### REQ-ORG-05 業務操作権限

少なくとも次の業務能力を権限タグとして個別に付与・取消できる。

- キーワード戦略および目標の閲覧・編集
- レコメンドの採用、却下、保留、バッチ採用
- 記事作成・リライトの起動、編集、品質確認
- WordPress下書き送信、予約投稿、公開承認
- 自動公開、Kill Switch、サイト設定
- GSC・WordPress等の外部接続
- クレジット利用、予算変更、追加購入、契約変更
- 分析、エージェントTask History、請求情報、顧客データエクスポート

基本権限だけで、公開、課金変更、外部接続、データ出力、自動運用等の強い操作を暗黙許可しない。Owner固有操作を除く業務能力は権限タグとScopeから判定する。顧客が閲覧するTask Historyと、開発側の内部監査ログを分離する。顧客Permissionから内部監査ログ、trace、stack、秘密情報、他tenant・管理操作詳細へ到達できない。

### REQ-ORG-06 承認フロー

組織、サイト、処理種別、金額、リスク分類に応じて承認経路を設定できなければならない。作成者と承認者の職務分離、多段階承認、差し戻し、再承認、期限、代理承認を扱う。YMYL、重要ページ、自動公開、予算超過は通常操作より強い承認条件を設定できる。

### REQ-ORG-07 予算・クレジット配賦

Contract Accountのクレジットおよび利用予算をCustomer Organization、Organization Unit、Siteへ配賦し、月次枠、タスク上限、超過申請、回収、再配賦を管理できなければならない。配賦は会計台帳を置き換えず、消費の許可枠として扱う。

### REQ-ORG-08 情報可視性

記事、キーワード、分析、成果、請求、監査の可視範囲を独立して制御する。同一Customer Organization内でも部門・ブランド間を非公開にでき、External Memberは割当対象だけ、経営層は許可された集計だけを閲覧できる。

### REQ-ORG-09 契約主体と組織

Contract Accountは法人または個人を契約主体として識別し、請求主体とCustomer Organizationを対応付ける。法人・個人で記事、推薦、組織、権限の機能経路を分岐させず、契約・請求に必要な属性だけを区別する。代理店による顧客横断管理、OEM、ホワイトラベルはスコープに含めない。

### REQ-ORG-10 ライフサイクル

招待、参加、異動、兼務、休止、退職、契約終了、部門統廃合、Site移管、運用担当変更を扱う。無効化されたMembershipのセッションと権限は速やかに失効し、履歴、成果物、承認記録の所有先は保持する。

### REQ-ORG-11 組織変更の安全性

組織統合、分割、Site移管、契約主体変更は、影響対象、データ所有先、権限差分、請求・クレジット差分を事前表示し、承認後に実行する。処理は冪等かつ監査可能とし、部分失敗時に安全な状態へ復旧できなければならない。

### REQ-ORG-12 監査と棚卸し

所属、基本権限、権限タグ、承認、代理操作、予算配賦の変更について、実行者、承認者、対象範囲、変更前後、有効期間、理由を監査記録へ残す。Customer OrganizationのOwnerは定期的な権限棚卸しを実施でき、期限切れ・未使用・過剰権限の候補を確認できる。

## 4. 接続要求

- 認証、認可強制、セッション、監査保護は `security-access-requirements_v1.md` を参照する。
- 組織管理画面と権限別表示は `screen-operation-requirements_v1.md` を参照する。
- 契約、請求、クレジット台帳は `billing-accounting-requirements_v1.md` を参照する。
- プラットフォーム運営者の内部Roleと管理操作は `platform-administration-control-requirements_v1.md` を参照する。

## 5. 受入条件

- [ ] AC-L1-ORG-01: 法人・個人のどちらも必須の契約組織を持ち、その配下に自由名称・自由階層の組織ノードとSiteを構成できる。
- [ ] AC-L1-ORG-02: 同一ユーザーが所属先ごとに異なる基本権限、権限タグ、Scope、有効期間を持てる。
- [ ] AC-L1-ORG-03: UI非表示だけでなくAPI側で同一Permission判定が強制される。
- [ ] AC-L1-ORG-04: 基本権限・権限タグごとに継承有無を選択でき、明示拒否・競合時の結果が再現可能である。
- [ ] AC-L1-ORG-05: SEO担当・承認者等を基本権限へ増やさず、記事実行、公開、接続、課金、データ出力を権限タグで個別に制御できる。
- [ ] AC-L1-ORG-06: 多段階承認、差し戻し、期限、代理承認が監査される。
- [ ] AC-L1-ORG-07: 部門・Site予算の超過が実行前に停止または承認待ちになる。
- [ ] AC-L1-ORG-08: 個人契約が本人Ownerの初期組織から法人契約と同じ機能を利用できる。
- [ ] AC-L1-ORG-09: 退職・契約終了時にアクセスが失効し、成果物と履歴は失われない。
- [ ] AC-L1-ORG-10: 組織・Site移管前に権限、データ、請求への影響が表示される。
- [ ] AC-L1-ORG-11: Ownerが権限棚卸しを実行し、是正履歴を確認できる。
- [ ] AC-L1-ORG-12: 所属・権限・承認・予算変更の実行者、理由、期限、差分を監査できる。
- [ ] AC-L1-ORG-13: 部門・ブランド間の非公開境界とExternal Memberの可視範囲が、画面とAPIの双方で同じScopeとして強制される。
