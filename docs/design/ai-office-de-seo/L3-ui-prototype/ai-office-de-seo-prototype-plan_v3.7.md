---
document_id: AOS-L3-PROTOTYPE-PLAN
title: AI Office de SEO 画面プロトタイプ構築計画 v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-07-05
related_plan: PLAN-L3-02-ai-office-de-seo-screen-prototype
---

# AI Office de SEO 画面プロトタイプ構築計画

## 1. 目的と位置づけ

- 目的: 2モードUI（通常SaaS / Agent Office）の体験・情報設計・コンポーネント分割を、実装前に動くモデルで検証する。
- 位置づけ: これはUI検証のためのプロトタイプであり、本番実装順序（REQ-DUR-03: 本質A/B先行）とは別トラックである。REQ-DUR-05「Agent Office演出を実イベントログなしに先行しない」は本番化の禁止事項であり、プロトはモックイベント（AOS-L3-CONTRACT-SCHEMAS §5の共通エンベロープ準拠）で駆動してよい。ただしモックイベントの形は本番イベントスキーマと同一とし、後日の実接続で差し替え可能にする。

## 2. 検証したいこと（プロトの問い）

1. Site導入から分析、Report、月次計画、Recommendation、Agent実行、CMS、評価、学習までが、再入力と行き止まりなしで一つの業務Lifecycleとして成立するか。
2. 2モードが同じ業務entity・Command/Event・権限を使いながら、通常ビュー＝簡単操作、Agent Office＝詳細探索・会話・条件／Task変更として成立するか。
3. 探索/おすすめの2軸が各画面で自然に同居するか（REQ-AOUI-05）。
4. 状態機械の工程可視化（キャラ4状態）が、装飾でなく実状態の理解に寄与するか（REQ-AOUI-04 / Design.md アンチパターン「キャラを装飾で終わらせない」）。
5. 事前計算中・欠損（GSC匿名化/切り捨て注記）・hard gate保留といった「正直な状態表示」がUIとして成立するか（REQ-SEC-06 / REQ-KGA-11 / REQ-AGENT-08）。
6. Market全体とSite Shareを基線に、新規Site戦略Reportと既存Site診断Reportを区別して理解できるか。
7. Recommendation採用時の全Contextが`schema.intake.recommendation.v1`へfreezeされ、S3・Office・Automationで再入力されないか。
8. 最初の新規15記事、解放済み自動投稿、リライト承認、hard gate例外が、同じ「承認」表示へ潰れず理解できるか。
9. 公開・更新後のSEO、CTA/CV、認知貢献、1/3/6か月、月次／累積評価が次のRecommendationへ接続するか。

## 3. 技術方針

- 実装: React（単一ページ内でモード切替）。CSSはダーク（Agent Office）/ライト（通常）2テーマ、Design.md §6のビジュアル言語（ダークネイビー＋ネオンブルー/パープル）に従う。
- 素材: `docs/reference/assets/` のWebPを使用。使用可否はASSET-MAPPINGの確度に従う — 「確定」は本採用、「暫定」は仮置き（差し替え前提を明記）、「参照」「superseded」は画面に組み込まない。
- 描画境界: 画像は背景・キャラ・部屋・看板枠・装飾のみ。テキスト・数値・表・グラフ・フォーム・進捗はHTML/CSS（REQ-NAV-05 / REQ-AOUI-03）。看板の固定ラベルのみ画像化可。
- レイアウトのconfig駆動: 部屋・フロア・ペルソナ・部屋⇄画面対応は `office_layout.initial.json`（Gate A-3凍結・正本）から描画し、ハードコードしない（REQ-AOUI-07）。通常ビューとAgent Officeで別データ形状を作らず、同一JSONを正本に共有する。初期構成＝部屋7＋ハブ、7フロア（1部屋=1フロア）。
- 状態管理: 画面状態・詳細コンポーネント・モックAPIクライアントを両モードで共有し、モードは「入口とクローム」だけを差し替える構造にする（REQ-AOUI-01の構造的証明を兼ねる）。

## 4. モックデータ契約（捏造を作らないためのルール）

