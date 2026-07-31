---
document_id: AOS-L1-AGENT-RUNTIME
title: AI Office de SEO エージェントランタイム要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-05
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO エージェントランタイム要求 v3.7

## 分類別正本への移行

SEO業務Workflowは `categories/business-requirements_v1.md`、判定・状態遷移は `categories/logic-requirements_v1.md`、実行原価は `categories/cost-requirements_v1.md`、job・Executor境界は `categories/technical-architecture-requirements_v1.md` を現在の正本とする。本書の `REQ-AGENT-*` はAgent実行詳細として有効であり、分類別正本と重なる横断判断は移行先を優先する。

## 1. 基本思想  ［REQ-AGENT-01］

新規記事とリライトは、固定プロンプト一発生成ではなく、Research / Outlineを正本とするAgentic Workflowで実行する。

ただし、専門エージェントを大量に作らない。専門性は、Pack、Ticket Workflow、Source Extract、Schemaに寄せる。実行役は少数のExecutorにする。

Executor:

- Orchestrator
- Planning Executor
- Writing Executor
- QA Executor
- Repair Executor
- Automation Executor

Snapshotの受け取りと次工程判断はOrchestratorが担う。各ExecutorはSnapshotをTicketの`returnTo`（既定はOrchestrator）へ返し、Orchestratorが次ステージへの遷移・再ディスパッチ・保留・エスカレーションを決める。ループ停止ガード到達やハード失敗（LLMエラー・タイムアウト・スキーマ検証連続失敗）の場合も、未達理由付きSnapshotをOrchestratorへ返し、Orchestratorが対応する。失敗の既定は、部分成果を破棄せずSnapshotに残し、公開・確定へ進めず保留にすることとする。

LLMによる判定は、原則としてこのエージェントシステム内（Executor）に限定する。一般システム（ダッシュボード、リライト候補抽出、カバー率・カニバリ・Query Drift判定、集約、分散バッチ）はすべて機械（決定論的）判定で行い、LLMを使わない（`REQ-KGA-08`）。

## 2. ステージ  ［REQ-AGENT-02］

### Stage 1: Research & Outline

固定ワークフローで行う。

- Query Fanout
- SERP / PAA / AIO / News / YouTube / GSC / 競合上位5記事の取得
- Domain Positioning
- Keyword Map照合
- Article Type Structure選定
- Heading Structure選定
- Research Brief freeze
- Outline Contract freeze

### Stage 2: Meaning Unit Writing

H2/H3を直接作業単位にしない。H2/H3は箱であり、作業単位は意味ユニットである。

代表的な意味ユニット（全列挙・機能別グルーピングは`REQ-PACK-11.3`を正本とする）:

- problem_framing
- claim_reason
- misconception_break
- concrete_example
- comparison
- ranking_or_priority
- decision_criteria
- risk_warning
- first_hand_experience
- checklist
- table_block
- faq_answer
- section_bridge
- internal_link_context

OrchestratorがOutline Contractを見てWriting Ticketを発行する。

### Stage 3: QA Ticket Generation

組み上がったDraft Snapshotを検査し、問題をQA Ticketとして構造化する。

QA例:

- outline_compliance_qa
- keyword_coverage_qa
- keyword_stuffing_qa
- claim_authority_qa
- evidence_risk_qa
- cta_timing_qa
- table_block_qa
- wp_output_qa
- internal_link_qa
- article_type_consistency_qa
- query_drift_qa
- style_regulation_qa

CTAはWriting Ticketではない。CTAは読者状態、本文の流れ、CV導線、配置タイミングをQAし、必要ならAutomation Ticketまたは接続文Repair Ticketを発行する。

### Stage 4: Repair Loop

QAで落ちた箇所だけRepair Ticketを発行する。H2丸ごと、記事全文を再生成しない。Repair発生を前提に品質を作るのではなく、Research Brief、Outline Contract、Section Brief、入力検証の品質でRepair頻度を低くする。

Preflightは選択品質と固定価格内の限定Repair枠で生成可能かを事前判定し、成立しない見込みなら開始しない。1回の生成に対するユーザー価格は実際のRepair回数で変動させない。ユーザー希望の再生成は新しい有償ジョブとし、サービス障害による中断はcheckpointから無償再開する。

## 3. Prompt Cache First（Layer A/B/C/D）  ［REQ-AGENT-03］

