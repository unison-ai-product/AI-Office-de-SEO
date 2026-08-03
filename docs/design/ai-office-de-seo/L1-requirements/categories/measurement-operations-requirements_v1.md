---
document_id: AOS-L1-MEASUREMENT-OPERATIONS-REQUIREMENTS
title: AI Office de SEO 計測・運用要求 v1.2
version: 1.2
layer: L1
kind: measurement_operations_requirements
status: draft
updated_at: 2026-08-03
---

# AI Office de SEO 計測・運用要求

## 責務

製品、SEO、品質、性能、コスト、障害を何で測り、異常時にどう対応するかを定義する。

計測対象:

- レコメンド生成数、採用率、編集率、却下率、反復率、実施後効果
- ArticleSummaryの本文取得省略率、保存量、再解析率、完全性
- GSCマッチ率、カバー率、Query Drift、カニバリ
- 生成品質、Repair収束、hard gate、Publication Jobから検証済みPublication Factへの到達率
- API、DB、画面、キュー、バッチの性能
- token、cache、credit、Provider原価、粗利
- SLO、エラー率、再試行、復旧、サポートSLA

運用対象:

- alert、incident、runbook、Kill Switch
- backup、restore、retention、cleanup
- model/config/catalog rolloutとrollback
- support escalationとナレッジ還流
- capacityとスケール判断

incident発生後の封じ込め、顧客連絡、復旧、補償、postmortemは `incident-warranty-requirements_v1.md` を正本とする。

既存ソース: `ai-office-de-seo-admin-console-requirements_v3.7.md`、`ai-office-de-seo-security-observability-requirements_v3.7.md`、`ai-office-de-seo-development-unit-roadmap_v3.7.md`。

## 要求

### REQ-MEASURE-01 確実性優先のページイベント

記事の行動計測は、ページ表示、遷移元・遷移先、明示的に識別できるCTAまたはボタン遷移、指定サンクスページ到達を基本イベントとする。推測によるクリック・CV補完を行わず、重複排除、bot除外、同意状態、計測欠損を記録する。

### REQ-MEASURE-02 CV定義

CVはSiteごとに到達URLまたは明示イベントを設定し、定義versionと有効期間を持つ。サンクスページ到達等の決定条件を満たした場合だけCVとして計上し、複数到達・再読込・戻る操作の重複規則を定義する。

Siteは問い合わせ、資料請求、購入、予約、採用応募等の複数CV Goalを持ち、検索インテント分類と月次目的から当月の優先CVを決める。記事は狙うCV、CV獲得難度、サイト認知、cluster充足、内部link先等の目的を持ち、CVを獲得しにくい記事を「CVを狙わない記事」として除外しない。

CTA施策は変更月と累積の双方で、対象記事、記事目的、CTA遷移、CV到達、母数、計測欠損を評価する。CTA変更はCV評価の起点だけを更新し、SEO評価周期をリセットしない。母数不足時は成功・失敗を確定せず観測を継続する。サイト認知への貢献は表示、獲得keyword、関連ページへの遷移、指名・ブランドquery等、取得可能な代理指標をavailability付きで示し、単一指標から因果を断定しない。

### REQ-MEASURE-03 軽量保持

詳細イベントは推薦・施策効果の判定に必要な最小項目だけを取得し、短期保持後に日×URL、日×遷移元×遷移先、日×URL×CTA、日×到達URL×Goal、日×直前遷移元×到達URL×Goalへ集約する。生イベントの保持期間、Site当たり上限、遅延到着、削除、再集計を定義し、分析要望ごとに無制限なイベント項目を追加しない。個別user／sessionを集約keyにせず、単ホップ集計から複数ページ経路を復元しない。

### REQ-MEASURE-04 軽量Tracker

