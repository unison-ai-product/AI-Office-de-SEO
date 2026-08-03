---
document_id: AOS-L3-SCREEN-INVENTORY
title: AI Office de SEO 画面一覧（プロト対象・責務・データ・状態） v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-08-03
related_plan: PLAN-L3-02-ai-office-de-seo-screen-prototype
---

# AI Office de SEO 画面一覧（プロト対象）

画面プロトモデルの正本台帳。責務は REQ-NAV-04、2モード共有は REQ-AOUI-01、表示状態は REQ-SEC-06 に従う。


## 0. 情報構造と操作の規約（全画面共通）

- レイアウトは**左サイドメニュー（第一階層7項目＋グローバル要素）＋画面内タブ（第二階層）＋パネル/ドロワー（第三階層=詳細・編集）**（REQ-NAV-02）。
- **1タブ=1目的の原則（2026-07-08制定）**: 1画面（1タブ）に複数の目的を縦積みしない。目的（ユーザーの用向き）が変わるところでタブに切る。セクション追加時はまず所属目的を決め、既存タブの目的と一致しない場合は新タブ／タブ分割で受ける（第一階層7項目は不変のまま第二階層で吸収）。タブには役割キャプション（例: S2「キーワード起点 —…」）を付す。
- 各行は表示だけでなく**操作（追加・編集・削除・実行・選択）を明記**する。明記のない操作をプロトで省略しない＝閲覧専用に倒さない（AC-NAV-05）。
- グローバル要素に、画面Contextと接続診断へ連動するFAQチャット、問い合わせ、公開ステータスページ（REQ-PRODUCT-16）、**サポートパネル起動（W10、REQ-PRODUCT-22）**、**グローバル検索（REQ-PRODUCT-15）**を常設する。FAQチャットは先頭に「この画面でできること」のページ単位ガイド（現在画面に連動した画面名＋平易な説明＋初手ステップ）を表示し、解決不能時はContextを保持して問い合わせへ進む。
- 全画面は表示状態の5類型（通常/読込中/計算中=事前計算待ち（空表示ではなく計算中状態＋再試行手段）/空/エラー）を持つ（REQ-SEC-06の事前計算配信と整合。プロト実装から規約化。検証: AC-PERF-03）。
- WordPressプラグイン内部の管理UIは本台帳の対象外で、REQ-WPA-01/REQ-WPA-07が規定する。一方、SaaS側S7のZIP取得、Siteペアリング、セットアップガイド、接続・version・署名付き更新状態は本台帳の対象とする。
- 2軸: システムおすすめ軸（機械判定の施策候補）／ユーザー探索軸（自分で選ぶ）を各画面が持つ。記事制作・リライトではおすすめ軸を主導線、探索軸を補助導線とする（REQ-AOUI-05、REQ-PRODUCT-24）。
- キーワード優先度: S1/S2/S3のrecommendationは、市場圧力（AI検索・広告占有・トピック信用適合）と戦略目的（サイトに必要・流入機会・CV機会）を別成分で表示する。現在の戦略プロファイルと優先理由を示し、総合点だけを表示しない（REQ-KGA-17/23）。
- ワークベンチの実装形（プロト実績の追補・v3.7.49）: W画面はW1共通枠での1画面占有を既定とするが、定常設定・制御と一体のもの（W8緊急停止/おまかせ制御・W9同意/テナント切替）は対応するS画面（S4/S7）内の常設セクションとして実装してよい。到達規約（通知→対処2遷移以内・Kill Switchへの1操作到達）は実装形に関わらず不変。
- 内部用語の非表示: Pack / Ticket / Dynamic Post Schema / GSC Data Mart 等を第一階層・一般画面に出さない（REQ-NAV-01）。**ドメイン用語のUI表記は用語集（AOS-L2-GLOSSARY）の「UI表記対応表」を正本とする**（ジョブ→タスク・ブリーフ→指示書・アサイン→割当・承認キュー→承認待ち・レギュレーション→執筆ルール等。書面・イベント名・状態機械・ID体系 J-#### は内部用語のまま不変）。
- データ契約: モックデータは Source Pack JSON（REQ-PACK-07）と schema.snapshot.*（AOS-L3-CONTRACT-SCHEMAS）に準拠する。プロト独自のデータ形を作らない。
- 描画規約: テキスト・数値・表・グラフ・フォーム・ログ・ボタンはHTML/CSS。画像は背景・キャラ・部屋・装飾・看板枠のみ（REQ-NAV-05 / REQ-AOUI-03）。

### 0.1 現行業務Lifecycleによる画面責務の上書き（2026-08-03）

第一階層S1〜S7は再利用するが、旧プロトの画面起点ではなく、次の業務Lifecycleを画面間の正本とする。

`Site導入 → 市場探索／既存データ取込 → Keyword分析・Cluster化 → 戦略／診断Report → 月次計画 → Recommendation → 採否 → Agent実行 → CMS下書き／公開 → 1・3・6か月評価 → 学習・再推薦`

| Lifecycle | 主画面 | 画面責務 | 次へ渡す正本 |
|---|---|---|---|
| Site導入 | S7内Site構築Stepper | 新規／既存、Site・業界／業種・商品・顧客・地域・横断軸、CMS、GSC、Keyword uploadの成立状態を表示 | `SiteSetupContext`、connection availability |
| 市場探索／既存取込 | S2構築中View | 新規はbig keyword方向確認、既存はGSC・upload・Site記事を統合。処理済み領域から段階開放 | market seed、Keyword Candidate、source provenance |
| 分析・Cluster化 | S2 Keyword | 市場全体、主＋補助Keyword、intent、funnel、業界、商品、顧客、地域、AIO／広告、記事対応をCluster単位で表示 | `KeywordCluster`、market/share read model |
| 戦略／診断Report | S2 Report tab / W1 | 新規Siteは市場・必要領域・カテゴリ提案・制作順、既存Siteは市場母集団に対する自社share・獲得・未獲得・記事問題・施策配分を表示 | version付きReport、ユーザー優先／保留／除外 |
| 月次計画 | S1 Plan tab | 目的、重点領域、傾向配分、予算、週次枠を確認。自動／手動確定を分ける | `MonthlyPlan` version |
| Recommendation | S1 Queue / S2・S5文脈表示 | 理由、対象Cluster、記事目的、CTA、内部link、依存、品質、credit、保護、availabilityを表示 | `schema.intake.recommendation.v1` |
| Agent実行 | S3 / S4 / W3〜W5 | 新規、リライト、軽量Patch、Automationを別Workflowで表示する。リライト／記事置換はArticle Read Snapshotの取得可否を入口条件とし、同一correlationで成果と保留を追跡 | Ticket、`schema.snapshot.article_read.v1`、Workflow Snapshot |
| 成果・CMS・公開 | S3確認 / S4予定 / W2・W4 | Generation Outcomeの成果提供・Output Vault期限・生成credit確定、CMS Deliveryの下書き、Publication Decisionの判定、承認、Publication Jobの予約・実行・再試行、Publication Factの検証済み公開／更新と帰属を別状態で表示する。予約・API受付を公開成功にせず、検証済み下書き以降で、最初の新規15記事、リライト、hard gate例外、解放済みAutomationを別条件で扱う | `schema.generation.outcome.v1`、`schema.cms.delivery.v1`、`schema.publication.decision.v1`、`schema.publication.job.v1`、`schema.publication.fact.v1` |
| 評価・学習 | S5 Evaluation / S6 Knowledge | SEO、CTA/CV、認知貢献、1/3/6か月、月次／累積、要監視、Site補正、匿名補正候補を表示 | Intervention result、Recommendation feedback |

画面遷移中は`tenant_id / site_id / recommendation_id+version / intake_ref / correlation_id / target_ref / source view・filter`を保持する。S3でRecommendation表示値を読み直してIntakeを組み立ててはならない。