Orchestratorが見るのはCatalogと対応キーであり、本文は保持しない。選択したキーは各サブエージェント側のPackキーインジェクターが解決し、更新頻度（TTL）とスコープの異なる層としてsystem promptへ強制注入する（`REQ-AGENT-07`、`REQ-PACK-14`）。固定（prefix）と自由（suffix）の境界がcache境界になる。工程・遷移で注入Catalogが変わるのは、この層構造による。

- Layer A（Global Runtime Prefix・最長TTL・全サイト共通＝グローバル/フロー）: 実行ポリシー、サンドボックス遵守ルール、tool schema、**Workflowの状態機械（遷移図）定義**、SoT入出力schema、基本NG（越境・本文恒久保存・未承認公開・競合丸写し・架空根拠）。tenant/site/job/URL/キーワード/本文/日時は含めない。
- Layer B（Site Policy Prefix・サイト単位）: Domain Positioning / Content Regulation、サイト別スタイル/CTA/内部リンク方針、Quality Gate Registryのサイト別構成。記事本文・HTML・GSC rawは含めない。
- Layer C（Research & Outline Prefix・ジョブ単位で固定）: Research Brief / Outline Contract / Section Briefs のfreeze、SERP抽象化、検索意図・差別化角度・カニバリ回避・CV導線。セクション生成・Repair・QAで繰り返し再利用する。
- Layer D（Task Dynamic Suffix・キャッシュしない・遷移/タスク動的）: 今回のセクションID / patch target、draft断片、QAで落ちたissues、GSC直近差分、承認/差し戻しコメント、`userPrompt`。

キャッシュ実装制約（プロバイダ公式仕様で検証済み。検証ログ参照）: プレフィックスキャッシュはtools→system→messages順の完全一致で、**ブレイクポイントは最大4個**＝Layer A/B/C/Dの4層に1個ずつ対応させる。TTLは既定5分／延長1時間（追加費用）で、読み取り時に無償リフレッシュされるため、Layer A/B（安定・共有）は1時間TTL、Layer C（ジョブ内で高頻度再利用）は5分TTLを既定とし、**1時間エントリは5分エントリよりプレフィックス前方に置く**（順序制約）。最小キャッシュ長（約1,024トークン）未満の層は結合を検討する。

**キャッシュは記憶ではない（メモリ階層の原則）**: Prompt CacheとTTL生キャッシュ（`REQ-SRC-06`/`REQ-SRC-08`）は費用・レイテンシ最適化であり、**状態・知識の保存に使わない**。TTL失効・キャッシュミスで結果の正しさが変わる設計を禁止する（失効時は同一入力から再構築可能であること）。記憶の階層は以下で固定する:

| 層 | 実体 | 寿命 | 根拠 |
|---|---|---|---|
| 揮発（費用最適化） | Prompt Cache Layer A〜D / 外部取得TTLキャッシュ | TTL | `REQ-AGENT-03` / `REQ-SRC-06` |
| ジョブ（実行状態） | Snapshot・checkpoint・一時本文（期限つき） | ジョブ完了/保留期限まで | `REQ-AGENT-09/10` |
| 恒久（テナント知識） | Derived Facts・施策台帳・記事サマリー・Style Color・few-shot | 鮮度期限・世代管理つき | `REQ-PRODUCT-19/20`, `REQ-PACK-12/16` |
| 横断（ネットワーク知識） | Global Signal Store（k匿名・提案のみ） | 版管理 | `REQ-PRODUCT-13` |キャッシュ境界は**明示ブレイクポイント（explicit cache_control）を正**とし、Layer A/B/C/Dの4点に固定して指定する。プロバイダによる明示点以前の自動プレフィックス照合（automatic caching）はbest-effortの補助として扱い、見積・原価前提・cache prefix hygiene検証（`REQ-SEC-13`）は明示4点にのみ依存する（自動ヒットを設計前提にしない）。キャッシュ書き込みはbest-effortでヒットは保証されないため、見積・予約はヒットを前提にしない（`REQ-BILL-06`のmiss上限予約と整合）。モデル切替・tool定義変更はキャッシュを無効化するため、ジョブ内でモデル・tool集合を固定する（`REQ-BILL-09`のジョブ開始時freezeと整合）。PackExtractのcanonical JSON化（`REQ-PACK-15`）はバイト安定性の要件である。TTL・実数はプロバイダ仕様に依存するため、値はCost Table・設定レジストリで管理する（`REQ-BILL-09`/`REQ-BILL-10`）。

