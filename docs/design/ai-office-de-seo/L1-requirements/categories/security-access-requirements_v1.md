---
document_id: AOS-L1-SECURITY-ACCESS-REQUIREMENTS
title: AI Office de SEO セキュリティ・権限要求 v1.2
version: 1.2
layer: L1
kind: security_access_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO セキュリティ・権限要求

## 責務

認証、認可、テナント分離、秘密情報、監査、データ保護を定義する。

重点:

- User / Tenant / Site / Role / Jobの境界
- SiteSandboxContextとdefault-deny
- 共有DB上のID型論理分離
- Repository単一強制ポイントとRLS
- OAuth token、API key、Webhook secret、KMS
- step-up認証、招待、全端末失効、Owner回復
- Executorの直DB禁止
- 監査ログ、なりすまし、越境負テスト
- 一時本文、ログ、キャッシュ、キュー、オブジェクトの分離

既存ソース: `ai-office-de-seo-security-observability-requirements_v3.7.md`、`ai-office-de-seo-product-requirements_v3.7.md` §2/8/10。

## 要求

### REQ-ACCESS-01 管理面の分離

顧客ユーザー面と開発管理面は、認証対象、セッション、認可ポリシー、ルートまたはホスト、監査を分離する。顧客側UserまたはCustomer Organization Roleでは開発管理面のトークンを取得できず、URLまたはAPIを直接指定してもdefault-denyで拒否する。

### REQ-ACCESS-02 内部Role境界

Adminは内部権限の付与、Managerは期限・顧客・Site・操作種別を限定した顧客運用、Operatorは機微情報を除去した開発ログ・メトリクス・トレースの閲覧に限定する。Operatorの観測面に記事本文、秘密情報、プロンプト全文、不要な個人情報を表示しない。

### REQ-ACCESS-03 期限付き顧客アクセス

Managerが顧客データへアクセスする場合、Adminによる付与を必須とし、対象、目的、理由、Permission、有効期限、付与者を記録して期限到達時に自動失効する。アクセスと変更はacting user、target organization、対象resource、変更前後を監査する。

### REQ-ACCESS-04 認証・Session

User、Service、内部運用者を異なるprincipal種別として認証し、sessionへuser、active organization、Role、認証強度、発行・失効時刻を束縛する。組織切替、Role変更、退会、全端末失効、credential変更後は再認可する。clientが申告するRole、tenant、Siteを認可根拠にしない。

### REQ-ACCESS-05 SiteSandboxContext

API、job、AI Executor、外部Adapterは、認証済みprincipalとMembershipからサーバー側で生成した `tenant_id / site_id / user_id / role / permission / job_id` をSiteSandboxContextとして受け取る。Context欠落、不一致、期限切れはdefault-denyとし、AI toolやclientへ任意tenant/site指定を許可しない。

### REQ-ACCESS-06 テナント強制点・RLS

共有DB上の顧客データアクセスは、Repository／Data Access層の単一強制点と、利用可能な場合のRow Level Securityを併用する。tenant/site scopeなしのquery、越境JOIN、scopeを上書きするraw queryを通常経路で実行できないようにする。管理画面も同じ強制点を通り、内部Roleだけを理由に全テナント無制限queryを許可しない。

### REQ-ACCESS-07 秘密情報・鍵管理

OAuth token、Application Password、API key、Webhook secret、決済識別子等は用途・tenant・接続単位で分離し、AWS KMS等の管理鍵を用いたenvelope encryption、最小権限、rotation、失効、アクセス監査を持つ。秘密原文をログ、trace、通知、AI prompt、管理画面へ出力せず、再表示より再発行を優先する。

### REQ-ACCESS-08 Step-up・重要操作

課金購入・解約、権限付与、Owner移譲、自動投稿解放、秘密再発行、金銭調整、Manager代理権限付与等は、通常sessionより強い再認証またはstep-upを要求する。重要操作の一覧と認証有効時間をversion管理し、UI非表示だけで代替しない。

### REQ-ACCESS-09 招待・Owner回復

招待は対象組織、Role、期限、単回token、招待者を持ち、転送・再利用・期限後利用を拒否する。Owner不在を防ぐ移譲規則を持ち、Owner回復は本人確認、既存Ownerへの通知、待機期間、監査を伴う別手続きとする。Support担当者が本人確認なしにOwnerへ昇格させない。

### REQ-ACCESS-10 Executor・Provider境界

