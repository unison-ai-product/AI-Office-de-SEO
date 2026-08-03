---
document_id: AOS-L3-GATE-A2-REPO-SCOPE
title: Gate A-2 Repository層スコープ強制API v1（凍結）
layer: L3
version: 1.0
kind: contract
status: current-draft
updated_at: 2026-08-03
---

# Gate A-2: Repository層スコープ強制API v1

DU-01（フェーズ0）の土台。下記はTypeScript風の規範形であり、現行要求監査が完了した時点で実装契約として版固定する。実装言語や開発ツールは固定しない。

## 1. スコープ型（型でdefault-denyを表現）

```ts
type PrincipalContext = {
  readonly principalKind: "customer_user" | "internal_user" | "service" | "ai_executor"
  readonly principalId: PrincipalId
  readonly authorizationEpoch: number
}
type TenantScope = PrincipalContext & {
  readonly tenantId: TenantId
  readonly membershipId?: MembershipId
  readonly delegationId?: DelegationId
}
type SiteScope   = TenantScope & { readonly siteId: SiteId }
type JobScope    = SiteScope   & { readonly jobId: JobId }   // = SiteSandboxContext（作成後不変, REQ-PRODUCT-02）

// スコープ取得の唯一の入口（サーバー側で解決。クライアント申告値を受けない, REQ-SEC-01）
resolveCustomerScope(session, activeOrganizationId): TenantScope // Membershipと基本権限を検証
resolveDelegatedScope(internalSession, delegationId): TenantScope // Managerの対象・操作・期限を検証
resolveSiteScope(scope: TenantScope, siteId): SiteScope           // Site Assignment 0件=全Site、1件以上=指定Site
authorize(scope, action, resource): AuthorizationDecision         // 業務Permission、step-up、委任、policy version
createSandbox(scope: SiteScope, decision: AuthorizationDecision): JobScope // job作成時のみ・以後変更不可
```

顧客Sessionと内部管理Sessionは別namespace・別認証cookie・別resolverを使用する。`internal_user`を顧客Membershipへ変換せず、Managerの顧客アクセスはAdminが発行した期限付き`delegationId`を必須とする。Operatorには`resolveDelegatedScope`を許可しない。`TenantScope`の成立は業務操作の許可を意味せず、各副作用は`authorize`を通す。

## 2. クエリ能力の付与（スコープなしにクエリ手段が存在しない）

```ts
db.forTenant(s: TenantScope): TenantDb   // memberships / billing / connected_accounts 等
db.forSite(s: SiteScope): SiteDb         // keywords / articles / gsc_* / jobs 等
SiteDb.repo<T extends SiteTable>(t): ScopedRepo<T>
// ScopedRepo: 全メソッドが WHERE tenant_id = ? AND site_id = ? を自動付与。除去不能。
// raw SQLビルダーはアプリ層へ非公開。集計はrepo上の型付きメソッドのみ。
```

不変条件（凍結）:
- アプリ/Executor/API層から到達可能なクエリ手段は `db.forTenant / db.forSite` のみ。Unscopedなハンドルをexportしない（モジュール境界＋lint/依存ルールで強制）。
- Executorはこの層にすら触れない（Source Pack経由のみ, REQ-PACK-06）。
- 越境・スコープ未指定はコンパイル/実行時の双方でfail-close＋監査（REQ-SEC-07, AC-TENANT-02）。
- `authorization_epoch`、Membership、Site Assignment、Delegationの変更後は既存Scopeを再利用せず再解決する。Scopeの存在だけでupdate、execute、approve、publish、purchase、delegate_accessを許可しない。内部Managerの代理ScopeはAdminが付与したoperationだけを許可し、顧客User Sessionへ変換しない。

## 3. RLS（多層防御・方針決定）

- 全テナントテーブルでPostgreSQL RLSを有効化＋`FORCE ROW LEVEL SECURITY`。ポリシー: `tenant_id = current_setting('app.tenant_id')::uuid`（site列を持つ表は site も同様）。
- アプリはトランザクション毎に `SET LOCAL app.tenant_id / app.site_id` を設定（コネクションプール安全）。
- **決定**: アプリ層の単一強制ポイントが第一防御、RLSは第二防御（性能影響はL3計測で確認、逸脱時も無効化はProduction Hardeningの承認事項）。

## 4. 例外経路（唯一）とグローバル信号ストア（配置決定）

- ネットワーク集約パイプライン（REQ-PRODUCT-13/SEC-07の唯一例外）: 専用DBロール `aos_aggregator`。アプリ・Executor・APIプロセスから資格情報到達不能（別サービス/別デプロイ）。読み取りは横断可（専用ポリシー付与）、**書き込み先は `global_signals` スキーマのみ**、全実行監査。
- **決定**: 共有領域は同一クラスタ内の別スキーマ `keyword_assets` と `global_signals` に分離する（DDL §8）。`keyword_assets` は公共外部データとしてprovenanceと再利用条件を持つキーワード文字列を保持できるが、テナント列・URL・顧客実績・顧客対応は禁止する。`global_signals` は顧客由来のk匿名派生物だけを保持し、生GSCクエリ文字列・URL・識別子の列を作らない。アプリからはread-onlyビュー（ホワイトリスト, REQ-PACK-06）経由のみ。将来の物理分離はこの境界で切り出せる。
- 共有観測キャッシュ: キースペース `shared_obs:{provider}:{kind}:{locale}:{kw_hash}`。書き込みは取得パイプラインロールのみ、アプリはread-only（AC-NET-04）。

## 5. 負のテスト（受入に直結・実装と同時に作成）

1. スコープなしでrepo取得→コンパイル不能（型）/実行時fail-close。2. 別tenantのsite_idでresolveSiteScope→拒否＋監査。3. Site Assignment外のSite→拒否、Assignment 0件→全Siteとして解決。4. 業務Permissionなしのupdate／execute→拒否。5. 顧客Sessionから内部resolver、内部Sessionから顧客resolver→拒否。6. 期限切れ／対象外DelegationとOperator代理→拒否。7. authorization epoch更新後の旧Scope→拒否。8. RLS単独でも越境SELECTが0行。9. Executorプロセスからdb資格情報へ到達不能。10. アプリロールからglobal_signalsへINSERT→拒否。11. shared_obsへアプリからwrite→拒否。（AC-L1-ACCESS-01〜05/11/14〜16、AC-TENANT-02/03、AC-SANDBOX-*、AC-NET-04）