freeze後の各工程は Layer A/B/C を cache prefix として再利用し、工程・遷移で変わる分だけ Layer D の suffix を差し替える。Repair Loop は QA issue と対象セクションだけを suffix に置き、Research/Outline prefix（C）を再利用する。Outline変更が必要な場合は Writing Loop 内で勝手に修正せず、Outline再設計フェーズへ差し戻す。工程の順序は Layer A の状態機械が強制し、ゲート（Intake / Quality Gate / Preview承認 / Cleanup）を飛ばさない。

## 4. Claude-first  ［REQ-AGENT-04］

品質段階の主モデルは低い段階から `GPT Luna`、`GPT tera`、`Sonnet`、`Opus` の順とし、工程別の補助モデル、fallback、調査量、検査回数、Repair回数はversion付きProvider Routingで設計・管理する。特定モデルを本文生成・Repair・構成判断へ固定しない。モデル名は一般ユーザー画面には出さず、品質段階、予測クレジット、残り本数として表示する。

## 5. データ取得（Source Pack経由・直テーブル禁止）  ［REQ-AGENT-05］

Executorは直テーブルにアクセスせず、必要データを Source Need として要求し、Source Pack が site_id スコープで解決した Source Extract を JSON で受け取る（`REQ-PACK-06`）。

- Executorが読むのはPack由来のJSONのみで、生SQL・生クエリ結果は渡さない。
- Packは `SiteSandboxContext` の `tenant_id` / `site_id` に閉じて解決し、別サイトを引けない（`REQ-SEC-07`）。
- Executorの成果はSnapshotとして返し、直テーブル書き込みはしない。

これにより、site_id分離とJSON入出力が、エージェントのデータ経路そのもの（Pack）で担保される。

## 6. Workflow定義  ［REQ-AGENT-06］

Workflowは、ステージ列・遷移・ループ・停止条件を持つ実行手順であり、`workflowKey`で参照し版固定する（`REQ-PACK-04`）。専用エージェントを増やさず、専門性はWorkflow・Pack・Schemaに寄せる。

将来の拡張アプリもこの原則を維持する。Officeに専門Agentが追加されても、実行時はApp Manifestが宣言したRole Profile、Workflow、Prompt／Source Pack、Schema、Tool Capabilityのキーを既存Ticketへ束ね、各ExecutorのPackキーインジェクターが解決する。画面上のAgent追加と実行基盤のプロセス追加を同義にせず、Pack差替えで成立する専門性のために専用runtimeを増やさない。

Workflowは権限スコープを持つ。許可ツール・アクション（外部取得、WP書き込み、投稿予約など）はWorkflowに定義し、そのWorkflow配下で実行される全Ticketに最小権限として適用する。Ticketは個別に権限を持たず、`workflowKey`で権限を継承する。権限はサブエージェントへ固定制約として注入される側であり、タスク固有の指示は`userPrompt`（自由入力）で与える（`REQ-AGENT-07`）。**強制ポイントはプロンプトではない**: system promptへの権限注入は表明（モデルへの教示）であり、実際の強制はツール実行層（サンドボックス内のtool dispatch）でWorkflow定義とサーバー側照合するdefault-denyで行う（`REQ-RWR-02`のTool Server限定と同型を全Workflowへ一般化）。モデルが未許可ツールを要求した場合は実行せず拒否し、監査ログに残す（`REQ-SEC-07`と同じfail-close）。

主要Workflow（列挙）:

- `workflow.new_article.v1`: Research & Outline → Meaning Unit Writing → QA → Repair Loop → Assembly
- `workflow.rewrite.v1`: GSC Query Drift/Cause Analysis → 対象Meaning Unit特定 → Repair Writing → QA → Repair Loop → Assembly
- `workflow.automation.v1`: WP下書き・投稿形式チェック・予約・公開/CVイベント

ループ（反復）を一級の構文として持つ:

