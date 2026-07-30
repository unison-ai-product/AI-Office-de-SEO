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

各受入条件は `AC-{領域}-{番号}` の安定IDを持つ。`検証` 欄は、当該ACが検証する要求のセクションID `REQ-{ドメイン}-{番号}` を指す。REQ-IDは各要求docのセクション見出しに付記されている。下流（L3要件・L8〜L14テスト設計）は、AC-IDとREQ-IDを安定キーとして双方向に辿る。

補: `REQ-PACK-11` は `REQ-PACK-11.1`〜`REQ-PACK-11.7` のドット付きサブセクションIDを持つ（ID文法の登録済み例外）。監査・照合ツールはドット付きサブIDを解析対象に含めること（v3.7.23の教訓と同型の解析漏れを防ぐ）。

## Product

- [ ] AC-PRODUCT-01: 正式サービス名がAI Office de SEOで統一されている。 ｜ 検証: REQ-PRODUCT-01
- [ ] AC-PRODUCT-02: ユーザー向け第一階層は、ダッシュボード、キーワード管理、コンテンツ作成、オートメーション、検索流入分析、学習ナレッジ管理、設定である。 ｜ 検証: REQ-NAV-01
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
- [ ] AC-SANDBOX-04: 別サイトのWP下書きへ送れない。 ｜ 検証: REQ-SEC-01

## Tenant / Account

- [ ] AC-TENANT-01: テナント分離が共有DB上の`tenant_id`/`site_id`によるID型論理分離であり、テナント別物理DB・スキーマ分離ではない。 ｜ 検証: REQ-PRODUCT-10, REQ-SEC-07
- [ ] AC-TENANT-02: 全データアクセスが単一の強制ポイントを通り、スコープ未指定・越境クエリはdefault-denyでfail-closeする。 ｜ 検証: REQ-SEC-07
- [ ] AC-TENANT-03: テナント横断のJOIN・集計が既定で禁止され、越境試行が監査ログに残る。明示認可例外は2経路のみ——①k匿名集約パイプライン（専用ロール・到達不能・k匿名出力限定）②同意ベース事例転用（許諾範囲のみ・スナップショット・撤回で停止/削除）——で、いずれも監査される。 ｜ 検証: REQ-SEC-07, REQ-SEC-10, REQ-PRODUCT-13, REQ-PRODUCT-23
- [ ] AC-TENANT-04: テナント由来データを含むキャッシュ（Layer B/C・GSC/記事/方針系）のキーに`tenant_id`/`site_id`が含まれテナント間で漏洩せず、共有可なのはテナントデータを含まない公共外部観測とLayer Aのみで、その非含有が契約検証（cache prefix hygiene）で保証される。 ｜ 検証: REQ-SEC-07, REQ-SEC-13, REQ-PRODUCT-13
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
- [ ] AC-QUALITY-06: 各ゲートが機械判定可能な計測指標と初期しきい値を持つ（keyword密度0.5〜3%、Flesch 60〜70・受動態≤10%、競合推奨語カバー率≥80%、独自要素数、近似度、出典付与率等）。 ｜ 検証: REQ-PACK-10
- [ ] AC-QUALITY-07: 計測指標が第三者ヒューリスティック（公式ではない・要調整）であり順位保証でないことが明示され、hard/advisoryの確定と較正がL3に委ねられている。 ｜ 検証: REQ-PACK-10

## Pack / Schema

- [ ] AC-PACK-01: TicketはworkflowKey、promptPackKeys、sourceNeedKeys、schemaKeys、userPromptを持つ。 ｜ 検証: REQ-PACK-01
- [ ] AC-PACK-02: Pack versionはジョブ開始時に固定される。 ｜ 検証: REQ-PACK-04
- [ ] AC-PACK-03: TableはJSON正本で返される。 ｜ 検証: REQ-PACK-05
- [ ] AC-PACK-04: 投稿形式チェックを通してWP下書きへ進める。 ｜ 検証: REQ-WPA-02
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
- [ ] AC-AUTO-02: full_autoは初期OFFである。 ｜ 検証: REQ-WPA-04
- [ ] AC-AUTO-03: 緊急停止できる。 ｜ 検証: REQ-WPA-04, REQ-DUR-04
- [ ] AC-AUTO-04: WordPressプラグインはデータ交換ソケット（取得・公開・トラッキング挿入/蓄積）であり利用はシステム側、導入するだけで連携し、Tenant/Siteスコープで認証され最小権限で正本へ書き込む。 ｜ 検証: REQ-WPA-07, REQ-SEC-09
- [ ] AC-AUTO-05: プラグインはZIP配布で、更新の有無をWP管理画面とシステム側コンソールの双方へ通知し、更新は署名付き・Tenant/Siteスコープで適用される。 ｜ 検証: REQ-WPA-07

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

