# AI Office de SEO 現行要求→画面プロト改修台帳（2026-08-03）

## 1. 結論

現行プロトはビジュアル、画面部品、Officeの部屋・詳細ページ、Keyword／記事データの深掘りに再利用価値がある。一方、業務Lifecycle、契約、権限、Recommendation Intake、Office操作能力は旧要求のままであり、現行要求の受入プロトとしては未完成である。

本台帳は「画面を作り直す理由」と「再利用する部分」を分離し、見た目の全面作り直しではなく、業務正本と操作を現行化するための改修順を示す。

### 1.1 2026-08-03 pre-L3実装突合

`prototype/AI Office de SEO.dc.html`を実装行から再突合した。ブラウザ接続先がない環境での確認であるため、以下は文言、handler、state、遷移の証拠であり、見た目、クリック可能領域、scroll、animation、体感速度の実機評価ではない。視覚・操作実測は別途`visual_unverified`として残し、ソース確認だけで完了にしない。

確認できた再利用資産は、通常ビューの「今日のおすすめ」、対象別の「オフィスで詳しく見る」、Officeの部屋・詳細ページ、Keyword／記事の分析カード、通常／Officeで共有するlocal stateである。一方、Officeの役割説明、採用処理、Workbench遷移、Tour、S4責務は現行L1/L2へ追従していない。

## 2. P0 — 現行要求と正面衝突

| ID | 実コード証拠 | 問題 | 必要な改修 | 接続正本 |
|---|---|---|---|---|
| PROTO-01 | `PLAN_DEFS`が68,000／128,000／198,000／298,000円、プライム | 現行価格・名称・契約周期・税込併記と衝突 | Price Catalog fixture＋Plan Configuration fixtureから39,800／98,000／198,000／398,000円〜を表示。税別主表示＋税込併記 | Billing Capacity UI Map、PT-MIG／BILLUI |
| PROTO-02 | invoice fixtureが旧Standard 128,000円 | 旧価格を履歴ではなく現行請求として表示 | Subscriptionが参照したCatalog versionから請求fixtureを作る | `schema.billing.overview.v1` |
| PROTO-03 | member Roleがオーナー／管理者／編集者／閲覧者を循環 | 現行の契約者／サイトオーナー／ユーザー＋4業務権限＋Site付与と衝突 | 基本3区分、業務権限、Site付与を別controlにし、閲覧のみは業務権限なしで表現 | Authorization Operation Matrix、PT-AUTH |
| PROTO-04 | Office説明が「選ぶ・決めるは通常ビュー」「実行状況の確認」 | Officeを監視専用にしており現行の玄人向け詳細分析・運用と衝突 | 成果詳細、根拠探索、選択式操作、型付きProposal、共通Command接続を実装する | Agent Requirements Map、REQ-SCREEN-18 |
| PROTO-05 | Office詳細の多数CTAが通常ビューへ遷移 | Office内で完結すべき詳細分析・調整を外へ逃がしている | 同一ContextでOffice内Workbenchを開き、共通Projection／Commandへ接続する | PT-OFFICE-02〜07 |
| PROTO-06 | Content起点が手動Keyword選択中心 | Site導入→Report→月次計画→Recommendation→IntakeのLifecycleが見えない | Recommendation Queueを既定入口にし、採用時にfreeze済みIntakeを表示／引継ぐ | Action Routing Map、PT-REC |
| PROTO-07 | 新規／既存Site導入、戦略Report／診断Reportが画面として未成立 | GSCや市場母集団なしで推薦が出るように見える | 新規／既存の導入step、source availability、自動構築、Report、段階開放を追加 | Keyword Report Map、PT-REPORT／MARKET |
| PROTO-08 | 一律の承認fixture中心 | 新規15記事、解放後自動投稿、リライト承認、hard gate二段階確認の差が出ない | lifecycle別fixtureと承認条件、同意、残数、解放状態を表示 | PT-LC-05/06 |
| PROTO-21 | `recFbSet`／`recVals`が`adopted / later / rejected`をlocal stateへ直接保存し、Officeからも同じhandlerを呼ぶ | 現行の`accepted / accepted_with_edit / held / excluded`、Decision Eligibility version、Decision＋Intake原子性、影響・Credit・認可確認を通らない | Recommendation versionを対象に型付きDecision／Proposalを作り、`accepted*`時はIntakeと同時成立。Officeも共通Commandを使う | INV-RECOMMEND-001、REQ-SCREEN-18 |
| PROTO-22 | Tour・Office入口・コメント・NEXT ACTIONが「選ぶ・決めるは通常ビュー」「Officeは実行状況の確認」「役割分担どおり実行はしない」を繰り返す | PROTO-04/05が一部文言でなく、案内・実装思想・CTA全体へ残存している | Tour、入口copy、Office詳細CTA、menu、Workbenchを一括更新し、Office内の詳細分析・許可操作・Proposalを正規導線にする | REQ-DESIGN-09、REQ-SCREEN-18、INV-OFFICE-001 |