- Source Pack JSON（REQ-PACK-07の型）と schema.snapshot.*（AOS-L3-CONTRACT-SCHEMAS）に準拠したフィクスチャのみを使う。プロト都合の独自フィールドを追加する場合は `_proto_` プレフィックスで隔離し、本設計へ逆流させない。
- GSC系フィクスチャには匿名化・切り捨て注記（anonymization_note / truncation_note）を含むケースを必ず用意し、「クエリ行合計＜総合計」を再現する（REQ-KGA-11 §11.3のUI検証）。
- QAフィクスチャには pass / advisory fail（Repair導線）/ hard_gate_block（保留・人手判断導線）の3系を用意する（REQ-PACK-09）。
- 数値（クレジット単価・しきい値等）はConfig初期値台帳（AOS-L3-CONFIG-REGISTRY-DEFAULTS)の値を参照し、画面に「初期値」であることを示すダミー水準で置く。実在の市場価格・実サイトデータを模した数値を埋め込まない。

## 5. ビルド順序（画面プロトのフェーズ）

1. **PT-0 基盤**: デザイントークン（2テーマ）/ 共有レイアウト / モックAPIクライアント / office_layout.initial.json（Gate A-3） / 表示状態5類型（通常・読込中・計算中・空・エラー）の共通表現。
2. **PT-1 通常ビュー縦切り（P0画面）**: S1 ダッシュボード → S2 キーワード管理 → S5 検索流入分析 → S3 コンテンツ作成（W3 生成プレビュー・QA結果を含む）。
3. **PT-2 共通ワークベンチ**: W1 全画面ワークベンチ / W2 差分プレビュー / W4 承認キュー / W5 ジョブ進捗（モックイベント駆動・13状態表示）/ W6 ジョブ履歴 / W7 通知・アラートセンター（モックイベント→通知導出の同一エンベロープ検証）/ W8 緊急停止・おまかせ制御 / W9 同意書・テナント切替 / W10 サポート（AI一次応答パネル・チケット作成/追跡・エスカレーション導線。REQ-PRODUCT-22）。
4. **PT-3 Agent Office**: AO-0 俯瞰ハブ → AO-1〜AO-7 部屋と選択メニュー → AO-8 状態オーバーレイ（記法注: AO-*は本計画内のAgent Office要素の局所番号。遷移図の管理ノードA1〜A12＝ADM-S*とは無関係）。詳細はPT-1/PT-2のコンポーネントをそのまま呼ぶ（新規詳細を作らない）。
5. **PT-4 残画面**: S4 オートメーション → S6 学習ナレッジ管理 → S7 設定。
6. **PT-5 検証**: §6の観点でウォークスルー、差し替え課題（暫定アセット・TODO）を棚卸しして本設計へフィードバック。
7. **PT-6 管理面トラック（開発管理者コンソール）**: AOS-L3-ADMIN-SCREEN-INVENTORY に従い、ADM-S8（Pack・プロンプト・ゲート管理＝新設REQ-ADM-10の検証）→ ADM-S4（コスト・観測）→ ADM-S2（課金・入金reconciliation）→ ADM-S12（サポートデスク: キュー/SLA/deflection・FAQ還流起票・なりすまし調査導線＝PT-Yで検証）の順で作る。残る ADM-S1 / ADM-S3 / ADM-S5 / ADM-S6 / ADM-S7 / ADM-S9 / ADM-S10 / ADM-S11 はPT-0基盤とPT-6コンポーネントの上に順次実装し、全12画面がプロト対象（対象外の管理画面を作らない）。ユーザー面とテーマ・コンポーネント基盤（PT-0）を共有するが、面としては分離する（REQ-ADM-01）。

通常ビュー→Agent Officeの順は REQ-DUR-02（DU-15: 通常ビュー完成後にAgent Officeを乗せる）の思想に合わせる。

## 6. プロト受入観点（チェックリスト）