- Workflowは特定ステージ（例: QA → Repair → 再QA）を反復できる。反復単位は意味ユニット等の落ちた箇所に限定し、H2丸ごと・記事全文の再生成はしない。
- 各ループは収束条件（QA全通過等）と停止ガード（最大ループ回数・最大トークン・最大クレジット・タイムアウト）を必須にする。いずれか到達で停止し、Snapshotに未達理由を残す。
- ループ回数・消費トークン・クレジットは事前見積・観測（`REQ-SEC-02`, `REQ-SEC-04`）で追跡する。

各ステージが使うPack/Source/Schemaは、Workflow×Packバインディング（`REQ-PACK-08`）で固定する。Pack/Catalogの引き当てはフロー・スコープ（`flow_pack_keys`＝フロー単位のパック）／フェーズ・スコープ（`REQ-PACK-08`）／遷移スコープ（遷移駆動の選択）の3層で分ける（`REQ-PACK-14`）。同じフェーズでも到達した遷移で引くCatalogが変わりうる。

上記の列挙とステージ遷移は例示である。具体的なステージ遷移・ループ経路（検証から実行へ戻すか調査へ戻すか等）は、各Workflowの個別設定として定義・登録する。L1で固定するのは、Workflowが表現できる文法（ステージ列・遷移・ループ・停止条件）と、すべてのループに収束条件・停止ガードを必須とする不変条件のみであり、特定トポロジは要求として固定しない。

## 7. Packキーインジェクター（サブエージェント側・強制注入・固定/自由分離）  ［REQ-AGENT-07］

注入機構は、中央ではなく各サブエージェント（Executor）側に置く（Packキーインジェクター。旧称 System Prompt Router）。Orchestratorが見るのはCatalogと対応キーだけで、本文・定義は持たない。

- Orchestratorが Catalog から選択したキー（`promptPackKeys` / `workflowKey` / `catalog.*` / `schemaKeys`）を、サブエージェント側インジェクターが解決し、Pack・Workflow・Catalog由来の**固定制約をサブエージェントの system prompt として強制注入する**。サブエージェントはこれを上書き・無視できない。
- 引き当てるPack/Catalogは、現在のフロー状態（flow / phase / last_transition）から「フロー・スコープ（常時）＋現フェーズ＋現遷移」の和集合として解決する（`REQ-PACK-14`）。狭いスコープ（遷移＞フェーズ＞フロー）が上位の既定を差し替え・追加する。
- Workflowも同方式で、`workflowKey` を解決して system prompt へ強制注入する（ステージ・遷移・ループ・停止条件を含む。`REQ-AGENT-06`）。
- **固定（system prompt）と自由（user prompt）を分離する**。Packやワークフローを引いて user prompt に差し込むのではなく、Ticketがキーとして書いたPack/Workflow/Catalogは system prompt に入り、タスク固有の可変入力（`userPrompt`）だけが user prompt に入る。
- **固定＋自由の同居**: 規制・サンドボックス・Workflow・Packなどの固定制約は system prompt で強制され、user prompt の自由入力はこれを上書きできない（`REQ-PACK-02` User Order の soft/normal/strong、`REQ-PRODUCT-07`、サンドボックス `REQ-SEC-01` と整合する構造的保証）。
- **外部コンテンツは指示ではなくデータ**: 取得した外部・第三者コンテンツ（SERP / 競合 / PAA / AIO / News / YouTube 等）は、`content_role`（requirement=要件 / reference=参考）に論理分離して置く。要件は満たすべき制約、参考は背景として扱い、いずれも指示位置には置かない。固定制約（system prompt）を外部コンテンツから生成しない。これは論理分離であり、エージェントの動的なインジェクション検知に依存しない。**二次注入（ロンダリング）対策**: 外部コンテンツからLLMが導出した成果（Research Brief / Outline Contract / 競合抽象構造等）も `content_role=derived` として常にデータ扱いとし、後段工程で指示位置に置かない。導出成果はスキーマ検証に加え、命令文混入の決定論スクリーニング（instruction-in-data detection、`REQ-SEC-13`）を通してから注入する。要約・抽象化を経由しても「外部由来は指示にならない」原則を破らせない。
- **権限はWorkflow由来・指示はuserPrompt**: 許可ツール・アクションの権限はWorkflowから固定制約として注入され（`REQ-AGENT-06`）、タスク固有の指示は`userPrompt`（自由入力）で与える。権限と指示を、固定側と自由側に分ける。
- サイト方針データ（Domain Positioning / Content Regulation / User Order）は、Source Packで `site_id` 取得したJSONを注入内容に用いる（取得→注入。`REQ-PACK-02`, `REQ-PACK-06`）。
- `userPrompt` はcache境界の後方に置く（`REQ-AGENT-03`）。Source Extractは、凍結済み契約（Research Brief / Outline Contract等）はPrefix側、揮発的データはcache境界後方に置く。
- インジェクターは、解決したキー・version・注入順を固定し、観測ログに `prompt_pack_keys` 等として残す（`REQ-SEC-02`）。キー未解決・version不一致はエラーとし、本文を勝手に補完しない。

