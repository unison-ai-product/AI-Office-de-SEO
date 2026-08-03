# Claude要求レビュー解消表（2026-08-03）

> **履歴スナップショット**: 本書はClaudeレビュー各指摘への解消証拠を記録した時点の監査資料であり、現在の要求件数、未確定事項、正本関係、実装状態を単独で判定する資料ではない。現在値はmanifest、Artifact Alignment Ledger、Open Items Register、要求監査結果および各正本文書を参照する。

## 1. 対象

16分類の成熟度、AC衝突・横断Trace、課金、デザイン、WordPress重複、ロジック分割、セキュリティ、計測運用、移行方針を指摘したClaudeレビューへの回答を記録する。元レビュー本文は会話・レビュー資料へ残し、本書は現行worktreeの解消状態を示す。

## 2. Critical

| # | 指摘 | 状態 | 現行証拠／残件 |
|---|---|---|---|
| 1 | AC-ID衝突 | resolved | AC namespaceとTraceを再編し、監査で270 canonical AC、516 traced AC、重複・不正参照なし。 |
| 2 | 新設ACが横断一覧にない | resolved | 全443 REQが横断TraceのACへ接続。CIで正本／Trace集合を検査。 |
| 3 | 課金・会計が1要求だけ | resolved | `REQ-BILLING-01〜16`へCatalog、Subscription、Lot、reserve／commit／release、Ledger、Stripe、照合、Plan変更、返金、税、権限、Dunning、自動チャージ、Trialを定義。L2／L3／画面接続も追加。 |
| 4 | デザイン・体験が空箱 | resolved | `REQ-DESIGN-01〜12`へ状態同一性、情報階層、Recommendation、desktop/accessibility、待機、i18n、素材、Office、3D縮退、Knowledge Graph、Mobile構想を定義。 |

## 3. Important

| # | 指摘 | 状態 | 現行証拠／残件 |
|---|---|---|---|
| 5 | WordPress仕様が4文書へ重複 | resolved_with_migration | CMS Connection Routing Mapを接続正本とし、read／write／Media／Editor／Preview／Revision／CapacityをCapability化。旧コピーは移行債務として新規利用禁止。文面の完全除去は改版時。 |
| 6 | `REQ-LOGIC-04`肥大化 | resolved | 自動投稿、CMS出力、装飾、アイキャッチ、Preflightを`REQ-LOGIC-04/08/09/10/11`へ分割。 |
| 7 | ロジック要求が必須構造を満たさない | resolved_with_calibration | Article Summary、Keyword推薦／Portfolio、Crawler／AI可視性、品質Repair Routingの詳細文書を追加。境界値の実数はOpen Itemsの運用較正へ分類。 |
| 8 | セキュリティ・権限が3本だけ | resolved | `REQ-ACCESS-01〜18`へ管理面、Role、期限付きアクセス、Session、Sandbox、RLS、KMS、step-up、回復、Executor、監査、負テスト、認可契約、委任、外部送信、break-glassを定義。 |
| 9 | 計測・運用の運用側が空 | resolved | `REQ-MEASURE-01〜12`へTelemetry、Alert、Runbook、Backup、Rollout、Capacity、Support還流、AI可視性ファネルを定義し、AWS Operations Recovery Mapへ接続。 |
| 10 | 移行方針が実行されていない | resolved_with_migration | 旧文書冒頭の「分類別正本への移行」、Legacy Requirement Migration Map、L0旧値の廃止注記、PT-MIGを追加。各旧ID単独参照の除去は改版時の継続債務。 |

## 4. Minor

| 指摘 | 状態 | 対応 |
|---|---|---|
| 未確定事項に計測・設定・時期がない | resolved | Decision Summary §15とOpen Items Registerへ登録。 |
| REQとACの粒度差 | accepted | 1要求に複数境界・異常系ACを持てる。番号一致を対応関係に使用せずTraceを正本とする。 |
| GPT Luna／tera等が実モデルへ対応しない | resolved | 品質段階をProvider非依存商品codeとし、固定モデル名・固定aliasを撤去。Model Registry／RoutingでKimi、Grok、Qwen、local LLM等へ交換可能にした。 |

## 5. 未完了の証拠

要求定義の解消と実装完了は別である。次は未完了として保持する。

- 実JSON Schema、Contract Test、fixture。
- 現行Lifecycleへ合わせた実プロト操作。
- CMS／Provider Adapter試験。
- AWS IaC、障害注入、復元演習。
- Stripe test mode、Ledger reconciliation、auto-charge試験。
- Open Items RegisterのLaunch blocker解消。
