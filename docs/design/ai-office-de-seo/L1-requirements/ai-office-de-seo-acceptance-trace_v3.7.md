---
document_id: AOS-L1-ACCEPTANCE-TRACE
title: AI Office de SEO 受入条件 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 受入条件 v3.7

## 0. 本書の使い方とトレース規約

既存v3.7受入条件は `AC-{領域}-{番号}`、分類別L1正本の受入条件は `AC-L1-{領域}-{番号}` の安定IDを持つ。`検証` 欄は、当該ACが検証する要求のセクションID `REQ-{ドメイン}-{番号}` を指す。REQ-IDは各要求docのセクション見出しに付記されている。下流（L3要件・L8〜L14テスト設計）は、AC-IDとREQ-IDを安定キーとして双方向に辿る。世代の異なるACへ同一IDを割り当てない。

補: `REQ-PACK-11` は `REQ-PACK-11.1`〜`REQ-PACK-11.7` のドット付きサブセクションIDを持つ（ID文法の登録済み例外）。監査・照合ツールはドット付きサブIDを解析対象に含めること（v3.7.23の教訓と同型の解析漏れを防ぐ）。

### 0.1 予約欠番・再利用禁止

次のIDは過去版との衝突を避けるため予約欠番とする。由来の確定や廃止台帳への移管が完了するまでは、新しい受入条件へ割り当ててはならない。

- `AC-SEC-08`〜`AC-SEC-10`
- `AC-WPA-01`〜`AC-WPA-07`
- `AC-AOUI-05`、`AC-AOUI-06`

## Product

- [ ] AC-PRODUCT-01: 正式サービス名がAI Office de SEOで統一されている。 ｜ 検証: REQ-PRODUCT-01
- [ ] AC-PRODUCT-02: ユーザー向け第一階層は、ダッシュボード、キーワード管理、コンテンツ作成、オートメーション、サイトページ管理、ナレッジ管理、設定である。S5へKeyword市場分析を重複配置せず、S6を学習結果だけの閲覧面に限定しない。 ｜ 検証: REQ-NAV-01, REQ-NAV-04
- [ ] AC-PRODUCT-03: ユーザー画面に内部実装用語が第一階層として表示されない。 ｜ 検証: REQ-NAV-01

## Data Boundary

- [ ] AC-DATA-01: 記事本文全文が恒久保存されない。 ｜ 検証: REQ-PRODUCT-04, REQ-SEC-01
- [ ] AC-DATA-02: 競合本文全文が恒久保存されない。 ｜ 検証: REQ-SRC-03, REQ-SEC-01
- [ ] AC-DATA-03: 一時本文はTTLで削除される。 ｜ 検証: REQ-PRODUCT-04
- [ ] AC-DATA-04: URLはcanonical_url_hashをマスターキーとして扱う。 ｜ 検証: REQ-PRODUCT-03
- [ ] AC-DATA-05: 照会はURL、内部管理は安定IDで行い、同一対象への重複ジョブ・重複レコードはハードロックではなくアラートで検出される。 ｜ 検証: REQ-PRODUCT-03

## Sandbox

- [ ] AC-SANDBOX-01: AIジョブはtenant_id/site_id/job_idに固定される。 ｜ 検証: REQ-PRODUCT-02, REQ-SEC-01
- [ ] AC-SANDBOX-02: AIツールは任意site_idを受け取らない。 ｜ 検証: REQ-PRODUCT-02, REQ-SEC-01
- [ ] AC-SANDBOX-03: 別サイトのGSCデータを参照できない。 ｜ 検証: REQ-SEC-01
- [ ] AC-SANDBOX-04: 別サイトのCMS下書きへ送れず、初期WordPress Adapterでも別Siteのpostへ到達できない。 ｜ 検証: REQ-SEC-01

## Tenant / Account

- [ ] AC-TENANT-01: テナント分離が共有DB上の`tenant_id`/`site_id`によるID型論理分離であり、テナント別物理DB・スキーマ分離ではない。 ｜ 検証: REQ-PRODUCT-10, REQ-SEC-07
- [ ] AC-TENANT-02: 全データアクセスが単一の強制ポイントを通り、スコープ未指定・越境クエリはdefault-denyでfail-closeする。 ｜ 検証: REQ-SEC-07
- [ ] AC-TENANT-03: テナント横断のJOIN・集計が既定で禁止され、越境試行が監査ログに残る。明示認可例外は2経路のみ——①k匿名集約パイプライン（専用ロール・到達不能・k匿名出力限定）②同意ベース事例転用（許諾範囲のみ・スナップショット・撤回で停止/削除）——で、いずれも監査される。 ｜ 検証: REQ-SEC-07, REQ-SEC-10, REQ-PRODUCT-13, REQ-PRODUCT-23
- [ ] AC-TENANT-04: テナント由来データを含むキャッシュ（Layer B/C・GSC/記事/方針系）のキーに`tenant_id`/`site_id`が含まれテナント間で漏洩せず、共有可なのはテナントデータを含まない公共キーワード資産・公共外部観測とLayer Aのみで、その非含有がprovenance契約とcache prefix hygieneで保証される。 ｜ 検証: REQ-SEC-07, REQ-SEC-13, REQ-PRODUCT-13
- [ ] AC-TENANT-05: 1テナントに複数ユーザー、1ユーザーが複数テナントに所属でき、Membership・Roleが別テナントへ波及しない。 ｜ 検証: REQ-PRODUCT-01, REQ-SEC-08
- [ ] AC-TENANT-06: 1ユーザーが複数のGoogle/GSCアカウント・複数WP接続を持て、各Connected AccountとトークンがTenantに属しテナント境界を越えない。 ｜ 検証: REQ-PRODUCT-01, REQ-PRODUCT-05, REQ-SEC-09
- [ ] AC-TENANT-07: Source Packはsite_id（/tenant_id）スコープで解決し、別サイト・別テナントのデータを引けない。 ｜ 検証: REQ-PACK-06, REQ-SEC-07

## Security

- [ ] AC-SEC-01: 認可がサーバー側で最小権限で強制され、クライアント申告のRole/テナントを信頼しない。 ｜ 検証: REQ-SEC-01, REQ-SEC-08
- [ ] AC-SEC-02: セッション/トークンがUser・アクティブTenant・Roleに束縛され、テナント切替後に再度権限判定される。 ｜ 検証: REQ-SEC-08
- [ ] AC-SEC-03: シークレットが暗号化・鍵管理・ローテーション前提で保存され、平文再表示されない。 ｜ 検証: REQ-SEC-09
- [ ] AC-SEC-04: OAuthトークンがConnected Account単位・Tenant単位でスコープされ、失効・切断・再認可に対応する。 ｜ 検証: REQ-SEC-09
- [ ] AC-SEC-05: Webhook（Stripe/WP等）が署名検証され、通信がTLSで保護される。 ｜ 検証: REQ-SEC-01
- [ ] AC-SEC-06: 監査ログがappend-onlyで、境界違反試行・シークレットアクセス・Role変更・Flag/Kill Switch操作・課金操作・full_auto有効化を記録する。 ｜ 検証: REQ-SEC-10, REQ-SEC-08
- [ ] AC-SEC-07: テナント削除・退会が`tenant_id`スコープで実行でき、データエクスポートも同スコープで提供され、操作が監査ログに残り、解約理由の任意収集が回答を条件にせず記録される。 ｜ 検証: REQ-SEC-10

## Keyword / GSC / Article

- [ ] AC-KGA-01: キーワード、GSCクエリ、記事URLが接続される。 ｜ 検証: REQ-KGA-01
- [ ] AC-KGA-02: 表記ゆれは文字列だけで確定せず、SERPs集約で判定される。 ｜ 検証: REQ-KGA-02
- [ ] AC-KGA-03: 登録キーワードカバー率とクリック加重カバー率を算出できる。 ｜ 検証: REQ-KGA-05
- [ ] AC-KGA-04: Query Driftを分類できる。 ｜ 検証: REQ-KGA-06
- [ ] AC-KGA-05: カニバリを「被覆率重複>50% かつ 流入分散30%以上」で機械判定し、生成/リライトが対象記事をこのしきい値へ押し込まない制約になっている。 ｜ 検証: REQ-KGA-07
- [ ] AC-KGA-06: GSC/CV日次実績が判定正本として日次粒度で保持され（初期16か月・要調整）、1週間保持は日次より細かいリアルタイム系に限定され、月/年集約は日次正本から導出され、リライト判定は直近3か月（微妙な場合6か月）で行われる。 ｜ 検証: REQ-KGA-08
- [ ] AC-KGA-07: LLM判定はエージェントシステム内のExecutorに限定され、一般システム（候補抽出・カバー率・カニバリ・Query Drift・集約・バッチ）は機械判定で行う。 ｜ 検証: REQ-KGA-08, REQ-AGENT-01
- [ ] AC-KGA-08: 内部リンクが、オーファン禁止・記述的アンカー・クロール可能・文脈内関連先というGoogle公式方針に沿い、Keyword/Article Map・GSCから機械的に候補選定される。 ｜ 検証: REQ-KGA-09
- [ ] AC-KGA-09: 内部リンクのアンカーが過剰最適化されず、1記事の主アンカーテーマ固定でカニバリを抑制し、internal_link_qa・WPスロットへ接続される。 ｜ 検証: REQ-KGA-09, REQ-PACK-09, REQ-WPA-02
- [ ] AC-KGA-10: トピックのグルーピングが、網羅・キーワード配分・内部リンク候補の内部管理に用いられ、ランキング機構として主張されず、ピラー/オーソリティ等の業界用語をユーザーUIに出さない。 ｜ 検証: REQ-KGA-10, REQ-KGA-07
- [ ] AC-KGA-11: GSC取り込みが増分日次・次元スコープ・優先度で設計され、全次元総当たり/全期間一括取得をしない。 ｜ 検証: REQ-KGA-11
- [ ] AC-KGA-11B: GSC速報値と確定値が分離され、速報値だけで施策評価・学習・月次配分を確定せず、確定値への置換後に再判定される。大規模SiteのBulk Exportは事前集約され、生テーブルを画面から都度走査しない。 ｜ 検証: REQ-KGA-11
- [ ] AC-KGA-12: 匿名化クエリ（クエリ行合計＜総合計）と上位5万/日の切り捨てを織り込み、欠損を「流入ゼロ」と誤判定せず明示する。 ｜ 検証: REQ-KGA-11, REQ-KGA-05, REQ-KGA-06
- [ ] AC-KGA-13: 大規模サイト向けにBigQuery Bulk Exportまたはサブプロパティ分割のスケール手段を持ち、クォータ内で夜間バッチ取得する。 ｜ 検証: REQ-KGA-11, REQ-SEC-06
- [ ] AC-KGA-17: キーワード属性（intent型・ターゲット適合・業界適合・YMYL近接）が辞書・SERP構成・GSC共起から決定論的に付与され（LLM不使用・追加外部取得なし）、ターゲット/リテラシー/業界フィルターとターゲット軸×intentギャップマトリクスが機能し、辞書はCatalogとして版固定・管理画面編集される。 ｜ 検証: REQ-KGA-13, REQ-KGA-08, REQ-NAV-04, REQ-ADM-10
- [ ] AC-KGA-18: キーワードグループ⇔記事のアサイン台帳が1グループ＝主担当高々1で状態管理され、オーファン・二重アサインがアラート検出され、Intake Gateの決定論プレチェックがLLM実行・クレジット消費前にアサイン競合を警告する。 ｜ 検証: REQ-KGA-14, REQ-AGENT-09, REQ-PRODUCT-03
- [ ] AC-KGA-19: GSCクエリ⇔キーワードグループのマッチが決定論カスケード（exact / synonym / containment / co-landing / 予算限定serp-verified / unmatched明示）で行われ、各マッチにmethod・confidenceが記録され、クリック加重マッチ率KPIが匿名化の構造的上限を別掲して監視され、co-landing由来のエイリアスが辞書へ還流し、低信頼マッチのみで重大判定を確定しない。 ｜ 検証: REQ-KGA-15, REQ-KGA-08, REQ-KGA-11
- [ ] AC-KGA-20: ロングテールが単クエリのクリックしきい値ではなくクラスタ集計値で昇格判定され、親グループありは既存記事のセクション/FAQ候補（modifier拡張）へ、親なしはバックログ・ギャップマトリクスへ還流し、定常裾の定期評価枠を持ち、匿名化未満の不可視裾にはPAA/オートコンプリート/Fanoutを代理候補源とし、昇格をキーワード詰め込みの根拠にしない。 ｜ 検証: REQ-KGA-16, REQ-KGA-14, REQ-KGA-11
- [ ] AC-KGA-22: トピック起点がkeyword/news_trend/video_demandの3類型で管理され、news/YouTube観測が既存プロバイダ予算・availability配下で取得され、起点タグ付きでバックログへ還流し、Research & Outlineの記事タイプ決定にSERP面構成とnews/youtube Packが配線され（news→news_column＋freshness_honesty必須、video→video_reference推奨）、鮮度highジョブのレーン既定がinteractiveになり、scheduled選択時に鮮度注意が表示される。起点候補からの採用はユーザー選択であり、作成フローに起点選択UIがある。 ｜ 検証: REQ-KGA-18, REQ-PACK-08, REQ-BILL-11
- [ ] AC-KGA-21: キーワード価値スコアがdemand・realizable_ctr（自サイト順位別期待CTR基線への実測残差。AIO観測群の系統的負残差でのみ割引し固定低下率を仮定せず、観測不可時はunknownで捏造しない）・SERP構成・intent/CV近接・適合乗数から決定論で算出され、ギャップ/新規候補/リライト優先度/昇格判定へ接続し、順位保証でない旨が明示される。GSCがAI由来をクエリ単位で分離しない前提でAIO判定フラグはSERP観測由来とし、Generative AIレポート（impressionsのみ）は被引用観測の補助としてavailability付きで扱う。 ｜ 検証: REQ-KGA-17, REQ-KGA-08, REQ-WPA-05, REQ-KGA-11
- [ ] AC-KGA-23: キーワード市場の影響がAIO圧力（ゼロクリックと引用機会を分離）・リスティング広告占有・トピック単位のドメイン信用適合の3軸で観測され、未知値を0扱いせず、需要・実現可能CTR・SERP面・CV近接と分解表示される。 ｜ 検証: REQ-KGA-17, REQ-KGA-08
- [ ] AC-KGA-24: キーワードがサイト基盤としての必要性・流入機会・CV機会の3目的を持ち、foundation/growth/conversion/authority/balancedの戦略配分と現在データから動的優先度が増分再計算され、内訳付きで記事制作・リライトrecommendationへ供給される。 ｜ 検証: REQ-KGA-23, REQ-PRODUCT-24, REQ-SEC-06
- [ ] AC-KGA-25: 地域指定ごとにLocal Pack・地図・オーガニック順位を分離して観測し、地域ページ生成では実在する地域固有情報を必須とし、NAP・構造化データの不整合を自動修復せずユーザー確認事項として提示できる。 ｜ 検証: REQ-KGA-22

## Agent Runtime

- [ ] AC-AGENT-01: Research BriefとOutline Contractをfreezeできる。 ｜ 検証: REQ-AGENT-02
- [ ] AC-AGENT-02: H2/H3ではなくMeaning Unit単位でWriting Ticketを発行できる。 ｜ 検証: REQ-AGENT-02
- [ ] AC-AGENT-03: CTAはWriting TicketではなくQA/Automationの対象である。 ｜ 検証: REQ-AGENT-02, REQ-PACK-03
- [ ] AC-AGENT-04: QAで落ちた箇所だけRepair Ticketを発行できる。 ｜ 検証: REQ-AGENT-02
- [ ] AC-AGENT-05: Workflowが列挙・版固定され、ステージ・遷移・停止条件を持つ。 ｜ 検証: REQ-AGENT-06, REQ-PACK-04
- [ ] AC-AGENT-06: Workflowが特定ステージをループでき、収束条件と停止ガード（最大ループ・トークン・クレジット・タイムアウト）で停止する。 ｜ 検証: REQ-AGENT-06
- [ ] AC-AGENT-07: サブエージェント側のPackキーインジェクターが、Orchestrator選択キー（Pack/Workflow/Catalog）を固定制約としてsystem promptへ強制注入し、サブエージェントが上書き・無視できない。 ｜ 検証: REQ-AGENT-07, REQ-PACK-01
- [ ] AC-AGENT-08: Ticketが書いたPack/Workflowはsystem prompt、userPromptはuser promptに分離され、自由入力が固定制約（規制・サンドボックス・Workflow）を上書きできない。 ｜ 検証: REQ-AGENT-07, REQ-PRODUCT-07, REQ-SEC-01
- [ ] AC-AGENT-09: 外部・取得コンテンツが指示ではなくデータとして扱われ、content_role（requirement/reference）に論理分離され、固定制約が外部コンテンツから生成されない。 ｜ 検証: REQ-AGENT-07, REQ-PACK-01
- [ ] AC-AGENT-10: 許可ツール・アクション権限がWorkflowに定義され配下Ticketへ最小権限で適用され、タスク固有の指示はuserPromptで与えられる。 ｜ 検証: REQ-AGENT-06, REQ-AGENT-07
- [ ] AC-AGENT-11: TicketがSnapshotのreturnToを指定し、SnapshotはOrchestratorへ返り、次工程・失敗時の遷移（保留・エスカレーション）をOrchestratorが決める。 ｜ 検証: REQ-PACK-01, REQ-AGENT-01
- [ ] AC-AGENT-12: 注入がPrompt Cache Layer A(グローバル/フロー・状態機械=遷移図)/B(サイト方針)/C(工程=Research&Outline freeze)/D(遷移・タスク動的)の層構造で行われ、工程・遷移で引くCatalogが変わる。 ｜ 検証: REQ-AGENT-03, REQ-PACK-14
- [ ] AC-AGENT-13: 工程順序はLayer Aの状態機械が強制し、ゲート（Intake/Quality Gate/Preview承認/Cleanup）を飛ばさない。 ｜ 検証: REQ-AGENT-03, REQ-AGENT-06
- [ ] AC-AGENT-14: new_article_workflowの工程が状態機械（Intake→…→Cleanup）として定義され、Orchestratorがゲート（Intake/Outline Contract/Quality Gate fail-close/Preview承認/Cleanup）を強制し、工程順序を飛ばさない。 ｜ 検証: REQ-AGENT-09, REQ-AGENT-03, REQ-AGENT-06