### 0.2 旧プロト値の失効

以下は過去のデモ実装記録であり、現行画面の設定値として使用しない。

- 旧価格68,000／128,000／198,000／298,000円、プライム名称、旧Credit Pack、翌月繰越150%、追加credit 3か月。
- 一律承認、Office内での成果分析・詳細設定、Claude優先、Owner/Admin/Editor/Viewerをそのまま顧客認可正本とする表現。
- S3でkeyword/news/videoを再選択してRecommendation情報を再入力する導線。

価格、契約、credit、Plan機能は`REQ-BILLING-01〜16`とversion付きPlan Configuration、認可は`REQ-ORG-03〜07`・`REQ-ACCESS-14〜16`を参照する。

### 0.3 権限画面・操作表示

- S7のメンバー管理は、基本権限`契約者 / サイトオーナー / ユーザー`、業務権限`目標管理 / キーワード・サイト戦略 / 記事制作 / サイト分析`、Site Assignmentだけを表示する。
- `Viewer`は表示しない。業務権限なしのユーザーを「閲覧のみ」と説明する。
- 契約者・サイトオーナーでも、対応する業務権限がなければSEO業務変更ボタンを有効化しない。
- Agentへの質問は可視範囲内で許可し、変更会話は対応業務権限を要求する。Office入室やAgent選択で権限を広げない。
- Automation設定は契約者／サイトオーナーだけが行い、許可operation、Site、予算、同意version、期限、停止条件を確認する。設定者本人のRoleを永久委任しない。
- 操作不能理由は`権限不足 / step-up必要 / 承認必要 / Plan不足 / 予算不足 / 接続不足 / データ不足 / 処理中 / 障害`を分け、`schema.authorization.decision.v1.reason_codes`から表示する。
- 顧客面に内部Admin／Manager／Operator、低水準Permission、内部監査logを表示しない。

操作別の正本は`ai-office-de-seo-authorization-operation-matrix_v1.md`とする。

画面利用可否は`ai-office-de-seo-ui-availability-state-map_v1.md`へ従う。障害をPlanロック、権限不足をcredit不足、接続不足をデータ不足として表示しない。複数理由は保持し、最初に解消可能な理由を主表示する。一覧、詳細、Modal、Office設備、Task説明で同じAvailability Decisionを使う。

アイキャッチ設定はSite既定Patternと記事overrideを分け、生成前にcanvas、背景、被写体、文字、ロゴ、余白、安全領域、固定／可変slot、variation toleranceを編集する。Pattern編集とwireframe previewは無料で、実画像のテスト生成前にcreditを表示する。出力sizeはCMS Connection Profileのfeatured media要件だけを表示する。生成、採否、最適化、Media登録、featured割当を別状態で追跡し、ユーザー再生成と障害再開を区別する。本文中画像等の後続機能は初期画面へ出さない。

### 0.4 Keyword Market・Site Share表示

- S2はClusterを基本行とし、`Market / 自社Share / 記事配分 / 戦略 / Recommendation`を同じ対象Contextで横断できるようにする。
- Marketは検索需要、traffic potential、季節性、AIO、広告、競争性を表示し、顧客実績を混ぜない。
- 自社Shareは`GSCで観測 / 外部データによる推定 / Site内の記事配分`を別カード・別凡例で表示する。ObservedとEstimatedを一つの実績値に合算しない。
- 公共Keyword、GSC Query、ユーザー登録、Site抽出、商品・顧客seed、競合観測の来歴を表示し、公共／Site固有、実測／推定、ユーザー確定／自動推定を区別する。
- 新規Site戦略Reportは実績不在を欠陥表示にせず、市場構造、Site必要性、商品・顧客・CV適合、記事成立性を中心にする。
- 既存Site診断Reportは、公共市場母集団に対する獲得・未獲得、Observed／Estimated Share、記事対応、Query Drift、カニバリ、保護、index問題を接続する。
- Public Clusterの改版、Site Clusterのユーザー修正、補正versionを履歴表示し、公共改版でユーザー確定値が上書きされないことを示す。

データ・ロジック接続は`ai-office-de-seo-keyword-market-share-connection-map_v1.md`を正本とする。

### 0.5 Keyword戦略／診断Report

- S2 Report tabは`新規Site戦略`と`既存Site診断`を別fixture・別章立てで持つ。Site種別から既定を決め、記事実績のない新規Siteへ順位・click・CVの異常カードを出さない。
- 新規戦略は市場概要、業界／商品／顧客／ファネル分布、Site適合、優先Cluster、Siteに必要な情報、流入／CV領域、AIO・広告・競争性、構造提案、制作順、月次配置を表示する。
- 既存診断は同じMarket基線から、Cluster別Observed／Estimated／Article Share、獲得／未獲得Keyword、主＋補助Keyword、担当記事、Query、保護、Drift、カニバリ、index、CTA／内部link、外部要因、施策配分を表示する。記事一覧だけを診断Reportと呼ばない。
- Cluster cardの通常操作は`優先 / 通常 / 保留 / 除外`とし、影響する未実行Recommendation、月次配分、予測credit差分を確認後に反映する。個別Keywordと式は詳細／Officeへ送る。
- 大規模Siteは`partially_available`として分析済み領域を開放し、coverage、未分析領域、次回開放見込みを表示する。
- `月次計画を作成`と`Recommendationを見る`は`report_id + version`、Cluster filterを保持する。

Report情報設計は`ai-office-de-seo-keyword-report-connection-map_v1.md`を正本とする。

### 0.5.1 Recommendation提示・判断

- 内部`candidate / proposed`を通常ビューへ表示せず、Decision Eligibilityをfreezeした`presented` versionだけを通常ビューのおすすめとOfficeの詳細対象へ同時に投影する。`presented`はQueueへ判断可能状態として公開した事実であり、ユーザーの画面閲覧・既読を必須にしない。
- 通常ビューは`採用 / 条件を調整して採用 / 保留 / 除外`を平易に表示し、Officeでは同じRecommendation version、根拠、許可された調整field、影響、Credit、Decision履歴を詳しく扱う。再表示やView切替で別Presentationを作らない。
- 条件調整がRecommendation type、対象、主目的、Keyword Cluster、Action routeを変える場合は「調整して採用」にせず、Recommendationの意味を残したManual Intakeまたは再分析へ案内する。`accepted*`確定時はfreeze済みIntakeを同時作成し、採用後に再入力させない。
- `recommendation_feedback`は既読、click、UI改善等の分析補助に限り、Presentation、Decision、Intake、採用率の正本にしない。自動運用は`自動採用`と委任Policyを表示し、人間が採用した表示へ置き換えない。
- 採用後のExecution AdmissionはRecommendation Decisionと分ける。通常ビューでは`実行準備中 / 入力が必要 / Creditが必要 / 接続確認 / 実行待ち / 実行開始`と必要操作を簡潔に示し、Officeではcheck別証拠version、見積、reserve、Capacity、可変Gate、return contextを詳しく表示する。Preflight保留を「Recommendationが不採用になった」と表示しない。
- Recommendation上の予測credit、Admissionの固定顧客credit／予約上限、Ledgerのreserved、成果提供時のcommitted、未使用release、内部実原価を同じ値へ丸めない。画面はServerのAdmission／Ledger Projectionを表示し、ClientまたはLLMが実行可能性・残高を再計算しない。

### 0.6 CMS接続状態

