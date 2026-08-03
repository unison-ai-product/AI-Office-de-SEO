---
document_id: AOS-L1-SECURITY-OBSERVABILITY
title: AI Office de SEO セキュリティ・観測・検証要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO セキュリティ・観測・検証要求 v3.7

> **権限移行注記（2026-08-03）**: 本書の旧Role表現は監査用に残す。顧客基本権限・業務権限・Site Assignmentは`REQ-ORG-03〜05`、共通認可契約は`REQ-ACCESS-14〜18`、操作別対応は`ai-office-de-seo-authorization-operation-matrix_v1.md`を現行正本とする。

## 分類別正本への移行

認証・認可・tenant分離・秘密管理は `categories/security-access-requirements_v1.md`、性能・可用性は `categories/non-functional-requirements_v1.md`、平常時の観測・runbookは `categories/measurement-operations-requirements_v1.md`、実装境界は `categories/technical-architecture-requirements_v1.md` を現在の正本とする。本書の `REQ-SEC-*` 等は既存詳細・移行未完項目として維持する。

## 1. セキュリティ  ［REQ-SEC-01］

- 全主要データ・キャッシュ・キュー・ストレージ・ログは `tenant_id` と、サイトに閉じるものは `site_id` の境界を持つ。
- AIツール・API・バッチ・WP連携・GSC同期は任意の `tenant_id` / `site_id` を受け取らず、サーバー側で固定された境界に閉じる。
- ジョブ作成後にtenant_id/site_idを変更できない。
- 境界外データ参照・書き込みはfail-closeでエラー化し、監査ログに残す。
- Google/WP/外部API keyは暗号化保存し、平文で再表示しない。
- 記事本文、競合本文、プロンプト全文を恒久ログに残さない。
- 通信はTLSで保護し、外部からのWebhook（Stripe/WP等）は署名検証を必須にする。
- 権限判定はサーバー側で行い、クライアント申告のRole/テナントを信頼しない。

## 2. Observability  ［REQ-SEC-02］

LLMはブレやすいため、発火、入力、出力、エラー、retry、QA fail、schema validation fail、token、cache、creditを構造化ログで取る。

記録するもの:

- job_id
- ticket_id
- executor_kind
- workflow_key
- prompt_pack_keys
- source_pack_keys
- schema_keys
- input_token_estimate
- actual_input_tokens
- output_tokens
- cache_read_tokens
- cache_write_tokens
- uncached_input_tokens
- credit_reserved
- credit_committed
- error_code
- qa_result
- snapshot_hash

## 3. Prompt Cache / Token Tracker  ［REQ-SEC-03］

Prompt CacheとToken Trackerは必須。

開発管理者画面で以下を確認できる。

- cache hit rate
- cache read tokens
- cache write tokens
- uncached input tokens
- model別効率
- workflow別効率
- site別効率
- cache miss理由
- 予想 vs 実績トークン
- 予想 vs 実績クレジット

## 4. 事前シミュレーション  ［REQ-SEC-04］

新規記事、リライト、QA、投稿予約、自動化の実行前に決定論的な事前シミュレーションを行う。

算出するもの:

- 予想入力トークン
- 予想出力トークン
- 予想Prompt Cache効果
- 外部API費用
- LLM費用
- 予想クレジット
- 実行可否
- 予算超過時の代替案

## 5. 受入検証  ［REQ-SEC-05］

- 別サイトのGSCデータをAIが参照できない。
- 別サイトのWP下書きに送れない。
- 記事本文が恒久保存されない。
- 競合本文が恒久保存されない。
- 表はJSON正本から投稿形式へ変換される。
- Prompt Cache / Token / Creditが記録される。
- full_autoは承認なしでONにならない。
- index待ち記事を弱い記事として誤判定しない。
- テナント別物理DBではなく、共有DB上の`tenant_id`/`site_id`によるID型論理分離になっている。
- スコープ未指定・越境クエリはfail-closeし、実行されない。
- テナント由来データを含むキャッシュのキーに`tenant_id`/`site_id`が含まれ、テナント間で共有されない（公共外部観測・Layer Aの共有可否は`REQ-SEC-07`の2層区分と契約検証に従う）。
- 1ユーザーが複数テナント・複数Googleアカウントを持てて、接続とトークンがテナント境界を越えない。
- 保存済みシークレットが平文で再表示されない。
- テナント削除が`tenant_id`スコープで実行でき、監査ログに残る。