## Quality (Google-based)

- [ ] AC-QUALITY-01: 品質評価がGoogle公式2文書ベースで、E-E-A-T(Trust中心)・有益な目的/MC品質・Needs Met・YMYL・Lowest回避に機械判定可能な形でマップされている。 ｜ 検証: REQ-AGENT-08
- [ ] AC-QUALITY-02: Lowest該当（有害・欺瞞・スパム）およびYMYL重大不合格はhard gateで自動公開を止め保留・人手判断へ回し、最終公開判断はユーザーに帰属する。 ｜ 検証: REQ-AGENT-08, REQ-PRODUCT-09
- [ ] AC-QUALITY-03: 生成物がscaled content abuse・偽の著者/経歴・無付加価値のコピー/言い換え・キーワード詰め込み等のLowest級スパム手法を用いない。 ｜ 検証: REQ-AGENT-08
- [ ] AC-QUALITY-04: Quality Gateが具体的な`catalog.quality_gate.*`として定義され、各ゲートが生成物から機械判定可能な代理シグナルを持つ（hard: scaled_content_abuse/scraping_thin/keyword_stuffing/deceptive_claim/authorship_integrity/injected_link_or_hidden/site_reputation_fit、advisory: original_value/comprehensiveness/needs_met_intent/title_honesty/eeat_trust/first_hand_experience/production_quality/freshness_honesty/coherence_flow/argument_structure/human_voice、修飾: ymyl_bar/review_depth）。 ｜ 検証: REQ-PACK-09, REQ-AGENT-08
- [ ] AC-QUALITY-05: hardゲート該当は自動公開を止め保留・人手判断へ回し、advisory不足はRepairループ入力とし、YMYL該当は基準を引き上げる。 ｜ 検証: REQ-PACK-09, REQ-AGENT-08, REQ-PRODUCT-09
- [ ] AC-QUALITY-06: 各ゲートが機械判定可能な計測指標と初期しきい値を持つ（keyword密度、競合推奨語カバー率、独自要素数、近似度、出典付与率等）。日本語可読性は検証済み指標をConfig参照し、選定まではadvisoryとし、英語向けFlesch値を日本語記事の合否基準へ使用しない。 ｜ 検証: REQ-PACK-10
- [ ] AC-QUALITY-07: 計測指標が第三者ヒューリスティック（公式ではない・要調整）であり順位保証でないことが明示され、hard/advisoryの確定と較正がL3に委ねられている。 ｜ 検証: REQ-PACK-10

## Pack / Schema

- [ ] AC-PACK-01: TicketはworkflowKey、promptPackKeys、sourceNeedKeys、schemaKeys、userPromptを持つ。 ｜ 検証: REQ-PACK-01
- [ ] AC-PACK-02: Pack versionはジョブ開始時に固定される。 ｜ 検証: REQ-PACK-04
- [ ] AC-PACK-03: TableはJSON正本で返される。 ｜ 検証: REQ-PACK-05
- [ ] AC-PACK-04: CMS投稿形式チェックを通して下書きDeliveryへ進め、初期WordPress AdapterではDynamic Post Schemaに適合するWordPress下書きを作成できる。 ｜ 検証: REQ-WPA-02, REQ-INT-10
- [ ] AC-PACK-05: Executorは直テーブルにアクセスせず、Source Need→Source Pack→Source Extract（JSON）でのみデータを受け取り、成果はSnapshotとして返す。 ｜ 検証: REQ-PACK-06, REQ-AGENT-05
- [ ] AC-PACK-06: 各Packが種別（Prompt Pack / Source Pack / Catalog）・キー名前空間・versionで一意に引け、サイト方針データは取得→注入の2段で扱われる。 ｜ 検証: REQ-PACK-01, REQ-PACK-02, REQ-PACK-04
- [ ] AC-PACK-07: 主要な内部データが Source Pack キーで JSON 取得でき、site_idスコープで解決される。 ｜ 検証: REQ-PACK-07, REQ-SEC-07
- [ ] AC-PACK-08: 各Workflowステージが使うPack / Source / Schemaがバインディングで固定され、Workflow versionに凍結される。 ｜ 検証: REQ-PACK-08, REQ-AGENT-06
- [ ] AC-PACK-09: 各名前空間の具体Packタイプが列挙され（article_type/heading_flow/purpose_element/quality_gate/prompt/workflow/schema）、例示止まりでない。 ｜ 検証: REQ-PACK-11
- [ ] AC-PACK-10: 各Packタイプに型（フィールド）が定義され、schema.ticket.<stage>.v1 と schema.snapshot.qa.v1（gates・metrics・ymyl・hard_gate_block・欠損注記）が確定している。 ｜ 検証: REQ-PACK-11, REQ-PACK-09, REQ-PACK-10
- [ ] AC-PACK-11: few-shotが記述タイプ・記事タイプ・見出しフローごとに正例（必須ユニットに最低1つ）と任意の反例で構築され、各エントリが実証するQuality Gateでタグ付けされる。 ｜ 検証: REQ-PACK-12, REQ-PACK-11
- [ ] AC-PACK-12: few-shotの選定基準とQAの合否基準が同一のgate定義（REQ-PACK-09）・計測指標（REQ-PACK-10）を単一ソースとし、few-shot正例がLowest/スパムを模範化しない。 ｜ 検証: REQ-PACK-12, REQ-PACK-09, REQ-PACK-10
- [ ] AC-PACK-13: 意味ユニット（記述タイプ）が機能別（導入・骨格/主張・論証/具体・一次情報/比較・評価/手順・実務/情報整理・データ）にグルーピングされ拡張列挙され、各ユニットがfew-shotと主なQuality Gateに紐づく。 ｜ 検証: REQ-PACK-11, REQ-PACK-12, REQ-PACK-09
- [ ] AC-PACK-14: Packがステージ階層で分離され、方針決定（article_type/heading_flow＝アウトライン層→Outline Contract凍結）と実装（purpose_element＝執筆層）が同列に置かれず、他Pack（Positioning/Regulation/Order/Source/Gate/few-shot）は組み合わせ要件として位置づく。 ｜ 検証: REQ-PACK-13, REQ-PACK-08, REQ-AGENT-02
- [ ] AC-PACK-15: Pack/Catalogの引き当てがフロー（flow_pack_keys）・フェーズ（REQ-PACK-08）・遷移（遷移駆動）の3スコープに分離され、REQ-PACK-08がフェーズ・スコープに位置づく。 ｜ 検証: REQ-PACK-14, REQ-PACK-08
- [ ] AC-PACK-16: injectorが現在のフロー状態（flow/phase/last_transition）から3スコープの和集合を解決し、同一フェーズでも到達遷移で引くCatalogが変わりうる。 ｜ 検証: REQ-PACK-14, REQ-AGENT-07

## Automation

- [ ] AC-AUTO-01: 予約投稿、承認、差し戻しができる。 ｜ 検証: REQ-WPA-04
- [ ] AC-AUTO-02: 自動運用はSite作成時OFFで、完成記事の人間承認証拠とconfirmed `ai_office_publication` Publication Factを持つ新規記事15件、権限者の版付き同意、対象・予算・品質・公開時間・停止条件が揃った場合だけ新規記事へ解放される。予約、CMS API受付、下書き、外部変更、帰属確認中、既存記事、リライトは15件へ算入せず、リライト更新は引き続き承認を要求する。 ｜ 検証: REQ-WPA-04
- [ ] AC-AUTO-03: 緊急停止できる。 ｜ 検証: REQ-WPA-04, REQ-DUR-04
- [ ] AC-AUTO-04: WordPressプラグインはデータ交換ソケット（取得・公開・トラッキング挿入/蓄積）であり利用はシステム側、導入するだけで連携し、Tenant/Siteスコープで認証され最小権限で正本へ書き込む。 ｜ 検証: REQ-WPA-07, REQ-SEC-09
- [ ] AC-AUTO-05: 初期βのプラグインは自社ZIP配布とし、SaaS側でSite用ZIP取得・期限付きペアリング・導入手順・接続versionを確認でき、更新の有無をWP管理画面とシステム側コンソールの双方へ通知し、更新は署名付き・Tenant/Siteスコープで適用される。 ｜ 検証: REQ-WPA-07, REQ-SCREEN-01

## Cost / Observability

- [ ] AC-COST-01: 実行前に予想トークンと予想クレジットを算出できる。 ｜ 検証: REQ-SEC-04, REQ-BILL-02
- [ ] AC-COST-02: Token TrackerとPrompt Cache Trackerを記録できる。 ｜ 検証: REQ-SEC-02, REQ-SEC-03
- [ ] AC-COST-03: 予想と実績の差分を管理画面で確認できる。 ｜ 検証: REQ-SEC-03, REQ-BILL-05
- [ ] AC-COST-04: 外部API費用をtenant/site単位で確認できる。 ｜ 検証: REQ-SRC-06, REQ-BILL-05
- [ ] AC-COST-05: 外部取得がプロバイダ別のグローバル/共有クォータ予算で配分され、個別テナント予算の合算がプロバイダのプロジェクト/アカウント上限を超えない。 ｜ 検証: REQ-SRC-07, REQ-KGA-11
- [ ] AC-COST-06: 夜間バッチがジッタ付きで時間分散起動され、同時実行上限・レート整形・テナント間フェアシェアで一斉バーストを防ぎ、共有クォータ超過はバックオフ・次窓繰り延べで処理される。 ｜ 検証: REQ-SRC-07

## Billing / Credit

- [ ] AC-BILL-01: 品質グレードごとに想定Prompt Cacheヒット率を原価前提として明示している。 ｜ 検証: REQ-BILL-06
- [ ] AC-BILL-02: 想定と実測のヒット率・原価乖離をtenant/site/workflow別に監視できる。 ｜ 検証: REQ-BILL-06
- [ ] AC-BILL-03: 予約クレジットはキャッシュmiss上限側で仮押さえされる。 ｜ 検証: REQ-BILL-06, REQ-BILL-02

## Feature Flag / Kill Switch

- [ ] AC-REL-01: 各開発ユニットおよびユーザー影響機能がFeature Flagの背後で出荷される。 ｜ 検証: REQ-DUR-04
- [ ] AC-REL-02: 外部取得・生成/リライト・投稿予約・full_auto・Agent Officeビュー・分散バッチが独立したKill Switchを持つ。 ｜ 検証: REQ-DUR-04
- [ ] AC-REL-03: Kill Switchはtenant/site単位とサービス全体で作動し、進行中ジョブを安全に停止・解放し、監査ログに残す。 ｜ 検証: REQ-DUR-04

## Profile

- [ ] AC-PROFILE-01: 「です・ます調／だ・である調」と文語体／口語体の組合せを指定でき、個別Siteの言い回し学習をON/OFFできる。ON時はサンプル記事10本を使用し、10本未満でも暫定プロファイルで受け入れて信頼度を明示する。OFF時はサンプル記事を要求しない。 ｜ 検証: REQ-WPA-06

## Role

- [ ] AC-ROLE-01: 自動運用の有効化が顧客側の契約者またはサイトオーナーに限定され、顧客の停止操作と内部運用のKill Switchが別の認可境界・監査記録で実行される。 ｜ 検証: REQ-PRODUCT-08, REQ-WPA-04
- [ ] AC-ROLE-02: 契約・プラン変更、credit購入、課金上限、自動チャージが契約者に限定され、サイトオーナーまたはユーザーへ業務権限を付与しても実行できない。 ｜ 検証: REQ-PRODUCT-08
- [ ] AC-ROLE-03: すべてのRoleでtenant/site境界が強制され、Role権限が境界を上書きしない。 ｜ 検証: REQ-PRODUCT-08, REQ-SEC-01

## Performance

- [ ] AC-PERF-01: 主要画面が代表テナントと上限近傍テナントで性能計測され、事前計算スナップショットから配信され、初期表示目標を満たし、画面シェルと主要ナビゲーションが遅いデータ源にブロックされず、一覧が取得上限・ページングまたは仮想化を持ち、長時間処理が受付状態・進捗・部分結果・再試行を表示する。 ｜ 検証: REQ-SEC-06
- [ ] AC-PERF-02: 主要画面ごとにクライアント配信量・初期API本数・DBクエリ数の予算が定義され、無制限走査・無制限JOIN・N+1がなく、クエリ時間・走査行数・返却行数の計測結果が受入証跡として残る。 ｜ 検証: REQ-SEC-06
- [ ] AC-DATA-WEIGHT-01: 恒久DBに本文・生HTML・競合本文・LLM raw response・プロンプト全文・大容量debug payloadがなく、増加データに保持期間・ロールアップ・削除またはアーカイブ・容量上限があり、新しいデータ群に所有者・増加単位・保持方法が定義される。 ｜ 検証: REQ-SEC-06, REQ-SEC-11, REQ-PRODUCT-19, REQ-PRODUCT-20
- [ ] AC-PERF-03: 事前計算が未完了の場合、空表示ではなく計算中状態と再試行手段を提示する。 ｜ 検証: REQ-SEC-06

## Analytics Framing

- [ ] AC-CV-01: CVは日別・URL別・ゴール別の集計であり、改善の主指標はGSCのURL×クエリ実績、CVは相関ベースの補助指標として提示される。 ｜ 検証: REQ-WPA-05

## Delivery / Scope

- [ ] AC-DELIV-01: 製品内でSite設定、CMS／GSC接続、キーワード入力／探索、文体、CV設定を完了でき、大規模Siteは自動構築期間として段階開放される。人的導入支援は有償支援またはPlan条件として分離され、利用開始の必須条件にならない。 ｜ 検証: REQ-PRODUCT-09
- [ ] AC-DELIV-02: アプリ内FAQチャットが画面Contextと接続診断を用いて一次回答し、解決不能時は問い合わせへ接続する。SEO相談等の有償支援とシステム不具合受付を区別し、記事内FAQ生成機能とも混同しない。 ｜ 検証: REQ-PRODUCT-09
- [ ] AC-DELIV-03: 登録時の同意書で、公開コンテンツの最終責任がユーザーに帰属し、サービスは生成物の最終責任を負わない旨に同意を得る。同意書・規約が版管理され、重要変更の版UP時に差分提示つき再同意が要求され、同意記録に版が紐付く。 ｜ 検証: REQ-PRODUCT-09

## Notification

- [ ] AC-NOTIF-01: 通知イベントカタログが既存要求由来のイベント（承認・hard gate保留・ジョブ失敗・カニバリ・残高低下・再認可・Kill Switch・プラグイン更新等）として定義され、各通知がtenant/site境界内でRole・Membershipに基づきサーバー側で受信者解決される。 ｜ 検証: REQ-PRODUCT-11, REQ-SEC-08
- [ ] AC-NOTIF-02: in-app通知センターが正本で、外部チャネル配信失敗でも記録が失われず、通知本文に記事本文全文・プロンプト全文・シークレットが含まれない。監査対象イベントの正本は監査ログであり通知はその写像である。 ｜ 検証: REQ-PRODUCT-11, REQ-SEC-10, REQ-SEC-11
- [ ] AC-NOTIF-03: 通知設定（種別別ON/OFF・ダイジェスト頻度）がユーザー単位＋テナント既定の上書きで設定でき、同種イベントの連続発生にダイジェスト・スロットリングの頻度制御が効く。 ｜ 検証: REQ-PRODUCT-11, REQ-ADM-09

## Daily SEO Operations