- S7データ設定はCMS種別、接続状態、認証、記事読取り、下書き送信、既存記事更新、Media、Editor互換、Preview、Revision、Tracker、最終同期、必要なユーザー操作を業務名で表示する。
- `接続済み`の単一表示だけで投稿可能と見なさない。`site_identified`は対象Site確認、`analysis_ready`は分析version、`content_read_ready`は記事coverage、`delivery_ready`はoperation別Capabilityとして表示する。分析可能だが送信不可、下書き可能だが既存更新不可、Media不可、Plugin更新必要等を区別し、Connection Profile確認済みを投稿可能へ読み替えない。
- ユーザーへ`public_crawl`等のAdapter名、primary／standby、fallback、rate limit、polling頻度を選択させない。必要操作だけを再接続、権限確認、Plugin更新、手動取込として提示する。
- 初回取込は自動構築期間、通常は差分同期として、記事数、処理済み、残件、利用可能になった機能、容量／処理使用率、上限到達予測を表示する。
- 投稿またはPatchはCMS応答と反映確認を分け、cache反映待ち、権限、競合、rate limit、schema変更を別状態で表示する。
- Compatibilityは`full / degraded / update_required / unsupported`をユーザー向けに`利用可能 / 一部制限 / 更新が必要 / 未対応`と表示し、縮退候補を提示する。

接続契約は`ai-office-de-seo-cms-connection-routing-map_v1.md`を正本とする。

## 1. 旧詳細コンポーネント棚卸し（互換baseline・現行責務の正本ではない）

本節は2026-07時点のモック用Source Pack、画面部品、操作候補を失わないための棚卸しである。S2に記事割当／カテゴリーツリーを置く記述、旧S4／S5／S6の配置、旧価格・Role・承認条件等を含み得るため、現行の画面責務、第一階層名、タブ所属、業務遷移の根拠として使用してはならない。現行責務は§0.1、`REQ-NAV-04`、現行タブ所属は§5、正規遷移は画面遷移図を正本とする。本節から再利用できるのは、現行要求と衝突しないComponent候補、表示項目候補、Source Contract参照だけである。

| # | 画面 | 主要コンポーネント（REQ-NAV-04の責務） | 主データ（モック契約） | プロト優先度 |
|---|---|---|---|---|
| S1 | ダッシュボード | 今日のおすすめ施策（**新規作成/リライト/統合/内部リンク/CTA/更新/保護/監視/見送りを優先順位表示。「なぜ今・なぜ対象・変更内容・見送り時・費用/リスク」を確認し、採用/編集/保留/却下/予約→recommendation_feedbackへ記録。REQ-PRODUCT-24**） / 稼働中ジョブ / 承認待ち（W4へ遷移） / クレジット残高 / サイト成長サマリー（**期間切替: 4週/12週/6ヶ月**。プロト実装に合わせ週単位粒度で確定） / **月次プランニングタブ（目標・配分・予測レンジ・実績乖離。REQ-PRODUCT-17）** / **変動サマリ（急変・アルゴ/SERP変動・季節・ウォッチ変化。REQ-KGA-20）** / Agent Office入口 | recommendation_items、ジョブイベント（共通エンベロープ）、usage_credit残高、`source.gsc.page_query_matrix.v1`集約 | P0 |
| S2 | キーワード管理 | クラスター図（キーワードの俯瞰。**UI旧称: キーワードマップ**。業界用語の「キーワードマップ＝記事×キーワード割当一覧」との混同を避けるため改名） / メインキーワード軸 / 関連語・質問・類語・地域 / **属性フィルター（ターゲット・リテラシー・業界・intent・YMYL近接。REQ-KGA-13）** / **ギャップマトリクス（ターゲット軸×intentの未カバー象限）** / **アサイン台帳ビュー（未割当バックログ・二重アサイン/オーファンのアラート。REQ-KGA-14）** / トピック網羅率（グループ内未カバー主題、REQ-KGA-10） / **キーワードの編集・削除・分類（必須/推奨/オリジナル）変更・アサイン付け替え（REQ-KGA-04/14）** / **昇格・除外候補の採用/却下** / **選択キーワード（グループ）から記事作成を起動→S3へ引き継ぎ（起点=キーワード・対象グループ・推奨記事タイプをプリセット。アサイン台帳プレチェックを起動時に即時表示し、assigned済みならリライト誘導＝REQ-KGA-14のクレジット消費前警告を画面で前倒し）。ギャップマトリクスの未カバー象限・昇格キュー（親なし）からも同起動。複数選択の一括投入は「おまかせ」レーン既定でPreflight合算表示（REQ-BILL-11）** / **CSVエクスポート（REQ-PRODUCT-14）** / **ロングテール昇格キュー（クラスタ集計・親グループへのセクション/FAQ候補提示。REQ-KGA-16）** / **クエリ分析（旧S5「クエリ・マッチ品質」を移設: クエリ一致内訳×2・AI検索の影響・未マッチクエリの昇格導線・クエリ変化。キーワード=狙う語／クエリ=実際に来た語、の2起点を1画面に集約）** / 起点タグ付き候補（keyword/ニュース/動画需要。ニュース起点は鮮度期限つき。REQ-KGA-18） / **価値スコア表示・ソート（AIO抑制フラグと期待クリック割引の可視化。REQ-KGA-17）** / **サイト構造ツリー＝トポロジープランナー（**カテゴリ構造のツリー**: 幹=トップカテゴリ→枝=サブカテゴリ。各カテゴリ行に記事数・パス・内部リンク状態を表示し、「主要キーワード ▼」プルダウンでカテゴリに紐づく対策キーワードを展開（チップクリックでキーワード一覧へ）。カテゴリ×タグ網目・生成順序=CV近接・リンク再調整キュー。REQ-KGA-19。用語分離: サイト構造=カテゴリのツリー／キーワード間の関連性=クラスター図タブ。トピッククラスターは設計概念として説明文で使用）** / **ウォッチリスト（ピン留め・しきい値通知設定。REQ-KGA-20）** / SERPs集約 / 必須・推奨・オリジナル / **手動キーワード追加（単発・一括貼り付け・CSVインポート）／シード語サジェスト展開ビュー（候補ツリーからチェック選択→一括登録。REQ-KGA-03）** / 競合上位5構造サマリー | `source.keyword.map.v1`（attributes含む） / `source.keyword.assignment.v1` / `source.keyword.same_serps.v1` / `source.keyword.synonym_related.v1` / `source.serp.paa.v1` / `source.competitor.top5_structure.v1` | P0 |
| S3 | コンテンツ作成 | **recommendation queueを既定入口とし、採用候補の対象・目的・根拠・変更範囲・品質条件・予算をTicket/Edit Planへ引き継ぐ（REQ-PRODUCT-24）** / 新規記事 / リライト / **補助導線として起点を手動選択（キーワード・ニュース候補・動画需要候補。REQ-KGA-18）。S2・S5・ギャップマトリクス・昇格キューからの引き継ぎ起動を受け、起点・対象グループ・推奨タイプがプリセットされる** / 実行オプション（今すぐ/おまかせ=夜間割安のレーン選択。鮮度highトピックはinteractive既定・おまかせ選択時に鮮度注意、REQ-BILL-11/REQ-KGA-18） / Research Brief / Outline Contract / 任意のOutline確認・見出し修正 / Meaning Unit Writing / 任意の本文途中Preview・ユーザー編集保護 / Semantic Assembly / Cohesionを含むQA・限定Repair / Presentation Assembly（装飾・アイキャッチ・CTA・内部link配置・CMS形式変換） / CMS下書き送信 | recommendation_items / `source.article.summary.v1` / `schema.snapshot.research_brief.v1` / `schema.snapshot.outline_contract.v1` / Writing・QA・Placement Snapshot / テーブルJSON（REQ-PACK-05） | P0 |
| S4 | オートメーション | CMS接続Capability / 文体指定（です・ます調／だ・である調 × 文語体／口語体） / 個別Site言い回し学習ON/OFF（ON時はサンプル記事10本、10本未満は暫定） / 記事サマリー同期 / 投稿形式チェック / 下書き・予約（**作成・変更・取消**） / 承認・差し戻し / おまかせ運用 / **自動変更のガバナンス（日次/週次の変更予算・同一記事クールダウン・振動検知の自動停止・上限超過の保留候補キュー→承認/見送り。REQ-PRODUCT-18）** / 夜間チェック実行キュー | cms_capability_snapshot、approval_requests、scheduled_actions、publication_jobs、change_budget/oscillation状態 | P1 |
| S5 | サイトページ管理（旧: 検索流入分析。**2026-07-08 IA再編: ページは持たず情報圧縮したサマリのみ保持＝Article Summary契約REQ-PRODUCT-04/20。リライト起点はキーワード由来に限らない＝構造整理・CROもページ起点で扱う**） | **ページ一覧（旧S2「記事×キーワード」＝アサイン台帳を移設: 記事タイトル・URL・記事単位サマリー×プライマリ/セカンダリ割当×検索実績（CTR・クエリ一致・AI影響）の統合テーブル＋割当の健全性。未割当キーワードの表示は2026-07-08廃止＝S2キーワード一覧が正。REQ-KGA-14）** / **サイト構造ツリー（旧S2から移設。カテゴリ構造ツリー＋主要キーワードプルダウン・リンク再調整キュー。REQ-KGA-19）** / GSC実績 / URL×クエリ / カバー率 / **マッチ品質ビュー（→2026-07-08 S2「クエリ分析」タブへ移設。クリック加重マッチ率KPI・段別内訳・匿名化上限の別掲・未マッチクエリの昇格導線＝単体高クリックとクラスタ集計の両方。REQ-KGA-15/16）** / **AIO影響ビュー（AIO観測×CTR残差の可視化、REQ-KGA-17）** / Query Drift / 順位・CTR・CV / **ローカル順位（→2026-07-08 S2順位モニタリングへ移設。地域別: ローカルパック/地図/自然検索の分離表示・地域は取得設定で指定・順位非保証。REQ-KGA-22。UI表記は「自然検索」=オーガニック）** / 内部リンク候補・オーファン検知（REQ-KGA-09） / **リライトブリーフ（落としたクエリ・追加候補・競合見出し差分・AIO/引用状況の集約。REQ-RWR-08）** / **好調記事分析（→2026-07-08 S6ナレッジ管理（旧: 学習ナレッジ管理・2026-07-08改名）へ移設。CV・滞在・スクロール＝REQ-WPA-11、保護フラグ・波及リンク提案＝REQ-RWR-08、CRO差し替え提案＝REQ-WPA-13）** / **フラッシュリライト候補（CTR負残差・AIO切り分け。REQ-RWR-09）** / **テクニカル分析（旧: インデックス・技術。問題一覧・修正導線。REQ-KGA-21）** / **上位ベンチマーク（上位を取りたい記事×上位1〜3の共通条件×自ページ差分。競合上位5構造サマリー由来）** / 改善前後比較 / リライト原因解析 / **操作: リライト候補からのリライト起動（S3へ）・内部リンク候補の採用/却下・未マッチ/昇格候補の登録・CSVエクスポート（REQ-PRODUCT-14）** | `source.gsc.page_query_matrix.v1` / `source.keyword.coverage.v1` / `source.article.query_drift.v1` / `source.cv.daily.v1`（匿名化・切り捨て注記を表示に含める、REQ-KGA-11） | P0 |
| S6 | ナレッジ管理（旧: 学習ナレッジ管理・2026-07-08改名） | ユーザー要望（soft/normal/strong。**追加・削除・一時無効化/再有効化＝soft-disable（削除せず適用停止・無効中も履歴保持。REQ-PRODUCT-07）**） / サイト方針 / 読者ターゲット / 書き方の好み / NG表現（**追加・削除**） / 文体指定（です・ます調／だ・である調 × 文語体／口語体） / 個別Site言い回し学習ON/OFF（ON時のみサンプル記事10本の選定・除外・再学習、10本未満は暫定、OFF時は指定文体のみ） / レギュレーション調整 / ターゲット軸・主張軸の管理（Tier 3戦略入力: 構造化エディタ・登録時Validate差し戻し・影響帰属の履歴表示。構造カスタムはコンサル経由の案内、REQ-PRODUCT-12） / レギュレーション調整（**必須/推奨の指定つきで追加・削除**） / **CVポイント台帳（カタログ登録・記事割当・有効期間。REQ-WPA-13。§5タブ表と整合）** / 暫定プロファイル表示（REQ-WPA-06） | `source.site.domain_positioning.v1` / `source.site.content_regulation.v1` / `source.site.user_order.v1`、pack_compile_warnings | P1 |
| S7 | 設定 | Site・CMS/GSC接続・自動構築状態。WordPress Thin Plugin選択時は対象Site用ZIP取得、期限付きペアリングキー表示・コピー、3段階セットアップ、未接続／接続済み／再認可必要、現在version、署名付き更新状態をデータ設定へ表示する / 組織・メンバー（基本権限、業務Permission、Site付与） / 通知 / セキュリティ / データ利用・事例許諾 / 契約・支払・クレジット・Capacity。価格はEntry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜（税別）を主表示し税込総額を同一領域へ併記する。Entry／Standardは月契約または年契約、Premiumは年契約、Enterpriseは問い合わせ年契約。Plan機能、Site数、品質、予測、backup、外部API、容量、supportはversion付きPlan Configurationから表示する。月額付与creditは請求期間末、追加購入creditは180日で失効する。自動チャージは契約者が有効化し、月間上限額または無制限と購入条件を設定する。Provider/model名を商品保証として表示しない | `schema.cms.connection_profile.v1`、memberships、Plan Configuration、Price Catalog、Entitlement Snapshot、Credit Ledger、subscription | P0 |