初期計測はCMS内部ロジックへ密結合せず、非同期で読み込む単一のversion付きJavaScript Trackerを使用する。初期自動取得はpage viewとURL遷移に限定し、CTAは明示的なdata属性または登録selector、CVは設定済み到達URLで判定する。送信はページ表示を妨げない `sendBeacon` 等の非同期経路とし、失敗してもページ操作を停止しない。

Trackerはcookie、常時heartbeat、MutationObserverによる全DOM監視、全click自動取得、heatmap、session replay、フォーム入力取得、スクロール高頻度送信を初期機能に含めない。設定はサーバー側のSite Configurationで変更し、計測項目の追加だけを理由にSite側scriptを頻繁に差し替えない。

再送重複は同一`event_id`の期限付きdedupeで除外する。サンクスページの再読込・戻る操作は、Clientが同一CV到達について保持する短期`occurrence_id`を再利用し、Serverはhash化したdedupe keyを処理TTL内だけ保持する。これは個人・session・経路の識別子として保存せず、TTL後は集計値と重複除外countだけを残す。Clientが同一到達を識別できない場合は推測で除外せず、計測制約としてavailabilityへ記録する。

### REQ-MEASURE-05 運用Telemetry・Dashboard

平常時運用は `REQ-NFR-13/14` のmetrics、logs、tracesを、ユーザー経路、API、queue、AI Provider、CMS、GSC、課金、Tracker、database、cacheごとのdashboardへ集約する。各panelはSLO、error rate、latency、traffic、saturation、queue age、DLQ、cost anomaly、data freshnessを必要な粒度で表示し、tenant/site別調査へ安全にdrill downできる。

### REQ-MEASURE-06 Alert設計

alertは症状、影響範囲、severity候補、owner、runbook、相関IDまたは検索条件を持つ。単一エラーではなく継続時間、割合、件数、error budget消費、queue age等でactionableにし、同一原因のalert stormを集約する。通知先不達、acknowledgeなし、長期継続時のescalationを検証する。

### REQ-MEASURE-07 Runbook・定常操作

再試行、DLQ redrive、接続再認可、Tracker確認、cache失効、job取消、capacity変更、Feature Flag rollback等の定常操作は、前提、権限、対象範囲、実行手順、成功確認、rollback、監査eventを持つrunbookへ接続する。本番DBの直接更新をrunbookの通常手順にしない。

### REQ-MEASURE-08 Backup・Retention・Cleanup検証

backup作成だけでなくrestore test、PITR到達性、object lifecycle、通知90日、監査1年以上、保留job 7日、本文一時領域TTL、集約・削除jobの成功を計測する。失敗・遅延・容量超過はalert化し、削除不能を正常完了として扱わない。incident発生後の復旧判断は `REQ-IRG-*` を参照する。

### REQ-MEASURE-09 Rollout・Rollback観測

model、Prompt、Catalog、Tracker、Plugin、Feature Flag、application releaseは、version、対象tenant/site、canary比率、開始・終了、主要KPI、停止条件を記録する。新旧群の品質、error、latency、costを比較し、停止条件到達時は自動または承認済み操作でrollbackできる。

### REQ-MEASURE-10 Capacity・負荷運用

API、worker、queue、database、storage、Provider quota、WordPress送信、GSC取得のcapacityを予測・実績で監視する。対話APIを優先し、閾値到達前にbatch同時数、優先度、rate limit、scale設定を変更する。増強判断は需要、SLO、費用、運用人数を併記し、単純な常時過剰provisioningを既定にしない。

### REQ-MEASURE-11 Support・改善還流

顧客申告、alert、job失敗、操作問い合わせを相関ID、分類、回避策、原因、解決versionへ接続し、同一問題を検索可能にする。再発傾向は要求、runbook、監視、FAQ、テストへ還流し、個別担当者の記憶だけを運用正本にしない。