- [ ] AC-TOPO-01: 幹→枝→葉の階層割当が検索規模・語数・intentから決定論で提示され、カテゴリ×タグの縦横リンク網がWPタクソノミへ写像され、CVに近い順の生成順序が推奨され、記事の追加・削除のたびにリンク再調整候補（承認制小リライト）が生成され、コア記事・強化カテゴリの指定と採否がユーザーにある。 ｜ 検証: REQ-KGA-19, REQ-KGA-09, REQ-KGA-10
- [ ] AC-WATCH-01: キーワードのピン留め監視（しきい値通知・下落時のリライト/リンク/CTA導線）、サイトレベル急変検知と要因分解、自前データによるSERP変動集計とアルゴ更新情報の取り込み（availability付き）、変動期間中のリライト保留ガード、16か月YoYによる季節検知とシーズン前リフレッシュ提案が機能する。 ｜ 検証: REQ-KGA-20, REQ-KGA-08, REQ-PRODUCT-11
- [ ] AC-INDEX-01: 公開URLのインデックス状況がクォータ配下・優先度順で監視され、未登録/除外/エラーが問題一覧になり、canonical/robots/構造化/リンク切れの決定論チェックが修正導線つきで提示される。 ｜ 検証: REQ-KGA-21, REQ-KGA-11, REQ-KGA-08
- [ ] AC-WINNER-01: 好調記事に保護フラグと慎重警告・変更範囲限定の既定が付き、好調要因ビュー（クエリ・CV・滞在・スクロール）と波及リンク強化候補が提示され、リライト起動時にブリーフ（落としたクエリ・追加候補・競合見出し差分・AIO状況）が集約表示される。 ｜ 検証: REQ-RWR-08, REQ-WPA-11, REQ-KGA-19
- [ ] AC-ENGAGE-01: 滞在時間・スクロール深度がプラグインの任意有効化で個人非特定の集計値として計測され、相関補助の位置づけで好調分析・前後比較に供給され、サイト単位で無効化できる。 ｜ 検証: REQ-WPA-11, REQ-SEC-11
- [ ] AC-PLAN-01: 月次目標（トラフィック/CV）設定・カテゴリ別配分の推奨・過去実績ベースの参考レンジ予測（保証しない明示）・日次/週次進捗・月末乖離要因がダッシュボードのプランニングタブで完結し、第一階層項目数を増やさない。 ｜ 検証: REQ-PRODUCT-17, REQ-NAV-01

- [ ] AC-GOV-01: 監視・再計算が変化駆動（O(変化量)）で、常時計算がサイト集計層に限定され、詳細分解は異常時オンデマンドで、監視状態がDB事前計算に置かれ常駐メモリに全テナント状態を持たず、決定論監視がクレジット外・運用原価としてADM-S4で観測される。 ｜ 検証: REQ-PRODUCT-18, REQ-SRC-05, REQ-ADM-04
- [ ] AC-GOV-02: リライト・リンク再調整の自動下書き生成に日次/週次の変更予算・同一記事クールダウン・振動検知（相互打ち消しの検出→自動停止＋通知）が効き、公開記事への更新はユーザー承認を必須とし、上限到達時は候補がキュー保留され人へ提示される。 ｜ 検証: REQ-PRODUCT-18, REQ-AGENT-06, REQ-WPA-04
- [ ] AC-FACT-01: 調査由来の低変化事実がコンパクト形（key/value/observed_at/confidence/source_ref）で蓄積され、鮮度期限内は外部再取得・再計算が省略され、再調査が期限または変化トリガ時に限定され、本文・生HTMLを含まず、書き込みがSnapshot経由のスキーマ検証で行われ、source_ref根拠のない事実・鮮度期限のない事実の永続化が拒否され、サイズ上限とロールアップを持つ。 ｜ 検証: REQ-PRODUCT-19, REQ-SEC-11
- [ ] AC-FACT-02: 施策台帳が施策タイプ×文脈×効果デルタで記録され、しきい値較正・好調分析・ネットワーク学習の成果較正の入力になり、生成への供給がsource.site.facts.v1経由で行われる。 ｜ 検証: REQ-PRODUCT-19, REQ-RWR-06, REQ-PRODUCT-13

- [ ] AC-PATCH-01: 公開済み記事への部分更新（リンク挿入・TDH・CTAブロック）がWPリビジョン優先、非対応時は専用暗号化バックアップによる復元、更新競合検知つきで行われ、公開と同期直列でなくscheduledレーンの分散適用（レート・同時数制御）で実行され、更新が施策台帳と1か月・3か月・6か月評価の対象になる。 ｜ 検証: REQ-WPA-12, REQ-PRODUCT-18, REQ-WPA-08
- [ ] AC-FLASH-01: フラッシュリライト候補が期待CTR基線への負残差から選定され、aio_suppressedが切り分け表示され、TDH複数案が意図・主張軸・本文整合の検査つきで提示され、本文非変更の部分パッチで適用され、効果が同順位帯の前後CTR比較で測定される。 ｜ 検証: REQ-RWR-09, REQ-KGA-17, REQ-WPA-12
- [ ] AC-CRO-01: CVポイントがカタログ（識別子・計測タグ・有効期間）と記事×割当台帳で管理され、CTA Placementの解決先になり、CV相関・エンゲージメントから差し替え候補が因果非主張で提案され、適用が部分パッチ＋承認/変更予算配下で、期限切れ・リンク切れが検知される。 ｜ 検証: REQ-WPA-13, REQ-PACK-17, REQ-WPA-05

- [ ] AC-SUMM-01: ArticleSummaryが記事能力インベントリ（トピック・意図・読者・問い・主張・意味ユニット・エンティティ・キーワード・tier/カテゴリ/タグ・CTA・リンク可能性・鮮度・不足・品質・完全性・信頼度・hash・version）として上限つきで保持され、本文・段落・生HTMLを含まず、content hash変更分だけ一時本文から再解析され、解析後に本文が破棄される。解析失敗時は直前の有効サマリーを維持し、鮮度・完全性を下げて再試行される。 ｜ 検証: REQ-PRODUCT-20, REQ-PRODUCT-04, REQ-SEC-06
- [ ] AC-SUMM-02: 新規記事・リライト・Query Drift・カニバリ統合・内部リンク・CTA・季節更新・好調記事保護の候補がArticleSummary、Keyword Map、GSC、施策台帳から本文再取得なしで生成され、各recommendation itemに使用summary field、外部根拠、信頼度、鮮度、反証条件があり、採用・却下・編集・保留・実施後効果が較正へ戻る。 ｜ 検証: REQ-PRODUCT-20, REQ-KGA-08, REQ-KGA-13
- [ ] AC-SUMM-03: 埋め込みが記事能力サマリー由来・用途列挙・決定論一次判定の補助に限定され、モデルversion固定・変更分のみ再計算・テナントスコープであり、本文取得省略率・1記事当たり保存量・再解析率・推薦生成時間・採用率・実施後効果が観測される。 ｜ 検証: REQ-PRODUCT-20, REQ-PRODUCT-18, REQ-ADM-04
- [ ] AC-RECOMMEND-01: 記事制作・リライトの既定入口が優先順位付きrecommendation queueで、新規作成・リライト・統合・内部リンク・CTA・更新・保護・監視・見送りを区別し、各候補が「なぜ今か・なぜこの対象か・何を変えるか・実行しない場合・費用・リスク」を表示し、自由指定の手動経路も残る。 ｜ 検証: REQ-PRODUCT-24, REQ-AOUI-05, REQ-UJ-05/06
- [ ] AC-RECOMMEND-02: 採用したrecommendationの対象・目的・根拠・期待改善・変更範囲・品質条件・予算がTicketまたはEdit Planへ再入力なしで引き継がれ、実行前に重複・保護・競合・鮮度・変更予算が再検証される。 ｜ 検証: REQ-PRODUCT-24, REQ-PACK-01, REQ-RWR-03
- [ ] AC-RECOMMEND-03: recommendationの採用・編集・保留・却下理由・実施後効果が推薦種別と記事文脈ごとの較正に使われ、古い根拠の候補がstaleまたは失効し、同じ不適切候補の反復が抑制される。 ｜ 検証: REQ-PRODUCT-24, REQ-PRODUCT-20, REQ-PRODUCT-18
- [ ] AC-SCHED-01: テナントごとのタイムゾーン・静穏時間帯設定に従いバッチ・scheduled・部分パッチが静穏窓へ配置され、窓内オフセット分散と同時実行上限でプラットフォーム全体がスパイクせず、鮮度high/interactiveは即時実行が保たれる。 ｜ 検証: REQ-SRC-10, REQ-SRC-05, REQ-WPA-12
- [ ] AC-CAP-01: テナント資源プロファイルとノード当たり健全テナント数が利用率しきい値で定義・計測され、密度接近が監視されスケール移行トリガを持ち、段階構成の移行が境界APIを変えずに行え、ノード費÷密度の1社あたり基盤原価が原価モデルへ配賦される。 ｜ 検証: REQ-DUR-06, REQ-BILL-06, REQ-ADM-04

- [ ] AC-DEPLOY-01: dev/staging/prodが分離・IaC管理され、デプロイがgraceful drain（受付停止→checkpoint保留→切替→自動再開）でバッチ窓を避けて行われ、DDLがexpand→migrate→contractの後方互換で、キューはPG起点でMQ移行トリガを持ち、TTL物・バックアップ・エクスポートがS3互換に置かれVPSローカルを恒久置き場にせず、UTC保存・テナントTZ表示が守られる。 ｜ 検証: REQ-DUR-07, REQ-AGENT-10, REQ-PACK-04
- [ ] AC-RECOV-01: RPO/RTO目標が定義・監視され、日次フル＋WALのPITRと**別障害ドメインへの暗号化隔離保管**があり、テナント単位は日次論理エクスポートからの選択復元で対応でき、全体/テナント両方の復元演習が定期実施・記録され未実施期間のアラートが出る。 ｜ 検証: REQ-DUR-08, REQ-ADM-08, REQ-SEC-10
- [ ] AC-INBOUND-01: 公開API・画面API・Webhook・プラグインエンドポイントにテナント/ユーザー/IP単位のレート制限が効き、ログイン/再認可試行の制限とバックオフがあり、全経路TLS（HSTS）で、管理コンソールに追加防御オプションがある。 ｜ 検証: REQ-SEC-15, REQ-SEC-01, REQ-SEC-08
- [ ] AC-MAIL-01: メール送信がアダプタ抽象化され、SPF/DKIM/DMARCが整備され、ハードバウンス/苦情で該当先のメールチャネルが自動停止（抑制リスト）されつつin-app正本が保たれ、設定画面に停止状態と再有効化導線が出て、バウンス/苦情率がしきい値監視される。 ｜ 検証: REQ-PRODUCT-21, REQ-PRODUCT-11

- [ ] AC-PORT-01: 全サービスがシークレット非焼き込み・設定注入の不変コンテナイメージでAWSへ配布され、最小構成からtask／worker／DB／tenant shardを**同一イメージ・境界API不変**で段階拡張でき、状態がPG/S3 Contract/queueへ外部化され、AWS固有API依存がAdapter層に隔離され、stagingで復元・配置切替演習が行われる。 ｜ 検証: REQ-DUR-09, REQ-DUR-06, REQ-DUR-08
- [ ] AC-HEAL-01: ヘルスチェック→自動再起動・再スケジュールが行われ、実行中ジョブがcheckpointから無人再開（不能時は保留＋通知のfail-close）し、証明書更新・ログローテ・TTL掃除・DBメンテが無人実行され、全自動アクションが監査され、フラッピング時に自動化を一時停止できる。 ｜ 検証: REQ-DUR-10, REQ-AGENT-10, REQ-DUR-04
- [ ] AC-MAIL-02: メール送信がキュー・リトライ・dedupe_keyの二重送信防止を持ち、認証/回復系が優先レーンで、no-reply＋サポート窓口明示・DMARCレポート監視が行われ、非本番からの実送信が禁止されテストモードでキャプチャされる。 ｜ 検証: REQ-PRODUCT-21, REQ-DUR-07
- [ ] AC-ACCT-01: 招待が期限付き単回トークンで失効・再送・取消でき、オーナー喪失時の回復が本人確認→管理者統制の移譲（自動化なし・双方通知・全監査）で行え、全端末ログアウトとRole変更/退会/回復時の強制失効があり、高リスク操作にstep-up再認証が要求される。 ｜ 検証: REQ-SEC-16, REQ-SEC-08, REQ-ADM-06

- [ ] AC-SUPPORT-01: チャットQAがヘルプ根拠つきで応答し、テナント参照が問い合わせユーザーのRole・スコープ内に限定され、低確信・範囲外で捏造せずエスカレーションを提案し、会話レート/上限とクレジット外の原価帰属が効く。 ｜ 検証: REQ-PRODUCT-22, REQ-SEC-08, REQ-SEC-15
- [ ] AC-SUPPORT-02: 受付自動返信（ID・SLA目安・時間外案内・インシデント時のステータス自動案内）が機能し、エスカレーションが優先度×SLAで人へ渡り（要約＋文脈参照つき・本文/プロンプト非含有）、ADM-S12でキュー/SLA/deflectionが管理・計測され、解決ナレッジがADM-10統制でFAQへ還流する。 ｜ 検証: REQ-PRODUCT-22, REQ-PRODUCT-16, REQ-ADM-10

- [ ] AC-MASTER-01: マスターテナントがinternal区分で内部課金モード（消費・原価は通常計測＝実コストリファレンス）で動作し、サンドボックス・品質ゲート・承認・変更予算・監査が一般テナントと同一経路（バックドアなし）で、自己宣伝記事にもゲートが同基準適用され、Flagロールアウトがmaster→canary→一般の順で、マスター由来データのprior算入が既定除外（設定で制御）である。 ｜ 検証: REQ-PRODUCT-23, REQ-PACK-09, REQ-DUR-04, REQ-PRODUCT-13

- [ ] AC-MASTER-02: マスターテナントが開発者アカウント配下でADM-S9からのみプロビジョニングされ、実績→SEOループの素材が二層（k匿名ベンチマーク=同意目的に公表明記＋最小標本数／個別事例=明示オプトイン許諾・範囲指定・撤回で停止と削除）で管理され、転用が第二の明示認可例外として許諾範囲スナップショットのみをshowcaseストアへコピーし全転用・撤回が監査され、事例記事にも品質ゲート・誠実表記が同基準適用される。 ｜ 検証: REQ-PRODUCT-23, REQ-SEC-07, REQ-PRODUCT-09

## User Journeys

- [ ] AC-UJ-01: 行動原則（主要行動は第一階層から2遷移以内・通知から対処2遷移以内・行き止まり禁止＝次アクション提示・文脈引き継ぎ・非同期・破壊操作の確認/未保存保護/権限外は原則非表示）が全画面・全ジャーニーに適用される。 ｜ 検証: REQ-UJ-01, REQ-NAV-02, REQ-PRODUCT-11
- [ ] AC-UJ-02: 初期導入が、新規Siteの「Site設定・対象Site接続／Source診断→Big Keyword方向確認→分析・分類→Keyword戦略Report→Recommendation」と、既存Siteの「Site設定・対象Site確認→GSCまたはKeyword登録→取得可能記事との統合→分析・分類→Keyword診断Report→Recommendation」に分岐して到達できる。セルフ導入を標準とし、条件未達は空Recommendationを出さず不足入力へ戻す。分析開始とCMS書込Capabilityを同一Gateにせず、リライト対象は本文・見出し・公開状態を取得できた記事へ限定し、記事送信時は認証済みCMS REST API等のwrite Capabilityと下書き権限を再確認する。 ｜ 検証: REQ-UJ-02, REQ-BUS-02, REQ-SCREEN-01, REQ-INT-01/05
- [ ] AC-UJ-03: 日常運用（S1/W7起点→承認・保留対応・おすすめ採否・アラート対処）が完結し、未対応ゼロの終端に到達できる。 ｜ 検証: REQ-UJ-03, REQ-AGENT-10
- [ ] AC-UJ-04: キーワード戦略がMarket／Share分離→cluster分析→戦略／診断Report→月次目的・実行枠への施策配分→Recommendation Queue→採用Intakeの順に完結し、単一Keywordや生成本数だけへ縮退しない。分類修正は未実行候補だけを再計算し、採用情報は再入力なしでS3／Workflowへ引き継がれる。 ｜ 検証: REQ-UJ-04, REQ-BUS-04/05, REQ-KRL-01〜10, REQ-NAV-04, REQ-BILL-11
- [ ] AC-UJ-05: 生成〜公開が「Recommendation／手動指定→Intake freeze→Preflight→任意Outline確認・見出し修正→Meaning Unit Writing→任意本文途中Preview・ユーザー編集保護→Semantic Assembly→Cohesionを含むQA・限定Repair→Presentation Assembly（装飾・アイキャッチ・CTA・内部link・CMS形式変換）→Generation Outcome（成果提供・Output Vault・生成credit確定）→CMS Delivery／下書き→承認／自動運用判定→公開→通知→評価」の順で到達できる。hard gate、予算超過、接続不足、差し戻しは対象Contextを保持した終端または復帰先を持ち、成果提供・CMS反映・公開結果を別状態で追跡する。 ｜ 検証: REQ-UJ-05, REQ-AGENT-08〜11, REQ-SEC-12, REQ-INT-01/05/10
- [ ] AC-UJ-06: リライトが「候補→原因→記事取得確認→対象範囲freeze→起動→CMS下書き・差分→ユーザー承認→更新→1か月後の一次評価→3か月後の二次評価→6か月後の長期評価」の順で完結し、内部リンク候補の採否を含む。GSCまたはKeyword実績だけで本文変更を作らない。 ｜ 検証: REQ-UJ-06, REQ-RWR-04, REQ-KGA-09, REQ-INT-01/05
- [ ] AC-UJ-07: 例外・緊急（再認可・Kill Switch作動/解除・支払い失敗復旧・解約オフボーディング・保留期限超過）がそれぞれ定義済み終端に到達する。 ｜ 検証: REQ-UJ-07, REQ-DUR-04, REQ-SEC-10
- [ ] AC-UJ-08: 管理者運用（日次監視→較正、変更統制フロー、提案承認、障害対応、Adminが対象顧客・Site・操作・期限を指定したManagerの期限付き代理調査、権限失効）が管理コンソール遷移図のパスとして完結する。Operatorは顧客データへ入らず、内部actorを顧客本人へ書き換えない。 ｜ 検証: REQ-UJ-08, REQ-ADM-07, REQ-ADM-10, REQ-ACCESS-01〜03
- [ ] AC-UJ-09: 月次計画ジャーニー（目標→配分→トポロジー確定→日次/週次追跡→月末実績→翌月引き継ぎ）が遷移図のパスとして完結する。 ｜ 検証: REQ-UJ-09, REQ-PRODUCT-17