### 1.1 現行S3状態の補足

S3の現行状態には、リライト／記事置換時の`schema.snapshot.article_read.v1`取得可否と、生成成果から独立した`schema.cms.delivery.v1`を含める。CMS Deliveryは`prepared / connection_required / permission_required / delivering / draft_created / verification_pending / verified / failed_retryable / failed_terminal / carried_out / cancelled`を表示し、再送は同じDelivery IDとidempotency keyを継続する。旧行にある「CMS下書き送信」は単一操作ではなく、この状態遷移の業務表示名である。

## 2. 共通詳細・ワークベンチ（両モード共有、REQ-AOUI-06）

| # | 画面 | 内容 | 根拠 |
|---|---|---|---|
| W1 | 全画面ワークベンチ | 詳細作業を1画面占有で行う共通枠。参照: `screen_detail.webp`（参照のみ・実装素材にしない） | REQ-AOUI-06 |
| W2 | 差分プレビュー（リライト承認） | 理由 / 対象URL・キーワード・GSCクエリ / 変更セクション / 前後要約 / title・meta・H2/H3・CTA・内部リンク差分 / Quality Gate結果 / 予想credits / 下書きURL / 予約日時 / **操作: 適用の確定（承認）・差し戻し（理由入力）** | REQ-RWR-04（検証: AC-RWR-03） |
| W3 | 生成プレビュー・QA結果 | Outline Contract表示（**決定された記事タイプ・見出しフロー＝article_type_key/heading_flow_keyをカタログ由来ラベルで明示。「サンプル記事の型」（REQ-PACK-16の文体学習）とは別概念として表示を分離**、REQ-PACK-11）、意味ユニット単位の生成結果、gates/metricsの合否表示、hard_gate_block時の保留導線、**指定の影響帰属**（どのUser Order/主張軸/ターゲット軸が不合格に影響したかの表示と見直し導線、REQ-PRODUCT-12）、**保留ジョブへの操作（要望を追加して再実行・キャンセル、REQ-AGENT-10）** | REQ-AGENT-02 / schema.snapshot.qa.v1（AC-CUST-03） |
| W4 | 承認キュー | 承認対象: 投稿予約・差分適用・リンク再調整／波及の小リライト・TDHフラッシュ・CVポイント差し替え。個別／一括承認・差し戻し（理由入力）。承認操作は顧客の基本権限だけで決めず、記事制作Permission、Site付与、CMS write、Plan、予算、対象操作を副作用直前に判定する | REQ-WPA-04 / Authorization Operation Matrix |

