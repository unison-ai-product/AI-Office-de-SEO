# AI Office de SEO 未確定・較正・将来構想台帳（2026-08-03）

## 1. 目的

文書中の`TODO`、`open`、`未確定`、`要調整`を、要求欠落と実装時判断へ分離する。本台帳は進捗表ではなく、何をいつ、どの証拠で確定するかを監査するための索引である。

## 2. 状態分類

| class | 意味 | リリース判定 |
|---|---|---|
| launch_blocker | 販売・本番開始前に値、契約、実装、試験証拠が必要 | 未解消ならLaunch不可 |
| design_decision | 実装slice着手前にADR／Schema／契約を確定 | 該当sliceをblock |
| operational_calibration | 初期policyはあるが実測で較正する | 初期値と計測があればLaunch可 |
| post_release_concept | 後続版の構想。初期提供を約束しない | 初期Scope外として明示 |
| migration_debt | 正本順位と利用禁止は確定済みだが旧資料を保持 | 新規実装へ旧値を使わない |

## 3. Launch blocker

| key | 未確定内容 | 確定証拠 | 設定／正本 | 確定時期 |
|---|---|---|---|---|
| LB-01 | Plan別credit、Site／user、週次処理、Capacity、backup実数 | 実Job原価、負荷、利用率、復元容量 | Price Catalog／Plan Configuration | 価格表公開前、β後に販売version固定 |
| LB-02 | 追加credit 180日の法務・決済上の取扱い | 法務・決済事業者確認、契約表示review | Credit Lot Policy | 追加credit販売前 |
| LB-03 | Stripe本番rate・採用製品・支払方法 | 本番契約、test webhook、照合試験 | Provider Cost Table／Dunning Policy | 課金本番化前 |
| LB-04 | RPO 1h／RTO 4hの達成性 | full／tenant restore演習、整合試験 | AWS復旧ADR／Runbook | Production Hardening前 |
| LB-05 | 顧客認可・Site境界の実強制 | API／worker／Agent／Automation負テスト | Authorization Decision Contract | 外部β前 |
| LB-06 | CMS write／Media／Preview／Revision、自社ZIP配布・署名付き更新・SiteペアリングのWP契約実証 | WP版・Editor別Contract Test、改竄package拒否、ペアリングscope、反映確認 | CMS Connection Profile／Plugin Distribution Runbook | 投稿機能β前 |
| LB-07 | Billing Ledger／reserve／commit／release／auto-chargeの整合 | 二重event、失敗、返金、照合fixture | Billing schema／Ledger | 有償Job開始前 |
| LB-08 | 現行価格・契約・Plan構成・原価仮説に基づく財務モデル再生成 | 基準／保守caseの月次契約数、MRR、売上、原価、粗利、cash flow、churn、黒字転換を同一入力から再計算したversion付きmodelとreview記録 | 事業計画Financial Model。製品要求・Price Catalogの正本にはしない | 資金計画・販売目標の対外利用前 |
| LB-09 | 規約、Privacy Policy、特商法、匿名集計・事例利用、解約・返金の法務文書と同意version | 弁護士／責任者review、同意fixture、旧version再表示・撤回試験 | Legal Document Registry／Consent Policy | 外部β募集・有償契約前 |
| LB-10 | Google OAuth審査、GSC API利用規約、Scope・token保管・削除手順 | OAuth verification結果、規約適合review、接続／取消／削除試験 | Google Connection Policy／Security ADR | 一般顧客のGSC接続公開前 |
| LB-11 | 一般Planは内部SLO＋公開Status Page・返金保証なし、Enterpriseは個別SLAという提供条件の実装・運用実証 | SLO文書、障害訓練、Status Page fixture、顧客通知review、Enterprise service credit台帳試験 | SLO／Incident Communication Policy | Production公開前 |
| LB-12 | 適格請求書、Stripe Tax／請求書、特商法表示の実装・帳票整合 | 税務review、Stripe test invoice、返金・税額・端数照合 | Billing／Invoice Policy | 有償契約前 |
| LB-13 | 商標・domain利用可否、成果非保証を含む販売・広告表現 | 商標調査、法務／marketing review、公開文面version | Brand／Marketing Claims Policy | 公開Site・販売資料公開前 |
| LB-14 | 決定済みの運営指標、顧客視点Activation、継続・休眠・契約churn計測契約の実装検証と初期目標校正 | event-to-metric試算、欠損・重複fixture、cohort検証、初期目標review | Measurement Dictionary／Analytics Contract | β評価開始前 |
| LB-15 | 顧客成果指標の決定済み算式・市場補正・表示契約の実装検証と、Plan別外部SERP／AIO観測Capacity具体件数のβ原価校正 | GSC／CMS／Tracker fixture、決定表再現、Provider Cost実測、Plan別件数review | Customer Outcome Metrics Dictionary／Plan Configuration | 顧客向け成果Dashboard確定前 |

