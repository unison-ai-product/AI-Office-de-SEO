# AI Office de SEO 現行機能一覧

この一覧は、分類別L1要求、詳細ロジック、Decision Summary、L2／L3契約から導出した製品機能の索引である。REQと受入条件の全数・coverageは本書へ重複転記せず、`ai-office-de-seo-acceptance-trace_v3.7.md`と`npm run audit:requirements`を正本とする。現在は445 REQを監査対象としている。

## 1. SEO業務Lifecycle

- Site設定、CMS接続、業界／業種・商品・顧客・地域・横断軸・CV・文体の設定。
- 新規Site: Site接続→業界Big Keyword探索→方向性確認→分析・分類→Keyword戦略Report→月次計画→Recommendation。
- 既存Site: Site設定→GSC／Keyword入力とCMS記事取込→分析・分類→Keyword診断Report→月次計画→Recommendation。
- 月次で重点領域・記事／施策・予算の傾向配分を作り、週次で上限、credit、依存、保護、品質に収まる実行予定を選ぶ。
- Recommendation採用時に、目的、Keyword Cluster、検索intent、記事目的、CTA、内部link、品質、予算、根拠をIntakeへfreezeし、再入力させない。
- 公開または実質的更新を起点に1・3・6か月評価を行い、SEO、CV、認知、市場外因を分離して次のRecommendationへ戻す。

正本: `REQ-BUS-01〜13`、`REQ-SCREEN-01〜20`、`REQ-KRL-*`、Screen Flow。

## 2. Keyword Market・Site Share

- 公共Keyword資産poolを長期保有し、地域、device、検索量、季節性、競争性、CPC、SERP feature、AIO／広告面、provenanceを共有資産化する。
- SiteごとにGSC Query、登録Keyword、Site抽出語、商品・顧客seed、適格な競合観測を統合し、公共MarketからSite Universeを投影する。
- main＋sub KeywordをCluster単位で扱い、intent、funnel、業界／業種、商品、顧客、地域、既存記事、獲得状況、AIO／広告影響を分類する。
- Marketは市場規模・需要・競争・SERP面、Shareは獲得Query・順位・click・記事分布・CVとして分離する。
- カニバリ、Query Drift、未獲得、未配置、順位ありclickなし、流入ありCV接続なし、3位以内保護、index障害を診断する。
- 急変時は即時施策推薦せず要監視へ送り、週次観測と1・3・6か月評価で判断する。AIO／AI回答面は初期確約せず、提供時は月次観測を基本とする。

正本: `REQ-KRL-01〜11`、`REQ-KGA-*`、Keyword Market／Share Map。

## 3. Recommendation・計画

- 目的はSiteごとの単純選択とし、達成保証値ではなく記事／施策の傾向配分へ変換する。
- 新規記事、リライト、CTA、内部link、保護、監視、技術対応、ユーザーTaskを正規Action Catalogで扱う。
- 推薦理由、期待する役割、記事type、関連既存記事、link前後関係、実行順、予測credit、不足入力、実行可能状態を表示する。
- ユーザー指定Taskを優先し、依存関係や先行施策が有利な場合は取消ではなく相談として提示する。
- 未実行Recommendationは週次／月次で維持、順位変更、監視、失効へ再評価し、古い推薦を残し続けない。

正本: `REQ-LOGIC-01〜12`、Recommendation Action Routing Map。

## 4. 記事制作・リライト・軽量施策