## 6. 性能要求  ［REQ-SEC-06］

性能は社内運用版 `UNISON-TECHNOLOGY/seo-agent` から得た最重要の非機能知見として扱う。Production Hardeningで後付けせず、各開発ユニットの設計、実装、受入に含める。

画面表示は事前計算済みデータの配信を基本とし、重い集計・外部取得・生成は画面表示の同期経路で実行しない。APIの処理時間だけでなく、ユーザーが「待たされた」「固まった」と感じない体感速度を受入対象にする。

- ダッシュボード、キーワード管理、サイトページ管理などの主要一覧は、分散バッチが事前計算したスナップショットから配信する。
- キーワードマップ生成、競合Top5、Article Map、カバー率、Query Drift、リライト候補は事前計算対象とし、画面ではキャッシュ結果を表示する。
- 生成・リライト・QA・投稿予約はジョブ化し、画面は投入と進捗表示のみを同期で行う。
- 各主要画面に初期表示レイテンシ目標を設定し、受入で計測する。初期目標値（要調整）: 主要一覧の初期表示 P95 2秒以内、キャッシュ済みキーワードマップ表示 P95 3秒以内、ジョブ投入応答 P95 1秒以内。
- 画面シェル、主要ナビゲーション、現在地をデータ取得完了前に表示し、1つの遅いデータ源で画面全体をブロックしない。
- 一覧は取得上限、ページングまたは仮想化を必須とし、初期表示で全履歴・全キーワード・全記事を取得しない。
- タブ切替、フィルタ、承認、ジョブ投入などの主要操作は即時に受付状態を返し、完了待ちの処理は進捗、部分結果、再試行、取消可否を表示する。
- 前回成功スナップショットが利用可能な場合は、無表示に戻さず鮮度を明示して表示し、更新をバックグラウンドで行う。
- 主要画面のクライアント配信量、初期API本数、DBクエリ数に予算を設け、予算超過を性能レビュー対象とする。具体値はL3の実測で確定する。
- 性能計測は空データだけで合格させず、想定する記事数・キーワード数・GSC行数を持つ代表テナントと、上限近傍のテナントで行う。
- 事前計算が未完了の場合は、空表示ではなく計算中状態と再試行手段を提示する。

レイテンシ目標値は初期目標であり、確定は実測とインフラ前提の確定後に行う。

### 6.1 データベース軽量化要求

DBは検索・業務判断・実行状態の正本であり、取得したものを無制限に置くデータレイクとして扱わない。

- 恒久DBには、正規化された識別子、業務状態、短いサマリー、集計値、hash、外部正本への参照、監査に必要な最小記録を保存する。
- 記事本文、生HTML、競合本文、LLM raw response、プロンプト全文、大容量debug payloadは恒久DBへ保存しない。処理に必要な場合は暗号化された一時領域またはオブジェクトストレージへ置き、TTLで削除する。
- GSC、イベント、利用量、ジョブ履歴など増加し続けるデータは、保持期間、日次・月次ロールアップ、削除またはアーカイブ経路、サイト当たり容量上限を持つ。
- JSON列へ検索・集計対象の大きな可変payloadを安易に蓄積しない。頻繁に参照する値は小さい列または事前計算read modelへ投影する。
- 画面要求から無制限の走査、無制限JOIN、N+1取得を行わない。クエリ時間、走査行数、返却行数を観測し、上限超過を検知する。
- ベクトル索引は必須経路にせず、Article Summary由来の限定用途だけに使用する。導入前にDB容量、更新費用、検索レイテンシへの影響を計測する。
- 各テーブルまたはデータ群は、作成時に所有者、増加単位、保持期間、上限、削除・ロールアップ方法を定義する。削除不能な無期限データを新設しない。
- スキーマ変更と機能追加では、機能受入と同時にデータ増加量、代表クエリ、索引、保持処理を検証する。