接続・同期障害は認証、WAF／network、rate limit、schema／Capability、本文欠落、JavaScript依存、外部Provider、AI Office内部処理へ機械分類する。顧客向けFAQチャットは分類結果をそのまま開発用語で見せず、顧客側で必要な操作、システム側で対応中、問い合わせが必要のいずれかへ変換して案内する。内部ログ、trace、相関ID、経路切替履歴は開発・support面だけで参照し、FAQ回答と担当側の切り分け根拠へ接続する。

接続異常はWAF／認証拒否、rate limit、schema・Capability変更、本文欠落、JavaScript描画、外部Provider障害、内部Adapter・worker障害等へ機械分類する。顧客向けFAQチャットは公開可能な診断code、影響範囲、Site側かシステム側か、確認手順、ユーザーが実施できる設定、問い合わせ要否を受け取り、関連FAQまたは対応状況を案内する。内部log、secret、stack trace、他tenant情報をチャットへ渡さず、システム側障害をユーザー設定の問題として案内しない。

### REQ-MEASURE-12 検索・AI可視性ファネル

将来本機能を提供する場合、検索およびAI面を `取得可能 → 実取得 → 検索候補・回答取得 → 順位／引用／言及 → 参照流入 → CV` の段階で計測する。ユーザー画面は「SEO／AI取得性」と「検索順位／AI回答表示性」の二軸候補とするが、内部データでは各段階を分離し、crawlをindex・citationの証拠、citationを流入・CVの証拠として扱わない。

候補Provider、DataForSEO等の集約API、公式Webmasterデータ、直接観測はCapability Catalogで入替可能にし、特定取得元をL1で標準Providerとして固定しない。提供時はBuy／ブランドquery中心とし、availabilityと観測方法を表示する。AI面を通常検索実績へ合算するProviderでは、分離不能な値を推定でAI専用値に割り当てない。

二軸は `取得高・表示高=維持／保護`、`取得高・表示低=選択性・内容・根拠・競合を診断`、`取得低・表示高=cache・第三者・過去取得等を確認し技術要監視`、`取得低・表示低=取得障害を先に診断` の決定表へ接続する。総合点だけで原因を隠さず、構成値、confidence、未観測理由、最終観測日時を保持する。

### REQ-MEASURE-13 プロダクト指標・Activation・継続稼働

指標は視点を明示して分離する。運営側指標は、運用Loop完了Site数をNorth Starとし、Recommendation採用率、継続稼働率、アップセルevent、契約churnを併記する。MRR、契約数、契約churnは営業・価格・外部要因の影響を受ける経営指標であり、North Starへ使用しない。経営指標の正本は `BR-KPI-001`〜`BR-KPI-008` とする。

顧客側の成果指標は、顧客Siteの検索流入、獲得keywordと順位、公開・更新数、CV、cluster充足等、SEO代行の結果として顧客へ示す値であり、運営側指標へ混合しない。指標ごとの評価対象、基準期間、市場影響、availability、成果非保証、通常ビューとOfficeの表示契約は `REQ-MEASURE-14` を正本とする。通常ビューは要約と簡単なdrill down、Agent Officeは同じ成果Projectionを使う玄人向け詳細分析を提供する。

運用Loopは `分析・Recommendation → 採用 → ai_office_publicationの検証済みPublication Fact → 評価対象登録` で構成する。Loop完了点は、Recommendation／Interventionへ相関したPublication Factを起点に、評価基準値、`effective_at`による評価起点、1カ月・3カ月・6カ月の評価予定が登録された時点とする。GSCデータ取得開始、Recommendation採用、CMS下書き、予約、API受付、外部変更、帰属確認中、評価画面の閲覧だけではLoop完了にしない。月内に1回以上Loopを完了したdistinct SiteをNorth Starへ1 Siteとして数え、同一Siteの複数完了件数は診断指標へ分離する。