- [ ] AC-ROLE-01: full_autoの有効化とKill Switch作動がOwner/Adminに限定される。 ｜ 検証: REQ-PRODUCT-08, REQ-WPA-04
- [ ] AC-ROLE-02: 契約・プラン変更がOwnerに限定される。 ｜ 検証: REQ-PRODUCT-08
- [ ] AC-ROLE-03: すべてのRoleでtenant/site境界が強制され、Role権限が境界を上書きしない。 ｜ 検証: REQ-PRODUCT-08, REQ-SEC-01

## Performance

- [ ] AC-PERF-01: 主要画面が代表テナントと上限近傍テナントで性能計測され、事前計算スナップショットから配信され、初期表示目標を満たし、画面シェルと主要ナビゲーションが遅いデータ源にブロックされず、一覧が取得上限・ページングまたは仮想化を持ち、長時間処理が受付状態・進捗・部分結果・再試行を表示する。 ｜ 検証: REQ-SEC-06
- [ ] AC-PERF-02: 主要画面ごとにクライアント配信量・初期API本数・DBクエリ数の予算が定義され、無制限走査・無制限JOIN・N+1がなく、クエリ時間・走査行数・返却行数の計測結果が受入証跡として残る。 ｜ 検証: REQ-SEC-06
- [ ] AC-DATA-WEIGHT-01: 恒久DBに本文・生HTML・競合本文・LLM raw response・プロンプト全文・大容量debug payloadがなく、増加データに保持期間・ロールアップ・削除またはアーカイブ・容量上限があり、新しいデータ群に所有者・増加単位・保持方法が定義される。 ｜ 検証: REQ-SEC-06, REQ-SEC-11, REQ-PRODUCT-19, REQ-PRODUCT-20
- [ ] AC-PERF-03: 事前計算が未完了の場合、空表示ではなく計算中状態と再試行手段を提示する。 ｜ 検証: REQ-SEC-06

## Analytics Framing

- [ ] AC-CV-01: CVは日別・URL別・ゴール別の集計であり、改善の主指標はGSCのURL×クエリ実績、CVは相関ベースの補助指標として提示される。 ｜ 検証: REQ-WPA-05

## Delivery / Scope

- [ ] AC-DELIV-01: オンボーディングはコンサルティングとして提供され、製品側は接続・取り込み・レギュレーション設定の各機能を提供する（自己完結型オンボーディングUXを製品スコープに含めない）。 ｜ 検証: REQ-PRODUCT-09
- [ ] AC-DELIV-02: アプリ内ヘルプ・FAQは製品スコープ外とし、専用サイトで対応する。記事内のFAQ生成機能はこれと別物として維持される。 ｜ 検証: REQ-PRODUCT-09
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
- [ ] AC-GOV-02: full_autoの自動リライト・リンク再調整に日次/週次の変更予算・同一記事クールダウン・振動検知（相互打ち消しの検出→自動停止＋通知）が効き、上限到達時は候補がキュー保留され人へ提示される。 ｜ 検証: REQ-PRODUCT-18, REQ-AGENT-06, REQ-WPA-04
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