## 7. テナント分離の実施（ID型・越境防止）  ［REQ-SEC-07］

分離方式はID型論理分離（`REQ-PRODUCT-10`）であり、列を足すだけでは越境を防げないため、以下の補償的統制で成立させる。

- 単一の強制ポイント: 全データアクセスをRepository層等の単一チョークポイントに通し、`tenant_id`（必要に応じ `site_id`）を必須スコープとして自動付与する。
- default-deny: スコープが未指定・解決不能なクエリは実行させず失敗させる。テナント横断の集計・JOINを既定で禁止する。**明示的に認可された例外は次の2経路のみ**である。①ネットワーク集約パイプライン（`REQ-PRODUCT-13`）: 専用のシステムロールでのみ実行し、Executor・AIジョブ・外部APIから到達不能とし、出力はk匿名・識別子除去済みの派生物（グローバル信号ストア）に限定する。②同意ベースの事例転用（`REQ-PRODUCT-23`）: テナントの明示許諾の範囲フィールドのみを、転用時点スナップショットとしてshowcaseストアへコピーする専用経路で、撤回により以後の利用停止・削除を行う。いずれも実行・出力・ロール利用を監査ログに残し、これら以外の横断アクセスは引き続きfail-closeする。
- 多層防御: アプリ層のスコープ強制に加え、可能な範囲でDBの行レベルセキュリティ（RLS）等をdefense-in-depthとして併用する。
- キャッシュ・資産分離: **テナント由来データを含む**キャッシュ（Layer B/C相当のPrompt Cache、GSC・記事・方針データのキャッシュ等）は、キーに `tenant_id` / `site_id` を必須とし、テナント間の共有・汚染・漏洩を防ぐ。一方、**テナントデータを含まない共有物**——公共キーワード資産、公共外部観測キャッシュ（SERP/AIO/PAA/News。キーワード×ロケール×プロバイダがキー、`REQ-SRC-06`/`REQ-SRC-08`/`REQ-PRODUCT-13`）と、設計上テナント情報を含まないLayer Aグローバルプレフィックス（`REQ-AGENT-03`）——はテナント横断で共有してよい。共有可の条件は「公共外部データとして取得元と再利用条件を確認でき、テナントデータを含まないこと」であり、provenance契約とcache prefix hygiene等の契約検証（`REQ-SEC-13`）で保証する。共有物への書き込みは認可されたシステム側取得・集約パイプラインに限定し、テナント別のアクセスログはテナントスコープで記録する。
- 非DB資産の分離: キュー、ジョブ、オブジェクトストレージ、一時本文領域、ログも識別子スコープで分離する。
- Executorのデータ経路: Semantic／Hybrid Executorはテーブルへ直接アクセスせず、site_idスコープで解決するSource Pack経由でJSONを受け取る（`REQ-PACK-06`）。Action Executorは認可済みCommand／Tool契約だけを利用する。Office Conversation Runtimeも同じSiteSandboxContextと許可Serviceを通し、会話から直接DBへ接続しない。
- 越境試行の扱い: 別テナント・別サイトの識別子を指すアクセスはfail-closeし、監査ログに残す。
- 負のテスト: 越境が起きないことを、越境を試みて失敗することの受入テストで検証する（`REQ-SEC-05`）。

## 8. 認証・認可  ［REQ-SEC-08］

- セッション/トークンは、User・アクティブTenant・Roleに束縛する。テナント切替は明示操作とし、切替後のコンテキストで再度権限判定する。
- 認可は最小権限で行い、Role権限マトリクス（`REQ-PRODUCT-08`）をサーバー側で強制する。
- 1ユーザーが複数テナントに所属する場合でも、あるテナントのMembership・Roleが別テナントの権限に波及しない。
- 管理者操作（メンバー招待、Role変更、full_auto有効化、Kill Switch作動、課金操作）はサーバー側で権限確認し、監査ログに残す。

## 9. シークレット・トークン管理  ［REQ-SEC-09］