Activationは顧客が初回価値を受け取った時点として、`Site設定完了 → CMS接続完了 → 分析・Recommendation提示 → 初回Recommendation採用に相関するai_office_publicationのPublication Fact` の4段階で計測し、第4段階をActivation到達とする。予約、下書き、API成功、`external_change`、`unknown_source`では到達させない。第3段階到達・第4段階未到達のSiteを最優先の改善対象として、件数、滞留時間、失敗工程、未完了理由を可視化する。分析・Recommendation提示だけをActivationとして扱わない。

継続稼働の強いsignalは、Recommendation採用、記事公開／更新のCMS反映、月次計画確定のいずれかに限定する。画面閲覧、施策評価閲覧、ログイン、通知既読だけを継続稼働へ算入しない。休眠はActivation到達済みSiteだけを対象とし、`max(activation_at, last_strong_activity_at) + 30日` を到達した時点で判定する。未Activation Siteは休眠ではなくOnboarding停滞へ分類する。

財務計画の月次churn 5%／10%シナリオは契約解約だけを分子にする。休眠Siteは解約へ合算せず、先行指標として別表示する。複数Siteを持つ契約ではSite休眠・Site停止を契約解約とみなさない。算式、データ源、集計周期、除外条件は `ai-office-de-seo-product-business-metrics-map_v1.md` を正本とする。

### REQ-MEASURE-14 顧客成果指標

顧客成果はSite全体、Keyword Cluster、記事の3階層で保持する。通常ビューのS1／S2／S5はRecommendation主導の要約と簡単なdrill downを提供する。Agent OfficeのA0〜A8は同じ成果Projectionを、Task、Agent、Recommendation、根拠、市場影響、変更履歴と横断する玄人向け詳細分析として表示する。Officeで成果値を別計算せず、条件変更は型付きProposalと共通Commandを使用する。詳細な画面割当ては `ai-office-de-seo-customer-outcome-metrics-map_v1.md` を正本とする。

公開・更新実績は`schema.publication.fact.v1`を正本とする。AI OfficeのPublication Decision／Job、CMS Delivery、外部post ID、対象version／content hash、CMS反映検証が同一correlationへ接続したFactだけを`ai_office_publication`として主実績へ算入する。検知変更に一致するAI Office Command／Deliveryがない場合は`external_change`としてAI Office実績数から除外する。event欠損、correlation不成立、接続切替、複数候補等で帰属を確定できない場合は`unknown_source`としていずれにも算入せず、再照合期限・不足source・次回probeを持つ「取得元確認中」へ送る。時刻の近さだけでAI Office実績へ推定帰属しない。

WordPressで利用可能な場合の優先経路はThin Plugin署名付きWebhookとし、利用不能なSiteではCMS Connection Routing Mapが選んだnative webhook、REST modified、RSS／sitemap等の観測sourceを使用する。検知経路の違いを成果source分類そのものへ混入させず、provenanceとconfidenceを保持する。

`external_change`の存在と成果への影響は分けて判定する。title、主要見出し、本文等の実質変更はSEO評価、CTA、遷移先、CV導線の変更はCV評価の交絡要因へ含め、外部変更後の改善をAI Office単独成果と表示しない。誤字、余白、色、意味を変えない装飾等は変更履歴へ残すが、それだけでSEO／CV評価全体を「評価準備中」にしない。分類は`REQ-LOGIC-13`の決定論結果とrule versionを参照する。

順位の顧客向け段階は、割当Clusterに対するGSC URL×Queryのimpression加重平均掲載順位を7日移動窓で算出し、`圏内到達=50位以内、上位化=10位以内、トップ確保=3位以内` とする。100位以内は内部進捗signalに限定し顧客向け成果名にしない。外部順位計測はGSC欠損時または固定Keywordの補助観測とし、sourceを明示してGSC値へ混合しない。段階下降には別の退出閾値と継続日数を持つhysteresisを適用し、単日値で段階を往復させない。`protect` はリライト抑制等の運用flagであり、成果段階と別field・別表示にする。