- [ ] PT-LC-01: 新規Siteで「Site設定・CMS接続→業界等の入力→big keyword方向確認→市場探索→Cluster分析→戦略Report→月次計画→Recommendation」へ到達できる。
- [ ] PT-LC-02: 既存Siteで「Site設定→CMS/GSC/Keyword upload→統合分析→市場Keyword母集団に対する自社Share→診断Report→月次計画→Recommendation」へ到達できる。
- [ ] PT-LC-03: Recommendation採用時に`recommendation_id+version`、`intake_ref`、`correlation_id`が発行され、目的、Cluster、intent、記事目的、CTA、内部link、品質、予算、保護、availabilityがS3／S4／Officeへ再入力なしで渡る。
- [ ] PT-LC-04: Recommendation typeごとに新規、リライト、CTA Patch、内部link Patch、観測、技術エスカレーション、Automation変更へ分岐し、すべてを記事生成へ流さない。
- [ ] PT-REC-01: 判定側の`create_new / merge_or_canonicalize / internal_link / do_nothing / index_diagnostic`が正規Actionへ変換され、画面、Intake、event、履歴で同じtypeを使用する。
- [ ] PT-REC-02: `request_input / observe / protect / no_action`の採用または確定で記事生成Jobが作成されず、不足入力、再開条件、保護理由または再評価日が表示される。
- [ ] PT-REC-03: CTA Patchと内部link Patchが全文記事生成とは別Taskとして、対象part、差分、承認、CMS結果、評価起点まで追跡できる。
- [ ] PT-REC-04: structure changeとindex診断はユーザー対応として表示され、canonical、redirect、Site設定を自動変更した表示にならない。
- [ ] PT-REC-05: ユーザー指定Taskと自動予定が衝突した場合、ユーザーTaskを維持して影響・依存・推奨順序を示し、自動予定だけを要確認へ戻せる。
- [ ] PT-REC-06: 月次計画または分類変更後も実行済み施策のversionと履歴を維持し、未実行Recommendationだけが再計算・supersedeされる。
- [ ] PT-PATCH-01: CTA候補が記事目的、検索intent、CV Goal、CTA part、link先、月次／累積値を持ち、本文全文リライトやCTA専用Writing Ticketなしで承認・適用できる。
- [ ] PT-PATCH-02: 内部link候補がリンク元、リンク先、対象part、重複・公開・canonical・カニバリ・保護検査を持ち、既存記事への追加は承認後、削除は別確認になる。
- [ ] PT-PATCH-03: 一括承認したPatchの一部が失敗または競合しても、成功・失敗・再試行が候補単位で表示され、Batch全体を成功にしない。
- [ ] PT-PATCH-04: CMS応答成功後に反映確認できなければappliedにせず、接続、Capability、競合、rate limit等の原因を表示する。
- [ ] PT-PATCH-05: CTA／内部link変更でSEO評価周期を無条件にリセットせず、介入別の月次／累積評価から次のRecommendationへ戻せる。
- [ ] PT-REPORT-01: 新規Site戦略Reportが市場、Site適合、優先Cluster、構造提案、制作順、月次配置を持ち、実績不在を異常表示しない。
- [ ] PT-REPORT-02: 既存Site診断Reportが市場Keyword母集団からObserved／Estimated／Article Share、獲得／未獲得Keyword、記事・Query、保護・改善・index・Drift・カニバリ・CTA／linkへ掘れる。
- [ ] PT-REPORT-03: 新規戦略と既存診断が別fixture・別章立てで、同じ記事一覧のラベル違いになっていない。
- [ ] PT-REPORT-04: Cluster単位の優先／通常／保留／除外変更前に、未実行推薦、月次配分、予測creditへの影響を表示し、実行済み施策を変更しない。
- [ ] PT-REPORT-05: 部分分析Reportがcoverageと未分析領域を表示し、分析済みClusterから段階利用できる。
- [ ] PT-REPORT-06: Reportから月次計画、Recommendation、Market／Share詳細、Officeへ`report_id+version`とCluster Contextを保持して往復できる。
- [ ] PT-LC-05: 最初の新規15記事、解放後の新規自動投稿、リライト／記事置換、hard gate例外手動公開を別fixtureと別表示で検証できる。
- [ ] PT-LC-06: 公開・更新eventから1/3/6か月、SEO、CTA/CV、認知貢献、要監視、Site補正、匿名補正候補、再Recommendationまで相関を維持する。
- [ ] PT-LC-07: 通常ビューの各主要対象からOfficeへContext付きで移動し、質問は非更新、変更指示はProposal→影響・credit→確定→共通Command/Eventとして双方向反映される。
- [ ] PT-LC-08: Planロック、データ不足、接続不足、権限不足、処理中、障害を別状態として表示し、同じ灰色ロックへ潰さない。
- [ ] PT-LC-09: 旧価格、旧credit条件、Claude優先、旧Role、一律承認、Office監視専用の文言・fixtureが現行画面に存在しない。
- [ ] PT-AUTH-01: S7で3基本権限、4業務権限、Site Assignmentだけを設定でき、業務権限なしのユーザーが閲覧専用として成立する。旧Viewerや低水準Permissionを顧客へ表示しない。
- [ ] PT-AUTH-02: 契約者／サイトオーナーでも対応業務権限なしでは目標、Keyword戦略、記事、分析設定を変更できず、API fixtureでも同じreason codeで拒否される。
- [ ] PT-AUTH-03: 同じ操作を通常ビュー、Office、API、worker、Agent tool、Automationから実行し、`schema.authorization.decision.v1`の同一policy versionで同じ判定になる。
- [ ] PT-AUTH-04: Agentへの質問はread範囲で回答し、変更会話は操作別Proposalへ分解して、権限不足項目だけを理由付きで拒否できる。
- [ ] PT-AUTH-05: Automation設定者の退会、業務権限取消、Site移管、委任期限切れ、接続Scope変更、Kill Switch後にCMS副作用が停止して確認待ちへ遷移する。
- [ ] PT-AUTH-06: 内部Admin／Manager／Operatorが顧客面と別session・別namespaceで動き、Manager代理操作のacting principalと顧客Contextを区別し、Operatorが顧客変更・本文・秘密へ到達できない。
- [ ] PT-MARKET-01: S2でClusterを基本単位にMarket、Observed Share、Estimated Share、Article Shareを切り替え、各値のprovenance、availability、confidence、期間を確認できる。
- [ ] PT-MARKET-02: 新規Site戦略ReportがGSCなしで成立し、数値実績を捏造せず、既存Site診断ReportがGSC獲得語だけでなく公共市場・未獲得領域を含む。
- [ ] PT-MARKET-03: 公共Keyword、GSC Query、user upload、Site抽出、商品・顧客seed、競合観測が別source typeで表示され、顧客固有語を公共assetとして表示しない。
- [ ] PT-MARKET-04: Public Cluster改版fixtureでSite Projectionをstale表示にするが、ユーザー確定のCluster境界、代表語、記事割当を自動上書きしない。
- [ ] PT-MARKET-05: ユーザーによる業界、横断軸、Cluster、代表語、primary／secondary、記事割当の修正がSiteへ反映され、匿名Global補正候補とは別状態になる。
- [ ] PT-MARKET-06: Market→Share→戦略Report／診断Report→月次計画→Recommendation→実行→評価→補正の同一Site Cluster Contextを往復できる。