## 8. 品質評価基準（Google公式ベース）  ［REQ-AGENT-08］

品質評価（QA・Quality Gate）は、以下のGoogle公式2文書の枠組みをベースに組み立てる。人間評価者ガイドラインは直接のランキング要因ではなく「Googleが目指す品質」の説明であるため、機械判定可能な代理指標へ落として運用する。

- Google 検索ランキング システム/ベストプラクティス: https://developers.google.com/search/docs/appearance/ranking-systems-guide?hl=ja
- Google 検索品質評価ガイドライン: https://static.googleusercontent.com/media/guidelines.raterhub.com/ja//searchqualityevaluatorguidelines.pdf

評価軸（QAゲートへマップ）:

- E-E-A-T（Trust中心）: 責任主体・著者の明示と正直さ（架空の著者や偽の経歴・資格を作らない）、独立情報源での評判整合、専門家コンセンサスとの整合、信頼シグナル。Trustが最重要で、信頼できないものは他がどれだけ専門的でも低評価とする。
- 有益な目的＋MC品質: 人のために作られた有益な目的を持ち、労力・独自性・才能/技能・付加価値を備える。既存ページに対する独自の角度や一次的経験を要するトピックではそれを示す。
- Needs Met（検索意図充足）: 検索意図（Know/Do/Website/Visit-in-person）を満たし、具体性と（必要な場合）鮮度を確保する。
- YMYL分類: 健康・安全／金融／行政・社会／その他を分類し、YMYLはより高い正確性・専門家コンセンサス基準を課す。
- Lowest回避: 有害（自他・特定集団・有害な誤情報）、欺瞞/信頼不能（目的・設計・著者情報の偽装、MCの妨害）、スパム（無付加価値のコピー/言い換え、スケール量産＝scaled content abuse、ハック、期限切れドメイン濫用、サイト評判濫用、キーワード詰め込み）に該当する生成物を出さない。

ゲート強度（`REQ-AGENT-02` のQAで適用）:

- hard gate（自動公開を止め、保留・人手判断へ）: Lowest該当（有害・欺瞞・スパム）およびYMYLトピックでの重大不合格。ゲート判定自体は無効化・合格化しない。同一権限者が警告・未解消項目・責任境界を二段階確認し、版付き同意書へ同意した場合だけ、例外記録を伴う手動公開を許可する。異なる2名の承認は必須としない。最終公開判断はユーザーに帰属する（`REQ-PRODUCT-09`）。
- advisory（警告・改善提案）: 上記以外の品質不足。Repairループの入力とする。

これらはQuality Gate Registry（`catalog.quality_gate.*`）としてゲート化し、QA Executorが適用する。具体ゲートと機械判定シグナルは`REQ-PACK-09`に定義する。品質の最終的な判断でLLMを用いる部分はエージェントシステム内に限り、一般システムの判定は機械（決定論的）で行う（`REQ-KGA-08`）。ゲートしきい値・YMYL分類は初期値であり、要調整。

## 9. 工程と状態機械（遷移図）  ［REQ-AGENT-09］

Workflowの工程順序と遷移は状態機械として定義し、Layer A（`REQ-AGENT-03`）に格納する。Orchestratorが順序を強制し、サブエージェントは順序を勝手に変えない（`REQ-AGENT-06`）。（正本: 旧 newgen-agent-workflow の New Article Workflow を v3.7 へ移植）

`new_article_workflow` の状態は全13（実務工程9＋強制ゲート4）である。ゲートは Intake Gate / Quality Gate / Preview・Approval / Cleanup の4状態を指し（`REQ-AGENT-03`）、他文書で「9工程」と呼ぶ場合はゲートを除いた実務工程を指す。

`new_article_workflow` の工程（状態）:

