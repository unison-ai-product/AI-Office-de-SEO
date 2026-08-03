---
document_id: AOS-L1-INTEGRATION-REQUIREMENTS
title: AI Office de SEO 外部連携要求 v1.1
version: 1.1
layer: L1
kind: integration_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 外部連携要求

## 責務

外部システムとの認証、入力、出力、同期、制限、障害、再試行、整合を定義する。

対象:

- WordPress
- Googleログイン、GSC、URL Inspection
- SERP、PAA、AIO、ニュース、動画、競合構造
- LLM Provider
- Stripe
- メール、Webhook、オブジェクトストレージ

必須項目:

- API/Plugin責務境界
- 認証・scope・secret
- request/response契約
- quota、rate limit、cost
- freshness、availability、欠損
- timeout、retry、idempotency、circuit breaker
- 差分同期、再認可、切断、監査

外部取得値の解釈・優先順位計算はロジック要求へ置く。

すべての外部連携は共通のFeature Connection Adapter境界を使用する。Adapterの責務は認証、接続、quota、取得・送信、再試行、Provider固有payloadの正規化までとし、SEO優先順位、推薦、成果判定を持たない。入力系はContext Envelope、出力系はversion付きCommand Result、状態系はConnection Healthへ変換し、Core WorkflowがProvider固有responseを直接解釈しない。

既存ソース: `ai-office-de-seo-dataforseo-competitor-batch-requirements_v3.7.md`、`ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`、`ai-office-de-seo-billing-credit-provider-requirements_v3.7.md`。

## 要求

### REQ-INT-01 WordPress軽量計測

リリース時はCMS非依存の単一JavaScript Trackerで、ページ表示、遷移元・遷移先、明示CTA・button識別子、指定サンクスページ到達を取得できなければならない。記事本文、フォーム入力内容、不要な個人情報を送信せず、同意状態、Site識別子、イベントID、発生時刻、tracker versionを付与する。WordPressではThin Pluginを標準のTracker設置・接続導線とし、非WordPressではscript設置を使用する。計測ロジックの正本はTrackerに置き、Pluginへ重複実装しない。

### REQ-INT-02 計測契約の更新

計測イベントschemaとTrackerはversion管理し、後方互換期間、対応するサーバーversion、段階更新、失敗時停止、rollbackを持つ。計測項目の追加は、データ量、保守負担、確実性、利用目的を評価し、人員・運用余力を確保したリリース後のversion upとして追加できる。Site設定変更だけで対応可能な項目はserver-side configurationで配信する。

### REQ-INT-03 補助分析連携

GA4等の外部分析は補助連携として扱い、初期のページ遷移・CV計測の必須経路にしない。外部分析値と自前イベントが異なる場合は混合せず、sourceと定義versionを表示する。

### REQ-INT-04 GSCインデックス状況

GSCおよびURL Inspectionの利用可能な観測結果から、公開URLのインデックス状態、問題種別、確認日時、quota状態を取得する。クォータ配下では新規公開、順位なし、要監視URLを優先する。取得不能時は推測で正常・異常を確定せずavailability理由を返す。診断結果はユーザーエスカレーションへ渡し、本連携からサイト設定を自動修復しない。

### REQ-INT-05 WordPress連携方式

WordPress連携はCore REST APIと軽量トラッキングコードを基礎とし、初期の標準Connection ProfileをThin Plugin併用とする。PluginはTrackerの自動設置、Siteペアリング、version・更新通知、標準RESTで不足するCapabilityとイベント通知だけを補う。Site接続時にREST到達性、Application Password可否、投稿・メディア・Block Type API、Plugin version、トラッキング稼働、独自ブロック・Page Builderを診断する。

WordPressへ記事、リライト、画像を送信する最小条件は、認証済みCore REST APIへ接続でき、対象投稿タイプの下書き作成権限を確認できることである。画像を付与する場合はMedia APIの書込み権限も確認する。REST APIが未接続、読取専用、認証切れ、投稿権限不足、Capability不明の場合は、分析・キーワードRecommendation・記事生成を継続できてもWordPress送信を実行しない。再接続、権限修正、別の接続Profileまたは成果物持ち出しを提示する。