## 3. P1 — 操作と状態が未接続

| ID | 現状 | 必要な改修 | 接続正本 |
|---|---|---|---|
| PROTO-09 | Recommendation採用は画面遷移とtoast中心 | Recommendation／version／Intake／Job／評価のcorrelationを保持 | Intake Schema、PT-REC-01〜06 |
| PROTO-10 | 新規、リライト、内部link、CTAが画面上で混在 | Agent Workflow、軽量Patch、User escalation、MonitoringをAction typeで分岐 | Action Routing／Patch Map |
| PROTO-11 | 利用不可が個別ハードコード | Scope、incident、Permission、Capability、Plan、接続、data、credit、approval、processingの共通resolverを利用 | UI Availability State Map |
| PROTO-12 | 通知は固定fixture・既読中心 | 受信者resolver、popup、必須通知、購読、確認済み／対応済み、fallbackを追加 | Notification Routing Map |
| PROTO-13 | 課金はPlan選択とcredit購入中心 | Lot失効、自動チャージ、Dimension別Capacity、soft/hard、支払猶予、Plan変更影響を追加 | Billing Capacity UI Map |
| PROTO-14 | CMSはWordPress接続の単一状態 | read／write／Media／Editor／Preview／Revision／CapacityをCapability表示し、縮退と反映確認を分ける | CMS Routing Map |
| PROTO-15 | アイキャッチPattern Editorなし | Pattern、variation、ロゴsafe area、wireframe、見積、生成、Media割当を追加 | Featured Image Pattern Map |
| PROTO-16 | 評価は順位・click中心の固定story | 公開／更新起点、1/3/6か月、SEO、CTA/CV、認知、要監視、月次／累積を分離 | Business Lifecycle、Evaluation events |
| PROTO-23 | `WB_MAP`に`目標管理 → automation / goal`が残る | 月次目的・KPI・記事／予算配分の正本をS1プランニングとし、S4に目標管理を重複させない現行境界と衝突 | Officeの目標・配分操作はS1 Planning Contextへ接続し、S4は承認・予約・自動運用・予算上限・Kill Switchに限定 | Screen Inventory §5、REQ-BUS-06 |
| PROTO-24 | `later`が常に「明日のおすすめで再提案」と表示される | `held`の解除、Eligibility再評価、市場・順位・費用・目的の再判定を固定翌日へ丸める | 保留理由、再評価条件、次回確認予定を表示し、再提示時は同一または新Eligibility versionを明示 | Recommendation Portfolio、INV-RECOMMEND-001 |
| PROTO-25 | Recommendation Tourは「実行前に必ずプレビューと見積」と説明するが、`recVals.*Adopt`はlocal state変更後に画面遷移するだけ | Recommendation Decision、Intake、Execution Admission、見積、reserve、実行開始の段階が操作として検証できない | 通常ビューで`採用 → 実行準備 → 不足解消／見積確認 → 実行開始`を初心者向けに段階表示し、Officeでは同じAdmission証拠を詳しく表示 | REQ-SCREEN-02/03、INV-ADMISSION-001 |