1. Intake Gate（受理・前提チェック）
2. Sandbox Fix（`tenant_id`/`site_id` 固定）
3. Keyword Intent（GSC/CVから検索意図・狙いを確定）
4. SERP-TTPS Research（SERP/競合の抽象化取得）
5. Site Strategy（指定文体・任意のSite言い回し学習・CTA・内部リンク方針の適用）
6. Outline Architect（Outline Contract 生成・freeze）
7. Section Brief（各セクションのブリーフ生成）
8. Draft Writer（意味ユニット執筆）
9. Self Evolution（自己改善）
10. Quality Gate（品質検査・fail-close）
11. WP Draft（下書き・Automation policy）
12. Preview / Approval（人手承認）
13. Cleanup（後処理・完了判定）

遷移の強制ルール（ゲート）:

- 補足（順序の明確化）: `SiteSandboxContext` はジョブ**作成時**に確立される（`REQ-PRODUCT-02`）。状態2「Sandbox Fix」は確立済み境界の検証・封印（以後変更不可の確定）を指し、状態1のIntake Gateにおけるアサイン台帳プレチェックは、確立済みのsiteスコープ内で行う。
- Intake Gate を通るまでSERP取得・生成を開始しない。
- Intake Gate はキーワードアサイン台帳の決定論プレチェック（`REQ-KGA-14`）を含み、アサイン競合はLLM実行・クレジット消費前に警告する。
- Sandbox Fix 後に `tenant_id`/`site_id` を変更しない。
- Keyword Intent と SERP-TTPS Research の成果がないままOutlineへ進まない。
- Outline Contract がないまま本文生成しない。Section Briefs がないまま本文生成しない。
- Quality Gate を通らない記事をWP下書きに送らない（fail-close）。
- Preview または Automation承認なしに予約投稿しない。
- 最初の15記事は完成記事への人間承認を必須とする。WordPress実表示Previewは確認手段であり、URLを開いた事実自体を条件にしない。Outline確認はSite設定で任意に有効化し、有効時は見出しを修正・freezeしてから再開する。
- リライト・全文再生成はAutomation承認だけで公開記事へ直接反映せず、WP下書きとユーザー承認を必須とする。
- Cleanup が完了しないジョブを完了扱いにしない。

工程ごとに引くPack/CatalogはLayer A/B/C/D（`REQ-AGENT-03`）と3スコープ（`REQ-PACK-14`）に従う。`rewrite_patch`（`rewrite` workflow）は別の状態機械として定義する（原因分析→対象特定→patch→QA→Repair Loop）。具体トポロジは各Workflowの個別設定（`REQ-AGENT-06`）で、`new_article_fast/standard/premium/custom_recipe` 等のモード差は工程の深度・モデル配分の違いとして表す（`custom_recipe` はユーザー自己サーブの定義機能ではなく、コンサルティング経由で開発管理者が登録する運用経路。`REQ-PRODUCT-12`）。

## 10. ジョブの中断・再開（checkpoint再開）  ［REQ-AGENT-10］

生成・リライトジョブは、保留系状態を統一的に扱い、checkpointから再開できる。