## Platform Extensions

- [ ] AC-EXPORT-01: 分析・キーワード・履歴データがテナント境界内・Role権限内でCSVエクスポートでき、本文・プロンプト・シークレットが含まれず、上限・形式が設定レジストリ管理である。 ｜ 検証: REQ-PRODUCT-14, REQ-SEC-11
- [ ] AC-SEARCH-01: グローバル検索がヘッダー常設でテナント内のキーワード・記事メタ・ジョブ・通知・設定を横断検索し、結果がRole可視性に従い、本文全文が対象外である。 ｜ 検証: REQ-PRODUCT-15, REQ-SEC-08
- [ ] AC-ANNOUNCE-01: 運営お知らせが対象選択（全体/プラン/テナント）つきで配信・通知センター表示され、作成・配信が監査に残り、公開ステータスページへの導線がユーザーUIに常設される。 ｜ 検証: REQ-PRODUCT-16, REQ-PRODUCT-11, REQ-ADM-07
- [ ] AC-AUTH-01: 認証層がIdP追加・2FAを後付けできる抽象化を持ち、初期Googleログインのまま拡張点が確保され、提供時の強制可否がテナントポリシー制御である。 ｜ 検証: REQ-SEC-14, REQ-SEC-08
- [ ] AC-RESP-01: 初期リリースはdesktop標準として主要業務が完結し、mobile業務機能を初期受入へ混入させない。後続のAgent Office Chatが通知、確認、簡易説明、修正指示、Task状態を提供しても業務正本を分岐させず、長文編集・詳細設定・画像Pattern・複雑なGraphはdesktopへ引き継げる。 ｜ 検証: REQ-NAV-06, REQ-DESIGN-12
- [ ] AC-INTL-01: UI文言がハードコードされず外部化され、通貨・日付・数値のロケール処理が分離され、日本語のみの初期状態から実装変更なしで言語追加できる。 ｜ 検証: REQ-NAV-07, REQ-ADM-11

## Network Learning

- [ ] AC-NET-01: 公共キーワード資産は公共外部データとしての取得元・保存再利用条件を持ち顧客対応を含まず、顧客由来のテナント横断集約は一方向（テナント→グローバル）・k匿名しきい値・識別子/本文/URL/生GSCクエリ除去で行われる。両者のprovenanceが分離され、集約結果からテナント・サイト・個別URLを特定できないことが契約検証に含まれ、登録同意にデータ利用条項とテナント単位オプトアウトがある。 ｜ 検証: REQ-PRODUCT-13, REQ-PRODUCT-09, REQ-SEC-13
- [ ] AC-NET-02: 集約の適用が常に提案として生成され、辞書・タクソノミはCatalog改版（REQ-ADM-10統制）、prior・しきい値は設定レジストリ改版（REQ-ADM-09統制）経由でのみ反映され、自動反映されず、記事内容・サイト戦略・few-shot・Prompt Pack・エージェントプロンプトへのテナント横断学習が行われない。 ｜ 検証: REQ-PRODUCT-13, REQ-ADM-09, REQ-ADM-10
- [ ] AC-NET-03: 新規サイトがセグメント別prior（セグメント標本不足時はグローバルfallback）から開始し、自サイトデータ蓄積に応じて縮小推定で自サイト実測へ移行し、オプトアウトテナントのデータが集約から除外されつつ共有観測・辞書の受益は継続する。 ｜ 検証: REQ-PRODUCT-13, REQ-KGA-17
- [ ] AC-NET-04: サンドボックス内ジョブが共有物（グローバルCatalog・公共キーワード資産・共有観測キャッシュ・prior）をホワイトリスト経由・読み取り専用・version freezeで参照し、ジョブから共有物への書き込み・集約起動が構造的に不可能で、ホワイトリスト外参照が境界検証でfail-closeし、共有資産・キャッシュ読み取りが読む側テナントの外部予算を消費しない。 ｜ 検証: REQ-PRODUCT-13, REQ-PACK-06, REQ-SEC-13, REQ-SRC-07

## Customization

- [ ] AC-CUST-01: ユーザー自己サーブのカスタマイズがレギュレーション調整 / User Order / 戦略入力（ターゲット軸・主張軸）に限定され、生system prompt編集・few-shot自作登録・レシピ自作定義・Pack本文直接編集・Quality Gate無効化は提供されず、全Tierが固定制約を上書きできない注入経路に乗る。 ｜ 検証: REQ-PRODUCT-12, REQ-AGENT-07, REQ-ADM-09
- [ ] AC-CUST-02: ターゲット軸・主張軸が構造化フィールドでDomain Positioning（audience/target_axes/allowed_claims/avoided_claims）へ写像され、登録時の静的Validateで差し戻され、実行時は主張がclaim_evidence/deceptive_claim/ymyl_bar等で検証されて根拠を伴えない主張はhardで保留になる。hard判定自体は緩和・合格化せず、同一権限者の二段階確認、未解消項目の表示、版付き同意書、例外記録を通した手動公開だけを許可する。文体は「です・ます調／だ・である調」と文語体／口語体を指定し、個別Siteの言い回し学習は任意ON/OFF、構造カスタムはコンサル→REQ-ADM-10経由でテナント/サイトスコープ登録される。 ｜ 検証: REQ-PRODUCT-12, REQ-PACK-09, REQ-PACK-16, REQ-AGENT-08, REQ-ADM-10
- [ ] AC-CUST-03: 注入されたUser Order・主張軸・ターゲット軸のキーが観測ログとQA結果に紐づき、ゲート不合格時にどの指定が影響したかが提示され、見直し導線がある。 ｜ 検証: REQ-PRODUCT-12, REQ-SEC-02

## Migrated Domains (v3.6→v3.7)

- [ ] AC-RWR-01: リライトのdefaultがrewrite_patchで、パッチはEdit Plan宣言のsection_id内に限定され、未変更セクションのhashが維持される。 ｜ 検証: REQ-RWR-01, REQ-RWR-03
- [ ] AC-RWR-02: 既存本文は一時workspaceのみ・承認/期限切れで削除され、品質ゲートが表崩れ・CTA破壊・WPブロック破壊・境界外参照をfail-closeで検出する。 ｜ 検証: REQ-RWR-02, REQ-RWR-05
- [ ] AC-AOUI-01: Standard SaaSとAgent Officeが同一の詳細・API・状態を共有する体験レイヤーとして分離され、第一階層7画面に内部用語を出さない。 ｜ 検証: REQ-AOUI-01, REQ-AOUI-02
- [ ] AC-AOUI-02: 全ペルソナ（基本12＋拡張1=technical_seo、以降のconfig追加分を含む）が担当Service、会話能力、Proposal型、および必要な場合だけ内部Executor／工程（REQ-AGENT-09）へマッピングされ、実行中Taskの活動可視化が状態機械の現工程を反映する。 ｜ 検証: REQ-AOUI-03, REQ-AOUI-04, REQ-AOUI-07
- [ ] AC-AOUI-03: 各画面が探索軸とおすすめ軸の2軸を持ち、行動ログを保存せずsaved_views/feedbackのみ最小保存する。 ｜ 検証: REQ-AOUI-05
- [ ] AC-ADM-01: 開発管理者コンソールがユーザー画面と分離され、APIキー原文・secret・master keyを表示せず、手動クレジット操作・provider変更を監査ログに残す。 ｜ 検証: REQ-ADM-01, REQ-ADM-03, REQ-ADM-05
- [ ] AC-BILL-04: クレジット台帳がappend-onlyでreserve/commit/release/expire等を持ち、同一Stripe eventで二重付与しない。 ｜ 検証: REQ-BILL-07
- [ ] AC-BILL-05: サブスク状態でアクセス制御し、ユーザーにmodel/provider名を見せずプラン・品質グレード・クレジットで提示する。 ｜ 検証: REQ-BILL-08
- [ ] AC-BILL-06: Provider Registry／Adapter Contract／RoutingがProvider非依存で、Capability不足を不適切用途へRoutingせず、Canary→自動rollbackし、APIキー原文を保存しない。 ｜ 検証: REQ-BILL-09
- [ ] AC-SEC-11: 全データが境界キーで分離され、ジョブがsite_id固定、保存禁止データ（本文全文・プロンプト全文・APIキー原文等）を保持しない。 ｜ 検証: REQ-SEC-11
- [ ] AC-SEC-12: 実行前に決定論的Preflight Estimateを生成し、契約検証（schema/forbidden output/hallucinated source/sandbox境界）が行われる。 ｜ 検証: REQ-SEC-12, REQ-SEC-13
- [ ] AC-WPA-08: WPCapabilitySnapshotからDynamic Post Schemaを導出し、未対応slot/blockをfail-close、最終HTML全文を恒久保存しない。 ｜ 検証: REQ-WPA-08, REQ-WPA-09
- [ ] AC-WPA-09: Keyword Map Packが同一SERPs/PAA/AIO/類語のPack群として定義され、AIO/PAA不可時に捏造せずavailability理由を返す。 ｜ 検証: REQ-WPA-10
- [ ] AC-KGA-14: keyword⇔GSCクエリ⇔記事のグラフ接続と、SERPs閾値・Eligible Competitor Top5・分類証跡・Stuffing Guardが定義される。 ｜ 検証: REQ-KGA-12
- [ ] AC-SRC-01: 分散実行単位・Batch Priority Queue（P0〜P5）・DataForSEO Cache・Batch Observabilityが定義される。 ｜ 検証: REQ-SRC-08

## Query Fanout / 開発者管理・運用

- [ ] AC-SRC-02: Query Fanout Agentがシード/GSCクエリをfacet別サブクエリへ分解し、Source Packで取得してサブトピック網羅へ接続、取得不可時は捏造せずavailability理由を返す。 ｜ 検証: REQ-SRC-09, REQ-SRC-02
- [ ] AC-ADM-02: 内部ロールとテナントロールを分離し、クロステナント操作をbreak-glass/JIT昇格（時間制限・理由・監査）で行い、常時付与しない。 ｜ 検証: REQ-ADM-06
- [ ] AC-ADM-03: 監査ログが不変・テナント分離・所定スキーマで、Managerの期限付き代理アクセスがAdmin指定の顧客・Site・operation・期限へ制限され、代理表示と内部actor／顧客Context／付与者／理由を記録する。顧客本人へのなりすまし、共有Session、Operatorの顧客dataアクセスを許可しない。 ｜ 検証: REQ-ADM-06, REQ-ACCESS-01〜03
- [ ] AC-ADM-04: ログ/メトリクス/トレースがrequest_id・tenant_idで相関し、SLO・アラート・ステータス・インシデントrunbook・レート制限を持つ。 ｜ 検証: REQ-ADM-07
- [ ] AC-ADM-05: データエクスポート/削除/同意ログ・保持ポリシー・秘密ローテーション・バックアップ復元・冪等キーが定義される。 ｜ 検証: REQ-ADM-08
- [ ] AC-BILL-07: 価格・クレジット単価・原価/消費係数・プラン内容が要求にハードコードされず、設定レジストリから解決され、version/effective/status・freeze・監査を持つ。 ｜ 検証: REQ-BILL-10, REQ-ADM-09
- [ ] AC-ADM-06: 調整可能パラメータ（しきい値・クォータ・TTL・優先度・facet重み等）が管理画面設定で、グローバル→プラン→テナント/サイトの上書きと影響プレビューを持ち、安全不変条件（サンドボックス・本文非保持・境界・監査・承認制御・APIキー非表示）は設定で緩められない。 ｜ 検証: REQ-ADM-09, REQ-SEC-11
- [ ] AC-ADM-09: Prompt Pack・Catalog・few-shot・Workflow・Quality Gate定義が、コード変更なしに管理画面から draft→Preview→Validate→Approve→Publish（新version発行）の統制で編集でき、公開済みversionは不変・freeze済みジョブの再現性を壊さず、few-shot↔gate定義の単一ソース整合が検証され、変更が監査ログに残る。 ｜ 検証: REQ-ADM-10, REQ-PACK-04, REQ-PACK-12
- [ ] AC-ADM-10: 管理コンソール全画面で内部キー（config_key・event_type・ゲートキー・エラーコード・契約検証項目・メトリクス名）が日本語ラベル＋キー併記で表示され、ラベルはCatalog版管理・ADM-10統制で編集でき、未登録キーは生キー＋「ラベル未登録」印で可視化され、ラベルカバレッジが観測され、通知・監査表示と訳語が単一ソースで揃う。 ｜ 検証: REQ-ADM-11, REQ-ADM-04, REQ-ADM-10
- [ ] AC-ADM-11: Pack/Catalog/few-shot/Workflowの改版がValidate段でゴールデン評価セットにより現行版と比較され、しきい値超の品質悪化がPublishをブロックまたは警告付き承認になり、Publishがmaster→canary→一般の段階ロールアウトを選択でき、活性化後のQA fail率スパイクが監視・通知（pack_regression_detected）されロールバック提案が出る。 ｜ 検証: REQ-ADM-10, REQ-PACK-12, REQ-ADM-04

## Development Order

- [ ] AC-DEV-01: 本質（データ整備・エージェント仕組み）を先行させる推奨実装順序に従い、本質より先にWP出力・課金・Agent Office・Autopilotを本番化しない。 ｜ 検証: REQ-DUR-03, REQ-DUR-05
- [ ] AC-DEV-02: 開発ユニットが依存順とFeature Flag / Kill Switchで段階化され、MVP境界に依存しない。 ｜ 検証: REQ-DUR-01, REQ-DUR-03
- [ ] AC-DEV-03: Mock Executorより前に実LLM本線へ進まない。 ｜ 検証: REQ-DUR-05
- [ ] AC-DEV-04: Agent Office演出は通常ビューと実イベントログの後に実装される。 ｜ 検証: REQ-DUR-05
- [ ] AC-DEV-05: DU-10最小縦切りの完了条件に3計測（レイヤー別実測キャッシュヒット率と原価前提の乖離／Repairループ収束率・停止ガード到達率／コヒーレンス指標＋人手評価サンプル）が含まれ、計測不能な実装はDU-10完了と認められない。 ｜ 検証: REQ-DUR-02, REQ-BILL-06, REQ-AGENT-11

## カバレッジ補完（REQ↔AC 完全対応）