- Google/GSC/WordPress/外部APIの認証情報は暗号化保存し、鍵管理（KMS/エンベロープ暗号化）と鍵ローテーションを前提にする。
- 保存済みシークレットは平文で再表示せず、マスク表示のみとする。
- OAuthトークンはConnected Account単位・Tenant単位でスコープし、テナントをまたいで共有しない。
- 接続の失効・切断・再認可に対応し、切断時は当該トークンを破棄する。失効・エラー時は再認可を促す。
- シークレットへのアクセスは監査ログに残す。

## 10. 監査ログとテナントオフボーディング  ［REQ-SEC-10］

- 監査ログはappend-onlyで保持し、誰が・いつ・どのテナント/サイトで・何をしたかを記録する。少なくとも、境界違反試行、シークレットアクセス、Role変更、Feature Flag/Kill Switch操作、課金操作、full_auto有効化を対象にする。
- 監査ログにも `tenant_id` を付与し、テナント境界内で参照させる。
- 共有DB上のID型分離のため、テナントの削除・退会（オフボーディング）は `tenant_id` スコープでの一括削除として実行できる。データエクスポートも `tenant_id` スコープで提供する。
- 削除・エクスポート操作自体を監査ログに残す。

- 解約理由の任意収集: オフボーディング申請時に解約理由（選択式＋自由記述・任意）を収集し、チャーン分析（D-35の事業KPI）の入力とする。回答を解約の条件にしない。
## 11. データ境界とテーブル契約  ［REQ-SEC-11］

テナント階層と必須境界キー（`tenant_id` / `site_id`）で全データ・キャッシュ・キュー・ストレージ・ログを分離する（`REQ-PRODUCT-10`, `REQ-SEC-07`）。AIジョブは作成時に単一の `tenant_id`/`site_id`/`job_id` に固定し、実行中に `site_id` を変えない。画面で別サイトに切り替えても既存ジョブのサンドボックスは変わらない（別サイトは新ジョブ）。

正本テーブル群（要点）: URLマスター（`raw_url` / `canonical_url` / `canonical_url_hash` / `cms_content_ref` / `gsc_page_url` / `redirect_target_url` / `url_alias_type`）、キーワード正規化（`raw/normalized_keyword` / `keyword_group_id` / `intent` / `priority` / `target_url_hash`。全角半角・表記ゆれは同一寄せ、修飾語違いは別キーワード）、記事サマリー（title/meta/h1/h2_list/h3_summary/word_count/article_type/summary/content_hash/published_at/modified_at/last_synced_at）、GSC Data Mart（`gsc_site/page/query/page_query_metrics_daily`、`REQ-KGA-11`）、リライト判定サマリー（clicks/impressions/ctr/position の28d比較・cv_28d・keyword_match_score・cannibalization_score・rewrite_priority_score・rewrite_reason）、自動化系（recommendation_items / scheduled_actions / automation_policies / workflow_runs/steps / approval_requests / content_calendar_slots / publication_jobs / saved_views / recommendation_feedback / configuration_suggestions/change_requests）、プロバイダ系（llm_provider_profiles / secret_refs / routing_policies(+versions) / cost_budgets / health_checks / audit_logs）。WordPress固有post IDは初期Adapterのextensionとして保持し、共通URLマスターの識別子にしない。

保存禁止: 記事本文全文・HTML全文・Gutenbergブロック全文・サンプル記事本文全文・フォーム入力・個別ユーザー行動ログ・セッション/クリックログ・ヒートマップ・プロンプト全文・APIキー原文・secret復号値・provider raw response全文。一時本文は `tenant_id`/`site_id`/`job_id` 必須・短期・ジョブ完了後削除・管理画面から本文閲覧不可・監査ログはhashと処理結果のみ。

## 12. 決定論的Preflightと入力トークン制御  ［REQ-SEC-12］

新規/リライト/QA/Automationは実行前に決定論的Preflight Estimateを生成する（LLM provider cost・prompt cache write/read・DataForSEO・クローラ・WP draft/validation・QA/Repair loop回数・品質グレード・Autopilotリスク係数・粗利係数）。クレジット予約額はこの見積に基づく（`REQ-BILL`）。入力トークン膨張を制御し、予算超過の追加ループはユーザー承認またはAdmin Policyを要する。