- 保留系状態の統合: ユーザー手動の一時停止（本項で新設）、Kill Switch（`REQ-DUR-04`）、予算超過待ち（`REQ-SEC-12`）、hard gate保留（`REQ-AGENT-08`）、承認待ち（`REQ-WPA-04`）を、状態機械（`REQ-AGENT-09`）上の保留系状態として統一的に管理する。手動停止・再開の操作権限は生成実行権限（`REQ-PRODUCT-08`のEditor以上）に準ずる。
- checkpoint＝ステージ境界・Snapshot粒度: freeze済み成果（Research Brief / Outline Contract / 完了済み意味ユニットSnapshot / QA結果）は保存済みのため、再開は最後に完了したステージの直後から行う。**完了済みステージを再実行・再課金しない。**
- 再開時の不変条件: ジョブ開始時にfreezeしたWorkflow / Pack / Catalog / Config version（`REQ-PACK-04`）とSiteSandboxContextを維持したまま再開する。中断中にPack等が改版されても旧versionで再開し再現性を保つ。新versionを使いたい場合は新ジョブとする。
- クレジット: 中断時に消費済み分をcommitし、未実行分のreserveは解放または保持（保持TTLは設定、`REQ-ADM-09`）。再開時は残ステージ分を再Preflight（`REQ-SEC-12`）して再予約する。
- 実行の冪等性（二重課金防止）: Orchestratorのクラッシュ・再起動を含む再実行は安全でなければならない。Ticket発行はat-least-once配信＋`ticket_id`冪等キーとし、同一TicketのSnapshot取り込みはdedupeする（後着は破棄・監査記録）。ステージ再実行時、記録済みSnapshotがあるTicketはLLM再呼び出しせず結果を再利用する。クレジットのreserve/commitは`ticket_id`単位で冪等とし（Stripe側の`idempotency_key`と同型、`REQ-BILL-07`）、Orchestrator障害でLLM費用・クレジットが二重計上されないことを負のテストで検証する。
- キャッシュ再ウォーム費の明示: Prompt CacheはTTL（既定5分／延長1時間。検証ログ参照）で失効するため、TTL超過後の再開ではLayer B/C prefixの再書き込み費が発生する。**再開Preflightは再ウォーム費を見積に含めて提示する**（`REQ-AGENT-03`, `REQ-BILL-06`）。
- 一時本文との関係: 中断中の一時本文・ワークスペース（`REQ-PRODUCT-04`, `REQ-RWR-02`）は保留期限内に限りTTLを延長して保持できる（上限は設定）。期限超過で破棄した場合、再開時は保存済みSnapshot・契約から該当ステージを再実行する。本文非保持の原則は変えない。
- 保留期限: 中断ジョブの最大保留期間（設定・初期値要調整）を持ち、超過時は自動キャンセル（reserve解放・部分成果はSnapshotとして保持）とし、通知する（`REQ-PRODUCT-11`）。

## 11. 全体整合パス（記事コヒーレンス）  ［REQ-AGENT-11］

意味ユニット単位の並列執筆＋限定Repair（`REQ-AGENT-02` / `REQ-PACK-18`）は、ユニット間の繋ぎ目で論旨・声・用語が痩せる構造リスクを持つ。同一生成ジョブ内のRepairで全文再生成しない原則は維持したまま、記事全体のまとまりを工程として担保する。ユーザーが別途選ぶ有償の全文再生成ジョブはこの禁止と区別する。

- 用語ロック（Term Lock・決定論）: Outline Contract凍結時に、記事内で用いる用語・表記の固定リスト（例: サーバー/サーバ、ですます調の統一、固有名詞の表記）を確定し、任意フィールド `terminology_lock[]` としてContractに封入する（Gate A-5の任意追加=minor規則内）。全Writing/Repair Ticketへ固定制約として注入し（`REQ-AGENT-07`）、逸脱は決定論検査（`term_consistency`）で検出する。
- 隣接文脈つきSection Brief: 各Section Brief（`REQ-AGENT-09`状態7）は、前ユニットの結び要旨・次ユニットのブリーフ要約を含めて発行し、ユニットが孤立文脈で書かれることを防ぐ（Layer Dのタスク動的入力。`REQ-AGENT-03`）。
- Cohesion QA（組立後の全体読み通し検査）: Assembly後、記事全体を1パスで検査するQAを必須とする。これは**既存QA工程（状態機械の既存状態）の内部パス**であり、13状態（`REQ-AGENT-09` / `REQ-PACK-11.6`で凍結）に新しい状態を追加しない（LLM判定はエージェント内=`REQ-KGA-08`。Layer C prefixを再利用し追加原価を抑える）。検査対象＝論旨の流れ・重複主張・トーン/声の揺れ・導入と結論の整合・ユニット間の事実不整合（数値・件数・主張の食い違い）。決定論指標として `inter_unit_redundancy`（ユニット間n-gram冗長度）・`term_consistency` を併用する（`REQ-PACK-10`と同じく初期値・要調整）。
- ゲート化: `catalog.quality_gate.coherence_flow`（advisory）として登録し（`REQ-PACK-09`）、不合格は接続部（`section_bridge`）・重複ユニットの限定Repairへ回す。H2丸ごと・全文の再生成はしない（原則不変）。収束しない場合は停止ガード（`REQ-AGENT-06`）に従い未達理由つきSnapshotで保留する。
- 計測: coherence指標はQA Snapshot（`schema.snapshot.qa.v1`）のmetricsに含め、DU-10縦切りの必須計測（`REQ-DUR-02`）と較正（`REQ-ADM-10`のゴールデン評価）の入力にする。