- [ ] AC-PORT-01: 全サービスが不変コンテナイメージ（シークレット非焼き込み・設定注入）で配布され、VPS=Compose相当からマネージドコンテナへ**同一イメージ・境界API不変**で移行でき、状態がPG/S3互換/キューへ外部化され、クラウド専用API依存がアダプタ層に隔離され、クラウド側stagingでの復元・切替演習が行われる。 ｜ 検証: REQ-DUR-09, REQ-DUR-06, REQ-DUR-08
- [ ] AC-HEAL-01: ヘルスチェック→自動再起動・再スケジュールが行われ、実行中ジョブがcheckpointから無人再開（不能時は保留＋通知のfail-close）し、証明書更新・ログローテ・TTL掃除・DBメンテが無人実行され、全自動アクションが監査され、フラッピング時に自動化を一時停止できる。 ｜ 検証: REQ-DUR-10, REQ-AGENT-10, REQ-DUR-04
- [ ] AC-MAIL-02: メール送信がキュー・リトライ・dedupe_keyの二重送信防止を持ち、認証/回復系が優先レーンで、no-reply＋サポート窓口明示・DMARCレポート監視が行われ、非本番からの実送信が禁止されテストモードでキャプチャされる。 ｜ 検証: REQ-PRODUCT-21, REQ-DUR-07
- [ ] AC-ACCT-01: 招待が期限付き単回トークンで失効・再送・取消でき、オーナー喪失時の回復が本人確認→管理者統制の移譲（自動化なし・双方通知・全監査）で行え、全端末ログアウトとRole変更/退会/回復時の強制失効があり、高リスク操作にstep-up再認証が要求される。 ｜ 検証: REQ-SEC-16, REQ-SEC-08, REQ-ADM-06

- [ ] AC-SUPPORT-01: チャットQAがヘルプ根拠つきで応答し、テナント参照が問い合わせユーザーのRole・スコープ内に限定され、低確信・範囲外で捏造せずエスカレーションを提案し、会話レート/上限とクレジット外の原価帰属が効く。 ｜ 検証: REQ-PRODUCT-22, REQ-SEC-08, REQ-SEC-15
- [ ] AC-SUPPORT-02: 受付自動返信（ID・SLA目安・時間外案内・インシデント時のステータス自動案内）が機能し、エスカレーションが優先度×SLAで人へ渡り（要約＋文脈参照つき・本文/プロンプト非含有）、ADM-S12でキュー/SLA/deflectionが管理・計測され、解決ナレッジがADM-10統制でFAQへ還流する。 ｜ 検証: REQ-PRODUCT-22, REQ-PRODUCT-16, REQ-ADM-10

- [ ] AC-MASTER-01: マスターテナントがinternal区分で内部課金モード（消費・原価は通常計測＝実コストリファレンス）で動作し、サンドボックス・品質ゲート・承認・変更予算・監査が一般テナントと同一経路（バックドアなし）で、自己宣伝記事にもゲートが同基準適用され、Flagロールアウトがmaster→canary→一般の順で、マスター由来データのprior算入が既定除外（設定で制御）である。 ｜ 検証: REQ-PRODUCT-23, REQ-PACK-09, REQ-DUR-04, REQ-PRODUCT-13

- [ ] AC-MASTER-02: マスターテナントが開発者アカウント配下でADM-S9からのみプロビジョニングされ、実績→SEOループの素材が二層（k匿名ベンチマーク=同意目的に公表明記＋最小標本数／個別事例=明示オプトイン許諾・範囲指定・撤回で停止と削除）で管理され、転用が第二の明示認可例外として許諾範囲スナップショットのみをshowcaseストアへコピーし全転用・撤回が監査され、事例記事にも品質ゲート・誠実表記が同基準適用される。 ｜ 検証: REQ-PRODUCT-23, REQ-SEC-07, REQ-PRODUCT-09

## User Journeys

