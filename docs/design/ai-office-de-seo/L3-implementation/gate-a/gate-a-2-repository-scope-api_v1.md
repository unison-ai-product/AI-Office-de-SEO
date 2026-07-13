---
document_id: AOS-L3-GATE-A2-REPO-SCOPE
title: Gate A-2 Repository層スコープ強制API v1（凍結）
layer: L3
status: frozen-v1
updated_at: 2026-07-02
---

# Gate A-2: Repository層スコープ強制API v1（凍結）

DU-01（フェーズ0）の土台。**形（シグネチャと不変条件）を凍結**し、実装言語の写像はClaude Codeが行う（下記はTypeScript風の規範形）。

## 1. スコープ型（型でdefault-denyを表現）

```ts
type TenantScope = { readonly tenantId: TenantId }
type SiteScope   = TenantScope & { readonly siteId: SiteId }
type JobScope    = SiteScope   & { readonly jobId: JobId }   // = SiteSandboxContext（作成後不変, REQ-PRODUCT-02）

// スコープ取得の唯一の入口（サーバー側で解決。クライアント申告値を受けない, REQ-SEC-01）
resolveScope(session, activeTenantId): TenantScope
resolveSiteScope(scope: TenantScope, siteId): SiteScope     // 所属検証込み
createSandbox(scope: SiteScope): JobScope                   // job作成時のみ・以後変更不可
```

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

## 3. RLS（多層防御・方針決定）

- 全テナントテーブルでPostgreSQL RLSを有効化＋`FORCE ROW LEVEL SECURITY`。ポリシー: `tenant_id = current_setting('app.tenant_id')::uuid`（site列を持つ表は site も同様）。
- アプリはトランザクション毎に `SET LOCAL app.tenant_id / app.site_id` を設定（コネクションプール安全）。
- **決定**: アプリ層の単一強制ポイントが第一防御、RLSは第二防御（性能影響はL3計測で確認、逸脱時も無効化はProduction Hardeningの承認事項）。

## 4. 例外経路（唯一）とグローバル信号ストア（配置決定）

- ネットワーク集約パイプライン（REQ-PRODUCT-13/SEC-07の唯一例外）: 専用DBロール `aos_aggregator`。アプリ・Executor・APIプロセスから資格情報到達不能（別サービス/別デプロイ）。読み取りは横断可（専用ポリシー付与）、**書き込み先は `global_signals` スキーマのみ**、全実行監査。
- **決定**: グローバル信号ストアは同一クラスタ内の**別スキーマ `global_signals`**（テナント列なし・生データ/URL/クエリ文字列/識別子の列を作らない。DDL §8）。アプリからはread-onlyビュー（ホワイトリスト, REQ-PACK-06）経由のみ。将来の物理分離はこの境界で切り出せる。
- 共有観測キャッシュ: キースペース `shared_obs:{provider}:{kind}:{locale}:{kw_hash}`。書き込みは取得パイプラインロールのみ、アプリはread-only（AC-NET-04）。

## 5. 負のテスト（受入に直結・実装と同時に作成）

1. スコープなしでrepo取得→コンパイル不能（型）/実行時fail-close。2. 別tenantのsite_idでresolveSiteScope→拒否＋監査。3. RLS単独でも越境SELECTが0行。4. Executorプロセスからdb資格情報へ到達不能。5. アプリロールからglobal_signalsへINSERT→拒否。6. shared_obsへアプリからwrite→拒否。（AC-TENANT-02/03, AC-SANDBOX-*, AC-NET-04）