- [ ] AC-PACK-17: PackExtractが構造・few-shot・制約を含み本文全文を渡さず、Pack欠落/古い/境界外でTicketをblocked/needs_packにする。 ｜ 検証: REQ-PACK-15
- [ ] AC-PACK-18: Pack CompilerがUser Knowledge優先で用途別Packを生成し、hash/version freeze・pack_compile_warnings・本文非保持を満たす。 ｜ 検証: REQ-PACK-16
- [ ] AC-PACK-19: CTAをWriting Ticketにせず、QAがCTAPlacementInstruction/WPBlockPlacementInstructionを返しAssembly/Placementで扱う。 ｜ 検証: REQ-PACK-17
- [ ] AC-PACK-20: Outline ContractがMeaningUnitPlanを持ちH2/H3を直接執筆単位にせず、Repairは該当Meaning Unitのみ再生成する。 ｜ 検証: REQ-PACK-18
- [ ] AC-PACK-21: writing_methodがOutline凍結時にprimary 1＋modifier最大2で確定してContractに封入され、優先順位（安全不変条件＞Gate＞Regulation＞User Order＞技法）が保証され、sales_writingの表現がdeceptive_claim/title_honestyを通らない場合に技法側が譲り、技法カタログがサイト文体を上書きしない。 ｜ 検証: REQ-PACK-19, REQ-PACK-09, REQ-PACK-16
- [ ] AC-PACK-22: 手書きfew-shot例示が登録Validateで検品パイプラインに通されgate_tags主張ゲートの不合格で差し戻され、human_authoredフラグでネットワーク学習対象外となり、ゴールデン評価セットと素材が重複せず、検品レンズが既存ゲートの束ね（view）として動作して第二の合否体系を作らない。 ｜ 検証: REQ-PACK-19, REQ-PACK-20, REQ-ADM-10
- [ ] AC-PACK-23: writing_methodのvariant（sales: push/pull/assist_only）がOutline凍結時にprimary_variantとして確定してcta_density_hintがCTA配置判断へ渡り、hard上限がvariantに関係なく不変であり、Persona Simulationがセグメント転生の構造化出力（理解度・違和感・AIらしさ知覚・離脱予測・行動意向）を返してValidate/ゴールデン評価の補助（advisory）に限定され、既定で記事単体QAに適用されず、実行数上限とコスト明示が機能する。 ｜ 検証: REQ-PACK-19, REQ-PACK-21, REQ-PACK-17
- [ ] AC-PACK-24: human_voiceゲートがAI定型表現の決定論検出（ai_phrase_density・辞書はADM統制）と参照アンカー対比（gate_tags付き手書き例示＋style_color）で評価し、style_colorがサンプル抜粋のtoken上限・同意フロー内・サイト削除での消去を守り、デモグラフィックセグメントが検証用途限定（差別的出し分け転用禁止）である。 ｜ 検証: REQ-PACK-09, REQ-PACK-16, REQ-PACK-21
- [ ] AC-PACK-25: Pack Typeカタログが記事タイプ、見出しフロー、意味ユニット、品質ゲート、Prompt、Workflow、Ticket・Snapshot Schemaの7サブIDで宣言され、各型を個別に参照・検証できる。 ｜ 検証: REQ-PACK-11.1, REQ-PACK-11.2, REQ-PACK-11.3, REQ-PACK-11.4, REQ-PACK-11.5, REQ-PACK-11.6, REQ-PACK-11.7
- [ ] AC-RWR-03: 差分プレビューが理由・対象・変更前後・各差分・Quality Gate結果・予想creditsを提示する。 ｜ 検証: REQ-RWR-04
- [ ] AC-RWR-04: リライト対象/種別がGSC実績・カニバリから機械判定され、強い部分を残し弱い箇所だけ直す。 ｜ 検証: REQ-RWR-06
- [ ] AC-RWR-05: リライトも実行前Preflightでcreditをreserveし、QA済み成果がOutput Vaultで利用可能な`deliverable_provided`でcommit、提供前の未使用分をreleaseでき、CMS下書き・公開成否とは分離したモード別消費係数を持つ。 ｜ 検証: REQ-RWR-07
- [ ] AC-SRC-03: 外部情報源がSource Packとして抽象化され、本文非保持でJSON取得される。 ｜ 検証: REQ-SRC-01
- [ ] AC-SRC-04: 外部取得がCrawler Complianceに従う。 ｜ 検証: REQ-SRC-04
- [ ] AC-SRC-05: 重い処理を画面表示時に走らせず、夜間バッチでtenant/site分散・checkpoint・budgetを持つ。 ｜ 検証: REQ-SRC-05
- [ ] AC-WPA-10: WP連携が取得/公開/トラッキングのデータ交換で、本文正本をWP側に置く。 ｜ 検証: REQ-WPA-01
- [ ] AC-WPA-11: WP能力にないslot/blockをfail-close/degradeし、捏造HTMLで代替しない。 ｜ 検証: REQ-WPA-03
- [ ] AC-WPA-12: 生成完了成果物がWP送信失敗時も暗号化されたOutput Vaultへ退避され、保持期限内に表示・コピー・ダウンロード・再送でき、期限到達時に本文が削除される。 ｜ 検証: REQ-WPA-14
- [ ] AC-BILL-08: 決済/請求/カード情報がStripe正本、クレジット台帳がSaaS正本という責務分担で提示される。 ｜ 検証: REQ-BILL-01
- [ ] AC-BILL-09: 品質グレード別の消費係数・原価前提が定義される（実数は設定レジストリ、REQ-BILL-10）。 ｜ 検証: REQ-BILL-03
- [ ] AC-BILL-10: AI Provider拡張の位置づけが定義され、本文生成を含むrouteが品質・Capability・原価・latency・health・契約条件からversion付きで解決される。 ｜ 検証: REQ-BILL-04
- [ ] AC-BILL-11: interactive/scheduledの2レーンが定義され、scheduledがBatch×1時間TTLキャッシュ既定で割引後見積により予約され、割引実数はCost Table管理、ユーザーには「今すぐ/おまかせ（割安）」として提示され、interactive経路にBatchが使われず、フォールバック差額が承認/ポリシー制御される。 ｜ 検証: REQ-BILL-11, REQ-BILL-09, REQ-SEC-12
- [ ] AC-KGA-15: キーワードマップが同一SERPs/intentクラスタから自動生成される。 ｜ 検証: REQ-KGA-03
- [ ] AC-KGA-16: キーワード分類（必須/推奨/オリジナル・intent）が機械判定で行われる。 ｜ 検証: REQ-KGA-04
- [ ] AC-NAV-01: 通常ビューがサイドメニュー→一覧/タブ→詳細で構成される。 ｜ 検証: REQ-NAV-02
- [ ] AC-NAV-02: Agent Officeビューが体験レイヤーとして同じ詳細・API・状態を共有する。 ｜ 検証: REQ-NAV-03
- [ ] AC-NAV-03: 第一階層各画面の責務が定義される。 ｜ 検証: REQ-NAV-04
- [ ] AC-NAV-04: UI素材方針（SVG正本・日本語テキスト/表/グラフは非画像化）が定義される。 ｜ 検証: REQ-NAV-05
- [ ] AC-NAV-05: 通常ビューと開発管理者コンソールが左サイドメニュー＋画面内タブの情報構造で実装され、画面台帳の各行に列挙された操作（追加・編集・削除・実行・選択）が閲覧専用でなく実際に操作でき、キーワードの手動追加・一括インポート・シード展開登録が機能し、キーワードマップ・ギャップマトリクス・昇格キューから記事作成が引き継ぎ（起点・グループ・推奨タイプのプリセット、アサイン競合の即時警告）つきで起動できる。 ｜ 検証: REQ-NAV-02, REQ-NAV-04, REQ-ADM-01, REQ-KGA-03, REQ-KGA-14
- [ ] AC-NAV-06: 主要行動がキーボードのみで到達・実行でき、フォーカスが常に可視で、コントラストがWCAG AA目安を満たし、prefers-reduced-motionでアニメーションが停止し、操作要素がラベルを持ち、全操作が通常ビューで完結する（Agent Officeが唯一経路にならない）。 ｜ 検証: REQ-NAV-08, REQ-AOUI-01, REQ-UJ-01
- [ ] AC-NAV-07: ユーザー面の文言（ラベル・エラー/確認文言・空状態案内・通知テンプレ）がui.text.*レジストリの版activateのみで差し替わり（デプロイ不要）、未定義キーがベース文言へフォールバックして欠落が観測され、変数欠落がValidateで検出され、禁止語（内部用語・provider名）混入が機械検査され、法務文言が対象外として同意版管理に従う。レジストリから型付きアクセサが自動生成されて存在しないキー参照がビルドエラーになり、UIコードの日本語リテラルがCI lintで検出され、日本語→キーの逆引きが機能し（同一名前空間の完全一致重複はValidate警告）、管理面（REQ-ADM-11）と共通術語基盤で訳語が一致する。 ｜ 検証: REQ-NAV-09, REQ-ADM-10, REQ-PRODUCT-09
- [ ] AC-PRODUCT-04: WordPress連携（プラグイン・データ交換ソケット）が定義される。 ｜ 検証: REQ-PRODUCT-06
- [ ] AC-AGENT-15: 品質段階と工程に応じてversion付きProvider Routingが主モデル・補助モデル・fallbackを選択し、特定Providerへ固定せず、一般ユーザーにはモデル名でなく品質段階と予測クレジットを表示する。 ｜ 検証: REQ-AGENT-04
- [ ] AC-AGENT-16: ジョブが保留系状態（手動停止/Kill Switch/予算待ち/hard gate/承認待ち）から、freeze済みversion・サンドボックス不変のままステージ境界checkpointで再開でき、同一Jobの完了済みstage、限定Repair、Provider retry、cache再構築で新しい顧客reserve／commitを作らず、cache再ウォームは内部原価として計測され、保留期限超過は未使用reserveをreleaseして自動キャンセル・通知される。 ｜ 検証: REQ-AGENT-10, REQ-PACK-04, REQ-SEC-12
- [ ] AC-AGENT-17: Outline Contract凍結時に用語ロックが確定して全Writing/Repairへ注入され、Section Briefが隣接ユニット文脈を含み、Assembly後にCohesion QA（coherence_flowゲート＋inter_unit_redundancy / term_consistencyのmetrics）が実行され、不合格は接続部の限定Repairへ回り（全文再生成しない）、指標がQA Snapshotに記録される。 ｜ 検証: REQ-AGENT-11, REQ-PACK-09, REQ-PACK-18
- [ ] AC-AGENT-18: Orchestratorのクラッシュ・再実行が安全であり、Ticket発行がticket_id冪等キーでdedupeされ、記録済みSnapshotのあるTicketはLLM再呼び出しされず、reserve/commitがticket_id単位で冪等で、障害注入の負のテストでLLM費用・クレジットの二重計上が発生しない。 ｜ 検証: REQ-AGENT-10, REQ-BILL-07, REQ-SEC-02
- [ ] AC-AGENT-19: 許可ツールの強制がプロンプト注入ではなくツール実行層のサーバー側default-denyで行われ、未許可ツール要求が実行されず監査に残り、外部由来のLLM導出成果（Brief/Outline等）がcontent_role=derivedとして指示位置に置かれず、instruction-in-data detectionが契約検証に含まれる。 ｜ 検証: REQ-AGENT-06, REQ-AGENT-07, REQ-SEC-13
- [ ] AC-AOUI-04: 詳細作業が全画面ワークベンチで、両モードが同一コンポーネントを使う。 ｜ 検証: REQ-AOUI-06
- [ ] AC-AOUI-07: 部門(部屋)・フロア・ペルソナがconfig駆動で拡張でき（SECTION番号連番拡張・7画面外の専門部屋追加可）、サイドメニュー第一階層7項目と安全不変条件は保たれる。 ｜ 検証: REQ-AOUI-07, REQ-AOUI-02, REQ-ADM-09
- [ ] AC-ADM-07: 課金・プラン・原価管理でStripe対応付け・原価/粗利可視化・手動操作の監査ができる。 ｜ 検証: REQ-ADM-02
- [ ] AC-ADM-08: コスト・観測ダッシュボードでpreflight vs actual・token/cost・cache hit率・各fail率を横断監視できる。 ｜ 検証: REQ-ADM-04
- [ ] AC-SEC-13: セキュリティ・観測の受入検証観点が定義される。 ｜ 検証: REQ-SEC-05
- [ ] AC-DUR-01: 開発ユニットと順序が定義される。 ｜ 検証: REQ-DUR-02

## 25. 分類別L1正本の受入トレース

この節は `categories/*.md` の受入条件を横断監査する。分類別正本のACを追加・変更する場合、同一変更で本節を更新する。

### billing-accounting-requirements_v1

- [ ] AC-L1-BILLING-01: 契約時のPrice Catalog versionから商品、価格、付与量、制限、適用期間と、人間代行・汎用AI・SEOツールとの比較範囲および算定根拠を再現できる。 ｜ 検証: REQ-BILLING-01 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-02: Entry・Standardの月契約、Premiumのセルフ年契約、Enterpriseの問い合わせ年契約および年契システム利用料10%割引を再現でき、内部契約と外部Subscriptionの状態差を検出して未検証Webhookで利用権限が直接変更されない。 ｜ 検証: REQ-BILLING-02 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-03: クレジットlotの付与元、期限、消費順、繰越・失効を契約versionどおりに再現できる。 ｜ 検証: REQ-BILLING-03 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-04: 記事生成・リライトがreserve後に開始し、Output Vaultで`deliverable_provided`となった時だけ生成creditをcommitし、提供前の未使用分をreleaseでき、CMS接続待ち・送信再試行・公開成否で二重commitまたは生成creditの取消しが起きない。 ｜ 検証: REQ-BILLING-04 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-05: append-only ledgerから利用可能・予約・消費・失効・返還残高を再構築できる。 ｜ 検証: REQ-BILLING-05 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-06: Stripe Webhookの重複・順不同・再送を処理しても二重請求・二重付与が発生しない。 ｜ 検証: REQ-BILLING-06 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-07: invoice・支払・refundと内部ledgerの差異を自動検出し、根拠付きで解消できる。 ｜ 検証: REQ-BILLING-07 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-08: Upgrade・Downgrade・解約前に差額、適用日、利用枠、保持データへの影響を確認できる。 ｜ 検証: REQ-BILLING-08 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-09: 障害返還・金銭refund・手動調整が元取引、判断根拠、承認者へ追跡でき、二重補償されない。 ｜ 検証: REQ-BILLING-09 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-10: 通貨最小単位、税、丸め、換算rateのversionから請求額を再計算できる。 ｜ 検証: REQ-BILLING-10 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-11: 顧客と内部Roleの課金操作がサーバー側で認可され、Operatorが調整を実行できない。 ｜ 検証: REQ-BILLING-11 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-12: 請求ledgerと原価eventを混在させず、共通分析軸から商品・契約・job別粗利を導出できる。 ｜ 検証: REQ-BILLING-12 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-13: 更新支払失敗後14日間の再試行・通知・機能制限と、支払成功時の復旧を二重付与なしに実行できる。 ｜ 検証: REQ-BILLING-13 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-14: 初期OFFの自動チャージについて残高しきい値・購入額・月間上限または無制限を権限者が設定でき、上限到達・決済失敗時に二重購入せず停止できる。 ｜ 検証: REQ-BILLING-14 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-15: 累計10社までの招待制Trialへ1～3カ月、Standard相当、固定creditを設定でき、通常の15記事承認を適用し、一般公開・枠再利用・明示契約なしの有償化を行わない。 ｜ 検証: REQ-BILLING-15 ｜ 正本: `categories/billing-accounting-requirements_v1.md`
- [ ] AC-L1-BILLING-16: 月・年契約の期間末解約、自動更新通知、14日・利用履歴なしの返金判定、計画Upgrade、更新時Downgradeを再現でき、Enterprise SLAのservice creditを根拠・承認・冪等性付きappend-only調整eventとして追跡できる。 ｜ 検証: REQ-BILLING-16 ｜ 正本: `categories/billing-accounting-requirements_v1.md`

### business-requirements_v1

