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

契約企業、代理店、部門、チーム、ブランド、サイトにまたがるユーザー側の組織構造、所属、権限、承認、予算および移管を定義する。プラットフォーム運営者の内部権限は本書の対象外とし、`platform-administration-control-requirements_v1.md` を正本とする。

## 2. 用語と基本モデル

- `Contract Account`: 契約、請求、全体クレジットおよび利用上限の単位。
- `Customer Organization`: 顧客企業または代理店等のユーザー側組織。
- `Organization Unit`: 事業部、部門、チーム、ブランド等の組織ノード。
- `Membership`: UserとCustomer Organizationの所属関係。
- `Role Assignment`: Role、Resource Scope、有効期間を組み合わせた権限付与。
- `Resource Scope`: 組織、配下組織、サイト、記事、機能等の操作対象範囲。
- `Partner Relationship`: 代理店等が顧客組織を運用支援する組織間関係。

基本構造は `Contract Account → Customer Organization Tree → Membership → Role Assignment → Resource Scope → Permission` とする。契約関係、データ所有者、操作権限を同一概念にまとめない。

## 3. 要求

### REQ-ORG-01 組織階層

Customer Organization配下に、事業部、部門、チーム、ブランド等のOrganization Unitを階層で構成でき、Siteを任意の組織ノードへ所属させられなければならない。組織階層の深さには設定可能な上限を持ち、循環参照を禁止する。

### REQ-ORG-02 複数所属

1人のUserは複数のCustomer Organization、Organization UnitおよびSiteへ所属でき、所属先ごとに異なるRole Assignmentを持たなければならない。主所属、兼務、外部委託、期間限定所属を区別する。

### REQ-ORG-03 権限モデル

Role名とPermissionを分離し、Role AssignmentはRole、Resource Scope、有効開始・終了日時を持たなければならない。初期RoleはOwner、Billing Admin、Organization Admin、Department Manager、SEO Manager、Site Manager、Strategist、Editor、Approver、Analyst、Viewer、External Memberとするが、Permission集合は版管理された設定を正本とする。

### REQ-ORG-04 権限継承と競合

上位Organization Unitの権限は明示されたResource Scopeに限り下位へ継承する。個別付与、明示拒否、複数Roleが競合する場合の評価順を決定論として定義し、画面表示とAPI認可で同一の判定結果を使用する。Roleまたは上位所属を理由にテナント境界、安全不変条件、契約境界を越えてはならない。

### REQ-ORG-05 業務操作権限

少なくとも次のPermissionを個別に制御する。

- キーワード戦略および目標の閲覧・編集
- レコメンドの採用、却下、保留、バッチ採用
- 記事作成・リライトの起動、編集、品質確認
- WordPress下書き送信、予約投稿、公開承認
- 自動公開、Kill Switch、サイト設定
- GSC・WordPress等の外部接続
- クレジット利用、予算変更、追加購入、契約変更
- 分析、監査ログ、請求情報、データエクスポート

### REQ-ORG-06 承認フロー

組織、サイト、処理種別、金額、リスク分類に応じて承認経路を設定できなければならない。作成者と承認者の職務分離、多段階承認、差し戻し、再承認、期限、代理承認を扱う。YMYL、重要ページ、自動公開、予算超過は通常操作より強い承認条件を設定できる。

### REQ-ORG-07 予算・クレジット配賦

Contract Accountのクレジットおよび利用予算をCustomer Organization、Organization Unit、Siteへ配賦し、月次枠、タスク上限、超過申請、回収、再配賦を管理できなければならない。配賦は会計台帳を置き換えず、消費の許可枠として扱う。

### REQ-ORG-08 情報可視性

記事、キーワード、分析、成果、請求、監査の可視範囲を独立して制御する。同一Customer Organization内でも部門・ブランド間を非公開にでき、External Memberは割当対象だけ、経営層は許可された集計だけを閲覧できる。

### REQ-ORG-09 代理店・顧客関係

Partner Organizationは明示的なPartner Relationshipと顧客側承認に基づき、指定された顧客組織とResource Scopeだけを操作できる。代理店配下に顧客データを所有させず、顧客ごとのtenant境界、データ所有権、契約主体を維持する。

### REQ-ORG-10 ライフサイクル

招待、参加、異動、兼務、休止、退職、契約終了、部門統廃合、Site移管、代理店から内製への移行を扱う。無効化されたMembershipのセッションと権限は速やかに失効し、履歴、成果物、承認記録の所有先は保持する。

### REQ-ORG-11 組織変更の安全性

組織統合、分割、Site移管、契約主体変更は、影響対象、データ所有先、権限差分、請求・クレジット差分を事前表示し、承認後に実行する。処理は冪等かつ監査可能とし、部分失敗時に安全な状態へ復旧できなければならない。

### REQ-ORG-12 監査と棚卸し

所属、Role Assignment、承認、代理操作、予算配賦の変更について、実行者、承認者、対象範囲、変更前後、有効期間、理由を監査記録へ残す。Customer OrganizationのOwnerは定期的な権限棚卸しを実施でき、期限切れ・未使用・過剰権限の候補を確認できる。

## 4. 接続要求

- 認証、認可強制、セッション、監査保護は `security-access-requirements_v1.md` を参照する。
- 組織管理画面と権限別表示は `screen-operation-requirements_v1.md` を参照する。
- 契約、請求、クレジット台帳は `billing-accounting-requirements_v1.md` を参照する。
- プラットフォーム運営者の内部Roleと管理操作は `platform-administration-control-requirements_v1.md` を参照する。

## 5. 受入条件

- [ ] AC-ORG-01: 契約組織配下に部門、チーム、ブランド、Siteを構成できる。
- [ ] AC-ORG-02: 同一ユーザーが所属先ごとに異なるRoleとScopeを持てる。
- [ ] AC-ORG-03: UI非表示だけでなくAPI側で同一Permission判定が強制される。
- [ ] AC-ORG-04: 権限継承、明示拒否、競合時の結果が再現可能である。
- [ ] AC-ORG-05: 記事実行、公開、接続、課金、データ出力を個別に制御できる。
- [ ] AC-ORG-06: 多段階承認、差し戻し、期限、代理承認が監査される。
- [ ] AC-ORG-07: 部門・Site予算の超過が実行前に停止または承認待ちになる。
- [ ] AC-ORG-08: 代理店ユーザーが未契約・未許可の顧客を閲覧できない。
- [ ] AC-ORG-09: 退職・契約終了時にアクセスが失効し、成果物と履歴は失われない。
- [ ] AC-ORG-10: 組織・Site移管前に権限、データ、請求への影響が表示される。
- [ ] AC-ORG-11: Ownerが権限棚卸しを実行し、是正履歴を確認できる。