- [ ] AC-UJ-01: 行動原則（主要行動は第一階層から2遷移以内・通知から対処2遷移以内・行き止まり禁止＝次アクション提示・文脈引き継ぎ・非同期・破壊操作の確認/未保存保護/権限外は原則非表示）が全画面・全ジャーニーに適用される。 ｜ 検証: REQ-UJ-01, REQ-NAV-02, REQ-PRODUCT-11
- [ ] AC-UJ-02: 初期導入（同意→接続→サンプル学習→戦略入力→マップ→初回生成→承認公開）が遷移図のパスとして到達可能で、接続失敗の再認可分岐とGSC遅延の明示を含む。 ｜ 検証: REQ-UJ-02, REQ-PRODUCT-09, REQ-SEC-09
- [ ] AC-UJ-03: 日常運用（S1/W7起点→承認・保留対応・おすすめ採否・アラート対処）が完結し、未対応ゼロの終端に到達できる。 ｜ 検証: REQ-UJ-03, REQ-AGENT-10
- [ ] AC-UJ-04: キーワード戦略（フィルタ→ギャップ→補充→候補採否→生成起動/一括投入）が完結し、採用分がS3へプリセット引き継ぎされる。 ｜ 検証: REQ-UJ-04, REQ-NAV-04, REQ-BILL-11
- [ ] AC-UJ-05: 生成〜公開（起点→レーン→Preflight→進捗→構成/QA→保留対応→承認→公開→通知→追跡）が遷移図どおり到達可能で、hard gate保留と予算超過の分岐が終端を持つ。 ｜ 検証: REQ-UJ-05, REQ-AGENT-08, REQ-SEC-12
- [ ] AC-UJ-06: リライト（候補→原因→起動→差分→承認→1か月後の一次評価→3か月後の二次評価→6か月後の長期評価）が完結し、内部リンク候補の採否を含む。 ｜ 検証: REQ-UJ-06, REQ-RWR-04, REQ-KGA-09
- [ ] AC-UJ-07: 例外・緊急（再認可・Kill Switch作動/解除・支払い失敗復旧・解約オフボーディング・保留期限超過）がそれぞれ定義済み終端に到達する。 ｜ 検証: REQ-UJ-07, REQ-DUR-04, REQ-SEC-10
- [ ] AC-UJ-08: 管理者運用（日次監視→較正、変更統制フロー、提案承認、障害対応、なりすまし調査）が管理コンソール遷移図のパスとして完結する。 ｜ 検証: REQ-UJ-08, REQ-ADM-07, REQ-ADM-10
- [ ] AC-UJ-09: 月次計画ジャーニー（目標→配分→トポロジー確定→日次/週次追跡→月末実績→翌月引き継ぎ）が遷移図のパスとして完結する。 ｜ 検証: REQ-UJ-09, REQ-PRODUCT-17

## Platform Extensions

- [ ] AC-EXPORT-01: 分析・キーワード・履歴データがテナント境界内・Role権限内でCSVエクスポートでき、本文・プロンプト・シークレットが含まれず、上限・形式が設定レジストリ管理である。 ｜ 検証: REQ-PRODUCT-14, REQ-SEC-11
- [ ] AC-SEARCH-01: グローバル検索がヘッダー常設でテナント内のキーワード・記事メタ・ジョブ・通知・設定を横断検索し、結果がRole可視性に従い、本文全文が対象外である。 ｜ 検証: REQ-PRODUCT-15, REQ-SEC-08
- [ ] AC-ANNOUNCE-01: 運営お知らせが対象選択（全体/プラン/テナント）つきで配信・通知センター表示され、作成・配信が監査に残り、公開ステータスページへの導線がユーザーUIに常設される。 ｜ 検証: REQ-PRODUCT-16, REQ-PRODUCT-11, REQ-ADM-07
- [ ] AC-AUTH-01: 認証層がIdP追加・2FAを後付けできる抽象化を持ち、初期Googleログインのまま拡張点が確保され、提供時の強制可否がテナントポリシー制御である。 ｜ 検証: REQ-SEC-14, REQ-SEC-08
- [ ] AC-RESP-01: 閲覧系画面がモバイル/タブレットで閲覧可能で、操作系はデスクトップ最適、Agent Officeはモバイルで通常ビューへ誘導し、ブレークポイントがトークン管理である。 ｜ 検証: REQ-NAV-06
- [ ] AC-INTL-01: UI文言がハードコードされず外部化され、通貨・日付・数値のロケール処理が分離され、日本語のみの初期状態から実装変更なしで言語追加できる。 ｜ 検証: REQ-NAV-07, REQ-ADM-11

## Network Learning