CTA／内部link軽量Patchでは、候補一覧、対象記事とpart、記事目的、検索intent、before／after、推奨理由、実行可能状態、個別／一括採否、承認Batchを表示する。承認後も候補ごとの`scheduled / applying / applied / failed / conflict / measuring / evaluated`を保持し、一部失敗をBatch全体の成功として表示しない。CTA評価は月次／累積の遷移率・CV到達・母数・記事目的、内部link評価はlink graph・遷移・リンク先記事への寄与を表示し、本文SEO評価周期と別起点にする。Officeへの遷移は同じ`patch_action_id`を使用する。
| W5 | ジョブ進捗 | 状態機械の現工程表示（13状態＝実務工程9＋強制ゲート4、REQ-AGENT-09）、一時停止／再開・**キャンセル**操作。同一Jobのcheckpoint再開は見積・顧客creditを増やさず、cache再ウォームは内部原価としてのみ記録する。固定商品範囲を超える別成果・再生成は開始前に新Jobの見積と確認を表示し、成果未提供かつ製品側原因で終端した場合だけ未使用reserveのrelease／調整状態を表示する。モックイベントで駆動 | REQ-AGENT-09 / REQ-AGENT-10 / REQ-BILLING-04 / REQ-AOUI-04 |
| W6 | ジョブ履歴 | 生成・リライト・QA・投稿予約のジョブ履歴一覧（結果・消費クレジット・保留理由。**種別・状態・期間フィルタ・CSVエクスポート（REQ-PRODUCT-14）**。本文は表示しない） | REQ-PRODUCT-04（保持対象=ジョブ履歴）/ REQ-SEC-02 |
| W7 | 通知・アラートセンター（in-app正本） | REQ-PRODUCT-11のイベントカタログ全種（承認依頼・hard gate保留・ジョブ失敗/保留・カニバリ・重複ジョブ・残高低下・支払い失敗・再認可要求・Kill Switch・プラグイン更新・繰り延べ）の一覧。運営お知らせ種別の表示（REQ-PRODUCT-16）・未読/既読/確認済み/対応済み管理・種別フィルター・**通知から対象画面への遷移**。完了・確認要求はWeb popupにも出し、閉じてもCenterの正本を消さない。受信者は固定担当者を必須にせず、Site付与・閲覧範囲・操作権限・通知設定からServer解決し、要対応で該当者不在ならSite owner、契約・課金なら契約者へfallbackする。設定では種別別ON/OFF、即時/ダイジェスト、popup/emailを変更できるが、必須通知のin-appは完全OFF不可。通常ビューとOfficeは同じ通知状態を使い、開発側alertは顧客W7へ混在させない。通知本文に本文全文・シークレットを含めない | REQ-PRODUCT-11（AC-NOTIF-01/02） |
| W8 | 緊急停止・自動運用制御 | 最初の新規15記事承認後の自動運用同意、許可operation、Site、予算、自動チャージ上限、品質、公開頻度、停止条件を設定する。変更予算、クールダウン、振動検知、保留候補、Kill Switchを表示する。設定・解除は契約者またはサイトオーナーで、対応業務Permission、Site付与、step-up、同意versionを満たす者に限定する | REQ-WPA-04 / REQ-DUR-04 / REQ-PRODUCT-08 / Authorization Operation Matrix |
| W9 | 登録時同意書・テナント切替 | 同意書提示（コンテンツ最終責任のユーザー帰属・YMYL公開判断・匿名集計によるデータ利用とオプトアウト案内=REQ-PRODUCT-13。文言は法務レビュー前提のプレースホルダ）、テナント切替（明示操作・切替後に権限再判定） | REQ-PRODUCT-09（AC-DELIV-03）/ REQ-SEC-08（AC-SEC-02） |
| W10 | サポート | チャット型QA（ヘルプ根拠つき回答・自ジョブ/エラー/請求の権限内参照・低確信時のエスカレーション提案）、チケット作成・履歴・状態表示、受付自動返信（ID・SLA目安）、インシデント時のステータス自動案内 | REQ-PRODUCT-22（AC-SUPPORT-01/02） |

## 3. Agent Officeビュー

> **2026-08-03 現行要求による上書き**: 通常ビューはRecommendation中心の要約・簡単操作面、Agent Officeはエージェントの実行状況を見ながら成果、Keyword、記事、根拠、条件、設定、Taskを玄人向けに詳細分析・操作する面とする。両Viewは同じProjection・認可・Domain Commandを使い、Office独自の業務正本を持たない。定型操作は選択式、自由文は必要時だけLLMを使う。

**現行役割（2026-08-03）**: Officeビューは実Task・Agent・工程eventを起点にする玄人向け詳細分析・運用面である。既存の部屋、Agent、ライブ表示、成果詳細Panelを再利用し、分析条件、推薦方針、配分、承認、設定、Taskの変更案を型付きProposalとして共通Commandへ渡す。通常ビューは同じ対象をRecommendation中心に簡略表示する。

**旧プロト実装記録（2026-07-09・superseded）**: Officeビューは**実行状況の確認基盤**。通常ビュー（＝選択の基盤）で選んで動かしたものを、チームの働きぶり（エージェント状態・ライブフィード・タスク進捗）として見守る監視面と位置づける。狙いは「人間には面倒・難しい作業をエージェントがこなしている」様子を見せること。決める操作（承認・選定・設定）は持たず、必要時は「通常ビューで選ぶ・決める」へ誘導する（往復導線は§5末尾の2026-07-09追記を参照）。通常ビューとは同一データを共有（REQ-AOUI-01）。**深堀りは「Office詳細ページ」で行う（2026-07-09 改訂）**: 部屋詳細（室内ズーム）は導線ハブに徹し（エージェントの働きアニメ＋WORK LOG＋「エージェントの作業を詳しく見る」内部メニュー）、詳細データは部屋内のページ群に分割して見せる。詳細ページは**1ページ=1コンテンツ（＝1キーワード or 1記事）**の単位で、その対象の**全詳細データ＋エージェントの分析をぎっしり**載せる（グラフ1枚単位に分割しない）。吹き出しはワンメッセージ・**スクロール（内部スライダー）絶対禁止**の1画面完結（§6.6準拠）。レイアウトは左=内部メニュー（対象の切替）、中央=データグリッド、担当エージェント（状態連動・吹き出し）は左下に小さく配置。通常ビューは再編せず、Officeが"細かく見る"側を担う。標準画面からの深堀り導線: S3ライブ生成→「オフィスでライブ編集を見る」（`goOfficeLive`→ライブ執筆ページ）／S2キーワード詳細→「オフィスで詳しく見る」（`goOfficeKwDetail`→キーワード概要ページ）。既存の部屋→ワークベンチ（`openWb`）は維持。