## 4. Design decision

| key | 判断 | Blockする範囲 | 証拠／決定方法 |
|---|---|---|---|
| DD-01 | Recommendation Intake等の実JSON Schema配置・codegen | Workflow／Patch実装 | Contract Testとschema registry |
| DD-02 | new article／rewrite／automationの機械可読Workflow instance | Agent runtime | 状態遷移・checkpoint試験 |
| DD-03 | Source Extract第一陣のJSON Schema | Keyword／Report／Agent | fixture contract test |
| DD-04 | 日本語正規化・形態素解析engineと辞書version | Query matching／Cluster | 精度・速度・保守比較ADR |
| DD-05 | AWS compute、DB、queue、cache、Multi-AZ、隔離backup先 | 本番基盤 | 負荷・人数・費用・障害試験ADR |
| DD-06 | Site／Feature Object／Providerのqueue partitionとbulkhead | 非同期基盤 | 障害注入・capacity test |
| DD-07 | resolved | Officeは玄人向け詳細分析・運用面とし、型付きProposalを所有BCの共通Domain Commandへ渡す。Office固有Domain Command adapterは持たない |
| DD-08 | Featured Image Pattern Editorと画像回帰検査 | 画像生成 | UI操作・Provider・CMS Media試験 |
| DD-09 | GSC日次実績、Keyword Market Pool、global signalsのpartition・圧縮・rollup・BigQuery併用境界 | Data Mart／共有資産 | 想定件数を使った負荷・費用・復元比較ADR |
| DD-10 | 通知の保持期間、既読archive、Support会話TTL | 通知／Support | 法務・support運用・保存費用を使ったRetention Policy |
| DD-11 | near-duplicate、意味的一致、coherence、AI定型表現等の品質判定algorithm | Quality Gate | 日本語golden setのprecision／recall、latency、原価比較 |
| DD-12 | YMYL分類器、対象taxonomy、誤分類時の扱い | Quality Gate／公開確認 | 法務・品質reviewと日本語評価set |
| DD-13 | hard／advisory再分類とfew-shot・QA共通較正手順 | Pack／QA | 独立した正例・反例、回帰試験、人手評価手順 |
| DD-14 | Accessibilityの正式準拠水準、対象画面・例外、手動／自動検証方式 | 通常ビュー／Agent Office／管理画面 | WCAG対応表、keyboard・focus・contrast・label・reduced motionの受入試験、採用tool ADR |
| DD-15 | Transactional Email provider、送信認証、bounce／complaint／抑制list連携 | 認証・通知 | provider比較、domain認証、bounce／suppression Contract Test |
| DD-16 | Embedding model、vector index、再計算・切替方式 | Knowledge／類似検索 | 日本語精度、latency、原価、再index時間の比較ADR |
| DD-17 | OTelを正本としたLLM trace補助toolと相関・保存境界 | Observability／Agent trace | trace相関fixture、PII除外、費用・保持比較ADR |
| DD-18 | Semantic Metric実行AdapterとAnalytics Store製品の段階採否 | Data Platform／通常・Office分析 | 4 Schemaの互換test、同一Metric fixture、移行・rollback ADR、ライセンス・運用比較 |

## 5. Operational calibration

