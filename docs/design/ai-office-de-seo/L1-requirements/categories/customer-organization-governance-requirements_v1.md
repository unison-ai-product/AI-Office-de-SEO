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
- `Base Permission`: Owner、Admin、Memberの3種類から選ぶ基本権限。
- `Business Role Tag`: SEO運用で担当する役割を表す業務タグ。

基本構造は `Contract Account → Customer Organization Tree → Membership（基本権限 + 業務タグ）` とする。アクセス対象は所属しているCustomer Organization、Organization Unit、Siteから決まり、権限タグごとに別のScope、継承、有効期間を設定しない。

## 3. 要求

### REQ-ORG-01 組織階層

すべての契約でCustomer Organizationを必須とし、その配下にユーザーが名称と親子関係を自由設定できるOrganization Unitを構成し、Siteを任意の組織ノードへ所属させられなければならない。事業部、部門、チーム、ブランドは初期候補であり、固定階級にしない。個人契約はOwner本人だけの初期組織から開始できる。組織階層の深さ、子ノード数、名称長には設定可能な上限を持ち、循環参照を禁止する。

### REQ-ORG-02 複数所属

1人のUserは複数のCustomer Organization、Organization UnitおよびSiteへ所属でき、所属先ごとに基本権限と業務タグを持てる。主所属、兼務、外部委託、期間限定所属はMembershipの状態として区別する。

### REQ-ORG-03 権限モデル

顧客側権限は「基本権限」と「権限タグ」に分離する。

基本権限は組織内での基礎的な立場と既定の可視範囲を表し、初期値を次の3種類とする。

- `Owner`: 契約主体の最終管理者。契約、請求、Owner移譲、組織、Site、権限を管理できる。
- `Admin`: 組織、Site、Membership、設定を管理できるが、Owner固有操作は実行できない。
- `Member`: 所属先の情報を閲覧できる。業務状態を変更する能力は業務タグで追加する。

Viewer、SEO Manager、Strategist、Editor、Approver、Analyst、Billing担当等を基本権限として増やさない。閲覧だけの利用者は業務タグを持たないMemberとして表現する。SEO運用上の変更能力は、実際の担当業務に対応する次の5タグだけで付与する。

- `目標管理`: Siteの目的、KPI、優先方針、月次計画、予算配分を設定・確定する。
- `キーワード・サイト戦略`: キーワードcluster、優先順位、記事配分、サイト構造、内部リンク、ブランド・商品・顧客情報、推薦方針を設定する。
- `記事執筆`: 新規記事、リライト、画像・装飾の生成、編集、WordPress下書き送信を行う。
- `記事検収`: 完成記事、リライト差分、品質結果を確認し、差し戻し、承認、予約・公開を行う。
- `サイト分析`: GSC、順位、獲得キーワード、流入、CV、記事評価、要監視対象を分析する。

外部接続、Membership、基本権限、業務タグ、請求、契約の管理はSEO業務タグにせず、Owner／Adminの管理権限として扱う。追加credit購入、契約終了、Owner移譲等の契約主体操作はOwnerに限定する。自動運用の有効化・停止は、対象業務のタグに加えてOwnerまたはAdminの管理権限を要求する。

各タグは版管理されたPermission bundleへ解決するが、画面上は細かなPermissionを個別設定させない。タグの付与先はMembershipであり、そのMembershipがアクセスできる組織・Site全体へ適用する。タグごとのScope、継承、有効期間、競合規則、顧客独自タグ作成は初期要求に含めない。

### REQ-ORG-04 所属境界

ユーザーが操作できる範囲はMembershipで所属しているCustomer Organization、Organization Unit、Siteから決定する。基本権限と業務タグは所属範囲内だけで有効とし、別顧客、未所属Site、内部管理面へ継承しない。複数Membershipがある場合は、現在選択している組織・SiteのMembershipだけを認可へ使用する。

### REQ-ORG-05 業務操作権限

SEO業務状態を変更する操作は、REQ-ORG-03の5つの業務タグで制御する。Memberはタグなしでは閲覧だけとする。Adminは接続、組織、Site設定を管理し、Ownerは契約・請求を含む契約主体の最終管理を行う。記事作成や承認等のSEO業務は、AdminまたはOwnerであることだけを理由に許可せず、対応する業務タグも確認する。顧客が閲覧するTask Historyと開発側の内部監査ログを分離し、顧客権限から内部監査ログ、trace、stack、秘密情報、他tenant・管理操作詳細へ到達できない。

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

所属、基本権限、業務タグ、承認、代理操作、予算配賦の変更について、実行者、承認者、対象、変更前後、理由を監査記録へ残す。Customer OrganizationのOwnerは権限棚卸しを実施でき、未使用・過剰な業務タグの候補を確認できる。

## 4. 接続要求

- 認証、認可強制、セッション、監査保護は `security-access-requirements_v1.md` を参照する。
- 組織管理画面と権限別表示は `screen-operation-requirements_v1.md` を参照する。
- 契約、請求、クレジット台帳は `billing-accounting-requirements_v1.md` を参照する。
- プラットフォーム運営者の内部Roleと管理操作は `platform-administration-control-requirements_v1.md` を参照する。

## 5. 受入条件

- [ ] AC-L1-ORG-01: 法人・個人のどちらも必須の契約組織を持ち、その配下に自由名称・自由階層の組織ノードとSiteを構成できる。
- [ ] AC-L1-ORG-02: 同一ユーザーが所属先ごとにOwner／Admin／Memberの基本権限と業務タグを持てる。
- [ ] AC-L1-ORG-03: UI非表示だけでなくAPI側で同一Permission判定が強制される。
- [ ] AC-L1-ORG-04: 現在選択した組織・SiteのMembershipだけからアクセス範囲が決まり、別顧客・未所属Site・内部管理面へ権限が広がらない。
- [ ] AC-L1-ORG-05: 目標管理、キーワード・サイト戦略、記事執筆、記事検収、サイト分析の5タグでSEO業務を制御し、接続・組織・請求・契約はOwner／Adminの管理権限で制御できる。
- [ ] AC-L1-ORG-06: 多段階承認、差し戻し、期限、代理承認が監査される。
- [ ] AC-L1-ORG-07: 部門・Site予算の超過が実行前に停止または承認待ちになる。
- [ ] AC-L1-ORG-08: 個人契約が本人Ownerの初期組織から法人契約と同じ機能を利用できる。
- [ ] AC-L1-ORG-09: 退職・契約終了時にアクセスが失効し、成果物と履歴は失われない。
- [ ] AC-L1-ORG-10: 組織・Site移管前に権限、データ、請求への影響が表示される。
- [ ] AC-L1-ORG-11: Ownerが権限棚卸しを実行し、是正履歴を確認できる。
- [ ] AC-L1-ORG-12: 所属・権限・承認・予算変更の実行者、理由、期限、差分を監査できる。
- [ ] AC-L1-ORG-13: 部門・ブランド間の非公開境界とExternal Memberの可視範囲が、画面とAPIの双方で同じScopeとして強制される。