WordPressの公開、更新、予約状態変更、削除、Media変更等の検知はThin Pluginが送る署名付きWebhookを主経路とする。WebhookはイベントID、Site、対象ID、状態、更新日時、content hash、schema versionを持ち、本文全文を含めない。受信側は署名、時刻、replay、冪等性を検証し、重複通知で二重処理しない。

RSS／AtomはPluginを導入できない環境における公開済みコンテンツの新着・更新発見へ利用できる。ただし下書き、予約、削除、権限、Media、独自投稿状態の正本にはしない。WebhookまたはFeedで変化を検知した対象だけをREST取得し、常時の全件Pollingを標準経路にしない。手動同期、再接続時、欠落疑い、定期整合確認ではREST差分同期を実行できる。

連携方式の比較では、導入容易性だけでなく、WordPress／Gutenberg更新追従、障害分離、認証・秘密管理、イベント即時性、Capability精度、独自構造対応、保守原価、Site負荷を評価する。Profile変更時も記事・メディア・計測の識別子と履歴を引き継ぎ、再登録・二重計測を起こさない。

Page Builder／独自テーマは、検出できることと安全に書き込めることを分離する。対応済みAdapterは対象Builder version、投稿タイプ、読取、下書き、更新、Preview、Revisionの対応表とContract Testを持つ。検出だけ可能なBuilderへ書込み互換を表示しない。

WordPress互換性と出力縮退の正本は本要求とする。Compatibility MatrixはWordPress version、投稿タイプ、Core REST、Media、Classic／Block Editor、Block API version、iframe可否、Content-Only、Visual Revisions、Preview、Revision、Tracker、Thin Plugin、第三者Page BuilderをCapability単位で判定し、`full / degraded / update_required / unsupported` を返す。version文字列だけで対応可否を決めず、対象記事の実効Editorと投稿単位のBuilder識別子、post meta、shortcode、block namespace、template、利用Plugin、検出confidenceを評価する。

出力経路は次の順序で解決する。

1. 対応済みBuilder Adapterによる構造化下書き。
2. 対象投稿タイプで利用可能なWordPress標準Block Editorの別下書き。
3. Classic Editor互換HTMLの別下書き。
4. HTML、Markdown、画像等の成果物持ち出し。

対応Adapterがない既存Builder記事へ2または3を直接上書きしない。元記事ID、元URL、差分、選択した縮退経路を保持し、別下書きまたは持ち出し成果として返す。未知のpost meta、shortcode、Builder JSON、template dataを削除・再構成しない。Builder未対応を分析・Recommendation・成果物生成の全体失敗とせず、既存記事の構造を破壊し得る更新操作だけを保留する。

下書き作成応答は、外部投稿ID、編集URL、Preview URL、Media ID・URL、投稿状態、利用Capability、Compatibility Matrix version、縮退理由、元記事との関係、冪等キーを返す。WordPressへ引き渡した下書きはCMS側の成果物とし、初期WorkflowではAI Officeから再取得・上書きしない。

### REQ-INT-06 CMS Adapter拡張境界

記事制作・リライト・計測WorkflowはCMS非依存のPublication Contractを経由し、WordPressは初期Adapterとして実装する。他CMSの検証環境がない初期段階では、WordPress以外を対応済み・互換保証・提供予定確定として表示しない。将来Adapterを追加する場合はCMSごとの実環境でContract TestとE2E検証を通し、対応version、利用可能機能、制限、縮退動作を版管理する。

### REQ-INT-07 画像取得・生成連携

ユーザーが許可したWordPress Media IDまたは指定URLから画像を取得し、Image Style Profileの候補抽出へ渡せる。URL取得はHTTPS、許可host、DNS再解決、private／link-local宛拒否、redirect上限、MIME・容量・画素数・timeout・malware検査を適用し、任意URL取得を内部ネットワークアクセス経路にしない。

画像生成・編集の初期ProviderはOpenAI GPT Image 2（`gpt-image-2`）とする。Provider request／responseの識別子・状態等のメタデータ、model snapshot、prompt version、reference hash、quality、size、usage、費用、失敗分類を画像jobへ記録し、raw payloadを恒久保持しない。Provider障害時は本文生成・公開全体ではなく画像工程だけを保留・縮退できる。

### REQ-INT-08 SEO／AIクローラー観測連携