- [ ] AC-L1-BUS-01: `REQ-UJ-01〜09` の全ジャーニーが、対応する業務循環と業務要求へ追跡できる。 ｜ 検証: REQ-BUS-01 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-02: 各業務に担当、開始契機、入力、判断、成果物、完了条件、次工程または戻り先があり、新規記事向け分析とリライトの成立条件を分離して、GSCまたはKeyword実績だけでは本文変更を伴うリライトRecommendationを生成しない。 ｜ 検証: REQ-BUS-01, REQ-BUS-02 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-03: 月初に目的・重点領域・施策・予算を持つ計画案を作成し、自動運用では期限確定、手動運用では明示確定できる。 ｜ 検証: REQ-BUS-03 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-04: 各業務の手動操作、Event、Cron候補、WorkflowまたはLoopへの配分が識別できる。 ｜ 検証: REQ-BUS-02, REQ-BUS-03, REQ-BUS-04, REQ-BUS-05, REQ-BUS-06, REQ-BUS-07, REQ-BUS-08, REQ-BUS-09, REQ-BUS-10, REQ-BUS-11, REQ-BUS-12, REQ-BUS-13 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-05: 週次上限内の実行予定を自動・手動運用別に選択し、未実行候補を再評価でき、ユーザー割込みには指定を維持した推奨順序を相談できる。 ｜ 検証: REQ-BUS-05 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-06: 月次目的から実行可能量内の方向性配分が作成され、達成保証として扱われない。 ｜ 検証: REQ-BUS-03, REQ-BUS-05, REQ-BUS-06 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-07: 日次判断を承認期限、停止、今週の予定、新規Recommendation、完了・評価の順で処理し、未処理項目へ理由・期限を持たせられる。 ｜ 検証: REQ-BUS-07 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-08: 検証済みPublication Factを持つ公開または更新ページが、Factの`effective_at`を起点に1か月後、3か月後、6か月後の段階評価へ進み、更新時は承認、保護、復元条件を持つ。予約・下書き・帰属確認中だけでは評価を開始しない。 ｜ 検証: REQ-BUS-08, REQ-BUS-09, REQ-BUS-10 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-09: 新規Siteの新規記事15件まで個別承認され、人間承認証拠付き`ai_office_publication` Factだけが件数へ入り、予約、下書き、外部変更、帰属確認中、既存記事、外部記事、リライトが件数から除外される。 ｜ 検証: REQ-BUS-02, REQ-BUS-08 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-10: 例外時に影響範囲、担当、解除条件、期限、戻り先または終端が記録される。 ｜ 検証: REQ-BUS-11, REQ-BUS-12 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-11: 顧客ユーザーと当社内部管理領域が分離され、ManagerとOperatorの操作範囲が区別される。 ｜ 検証: REQ-BUS-12 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-12: 下位の画面、ロジック、データ、連携、技術、権限、非機能、費用、障害要求が対応する業務要求IDを参照する。 ｜ 検証: REQ-BUS-01, REQ-BUS-02, REQ-BUS-03, REQ-BUS-04, REQ-BUS-05, REQ-BUS-06, REQ-BUS-07, REQ-BUS-08, REQ-BUS-09, REQ-BUS-10, REQ-BUS-11, REQ-BUS-12, REQ-BUS-13 ｜ 正本: `categories/business-requirements_v1.md`
- [ ] AC-L1-BUS-13: マスターテナントが一般顧客と同じSEO運用経路でサービス紹介記事を公開し、内部請求なしで実原価・流入・問い合わせ・CVを計測できる。 ｜ 検証: REQ-BUS-13 ｜ 正本: `categories/business-requirements_v1.md`

### cost-requirements_v1

- [ ] AC-L1-COST-01: コストが分類され、tenant/site/workflow/job/stage/attemptへ帰属でき、成果補正用SERP／AIO／listingをProvider Cost TableとPlan Capacityへ追跡できる。 ｜ 検証: REQ-COST-02, REQ-COST-03 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-02: expected/reserved/worst-caseを実行前に算出できる。 ｜ 検証: REQ-COST-04 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-03: 見積式、単価、route、workflowのversionを後から再現できる。 ｜ 検証: REQ-COST-04 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-04: retry、fallback、repair、外部再取得が元ジョブ原価へ含まれる。 ｜ 検証: REQ-COST-05 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-05: soft/hard limitとKill Switchが追加費用発生前に機能する。 ｜ 検証: REQ-COST-06 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-06: recommendationがexpected costとconfidenceを持ち、新規・部分修正・見送りを比較できる。 ｜ 検証: REQ-COST-07 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-07: クレジット対象外処理にも運用原価が記録される。 ｜ 検証: REQ-COST-05 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-08: Provider請求値と内部実績の照合差異を検出できる。 ｜ 検証: REQ-COST-05 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-09: DB・ストレージ・バックアップの増加量と原価をテナント単位で観測できる。 ｜ 検証: REQ-COST-08 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-10: 商品・プラン別粗利を実績原価から算出できる。 ｜ 検証: REQ-COST-09 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-11: 画像の解析cacheによる削減と新規output原価を分離し、画像job単位で見積・実績を算出できる。 ｜ 検証: REQ-COST-10 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-12: 外部APIと自己管理LLMの総提供原価・品質・latency・失敗率を同一route単位で比較し、品質基準内で低コストrouteへ段階移行できる。 ｜ 検証: REQ-COST-11 ｜ 正本: `categories/cost-requirements_v1.md`
- [ ] AC-L1-COST-13: 原価の観測・帰属・予算停止と顧客への請求・残高変更が分離され、原価記録から請求台帳を直接変更できない。 ｜ 検証: REQ-COST-01 ｜ 正本: `categories/cost-requirements_v1.md`

### customer-organization-governance-requirements_v1

- [ ] AC-L1-ORG-01: 法人・個人のどちらも必須の契約組織を持ち、その配下に自由名称・自由階層の組織ノードとSiteを構成できる。 ｜ 検証: REQ-ORG-01 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-02: 同一ユーザーへ契約者／サイトオーナー／ユーザーのいずれかと業務タグを付与できる。 ｜ 検証: REQ-ORG-02 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-03: UI非表示だけでなくAPI側で同一Permission判定が強制される。 ｜ 検証: REQ-ORG-03 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-04: Site指定なしでは全Site、指定ありでは指定Siteだけへアクセスでき、Site指定解除前に全Site化を確認できる。 ｜ 検証: REQ-ORG-04 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-05: 契約者／サイトオーナー／ユーザーと4つの業務タグだけで、契約管理、Site管理、SEO業務、閲覧を制御できる。 ｜ 検証: REQ-ORG-05 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-06: 多段階承認、差し戻し、期限、代理承認が監査される。 ｜ 検証: REQ-ORG-06 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-07: 部門・Site予算の超過が実行前に停止または承認待ちになる。 ｜ 検証: REQ-ORG-07 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-08: 個人契約が本人を契約者とする初期組織から法人契約と同じ機能を利用できる。 ｜ 検証: REQ-ORG-09 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-09: 退職・契約終了時にアクセスが失効し、成果物と履歴は失われない。 ｜ 検証: REQ-ORG-10 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-10: 組織・Site移管前に権限、データ、請求への影響が表示される。 ｜ 検証: REQ-ORG-11 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-11: 契約者とサイトオーナーが担当範囲の権限棚卸しを実行し、是正履歴を確認できる。 ｜ 検証: REQ-ORG-12 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-12: 所属・権限・承認・予算変更の実行者、理由、期限、差分を監査できる。 ｜ 検証: REQ-ORG-12 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`
- [ ] AC-L1-ORG-13: Site Assignmentによる全Site／指定Siteの可視範囲が、画面とAPIの双方で同じ結果になる。 ｜ 検証: REQ-ORG-08 ｜ 正本: `categories/customer-organization-governance-requirements_v1.md`

### data-requirements_v1

- [ ] AC-L1-DATA-01: 主要データの所有者、正本、tenant/site境界が定義される。 ｜ 検証: REQ-DATA-01 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-02: 見出し構造、要点、イベント発生ポイントを機械抽出したArticle Summaryだけで記事の役割・不足・推薦根拠を判定できる。 ｜ 検証: REQ-DATA-02 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-03: DB、ログ、キュー、object storageを検査し、本文を含むobjectがArticle Read／Workspace、既定14日のOutput Vault、最長3か月のRecovery Backupだけに用途・期限・tenant／Siteを固定して存在し、期限削除と削除証跡が機能し、通常DB・学習・分析へ本文が複製されない。 ｜ 検証: REQ-DATA-03 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-04: stale・incompleteな派生値を識別し再取得できる。 ｜ 検証: REQ-DATA-04 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-05: 未変更記事が再取得・再解析されない。 ｜ 検証: REQ-DATA-05 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-06: Recommendation Itemから理由、費用、リスクを表示できる。 ｜ 検証: REQ-DATA-06 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-07: 施策、獲得キーワード、順位、確実なページ遷移・CV、公開・更新の遍歴を追跡でき、Trackerの恒久保存が日別集計と欠損・除外countに限定され、user／session／複数ページ経路の保存tableが存在しない。 ｜ 検証: REQ-DATA-07 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-08: 保存量と索引量が設定上限を超えて無制限に増加しない。 ｜ 検証: REQ-DATA-08 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-09: エクスポート、削除、移管の対象と結果を監査できる。 ｜ 検証: REQ-DATA-09 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-10: 横断集計から顧客、Site、URLを特定できない。 ｜ 検証: REQ-DATA-10 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-11: Siteと記事へ主担当・関連の業界／業種を保持でき、構造化横断軸と非保証の推定根拠を持ち、ユーザー修正を正本・較正データとして保持し、ユーザー追加分類が標準Catalogを直接変更しない。 ｜ 検証: REQ-DATA-11 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-12: 原画像を無期限複製せず、版付きImage Style Profile、Featured Image Pattern、解析cache、生成画像の来歴と接続中CMSのMedia参照を保持できる。 ｜ 検証: REQ-DATA-12 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-13: マスターテナントの自社実績と明示許諾済みShowcase Snapshotだけを紹介記事・デモへ使用し、顧客横断参照なしに許諾撤回を反映できる。 ｜ 検証: REQ-DATA-13 ｜ 正本: `categories/data-requirements_v1.md`

### design-experience-requirements_v1

- [ ] AC-L1-DESIGN-01: 通常ビューとAgent Officeビューが同一jobの業務状態を一致して表示しつつ、Office固有の部屋・会話・詳細設定を保持できる。 ｜ 検証: REQ-DESIGN-01 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-02: 非専門者が主要画面で次の操作・状態・理由・影響・費用を内部実装用語なしに理解できる。 ｜ 検証: REQ-DESIGN-02 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-03: Recommendationの根拠、優先度成分、unknown、再評価条件をロジック結果どおり表示できる。 ｜ 検証: REQ-DESIGN-03 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-04: desktopの主要操作がkeyboard、screen reader、reduced motionで完了でき、狭幅でも重要状態を失わず、初期mobile非対応範囲を誤表示しない。 ｜ 検証: REQ-DESIGN-04 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-05: 長時間処理から離脱・復帰しても相関IDと実stageが維持され、架空進捗を表示しない。 ｜ 検証: REQ-DESIGN-05 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-06: UI Copy Registryから状態・操作・警告をlocale別に一貫表示できる。 ｜ 検証: REQ-DESIGN-06 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-07: 画像非表示でも主要情報と操作が失われず、画像assetにalt・size・loading方針が適用される。 ｜ 検証: REQ-DESIGN-07 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-08: Agent Office演出が実eventと一致し、演出OFF・reduced motionでも同じ業務を完了できる。 ｜ 検証: REQ-DESIGN-08 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-09: SEO非専門者が通常ビューのRecommendation中心の簡単操作だけで主要業務を完了でき、詳しく確認・微調整したい場合は同じContextでOfficeの玄人向け詳細分析・運用へ段階的に移動できる。両Viewが同じProjection・認可・Domain Commandを共有し、Office利用や定型操作でLLMを必須にしない。 ｜ 検証: REQ-DESIGN-09 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-10: Officeを標準3D、簡略3D、軽量2Dへ切り替えても、同じTask状態・詳細・会話・操作を利用できる。 ｜ 検証: REQ-DESIGN-10 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-11: Officeでは実entityに基づくTask実行Loopと計測・評価・学習の詳細Graphを玄人向けに横断分析でき、選択式操作と型付きProposalから共通Commandへ接続できる。 ｜ 検証: REQ-DESIGN-11 ｜ 正本: `categories/design-experience-requirements_v1.md`
- [ ] AC-L1-DESIGN-12: 初期リリースがdesktop標準として成立し、後続mobile Chatへ通知・確認・説明・修正指示を追加してもdesktop業務の正本を分岐させない。 ｜ 検証: REQ-DESIGN-12 ｜ 正本: `categories/design-experience-requirements_v1.md`

### growth-upsell-requirements_v1

- [ ] AC-L1-UPSELL-01: 提案がcapacity/execution/governance/support/economic fitへ分解される。 ｜ 検証: REQ-UPSELL-03, REQ-UPSELL-04 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-02: 障害・争議・解約中と却下cooldown中に提案されない。 ｜ 検証: REQ-UPSELL-05 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-03: 現プラン内の代替策とダウングレードを含む適正化が先に比較される。 ｜ 検証: REQ-UPSELL-04 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-04: 未採用recommendationを全実行する過大見積にならない。 ｜ 検証: REQ-UPSELL-04, REQ-UPSELL-07 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-05: 料金、適用日、日割り、増える機能、増えない機能が表示される。 ｜ 検証: REQ-UPSELL-06 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-06: 購入・プラン変更が権限者の明示操作なしに確定しない。 ｜ 検証: REQ-UPSELL-06 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-07: 同一提案の回数上限とcooldownが機能する。 ｜ 検証: REQ-UPSELL-05 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-08: 全PlanのFAQチャットから根拠付き回答または適切な有人引継ぎへ到達でき、Premiumの優先対応とEnterpriseの個別SLAを区別し、営業連携へ本文・秘密情報が渡らない。 ｜ 検証: REQ-UPSELL-08 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-09: 購入率だけでなく継続・利用・粗利・苦情・解約が計測される。 ｜ 検証: REQ-UPSELL-09 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-10: 製品不具合や設定不備を上位契約で解決させない。 ｜ 検証: REQ-UPSELL-01 ｜ 正本: `categories/growth-upsell-requirements_v1.md`
- [ ] AC-L1-UPSELL-11: 容量接近時にEntry／StandardへPremiumを提示し、Premium／EnterpriseではPlan変更と追加容量を比較して権限者が選択できる。 ｜ 検証: REQ-UPSELL-02, REQ-UPSELL-04, REQ-UPSELL-06 ｜ 正本: `categories/growth-upsell-requirements_v1.md`

### incident-warranty-requirements_v1

- [ ] AC-L1-IRG-01: 障害をSEV-1〜4へ一貫した基準で分類できる。 ｜ 検証: REQ-IRG-02 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-02: tenant/site/workflow/provider/全体の各粒度で封じ込めできる。 ｜ 検証: REQ-IRG-04 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-03: 顧客通知とステータス更新に確認済み事実・影響・次回更新予定が含まれる。 ｜ 検証: REQ-IRG-05 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-04: checkpoint、rollback、PITR、テナント復元の選択基準がある。 ｜ 検証: REQ-IRG-06 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-05: 復旧がE2E・台帳整合・越境負テストで確認される。 ｜ 検証: REQ-IRG-06 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-06: システム障害のクレジット返還と金銭調整が監査可能である。 ｜ 検証: REQ-IRG-07 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-07: SLA補償とSEO成果非保証が対外表示で区別される。 ｜ 検証: REQ-IRG-07 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-08: 障害再開・成果未提供の補償と、ユーザー希望の有償再生成・安心保証の非成果保証を区別できる。 ｜ 検証: REQ-IRG-06, REQ-IRG-07 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-09: SEV-1/2の恒久対策が要求・設計・テストへ戻される。 ｜ 検証: REQ-IRG-08 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-10: 復旧・停止・調整演習が記録される。 ｜ 検証: REQ-IRG-09 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-11: 外部サービス起因でも回避策・再試行・説明が提供される。 ｜ 検証: REQ-IRG-04, REQ-IRG-05, REQ-IRG-06 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-12: incident recordに検知時刻、対象、症状、検知元、correlation key、暫定severityが記録され、alert stormが同一incidentへ集約される。 ｜ 検証: REQ-IRG-03 ｜ 正本: `categories/incident-warranty-requirements_v1.md`
- [ ] AC-L1-IRG-13: 障害対応が検知、分類、封じ込め、連絡、復旧、補償、再発防止を一貫して追跡し、SEO成果保証とは区別される。 ｜ 検証: REQ-IRG-01 ｜ 正本: `categories/incident-warranty-requirements_v1.md`

### integration-requirements_v1

- [ ] AC-L1-INT-01: 初期Trackerが本文・フォーム値・user／session ID・複数ページpathを送らず、version付き契約でpage view、単ホップ遷移、明示CTA、指定CVを取得でき、WordPressではThin Plugin、非WordPressではscriptで設置できる。 ｜ 検証: REQ-INT-01 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-02: Trackerとイベントschemaを互換性確認後に段階更新・rollbackできる。 ｜ 検証: REQ-INT-02 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-03: 外部分析連携が停止しても初期の自前計測を継続できる。 ｜ 検証: REQ-INT-03 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-04: GSC／URL Inspectionのクォータとavailabilityを保持してインデックス状態を取得し、取得不能を正常扱いせずユーザー対応へ接続できる。 ｜ 検証: REQ-INT-04 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-05: 認証済みCore RESTと投稿権限がある場合だけ記事を送信し、未接続・読取専用・認証切れ・権限不足時は送信を止めたまま分析・生成・持ち出しを継続できる。 ｜ 検証: REQ-INT-05 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-06: CMS非依存Publication ContractとWordPress Adapterが分離され、未検証CMSを対応済みと表示せず、追加Adapterの実環境検証条件が定義されている。 ｜ 検証: REQ-INT-06 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-07: 許可画像を安全に取得してGPT Image 2の生成・編集へ接続でき、画像工程の失敗を本文Workflowから分離できる。 ｜ 検証: REQ-INT-07 ｜ 正本: `categories/integration-requirements_v1.md`

### logic-requirements_v1

- [ ] AC-L1-LOGIC-01: Siteごとに月次目的を単純選択し、未実行候補へ方向性としての施策配分が計算され、達成保証として表示されない。 ｜ 検証: REQ-LOGIC-01 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-02: 実績不足時に根拠のない数値を表示せず、unknownと再評価条件を返す。 ｜ 検証: REQ-LOGIC-02 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-03: 推薦採用からGeneration Outcome、CMS Delivery、公開・効果計測までを同一相関IDかつ別状態で追跡し、新規記事とリライトのどちらでも成果提供後のCMS障害を生成失敗へ戻さず再開できる。 ｜ 検証: REQ-LOGIC-03 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-04: 人間承認証拠付き新規`ai_office_publication` Fact 15件、版付き同意、事前許可のいずれかが欠ける場合、または停止条件下で自動投稿が実行されず、予約・下書き・API受付・外部変更・帰属確認中・リライトを15件へ算入しない。 ｜ 検証: REQ-LOGIC-04 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-05: 急変対象が即時推薦されず要監視キューへ移り、ユーザー指定予定は継続し、システム予定は選択理由と現在順位により差し替えまたは続行される。 ｜ 検証: REQ-LOGIC-05 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-06: プライマリ＋セカンダリの割当クラスタへの順位付与を評価し、順位なしは自動修復せず診断内容をユーザーへエスカレーションし、CVなし単体を失敗とせず、十分な母数がある場合だけCVRを評価できる。 ｜ 検証: REQ-LOGIC-06 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-07: 直近1か月で1,000クリック到達後も記事単位で予測可否を判定し、予測可能数・ロック数・不足データを返す。 ｜ 検証: REQ-LOGIC-07 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-08: 投稿単位のCompatibility Matrixと対象operationから出力経路を再現でき、unknown時も既存記事の危険な上書きだけを保留できる。 ｜ 検証: REQ-LOGIC-08 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-09: 許可済み装飾だけを適用し、互換性不足時に本文を変更せず装飾なしまたは互換パーツへ縮退できる。 ｜ 検証: REQ-LOGIC-09 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-10: Pattern・Profile・記事slot・CMS size・model versionから画像生成を再現し、技術的不成立とadvisoryを区別できる。 ｜ 検証: REQ-LOGIC-10 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-11: Provider課金前に入力・固定商品枠・請求reserve・接続・技術上限を判定し、readyまたは再開条件を返せる。 ｜ 検証: REQ-LOGIC-11 ｜ 正本: `categories/logic-requirements_v1.md`

### measurement-operations-requirements_v1

- [ ] AC-L1-MEASURE-01: 同一のページ遷移から再現可能なイベント結果が得られる。 ｜ 検証: REQ-MEASURE-01 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-02: 複数CV Goalを検索インテント・月次目的・記事目的へ接続し、定義versionと重複規則に従ってCVを計上し、CTA施策を変更月と累積で評価できる。 ｜ 検証: REQ-MEASURE-02 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-03: 生イベントが日×URL、単ホップ遷移、CTA、URL×Goalへ集約後に期限削除され、user／session／複数ページ経路を残さず、記事遍歴と施策評価は維持される。 ｜ 検証: REQ-MEASURE-03 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-04: 単一の非同期Trackerでpage view、単ホップ遷移、明示CTA、到達URL CVを計測でき、同一event／CV到達の短期dedupeが機能し、未提供の高度計測を読み込まずページ表示を阻害しない。 ｜ 検証: REQ-MEASURE-04 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-05: 主要経路のSLO、error、latency、queue、Provider、cost、freshnessをdashboardから相関調査できる。 ｜ 検証: REQ-MEASURE-05 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-06: alertが影響・owner・runbookを持ち、storm集約と未応答escalationを検証できる。 ｜ 検証: REQ-MEASURE-06 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-07: 定常復旧操作を本番DB直接更新なしでrunbookどおり実行・rollback・監査できる。 ｜ 検証: REQ-MEASURE-07 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-08: backup restore、保持、TTL、cleanupの失敗・容量超過を検知できる。 ｜ 検証: REQ-MEASURE-08 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-09: canaryの新旧KPIを比較し、停止条件から対象versionをrollbackできる。 ｜ 検証: REQ-MEASURE-09 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-10: capacity予測から対話API優先のscale・rate・batch制御を実行できる。 ｜ 検証: REQ-MEASURE-10 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-11: support事例を相関IDと解決versionへ接続し、要求・runbook・テストへ還流できる。 ｜ 検証: REQ-MEASURE-11 ｜ 正本: `categories/measurement-operations-requirements_v1.md`

### non-functional-requirements_v1

- [ ] AC-L1-NFR-01: 推薦再計算中でも画面シェルと既存データを操作できる。 ｜ 検証: REQ-NFR-01 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-02: Core Web Vitalsと主要画面・ジョブ受付のP50/P75/P95を継続計測できる。 ｜ 検証: REQ-NFR-02 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-03: 主要画面の配信量、API、query、走査行数に予算がある。 ｜ 検証: REQ-NFR-03 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-04: バッチ負荷時も対話APIの性能目標を維持できる。 ｜ 検証: REQ-NFR-04 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-05: 基準容量で保存量が設定上限内に収まる。 ｜ 検証: REQ-NFR-05 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-06: 商用開始前にSLO、error budget、通知経路が確定している。 ｜ 検証: REQ-NFR-06 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-07: 自動回復可能な障害は即時復旧を試行し、人間・金銭対応は定義した営業日期限内に完了する。 ｜ 検証: REQ-NFR-07 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-08: 外部・個別機能障害時も非依存機能、既存データ閲覧、状態確認を継続できる。 ｜ 検証: REQ-NFR-08 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-09: Providerまたは実行基盤を責務境界内で交換できる。 ｜ 検証: REQ-NFR-09 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-10: 通常運用が本番DB直接更新を必要としない。 ｜ 検証: REQ-NFR-10 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-11: 主要操作のキーボード・focus・contrast検査を通過する。 ｜ 検証: REQ-NFR-11 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-12: 性能予算の重大回帰がリリースゲートで検出される。 ｜ 検証: REQ-NFR-12 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-13: 相関IDから対象顧客・Site・記事・ジョブ・stage・外部依存の原因候補へ到達でき、MTTD/MTTA/MTTI/MTTRを計測できる。 ｜ 検証: REQ-NFR-13 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-14: AWS上でmetrics、logs、traces、queue滞留、DLQ、edge cache hit率をdashboardとalertから確認できる。 ｜ 検証: REQ-NFR-14 ｜ 正本: `categories/non-functional-requirements_v1.md`
- [ ] AC-L1-NFR-15: 管理規模・保存量・取込量・計算量・瞬間負荷をDimension別に計測・制限し、上限近傍tenantの処理中も他tenantの対話・公開・課金経路を維持できる。 ｜ 検証: REQ-NFR-15 ｜ 正本: `categories/non-functional-requirements_v1.md`

### platform-administration-control-requirements_v1

- [ ] AC-L1-PAC-01: Admin、Manager、Operatorの管理画面とAPI権限が分離され、Admin以外がManager権限を付与できず、Operatorと顧客ユーザーが顧客データ変更へ到達できない。 ｜ 検証: REQ-PAC-01 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-02: 機能を対象、割合、期間別に段階公開しロールバックできる。 ｜ 検証: REQ-PAC-02 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-03: コード変更なしで定義済みUI文言・状態・上限を変更できる。 ｜ 検証: REQ-PAC-03 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-04: UIを直接呼び出さなくてもサーバー側で同じ操作制限が働く。 ｜ 検証: REQ-PAC-04 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-05: 承認、公開、予算、実行条件を版管理して変更できる。 ｜ 検証: REQ-PAC-05 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-06: ジョブ再実行で二重課金・二重公開が発生しない。 ｜ 検証: REQ-PAC-06 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-07: 推薦設定変更の対象と予測影響を適用前に確認できる。 ｜ 検証: REQ-PAC-07 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-08: 品質・生成設定の劣化を検証し公開を阻止できる。 ｜ 検証: REQ-PAC-08 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-09: 支援操作で秘密情報・本文全文・プロンプト全文が表示されない。 ｜ 検証: REQ-PAC-09 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-10: 障害時に機能停止、通知、復旧を同一インシデントへ記録できる。 ｜ 検証: REQ-PAC-10 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-11: 本番変更に差分、理由、承認、適用、Rollback記録が残る。 ｜ 検証: REQ-PAC-11 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-12: いずれの内部Roleでも安全不変条件を解除できない。 ｜ 検証: REQ-PAC-12 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-13: 本番・非本番の権限、秘密情報、設定が分離され、管理操作を環境別に監査できる。 ｜ 検証: REQ-PAC-13 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-14: Planをコード変更なしに追加・複製・改版・販売終了でき、価格・契約・利用枠・機能・品質・バックアップを設定し、既存契約を維持したまま対象と適用日を指定して変更・Rollbackできる。 ｜ 検証: REQ-PAC-14 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`
- [ ] AC-L1-PAC-15: internalマスターテナントと累計10社までの1～3カ月TrialをAdminだけが発行・停止でき、終了枠を再利用せず、通常の品質・承認・境界・監査を迂回できない。 ｜ 検証: REQ-PAC-15 ｜ 正本: `categories/platform-administration-control-requirements_v1.md`