## 4. P2 — 体験強化

| ID | 再利用するもの | 強化 |
|---|---|---|
| PROTO-17 | 7フロア、部屋、Agent、エレベーター、詳細ページ | 13 personaのService・会話・Proposal configを画面から実際に消費する |
| PROTO-18 | Keyword／記事の全件Office page生成 | Market→Share→Report→Plan→Recommendation→実行→評価のKnowledge Graphへ拡張 |
| PROTO-19 | WORK LOG、吹き出し、状態演出 | 手書き文言でなくTask／Event／Snapshot／Proposalから導出 |
| PROTO-20 | 暗色ネオンと通常ビューの業務SaaS theme | 3Dを段階強化しつつ、性能・reduced motion・2D縮退で同じ操作を保つ |

## 5. 改修順序

### 5.1 画面で検証してからL1/L2へ戻す項目

次の項目はL3で先に決めない。操作可能なfixtureを2案以上作り、SEO非専門者と詳細操作利用者の双方で意味が通るかを比較してからL1/L2へ戻す。

| Finding | 画面検証する問い | 固定しないもの | 還流先 |
|---|---|---|---|
| SF-UI-01 | 通常ビューのRecommendation採用後、どこまで自動で進み、どの不足時だけユーザーを止めると迷わないか。`AOS-PRE-L3-RECOMMENDATION-UI-VALIDATION`の一操作型と条件付きSheet型、REC-UI-01〜12を比較する | Modal数、step数、CTA配置。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-02/03、Recommendation／Admission境界 |
| SF-UI-02 | Officeで「少し触る」際、どこまでをinline選択にし、どこから型付きProposalまたはManual Intakeにするか。調整候補はfixtureの`adjustable_fields`として検証し、先に固定しない | object別adjustable field、Panel構成。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-DESIGN-09、REQ-SCREEN-18、Office Proposal |
| SF-UI-03 | 通常→Office→通常でSite、対象、version、filter、sort、一覧位置、Office内作業位置のどこまで保持すれば連続作業として理解できるか。`AOS-PRE-L3-STANDARD-OFFICE-UI-VALIDATION`の直結型／ハブ経由型とVIEW-UI-01〜14を比較する | URL／state実装、breadcrumb形。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-DESIGN-09、REQ-SCREEN-18 |
| SF-UI-04 | Officeの専門情報を`すぐ確認 / 詳しく見る / 相談・高度操作`へ段階開示し、標準3D／簡略3D／2Dでも同じ業務を完了できるか | 3D配置、カード密度、段階名、初期展開。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-DESIGN-09、REQ-AOUI-01/04/06 |
| SF-UI-05 | 新規／既存Siteの業務Stepと、分析・記事読取り・CMS送信の並行準備をどう見せれば、単一の「接続済み」へ誤認せず最短で利用開始できるか。`AOS-PRE-L3-SITE-ONBOARDING-UI-VALIDATION`の業務Step＋準備Tray／利用可能機能カードとONB-UI-01〜15を比較する | Step構成、準備Tray配置、準備率表示、部分開放copy。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-BUS-02、REQ-SCREEN-01、SiteBuildRun |
| SF-UI-06 | Keyword Market、Observed／Estimated／Article Share、新規戦略／既存診断を、カテゴリー／テーマ戦略単位でどう見せれば次の月次計画・Recommendationへ判断できるか。`AOS-PRE-L3-KEYWORD-REPORT-UI-VALIDATION`の判断Story＋Explorer／Cluster MatrixとKWR-UI-01〜19を比較する | 章立て、カテゴリー／テーマ戦略label、Matrix列、指標密度、Cluster操作粒度。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-BUS-02/04/05、REQ-SCREEN-09/18、KeywordReport |
| SF-UI-07 | 月次計画と週次実行予定を、権限別確定、カテゴリー／テーマ戦略の配分、Action別Admission、分散実行としてどう見せれば、計画確定＝全件起動と誤認しないか。`AOS-PRE-L3-MONTHLY-PLAN-UI-VALIDATION`の判断サマリー／月間配置ボードとPLAN-UI-01〜18を比較する | セクション順、権限待ち表示、見込み幅、Capacity待機表現、S1／S3／S4の遷移。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-BUS-03/05、REQ-SCREEN-01/18、Authorization、Capacity Admission |
| SF-UI-08 | Recommendation採用後の新規記事、リライト、軽量Patch、観測、保護、見送り、ユーザー対応、Automationを、Actionの意味に合う経路でどう見せるか。`AOS-PRE-L3-ACTION-EXECUTION-UI-VALIDATION`のACT-UI-01〜20で比較する | Action別進捗、通常／Officeの詳細差、LLM呼出し境界、非Agent Actionの終端表示。検証仕様作成済み、ブラウザ操作前のため`open` | Agent Requirements Map、Action Routing Map、REQ-SCREEN-04/18、INV-PRODUCTION-001 |
| SF-UI-09 | 同期操作を短く保ち、長時間処理を離脱可能なTaskとして扱い、全ページを先に表示し、データ画面をP95 3秒以内の判断可能状態へ到達させ、通常ビューのTask ShelfとOfficeの実stage演出で待たされ感を減らせるか。`AOS-PRE-L3-ASYNC-TASK-EXPERIENCE-UI-VALIDATION`のASYNC-UI-01〜24を比較する | Shelf位置、通知強度、stage表現、見込み範囲、部分開放、全route表示、3秒data contract、Office animation。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-TECH-05/06、REQ-SCREEN-04/05/11、REQ-DESIGN-05/08、REQ-NFR-01/02/04 |
| SF-UI-10 | 生成成果、CMS下書き、Preview、承認、予約、API受付、外部反映、評価登録を別状態で見せ、外部確認待ちでも全ページをP95 3秒以内の判断可能状態へ出せるか。`AOS-PRE-L3-CMS-PUBLICATION-UI-VALIDATION`のCMS-UI-01〜30を比較する | 状態文言、次操作、15件count、Preview経路、retry、通常／Office詳細差、3秒状態表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-04/15/19、REQ-INT-10、REQ-WPA-04、CMS Routing、Publication Attribution |
| SF-UI-11 | Site／カテゴリー・テーマ戦略／記事の成果を、SEO、CTA・CV、内部link、認知の別Lane、市場影響、外部変更、復元availabilityと共に表示し、次回Recommendation・月次再計画へ正しく還流できるか。`AOS-PRE-L3-CUSTOMER-OUTCOME-UI-VALIDATION`のOUT-UI-01〜34を比較する | 三階層drill down、順位段階、Lane比較、評価準備中、復元判断、通常／Office分析差、3秒状態表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-BUS-10、REQ-LOGIC-06/09/13/14、REQ-MEASURE-02/13/14、Customer Outcome Metrics Map |
| SF-UI-12 | Keyword、カテゴリー／テーマ戦略、記事、Recommendation、Task、成果の横断検索と一覧絞込みを、Site／権限／鮮度を保って通常画面・Officeへ接続できるか。`AOS-PRE-L3-INTERNAL-SEARCH-UI-VALIDATION`のSEARCH-UI-01〜32を比較する | Header検索、group、Scope切替、0件状態、部分結果、縮退、通常／Office route、戻りContext、3秒表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-09/10/21、REQ-DATA-16、REQ-TECH-20、Internal Search Index Map |
| SF-UI-13 | Dashboard、popup、通知Center、emailで同じ業務eventを重複させず、受信者別readとResource共通actionedを分離し、必須判断を通知OFF・digestでも失わず2遷移以内で処理できるか。`AOS-PRE-L3-NOTIFICATION-ACTION-UI-VALIDATION`のNOTIFY-UI-01〜34を比較する | Dashboard優先順、channel重複、recipient、fallback、購読、reminder、Lifecycle文言、再認可、3秒表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-01/19、Notification Recipient Routing、Authorization |
| SF-UI-14 | 年契約の月額換算と実請求総額、Creditのreserve／commit／失効、自動チャージ、Dimension別Capacity、Plan変更、past_dueを一つの残量や成功へ丸めず操作できるか。`AOS-PRE-L3-BILLING-CAPACITY-UI-VALIDATION`のBILL-UI-01〜44を比較する | Catalog version、税表示、年額総額、Ledger projection、stale再見積、権限、step-up、Upgrade／Downgrade、hard limit、3秒表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-16/17/22、Billing & Capacity UI、Commercial Entitlement |
| SF-UI-15 | 生成前Pattern設定を中心に、Pattern版、Image Job、採否、Media登録、featured割当を分離し、Editor操作で画像Providerを浪費せずアイキャッチをCMSへ渡せるか。`AOS-PRE-L3-FEATURED-IMAGE-PATTERN-UI-VALIDATION`のIMG-UI-01〜40を比較する | release境界、active/draft、slot、variation、ロゴ縮退、Credit、Automation採用、Media冪等性、3秒表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-15/23、REQ-LOGIC-10、Featured Image Pattern |
| SF-UI-16 | Plan Entitlementとデータ十分性を分離し、Site実測・業界cohort・global priorの利用比率、Upgrade／Downgradeのdata影響、通常／OfficeのMetric一致を誤認なく操作できるか。`AOS-PRE-L3-PLAN-DATA-FIDELITY-UI-VALIDATION`のFID-UI-01〜36を比較する | Plan lock、1,000 click、記事別可否、階層weight、confidence、coverage、rollup、検索履歴、semantic metric、3秒表示。検証仕様作成済み、ブラウザ操作前のため`open` | REQ-SCREEN-16/17/21/22、Data Fidelity、Metric Contract |