| key | 初期仮説 | 計測 | 改版先 |
|---|---|---|---|
| OC-01 | 記事生成原価約350円 | 品質別token、画像、調査、Repair、cache、失敗、基盤配賦 | Cost Table／Price Catalog |
| OC-02 | 決済原価4.3% | 支払方法・製品・返金・chargeback別実績 | Provider Cost Table |
| OC-03 | Dunning 14日／最大8回 | 回復率、hard decline、問い合わせ、回収費 | Dunning Policy |
| OC-04 | 性能・SLO・alert閾値 | P50/P95/P99、error budget、queue age | SLO／Alert Policy |
| OC-05 | Quality／Repair／Routing | Gate fail、Repair収束、人手評価、原価 | Catalog／Routing Policy |
| OC-06 | Recommendation／評価閾値 | 1/3/6か月、月次／累積、季節性、AIO／広告影響 | Logic Config／Site補正 |
| OC-07 | Keyword Market Pool更新頻度・購入原価 | source鮮度、利用率、重複、API費 | Source Policy／Cost Table |
| OC-08 | k匿名しきい値、segment最小標本、prior縮小重み | 再識別risk、標本安定性、補正精度 | Network Learning Policy／Config Registry |
| OC-09 | URL Inspection quotaとランキング更新情報の取得経路・更新頻度 | quota消費、取得成功率、鮮度、原価 | Source Policy／Connector Config |
| OC-10 | Analytics Store移行閾値とPlan別Data Fidelity Capacity | scan量、ingestion backlog、storage、query P95、AWS費用、運用工数、Plan別coverage／freshness／grain／history | Data Platform ADR／Plan Configuration／Config Registry |

## 6. Post-release concept

| key | 構想 | 初期表示 |
|---|---|---|
| PC-01 | Google／Microsoft／ChatGPT／Perplexity／Gemini／Claude／Grok等のAI表示性観測 | 対応予定。実測不能surfaceを測定済みと表示しない |
| PC-02 | AI／SEO Botのserver／edge log Connector | 問い合わせ・調査機能。初期必須導線にしない |
| PC-03 | WordPress以外のCMS Adapter | 未検証。Publication Contractだけ先行維持 |
| PC-04 | 本文中画像、画像配置、追加size展開 | 初期はアイキャッチ基盤だけ |
| PC-05 | WP内専用編集UI、差分Editor | 後続。初期はWP標準Editorを正本候補にしない |
| PC-06 | モバイルOffice Chat・通知・簡易指示 | 初期PC標準。対応済みと誤表示しない |
| PC-07 | 外部開発者向けApp Store／第三者Object | 初期は自社Objectだけ。審査・課金・securityは別判断 |
| PC-08 | 高度3D Office／音声／着せ替え | 業務・性能・accessibilityを満たす後続表現 |
| PC-09 | News／YouTube等の需要観測Source | 初期必須機能にせず、provider・規約・費用の検証後にSource Objectとして追加 |

## 7. Migration debt

| key | 旧資産 | 現行規則 | 解消契機 |
|---|---|---|---|
| MD-01 | `REQ-BILL-*`と旧価格／credit条件 | `REQ-BILLING-*`とPrice Catalogが正本 | 課金詳細改版時 |
| MD-02 | Officeを監視専用とした2026-07〜08記録 | 通常ビューは簡単操作、Officeは玄人向け詳細分析・運用 | Office実プロト再構成時 |
| MD-03 | Owner／Admin／Editor／Viewer旧顧客Role | 契約者／サイトオーナー／ユーザー＋業務権限＋Site付与 | 認可実装時 |
| MD-04 | WP固有語と複製されたCompatibility記述 | CMS Connection Routing Map／Adapterが正本 | CMS実装slice時 |
| MD-05 | REQ見出しの旧埋込式 | 新規は見出し式、監査scriptは両形式 | 該当文書改版時 |

## 8. 運用規則

- 新しい未確定事項は、計測方法または判断証拠、設定／正本、確定時期を持たなければならない。
- `post_release_concept`を初期画面で利用可能に見せない。
- `operational_calibration`は計測不能ならLaunch可としない。
- `migration_debt`は旧値を有効化する理由にならない。

## 9. L3 Decision Table全件対応

L3 Decision Tableの項目を次の分類へ必ず接続する。本表にないL3 Decision IDを追加してはならない。`decided`は判断内容が確定したことを表し、実装・試験完了を意味しない。