- Research Brief、Outline Contract、Section Brief、Meaning Unit生成、Assembly、QA、限定Repair、装飾、CMS下書きをversion付きWorkflowで実行する。
- Outline確認はSite設定で任意に停止でき、見出し構成をユーザーが修正できる。本文のユーザー修正は保護して再QAする。
- 文末は「です・ます調／だ・である調」、文章表現は文語体／口語体を組み合わせる。Site言い回し学習は任意ONで、ON時だけ標準10記事を利用し、3か月ごとに見直し通知する。
- リライトは原因、Edit Plan、変更対象、保持対象、差分、保護順位、復元可否を示し、CMS下書き後にユーザーが更新を承認する。全文再生成も許可するが同じリスク・差分・承認を要求する。
- CTA／内部link等の軽量Patchは全文リライトと分離し、新規記事には関連既存linkを入れ、既存記事へのlink追加は提案・承認後に行う。link削除は注意対象とする。
- WP Revisionを第一復元経路、Premium以上の専用backupを安心保証として提供し、双方がない場合も復元不能への同意で続行できる。

正本: `REQ-AGENT-*`、`REQ-PACK-*`、`REQ-RWR-*`、`REQ-WPA-*`、Lightweight Patch Map。

## 5. CMS・計測・外部連携

- CoreはCMS非依存Publication Contractを使用し、初期検証AdapterをWordPressとする。他CMSは実環境Contract Testなしに対応済みと表示しない。
- WordPressはCore REST APIを基本に、Thin Pluginの署名Webhookで公開・更新・削除・Media等の変更を通知する。RSS、sitemap、更新日時、crawler等をfallbackへ使い、顧客に内部経路を選ばせない。
- read、write、Media、Editor、Preview、Revision、Tracking、Capacityを別Capabilityとして診断する。最低でも書込可能なREST接続がなければCMS送信を保留する。
- 初期画像生成はアイキャッチに限定し、Featured Image Pattern、variation許容度、logo safe area、CMS対応sizeを設定する。画像はMediaへ先に登録し、Media ID／URLを記事へ設定する。
- 初期Trackerは本文・form値・個人識別eventを送らず、page表示／遷移と指定CV到達を軽量計測する。月次と累積でCTA／CVを評価する。

正本: `REQ-INT-*`、`REQ-MEASURE-*`、CMS Routing Map、Featured Image Pattern Map。

## 6. 公開・Automation

- 新規記事は本システム経由で人が承認し公開成功した15件まで承認必須とし、既存記事・外部記事・リライトを数えない。
- 15件到達後、権限者が版付き同意書へ同意し、対象、予算、停止条件等を設定すると新規記事の自動投稿を解放できる。Entryを含む全Planで利用可能とする。
- リライト・記事置換は自動運用の解放と分け、CMS下書きとユーザー承認を必須とする。
- hard gate判定は消さず、同一権限者による二段階確認と版付き同意で例外手動公開を許可する。公開の最終判断と責任はユーザーへ帰属する。
- 予算、接続、認可、Kill Switch、stale根拠等は副作用直前に再判定する。

正本: `REQ-LOGIC-04/05`、Publication Decision Contract、Authorization Matrix。

## 7. 顧客組織・認可・内部運営

- 基本権限は`契約者／サイトオーナー／ユーザー`。業務権限は`目標管理／キーワード・サイト戦略／記事制作／サイト分析`。顧客向けViewerや人間の執筆者／検収者を別Roleにしない。
- Siteは付与式で、Site Assignmentが0件なら全Site、1件以上なら指定Siteだけへ適用する。契約者は複数可で代表契約者を1名持つ。
- 顧客組織は自由階層で、法人・個人の両方を扱う。代理店横断tenant、OEM、white labelは初期対象外とする。
- 内部はPlatform Admin／Manager／Operatorを顧客Membershipと分離する。Managerの顧客操作はAdminが対象・operation・期限を指定し、Operatorは内部log確認に限定する。
- API、worker、Automation、Agent tool、通常ビュー、Officeは同じAuthorization Decisionを使用する。

正本: `REQ-ORG-*`、`REQ-ACCESS-*`、`REQ-PAC-*`、Authorization Matrix。

## 8. 通常ビュー・Agent Office・Support