Googlebot等の検索クローラーと、OAI-SearchBot等のAI検索・回答取得、インデックス、学習等のクローラーを、共通のCrawler Observation Contractで受け入れる。観測値は `provider、verified_bot_id、bot_purpose、site、URL、HTTP状態、bytes、latency、cache、observed_at、source、verification_method` を持ち、検索クローラーとAIクローラー、ならびにAI Botの用途を混合しない。

本連携は初期リリースの確定範囲に含めず、リリース後の調査・試験提供候補とする。実装する場合は外部fetch probeによるrobots、meta robots、canonical、HTTP、redirect、本文取得可能性、JavaScript依存、WAF／認証阻害の外形診断から検証する。後続候補としてAWS CloudFront／WAF、XServer等のhosting access log、Cloudflare等のedge logを、環境別Connectorまたは手動取込で受け入れる。User-Agent文字列だけで実在Botと断定せず、公式IP範囲、reverse DNS、edgeのverified bot識別等、Providerごとの検証方法とversionを記録する。実環境で取得方法、形式、権限、利用Planを検証していないConnectorや未接続Providerを実測済みと表示しない。

client-side Trackerは人間の遷移・CV用であり、将来もCrawler観測の必須経路にしない。Crawler log連携は全顧客の必須設定にせず、対応環境の任意高度機能または問い合わせ導入候補とする。採用時も生access logは取込stream内または短期object storageでBot検証と集約に必要な間だけ扱い、日次カウント等を生成後に削除する。robots変更やWAF allowlist等のサイト設定修正はユーザーへ提示し、本連携が無断で変更しない。

### REQ-INT-09 Site別Article読取り経路

公開・更新済み記事の読取りは単一経路へ固定せず、`public_crawl、authenticated_crawl、cms_rest_rendered、plugin_snapshot_push、manual_import` を共通Article Snapshot Contractへ正規化する。SiteごとにArticle Read Profileを持ち、契約Plan、接続状態、取得済みCapability、認証範囲からシステムが利用可能な経路だけを候補とする。ユーザーが設定するのはSite URL、CMS接続、認証、Plugin導入等、そのSiteで業務を成立させるために必要な項目だけとし、経路名、優先順位、fallback、取得頻度、rate limitを選択させない。セキュリティ設定を弱めて経路を成立させない。

経路は変更発見と本文・構造取得を分離する。Webhook／Plugin push、RSS／Atom、sitemap、REST modified日時等の軽い変更信号から対象URLを特定し、変更対象だけを選択中の読取り経路で取得する。外部Crawlerによる全件定期走査を既定にせず、content hash未変更ならArticle Summary再解析を省略する。

初回接続時だけ取得可能な記事一覧を分割同期し、通常運用は更新通知・更新日時・sitemap差分・content hashに基づく増分同期を既定とする。記事数・更新件数・取得量・一時処理量はPlanのCapacity Dimensionへ計上し、大規模Siteは自動構築期間として分割処理する。顧客へ技術経路を選択させず、上限接近時はPlan変更または容量対応の業務導線を提示する。

初回接続時だけ取得可能範囲を分割して全体同期し、通常運用は更新通知・差分取得を基本とする。初回同期件数、月間同期件数、再取得量、処理待ち時間はSite規模とPlan Capacityへ接続し、大規模Siteは自動構築期間として分散する。429、応答遅延、timeout、CMS負荷兆候を検知した場合は同時数と取得間隔を自動調整し、追加料金で接続先の安全上限を解除しない。

通常HTMLで必要本文を取得できないJavaScript描画Siteは `render_required` として分離し、Headless Browser等のrender取得は実測した負荷・費用・成功率がPlan内に収まる場合だけ後続候補とする。公開時点の再現性と鮮度を保証できないWeb Archiveを通常同期や公開状態の正本として使用しない。

Connection Adapterは経路ごとに、到達性、認証成立、取得完全性、freshness、P95 latency、成功率、Site／CMS負荷、製品側費用、rate limit、最終成功、連続失敗、必要なユーザー操作をConnection Healthとして返す。自動制御はこの情報からSite専属の `primary、standby、disabled` を選び、同じ入力で再現可能なPolicy versionと選択理由を保持する。

初期優先は、必要な情報を完全に取得できる経路のうちSite負荷・外部呼出し・保守費が小さいものとする。候補が同等ならpush／差分通知をpollingより、対象取得を全件crawlより優先する。ただしPlugin Snapshotが必要情報を欠く場合、公開Rendered HTMLの検証が必要な場合、下書き等でRESTだけが成立する場合は、用途ごとに異なるprimaryを選べる。