視覚検証ではdesktop標準viewport、狭幅、reduced motion、2D縮退を確認し、通常ビューの優先判断が埋もれないこと、Officeの詳細操作が演出に隠れないこと、往復時に対象を見失わないことを記録する。ブラウザ未接続のソース監査だけでこれらを`resolved`にしない。

1. fixture正本化: Price、Plan、Entitlement、Authorization、Site、Report、Recommendation、Intake。
2. 共通resolver: Availability、Recipient、Authorization、CMS Capability。
3. 通常ビューLifecycle: 導入、Report、月次計画、Recommendation、実行、評価。
4. Office専門分析・微調整: 通常ビューのRecommendation、成果、Keyword、記事、設定、TaskからContextを維持して入り、persona別Task説明、工程、待機理由、根拠、詳細分析、選択式の条件調整・Task操作を行う。通常ビューの結果と双方向同期し、監視専用面にはしない。
5. Billing／Capacity、Notification、CMS、Image等の横断画面。
6. Knowledge Graphと3D演出の強化。

## 6. 受入方法

見た目の目視だけでも、ソース文言・handlerの静的確認だけでも完了判定しない。`PT-LC / MIG / AUTH / MARKET / REPORT / REC / PATCH / CMS / OFFICE / STATE / NOTIFY / BILLUI / AWS / IMAGE / UX`のfixtureを操作し、通常ビューとOfficeが同じ業務entity、Command、Event、状態を使用することを確認する。各findingは`open / prototyped / validated / reflected_to_l1_l2 / ready_for_l3 / resolved`で管理し、`validated`とL1/L2反映なしにL3確定へ送らない。