- [ ] AC-NET-01: テナント横断の集約が一方向（テナント→グローバル）・k匿名しきい値・識別子/本文/URL/クエリ文字列除去で行われ、集約結果からテナント・サイト・個別URLを特定できないことが集約パイプラインの契約検証に含まれ、登録同意にデータ利用条項とテナント単位オプトアウトがある。 ｜ 検証: REQ-PRODUCT-13, REQ-PRODUCT-09, REQ-SEC-13
- [ ] AC-NET-02: 集約の適用が常に提案として生成され、辞書・タクソノミはCatalog改版（REQ-ADM-10統制）、prior・しきい値は設定レジストリ改版（REQ-ADM-09統制）経由でのみ反映され、自動反映されず、記事内容・サイト戦略・few-shot・Prompt Pack・エージェントプロンプトへのテナント横断学習が行われない。 ｜ 検証: REQ-PRODUCT-13, REQ-ADM-09, REQ-ADM-10
- [ ] AC-NET-03: 新規サイトがセグメント別prior（セグメント標本不足時はグローバルfallback）から開始し、自サイトデータ蓄積に応じて縮小推定で自サイト実測へ移行し、オプトアウトテナントのデータが集約から除外されつつ共有観測・辞書の受益は継続する。 ｜ 検証: REQ-PRODUCT-13, REQ-KGA-17
- [ ] AC-NET-04: サンドボックス内ジョブが共有物（グローバルCatalog・共有観測キャッシュ・prior）をホワイトリスト経由・読み取り専用・version freezeで参照し、ジョブから共有物への書き込み・集約起動が構造的に不可能で、ホワイトリスト外参照が境界検証でfail-closeし、共有キャッシュ読み取りが読む側テナントの外部予算を消費しない。 ｜ 検証: REQ-PRODUCT-13, REQ-PACK-06, REQ-SEC-13, REQ-SRC-07

## Customization

- [ ] AC-CUST-01: ユーザー自己サーブのカスタマイズがレギュレーション調整 / User Order / 戦略入力（ターゲット軸・主張軸）に限定され、生system prompt編集・few-shot自作登録・レシピ自作定義・Pack本文直接編集・Quality Gate無効化は提供されず、全Tierが固定制約を上書きできない注入経路に乗る。 ｜ 検証: REQ-PRODUCT-12, REQ-AGENT-07, REQ-ADM-09
- [ ] AC-CUST-02: ターゲット軸・主張軸が構造化フィールドでDomain Positioning（audience/target_axes/allowed_claims/avoided_claims）へ写像され、登録時の静的Validateで差し戻され、実行時は主張がclaim_evidence/deceptive_claim/ymyl_bar等で検証されて根拠を伴えない主張はhardで保留になる（ユーザー指定でもhard緩和不可）。文体は「です・ます調／だ・である調」と文語体／口語体を指定し、個別Siteの言い回し学習は任意ON/OFF、構造カスタムはコンサル→REQ-ADM-10経由でテナント/サイトスコープ登録される。 ｜ 検証: REQ-PRODUCT-12, REQ-PACK-09, REQ-PACK-16, REQ-ADM-10
- [ ] AC-CUST-03: 注入されたUser Order・主張軸・ターゲット軸のキーが観測ログとQA結果に紐づき、ゲート不合格時にどの指定が影響したかが提示され、見直し導線がある。 ｜ 検証: REQ-PRODUCT-12, REQ-SEC-02

## Migrated Domains (v3.6→v3.7)