AI Executorは本番DBへ直接接続せず、許可されたtool/APIをSiteSandboxContext内で呼び出す。toolごとにread/write、resource種別、最大件数、本文一時取得、外部送信先をallowlist化し、Promptや生成物による権限拡張を許可しない。

### REQ-ACCESS-11 監査・なりすまし表示

認証、拒否、Role変更、秘密アクセス、step-up、代理アクセス、公開、課金、Kill Switch、設定変更をappend-only監査eventへ記録する。代理操作中はacting principalとcustomer contextを画面・API・監査で分離し、顧客本人の操作として記録しない。監査eventにも本文・秘密原文を含めない。

### REQ-ACCESS-12 越境負テスト

全API、Repository、cache、queue、object key、search index、log、export、Webhookを対象に、別tenant/site ID、欠落Context、推測ID、期限切れ権限、Role変更直後、並行実行の越境負テストを持つ。新しいdata pathは負テストがない状態で本番公開しない。

### REQ-ACCESS-13 マスターテナント・Showcase境界

開発者スーパーアカウントおよびマスターテナントであっても、顧客tenantへの常時横断参照権限を持たせない。顧客実績をサービス紹介へ利用する場合は、`REQ-DATA-13` の明示許諾、許諾範囲、期限、撤回条件を検証する専用処理だけが、許可項目をversion付きShowcase Snapshotへコピーできる。コピー元tenant、実行者、許諾version、コピー項目、公開先、撤回・削除を監査する。

限定TrialのCustomer Organizationも通常顧客と同じtenant分離を適用する。Trialであること、内部招待であること、開発者スーパーアカウントが発行したことを、顧客データへの広いアクセス権限や品質・公開ゲートの迂回根拠にしてはならない。

### REQ-ACCESS-14 認可判定契約

すべての画面、API、job、Agent tool、外部Adapter、管理操作は、共通の認可判定契約 `AuthorizationDecision(principal, action, resource, context)` を使用する。判定入力は少なくとも次を持つ。

- `principal`: customer user、internal operator、service、AI executorの種別と認証済みID
- `action`: read、create、update、delete、execute、approve、publish、connect、purchase、export、impersonate等のPermission
- `resource`: tenant、organization node、Site、記事、Keyword、Recommendation、Task、connection、credit、billing、secret等のIDと所有境界
- `context`: active tenant／organization／Site、Membership、Site Assignment、基本権限、業務タグ、Plan Entitlement、認証強度、代理権限、job、環境

出力は `allow / deny / step_up_required / approval_required`、適用したPermission、Scope、理由code、policy version、有効期限とする。UIはこの結果を説明・表示するが独自判定を持たず、API、非同期worker、Agent toolは実行直前に同じ契約で再判定する。入力欠落、競合未解決、policy不明はdefault-denyとする。

### REQ-ACCESS-15 Role・Permission・Scopeの責務境界

顧客の基本権限・業務タグ・所属境界の正本は `REQ-ORG-03`～`REQ-ORG-05`、内部Admin／Manager／Operatorの正本は `REQ-PAC-01`、強制方式は本書とする。業務タグはversion付きPermission bundleへ解決する。顧客の基本権限・業務タグと内部Roleを同一namespaceまたは同一Assignmentへ格納しない。

判定順序は、環境・tenant境界 → resource所有境界 → principal種別 → 現在選択したMembership／期限付き代理権限 → 基本権限・業務タグ → 認証強度・承認 → Plan Entitlement・予算等の業務条件とする。Owner、Admin、Officeの詳細画面、Feature Flag、Plan変更は前段の境界を上書きできない。同じ入力とpolicy versionから同じ判定を再現できなければならない。

### REQ-ACCESS-16 自動運用・Agent委任境界

自動投稿、定期実行、イベント駆動Task、Agentへの会話指示は、設定した顧客ユーザーの権限をAgentへ恒久付与する仕組みにしない。Automation Policyは、設定者、対象Site、許可operation、上限、予算、同意version、有効期間、停止条件を持つ委任契約として保存する。job起動時と外部変更・公開等の副作用直前に、service principal、委任契約、対象resource、現在policyを組み合わせて再認可する。

自動運用ON、最初の15記事の承認完了、Agent Officeの詳細操作、会話による変更案、内部Managerの代理操作のいずれも、tenant境界、顧客Permission、公開対象、予算、外部接続Scopeを拡張する根拠にしない。設定者の退会・権限喪失、委任期限切れ、Site移管、接続変更、Kill Switch時は新規副作用を停止し、既存jobを安全な確認待ちへ遷移させる。