- [ ] PT-A: 通常/Agent Officeで同一の詳細コンポーネント・モックAPI・状態が使われている（コード上、詳細の二重実装がない）。｜ REQ-AOUI-01（AC-AOUI-01/04）
- [ ] PT-B: 第一階層はREQ-NAV-01の7項目・正式ラベルで、内部用語が現れない。｜ REQ-NAV-01（AC-PRODUCT-02/03）
- [ ] PT-C: 全一覧・詳細が表示状態5類型（通常/読込中/計算中/空/エラー）を持ち、計算中は再試行手段を提示する。｜ REQ-SEC-06（AC-PERF-03）
- [ ] PT-D: 各画面に探索/おすすめの2軸があり、おすすめの採用/却下UIがある。｜ REQ-AOUI-05（AC-AOUI-03）
- [ ] PT-E: キャラ状態がモックイベント（本番同形）から導出され、手書きアニメではない。｜ REQ-AOUI-04（AC-AOUI-02）
- [ ] PT-F: hard gate保留・匿名化注記・暫定プロファイル（REQ-WPA-06）の「正直表示」が実装されている。
- [ ] PT-G: 部屋・フロア・ペルソナがoffice_layout.initial.json（同形の差し替えJSON）の変更だけで増減できる。｜ REQ-AOUI-07（AC-AOUI-07）
- [ ] PT-H: 画像に日本語テキスト・数値・表・グラフが焼き込まれていない。｜ REQ-NAV-05（AC-NAV-04）
- [ ] PT-I: 管理コンソールがユーザー面と分離され、APIキー原文・secret・本文/プロンプト全文が画面のどこにも現れない（mask・hash表示）。｜ REQ-ADM-01 / REQ-SEC-11（AC-ADM-01）
- [ ] PT-J: Pack/few-shot/ゲートの編集がdraft→Preview→Validate→Approve→Publishの統制UIで完結し、公開済みversionを直接編集できない。｜ REQ-ADM-10（AC-ADM-09）
- [ ] PT-K: 価格・係数・しきい値の変更がADM-S7の設定画面から完結し、安全不変条件キーが設定一覧に現れない。｜ REQ-ADM-09 / REQ-BILL-10（AC-ADM-06）
- [ ] PT-L: 主張軸に根拠を伴えない断定を含むフィクスチャで、登録時Validate差し戻しと実行時hard保留（deceptive_claim/claim_evidence系）が動き、QA不合格プレビューに「どの指定が影響したか」の帰属と見直し導線が表示される。｜ REQ-PRODUCT-12（AC-CUST-02/03）
- [ ] PT-W: S7で稼働時間帯を設定でき、ADM-S4に負荷平準化ヒートマップ・ノード密度/しきい値接近・本文取得省略効果が表示される。｜ REQ-SRC-10 / REQ-DUR-06 / REQ-PRODUCT-20（AC-SCHED-01, AC-CAP-01）
- [ ] PT-V: S5フラッシュ候補（CTR負残差・AIO切り分け）→TDH複数案→W4承認→部分パッチ適用のフローと、S6のCVポイント台帳→割当→CRO提案→差し替えのフローが動作し、部分パッチの競合検知が安全側停止する。｜ REQ-RWR-09 / REQ-WPA-12 / REQ-WPA-13（AC-FLASH-01, AC-PATCH-01, AC-CRO-01）
- [ ] PT-U: 第二階層タブ台帳（§5）どおりのタブ構成で各画面が分割表示され、タブへのURL直リンクと通知からのタブ直遷移が機能し、W4がリンク再調整/波及の小リライト承認を扱える。｜ REQ-NAV-02 / REQ-KGA-19 / REQ-RWR-08（AC-NAV-05）
- [ ] PT-T: S1プランニングタブ（目標→配分→予測レンジ→実績）、S2トポロジープランナー（ツリー表示とリンク再調整キュー）、S5リライトブリーフ・好調保護・インデックス問題一覧、ウォッチリストのピン留め→通知が動作する。｜ REQ-PRODUCT-17 / REQ-KGA-19/20/21 / REQ-RWR-08（AC-TOPO-01ほか）
- [ ] PT-Z: 主要行動（生成起動・承認・保留対応・通知確認）がキーボードのみで到達でき、フォーカスリングが両テーマで可視、prefers-reduced-motionでpulse/glow/キャラアニメが停止し、自動チェック（コントラスト・ラベル欠落）が通る。｜ REQ-NAV-08（AC-NAV-06）
- [ ] PT-Y: W10でユーザー起票→AI一次応答（スコープ内参照限定・低確信時は捏造せずエスカレーション提案）→ADM-S12キュー着信→SLA/優先度で対応→回答がW10チケット追跡に反映される往復が動作し、deflection計測が表示され、解決ナレッジのFAQ還流起票（ADM-10統制）となりすまし調査導線（step-up＋監査記録）が機能する。｜ REQ-PRODUCT-22 / REQ-SEC-16（AC-SUPPORT-01/02）
- [ ] PT-X（fixture必須セット）: モックデータ/モックイベントに以下の異常系・境界系fixtureを必ず含め、正常系のみのプロトにしない——①GSC匿名化・切り捨て（匿名化分の別掲表示、REQ-KGA-11/15）②tenant/site境界違反の拒否（fail-close表示、REQ-SEC-07）③クレジット不足・予算超過（Preflight差し戻し、REQ-SEC-12）④hard gate保留（W3の保留導線・影響帰属、REQ-AGENT-08）⑤scheduled選択時の鮮度警告（REQ-KGA-18/BILL-11）⑥full_auto有効化の確認UI（Owner/Admin限定、REQ-WPA-04）⑦登録同意未済ブロック（W9、REQ-PRODUCT-09）。fixtureはSource Pack / Snapshot / イベントエンベロープ契約（Gate A-1/A-5）と同形で作成する。
- [ ] PT-S: 画面遷移図（AOS-L3-SCREEN-FLOW）の全パスがクリックで到達可能で、通知→対処が2遷移以内、行き止まり（次アクションのない画面/空状態）が存在しない。｜ REQ-UJ-01〜09（AC-UJ-01〜09）
- [ ] PT-R: S2でキーワード選択→「記事作成」→S3に起点・グループ・推奨タイプがプリセットされ、assigned済みグループでは起動時にリライト誘導が表示され、複数選択の一括投入で「おまかせ」既定＋Preflight合算が出る。｜ REQ-NAV-04 / REQ-KGA-14 / REQ-BILL-11（AC-NAV-05）
- [ ] PT-Q: グローバル検索・CSVエクスポート・運営お知らせ表示・画面状態5類型（通常/読込中/計算中/空/エラー）・閲覧系のモバイル表示が動作し、UI文言がハードコードでなく外部化され、ui.text.*レジストリの版差し替えのみで表示文言が変わり（デプロイ不要・未定義キーはベース文言フォールバック）、文言参照が生成済み型付きアクセサ経由で、プロトコードに日本語リテラルが存在しない（lint通過）。｜ REQ-PRODUCT-14/15/16 / REQ-NAV-06/07（AC-EXPORT-01ほか）
- [ ] PT-P: 左サイドメニュー＋タブ構造で両面が実装され、S2の手動追加/一括インポート/シード展開登録、S3の起点選択、ADM-S8のPack/few-shot/辞書編集フロー、ADM-S2の価格改定フローが**実際に操作できる**（閲覧専用でない）。｜ REQ-NAV-02 / REQ-KGA-03 / REQ-ADM-10 / REQ-BILL-10（AC-NAV-05）
- [ ] PT-O: 管理コンソールの各画面で内部キーが日本語ラベル＋キー併記になり、未登録キーに「ラベル未登録」印が出る。ADM-S4にレーン別コスト・バッチフォールバック監視が表示される。｜ REQ-ADM-11 / REQ-BILL-11（AC-ADM-10）
- [ ] PT-N: 構成案プレビュー（W3相当）にoutline_contract由来のarticle_type_key/heading_flow_keyが表示され、「サンプル記事の型」（文体学習）と混同されない。QA結果はsnapshot.qa.v1のgatesをgate key対応つきで描画する。｜ REQ-PACK-11 / REQ-PACK-16 / Gate A-5
- [ ] PT-M: W5で一時停止→再開のモック操作が、完了済みステージを再実行せず（job_suspended/resumedイベント同形）、再開時に再ウォーム費を含む再見積を提示し、S3のレーン選択（今すぐ/おまかせ）でPreflight見積額が切り替わる。｜ REQ-AGENT-10 / REQ-BILL-11（AC-AGENT-16, AC-BILL-11）

## 7. 成果物

同梱範囲（v3.7.50改訂）: プロトアプリ実体は **`prototype/` ディレクトリとして本パッケージに同梱**する（`AI Office de SEO.dc.html` / `Admin Console.dc.html` / `support.js` / `config/` / `assets/` / 作業記録=CLAUDE.md / プロト側Design.md追補原本。未参照の中間物は同梱しない）。役割分担は不変——**仕様の正本は常に `docs/`**、プロトは実装実証であり、実装から設計への収穫（例: Gate A-3 v1.1 holo・v1.3 7フロア・Design.md §6.4〜6.7）は追補として正本へ反映し、正本との乖離は照会（README改訂メモ）とCLAUDE.mdバックログで双方向管理する。受入はPT-A〜PT-Zチェックで行う。

- プロトアプリ一式（React、モックフィクスチャ、office_layout.initial.json同形データ）。
- 画面別の確定メモ（コンポーネント分割・命名・状態遷移）→ L3 UI詳細設計への入力。
- 暫定アセット（char_pose_01〜15、scene_01〜09、bg_01〜04）の役割確定リスト → ASSET-MAPPINGの「暫定」解消。