| L3 ID | 横断分類／対応key | 現在の意味 |
|---|---|---|
| D-01 | DD-01の前提 | Config契約は決定済み、migration実装待ち |
| D-02 | DD-02 | Workflow契約決定済み、機械可読artifact・試験待ち |
| D-03 | LB-05 | 認可Decision契約はGate A-2で決定済み。全実行経路への実装と負テスト証拠がLaunch blocker |
| D-04 | DD-03 | Source Extract契約決定済み、schema file・fixture試験待ち |
| D-05 | DD-04 | 日本語形態素解析・辞書version |
| D-06 | OC-01／OC-05 | Provider互換Routing、初期Model Registry、原価実数 |
| D-07 | DD-15 | Email provider、認証、bounce／抑制連携 |
| D-08 | DD-05／DD-06 | Queue方式と専用MQへの移行条件 |
| D-09 | DD-05 | AWS前提は決定、具体service構成はADR待ち |
| D-10 | DD-16 | 埋め込みmodel、vector index、再計算方式 |
| D-11 | DD-11 | 日本語可読性。決定まではadvisory |
| D-12 | LB-01／OC-07 | Keyword／SERP provider契約上限と原価 |
| D-13 | PC-09 | News／YouTube観測の提供可否。初期機能として表示しない |
| D-14 | DD-09／DD-10 | Source別Retention、TTL、圧縮、保存境界 |
| D-15 | LB-01／OC-01 | credit原価単位、品質係数、販売枠 |
| D-16 | LB-09 | 規約、privacy、特商法、同意、匿名集計、事例、解約・返金 |
| D-17 | OC-09 | URL検査quotaとランキング更新情報の取得経路 |
| D-18 | PC-01 | AI表示性providerの四半期再検証 |
| D-19 | OC-01／OC-05 | Prompt cache価格・TTL・routing原価 |
| D-20 | DD-05／DD-06 | tenant資源profileとnode密度 |
| D-21 | LB-04 | RPO／RTO達成性 |
| D-22 | DD-02／DD-06 | 耐久Agent runtime方式 |
| D-23 | DD-17 | OTelを正本としたLLM trace補助手段 |
| D-24 | DD-02／DD-03 | Mock Executor、event、fixture共用方式 |
| D-25 | DD-11／DD-13 | Golden evaluation set |
| D-26 | DD-11／DD-13 | 技法principles、検品lens、few-shot本文 |
| D-27 | DD-11／DD-13 | segment、human voice、AI定型表現辞書 |
| D-28 | DD-14 | 最低品質項目は要求済み。正式準拠水準、対象範囲、自動・手動検証方式が画面実装前の未決事項 |
| D-29 | LB-10 | Google OAuth審査・API規約適合 |
| D-30 | decided／LB-06 | 初期βは自社ZIP配布＋署名付き更新。WordPress.org申請は後続open item、配布・ペアリング実証はLB-06 |
| D-31 | decided／LB-11 | 一般Planは内部SLO＋公開Status Page・返金保証なし、Enterpriseだけ個別SLA。運用実証はLB-11 |
| D-32 | LB-03／LB-12 | 適格請求書、Stripe税・請求書、特商法表示 |
| D-33 | decided／launch作業 | 累計10社Trial方針は決定、cohort実数登録待ち |
| D-34 | LB-13 | 商標、domain、成果非保証を含むmarketing表現規約 |
| D-35 | decided／LB-14 | North Star、顧客視点Activation、継続、休眠、契約churnの定義は決定。実装fixtureと初期目標校正はLB-14 |
| D-36 | DD-18／OC-10 | Semantic Metricの4契約とPort境界は決定済み。製品採否、移行閾値、Plan別Capacity実数は負荷・原価計測後に確定 |

### 9.1 台帳整合規則

- L3 Decision TableへIDを追加した変更では、本表へ同じIDを追加する。
- `launch_blocker`は法務・契約・審査・実証等の外部証拠が揃うまで未解消とする。
- `design_decision`は対象sliceの着手前にADR、schema、policyまたはcontract testのいずれかへ確定内容を吸収する。
- `operational_calibration`は初期値、計測event、改版先が揃って初めてLaunch可能とする。