- [ ] AC-RWR-01: リライトのdefaultがrewrite_patchで、パッチはEdit Plan宣言のsection_id内に限定され、未変更セクションのhashが維持される。 ｜ 検証: REQ-RWR-01, REQ-RWR-03
- [ ] AC-RWR-02: 既存本文は一時workspaceのみ・承認/期限切れで削除され、品質ゲートが表崩れ・CTA破壊・WPブロック破壊・境界外参照をfail-closeで検出する。 ｜ 検証: REQ-RWR-02, REQ-RWR-05
- [ ] AC-AOUI-01: Standard SaaSとAgent Officeが同一の詳細・API・状態を共有する体験レイヤーとして分離され、第一階層7画面に内部用語を出さない。 ｜ 検証: REQ-AOUI-01, REQ-AOUI-02
- [ ] AC-AOUI-02: 全ペルソナ（基本12＋拡張1=technical_seo、以降のconfig追加分を含む）が内部Executor/工程（REQ-AGENT-09）へマッピングされ、活動可視化が状態機械の現工程を反映する。 ｜ 検証: REQ-AOUI-03, REQ-AOUI-04, REQ-AOUI-07
- [ ] AC-AOUI-03: 各画面が探索軸とおすすめ軸の2軸を持ち、行動ログを保存せずsaved_views/feedbackのみ最小保存する。 ｜ 検証: REQ-AOUI-05
- [ ] AC-ADM-01: 開発管理者コンソールがユーザー画面と分離され、APIキー原文・secret・master keyを表示せず、手動クレジット操作・provider変更を監査ログに残す。 ｜ 検証: REQ-ADM-01, REQ-ADM-03, REQ-ADM-05
- [ ] AC-BILL-04: クレジット台帳がappend-onlyでreserve/commit/release/expire等を持ち、同一Stripe eventで二重付与しない。 ｜ 検証: REQ-BILL-07
- [ ] AC-BILL-05: サブスク状態でアクセス制御し、ユーザーにmodel/provider名を見せずプラン・品質グレード・クレジットで提示する。 ｜ 検証: REQ-BILL-08
- [ ] AC-BILL-06: Provider Registry/Adapter Contract/RoutingがClaude優先で、Capability不足を不適切用途へRoutingせず、Canary→自動rollbackし、APIキー原文を保存しない。 ｜ 検証: REQ-BILL-09
- [ ] AC-SEC-11: 全データが境界キーで分離され、ジョブがsite_id固定、保存禁止データ（本文全文・プロンプト全文・APIキー原文等）を保持しない。 ｜ 検証: REQ-SEC-11
- [ ] AC-SEC-12: 実行前に決定論的Preflight Estimateを生成し、契約検証（schema/forbidden output/hallucinated source/sandbox境界）が行われる。 ｜ 検証: REQ-SEC-12, REQ-SEC-13
- [ ] AC-WPA-08: WPCapabilitySnapshotからDynamic Post Schemaを導出し、未対応slot/blockをfail-close、最終HTML全文を恒久保存しない。 ｜ 検証: REQ-WPA-08, REQ-WPA-09
- [ ] AC-WPA-09: Keyword Map Packが同一SERPs/PAA/AIO/類語のPack群として定義され、AIO/PAA不可時に捏造せずavailability理由を返す。 ｜ 検証: REQ-WPA-10
- [ ] AC-KGA-14: keyword⇔GSCクエリ⇔記事のグラフ接続と、SERPs閾値・Eligible Competitor Top5・分類証跡・Stuffing Guardが定義される。 ｜ 検証: REQ-KGA-12
- [ ] AC-SRC-01: 分散実行単位・Batch Priority Queue（P0〜P5）・DataForSEO Cache・Batch Observabilityが定義される。 ｜ 検証: REQ-SRC-08

## Query Fanout / 開発者管理・運用