## 13. Observability と契約検証  ［REQ-SEC-13］

workflow/ticket/pack/provider/model別のinput/output tokens、cache read/creation tokens、uncached input、retry/repair tokens、estimated vs actual差分、cache hit ratio・miss reason・TTL比率・breakpoint key・pack version hashを追跡する。契約検証: Ticket Schema / PackDispatch / Source Extract completeness / Output Snapshot schema / QA result / RepairInstruction schema / forbidden output detection / hallucinated source detection / token budget enforcement / cache prefix hygiene / site sandbox boundary / **shared-resource whitelist（ホワイトリスト外の共有参照・ジョブからの共有物書き込みの検出）** / **instruction-in-data detection（Source Extract・derived成果内の命令文混入の決定論スクリーニング、`REQ-AGENT-07`）** / Dynamic Post Schema compliance。ルール例: `claim_reason` はSite Authorityなしで断定しない、`ranking_or_priority` はFresh Web/SERPなしで作らない、CTAはWriting Ticketにしない、リライトは未指定H2を変えない、表崩れはtable QA fail、index_pending記事をSEO弱記事扱いにしない。ログに本文全文・競合本文全文・プロンプト全文を保存しない。

## 14. 認証拡張（SSO / 2FA）  ［REQ-SEC-14］

初期の認証はGoogleログイン（`REQ-PRODUCT-05`）のみとするが、認証層はOIDC/SAML等のIdP追加と2FAを後付けできる拡張点として設計する（認証プロバイダの抽象化・セッション/認可`REQ-SEC-08`から分離）。提供時はテナントポリシーで強制可否を制御し、プラン制御は設定レジストリ（`REQ-ADM-09`）。実装時期は商談・プラン駆動であり本要求は拡張点の確保を義務づける。

## 15. インバウンド保護（レート制限・アクセス防御）  ［REQ-SEC-15］

- レート制限: 公開API・画面API・Webhook受信・プラグイン用エンドポイントに、テナント/ユーザー/IP単位のレート制限を設ける（しきい値は`REQ-ADM-09`。超過は429と再試行案内、恒常超過は監査・通知）。
- 認証防御: ログイン・再認可試行の回数制限とバックオフ、異常ログイン検知（`REQ-ADM-07`）との接続。セッションはSEC-08の管理に従う。
- 通信・境界: 全経路TLS必須（HSTS）、管理コンソールは追加防御（IP許可リスト等）をオプションとして持てる。egress（WP・外部API）は許可先管理（`REQ-DUR-06`）。
- 目的外流量: 明らかなボット・スクレイピング流量の抑制は基盤側（リバースプロキシ層）の責務とし、アプリはfail-closeの原則（`REQ-SEC-01`）を維持する。

## 16. アカウントライフサイクルと回復  ［REQ-SEC-16］

- 招待: メンバー招待は期限付き・単回使用の署名トークンで行い、失効・再送・取消ができる（`REQ-PRODUCT-08`のRole付与はサーバー側）。
- アカウント回復: Googleログイン単独依存によるロックアウト（オーナーのGoogleアカウント喪失・停止）に備え、**オーナー回復手続き**を定義する——本人・組織確認（登録情報・支払い情報等による確認。手順は法務・CS運用で確定）→開発管理者の統制下でのオーナー移譲（ADM-S9・break-glass同等の承認・全操作監査・当事者双方へ通知）。自動化しない。
- セッション統制: ユーザー自身による全端末ログアウト（全セッション失効）と、Role変更・退会・回復時のサーバー側強制失効（`REQ-SEC-08`）。
- step-up再認証: 破壊的・高リスク操作（オーナー移譲・解約・Kill Switch・支払い変更・データ利用オプトアウト・事例掲載許諾の付与/撤回）は、直近認証からの経過に応じて再認証を要求する（しきい値は`REQ-ADM-09`）。
- 整合: 退会・削除は`REQ-SEC-10`のオフボーディングに従い、回復手続きの記録は監査ログが正本。