primaryの一時失敗だけで即時切替を反復せず、error分類、連続失敗、cooldown、最小固定期間、回復probe、切替後の観測期間を持つ。認証失効、明示拒否、継続する403／429／5xx、schema不一致、stale超過時はstandbyへfailoverし、全経路不成立なら `read_connection_required` として理由と設定案を返す。回復時も自動復帰Policyに従いflappingを防ぐ。記事の書込み経路と読取り経路は独立して選択し、読取り経路の切替をWordPress等への書込み許可として扱わない。

公開HTMLを通常取得できないSiteに対するHeadless Browser等の描画取得は、実測した負荷・成功率・費用から採用可否を判断する後続経路とし、初期の常用経路へ含めない。Wayback Machine等の外部Archiveは古い状態または欠落を含み得るため現在状態の正本・通常fallbackにせず、supportまたは復旧調査で必要な場合だけ補助資料として扱う。

### REQ-INT-10 CMS Delivery

Presentation Assembly完了後の生成成果とCMS送信処理を分離し、`schema.cms.delivery.v1`で成果保持、write Capability再診断、下書き／Media作成、外部反映確認、再送、持ち出しを追跡する。DeliveryはRecommendation、Intake、Workflow、Presentation Snapshot、Post Envelope、Connection Profile version、認可判断、idempotency key、correlationを保持し、生成完了をCMS送信成功として扱わない。

状態は`prepared / connection_required / permission_required / delivering / draft_created / verification_pending / verified / failed_retryable / failed_terminal / carried_out / cancelled`とする。接続・権限不足または一時障害時は完成成果をTTL付き一時領域へ保持し、同じDelivery IDとidempotency keyで再開する。再接続や再試行を記事の再生成、追加credit消費または別下書き作成へ変換しない。

CMS APIが成功を返しただけでは`verified`にせず、外部post参照、編集／Preview URL、反映hash、必要なMedia参照を確認する。検証不能は`verification_pending`または`failed_retryable`として再確認する。HTML／Markdown等の持ち出しは`carried_out`として履歴を維持するが、CMS下書き作成、公開または更新成功へ数えない。リライト／記事置換の`verified`後は別のPublication Decisionとユーザー承認へ進める。

## 受入条件

- [ ] AC-L1-INT-01: 初期Trackerが本文・フォーム値を送らず、ページ遷移と指定CVを取得でき、WordPressではThin Plugin、非WordPressではscriptで設置できる。
- [ ] AC-L1-INT-02: Trackerとイベントschemaを互換性確認後に段階更新・rollbackできる。
- [ ] AC-L1-INT-03: 外部分析連携が停止しても初期の自前計測を継続できる。
- [ ] AC-L1-INT-04: GSC／URL Inspectionのクォータとavailabilityを保持してインデックス状態を取得し、取得不能を正常扱いせずユーザー対応へ接続できる。
- [ ] AC-L1-INT-05: 認証済みCore RESTと投稿権限がある場合だけ記事を送信し、未接続・読取専用・認証切れ・権限不足時は送信を止めたまま分析・生成・持ち出しを継続できる。
- [ ] AC-L1-INT-06: CMS非依存Publication ContractとWordPress Adapterが分離され、未検証CMSを対応済みと表示せず、追加Adapterの実環境検証条件が定義されている。
- [ ] AC-L1-INT-07: 許可画像を安全に取得してGPT Image 2の生成・編集へ接続でき、画像工程の失敗を本文Workflowから分離できる。
- [ ] AC-L1-INT-08: SEO／AIクローラーを共通契約で用途別に観測し、初期の外形診断と後続の検証済みserver／edge log実測を混同せず、client-side Trackerなしでも取得状態を判定できる。
- [ ] AC-L1-INT-09: Siteごとに許可済みの複数Article読取り経路を共通Snapshotへ正規化し、完全性・鮮度・成功率・負荷・費用からprimary／standbyを選択して、差分対象だけを取得し、障害時にflappingなくfailoverできる。
- [ ] AC-L1-INT-10: 生成完了とCMS Delivery成功を分離し、接続・権限・一時障害後も同一Deliveryとidempotency keyで再開して、再生成、二重credit、二重下書きを起こさず、外部反映確認後だけverifiedにできる。
