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
| LB-06 | CMS write／Media／Preview／RevisionのWP契約 | WP版・Editor別Contract Test、反映確認 | CMS Connection Profile | 投稿機能β前 |
| LB-07 | Billing Ledger／reserve／commit／release／auto-chargeの整合 | 二重event、失敗、返金、照合fixture | Billing schema／Ledger | 有償Job開始前 |

## 4. Design decision

| key | 判断 | Blockする範囲 | 証拠／決定方法 |
|---|---|---|---|
| DD-01 | Recommendation Intake等の実JSON Schema配置・codegen | Workflow／Patch実装 | Contract Testとschema registry |
| DD-02 | new article／rewrite／automationの機械可読Workflow instance | Agent runtime | 状態遷移・checkpoint試験 |
| DD-03 | Source Extract第一陣のJSON Schema | Keyword／Report／Agent | fixture contract test |
| DD-04 | 日本語正規化・形態素解析engineと辞書version | Query matching／Cluster | 精度・速度・保守比較ADR |
| DD-05 | AWS compute、DB、queue、cache、Multi-AZ、隔離backup先 | 本番基盤 | 負荷・人数・費用・障害試験ADR |
| DD-06 | Site／Feature Object／Providerのqueue partitionとbulkhead | 非同期基盤 | 障害注入・capacity test |
| DD-07 | Office ProposalのDomain Command adapter | Office変更操作 | 通常ビューとの同一結果Contract Test |
| DD-08 | Featured Image Pattern Editorと画像回帰検査 | 画像生成 | UI操作・Provider・CMS Media試験 |
| DD-09 | GSC日次実績、Keyword Market Pool、global signalsのpartition・圧縮・rollup・BigQuery併用境界 | Data Mart／共有資産 | 想定件数を使った負荷・費用・復元比較ADR |
| DD-10 | 通知の保持期間、既読archive、Support会話TTL | 通知／Support | 法務・support運用・保存費用を使ったRetention Policy |
| DD-11 | near-duplicate、意味的一致、coherence、AI定型表現等の品質判定algorithm | Quality Gate | 日本語golden setのprecision／recall、latency、原価比較 |
| DD-12 | YMYL分類器、対象taxonomy、誤分類時の扱い | Quality Gate／公開確認 | 法務・品質reviewと日本語評価set |
| DD-13 | hard／advisory再分類とfew-shot・QA共通較正手順 | Pack／QA | 独立した正例・反例、回帰試験、人手評価手順 |

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

## 7. Migration debt

| key | 旧資産 | 現行規則 | 解消契機 |
|---|---|---|---|
| MD-01 | `REQ-BILL-*`と旧価格／credit条件 | `REQ-BILLING-*`とPrice Catalogが正本 | 課金詳細改版時 |
| MD-02 | Office監視専用・決定操作なしの2026-07モック記録 | Officeは詳細操作・会話Proposal面 | Office実プロト再構成時 |
| MD-03 | Owner／Admin／Editor／Viewer旧顧客Role | 契約者／サイトオーナー／ユーザー＋業務権限＋Site付与 | 認可実装時 |
| MD-04 | WP固有語と複製されたCompatibility記述 | CMS Connection Routing Map／Adapterが正本 | CMS実装slice時 |
| MD-05 | REQ見出しの旧埋込式 | 新規は見出し式、監査scriptは両形式 | 該当文書改版時 |

## 8. 運用規則

- 新しい未確定事項は、計測方法または判断証拠、設定／正本、確定時期を持たなければならない。
- `post_release_concept`を初期画面で利用可能に見せない。
- `operational_calibration`は計測不能ならLaunch可としない。
- `migration_debt`は旧値を有効化する理由にならない。