- 通常ビューは推薦、確認、承認、日常判断を簡単に行う標準画面とする。
- Agent Officeは監視専用ではなく、同じ業務正本を詳細に探索し、Keyword選定条件、推薦方針、配分、Task構成、実行順、停止・再開等の変更Proposalを作れる詳細操作面とする。
- Office personaは業務窓口であり、persona数だけLLM instanceや独立runtimeを作らない。質問は回答、変更指示は型付きProposal→影響・credit・権限確認→共通Commandへ変換する。
- 初期はdesktopを標準とし、mobile Office Chatは後続。3D表現は性能・accessibilityに応じ段階縮退する。
- アプリ内FAQチャットを全Planへ提供し、画面Contextと接続診断から回答する。解決不能時は問い合わせへつなぎ、Premiumの優先有人対応とEnterpriseの個別SLAを分ける。

正本: `REQ-SCREEN-*`、`REQ-DESIGN-*`、`REQ-AOUI-*`、`REQ-UPSELL-08`。

## 9. 課金・Plan・Capacity

- 初期価格はEntry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜（月額換算・税別、税込額併記）。
- Entry／Standardは月契約または年契約、Premiumはセルフ年契約、Enterpriseは問い合わせ年契約。年契約はシステム利用料を10%割引する。
- Planは管理設定から追加・複製・改版・販売終了でき、既存契約は契約時Catalog versionを維持する。
- 利用量はquality別creditとCapacity Dimensionで制御する。月額付与creditは請求期間末、追加購入creditは最大180日で失効する。
- 自動チャージは初期OFF。ユーザーが有限／無制限の月間上限と自動購入を明示設定した場合だけ実行する。
- Entryは1 Site／3 user、Standardは3／10、Premiumは5／30、Enterpriseは個別を初期値とする。Premium以下は容量超過時にPremium以上を案内し、Premium以上は容量optionを購入できる。
- 高品質生成はStandard以上、専用リライトbackupはPremium以上、数値予測はStandard以上かつ直近28日1,000 click等のdata条件成立時に解放する。

正本: `REQ-BILLING-01〜16`、`REQ-COST-*`、Billing Capacity UI Map。

## 10. 技術・データ・非機能

- AWS配置を前提にWeb／API、worker、PostgreSQL、object storage、queue、監視を疎結合化し、機能単位のbulkhead、DLQ、冪等性、checkpoint再開を持つ。
- 本文、HTML、block、prompt、secret、Provider raw responseを恒久DBへ保存せず、Article Summary、hash、履歴、順位、Keyword、CV等の有界データを保持する。
- 顧客データはtenant／Site境界、Repository強制点、RLS、暗号化、step-up、監査、break-glassで保護する。顧客面と内部管理面を分離する。
- 主要画面は一般的Web指標とP95を監視し、重い処理は非同期化して通常ビュー／Officeで進行を体験化する。
- 初期内部目標はRPO 1時間／RTO 4時間。全体障害より機能単位の縮退を優先し、復元演習で達成性を検証する。
- LLMはProvider AdapterとModel Registryで分離し、特定modelを業務ロジックへ固定しない。OpenAI／Anthropicに加え、将来のKimi、Grok、Qwen、local model等へrouting可能な互換性を維持する。
- Core SEO機能は標準で成立し、追加Context、Connector、分析、Office Scene等をFeature Object／App Packageとして接続できる。Object停止時にCore全体を落とさない。

正本: `REQ-DATA-*`、`REQ-TECH-*`、`REQ-NFR-*`、`REQ-ACCESS-*`、AWS Operations Map。

## 11. 将来・段階リリース

- AI表示性／AI fetch・crawler可視性はGoogle、Microsoft系、ChatGPT、Perplexity、Gemini、Claude、Grok等を候補とするが、技術・提供条件が未確定なため構想・更新追従として扱う。
- server／edge log Connector、WordPress以外のCMS Adapter、本文画像、WP内専用編集、mobile Office Chat、高度3D／音声／着せ替え、第三者App Storeは段階リリースとする。
- 初期機能として表示せず、対応済みsurfaceと構想を区別する。

正本: Crawler／AI Visibility Logic、Open Items Register。