成果分類は同じ入力・rule versionから同じ結果を返す決定表で `施策後に改善／市場変化の影響／評価準備中` の3表示へ写像する。検索volume、GSC impression、organic CTR、AIO出現率、listing出現率、外部変更、index・計測availabilityを入力とし、LLMの自由判定を使用しない。内部reason code、閾値、入力期間、source freshnessを保持する。データ不足や交絡で確定できない場合、顧客へは「判定不能」ではなく、不足理由と次回評価日を伴う「評価準備中」または外部変更がある旨を表示する。

CVは `REQ-WPA-05`、`REQ-INT-01/03` を優先し、自前JavaScript Trackerの日別・URL別・Goal別集計を正本とする。GA4等は補助sourceであり混合しない。複数ページのsession・経路を保存・復元せず、CV到達eventが持つ直前遷移元URLだけを単ホップ集計して「直前ページからのCV到達」として月次・累積表示する。これは相関ベースの補助指標であり、厳密な因果またはmulti-touch attributionとして表示しない。

## 受入条件

- [ ] AC-L1-MEASURE-01: 同一のページ遷移から再現可能なイベント結果が得られる。
- [ ] AC-L1-MEASURE-02: 複数CV Goalを検索インテント・月次目的・記事目的へ接続し、定義versionと重複規則に従ってCVを計上し、CTA施策を変更月と累積で評価できる。
- [ ] AC-L1-MEASURE-03: 生イベントが日×URL、単ホップ遷移、CTA、URL×Goalへ集約後に期限削除され、user／session／複数ページ経路を残さず、記事遍歴と施策評価は維持される。
- [ ] AC-L1-MEASURE-04: 単一の非同期Trackerでpage view、単ホップ遷移、明示CTA、到達URL CVを計測でき、同一event／CV到達の短期dedupeが機能し、未提供の高度計測を読み込まずページ表示を阻害しない。
- [ ] AC-L1-MEASURE-05: 主要経路のSLO、error、latency、queue、Provider、cost、freshnessをdashboardから相関調査できる。
- [ ] AC-L1-MEASURE-06: alertが影響・owner・runbookを持ち、storm集約と未応答escalationを検証できる。
- [ ] AC-L1-MEASURE-07: 定常復旧操作を本番DB直接更新なしでrunbookどおり実行・rollback・監査できる。
- [ ] AC-L1-MEASURE-08: backup restore、保持、TTL、cleanupの失敗・容量超過を検知できる。
- [ ] AC-L1-MEASURE-09: canaryの新旧KPIを比較し、停止条件から対象versionをrollbackできる。
- [ ] AC-L1-MEASURE-10: capacity予測から対話API優先のscale・rate・batch制御を実行できる。
- [ ] AC-L1-MEASURE-11: support事例を相関IDと解決versionへ接続し、要求・runbook・テストへ還流できる。
- [ ] AC-L1-MEASURE-12: SEO／AIについて取得性と表示性を二軸表示し、内部では取得・候補化・順位／引用／言及・流入・CVを分離して、4象限から異なる診断へ接続できる。
- [ ] AC-L1-MEASURE-13: Recommendation採用に相関する`ai_office_publication`のPublication FactでActivationへ到達し、同Factから評価基準値・起点・1／3／6カ月予定を登録した時だけLoop完了として月次distinct Siteを算出できる。予約・下書き・API受付・外部変更・帰属確認中を除外し、強いsignalだけの継続稼働、Activation後30日の休眠、契約解約だけの月次churnを同じevent契約から再現できる。
- [ ] AC-L1-MEASURE-14: 顧客成果をSite／Cluster／記事の3階層で保持し、通常ビューでは要約・簡単操作、Agent Officeでは同じProjectionによる玄人向け詳細分析として表示できる。Publication FactからAI Office実績・外部変更・帰属確認中を再現し、GSC順位段階とprotect flag、市場補正3分類、自前Trackerの単ホップCVをsource・rule version付きで再現できる。