### REQ-ACCESS-17 データ利用・外部送信境界

データは少なくとも、顧客業務データ、本文一時データ、認証・秘密情報、課金・契約データ、内部観測データ、匿名較正データ、公開Showcaseデータへ分類する。各分類は保存先、暗号化、保持期間、閲覧Permission、外部送信先、AI Provider利用可否、export可否をpolicyとして持つ。分類変更または外部送信はデータ所有tenant、目的、送信先、最小項目、同意・契約根拠を検証する。

顧客向け通常ビュー／Agent Office、内部管理面、AI Provider、ログ・trace、匿名全体較正、Showcaseの間で、用途が異なるデータを暗黙転用しない。記事本文を一時取得できるPermissionは、本文の恒久保存、内部閲覧、学習、Showcase利用、別tenantへの提供を許可しない。

### REQ-ACCESS-18 緊急アクセス・Break-glass

通常のAdmin／Manager権限で解決できない重大障害に限り、事前定義した緊急Permissionと短い有効期限を持つbreak-glass手続きを使用できる。実行者の強い再認証、理由、incident ID、対象tenant／Site／resource、許可operation、開始・終了、使用eventを必須とし、常設の全tenant参照tokenを発行しない。

break-glassでも秘密原文の一括取得、tenant分離解除、監査停止、台帳改変、顧客本人としての記録は許可しない。使用後は自動失効、関係者通知、監査review、取得データ・一時credentialの破棄確認を行う。通常運用、顧客支援、機能検証、営業目的には使用しない。

## 受入条件

- [ ] AC-L1-ACCESS-01: 顧客ユーザーの資格情報で開発管理画面・APIへアクセスできない。
- [ ] AC-L1-ACCESS-02: Operatorが顧客データ変更、本文、秘密情報へアクセスできない。
- [ ] AC-L1-ACCESS-03: AdminだけがManagerの顧客アクセスを付与でき、許可範囲外と期限後のアクセスが拒否される。
- [ ] AC-L1-ACCESS-04: sessionがUser・active organization・Role・認証強度へ束縛され、切替・失効後に再認可される。
- [ ] AC-L1-ACCESS-05: SiteSandboxContext欠落・不一致時にAPI、job、Executor、Adapterがdefault-denyになる。
- [ ] AC-L1-ACCESS-06: Repository強制点とRLSの越境queryが拒否され、管理画面も迂回できない。
- [ ] AC-L1-ACCESS-07: 秘密情報が接続単位で暗号化・rotationされ、ログ・trace・画面へ原文表示されない。
- [ ] AC-L1-ACCESS-08: 重要操作がstep-upなしではAPIからも拒否される。
- [ ] AC-L1-ACCESS-09: 招待tokenの再利用・期限後利用を拒否し、Owner回復が本人確認と監査を伴う。
- [ ] AC-L1-ACCESS-10: Executorが本番DBへ直接接続できず、許可toolのSite scopeを越えられない。
- [ ] AC-L1-ACCESS-11: 代理操作のacting principalとcustomer contextを監査上区別できる。
- [ ] AC-L1-ACCESS-12: 全data pathの越境負テストがCIまたはrelease gateで通過する。
- [ ] AC-L1-ACCESS-13: マスターテナントが顧客tenantを直接参照できず、許諾済みShowcase Snapshotの作成・公開・撤回だけを監査可能な専用経路で実行できる。
- [ ] AC-L1-ACCESS-14: 画面、API、worker、Agent toolが同じprincipal・action・resource・contextとpolicy versionから同じ認可結果を返し、不明入力を拒否する。
- [ ] AC-L1-ACCESS-15: 顧客の3基本権限・業務タグと内部Roleが分離され、Owner／AdminやFeature Flagでtenant・Membership境界を上書きできない。
- [ ] AC-L1-ACCESS-16: 自動運用jobが委任範囲内だけで副作用を実行し、設定者の権限喪失・Site移管・Kill Switch後は公開等を継続しない。
- [ ] AC-L1-ACCESS-17: 本文一時取得、内部観測、Provider送信、匿名較正、Showcase利用が別Permission・目的・保持policyとして強制される。
- [ ] AC-L1-ACCESS-18: break-glassが重大incidentに限定され、短期失効・強認証・対象限定・事後reviewを伴い、安全不変条件を解除できない。