### screen-operation-requirements_v1

- [ ] AC-L1-SCREEN-01: Dashboardで承認期限、停止、今週の予定、新規Recommendation、完了・評価の順に判断項目を確認し、月次計画と週次予定を運用modeに応じて確定できる。WordPress Thin Pluginを選ぶ場合はSaaS側からZIP取得、Siteペアリング、接続・version・署名付き更新状態を確認できる。 ｜ 検証: REQ-SCREEN-01 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-02: 推薦一覧で理由、変更、費用、リスクを本文取得なしに把握できる。 ｜ 検証: REQ-SCREEN-02 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-03: 採否・保留理由と一括操作の個別検証結果を記録でき、ユーザー割込みを維持したまま影響と推奨順序を相談できる。 ｜ 検証: REQ-SCREEN-03 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-04: 長時間ジョブ中も他画面を操作し後から復帰できる。 ｜ 検証: REQ-SCREEN-04 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-05: 読込、空、stale、権限不足、連携切断、エラーを識別できる。 ｜ 検証: REQ-SCREEN-05 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-06: 組織・権限変更前に影響差分を確認できる。 ｜ 検証: REQ-SCREEN-06 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-07: 顧客向け通常ビュー／Agent Officeと内部管理面が分離され、内部管理面で対象環境・顧客・代理操作状態を誤認しない。 ｜ 検証: REQ-SCREEN-07 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-08: UI操作可否とAPI認可の結果が一致する。 ｜ 検証: REQ-SCREEN-08 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-09: 推薦から効果確認まで対象と根拠が維持される。 ｜ 検証: REQ-SCREEN-09 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-10: 大量一覧が全件初期取得を行わない。 ｜ 検証: REQ-SCREEN-10 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-11: Agent Officeビューとユーザー向けTask Historyが実ジョブ・イベントと一致し、内部監査ログ・trace・秘密情報を顧客へ表示しない。 ｜ 検証: REQ-SCREEN-11 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-12: 文体の組合せと個別Site言い回し学習のON/OFFを設定でき、ON時だけサンプル記事10本を使用し、10本未満は暫定状態を確認できる。 ｜ 検証: REQ-SCREEN-12 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-13: 急変対象が通常推薦と分離され、1か月・3か月・6か月評価の状態と既存予定の継続を区別できる。 ｜ 検証: REQ-SCREEN-13 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-14: Siteへ業界／業種の2階層を複数設定・追加でき、複数設定時は横断軸を明記し、適用中の業界priorとSite固有補正の状態を確認できる。 ｜ 検証: REQ-SCREEN-14 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-15: 新規記事とリライトの別Workflow、freeze成果、限定Repair、差分、Article Read、Generation Outcome、CMS Delivery、Publication Decision、承認、Publication Job、Publication Fact、評価対象登録、追加見積を同一相関IDで区別して確認でき、予約・API受付・外部変更・帰属確認中を公開成功またはAI Office実績として表示しない。 ｜ 検証: REQ-SCREEN-15 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-16: 上位機能を価値の分かるロック状態で表示し、Plan条件とデータ不足を区別して解放条件・現プランの代替操作を確認できる一方、画面迂回やAPI直接呼出しでは実行できず、Entryの自動投稿は15記事承認までの解放進捗を表示できる。 ｜ 検証: REQ-SCREEN-16 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-17: Capacityの使用量・上限・到達予測と、自動構築期間の進捗・利用可能機能・制限理由・完了見込みを確認できる。 ｜ 検証: REQ-SCREEN-17 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-18: 通常ビューでRecommendation中心の要約・簡単操作を行え、Agent Officeで同じProjectionを使う玄人向け詳細分析・設定・Task操作を行え、選択式操作は決定論Service、自由文は必要時だけLLMを使い、確認済み共通Commandの結果が両Viewへ同期される。 ｜ 検証: REQ-SCREEN-18 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-SCREEN-19: Task完了・確認待ち等をWeb popupと永続通知Centerで確認でき、担当者割当なしでもRole／Scope・購読設定から通知され、event別のON／OFFと対象業務への遷移が機能する。生成成果提供、CMS下書き、公開処理引渡し、予約、Publication Fact、評価登録を別文言で表示し、予約・外部変更・帰属確認中を公開完了通知にしない。 ｜ 検証: REQ-SCREEN-19 ｜ 正本: `categories/screen-operation-requirements_v1.md`

### security-access-requirements_v1

- [ ] AC-L1-ACCESS-01: 顧客ユーザーの資格情報で開発管理画面・APIへアクセスできない。 ｜ 検証: REQ-ACCESS-01 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-02: Operatorが顧客データ変更、本文、秘密情報へアクセスできない。 ｜ 検証: REQ-ACCESS-02 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-03: AdminだけがManagerの顧客アクセスを付与でき、許可範囲外と期限後のアクセスが拒否される。 ｜ 検証: REQ-ACCESS-03 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-04: sessionがUser・active organization・Role・認証強度へ束縛され、切替・失効後に再認可される。 ｜ 検証: REQ-ACCESS-04 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-05: SiteSandboxContext欠落・不一致時にAPI、job、Executor、Adapterがdefault-denyになる。 ｜ 検証: REQ-ACCESS-05 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-06: Repository強制点とRLSの越境queryが拒否され、管理画面も迂回できない。 ｜ 検証: REQ-ACCESS-06 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-07: 秘密情報が接続単位で暗号化・rotationされ、ログ・trace・画面へ原文表示されない。 ｜ 検証: REQ-ACCESS-07 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-08: 重要操作がstep-upなしではAPIからも拒否される。 ｜ 検証: REQ-ACCESS-08 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-09: 招待tokenの再利用・期限後利用を拒否し、契約者の回復が本人確認と監査を伴う。 ｜ 検証: REQ-ACCESS-09 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-10: Executorが本番DBへ直接接続できず、許可toolのSite scopeを越えられない。 ｜ 検証: REQ-ACCESS-10 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-11: 代理操作のacting principalとcustomer contextを監査上区別できる。 ｜ 検証: REQ-ACCESS-11 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-12: 全data pathの越境負テストがCIまたはrelease gateで通過する。 ｜ 検証: REQ-ACCESS-12 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-13: マスターテナントが顧客tenantを直接参照できず、許諾済みShowcase Snapshotの作成・公開・撤回だけを監査可能な専用経路で実行できる。 ｜ 検証: REQ-ACCESS-13 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-14: 画面、API、worker、Agent toolが同じprincipal・action・resource・contextとpolicy versionから同じ認可結果を返し、不明入力を拒否する。 ｜ 検証: REQ-ACCESS-14 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-15: 顧客の基本権限・業務タグと内部Roleが分離され、契約者／サイトオーナーやFeature Flagでtenant・Membership境界を上書きできない。 ｜ 検証: REQ-ACCESS-15 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-16: 自動運用jobが委任範囲内だけで副作用を実行し、設定者の権限喪失・Site移管・Kill Switch後は公開等を継続しない。 ｜ 検証: REQ-ACCESS-16 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-17: 本文一時取得、内部観測、Provider送信、匿名較正、Showcase利用が別Permission・目的・保持policyとして強制される。 ｜ 検証: REQ-ACCESS-17 ｜ 正本: `categories/security-access-requirements_v1.md`
- [ ] AC-L1-ACCESS-18: break-glassが重大incidentに限定され、短期失効・強認証・対象限定・事後reviewを伴い、安全不変条件を解除できない。 ｜ 検証: REQ-ACCESS-18 ｜ 正本: `categories/security-access-requirements_v1.md`

### technical-architecture-requirements_v1