- [ ] AC-SRC-02: Query Fanout Agentがシード/GSCクエリをfacet別サブクエリへ分解し、Source Packで取得してサブトピック網羅へ接続、取得不可時は捏造せずavailability理由を返す。 ｜ 検証: REQ-SRC-09, REQ-SRC-02
- [ ] AC-ADM-02: 内部ロールとテナントロールを分離し、クロステナント操作をbreak-glass/JIT昇格（時間制限・理由・監査）で行い、常時付与しない。 ｜ 検証: REQ-ADM-06
- [ ] AC-ADM-03: 監査ログが不変・テナント分離・所定スキーマで、なりすましがread-only・明示表示・両ユーザー記録される。 ｜ 検証: REQ-ADM-06
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
- [ ] AC-RWR-03: 差分プレビューが理由・対象・変更前後・各差分・Quality Gate結果・予想creditsを提示する。 ｜ 検証: REQ-RWR-04
- [ ] AC-RWR-04: リライト対象/種別がGSC実績・カニバリから機械判定され、強い部分を残し弱い箇所だけ直す。 ｜ 検証: REQ-RWR-06
- [ ] AC-RWR-05: リライトも実行前Preflightで予約し成功commit/失敗release、モード別消費係数を持つ。 ｜ 検証: REQ-RWR-07
- [ ] AC-SRC-03: 外部情報源がSource Packとして抽象化され、本文非保持でJSON取得される。 ｜ 検証: REQ-SRC-01
- [ ] AC-SRC-04: 外部取得がCrawler Complianceに従う。 ｜ 検証: REQ-SRC-04
- [ ] AC-SRC-05: 重い処理を画面表示時に走らせず、夜間バッチでtenant/site分散・checkpoint・budgetを持つ。 ｜ 検証: REQ-SRC-05
- [ ] AC-WPA-10: WP連携が取得/公開/トラッキングのデータ交換で、本文正本をWP側に置く。 ｜ 検証: REQ-WPA-01
- [ ] AC-WPA-11: WP能力にないslot/blockをfail-close/degradeし、捏造HTMLで代替しない。 ｜ 検証: REQ-WPA-03
- [ ] AC-BILL-08: 決済/請求/カード情報がStripe正本、クレジット台帳がSaaS正本という責務分担で提示される。 ｜ 検証: REQ-BILL-01
- [ ] AC-BILL-09: 品質グレード別の消費係数・原価前提が定義される（実数は設定レジストリ、REQ-BILL-10）。 ｜ 検証: REQ-BILL-03
- [ ] AC-BILL-10: AI Provider拡張の位置づけが定義され、本文生成はClaude優先である。 ｜ 検証: REQ-BILL-04
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
- [ ] AC-AGENT-15: 本文生成のdefaultがClaude優先で、非Claudeは分類/要約/fallback用途に限定される。 ｜ 検証: REQ-AGENT-04
- [ ] AC-AGENT-16: ジョブが保留系状態（手動停止/Kill Switch/予算待ち/hard gate/承認待ち）から、freeze済みversion・サンドボックス不変のままステージ境界checkpointで再開でき、完了済みステージを再課金せず、TTL失効後の再開はキャッシュ再ウォーム費が再Preflightに明示され、保留期限超過は自動キャンセル・通知される。 ｜ 検証: REQ-AGENT-10, REQ-PACK-04, REQ-SEC-12
- [ ] AC-AGENT-17: Outline Contract凍結時に用語ロックが確定して全Writing/Repairへ注入され、Section Briefが隣接ユニット文脈を含み、Assembly後にCohesion QA（coherence_flowゲート＋inter_unit_redundancy / term_consistencyのmetrics）が実行され、不合格は接続部の限定Repairへ回り（全文再生成しない）、指標がQA Snapshotに記録される。 ｜ 検証: REQ-AGENT-11, REQ-PACK-09, REQ-PACK-18
- [ ] AC-AGENT-18: Orchestratorのクラッシュ・再実行が安全であり、Ticket発行がticket_id冪等キーでdedupeされ、記録済みSnapshotのあるTicketはLLM再呼び出しされず、reserve/commitがticket_id単位で冪等で、障害注入の負のテストでLLM費用・クレジットの二重計上が発生しない。 ｜ 検証: REQ-AGENT-10, REQ-BILL-07, REQ-SEC-02
- [ ] AC-AGENT-19: 許可ツールの強制がプロンプト注入ではなくツール実行層のサーバー側default-denyで行われ、未許可ツール要求が実行されず監査に残り、外部由来のLLM導出成果（Brief/Outline等）がcontent_role=derivedとして指示位置に置かれず、instruction-in-data detectionが契約検証に含まれる。 ｜ 検証: REQ-AGENT-06, REQ-AGENT-07, REQ-SEC-13
- [ ] AC-AOUI-04: 詳細作業が全画面ワークベンチで、両モードが同一コンポーネントを使う。 ｜ 検証: REQ-AOUI-06
- [ ] AC-AOUI-07: 部門(部屋)・フロア・ペルソナがconfig駆動で拡張でき（SECTION番号連番拡張・7画面外の専門部屋追加可）、サイドメニュー第一階層7項目と安全不変条件は保たれる。 ｜ 検証: REQ-AOUI-07, REQ-AOUI-02, REQ-ADM-09
- [ ] AC-ADM-07: 課金・プラン・原価管理でStripe対応付け・原価/粗利可視化・手動操作の監査ができる。 ｜ 検証: REQ-ADM-02
- [ ] AC-ADM-08: コスト・観測ダッシュボードでpreflight vs actual・token/cost・cache hit率・各fail率を横断監視できる。 ｜ 検証: REQ-ADM-04
- [ ] AC-SEC-13: セキュリティ・観測の受入検証観点が定義される。 ｜ 検証: REQ-SEC-05
- [ ] AC-DUR-01: 開発ユニットと順序が定義される。 ｜ 検証: REQ-DUR-02