| # | 画面 | 内容 | 使用アセット（ASSET-MAPPING） |
|---|---|---|---|
| A0 | オフィス俯瞰（ハブ＝ダッシュボード） | 7フロア（1部屋=1フロア）・7部屋＋ハブ。エージェント状態が実工程を反映 | `bg_office_dark` / `scene_circular_stage` / `scene_green_rack` / `scene_elevator`（俯瞰モック `screen_office` は参照のみ） |
| A1〜A7 | 部屋（01 キーワードリサーチ / 02 コンテンツ制作 / 03 レポート分析 / 04 自動化オペレーション / 05 ナレッジ / 06 設定 / 07 テクニカルSEO） | 各部屋→ペルソナ→「何を見ますか？」選択メニュー→通常ビューと同一の詳細（W1〜W5）へ。**部屋詳細（室内ズーム）から「Office詳細ページ」へ（2026-07-09 改訂・同日粒度修正・同日中央パネル化）**: 部屋詳細は**中央壁面ホロパネル**（壁アートに投影する半透明パネル。状態連動ホロ小物＋「エージェントの作業を詳しく見る」ピル＋統計タイル＋WORK LOGを集約。背景アートの温存より情報配置を優先する原則）を主役にし、右カラムは「何を見ますか？」とRECOMMENDEDのみ。キャラクリックの「何を見ますか？」メニューにも「DETAIL — 詳しく見る」グループあり。ここから**1ページ=1対象（1キーワード or 1記事）の詳細ページ**を開く。ページは対象の全詳細データ＋「エージェントの分析」カードをグリッドでぎっしり表示（スクロールなし）、担当エージェントは左下に小さく（吹き出しワンメッセージ）。01 キーワードリサーチ＝「引越し 見積もり 比較」「引越し 挨拶 ギフト」「引越し ダンボール 無料」の3ページ（各: 基本データ/価値スコアの内訳（挨拶ギフトはクエリ一致と機会）/掲載順位の推移（未計測時はプレースホルダ）/検索結果の構成/関連クエリ/エージェントの分析）。データはKW_ROWS・クエリ分析・KW_CLUSTER_DETAILの正本準拠（REQ-AOUI-01）。02 コンテンツ制作＝リライト記事（job1Idx連動ライブ執筆・工程・品質チェック）／修正版記事（全節完了・工程は再送状態 wpVaultRetried/Paused と連動）の2ページ。**各ページに NEXT ACTION**（通常ビューの該当操作へジャンプ: キーワードを開く／差分を承認／タスクを管理／成果物を確認＝Officeは決定を持たない役割分担を維持）。S2「オフィスで詳しく見る」は選択中キーワード（kwSel）に対応するページへ着地。**（2026-07-09 全7部屋に拡張）** 詳細ページは全7部屋に実装済み・5ページ型（型A メトリクスグリッド＝01キーワードリサーチ/03レポート分析、型B ドキュメント進行＝02コンテンツ制作、型C 承認差分＝04自動化、型D 学習知見＝05ナレッジ、型E ステータス盤＝06設定/07テクニカルSEO。すべて既存の型A/B骨格を再利用し一貫性を担保）。各部屋のページ: 03レポート分析＝流入ページ3件（好調/安定/急落・anPageTraffic準拠＋パフォーマンス評価/クエリ内訳/クリック推移）、04自動化＝承認案件4件（リライト差分/新規下書き/リンク再調整/CVポイント差替・state.approvals準拠・差分before→after＋実行条件＋安全ルール判定・CTAは該当承認モーダルを通常ビューで開く）、05ナレッジ＝学んだ勝ちパターン3件（構成/訴求/内部リンク・学んだこと/根拠の実測値/効果の推移/反映先/確信度・学習中は点線トレンド）、06設定＝運用ヘルス3件（連携ヘルス/クレジット・請求(creditForecast動的)/メンバー・アクセス・security_admin視点でヘルスゲージ＋90日稼働格子）、07テクニカルSEO＝技術領域3件（内部リンク・孤立/クロール・インデックス/表示速度・リンクグラフSVG/インデックス比率/Core Web Vitals）。データは各画面の正本に準拠（REQ-AOUI-01）、詳細ページのSVGカードは position:absolute で固有アスペクト比の押し上げを断ちスクロール禁止を維持。**（2026-07-09 詳細エクスプローラ化）** 01キーワードリサーチ・03レポート分析は代表3件でなく**全キーワード（KW_ROWS 10件）・全記事（統合レコード ARTICLES 10件）をデータ生成**（buildKwPages/buildArticlePages・officePagesFor で集約、既存3件は _kw/_slug 一致で上書きマージし作り込み温存）。**Officeビュー=詳しさ優先**として1対象を個別深掘り。基本データは**DataForSEO(市場)＋Search Console(実績)の3×2来歴段組み**（MARKET: 検索数/難易度/**AI Overview**／PERFORMANCE: クリック/表示回数/CTR。**AIOは必須表示**）。左サイドは**関連度で引く2グループ（関連対象＋別視点クロス＝キーワード⇄記事の部屋跨ぎ切替）**で最大6行・relatedOf 単一関数駆動。生成物と作り込みの温度差はバッジ＋分析深度チップで明示、入口列挙は上位6件（topOfficePages） | `sign_01`〜`sign_07`、`char_publish_manager` / `char_knowledge_trainer` / `char_link_architect` / `char_technical_seo`（確定4体）＋ `char_pose_01`〜`15`（割当は暫定、現物確認で確定） |
| A8 | エージェント状態オーバーレイ | 待機/作業/完了/エラーの4状態。イベントエンベロープから導出 | `state_idle` / `state_working` / `state_done` / `state_error` |

ペルソナ⇄工程マッピングは REQ-AOUI-04（基本12＋拡張1: technical_seo）。部屋・フロア・ペルソナ構成はconfig駆動でプロトにも反映する（REQ-AOUI-07）: プロトのオフィスレイアウトはハードコードせずJSON configから描画する。

現行マッピングはpersona名と工程名だけでなく、担当業務、読むProjection、Executor／Workflow、説明可能な状態、作成可能なProposal、必要Permission、設備を持つ。Office会話は選択式ポップアップを優先し、定型操作を決定論Service、自由文の意味解釈だけをLLMへ渡す。確認済みProposalは共通Commandへ接続し、結果を両Viewへ反映する。

## 4. プロト範囲外（作らない）

- 開発管理者コンソールの画面台帳は AOS-L3-ADMIN-SCREEN-INVENTORY（別紙）に分離し、プロトではPT-6（管理面トラック）で扱う。本書のユーザー向けP0〜P2より後段。
- 人的コンサルティングそのもの、SEO戦略の人間review、CMS修正代行。製品内のSite導入フローとFAQチャットは初期画面範囲に含める。
- 実データ接続・実LLM生成・WP実接続（プロトはモック契約で駆動）。

## 5. 第二階層タブ台帳（REQ-NAV-02のタブ構成の正本）

第一階層は7項目のまま増やさない。過積載画面はタブで分割する。責務は§0.1と`REQ-NAV-04`、本表は現行の所属・配置を正本とし、§1の旧棚卸しと衝突する場合は本表を優先する。

| 画面 | 現行タブ構成（順序変更時もURL keyを維持） |
|---|---|
| S1 | ピックアップ（旧: やること。おすすめ施策・承認待ち＝ユーザーの行動。**2026-07-10 承認待ちをコンパクト行化＝種別+タイトル/cr+差分を確認・承認/差し戻しは差分モーダルに集約・「一括処理→」でS4へ。1画面完結**） / サマリー（KPI・成長グラフ・タスク・クレジット＝状態の把握） / プランニング（目標・配分・予測・実績乖離） / モニタリング（旧: 変動。急変・アルゴ/SERP・季節・ウォッチ変化） |
| S2 | 構築・入力（新規SiteのBig Keyword方向確認／既存SiteのGSC・Keyword upload・記事取得availability、自動構築期間） / キーワード一覧（Cluster基本行、属性filter、編集、分類、export） / クラスター図（主＋補助Keyword、検索intent、funnel、Market／Share、記事割当） / 戦略・診断レポート（新規Site戦略／既存Site診断を分離し、Report version、根拠、Source availability、Clusterの優先／通常／保留／除外を表示） / 流入クエリ（GSC実Queryと受けたページ、click、CTR、順位、CV） / クエリ診断（未獲得、Query Drift、カニバリ、index、AIO・広告・季節性） / 順位・要監視（Watch Queue、急変、地域・device） / 対策候補（起点別候補、手動追加、seed展開、Recommendation）。Report確定後は`report_id + version`を保持してS1プランニングとRecommendationへ進む。 |
| S3 | 作成する（Recommendation Intakeまたは手動指定を共通Preflightへ渡す。新規／リライトを別Workflowとして表示し、採用済みKeyword、目的、CTA、内部link、品質、予算を再入力させない） / ライブ生成（Task進捗、Outline途中確認、生成Preview、QA、限定Repair、保留理由、停止・再開） / カレンダー（月次計画と週次実行予定、予約公開、生成予定。変更はS4 Automationへ接続） / 生成履歴（記事、URL、状態、QA、credit、correlation、CMS送信状態、編集／Preview URL、再送、品質確認、リライト導線）。本文は接続中CMSの保存値を編集・更新の外部正本、公開表示をSEO評価の正本とし、AI OfficeはSummary、成果meta、履歴と期限付きOutput Vaultだけを保持する。初期WordPress Adapterでは「WordPressで開く」を表示し、他CMSへ固定した共通画面名・列・状態を作らない。※新規／リライトは種別、保留は品質Gate状態でありタブではない |
| S4 | 承認（W4。完成記事、リライト、記事置換、hard gate例外を別状態で表示） / 予約（投稿予約・下書き） / おまかせ運用（実行条件・**新規記事の自動公開設定**。新規Siteは、完成記事の人間承認証拠とconfirmed `ai_office_publication` Publication Factを持つ新規記事15件まで解放進捗を表示する。予約、CMS API受付、下書き、外部変更、帰属確認中、既存記事、外部記事、リライトを数えない。15件到達後、契約者またはサイトオーナー等の権限者が許可operation、対象Site、予算、品質、停止条件、有効期間と版付き同意書を確定して有効化する。リライト／記事置換はCMS下書きと個別承認を維持し、初期WordPress AdapterではWordPress下書きを使う。hard gateは判定を残し、同一権限者の二段階確認＋版付き同意による例外手動公開だけを許可する。緊急停止で新規副作用を即時停止する**・接続と同期） / **予算管理（自動運用が利用できるcredit上限＋自動変更の安全ルールW8＝変更予算・クールダウン・振動検知・保留候補キュー。REQ-PRODUCT-18）** / 緊急停止（W8 Kill Switch。おまかせから分離）　※月次目的・記事／施策配分・予算配分・実績乖離はS1プランニングを正本とし、S4に重複する目標管理タブを置かない。夜間チェックタブも廃止し、夜間QAは内部processとして継続する。 |
| S5 | ページ一覧（Article Summary、主＋補助Keyword、記事目的、公開／更新日、取得状態、保護状態） / 流入・CV（Query、click、CTR、順位、CTA遷移、CV、認知貢献を月次／累積で表示） / カテゴリ・内部link（現在構造を読み、構造は変更せず記事割当、link候補、孤立、カニバリ候補を表示） / リライト・軽量施策（原因分類、Article Read availability、リライト、CTA、内部link PatchのRecommendation） / 施策評価（`seo_content`はconfirmed Publication Factの`effective_at`から1・3・6か月、`cta_cv / internal_link / awareness`は変更月・累積を別Laneで表示し、外部変更・市場外因、成功・悪化・観測継続・復元availabilityを併記する） / 上位ベンチマーク / テクニカル診断（index障害等を記事失敗と混同せずユーザー対応へ接続）。評価結果はS6のSite学習・匿名補正候補と次回Recommendationへ渡す。 |
| S6 | 戦略入力（ターゲット軸・主張軸） / 要望・NG / 文体（です・ます調／だ・である調 × 文語体／口語体、Site言い回し学習ON/OFF） / レギュレーション / **成功学習（旧: 好調記事分析。「学んだ勝ちパターン」＝2026-07-10に1行化: 学び×反映先×状態＋●オフィス導線。根拠の実測値・効果の推移・確信度はOffice詳細ページkn_*が正本。＋好調記事（保護対象・学習元）・波及リンク提案・慎重リライト・改善前後比較）** / **CVポイント台帳（カタログ登録・記事割当・有効期間。REQ-WPA-13）** |
| S7 | 組織・Site（契約主体、自由階層、メンバー、基本権限、業務Permission、Site付与） / データ・接続（CMS Connection Profile、GSC、Keyword取得、地域・device、初回取込・差分同期、Capacity） / 契約・お支払い（現行4 Plan、月／年契約条件、税込総額、Entitlement、credit lot、消費、失効、自動チャージ、容量option、請求書） / 通知 / セキュリティ / その他（表示言語、自動運用同意、データ利用、事例許諾、解約）。SiteはPlan Configurationの上限・追加条件へ従い、1 Site 1課金を固定不変条件にしない。具体値はPrice Catalog／Plan Configurationから表示する |

タブはURL直リンク可能（通知・遷移図の2遷移以内の前提）。タブの追加・並替はconfig/実装で吸収し第一階層を増やさない。

### 5.1 旧プロト実装記録の扱い

以下の2026-07付「プロト実装」「実装追記」「要求写像追記」は、既存モックの挙動・fixture・画面資産を把握するための履歴であり、現行の価格、credit、権限、Office責務、承認、Site課金、業務Lifecycleの正本ではない。§0〜5の現行要求と衝突する値・文言・操作は`superseded`とし、再実装時に採用しない。再利用対象は、衝突しないLayout、Component、Asset、遷移技術および表示実績に限る。

プロト実装（2026-07 追記）: 全S画面の第二階層タブ化を実装済み（`REQ-NAV-02` 準拠）。S1/S2/S5 に加え、S3（作成する / 進行中・品質チェック）・S4（承認 / 予約 / おまかせ・緊急停止 / 夜間チェック）・S6（戦略入力 / 要望・NG / 文体 / レギュレーション / CVポイント台帳）・S7（現行: 組織設定 / データ設定 / お支払い / 通知 / セキュリティ / その他＝2026-07-10時点6タブ）を、1枚縦積みからタブに分割した。タブ切替は画面内状態（`*Tab`）で行い、既定タブは各画面の主操作（S3=作成する・S4=承認・S6=戦略入力・S7=組織設定）。セクションの所属は§1を正とし、本表は配置を示す。

プロト実装追記（2026-07-08・IA再編）: 第一階層の「検索流入分析」を解体し「サイトページ管理」に置き換え（第一階層は7項目のまま）。キーワード管理=狙いを決める場所（キーワード/クエリの2起点）、サイトページ管理=ページを直す・育てる場所（本文はWP正本・Article Summaryのみ保持）、と責務分割。クエリ側（クエリ一致内訳・AI検索の影響・未マッチ候補・クエリ変化）はS2「クエリ分析」タブへ、ページ側（記事×キーワード→ページ一覧・サイト構造ツリー）はS5へ移設。単なるGSCビューア（サチコで足りる画面）への回帰を避けるため、S5は必ず操作（割当編集・リライト起動・リンク採用・CRO差し替え）とセットで構成する。

プロト実装追記（2026-07-08）: S5「クエリ・マッチ品質」タブを実装で分離（概要=検索実績・ローカル順位・内部リンク・改善前後／マッチ品質=クエリ一致内訳×2・AI検索の影響・未マッチ候補・クエリ変化。§5どおり）。検索実績テーブルは クリック/CTR/掲載順位 の列ソート、問題一覧は種別フィルタ（すべて/インデックス/技術）を実装。W7未読バッジは個別既読・全既読と連動。

**旧プロト実装記録（2026-07-09・superseded）**: 当時は通常ビューを全操作面、Officeを監視専用として往復導線を実装した。この責務分離は現行要求では使用しない。既存の部屋、Agent、成果詳細ページ、Workbench導線は、通常ビュー＝Recommendation中心の簡単操作、Office＝玄人向け詳細分析・運用へ再利用する。画面状態と対象Contextを保持する往復機構は維持する。

プロト実装追記（2026-07-08・レイアウト/文言/データ整合の総点検）: 全画面を巡回して以下を統一。①タブ順序を「実測データ→分析」に整列（S2: 流入クエリ→クエリ分析／S5: ページ一覧→流入ページ→カテゴリーツリー。キーは不変）。②URL体系を `/hikkoshi/` に統一（旧 `/moving/` と `greeting-gift`（=aisatsu-gift）の二重スラッグを解消）。③要求IDはUI文言に表示しない方針を確定（REQ-KGA-22 等の括弧書きを注記から削除。要求との対応はドキュメント側で保持）。④S4見出しを自動公開方針と整合（「公開前の承認は**既定で**あなたの手元に残ります（「自動公開」ONの対象を除く）」）。⑤クレジット数値の正本化: 今月消費392cr・月間付与1,200cr（S1残高カード・S4予算管理・S7お支払いで一致。旧: 2,760/4,000/480の混在）。⑥CV目標を138件/月150件に統一（S1プランニング・S4目標管理。旧: 248/320混在）。⑦順位の正規化: 見積もり比較=11位（前回12位）、挨拶ギフト=14位、既存ページ「単身引越し 相場と安くするコツ」=8位系。⑧キーワードの2語分離: 既存ページのプライマリは「引越し 単身 相場」（急変検知-34%→リライトの文脈）、「単身 引越し 相場」は未割当・新規候補（S3/ピックアップ/対策候補）専用に。これに伴い J-1024 は種別「リライト」（既存ページの全面改稿。旧「新規」は既存ページと同名タイトルで矛盾）。⑨緊急停止タブに停止の影響範囲4行（実行中タスク保留/予約公開停止/自動系OFF/手動操作は影響なし）を追加し過疎を解消。⑩S7組織設定のサイト種別を「主サイト/サブサイト」→プラン表記（Standard・表示中/Standard、削除→「解約して外す」）に変更し1サイト=1プランと整合。⑪単位・略語の適正化（cl/週→クリック/週）、「学習ナレッジへ」→「ナレッジ管理へ」、「おまかせ（夜間）」→「おまかせ（夜間割安）」に表記統一。EN辞書も同期。

プロト実装追記（2026-07-10・ゆとり化＋コントロール補完＋Office導線見直し）: ①通常ビューのゆとり化＝S1承認待ちコンパクト行・S2クラスター図再構成（候補の収集元→対策候補タブ・カバレッジ統合）・S3生成履歴の行スリム化（操作は詳細パネル集約）・S6学んだ勝ちパターン1行化・S7を6タブ化（お支払い/通知の分離）。②W7通知に段階表示（既定8件→「すべて表示（残りn件）」・フィルタ切替でリセット）。③テーブルコントロール補完＝S2キーワード一覧/S5ページ一覧/W6タスク履歴にテキスト検索、S5流入ページに列ソート、S4承認に種別フィルタ（すべて/リライト/新規/リンク/CV。S1ダイジェストには非適用・「すべて選択」はフィルタ後のみ対象）、S5ページ一覧/S7消費履歴にCSV、サイト追加にURL形式チェック、サンプル記事モーダルに下書き保持。④Office導線＝●ボタン14箇所を「オフィスで見る」ラベル付きピルに統一、詳細ページCTAを状態依存の直接アクション（未割当=作成/割当済み=リライト/好調・学習元=成功学習/未公開=成果物確認）に変更、詳細ページヘッダーに「元のページへ戻る」（通常→Office切替時に画面＋タブをスナップショットし復元）、TOUR_STEPS_OFFICEに詳細ページ案内ステップ、モード切替にホログラム走査ワイプ演出（reduced-motionでは非表示）。移行案内文言（「〜へ移動しました」）は現在形ガイダンスに全数置換済み。詳細な検証記録は screen-connection-map v1.7 §9 と prototype/CLAUDE.md を参照。

プロト実装追記（2026-07-10・要求突合で検出したREQ-KGA-22/PRODUCT-09の充足）: ①S6ナレッジ管理＞戦略入力に「事業者情報（ローカルSEO）」（名称・住所・電話の編集モーダル＝電話形式チェック・対応エリアchips追加/削除・営業時間）と「ローカル競合・レビュー信号」（自社評価・競合3件＋追加/削除）を新設（REQ-KGA-22②④）。②S3作成するの起点に「地域」を追加（`CT_LOCAL_ORG`＝対応エリア×サービス4候補・ローカルパック順位はS2デモ値と整合）。地域起点選択時は記事タイプチップが「地域ページ（サービスエリア）」になり事業者情報への導線を表示（REQ-NAV-04の画面責務）。③S5テクニカル分析に種別「ローカル」を追加＝名称・住所・電話のサイト内一貫性（事業者情報の登録値とライブ連動）とLocalBusiness構造化データの判定行＋フィルタチップ（REQ-KGA-22③）。④利用同意書に版チップ（v1.0/v1.1）と「版の更新を再現（検証用）」を追加し、重要変更時は差分提示つき再同意モーダル＋常設バナー＋**再同意までctStart（生成開始）を制限**する再同意ゲートを実装（REQ-PRODUCT-09。閲覧・承認・設定は制限しない）。

プロト実装追記（2026-07-10・残課題2件の解消＋ランタイム描画バグ修正）: ①Officeテクニカル部屋に4枚目の詳細ページ「ローカルSEO（名称・住所・電話）」（`tk_local`・型E）を新設＝一貫性ステータス4行・一貫性スコアゲージ・掲載箇所24件のセル格子・監査ログ・影響/修正候補（電話の修正候補と分析文は**事業者情報の登録値とライブ連動**）・CTA「通常ビューでローカル課題を開く」（S5テクニカル分析＋ローカルフィルタ適用で着地）。S5ローカル行の「オフィスで見る」は`technicalPageId()`でtk_crawlフォールバックからtk_local直行に変更。②管理コンソールADM-S12チケット一覧行の死にコード（未配線のselOn/onReply/onImpersonate/onFaq）を削除し、代わりに選択中行のハイライト（rowBg）を配線＝一覧は「選択と表示」・操作は右の詳細パネルという責務を明確化。③dc-runtime（support.js）の系統バグ修正: SVG内の`{{ }}`テキストバインディングがHTML `<span>`で包まれて**一切描画されない**問題（ヘルスゲージの数値/ラベル・リンクグラフのノードラベル・チャート軸が全ページで不可視だった）を、親がSVG名前空間なら`tspan`で包むよう修正。※PT-C（5類型表示トグル）は代表テーブル限定のデモ設計であり、S6事業者情報等の設定系小型リストは従来どおり対象外とする（追認）。

要求写像追記（2026-07-13・L0ビジネス要求 v1.0 の反映）: `ai-office-de-seo-business-requirements_v1.md`（BR-PRC/BR-CRD）の初期商用設定値を REQ-BILL-10 §10.1 へ写像したことに伴い、S7お支払い（プラン4種=エントリー/スタンダード/プライム/エンタープライズへの名称統一・Credit Pack S/M/L/XL＋追加購入・繰越/失効予定・消費順表示・解約時失効条件の明示）と W5（見積10%超過時の追加承認・障害時100%返還表示=BR-CRD-005/006）を更新した。実数はすべて設定レジストリ初期値であり、プロトのデモ値（付与1,200cr等）は次回プロト更新でBR初期値系へ置換する（未反映=プロト側残課題）。コンサル/完全委託商品（BR-CNS-*）に対応する画面は本台帳に存在せず、画面要否は未決（管理側=ADM-S2/工数配賦との整合はBR-OPS-002参照）。