- [ ] AC-L1-TECH-01: L2構成図で責務、所有データ、同期・非同期境界が追跡できる。 ｜ 検証: REQ-TECH-01 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-02: 通常DBに本文全文、生HTML、長い外部レスポンスが保存されない。 ｜ 検証: REQ-TECH-02 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-03: 本文一時処理の成功・失敗双方で期限内削除が検証される。 ｜ 検証: REQ-TECH-03 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-04: 未変更記事・キーワードが再解析対象から除外される。 ｜ 検証: REQ-TECH-04 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-05: 長時間処理が同期APIを占有せず状態を追跡できる。 ｜ 検証: REQ-TECH-05 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-06: ジョブ再起動後も状態と固定versionから処理を継続できる。 ｜ 検証: REQ-TECH-06 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-07: 再試行で二重課金・二重公開・二重通知が発生しない。 ｜ 検証: REQ-TECH-07 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-08: 結果整合処理の失敗を検出し再処理・照合できる。 ｜ 検証: REQ-TECH-08 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-09: DB、キャッシュ、キュー、検索、ログでtenant/site境界が検証される。 ｜ 検証: REQ-TECH-09 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-10: 商用API・自己管理モデルを共通Capability Contractで評価し、Provider停止・原価変化・品質差に応じて設定変更で停止・切替・fallbackできる。 ｜ 検証: REQ-TECH-10 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-11: API・イベントのversion互換性が契約テストで検証される。 ｜ 検証: REQ-TECH-11 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-12: 実行中ジョブが設定変更の影響を受けず再現できる。 ｜ 検証: REQ-TECH-12 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-13: キャッシュ、キュー、一時オブジェクトに容量・期限・異常監視がある。 ｜ 検証: REQ-TECH-13 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-14: 非本番から本番データ・秘密情報・課金経路へ到達できない。 ｜ 検証: REQ-TECH-14 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-15: アプリ・DB変更を段階適用し、失敗時に復旧できる。 ｜ 検証: REQ-TECH-15 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-16: 相関IDからAPI、ジョブ、外部連携、AI実行を追跡できる。 ｜ 検証: REQ-TECH-16 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-17: 具体的な技術選定と例外にADRまたは期限付き記録がある。 ｜ 検証: REQ-TECH-17 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-18: 技術的禁止事項を自動検査またはレビューゲートで検出できる。 ｜ 検証: REQ-TECH-18 ｜ 正本: `categories/technical-architecture-requirements_v1.md`
- [ ] AC-L1-TECH-19: AWS上の代表E2Eで相関IDがAPI、queue、worker、Provider、CMS Adapter結果まで維持され、初期WordPress Adapterを含むDLQから原因確認と安全なredriveができる。 ｜ 検証: REQ-TECH-19 ｜ 正本: `categories/technical-architecture-requirements_v1.md`

## 26. 詳細ロジック受入トレース

### Keyword Dynamic Recommendation

- [ ] AC-L1-KRL-01: 市場影響3軸と戦略必要性3軸が独立して算出・保存される。 ｜ 検証: REQ-KRL-01, REQ-KRL-04, REQ-KRL-05 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-02: unknownが0扱いされず、availabilityとconfidenceに反映される。 ｜ 検証: REQ-KRL-02, REQ-KRL-03, REQ-KRL-04 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-03: strategy mix変更だけで優先順位が再計算され、元の観測値は変わらない。 ｜ 検証: REQ-KRL-05, REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-04: 総合点から各加点・減点と根拠を再現できる。 ｜ 検証: REQ-KRL-06, REQ-KRL-08 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-05: 充足済みキーワードに新規記事を重複推薦しない。 ｜ 検証: REQ-KRL-07 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-06: 急変・変動中の対象が要監視キューへ分離され、cooldown中、効果測定待ちとともに自動実行対象にならない。 ｜ 検証: REQ-KRL-07, REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-07: 入力更新時に対象グループだけが増分再計算される。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-08: recommendationからTicket/Edit Planへ対象・目的・根拠・予算が引き継がれる。 ｜ 検証: REQ-KRL-08 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-09: UIで6成分と順位変動理由を確認できる。 ｜ 検証: REQ-KRL-06, REQ-KRL-08 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-10: 同条件で却下された候補の反復が抑制される。 ｜ 検証: REQ-KRL-10 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-11: 検索ボリュームと表示回数の変化から季節性・需要変化を分離し、AIO・リスティング出現率による自然検索面の縮小を記事固有の悪化へ直接帰属させない。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-INT-08: SEO／AIクローラーを共通契約で用途別に観測し、初期の外形診断と後続の検証済みserver／edge log実測を混同せず、client-side Trackerなしでも取得状態を判定できる。 ｜ 検証: REQ-INT-08 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-09: Siteごとに許可済みの複数Article読取り経路を共通Snapshotへ正規化し、完全性・鮮度・成功率・負荷・費用からprimary／standbyを選択して、差分対象だけを取得し、障害時にflappingなくfailoverできる。 ｜ 検証: REQ-INT-09 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-INT-10: Generation OutcomeがQA済み成果、Output Vault、`deliverable_provided`、生成credit commitを一意に結び、CMS Deliveryがそれを参照して接続・権限・一時障害後も同一Deliveryとidempotency keyで再開できる。成果提供、CMS下書き、公開／更新を別状態として追跡し、再生成、二重reserve／commit、二重下書きを起こさず、外部反映確認後だけDeliveryをverifiedにできる。 ｜ 検証: REQ-INT-10 ｜ 正本: `categories/integration-requirements_v1.md`
- [ ] AC-L1-LOGIC-12: Site・用途ごとに許可済みArticle読取り経路のprimary／standbyを同じPolicy入力から再現し、差分取得、負荷抑制、連続失敗時のfailover、回復時のflapping抑止、全経路不成立の案内を実行できる。 ｜ 検証: REQ-LOGIC-12 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-13: 公開記事の変更を機械比較でCTA・SEO評価・error・軽微変更へ分類し、必要な評価または診断だけを起動して、単発取得失敗を削除や成果悪化として扱わず、LLMを意味派生が必要な処理だけへ限定できる。 ｜ 検証: REQ-LOGIC-13 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-LOGIC-14: 複数CV Goal、検索インテント、記事目的から記事ごとのCVまたは認知貢献方向を割り当て、CTA partとlink先を既存QA・Placement・Automation・限定Repair Ticketへ接続し、CTA専用Agent・Writing Ticket・作業Packを増やさず実行できる。 ｜ 検証: REQ-LOGIC-14 ｜ 正本: `categories/logic-requirements_v1.md`
- [ ] AC-L1-MEASURE-12: SEO／AIについて取得性と表示性を二軸表示し、内部では取得・候補化・順位／引用／言及・流入・CVを分離して、4象限から異なる診断へ接続できる。 ｜ 検証: REQ-MEASURE-12 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-13: Recommendation採用に相関する`ai_office_publication`のPublication FactでActivationへ到達し、新規公開／実質本文更新では同Factから`seo_content` Laneの評価基準値・`effective_at`起点・1／3／6カ月予定を登録した時だけLoop完了として月次distinct Siteを算出できる。CTA・内部link・認知は月次／累積Laneへ分離し、SEO Laneをresetせず、予約・下書き・API受付・外部変更・帰属確認中を除外する。強いsignalだけの継続稼働、Activation後30日の休眠、契約解約だけの月次churnを同じevent契約から再現できる。 ｜ 検証: REQ-MEASURE-13 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-MEASURE-14: 顧客成果をSite／Cluster／記事の3階層で保持し、通常ビューでは要約・簡単操作、Agent Officeでは同じProjectionによる玄人向け詳細分析として表示できる。Publication Factから`seo_content / cta_cv / internal_link / awareness`の別Lane、各起点・周期、AI Office実績・外部変更・帰属確認中、復元availabilityを再現し、CTA／内部linkだけでSEO Laneをresetしない。GSC順位段階とprotect flag、市場補正3分類、自前Trackerの単ホップCVをsource・rule version付きで再現できる。 ｜ 検証: REQ-MEASURE-14 ｜ 正本: `categories/measurement-operations-requirements_v1.md`
- [ ] AC-L1-DATA-14: SEO／AI Botの外形診断・実crawlと回答面観測をprovenance付きで分離保持し、生access logを期限後に日次集約へロールアップして削除できる。 ｜ 検証: REQ-DATA-14 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-DATA-15: 本文変更を伴うリライト／記事置換が、有効で完全なArticle Read Snapshotなしに開始されず、本文を期限付き一時領域だけへ保持し、完了・取消・期限切れ後に破棄した証拠を追跡できる。 ｜ 検証: REQ-DATA-15 ｜ 正本: `categories/data-requirements_v1.md`
- [ ] AC-L1-SCREEN-20: SEO／AIを切り替えて取得性×表示性と構成値・availabilityを確認でき、観測段階を誤認せず4象限に応じた次操作へ進める。 ｜ 検証: REQ-SCREEN-20 ｜ 正本: `categories/screen-operation-requirements_v1.md`
- [ ] AC-L1-CAV-01: Googlebot等のSEO BotとAI Botを共通契約で取り込み、事業者・用途・検証状態を分離してspoof疑いを実crawlから除外できる。 ｜ 検証: REQ-CAV-01 ｜ 正本: `logic/crawler-ai-visibility-logic-requirements_v1.md`
- [ ] AC-L1-CAV-02: robots許可、外部probe、検証済み実crawl、本文可読性、freshnessを別成分として取得性を再現可能に判定できる。 ｜ 検証: REQ-CAV-02 ｜ 正本: `logic/crawler-ai-visibility-logic-requirements_v1.md`
- [ ] AC-L1-CAV-03: Buy／ブランドquery中心の評価セットについて、SEO順位・表示と複数AI surfaceの言及・URL引用・share・安定性をcluster単位で分離し、分離不能値をunknown／combinedとして扱える。 ｜ 検証: REQ-CAV-03 ｜ 正本: `logic/crawler-ai-visibility-logic-requirements_v1.md`
- [ ] AC-L1-CAV-04: 取得性×表示性の4象限から異なる診断を返し、crawl、index／retrieval、順位／引用、referral、CVを同一成果として混同しない。 ｜ 検証: REQ-CAV-04 ｜ 正本: `logic/crawler-ai-visibility-logic-requirements_v1.md`
- [ ] AC-L1-CAV-05: 月次の外形・回答面診断から任意ログ実測、Adapter拡張、高度較正へ段階開放し、未実装・未接続段階を観測済みとして表示しない。 ｜ 検証: REQ-CAV-05 ｜ 正本: `logic/crawler-ai-visibility-logic-requirements_v1.md`
- [ ] AC-L1-KRL-12: プライマリ高々1つと複数セカンダリの割当集合で獲得順位を評価し、順位なしをインデックス診断へ送り、CVなし単体では失敗判定しない。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-13: セカンダリ優位時に単純な主従入れ替えを行わず、業界別実績からクラスタ・代表語・主従重みの補正候補を再計算し、版と根拠を追跡できる。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-14: 実績不足時は複数の業界／業種priorとユーザー指定の横断軸を使用し、Site実績の蓄積に応じてSite固有補正の比重を高められる。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-15: 業界の優先順とSite実績等から配分比率を算出し、未設定時は非保証の業界推定を行い、順位悪化リスクがあるSite固有補正を承認待ちへ切り替えられる。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-16: ユーザー修正分類を正本・較正データとして使用し、手動／自動の業界優先方式を選択でき、分類変更時は自動予約の未実行項目だけを再検証できる。 ｜ 検証: REQ-KRL-09 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-17: 市場価値とは別に記事成立性が評価され、想定読者、Site目的、独自材料、読後目的または既存情報との差分が不足する候補を自動生成へ送らず、追加入力依頼または観測へ振り分けられる。 ｜ 検証: REQ-KRL-02, REQ-KRL-06, REQ-KRL-07 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-18: 既存Siteでも公共市場候補、GSC Query、ユーザー登録語、検索競合語を統合した市場母集団を作り、獲得語だけに限定せず診断できる。 ｜ 検証: REQ-KRL-03, REQ-KGA-23 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-19: 意味類似だけでなくSERP上位重複、共通獲得語、co-landing、検索意図、記事type、時系列類似度でclusterを構成し、混合・変動・分割・統合候補を区別できる。 ｜ 検証: REQ-KRL-03 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-20: clusterが保護、好調、改善余地、競合劣後、重要未獲得、競合未対応差分、自Site固有、新規獲得、低下、消失、カニバリ、未割当、index障害、監視へ分類され、Content Gapと複数URLを無条件で新規記事・カニバリにしない。 ｜ 検証: REQ-KRL-07 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-21: traffic potentialが範囲と不確実性で示され、自Site固有難易度が被link、トピック信用、content、意図、記事type、構造、SERP、市場圧力、過去実績へ分解される。 ｜ 検証: REQ-KRL-02, REQ-KRL-06 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-22: 検索競合がcluster実績から動的分類され、Recommendationが対象cluster、根拠、役割、記事type、既存記事、内部link、順序、credit、不足入力、実行可能状態を一体で返す。 ｜ 検証: REQ-KRL-08 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`
- [ ] AC-L1-KRL-23: キーワード市場の規模・価値と、Query・記事による自Siteの獲得シェアが別成分で保存され、GSC実測シェアと競合データ由来の推定シェアが区別される。 ｜ 検証: REQ-KRL-01, REQ-KRL-02, REQ-KRL-08 ｜ 正本: `logic/keyword-dynamic-recommendation-logic-requirements_v1.md`

### Article Summary抽出・完全性

- [ ] AC-L1-ASUM-01: 本文取得不能と本文なしを区別し、取得不能を不足score 0として扱わない。 ｜ 検証: REQ-ASUM-01, REQ-ASUM-03 ｜ 正本: `logic/article-summary-completeness-logic-requirements_v1.md`
- [ ] AC-L1-ASUM-02: 既知重み59%ではscoreを出さず、60%以上で初めて完全性を算出する。 ｜ 検証: REQ-ASUM-03 ｜ 正本: `logic/article-summary-completeness-logic-requirements_v1.md`
- [ ] AC-L1-ASUM-03: 必須field欠落時はscore 0.8以上でも `incomplete_required` になる。 ｜ 検証: REQ-ASUM-03 ｜ 正本: `logic/article-summary-completeness-logic-requirements_v1.md`
- [ ] AC-L1-ASUM-04: 同一content hash・rule versionの再同期で本文再解析を行わない。 ｜ 検証: REQ-ASUM-05 ｜ 正本: `logic/article-summary-completeness-logic-requirements_v1.md`
- [ ] AC-L1-ASUM-05: Summary生成後に本文一時領域が期限内削除され、抽出事実から不足理由を追跡できる。 ｜ 検証: REQ-ASUM-02, REQ-ASUM-04 ｜ 正本: `logic/article-summary-completeness-logic-requirements_v1.md`

### Keyword Portfolio診断

- [ ] AC-L1-KPD-01: 匿名化されたqueryを流入0としてカバー率へ算入しない。 ｜ 検証: REQ-KPD-01, REQ-KPD-02 ｜ 正本: `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md`
- [ ] AC-L1-KPD-02: drift shareが30%未満、または1評価窓だけの場合はdrift確定しない。 ｜ 検証: REQ-KPD-03 ｜ 正本: `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md`
- [ ] AC-L1-KPD-03: query被覆率50%以下、または第2URL click share30%未満ではカニバリ候補にしない。 ｜ 検証: REQ-KPD-04 ｜ 正本: `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md`
- [ ] AC-L1-KPD-04: index障害・市場変化・低confidence時は記事失敗ではなくobserveまたはinsufficient_dataになる。 ｜ 検証: REQ-KPD-05 ｜ 正本: `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md`
- [ ] AC-L1-KPD-05: 判定結果から入力値、除外、rule version、次回評価を再現できる。 ｜ 検証: REQ-KPD-06 ｜ 正本: `logic/keyword-portfolio-diagnostics-logic-requirements_v1.md`

### 品質Gate・Repair・Routing

- [ ] AC-L1-CQR-01: freeze入力欠落またはversion不一致で有償生成・検査を開始しない。 ｜ 検証: REQ-CQR-01, REQ-CQR-06 ｜ 正本: `logic/content-quality-repair-routing-logic-requirements_v1.md`
- [ ] AC-L1-CQR-02: Repairがfail section外、ユーザー編集、合格sectionを変更しない。 ｜ 検証: REQ-CQR-03 ｜ 正本: `logic/content-quality-repair-routing-logic-requirements_v1.md`
- [ ] AC-L1-CQR-03: advisoryだけでは公開を停止せず、hard判定は例外公開後も監査に残る。 ｜ 検証: REQ-CQR-02, REQ-CQR-05 ｜ 正本: `logic/content-quality-repair-routing-logic-requirements_v1.md`
- [ ] AC-L1-CQR-04: route選択とfallbackをModel Registry version、品質、費用、availabilityから再現できる。 ｜ 検証: REQ-CQR-04 ｜ 正本: `logic/content-quality-repair-routing-logic-requirements_v1.md`
- [ ] AC-L1-CQR-05: 限定Repairと障害再開で二重課金せず、別成果の再生成だけが新規jobになる。 ｜ 検証: REQ-CQR-06, REQ-CQR-07 ｜ 正本: `logic/content-quality-repair-routing-logic-requirements_v1.md`
