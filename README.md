# AI Office de SEO 要求定義 v3.7 clean

本ZIPは **AI Office de SEO** の企画・要求定義を、上流成果物として整理したものです。

この版では、過去の実装資産への依存・参照を要求本文から外し、AI Office de SEOとしての独立した要求だけを収録しています。コード、DB migration、API実装、WordPressプラグイン実装、テストコードは含めません。

## v3.7 改訂メモ（トレース整備・要求補完・実装順序精査）

### v3.7.50 プロト実体の同梱（`prototype/`）

- v3.7.43の「プロト非同梱」規定を改め、プロトDC実体を **`prototype/`** として同梱（2つのDC・support.js・config・assets・作業記録CLAUDE.md・プロト側Design.md追補原本）。**未参照の中間物は整理して除外**（assets_min=どこからも未参照、uploads/貼り付けPNG、thumbnail）。manifestに `prototype_paths` を新設。
- プロトCLAUDE.mdを整備: 誤字修正（「捏造」の簡体字系異体字混入を是正）、正本参照を同梱リポジトリ`../docs/`へ更新、**v3.7.49照会の差し戻しP1〜P3をバックログとして追記**（event_type改名／PT-X②境界fixture／CVポイント台帳のS6移設）。
- 役割分担は不変: 仕様の正本は`docs/`、プロトは実装実証。config/design-tokens.cssはGate A-4と完全一致、config/office_layout.jsonは初期正本（v1.3・7フロア）と一致済み。

### v3.7.49 プロト実体との突合（照会）と書き戻し

プロトDC実体（`AI Office de SEO.dc.html` / `Admin Console.dc.html`・config・assets）を受領し、v3.7.48正本と静的突合した。

- **適合確認（PASS）**: design-tokens.css＝Gate A-4と完全一致／office_layout＝スキーマ・部屋7・ペルソナ13・screen_refs全適合（config駆動PT-G実証）／表示状態5類型・reduced-motion・focus-visible（PT-Z）／W10・ADM-S12実装（PT-Y）／ui.text.*レジストリ＋TXT i18n（約780語・MTフォールバック）＋LABELS辞書（NAV-09系）／内部用語のUI露出＝検出ゼロ（§6.5点検の実効を確認）／PT-Xの①⑤⑥⑦系fixture痕跡あり／使用event_type 13種中11種がGate A-1カタログ適合。
- **正本への書き戻し（本版で実施）**: ①Design.mdへ**§6.4〜§6.7**（シェル規約・**UI表示言語規約＋対訳表**・Agent Office演出規約・テーマ規約）を取り込み——プロト側で確定運用済みだった規約が正本未反映だった ②**office_layout.initial.jsonを7フロア構成（1部屋=1フロア＋ハブ・v2.1.0）へ改訂**（Gate A-3 v1.3・スキーマ不変・PO決定）＋「2フロア」表記4文書を追随 ③ASSET-MAPPINGへ使用禁止注記（scene_05/08/ref=数値焼き込み・background-image規約） ④画面台帳へW8/W9の実装形注記（S4/S7内セクション許容・到達規約不変）。
- **プロト側への差し戻し（3件・要修正）**: (P1) event_type `job.suspended` / `job.resumed` がカタログ外——正本は `generation.job_suspended` / `generation.job_resumed`（Gate A-1）。mkEnv呼び出しの改名 (P2) **PT-X②境界違反のfail-close表示fixtureが未実装**（範囲外データ要求→拒否表示・監査記録の再現。他6系は実装済み） (P3) CVポイント台帳の配置——正本はS6（戦略入力）に台帳（カタログ登録・記事割当・有効期間）、S5はCRO差し替え提案。プロトのS5タブ実装は旧CLAUDE.mdの誤読由来（「S6=学習ナレッジ」は誤り）。S6へ移設しS5には導線を残す。
- **残バックログ（既知・妥当）**: テンプレート静的文言の全面外部化は本実装のi18n基盤で対応（プロトはTXT走査方式で機能実証済み）、ADM-S10 Kill Switch本体細目。プロトアプリ実体は引き続き別成果物管理（v3.7.43の同梱範囲規定どおり）。

### v3.7.48 関数⇄日本語の双方向変換（UIテキストレジストリの機械化）

`REQ-NAV-09`を拡張し、キー正本・日本語データの構造を双方向変換の機械へ昇格した。

- **関数→日本語（コード生成）**: レジストリからビルド時に型付きアクセサを自動生成。コードは関数参照のみで日本語リテラルを書かず、存在しないキー参照・変数シグネチャ不一致はビルドエラー（実行時欠落のコンパイル時前倒し）。生成物はレジストリ版とハッシュで対応・手編集禁止。
- **外部化の機械強制**: UIコードの日本語リテラルをCI lintで検出（例外は許可リスト管理）。「外部化されている」を宣言でなく構造保証に。
- **日本語→キー（逆引き）**: ADM-S8と開発ツールに逆引き検索（完全/部分一致・候補リスト）。一意性確保のため同一名前空間内の文言完全一致重複をValidate警告。
- **共通術語辞書基盤**: 管理面ラベル（`REQ-ADM-11`）とユーザー面が同一術語テーブルを参照し、同じ内部キーの訳語が面間で揺れない（表示方針の差——ユーザー面は隠す/管理面は訳して併記——は維持）。
- 波及: AC-NAV-07・PT-Q・用語・FEATURE-LIST。REQ 181件・AC 234件（件数不変・既存要求の深化）で完全対応維持（機械照合ALL PASS）。

### v3.7.47 UI文言の運用差し替え機構（UIテキストレジストリ）

- **`REQ-NAV-09`新設**: `REQ-NAV-07`の「外部化」を運用機構へ確定——ユーザー面の全文言（ラベル・タブ・ボタン・空状態/エラー/確認文言・オンボーディング・in-app通知テンプレ）を `ui.text.*` レジストリで版管理し、**版activateのみでデプロイなし差し替え**（編集はADM-S8・ADM-10統制）。2層フォールバック（同梱ベース文言→キー表示＋欠落観測、silent failure禁止）、名前付きプレースホルダの整合Validate、禁止語（内部用語・provider名）混入の機械検査、管理面レジストリ（`REQ-ADM-11`）と同一基盤・別名前空間（Pack注入経路と混線させない）。
- **`REQ-PRODUCT-09`拡張（再同意）**: 同意書・規約の**版管理と再同意機構が未定義だった**商用ギャップを封鎖——同意記録に版を紐付け、重要変更（区分は法務判断=D-16）の版UP時は差分提示つき再同意を要求、軽微変更は通知のみ。**法務文言はUIテキストの自由差し替え対象外**として二重統制を明確化。
- 波及: AC-NAV-07新設・PRODUCT-09系AC拡張、ADM-10管理対象・ADM-S8列挙・PT-Q・BC Experience（NAV-01〜09）・用語・FEATURE-LIST。メールテンプレ（`REQ-PRODUCT-21`のCatalog管理）・管理面ラベル（`REQ-ADM-11`）は既存カバーを確認。REQ 181件・AC 234件で完全対応維持（機械照合ALL PASS）。

### v3.7.46 表記リント（全文自動検出の残渣修正）

全文リント（句読点破損・簡体字・太字記号の不均衡・frontmatter日付）を実行し3件を修正: ①README改訂記録内の誤字引用に簡体字が残存し「未修正」に見えていた表現を、簡体字を再現しない記述へ変更（検証ログ本体はv3.7.36で修正済み） ②画面台帳S5行の太字マーカー不均衡（余分なアスタリスク対1個・v3.7.35原本からの持ち越し） ③gate-a-4のupdated_at取り残し（07-02→07-05）。句読点系の検出3件はすべて正しい日本語（誤検知）と確認。

### v3.7.45 商用化（Go-to-Market）観点の抜け監査

設計整合ではなく販売開始のブロッカーというレンズで監査し、D台帳へ**Launch区分**を新設して7件を追加した（単一台帳原則の維持＝別文書を作らない）。

- **D-29 Google OAuth検証・API規約適合（最重要の抜け）**: GSC読み取りはsensitiveスコープでありOAuthアプリ審査が必須・リードタイムが長い。Search Console/URL Inspection APIの規約適合、YouTube API利用時のLimited Use、年次再確認まで台帳化。βより前に着手すべき最優先項目。
- **D-30 WPプラグイン配布経路**（wp.org審査＋GPL整理 or 自前配布＋署名付き更新）。
- **D-31 顧客向けSLA/稼働率の公約方針＋公開ステータスページ**（内部SLO・in-appステータス案内は既存。対外公約の有無・水準は未定だったため確定項目化）。
- **D-32 適格請求書（インボイス）・Stripe税設定・特商法ページ**（Stripe本番審査要件と連動）。
- **D-33 トライアル/無料枠・デモ方針**（Pricing Configuration側で定義。マスターテナントのデモ転用可否含む）。
- **D-34 商標・ブランド保護＋マーケティング表現規約**——製品内の「順位・成果を保証しない」原則を広告・LPへも適用（景表法・優良誤認の回避）。
- **D-35 L0事業章の補強（PO入力待ち）**: ターゲット顧客像・価格帯仮説・事業KPIは外部レビューB-11以来の保留。販売開始前の必須確定として台帳へ格上げ。
- **D-16を法務一式に詳細化**: 利用規約／プライバシーポリシー（APPI・**LLMプロバイダへの委託/国外移転の開示**）／特商法／同意書群／解約・返金条項。
- 小拡張: `REQ-SEC-10`にオフボーディング時の**解約理由の任意収集**（チャーン分析入力・回答を解約条件にしない）を追加し、該当ACへ検証条項を追記。
- 確認済み（抜けでなかったもの）: 公開障害案内（ステータス案内）・サポートSLA・オフボーディングエクスポート（ロックイン回避）・成果非保証原則・事例許諾（showcase）は要求として既存。REQ 180件・AC 233件で完全対応維持（機械照合ALL PASS）。

### v3.7.44 ユーザビリティ・メモリ階層・DB境界の3観点監査

- **[UX] `REQ-NAV-08`新設（アクセシビリティ品質床の要求化）**: Gate A-4に実装既定として存在した品質床（フォーカス可視・WCAG AA目安・reduced-motion）が**要求IDを持たずトレース外**だったため要求へ昇格。キーボード到達性（UJ-01の主要行動と接続）・支援技術配慮・「Agent Officeが唯一経路にならない」（AOUI-01の構造保証と接続）を追加し、AC-NAV-06・PT-Z（プロト受入）・D-28（準拠レベル/ツール確定）で検証線を通した。行動系（2遷移到達・行き止まり禁止・破壊的操作の確認・未保存保護・文脈引き継ぎ＝UJ-01、オンボーディング＝UJ-02）は既カバーを確認。
- **[メモリ] `REQ-AGENT-03`拡張（キャッシュは記憶ではない）**: メモリ階層を4層で固定——揮発（Prompt Cache/TTL生キャッシュ=費用最適化。**TTL失効で正しさが変わる設計を禁止**）／ジョブ（Snapshot・checkpoint）／恒久（Derived Facts・施策台帳・サマリー・Style Color・few-shot＝鮮度期限つき）／横断（Global Signal Store=k匿名）。
- **[メモリ] `REQ-PRODUCT-19`拡張（書き込みガード＝幻覚の永続化防止）**: 導出事実の書き込みはSnapshot経由・管理層のスキーマ検証後のみ。**source_ref根拠のない事実・鮮度期限のない事実は永続化拒否**（LLMの推測を恒久層へ昇格させない）。AC-FACT-01へ検証条項を追加。
- **[DB境界] 監査結果=不備なし**: Executorの直テーブル・生SQL禁止／読み取りはSource Extract（JSON契約）のみ／書き込みはSnapshot契約経由で管理層が永続化、は`REQ-PACK-06`・Gate A-2・ツール実行層default-deny（`REQ-AGENT-06`）で既に三重に構造化済みであることを確認。
- REQ 180件・AC 233件で完全対応維持（機械照合ALL PASS）。

### v3.7.43 プロト計画のカバレッジ完全化（W10/ADM-S12・表記統一・同梱範囲）

- **PT-2のW10欠落を修正**: v3.7.33のW10追加時、プロト計画のワークベンチ列挙がW1〜W9のまま残っていた（画面系クロス照合の「遷移図・台帳」検査では検出されず、ビルド順序の列挙照合で発見）。W10（AI一次応答パネル・チケット追跡・エスカレーション）を追加。
- **PT-6の管理画面カバレッジ明確化**: 優先3画面（ADM-S8/S4/S2）に**ADM-S12（サポートデスク）を追加**し、残る8画面（ADM-S1/S3/S5/S6/S7/S9/S10/S11）も順次実装＝全12画面がプロト対象であることを明記（対象外の管理画面を作らない）。
- **受入観点PT-Y新設**: W10⇄ADM-S12のサポート往復（起票→AI一次応答→エスカレーション→キュー→回答反映）、deflection計測、FAQ還流起票、なりすまし調査のstep-up＋監査（AC-SUPPORT-01/02接続）。
- **表示状態の表記統一**: PT-0「状態4種」・PT-C「4状態」・PT-Qの4項目列挙を、画面台帳の正（5類型=通常/読込中/計算中/空/エラー、v3.7.36で一本化済み）へ統一。
- **office_layout正本の統一**: 「office_layout.json（仮）」表記をGate A-3凍結の `office_layout.initial.json` 参照へ統一し、「通常ビューとAgent Officeで別データ形状を作らない」を明記。Agent Office要素の局所番号をAO-*へ改記（遷移図の管理ノードA1〜A12との記法衝突を回避）。
- **同梱範囲の明示**: プロトアプリ実体（React一式・モックフィクスチャ）は本パッケージ非同梱＝別成果物管理であることを§7とここに明記。実装からの収穫は追補として本パッケージへ反映する運用（Gate A-3 v1.1 holoが前例）。

### v3.7.42 深掘り整合監査（列挙・意味論レベルの完全化）

機械照合では検出できない列挙・波及・意味論のズレを全数点検し、14件を修正した。

- **L3ゲート実装台帳の未追随（最重要）**: v3.7.39〜41で新設した3ゲート（coherence_flow / argument_structure / human_voice）と計測3種（inter_unit_redundancy / term_consistency / ai_phrase_density）がAOS-L3-QUALITY-GATE-IMPLに未反映だった。実装行・計測正本・実行位置（Cohesion QA=QA工程内パス、レンズ=gate束展開、Persona Sim=記事QA既定外）を追随。
- **状態機械凍結との整合**: `REQ-AGENT-11`のCohesion QA「必須工程」が13状態（凍結）への状態追加と誤読可能だったため、「既存QA工程の内部パスであり状態を追加しない」と明記。
- **キャッシュ層との矛盾修正**: `REQ-PACK-19`注入位置の「system promptへ」が、記事ごとに変わる技法選択をLayer A/B安定prefixへ置く読みになりキャッシュ経済（`REQ-AGENT-03`）と矛盾していた。Layer C領域（Outline Contract同梱・B境界より後）配置へ修正し、human_voice対比素材のキャッシュ位置（グローバル例示=A/B安定側、style_color=Layer B）も明記。
- **列挙の追随**: `REQ-PACK-04`のcatalog namespace列挙・`REQ-PACK-08`バインディング表（4ステージ行にwriting_method / review_lens / style_colorの流れを反映）・ADM-S8画面のCatalog列挙・DDL（pack_catalog_definitions / few_shot_entries / ai_phrase_dictionary）へ新設3カタログを反映。
- **接続の閉じ込み**: `REQ-PACK-17`にvariantの`cta_density_hint`受け口を明記、Persona Simulationの実行経路をQA Executor（専用Executor新設禁止＝`REQ-AGENT-05`原則）に固定。
- **表記の完全化**: BC文書のイベント種数「約60種」（実89種）のハードコードを除去しGate A-1正本参照へ、Config namespace統一（sim.*→pack.sim.*）、READMEのL3準備リストへ決定テーブル掲載、検証ログ→決定テーブルの集約ポインタ、v3.7.36以降に変更した全文書のfrontmatter updated_atを2026-07-05へ統一。
- ゲート集合の3文書間一致チェックで、修飾ゲート（ymyl_bar / review_depth）がAC-QUALITY-04の列挙に欠けていた初期版からの持ち越しを検出し追補（PACK-09の3分類=hard/advisory/修飾とACの列挙が完全一致に）。
- 拡張機械照合（従来項目＋ゲート集合の3文書間一致・qa metricsの3ファイル同期・Gate A-1不変）ALL PASS。REQ 179件・AC 232件・完全対応維持。

### v3.7.41 例示のゲート化・転生検証・Style Color（Pack拡張第2弾）

- **human_voiceゲート新設（`REQ-PACK-09`拡張）**: 「AIらしさを消す」を検査可能に——①AI頻出定型表現の決定論検出（辞書はADM-S8統制、metrics `ai_phrase_density` をqa.v1へ追補=Gate A-5 v1.2） ②**参照アンカー対比**＝gate_tags付き手書き例示（グローバル基準）とStyle Color（サイト別基準）を物差しとしてQA判定に注入。例示が教材（生成時）と物差し（検査時）の両面になり、few-shot↔ゲート単一ソースが双方向に完成。初期advisory・ゴールデン評価で判別力確認後にhard昇格可。
- **`REQ-PACK-21`新設（Reader Segment＆Persona Simulation）**: セグメントカタログ（リテラシー/心理パターン/シチュエーション/デモグラ。**属性は検証用途限定・差別的出し分け転用禁止**）と転生検証——LLMをセグメント読者に転生させ構造化出力（理解度・違和感箇所・AIらしさ知覚・離脱予測・行動意向）を返す。**合否の正は常にゲート、シミュレーションはadvisory**（LLM主観判定を合否基準にすると再現性が壊れるため線を固定）。実行は例示Validate・ゴールデン評価補助に限定し、記事単体QAは既定off（有効化時はPreflightコスト明示）。few-shotメタデータに `segment_refs[]` 追加（同一purpose_element×別セグメントの例示並存可）。
- **Method Variant（`REQ-PACK-19`拡張）**: 技法の列挙爆発を防ぐ強度軸 `variants[]` を型に追加。sales_writingの初期variant＝`push`（押し）/ `pull`（引き）/ `assist_only`（左手は添えるだけ＝情報充足最優先・CTA最小）。`cta_density_hint` でCTA=QA/Placement（`REQ-PACK-17`）へ接続、hard上限はvariant無関係に不変。Outline Contractへ `primary_variant?` を封入（Gate A-5 v1.2）。
- **Style Color（`REQ-PACK-16`拡張）**: Pack CompilerがContent Regulationにサンプル記事の代表抜粋＋構造化文体特徴を同梱（Layer B・サイト別）。「このサイトの人間の声」の実例アンカーとしてWriting参照とhuman_voice対比の両方に使用。本文非保持との整合を規定（抜粋はユーザー自身のサンプル由来・token上限・同意フロー内・サイト削除で消去。生成記事本文の非保持は不変）。
- 波及: AC 2件追加（AC-PACK-23/24）＋AC-QUALITY-04列挙にhuman_voice、L2（用語6語・BC根拠01〜21）、FEATURE-LIST、Config台帳（style_color予算・ai_phrase_density上限・転生実行上限）、ADM-10管理対象（reader_segment・転生プロンプト・AI定型表現辞書）、D-27（セグメント定義・辞書・セグメント別例示の執筆=帝王様タスク）。REQ 179件・AC 232件で完全対応維持（機械照合）。

### v3.7.40 Pack拡張（執筆技法カタログ・検品レンズ・手書きfew-shot規律）

- **`REQ-PACK-19`新設（Writing Method Catalog）**: 技法6種（technical/logical/content_marketing/sales/seo/storytelling）を3層階層と直交する**横断修飾レイヤ** `catalog.writing_method.*` として定義。Outline凍結時にprimary 1＋modifier≤2で確定しContractへ封入（Layer Cキャッシュ・Gate A-5任意追加=minor）。優先順位を**安全不変条件＞Quality Gate＞Regulation＞User Order＞技法**に固定し、sales_writingはdeceptive_claim/title_honestyがhard上限（技法側が譲る）。構成フレームワーク（PREP/SDS/PAS/BAB/AIDA/QUEST等）とSEO頻出構成パターンは新レイヤにせず`heading_flow`の列挙拡張（conclusion_first/listicle/pas_persuasion/story_arc追加）＋ユニット並びテンプレで表現。技法（グローバル）と文体（サイト別Regulation）の分離を明記。
- **手書きfew-shot（神例示）の登録規律**: 既存few-shot機構（`REQ-PACK-12`）へ登録し、(a)例示自身が検品パイプラインでgate_tags主張ゲートに合格しなければ差し戻し (b)human_authored=ネットワーク学習対象外 (c)**教材（few-shot）と試験（ゴールデン評価）の素材重複禁止**（自己汚染防止） (d)経路はADM-S8統制（自己サーブ撤回`REQ-PRODUCT-12`は維持）。
- **`REQ-PACK-20`新設（Review Lens Catalog）**: 校正・校閲・推敲・Webライティング原則・SEO・論文記述・マーケティングの7レンズを**既存ゲートの束ね方（view）**として定義（ゲート定義の複製・第二の合否体系を禁止＝単一ソース原則維持）。推敲レンズの実体はv3.7.39のCohesion QA（`REQ-AGENT-11`）、校正は決定論先行。校閲は本文非保持の制約下で「sources_used内の根拠整合＋要人手確認フラグ」と正直に定義（断定的自動修正なし）。不足分として`catalog.quality_gate.argument_structure`（advisory・論文レンズ用）のみ追加。
- 波及: AC 2件追加（AC-PACK-21/22）＋AC-QUALITY-04列挙更新、L2（用語3語・BC根拠01〜20）、FEATURE-LIST 2行、Config台帳、ADM-10管理対象（writing_method/review_lens）、D-26（principles実文・例示本文の執筆=登録作業。プロンプト・例示の実文はL3/ADM-S8タスクであり本書はカタログ構造・検証・優先順位のみ固定）。意味ユニットは追加なし（storytellingは既存39種へマッピング）。REQ 178件・AC 230件で完全対応維持（機械照合）。

### v3.7.39 エージェントシステムの穴埋め（設計でcloseできる穴5件＋経験的リスクの計測要求化）

- **`REQ-AGENT-11`新設（全体整合パス）**: 意味ユニット並列執筆の構造リスク（繋ぎ目で論旨・声・用語が痩せる）へ正面対応——用語ロック（Outline凍結時に`terminology_lock[]`確定・Gate A-5 v1.1のminor追補）、隣接文脈つきSection Brief、組立後のCohesion QA（`catalog.quality_gate.coherence_flow`＝advisory・`REQ-PACK-09`追加）、決定論指標`inter_unit_redundancy`/`term_consistency`（qa.v1 metricsへ追補）。不合格は接続部の限定Repairのみで全文再生成禁止の原則は不変。
- **実行の冪等性（`REQ-AGENT-10`拡張）**: Orchestratorクラッシュ・再実行の安全性を要求化——ticket_id冪等キー・Snapshot取り込みdedupe・記録済みTicketのLLM再呼び出し禁止・reserve/commitのticket_id単位冪等。二重課金なしを障害注入の負のテストで検証（AC-AGENT-18）。
- **権限の強制点の明確化（`REQ-AGENT-06`拡張）**: system promptへの権限注入は表明であり、強制はツール実行層のサーバー側default-deny（RWR-02のTool Server限定を全Workflowへ一般化）。プロンプト頼みの権限管理という古典的な穴を明示的に封鎖。
- **二次注入対策（`REQ-AGENT-07`拡張）**: 外部由来のLLM導出成果（Brief/Outline等）を`content_role=derived`として常にデータ扱いとし、要約経由のロンダリングでも「外部は指示にならない」を維持。契約検証にinstruction-in-data detection追加（`REQ-SEC-13`）。
- **Pack版の段階ロールアウト＋ゴールデン評価（`REQ-ADM-10`拡張）**: Validate段の品質回帰検知（固定タスク群・現行版比較・悪化でPublishブロック）と、master→canary→一般の段階適用・活性化後QA fail率監視・ロールバック提案（Gate A-1 v1.4に`config.pack_regression_detected`をminor追加）。
- **経験的リスクの計測要求化（`REQ-DUR-02` DU-10）**: 設計の3つの経験的仮説（キャッシュヒット率×原価前提／Repair収束率／組立記事コヒーレンス＋人手評価）の計測をDU-10の完了条件に格上げ。「計測できない実装は完了と認めない」（AC-DEV-05）。
- 小追記: `REQ-BILL-11`にバッチ項目間キャッシュヒット非保証（miss上限予約の前提維持）。
- 波及: AC 4件追加（AC-AGENT-17/18/19・AC-ADM-11・AC-DEV-05で計5件）＋AC-QUALITY-04列挙更新、L2（用語2語・BC表）、FEATURE-LIST、Config台帳、DDL（冪等制約・golden_eval）、ADM-S8画面、D-25、Gate A-1 v1.4 / A-5 v1.1。REQ 176件・AC 228件で完全対応維持（機械照合）。

### v3.7.38 L3未決事項の追補（エージェント実行ランタイム）

- L3未決事項テーブルへD-22〜D-24を追加: **エージェント実行ランタイム方式**（自作Process Manager on PGキュー=既定候補／Temporal系／LangGraph系。GateB・DU-07着手前に確定）、**LLM観測・トレーシング**（本文非保持`REQ-SEC-11`を採用条件とする。プロンプト全文を既定永続化するツールはそのままでは不採用）、**Mock Executor実装形**（PT-X fixtureとの共用）。LLM呼び出し層は選定対象外＝プロバイダSDK直＋自前Adapter（`REQ-BILL-09`）で確定済みであり、フレームワーク側プロバイダ抽象との二重化を禁止と明記。
- D-22に要求由来の採用判定テスト6項目（prefix完全制御・checkpoint再開・本文非永続・Adapter背後配置・Batchレーン・default-deny権限）を付し、汎用エージェントフレームワークがPrompt Cache経済（`REQ-AGENT-03`/`REQ-PACK-15`のバイト安定prefix）を壊す典型リスクを判定基準として構造化した。

### v3.7.37 外部クロスレビュー（GPT-5.5 Pro）の精査・反映

第二レビューを一次情報・実ファイルで検証し、妥当分のみ反映した（v3.7.36で解消済みの指摘は再掲しない）。

- **Gate A-1 v1.3（表記正規化・型不変）**: 「1 event_type = 1行」へカタログを正規化（88行・全行が `^[a-z]+\.[a-z_]+$` に適合することを機械照合で確認）。旧複合行の消費印・根拠は各行へ正確に分配。指摘は正当（機械契約として複合行はregex不適合）。
- **GSC Bulk Export匿名化の表記強化**: 指摘のP0判定は過大——検証ログは当初から正確（匿名化クエリは`is_anonymized_query=true`の**メトリクス行として含まれ**、クエリ文字列がnull/空になる。2026-07-04にGoogle公式table referenceで再検証済み）。ただし`REQ-KGA-11`の短縮表記「匿名化クエリ含む」は単独で誤読余地があったため意味論を明記し、検証ログへ「概要ページの『除く』表現＝クエリ文字列の話・テーブル仕様が正」の表現差注記を追加。
- **Gate A-3 v1.2**: `screen_refs`のワークベンチ許容範囲 w1〜w9 → w1〜w10（W10はグローバル要素起動が正・部屋割当は任意）。v3.7.36の伝播修正で唯一残っていた箇所で、指摘は正当。
- **Prompt Cache前提の追記**: 1時間TTL書き込み=2×の代表値を検証ログへ、`REQ-AGENT-03`へ「明示ブレイクポイント4点を正とし、自動プレフィックス照合はbest-effortの補助（設計前提にしない）」の条件を追記。
- **L3未決事項テーブル新設（AOS-L3-DECISION-TABLE）**: provider / MQ / mail / container / vector index / 日本語可読性 / DataForSEOプラン / News・YouTube上限 / 保持TTL / 原価単位 / 法務コピー等21件を、owner（役割）・確定期限（フェーズ）付きの単一台帳へ集約。handoff-gate・manifest・PLAN-L3-01へ登録。
- **プロトfixture必須セット（PT-X）**: GSC匿名化/欠損・境界違反fail-close・クレジット不足・hard gate保留・scheduled鮮度警告・full_auto確認・同意未済の7系を契約準拠fixtureとして必須化。
- **不採用・既対応の判定記録**: ①サブID（REQ-PACK-11.x）→v3.7.36でトレース§0に監査対象化注記済み（正式ID改番は参照破壊リスクが便益を上回るため見送り）②ADM-S12/W10の台帳・README・遷移図統一→v3.7.36で対応済み③Generative AIレポート→availability付き補助指標の現行方針を維持（レビューも同意）。

### v3.7.36 整合監査の修正（外部フルレビュー指摘の反映）

- **W10/ADM-S12の伝播漏れを解消**: v3.7.33新設のサポート画面が旧参照に未反映だった箇所を修正——`REQ-NAV-02`「ADM-S1〜S11」→S12、ユーザー行動要件の画面ID範囲（W1〜W10 / ADM-S1〜S12）、管理画面台帳§0。**画面遷移図（AOS-L3-SCREEN-FLOW）にW10（グローバル要素・UJ-07サポート経路・通知起点）とADM-S12（サポートデスク・FAQ還流起票・なりすまし導線）を追加**し、相互検証規約（遷移図にない遷移をジャーニーが要求しない）の違反状態を解消。REQ-UJ/AC-UJの範囲表記を01〜09へ統一（PT-S含む）。
- **L2のL1追随**: v3.7.26〜35で新設した要求をBC表へ反映（RWR-01〜09 / WPA-01〜13 / AGENT-01〜10 / SRC-01〜10 / BILL-11 / KGA-18〜21 / SEC-15〜16 / PRODUCT-14〜23 / ADM-11。Support / Platform Operations のGeneric BCを追加）。用語一覧へ欠落20語を追補（Site Topology / Derived Facts / 施策台帳 / Watchlist / Volatility Guard / Flash Rewrite / Partial Patch / CV Point Ledger / Quiet Window / Change Budget / Master Tenant / Showcase Consent / Support Ticket / Deflection 等）。イベント節にGate A-1正本の注記を追加。
- **意味ユニット数を再同期**: v3.7.19の`video_reference`追加で39種になっていたため、用語一覧・FEATURE-LISTの「38種」を39種へ更新。
- **AC-UJ-09の配置修正**: 受入トレースの「Daily SEO Operations」節から「User Journeys」節へ移動し、UJ§10の「AC-UJ-01〜08」を01〜09へ。
- **Role権限マトリクス追補（`REQ-PRODUCT-08`）**: 月次目標・配分計画の設定（PRODUCT-17）、ウォッチリストのピン留め（KGA-20）、事例掲載許諾の付与・撤回（PRODUCT-23。Owner/Admin限定を本文にも明記、SEC-16のstep-up対象へ追加）。
- **運営お知らせのイベント整合（`REQ-PRODUCT-16`）**: 「イベント由来でなく管理者作成」がPRODUCT-11の不変条件（通知専用体系を作らない）と緊張していたため、`platform.announcement_published` を Gate A-1 v1.2（minor追加）に登録し、お知らせも同一エンベロープで投入する方式へ統一。
- **文言・構造の修正**: `REQ-AGENT-09`の「custom_recipeのユーザー定義」をv3.7.5の撤回（コンサル→ADM-10登録経路）と整合する表現へ。同要求にSandbox Fixの順序注記を追加（サンドボックスはジョブ作成時に確立、状態2は検証・封印。Intakeプレチェックは確立済みスコープ内）。画面台帳の二重「§0」を統合し、表示状態の4状態/5類型の矛盾を5類型へ一本化（AC-PERF-03検証を移設）。トレース§0にドット付きサブID（REQ-PACK-11.1〜11.7）の監査対象化注記。README読み順・PLAN-L1-01へuser-journey文書を登録。誤字修正（「およびに」、および検証ログの簡体字混入＝正しくは「変更実績」）。UJのfrontmatter（kind/related_plan）を他文書と統一。REQ↔AC完全対応175件・AC定義223件は不変（機械照合で再確認）。
- **保留（要判断・未反映）**: L0事業側の補強（ターゲット顧客像・事業KPI・価格帯仮説）、GSC日次正本の自前保持期間を16か月から分離する件（取得遡及の制約と保持上限の分離）、法務・コンプライアンス要求（APPI/特商法/景表法）の独立セクション化。

### 変更伝播チェックリスト（要求追加・改訂時の規約）

新REQ追加/改訂時は以下を同一コミットで更新し、差分ゼロを機械照合する:
1. L2用語一覧・BC表（責務/集約/根拠REQ） 2. 受入トレース（AC追加・節配置・範囲表記） 3. FEATURE-LIST（完全ID表記） 4. 画面台帳（S/W/ADM）とタブ台帳・**画面遷移図** 5. Role権限マトリクス（新操作の行） 6. 通知カタログ⇄Gate A-1イベント 7. Config台帳・DDLスケルトン 8. README読み順・PLAN generates・manifest 9. 各所の件数・範囲表記（○種/○〜○）

### v3.7.1 レビュー修正（整合・不備の解消）

- データ保持の矛盾を解消（`REQ-KGA-08`）: 「日次データ1週間保持」が、GSC Data Martの日次蓄積（`REQ-PRODUCT-05`/`REQ-KGA-11`）・28日比較（`REQ-SEC-11`）・3か月リライト判定と両立しなかったため、GSC/CVの日次実績は判定正本として保持（初期16か月・要調整）、1週間保持は日次より細かいリアルタイム系に限定、と明確化した。
- 工程数の表記を統一（`REQ-AGENT-09`）: 状態機械は全13状態＝実務工程9＋強制ゲート4（Intake/Quality Gate/Preview承認/Cleanup）と明記し、Design.md・用語一覧・機能一覧の「9工程」表記を「13状態（9工程＋4ゲート）」へ揃えた。
- Pack命名の二重体系を接続: `REQ-WPA-10`の旧称Pack名に`REQ-PACK-04`正式キーの対応を付記し、`REQ-SRC-09`の参照切れ（keyword_synonym_related_pack）を`source.keyword.synonym_related.v1`として`REQ-PACK-07`カタログへ正式追加した（intent_clusterも追補）。
- Agent Office整合（`REQ-AOUI-03/04`）: 部屋カードにtechnical_seo（07室）を追加し、ペルソナを基本12＋拡張1（technical_seo）へ更新、technical_seoの内部工程マッピングを追加した。第一階層ラベルは`REQ-NAV-01`を正本に統一。
- 意味ユニット数を実列挙に一致（38種）、セクション番号欠落（REQ-SEC-11〜13 / REQ-BILL-07〜10）を補完、manifestのscopeにL2を反映、README読み順に新規3ドキュメント・L2を追加、PLAN-L2-01のgeneratesをfrontmatter内へ移動、PLAN-L1-01のartifact_type欠落を補完した。

- 各要求docのセクションに安定な要求ID `REQ-{ドメイン}-{番号}` を付与し、受入条件に `AC-{領域}-{番号}` と検証対象REQ-IDを付けて双方向トレースを可能にした。
- 実装順序を精査し、本質（エージェントの仕組み＋データ整備）を先行スパインとするフェーズ順序へ再構成した。MVPリリース境界はプロトタイプ存在を理由に廃止し、段階性は依存順と Feature Flag / Kill Switch で担保する。
- 提供方針を定義した。オンボーディングはコンサルティングとして提供し課金する（自己完結型オンボーディングUXは製品スコープ外）。アプリ内ヘルプ・FAQは専用サイトで対応し製品スコープ外とする。記事内のFAQ生成機能は本質側の生成機能として維持する。
- 請求・クレジットに Prompt Cache 原価前提と、ヒット率低下時の下限保護を追加した。
- プロダクト要求に Role権限マトリクスを追加した。
- WordPress・オートメーションに、CVを相関ベースの補助指標とする位置づけと、代表記事10本未満サイトの暫定プロファイル扱いを追加した。
- セキュリティ・観測に、事前計算配信を前提とする性能要求と初期レイテンシ目標（要調整）を追加した。
- 外部情報源（SERP / DataForSEO / AIO観測）はプロトタイプでのPoC完了を前提とし、取得可否の懸念は本改訂の対象外とした。
- セキュリティとマルチテナント／マルチアカウントを強化した。テナント分離は物理分離ではなく共有DB上の`tenant_id`/`site_id`によるID型論理分離を前提とし、単一強制ポイント・default-deny・キャッシュキーのテナント包含・越境JOIN禁止・多層防御（RLS等）・認証認可のサーバー側強制・シークレット/OAuthトークンのテナント別スコープ・append-only監査・テナントオフボーディングを要求に追加した。
- エージェントのデータ取得を、直テーブルアクセスではなく Source Pack 経由に統一した。Executorは site_id スコープで解決される Source Extract を JSON で受け取り、成果は Snapshot として返す。Pack が site_id 分離と JSON 入出力を同時に担保するデータ境界となり、単一強制ポイント（`REQ-SEC-07`）と一致する。
- Ticket契約の語彙を対称に定義した。`REQ-PACK-01`にWorkflow / Schema / Catalog(Registry) / Routerを追加し、`REQ-PACK-02`の各Packに種別タグと「取得→注入」2段、`REQ-PACK-04`にキー名前空間（`workflow. / prompt. / catalog. / source. / schema.`）を整備。`REQ-PACK-07`にSource Packカタログ、`REQ-PACK-08`にWorkflow×Packステージ別バインディングを追加。`REQ-AGENT-06`にWorkflow定義（列挙・ステージ・ループ構文・収束/停止ガード）、`REQ-AGENT-07`にSystem Prompt Router（選択キーを解決しsystem promptへ注入）を追加した。
- 注入機構を、中央Routerからサブエージェント側の Packキーインジェクター に置き換えた。Orchestratorが見るのはCatalogと対応キーのみで、選択キー（Pack/Workflow/Catalog）はサブエージェントのsystem promptとして強制注入され、上書き不可。Ticketがキーを書くことで、system prompt（固定制約）とuser prompt（自由入力）を構造的に分離し、固定＋自由を同居させる。Packをuser promptに差し込む方式は否定。
- エージェント原則を3点補強した。(1) 外部・取得コンテンツは指示ではなくデータとし、`content_role`（要件/参考）へ論理分離して固定制約を外部から作らない（動的検知に依存しない）。(2) 許可ツール・アクション権限をWorkflowに定義し配下Ticketへ最小権限で適用、タスク指示はuserPrompt。(3) TicketがSnapshotの`returnTo`を指定し、SnapshotはOrchestratorが受けて次工程・失敗遷移（既定は保留）を決める。
- 運用ポリシーを確定した。(A) 登録時同意書でコンテンツ最終責任をユーザー帰属とする（YMYL含む公開可否はユーザー判断）。(B) カニバリを「被覆率重複>50%かつ流入分散30%以上」で機械判定し生成/リライトの制約に。(C) 照会=URL・管理=ID・重複はアラート。(D) WPプラグインは取得/公開/トラッキングのデータ交換ソケットで導入即連携・Tenant/Siteスコープ・最小権限。(E) リアルタイムは1週間・月/年集約ベース、リライト判定は3か月（微妙時6か月）。LLM判定はエージェント内のみ、一般システムは機械判定。
- 品質評価基準をGoogle公式2文書（検索ランキングシステム/ベストプラクティス、検索品質評価ガイドライン）ベースで組み立てた（`REQ-AGENT-08`）。E-E-A-T（Trust中心）・有益な目的/MC品質・Needs Met・YMYL・Lowest回避（scaled content abuse／偽著者・偽経歴／無付加価値コピー／キーワード詰め込みの禁止）を、機械判定可能な代理指標としてQuality Gateにマップ。Lowest該当とYMYL重大不合格はhard gateで自動公開を止め保留・人手判断へ（最終公開判断はユーザー）。
- 品質評価を機械判定可能なQuality Gateカタログへ具体化した（`REQ-PACK-09`）。Google検索セントラルの「Creating helpful content」自己評価質問とスパムポリシー（scaled content abuse／scraping・thin／keyword stuffing／deceptive／authorship／hidden・link spam／site reputation abuse 等）を、`catalog.quality_gate.*`のhard/advisoryゲートと代理シグナルに落とし込み、YMYL修飾・レビュー深度・E-E-A-T・Needs Met・独自性/網羅性を含めた。
- Quality Gateを計測指標＋初期しきい値へさらに具体化した（`REQ-PACK-10`）。Google公式が数値を出さない領域を第三者SEOヒューリスティック（Yoast/Ahrefs/Clearscope/Surfer等）で代理指標化：keyword密度0.5〜3%、Flesch 60〜70・受動態≤10%、上位競合の推奨語カバー率≥80%、独自要素数、近似度、出典付与率。公式ではなく経験則・要調整で、コンテンツスコアの順位相関は約0.17〜0.28（網羅の検証であって順位予測ではない）と明示し、確定・較正はL3。
- 内部リンクとトピック網羅のロジックを追加した。内部リンク（`REQ-KGA-09`）はGoogle公式（links-crawlable / link architecture）に沿ってオーファン禁止・記述的アンカー・クロール可能・文脈内関連先とし、Keyword/Article Map・GSCで機械的に候補選定、過剰最適化抑制・主アンカーテーマ固定でカニバリ抑制。トピック網羅（`REQ-KGA-10`）は「トピッククラスター/ピラー/オーソリティ」がSEO業界の枠組みでGoogle公式機構ではない点を明示し、網羅・キーワード配分・内部リンク候補の内部管理データとして扱う（Googleは人為的サイロ化に利点を見出していない）。
- GSCデータ取り込みのフィルター設計を追加した（`REQ-KGA-11`）。GSC固有の制約（API上限=1日・1プロパティ・1検索タイプで最大5万行/クリック上位、匿名化クエリでクエリ行合計≠総合計、page×query高コスト、16か月保持、2〜3日遅延、クォータ）を前提に、増分日次取得・用途別の次元スコープ・バッチ優先度（P0〜P5）・負荷/クォータ管理・BigQuery Bulk Exportやサブプロパティ分割のスケール手段を要求化。カバー率/カニバリ/Query Driftは匿名化・切り捨ての欠損を織り込み、欠損を流入ゼロと誤判定しない。
- 取得のグローバル分散を追加した（`REQ-SRC-07`）。テナント/サイト分割・ドメイン別レート制限・夜間・個別予算に加え、テナント横断で共有される外部上限（GSCのプロジェクト単位クォータ、プロバイダのアカウント単位レート/コスト）に対するグローバル予算配分・時間的スタッガリング（ジッタ）・同時実行上限/レート整形・テナント間フェアシェア・超過時のバックオフと次窓繰り延べを要求化。GSC取得（`REQ-KGA-11`）もこのグローバル配分に従い、個別テナントが上限内でも合算で共有クォータを超えないようにする。
- Packを「タイプ」まで落とした（`REQ-PACK-11`）。名前空間ごとに具体タイプを列挙（article_type: transfer_guide/comparison/ranking/faq_hub/knowledge/news_column、heading_flow、purpose_element=意味ユニット、quality_gate、prompt、workflow）し、各タイプの型（フィールド）を定義。保留していた schema.ticket.<stage>.v1 と schema.snapshot.qa.v1（gates・metrics・ymyl・hard_gate_block・匿名化/切り捨て注記）もここで確定し、`REQ-PACK-09`のゲートと`REQ-PACK-10`の計測指標に対応づけた。
- few-shotの作り込みを品質チェックと一体で定義した（`REQ-PACK-12`）。few-shotはPrompt Packの一部（構造+few-shot+制約）として、記述タイプ（意味ユニット）・記事タイプ・見出しフローごとに正例（必須ユニットに最低1つ）＋任意の反例（keyword stuffing等のLowest級の回避教示）で構築し、各エントリを実証するQuality Gate（gate_key）でタグ付け。few-shotの選定基準とQA合否基準を同一のgate定義（`REQ-PACK-09`）・計測指標（`REQ-PACK-10`）で単一ソース化し、教える基準と検査する基準のドリフトを防ぐ。version固定・強制注入・圧縮も規定。
- 意味ユニット（記述タイプ）のバリエーションを機能別に整理・拡張した（`REQ-PACK-11.3`を正本化）。導入・骨格／主張・論証／具体・一次情報／比較・評価／手順・実務／情報整理・データの6群に約37種を列挙し、各ユニットを主なQuality Gate（`REQ-PACK-09`）とfew-shot（`REQ-PACK-12`）に紐づけ。`REQ-AGENT-02`は代表例として本カタログを参照し、命名衝突（experience_translation→first_hand_experience）を解消。
- Packのステージ階層を明示した（`REQ-PACK-13`）。記事方針を決めるのはアウトライン層のarticle_type（マクロ）×heading_flow（メソ）で、Outline Contractに凍結する。purpose_element（ミクロ）は執筆層でそれを実装する下位レイヤであり同列に置かない。Domain Positioning/Content Regulation/User Order/Source/Quality Gate/few-shotは方針を成立させる組み合わせ要件（入力・品質制約）として位置づけ、記事バリエーションを3層×ステージの階層合成で表現する。
- Pack/Catalogのスコープ階層を追加した（`REQ-PACK-14`）。引き当てをフロー・スコープ（`flow_pack_keys`＝フロー単位のパック、全フェーズに常時適用）／フェーズ・スコープ（`REQ-PACK-08`のステージ別）／遷移スコープ（遷移駆動＝同じフェーズでも到達遷移でCatalogが変わる）の3層に分離。injector（`REQ-AGENT-07`）は現在のフロー状態（flow/phase/last_transition）から3スコープの和集合を解決し、狭いスコープが上位の既定を差し替え・追加する。workflow型（`REQ-PACK-11.6`）に`flow_pack_keys`とphase/transitionバインディングを追加。
- 工程別の注入を、元設計のPrompt Cache Layer A/B/C/Dに接続し直した（`REQ-AGENT-03`）。Layer A=グローバル/フロー（Workflowの状態機械＝遷移図を含む・最長TTL）、B=サイト方針（Domain Positioning/Content Regulation/Quality Gate site構成）、C=工程（Research/Outline freezeをWriting/QA/Repairで再利用）、D=遷移・タスク動的（section/patch/QA issue/GSC差分/userPrompt・非キャッシュ）。`REQ-PACK-14`のフロー/フェーズ/遷移スコープをこのA/B/C/Dに対応づけ、工程順序と遷移はLayer Aの状態機械が正本でゲート（Intake/Quality Gate/Preview/Cleanup）を強制する、と明記。
- v3.6本体（AI_Office_de_SEO.zip・約740K字）と現行v3.7の差分を棚卸しし、ギャップ表（GAP-MAP-v36-to-v37.md）を作成。v3.7 cleanは本体の約4%まで薄められていたため、本体を正本として中核から移植を開始。第1弾として状態機械（遷移図）＋9工程（Intake→…→Cleanup）＋強制ゲートを`REQ-AGENT-09`として移植した。
- 【まとめ移植】v3.6本体を正本に全ドメインを一括統合。新規3ドキュメント（rewrite-runtime=Article-as-Code/patch/差分/fail-close、agent-office-ui=2モード・7画面・12ペルソナ⇄工程マッピング・2軸、admin-console=課金原価/LLMプロバイダ/コスト観測/監査）を追加。既存を強化: pack-ticket-schema（Pack Resolver/Dispatch・Pack Compiler/User Knowledge・CTA=QA/Placement・Meaning Unit Registry/Outline Contract）、billing-credit-provider（Stripe責務・append-only credit台帳・サブスク制御・Provider Registry/Adapter/Routing Claude優先/Canary）、security-observability（データ境界テーブル・保存禁止・決定論的Preflight・Observability契約検証）、wp-automation（WP Capability Snapshot・Dynamic Post Schema封入・Keyword Map Pack）、keyword-gsc（Keyword Map Graph・契約強化）、dataforseo（分散実行単位・Batch Priority・DataForSEO Cache）。manifest/PLAN/受入トレースを更新（canonical 15ドキュメント）。
- クエリファンアウトの公開ロジックをGoogle公式（AI Features）＋公開情報で調査し、参照ノート（docs/reference/）に整理してREQ-SRC-09で具体化（facet分解→Source Pack取得→網羅接続、第三者の型/本数は非公式と明示）。Agent Office画面のモック（v2.1）を参照imageとして参照ノートに取り込み、REQ-AOUIに対応づけ。開発者管理画面を一般SaaS標準のweb調査に基づき追加（REQ-ADM-06 認可/監査/なりすまし、REQ-ADM-07 可観測性/SLO/インシデント、REQ-ADM-08 データ保護/保持/DR）。
- UIアセット群（背景・HUDフレーム・キャラ状態スプライト＝待機/作業/完了/エラー・画面モック＝オフィス俯瞰/詳細ワークベンチ）を docs/reference/assets/ に格納し、以前フラグしたasset側不足を充足。ギャップ吸収状況を最終版としてGAP-MAPに明記（CORE/Important要求は吸収済み、残は実単価/市場参考データ/画面単位UI細部/本番アセット制作でL1外）。
- 価格・原価・クレジット単価・品質グレード係数と、調整可能な運用パラメータ（しきい値・クォータ・TTL・優先度・facet重み等）を、要求書にハードコードせず「管理画面から設定するデータ」として正式化（`REQ-BILL-10` / `REQ-ADM-09`）。設定はversion/effective/status・ジョブ開始時freeze・監査・影響プレビューを持ち、グローバル→プラン→テナント/サイトで上書き。ただしサンドボックス・本文非保持・境界・監査・承認制御・APIキー非表示の安全不変条件は設定対象外。要求書の数値はすべて既定値/初期値でレジストリ優先。
- Agent Officeの部門・フロア・ペルソナの拡張性を要求化した（`REQ-AOUI-07`）。部屋はサイドメニュー7画面と1:1固定せずconfig駆動で追加・改名・並び替え可（SECTION番号連番拡張、7画面外の専門部屋も追加可）、フロア数・フロア割り当て・ペルソナ割り当てもconfig駆動。サイドメニュー第一階層7項目と安全不変条件（`REQ-ADM-09`）は不変。初期構成を確定（部屋7＝01〜06＋07テクニカルSEO、2フロア、サイドメニュー7項目）。
- L2ドメイン設計（DDD）を着手した。用語一覧（ユビキタス言語、AOS-L2-GLOSSARY）と、ドメインモデル（AOS-L2-DOMAIN-MODEL：サブドメイン分類=Core/Supporting/Generic、13の境界づけられたコンテキスト、コンテキストマップ〔Pack=ACL・状態機械=Process Manager等のDDDパターン〕、中核7集約の不変条件、主要ドメインイベント、ドメインサービス/ポリシー）をL1要求に根拠づけて作成。PLAN-L2-01とmanifestに登録。
- デザイン思想ドキュメント Design.md をルートに作成（コンセプト『SEO業務をもっとたのしく、プロフェッショナルが簡単に』）。7つのデザイン原則（面倒はエージェント/品質は標準装備/同じ中身を二つの入り口/探索・おすすめ2軸/ガードレール/正直さ/config拡張）、2モードのデザイン、体験の流れ、ビジュアル言語、判断根拠、アンチパターンをL1要求・アセットに根拠づけて記述。
- WordPressプラグインをZIP配布とし、更新の有無をWP管理画面とシステム側コンソールの双方へ通知、更新は署名付き・Tenant/Siteスコープで適用する（`REQ-WPA-07`）。

## 正式名称

- サービス名: **AI Office de SEO**
- 説明名: AIエージェントと進める、SEOコンテンツ運用オフィス
- UIモード: 通常ビュー / Agent Officeビュー

## 読み順

1. `docs/design/ai-office-de-seo/L0-charter/ai-office-de-seo-charter_v3.7.md`
2. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-requirements_v3.7.md`
3. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-navigation-ui-requirements_v3.7.md`
4. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md`
5. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-pack-ticket-schema-requirements_v3.7.md`
6. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-keyword-gsc-article-map-requirements_v3.7.md`
7. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-dataforseo-competitor-batch-requirements_v3.7.md`
8. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`
9. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-billing-credit-provider-requirements_v3.7.md`
10. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-security-observability-requirements_v3.7.md`
11. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-development-unit-roadmap_v3.7.md`
12. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-rewrite-runtime-requirements_v3.7.md`
13. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-office-ui-requirements_v3.7.md`
14. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-admin-console-requirements_v3.7.md`
15. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-user-journey-requirements_v3.7.md`
16. `docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-acceptance-trace_v3.7.md`
17. `docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md`
18. `docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-model_v3.7.md`

補: プロダクト全体のデザイン思想はルートの `Design.md`、機能一覧・アセット対応は `docs/reference/` を参照。

## L3準備（実装設計＋画面プロトタイプ）

- `docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md`（未決事項の単一台帳・owner付き）

L2 §7「L3への引き渡し」を受け、L3を2トラックで開始できる状態にした。

- 実装設計トラック（PLAN-L3-01）: `docs/design/ai-office-de-seo/L3-implementation/` に4スケルトン（データDDL / 契約スキーマ / Quality Gate実装・較正 / Config Registry初期値台帳）。各セクションに根拠REQ・対応ACを付し、確定作業は `TODO(L3)` として明示。安全不変条件・保存禁止・境界キーは先に固定済み（変更不可）。
- 画面プロトタイプトラック（PLAN-L3-02）: `docs/design/ai-office-de-seo/L3-ui-prototype/` に画面一覧（全画面の責務・モックデータ契約・4状態・アセット対応）と構築計画（PT-0〜PT-5のビルド順序・受入チェックリストPT-A〜PT-H）。モックはSource Pack / Snapshotの契約に準拠し、プロト独自のデータ形を作らない。Agent Office演出のモックイベントは本番イベントスキーマと同形とし、実接続で差し替え可能にする。

次アクション: PT-0（デザイントークン・office_layout.json・モックAPIクライアント）から画面プロトの作り込みを開始する。

### v3.7.2 画面網羅の補完（管理面・ユーザー面の出し切り）

- 要求の新設（`REQ-ADM-10`）: Prompt Pack / Catalog / few-shot / Workflow / Quality Gate定義を、コード変更なしで管理画面から編集する要求が未定義だったため新設した（draft→Preview→Validate→Approve→Publishの版統制、影響プレビュー、few-shot↔gate単一ソース整合検証、公開version不変）。`AC-ADM-09`を追加しREQ↔AC完全対応（125件）を維持。
- 管理コンソール画面台帳を新設（AOS-L3-ADMIN-SCREEN-INVENTORY）: ADM-S1〜S11。ログ閲覧（監査ログビューア＋ジョブ・トレースビューア。本文/プロンプト全文は保存禁止のためhash・メタで追跡）、モデル調整（ADM-S3）、プロンプト調整（ADM-S8＝REQ-ADM-10）、数値しきい値（ADM-S7）、入金（Webhook受信・reconciliation・手動クレジット、ADM-S2）、コスト（原価実測・乖離、ADM-S4）をすべて画面から完結させる。
- ユーザー側画面の漏れを補完: ジョブ履歴（W6）、アラートセンター（カニバリ・重複ジョブ、W7）、緊急停止・full_auto制御（W8）、登録時同意書・テナント切替（W9）。
- プロト計画にPT-6（管理面トラック: ADM-S8→S4→S2）と受入観点PT-I〜PT-Kを追加。

### v3.7.3 通知・アラート設計の統合

- 要求の新設（`REQ-PRODUCT-11`）: 通知は散在言及のみ（設定画面の項目名・WPプラグイン更新・カニバリ/重複アラート・admin SLOアラート）で統合設計が欠けていたため統合定義した。既存要求由来のイベントカタログ（承認・hard gate保留・ジョブ失敗/保留・カニバリ・重複・残高低下・支払い失敗・再認可要求・Kill Switch・プラグイン更新・繰り延べ／admin側: Webhook失敗・Health/Canary・原価乖離・境界違反・プラグインversion集約）、in-app通知センター正本＋メール補助、Role/Membershipによるサーバー側受信者解決、tenant/site境界、本文全文・シークレット非搭載、ダイジェスト/スロットリング、ユーザー単位＋テナント既定の通知設定、既読・保持を定義。通知はREQ-SEC-13のイベントエンベロープから導出し独自イベント体系を作らない。`AC-NOTIF-01〜03`を追加しREQ↔AC完全対応（126件）を維持。
- 画面反映: W7を通知・アラートセンター（in-app正本）へ拡張、S7設定の「通知」の中身を具体化、ADM-S1に管理者向け通知集約（プラグインversion含む）を追記。L2にNotification BC（Generic）と用語・イベントを追加。DDLスケルトンにnotifications / notification_settings / delivery_attemptsを追記。

### v3.7.4 ユーザーカスタマイズ階梯

- 要求の新設（`REQ-PRODUCT-12`）: ユーザーカスタムプロンプトを「生プロンプト開放」ではなく構造化階梯として定義。Tier 1 レギュレーション調整（既存）/ Tier 2 User Order（既存）/ Tier 3 上級構造化（カスタム見本=few-shot登録、カスタムレシピ=`REQ-AGENT-09`で宙吊りだった`custom_recipe`の定義、セクション単位要望）。生system prompt編集・Pack本文直接編集・ゲート無効化は提供しない。品質保護は注意書きでなく3点セット（登録時Validate差し戻し／実行時Quality Gateバックストップ＝hard緩和不可／観測ログ`prompt_pack_keys`とQA結果への影響帰属表示＋無効化導線）で行い、品質低下の製品への誤帰属（解約要因）を構造的に防ぐ。`AC-CUST-01〜03`を追加しREQ↔AC完全対応（127件）を維持。S6・W3・プロト観点PT-Lへ反映。

### v3.7.5 カスタマイズ階梯の改訂（ターゲット軸・主張軸へ集約）

- `REQ-PRODUCT-12`を「意図はユーザー・技巧は製品」の分担へ改訂。Tier 3自己サーブを戦略入力（ターゲット軸=誰向け・主張軸=押す/避ける主張）に絞り、Domain Positioningの構造化フィールド（`target_axes[]` / `avoided_claims[]` を `REQ-PACK-07`/`REQ-PACK-11.5`へ追補）に写像。
- カスタム見本（few-shot自作）の自己サーブは撤回: 「自分の文体」は既存のサンプル記事10本→Pack Compiler（`REQ-PACK-16`）が担うため冗長。文体変更はサンプル差し替え＋Tier 1で行う。
- カスタムレシピの自己サーブも撤回: `custom_recipe`はコンサルティング（`REQ-PRODUCT-09`）でヒアリングし開発管理者が`REQ-ADM-10`（ADM-S8）から登録する運用経路として定義（提供方針と整合・収益化可能・自己サーブ事故の排除）。
- 品質保護3点セット（登録時Validate／hard緩和不可のゲートバックストップ／影響帰属）は主張軸へ適用を維持。根拠を伴えない主張はclaim_evidence/deceptive_claim/ymyl_barでhard保留。AC-CUST-01〜03を改訂、REQ↔AC完全対応127件を維持。

### v3.7.6 キーワード戦略層（決定論・LLM不使用）

- `REQ-KGA-13`新設: キーワード/クラスタへの決定論的属性付与（intent=Know/Do/Website/Visit＋商用性、ターゲット適合=target_axes照合、業界適合=entity×業界タクソノミ×Domain Positioning、YMYL近接、地域性・鮮度）。材料はmodifier/entity辞書（Catalog版固定・`REQ-ADM-10`編集）・SERP構成（`REQ-SRC-06`キャッシュ再利用）・PAA・GSC共起で、LLM・追加外部取得を使わない（`REQ-KGA-08`整合）。`REQ-NAV-04`に画面責務だけ存在したターゲット/リテラシーフィルターの仕組みをこの要求が定義。ギャップマトリクス（ターゲット軸×intent）を網羅・新規記事候補へ接続。
- `REQ-KGA-14`新設: キーワード⇔記事アサインメント台帳（1グループ=主担当高々1、unassigned/planned/assigned/retired、URL変更追従）。オーファン・二重アサインをアラート検出し、Intake Gate（`REQ-AGENT-09`へ強制ルール追記）の決定論プレチェックでアサイン競合を**LLM実行・クレジット消費前に**警告。カニバリ事後検知（`REQ-KGA-07`）の事前規律化＝採算保護。Query Driftからの昇格・見直し循環も機械判定。
- 波及: `source.keyword.map.v1`へattributes追補・`source.keyword.assignment.v1`追加（`REQ-PACK-07`）、S2画面（属性フィルター・ギャップマトリクス・台帳ビュー）、DDL（keyword_attributes/keyword_assignments）、Config台帳（辞書はCatalog・レジストリは重みのみ）、L2用語・不変条件、AC-KGA-17/18追加でREQ↔AC完全対応129件。

### v3.7.7 GSCクエリ⇔キーワードマップのマッチ率対策

- プロトタイプの既知課題（記事のGSC実クエリと登録キーワードマップのマッチ率が低い）へ正面対応。従来要求は測る仕組み（カバー率・Drift）と欠損前提（匿名化）はあったが、マッチ手順そのものが未定義で、KGA-02の「SERPs集約で最終判定」を全GSCクエリへ適用するのはクォータ・費用的に不可能という経済制約も未解決だった。
- `REQ-KGA-15`新設: 決定論マッチングカスケード＝exact（形態素・助詞・表記ゆれ正規化）→ synonym（辞書展開）→ containment（中核トークン包含＋余剰modifierをKGA-13属性へ）→ **co-landing（GSCのURL×クエリ着地実績を証拠化。自前データ・外部費用ゼロ。安定対はalias層へ還流し辞書が自己改善）** → serp-verified（高クリック未解決のみ・P0機構と予算内）→ unmatched（強制寄せせず明示保持・新規候補へ提示）。LLM不使用（KGA-08整合）。
- 計測の正しい定義: マッチ率KPIはクリック加重（本数加重はロングテールで構造的に低く出る）、分母は可視クエリ、匿名化分は構造的上限として別掲＝100%は原理的に不可能と明示。低信頼マッチのみでリライト・統合の重大判定を確定しない。
- 波及: `source.gsc.query_group.v1`へmatch{method, confidence}追補、S5にマッチ品質ビュー、ADM-S4にマッチ率監視、DDL（gsc_query_matches）、Configしきい値、L2用語、AC-KGA-19追加でREQ↔AC完全対応130件。

### v3.7.8 ロングテール還流とAIO考慮の価値付け

- `REQ-KGA-16`新設（ロングテール集約昇格）: KGA-15の昇格が「高クリック単クエリ」条件で裾が漏れる欠陥を修正。未マッチ＋containment余剰modifierを共有トークン・co-landing先で決定論クラスタリングし、**クラスタ集計値**で昇格判定（急増P0とは別に定常裾の定期評価枠）。親ありは既存記事のセクション/FAQ候補（アサイン台帳経由でリライト入力）、親なしはバックログ→ギャップマトリクス。匿名化未満の不可視裾はPAA/オートコンプリート/Fanoutを代理と明示。昇格は詰め込みの根拠にしない（keyword_stuffingゲート配下）。
- `REQ-KGA-17`新設（キーワード価値スコア）: demand×realizable_ctr×SERP構成×intent/CV近接×適合乗数の決定論スコア。**AIOのCTR影響は固定低下率を仮定せず、自サイトの順位別期待CTR基線に対する実測残差で較正**（AIO観測群に系統的負残差がある場合のみ割引、観測不可はunknownで捏造しない）。ギャップ・新規候補・リライト優先度・昇格判定へ接続。順位保証でない旨明示。
- 波及: attributesへvalue_score/aio_suppressed追補、S2（昇格キュー・価値スコアソート）・S5（AIO影響ビュー）、DDL（longtail_clusters/keyword_value_scores）、Config（固定AIO低下率は設定項目にしない設計）、L2用語、AC-KGA-20/21追加でREQ↔AC完全対応132件。

### v3.7.9 外部事実の検証と反映（検証ログ新設）

- 検証ログ（docs/reference/ai-office-de-seo-verification-log_v3.7.md）を新設し、要求が依拠する外部仕様をWeb一次情報で検証・記録（出典・確認日・設計影響・オープン項目・再検証ルール）。
- GSC API制約（REQ-KGA-11）: 5万行/日・25,000行/リクエスト・匿名化・Bulk Export非遡及/匿名化メトリクス包含を一次情報で確認。記述正確・修正不要。
- GSC×AI計上（REQ-KGA-17へ反映）: AIO/AI Modeはwebへ混合計上で**クエリ分離フィルターなし**（AIO判定フラグはSERP観測由来と明記）、AIO=1ブロック1position・URL重複排除・2025年計上方法変更（基線導出は変更後ウィンドウ）。**2026-06-03登場のGenerative AIレポート（Beta・impressionsのみ）**を`source.gsc.ai_report.v1`として取り込み（availability付き）、被引用観測を公式データで補強。CTR低下研究は幅が大きく固定値不採用の設計を維持。
- Prompt Caching（REQ-AGENT-03/BILL-06へ反映）: 公式docsで最大4ブレイクポイント（Layer A/B/C/Dと1:1対応）・TTL 5分/1時間・読み取り時無償リフレッシュ・1h前方の順序制約・最小約1,024トークン・**書き込みbest-effort（ヒット保証なし）**・書き込み1.25×/読み取り0.10×の価格構造を確認。miss上限予約（BILL-06）の必然性を裏付け、TTL層割当（A/B=1h・C=5m・D=非キャッシュ）を明記。実数はCost Table管理でハードコードなし。
- AC-KGA-21へ交絡前提を追記。オープン項目（日本語可読性指標・AIレポート提供範囲・キャッシュ仕様変動・プロバイダ上限実数）を検証ログで継続管理。

### v3.7.10 ネットワーク学習（利用増→ソース精度向上）

- `REQ-PRODUCT-13`新設: 改善対象を決定論的なソース側に限定し（エージェントのプロンプト・few-shotへの横断学習は明示禁止＝バイアス回避）、4ループを定義——①共有観測キャッシュ（SERP/AIO/PAA。カバレッジ・鮮度が利用量比例で向上）②辞書の集合知（co-landingエイリアス等をk匿名しきい値でグローバル昇格提案）③セグメント別統計prior（期待CTR基線・ゲート分布・しきい値。新規サイトのコールドスタート解消、縮小推定で自サイト実測へ移行）④成果較正。適用は常に提案→承認→版固定Catalog/Config（自動反映なし）。登録同意へデータ利用条項＋テナント単位オプトアウトを追加（REQ-PRODUCT-09拡張・法務レビュー前提）。
- 潜在矛盾2件を解消（REQ-SEC-07キャッシュ分離の2層化）: 「全キャッシュにtenant_id」の一律規則が、(a) DataForSEO共有キャッシュの経済性、(b) Layer Aグローバルプレフィックスのテナント横断キャッシュ共有（原価前提）と矛盾していた。「テナント由来データ→テナントキー必須／テナント非含有の共有物（公共外部観測・Layer A）→契約検証（cache prefix hygiene）を条件に共有可」へ精緻化し、SEC-05受入・AC-TENANT-04も整合。
- 波及: KGA-15（エイリアスのグローバル昇格段）・KGA-17（priorコールドスタート）接続、ADM-S7/S8に承認キュー、DDLにグローバル信号ストア（識別子・生データ列を持たない設計）、Config（k値・標本しきい値）、L2用語・ドメインサービス、AC-NET-01〜03追加＋AC-TENANT-04改訂でREQ↔AC完全対応133件。

### v3.7.11 ネットワーク学習×サンドボックスの整合確定

- 条文矛盾の解消: `REQ-SEC-07`「テナント横断集計は既定禁止」に対し、ネットワーク集約パイプラインを**唯一の明示認可例外**として定義（専用システムロール・Executor/ジョブ/APIから到達不能・出力はk匿名派生物限定・全操作監査。例外経路以外は引き続きfail-close）。AC-TENANT-03も整合。
- 暗黙保証の明文化（`REQ-PACK-06`）: サンドボックス内から参照できるテナント非含有の共有物をホワイトリスト限定（グローバルCatalog・共有観測キャッシュ・prior）、**読み取り専用＋ジョブ開始時version freeze**、ジョブからの共有物書き込み・集約起動は構造的不可（成果は常にSnapshot）、ホワイトリスト外参照は境界検証でfail-close（`REQ-SEC-13`にshared-resource whitelist検証を追加）。外部データPackは認可・予算・ログをサンドボックス内で行い内容は共有キャッシュから解決、と解決位置を明確化。
- コスト計上の確定（`REQ-PRODUCT-13`）: 共有キャッシュの初回fetchはREQ-SRC-07のグローバル/フェアシェア予算、**読み取りは読む側テナントの外部予算を消費しない**、集約バッチはテナント課金外の運用費。AC-NET-04追加でREQ↔AC完全対応133件（AC計は+1）。

### v3.7.12 総合監査と引き渡しゲート

- 全文書横断監査: 不存在REQ/AC参照ゼロを機械照合で確認。個別不備6件を修正——AC-KGA-06をKGA-08改訂（日次正本16か月保持）へ追随（v3.7.1修正のAC未伝播＝矛盾を解消）、「12ペルソナ」残存2箇所を「基本12＋拡張1」へ更新（AC-AOUI-02はREQ-AOUI-07を検証対象に追加）、DDL誤字修正、`schema.snapshot.research_brief/outline_contract.v1`をREQ-PACK-11.7へ列挙（PACK-08参照との整合）、L2 BC表の根拠へKGA-13〜17を反映、REQ-NAV-04へ属性フィルター/ギャップ/台帳/マッチ品質を追記（L1↔L3画面台帳の整合）。
- L3先行確定リスト（AOS-L3-HANDOFF-GATE）を新設: Claude Design/Claude Code引き渡し前のGate A（イベントエンベロープ・境界API・office_layout.json・デザイントークン・契約スキーマ凍結）/ Gate B（config命名規約・状態機械インスタンス・認可API・Source Extract第一陣・形態素選定）/ Gate C（実数類は吸収設計のため先行不要）を手戻り半径基準で定義。

### v3.7.13 中断・再開と実行レーン（Batch活用）

- `REQ-AGENT-10`新設（中断・再開）: 散在していた保留（Kill Switch/予算待ち/hard gate/承認待ち）へユーザー手動停止を加えて状態機械上で統合し、**checkpoint＝ステージ境界・Snapshot粒度で再開**（freeze/Snapshot設計により完了済みステージの再実行・再課金なし）。freeze version・サンドボックス不変で再開、クレジットはcommit/reserve処理を定義、**TTL失効後の再開はキャッシュ再ウォーム費を再Preflightに明示**（検証済みキャッシュ仕様に基づく）、一時本文は保留期限内のTTL延長のみ（本文非保持原則は不変）、保留期限超過は自動キャンセル・通知。
- `REQ-BILL-11`新設（実行レーン）: interactive/scheduledの2レーンを定義し、scheduled（予約・夜間・Autopilot・ロングテール追補）は**Batch×1時間TTLキャッシュ既定**で原価削減（公式仕様: Batch割引とキャッシュ乗数はスタック可＝検証ログ追記）。割引実数はCost Table管理、ユーザー提示は「今すぐ/おまかせ（割安）」、interactive経路にBatch不使用、フォールバック差額は承認/ポリシー制御。
- 波及: W5（停止/再開操作）・S3（レーン選択）、Config（保留TTL・レーン係数）、L2用語、AC-AGENT-16/AC-BILL-11追加でREQ↔AC完全対応135件。

### v3.7.14 Gate A先行確定（Design/Code引き渡し可能状態）

- Gate A全5件をv1凍結し `docs/design/ai-office-de-seo/L3-implementation/gate-a/` に作成。
  - **A-1 イベント共通エンベロープ**: 必須7フィールド＋lane/dedupe_keyのJSON Schemaと、event_typeカタログ約45種（L2ドメインイベント・REQ-AGENT-09/10の工程/中断再開・REQ-PRODUCT-11通知・REQ-BILL-11レーンを網羅。消費者W/N/O/A印つき）。モックは同形で作成。
  - **A-2 Repository層スコープ強制API**: スコープ型（Tenant/Site/JobScope=SiteSandboxContext）でdefault-denyを型表現、db.forTenant/forSiteのみをクエリ入口に、RLS第二防御（FORCE RLS＋SET LOCAL）、集約は専用ロール`aos_aggregator`（別デプロイ・到達不能）、**グローバル信号ストアは同一クラスタ別スキーマ`global_signals`と決定**、負のテスト6件を受入に直結。
  - **A-3 office_layout.json**: スキーマv1凍結＋初期インスタンス（2フロア・ハブ＋7室・ペルソナ13=確定4/暫定9をasset_confidenceで明示、ASSET-MAPPING命名準拠、mapping.stagesはAGENT-09状態ID＝キャラ状態はイベント導出）。
  - **A-4 デザイントークン**: Design.md §6準拠のdesign-tokens.css（light=Standard SaaS/dark=Agent Office、状態5色=キャラ状態と同義、シグネチャ=ステータスリングのネオングロー、Zen Kaku Gothic New/Noto Sans JP/IBM Plex Mono、reduced-motion対応、セマンティック名を凍結）。
  - **A-5 契約凍結**: ticket.base必須7＋ステージ別追加、snapshot共通エンベロープ、outline_contract.v1のJSON Schema、進化規則（任意追加=minor/破壊=.v2）。
- 引き渡し: Claude Code←A-1/A-2/A-5、Claude Design←A-1/A-3/A-4。相互レビュー後にPT-1/DU-02へ（GATE-A-README記載）。Gate Bはジャストインタイム確定。

### v3.7.15 画面要求の同期監査（要求増加後の突合）

- 新設11要求×画面台帳の反映を機械照合し、ズレ4件を修正: ①S7設定へデータ利用オプトアウト（Owner/Admin限定）を追加しREQ-PRODUCT-08マトリクスへ権限行・REQ-PRODUCT-13へ画面位置/Roleを明記（ユーザー側反映ゼロだった唯一の要求を解消）、②W9同意書へ匿名集計データ利用条項を反映（PRODUCT-09改訂の波及漏れ）、③ADM-S4へ実行レーン別コスト・割引効果・バッチ失敗/SLA超過/フォールバック率監視を追加（BILL-11の管理側）、④REQ-NAV-02へグローバルUI要素（通知センター・ジョブインジケータ）の位置づけを定義し、第一階層7項目制限に数えないことを明確化。
- プロト検証観点PT-M（停止→再開の完了分非再実行・再ウォーム費再見積・レーン選択でPreflight額切替）を追加。

### v3.7.35 マスターテナントの配下明確化と「実績→SEO」ループ

- `REQ-PRODUCT-23`拡張: ①**開発者アカウント配下**を明確化（プロビジョニング・区分変更・廃止はADM-S9のみ・セルフサインアップ不可。操作Role分離は維持）。②**販売実績がそのままSEOになる循環**を構造化——素材二層（層A: k匿名ベンチマーク=同意の利用目的へ「公表」を明記・最小標本数しきい値／層B: 個別事例=明示オプトイン許諾・範囲指定・撤回で停止と削除）→showcaseストアへ転用時点スナップショット→`source.showcase.cases.v1`でマスターへ供給→通常ゲートで記事化。
- 整合改訂: `REQ-SEC-07`の横断アクセス明示認可例外を2経路（①k匿名集約 ②同意ベース事例転用）へ正確化、AC-TENANT-03同期。PRODUCT-09同意条項へ公表目的の明記（法務レビュー）と事例掲載の分離を追記。
- 波及: S7事例許諾・ADM-S9許諾台帳/プロビジョニング、Pack契約・DDL（showcase_consents/cases）・Config・Gate A-1イベント（consent granted/revoked=監査写像）、FEATURE-LIST。AC-MASTER-02追加でREQ↔AC完全対応175件（AC定義223件）。

### v3.7.34 マスターテナント（自社SEOによる自己宣伝＝ドッグフーディング）

- `REQ-PRODUCT-23`新設: 運営自身が自社サイトのSEOを本サービスで運用する内部テナント。**大原則=特別扱いは課金のみ**（サンドボックス・ゲート・承認・変更予算・監査は一般と同一経路、バックドア禁止＝恒常的な本番検証の成立条件）。内部課金モードで消費・原価は通常計測＝**1社分の実コストの生きたリファレンス**（ADM-S2で内部区分・粗利から分離）。自己宣伝記事にもdeceptive_claim等を同基準適用（誠実表記維持）。プレミアムの実体=Flagロールアウトのmaster→canary→一般先行。成果のマーケ素材/デモ転用可。**マスター由来のprior算入は既定除外**（自社ドメイン偏りの注入防止、共有観測=公共データは通常どおり）。AC-MASTER-01追加でREQ↔AC完全対応175件。

### v3.7.33 サポート運用（AIファースト・エスカレーション）

- `REQ-PRODUCT-22`新設: in-appサポートパネル（W10・グローバル要素から起動）＋メール窓口のチケット統合。チャット型QAは**ヘルプ根拠つき・問い合わせユーザーのRole/スコープ内参照限定（サポートAIに横断権限を与えない）・低確信は捏造せずエスカレーション提案**・クレジット外の運用原価。自動返信（受付ID・SLA目安・時間外・**インシデント時はステータスページ自動案内**）。エスカレーションはseverity×プランのSLAで人へ（AI要約＋文脈参照つき・本文/プロンプト非含有）。ADM-S12（サポートデスク）新設＝キュー/SLA/定型返信/なりすまし導線/**解決ナレッジのFAQ還流（ADM-10統制）**/deflection計測——「少人数で回る」をKPIで検証可能に。
- 波及: W10・ADM-S12・§0導線・UJ-07、AC-SUPPORT-01/02、Gate A-1イベント3種、Config・DDL（support_tickets/messages・本文列なし）、FEATURE-LIST。REQ↔AC完全対応174件。

### v3.7.32 コンテナ移管性・自動復旧保守・メール/認証の強化

- `REQ-DUR-09`（コンテナ化と移管性）: 不変イメージ（シークレット非焼き込み・設定注入）、VPS=Compose相当→マネージドコンテナへ**同一イメージ・境界API不変で移行**、状態の完全外部化、クラウド中立プロトコル（PG互換/S3互換/SMTP）選定基準、専用API依存のアダプタ隔離、クラウド側stagingでの移管演習（DUR-08演習と統合）。
- `REQ-DUR-10`（自動復旧・自動保守）: ヘルスチェック→自動再起動・再スケジュール、**ジョブはcheckpointから無人再開**（不能時fail-close保留＋通知）、IaC自動プロビジョニング、証明書自動更新/ログローテ/TTL掃除/DBメンテの無人保守、全自動アクションの監査とフラッピング時の自動化一時停止（Kill Switch配下）。
- `REQ-PRODUCT-21`追補（メール信頼性）: 送信キュー・リトライ・**dedupe_keyの二重送信防止**、認証/回復系の優先レーン、no-reply＋サポート窓口明示、DMARCレポート監視、**非本番の実送信禁止（テストモードキャプチャ）**。
- `REQ-SEC-16`（アカウントライフサイクル）: 期限付き単回の招待トークン、**Google単独依存ロックアウトへのオーナー回復**（本人確認→ADM-S9統制の移譲・自動化なし・全監査）、全端末ログアウト・強制失効、高リスク操作のstep-up再認証。
- 波及: AC 4件、S7/ADM-S9/ADM-S1画面、Gate A-1イベント3種、Config・DDL（invitation_tokens）、FEATURE-LIST、検証ログ（コンテナ基盤選定=オープン）。REQ↔AC完全対応173件。

### v3.7.31 運用継続系インフラ4件

- `REQ-DUR-07`（実行基盤の実装規約）: 環境分離/IaC、**graceful drainデプロイ×AGENT-10 checkpoint（実行中ジョブを壊さない切替）**、expand→migrate→contractの後方互換DDL、PGキュー→MQ移行トリガ、S3互換オブジェクトストレージ（TTL物/バックアップ/エクスポート。VPSローカル恒久禁止）、UTC保存/テナントTZ表示。
- `REQ-DUR-08`（バックアップ・リカバリ）: RPO/RTO目標（初期例示→実測で締める）、日次フル＋WAL PITR、**別障害ドメインへの隔離保管**、共有DBの難題への設計判断＝**テナント別日次論理エクスポートで単一テナント選択復元**、復元演習の定期実施・記録・未実施アラート（ADM-S11拡張）。
- `REQ-SEC-15`（インバウンド保護）: API/Webhook/プラグイン端点のレート制限、ログイン試行制限・バックオフ、TLS/HSTS、管理面の追加防御オプション。
- `REQ-PRODUCT-21`（メール配信基盤）: 送信アダプタ抽象化・SPF/DKIM/DMARC・**連続バウンスの自動停止（抑制リスト）＋in-app正本維持**・S7に停止状態/再有効化・ADM-S1に送達性監視。
- 波及: AC 4件、DDL（mail_suppressions）、Config（RPO/RTO・レート・送信）、Gate A-1イベント2種、FEATURE-LIST、検証ログ（メールプロバイダ・MQトリガ=オープン）。REQ↔AC完全対応170件。

### v3.7.30 サマリー契約・意味索引・負荷平準化・キャパシティモデル

- `REQ-PRODUCT-20`新設: ArticleSummaryの**契約**（見出しツリー・要旨上限・ユニット・tier/タグ・hash。本文全文は持たない）で都度のWP本文取得を削減（効果をADM-S4観測）。ベクトルは**サマリー由来のみ・用途列挙・決定論一次判定の補助限定・必須経路にしない**（モデルversion固定=Catalog管理・変更分のみ再計算・テナントスコープ・運用原価）。
- `REQ-SRC-10`新設: テナント別タイムゾーン・静穏時間帯設定（S7）→バッチ/scheduled/部分パッチを静穏窓へ配置し、**窓内オフセット分散・同時実行上限・キュー水位**でプラットフォーム全体のスパイクを防止。鮮度high/interactiveは即時維持。
- `REQ-DUR-06`新設: テナント資源プロファイル→**ノード当たり健全テナント数**（利用率しきい値で定義・負荷試験で実測）→段階構成（単一VPS→DB/ワーカー分離→シャーディング。境界API不変で移行）→**ノード費÷密度＝1社あたり基盤原価を原価モデルへ配賦**（インフラコストの算出根拠を確立、実数はCost Table吸収）。
- 波及: AC-SUMM/SCHED/CAP、source.article.summary.v1、S7稼働時間帯・ADM-S4（平準化ヒートマップ・密度監視・省略効果）、DDL4表、Config、検証ログのオープン項目（embedモデル・密度実数=要計測）、PT-W。REQ↔AC完全対応166件。

### v3.7.29 波及更新のWP操作・フラッシュリライト・管理CRO

- `REQ-WPA-12`新設（部分パッチ適用）: リンク再調整等の「公開済み他記事への小粒更新」を新規投稿と別の操作として定義——ブロック/要素レベル更新・WPリビジョン保存・更新競合検知→安全側停止・ロールバック・**公開と同期直列にせずscheduledレーンで分散適用（サイト負荷のレート/同時数制御）**・キャッシュ連携はCapability検出の任意・施策台帳/28日比較へ記録。
- `REQ-RWR-09`新設（フラッシュリライト=TDH）: 候補選定は期待CTR基線への負残差（KGA-17）で**aio_suppressedを切り分け**（AIO起因はTDHで救えない）。複数案提示・釣り/詰め込みゲート・本文整合検査・本文非変更の部分パッチ適用・**同順位帯での前後CTR比較**（順位変動と切り分け）。低クレジット軽量ジョブ。
- `REQ-WPA-13`新設（CVポイント台帳・管理CRO）: オファー/フォーム/LPのカタログ（計測タグ・有効期間=季節対応）＋記事×割当台帳（CTA Placementの解決先）＋CV相関/エンゲージメント由来の差し替え提案（因果非主張）＋期限切れ/リンク切れ検知。
- 波及: AC 3件（AC-PATCH/FLASH/CRO）、source.site.cv_points.v1、タブ台帳（S5リライト/好調、S6にCVポイント台帳）、W4承認対象拡大、Gate A-1イベント3種、Config・DDL、PT-V。REQ↔AC完全対応163件。提案中（未確定）: カニバリ統合の実行系（301/canonical）・構造化データ出力。

### v3.7.28 完全自動化の運用ガバナンスと知識蓄積

- `REQ-PRODUCT-18`新設（資源・変更ガバナンス）: 監視/再計算の**増分原則（O(変化量)・全件再計算は較正時限定）**、監視の階層化（常時=サイト集計層のみ・詳細は異常時オンデマンド・個別常時監視はウォッチリスト限定）、常駐状態禁止（DB事前計算・バッチ/イベント駆動）、**full_autoの自動変更予算・同一記事クールダウン・振動検知（相互打ち消しの検出→停止＋通知）**、コスト帰属（決定論監視はクレジット外の運用原価としてADM-S4観測）。
- `REQ-PRODUCT-19`新設（小型知識蓄積）: TTL生キャッシュと分離した**導出事実ストア**（低変化事実をkey/value/observed_at/confidence/source_refのコンパクト形で蓄積・鮮度期限内は外部再取得を省略・再調査は変化トリガ時のみ）＋**施策台帳**（施策×文脈×効果デルタ→較正・好調分析・ネットワーク学習④の正式入力）。本文/生HTML禁止・サイズ上限・月次ロールアップ。供給は`source.site.facts.v1`。
- 波及: AC-GOV-01/02・AC-FACT-01/02、Pack契約・DDL3表・Config・Gate A-1イベント（change_budget_exhausted/oscillation_detected）、W8（予算/振動状態表示）・ADM-S4（運用原価・facts省略効果の監視）、FEATURE-LIST。REQ↔AC完全対応160件。

### v3.7.27 タブ台帳の確定と機能配線の補完

- 追加画面の判断: 第一階層は7項目のまま増やさない（正）。v3.7.26で過積載になったS1/S2/S5を含む全7画面の**第二階層タブ台帳**を画面台帳§5として確定（タブはURL直リンク可・通知2遷移以内の前提・タブ追加で第一階層を増やさない）。W4の承認対象へリンク再調整/波及の小リライトを明記。
- 機能配線の漏れ5件を補完: Source Pack契約3本追加（source.site.topology.v1 / site.engagement.v1 / gsc.index_status.v1）、Research & OutlineのSource Needへtopology配線（PACK-08）、DDLへ5テーブル（topology/watchlist/engagement/index_status/monthly_plans）、月次実績サマリ通知（PRODUCT-11＋Gate A-1へplan.monthly_closed）、**画面遷移図をv3.7.26へ同期**（UJ-09月次フロー図＋タブ直リンク注記を追加）。PT-U観点追加。REQ↔AC完全対応158件維持。

### v3.7.26 実務ワークフロー突合（SEO業務の1日）

- 実務の1日ワークフローと全要求を突合し、ギャップ7件を要求化: REQ-KGA-19（サイトトポロジー戦略=幹→枝→葉・カテゴリ×タグ網目・CV近接の生成順序・追加都度のリンク再調整ループ）/ REQ-KGA-20（ウォッチリスト・急変検知＋要因分解・自前SERP変動集計とアルゴ更新取り込み・**変動中はリライト保留ガード**・16か月YoY季節検知→シーズン前リフレッシュ）/ REQ-KGA-21（インデックス状況・技術ヘルス）/ REQ-RWR-08（好調記事の保護フラグ・波及リンク・リライトブリーフ集約）/ REQ-WPA-11（滞在・スクロール計測=任意有効化・相関補助・個人非特定）/ REQ-PRODUCT-17（月次目標・配分・参考レンジ予測=保証しない明示・実績乖離）/ REQ-UJ-09（月次計画ジャーニー。UJ-03/04/06へ実務ステップ追補）。
- 波及: S1プランニングタブ・変動サマリ、S2トポロジープランナー・ウォッチリスト、S5ブリーフ・好調分析・インデックス、通知カタログ＋Gate A-1イベント5種（v1.4）、Config、FEATURE-LIST、PT-T、検証ログへオープン項目（URL検査クォータ・アルゴ情報経路）。AC 7件追加でREQ↔AC完全対応158件。

### v3.7.25 ユーザー行動要件と画面遷移図

- L1新設（AOS-L1-USER-JOURNEY / REQ-UJ-01〜08）: 行動原則（第一階層から2遷移以内・通知から対処2遷移以内・行き止まり禁止＝次アクション提示・文脈引き継ぎ・非同期・破壊操作保護。数値は初期値）＋7ジャーニー（初期導入/日常運用/キーワード戦略/生成〜公開/リライト/例外・緊急/管理者運用）。全ステップを画面ID・既存REQへ接続し新機能は発明しない。AC-UJ-01〜08追加でREQ↔AC完全対応151件。
- L3新設（AOS-L3-SCREEN-FLOW）: 行動要件から導出した画面遷移図（Mermaid）。全体マップ（サイドメニュー＋グローバル要素＋W系の呼び出し文脈）、生成〜公開・キーワード戦略・通知起点対処・初期導入・管理コンソールの各フロー。相互検証規約=「遷移図にない遷移をジャーニーが要求しない／行き止まりを作らない」。PT-S観点（全パス到達・2遷移計測）追加。manifest/PLAN/FEATURE-LIST（L節）へ登録。

### v3.7.24 キーワードマップ→生成の動線

- 指摘対応: 部品（ギャップ→候補・アサイン台帳・Intakeプレチェック）は揃っているのにS2→S3の起動動線が画面要求に無かった欠落を解消。S2の選択キーワード/ギャップ象限/昇格キュー（親なし）から記事作成を起動し、S3へ起点・対象グループ・推奨記事タイプをプリセット引き継ぎ。起動時にアサイン台帳プレチェック（REQ-KGA-14のクレジット消費前警告）を即時表示しassigned済みはリライト誘導。複数選択の一括投入は「おまかせ」レーン既定＋Preflight合算（REQ-BILL-11）。NAV-04・AC-NAV-05・PT-Rへ反映。

### v3.7.23 最終監査での自己検出修正

- 最終フル監査（10観点）で、AC IDの命名文法違反1件を検出・修正（AC-I18N-01→AC-INTL-01。IDは英字-数字の文法であり数字混じりの英字部は全監査ツールの解析から漏れるため）。修正後ALL PASS。

### v3.7.22 プラットフォーム拡張6件の要求化＋プロト画面からの収穫

- 承認済み候補を要求化: REQ-PRODUCT-14（分析データエクスポート）/ 15（グローバル検索）/ 16（運営お知らせ＋公開ステータスページ）/ REQ-SEC-14（SSO・2FA拡張点）/ REQ-NAV-06（レスポンシブ方針）/ 07（i18n方針=文言外部化）。AC 6件（Platform Extensions節）追加。画面台帳（S1期間切替・S2/S5/W6エクスポート・W7お知らせ・S7セキュリティ・§0グローバル検索/ステータス導線）、ADM-S1（お知らせ作成配信）、Config、FEATURE-LIST、PT-Q観点へ波及。
- プロト画面からの逆収穫5件: ①画面状態5類型（通常/読込中/計算中/空/エラー）を§0規約化（SEC-06接続）②office_layoutへ部屋ホロ表示タイプを任意フィールド追補（Gate A-3 v1.1）③ロングテール昇格候補を通知種別化（PRODUCT-11カタログ＋Gate A-1のN印）④S1のKPI期間切替（7/28/90日）⑤管理コンソールの「Agent Officeビュー」切替は要求外＝なりすまし文脈のみ許容と確認事項化。

### v3.7.21 全27画面の操作監査（1画面ずつの突合）

- S1〜S7・W1〜W9・ADM-S1〜S11を1画面ずつ機能要求と突合し、欠けていた操作25件を追記（おすすめ採用/却下、キーワード編集/削除/分類変更・アサイン付け替え、昇格/除外の採用却下、hard gate保留対応、予約の変更取消、リライト起動・リンク候補採用、要望/NG表現のCRUD、サンプル差し替え、解約/退会・消費履歴・Customer Portal導線・メンバー/サイト/連携のCRUD、差分承認、一括承認＋理由、キャンセル、履歴フィルタ、全既読・通知遷移、Kill Switch解除、インシデント起票、手動rollback、なりすまし開始/終了、オフボーディング実行、DR実行等）。
- §0へヘルプ導線常設とWPプラグイン側UIのスコープ注記を追加。機能一覧は参照網羅137/137を維持（今回の追記はすべて既存REQの画面写像であり新REQなし）。要求自体に存在しない機能候補は本文レポート参照。

### v3.7.20 画面要求の操作明記（閲覧専用への倒れ防止）

- 指摘対応: 機能要求に対し画面要求が「表示」中心で「操作」の列挙を欠いていた乖離を解消。
- 情報構造を要求化（REQ-NAV-02）: **左サイドメニュー（第一階層7項目＋グローバル要素）＋画面内タブ＋詳細パネル/ドロワー**。管理コンソールも同型（ADM-S1〜S11）。「各画面は操作（追加・編集・削除・実行・選択）を明記し閲覧専用に倒さない」原則を両台帳§0へ。
- 起点採用はユーザー選択と明記（REQ-KGA-18改訂・AC-KGA-22拡張）: システムは候補提示まで、S3に起点選択UI（自動採用はAutopilot許可レベル内のみ）。
- 手動キーワード追加を第一級経路化（REQ-KGA-03改訂）: 単発・一括貼り付け・CSVインポート・シード語サジェスト展開ビュー（ラッコ型: 候補ツリー→選択→一括登録）。同一の正規化・分類・台帳照合パイプライン適用。NAV-04/S2へ反映。
- 管理側の編集を画面要求として確定: ADM-S8（Pack/few-shot/辞書/通知テンプレの編集エディタ・差分・Validate・版履歴・ロールバック）、ADM-S2（価格・プラン・Credit Pack・Stripe対応付けの改定フロー）、ADM-S7（値エディタ・新キー追加）。**§1.5 編集可能オブジェクト台帳**（対象×画面×統制の正本）を新設。
- AC-NAV-05新設・PT-P観点追加。REQ↔AC完全対応137件維持。

### v3.7.19 トピック起点の多元化（keyword/news/video）

- `REQ-KGA-18`新設: 素材（source.news.google.v1 / source.youtube.search.v1＝定義済み・DataForSEO既存要求内）が生成フローに未配線だった問題を解消。起点3類型（keyword/news_trend=鮮度期限つき候補/video_demand）→起点タグ付きバックログ→価値スコア優先度づけ。Research & OutlineのSource NeedへSERP面構成＋news/youtube Packを配線（PACK-08表更新）し、決定ルール＝news支配→news_column＋freshness_honesty必須・video支配→video_reference推奨＋結論先出し。鮮度highはinteractiveレーン既定・おまかせ選択時に鮮度注意（BILL-11接続）。意味ユニットvideo_reference追加（WP Capability配下）。AC-KGA-22追加でREQ↔AC完全対応137件。S2起点タグ・S3鮮度注意・Config・検証ログへ波及。

### v3.7.18 Admin Console突合（表示ラベル層の要求化）＋プロトHTML直接修正

- `REQ-ADM-11`新設（表示ラベルレジストリ）: 管理コンソールの内部キー・開発用語（config_key/event_type/ゲートキー/エラーコード/契約検証項目/メトリクス名）を日本語ラベル＋キー併記で表示する変換層。Catalog版管理・ADM-10統制で編集、未登録キーは「ラベル未登録」印のfail-visible、ラベルカバレッジを観測、通知・監査と訳語単一ソース。AC-ADM-10追加でREQ↔AC完全対応136件。管理画面台帳§0不変条件・ADM-S8・PT-O観点へ反映。
- Admin Consoleプロト突合: ADM-S1〜S11相当の画面は全て存在。設定レジストリはkey＋日本語ラベル併記済みで適合。生用語9件（forbidden output / hallucinated source / schema validation fail / budget overrun / circuit breaker / canary-next p95 / webhook secret / cache TTL / Prompt Cache TTL）を日本語（キー併記）へ修正したfixed版HTMLを納品。残課題: ADM-S4のレーン別コスト・バッチフォールバック監視（v3.7.15追加分）が未実装→PT-Oで検証。
- ユーザー版プロトの記事タイプずれをHTML直接修正: 構成案ヘッダへ記事タイプ/見出しフロー（transfer_guide/problem_solution）表示、site_strategy工程を「記事タイプ（カタログ）を決定し、文体（サンプル記事の型）を適用」へ、「サンプル記事の型」全箇所に（文体学習）注記、QAゲート4種にgate key併記（eeat_trust/original_value/deceptive_claim）。

### v3.7.17 プロト突合（記事タイプの概念分離）

- オフラインプロトHTMLとの突合監査。適合: 13状態ラベル・実行レーン・ターゲット/主張軸・通知/承認/履歴/緊急停止・第一階層7画面・Office部屋/ペルソナのイベント駆動状態導出（Gate A-3契約準拠）。
- ズレ（プロト側修正・Design引き渡し事項）: 生成フローに catalog.article_type（REQ-PACK-11.1の初期6種、Gate A-5必須キー）の決定表示がなく、「サンプル記事の型」（REQ-PACK-16文体学習）と概念混同。QAゲート表示にgate key対応なし。
- 予防パッチ: W3へ記事タイプ/見出しフローの契約由来表示と概念分離を明記、S6へ「サンプル記事の型≠記事タイプカタログ」注記、PT-N（表示とgate key対応の検証観点）追加。

### v3.7.16 全件監査（機能一覧の全REQ網羅化ほか）

- FEATURE-LISTを全面再生成: 短縮表記（例「REQ-KGA-05 / 06 / 07」）が機械照合を妨げ真の欠落（PRODUCT-01/07/09・PACK-03/04/06/08・BILL-02/04/05/08・SEC-01/05/06・DUR-01/02/03/05・KGA-01・NAV-04・AGENT-01/05・SRC-01・RWR-01・WPA-06等）と混在していたため、**完全ID表記・全135 REQ網羅（機械照合で135/135・不存在参照ゼロを確認）**へ再構成。K節（開発プロセス）を追加。以後の監査は定義集合との差分ゼロ維持を規約化。
- Gate A-1イベントカタログをv1.1へ（追加=minor規則内）: 通知カタログ突合で欠落4種（publish.approval_requested / billing.webhook_failed / billing.reconciliation_mismatch / billing.cache_hit_floor_breached）を追加。
- Config台帳へ通知（digest/保持/残高しきい値）とTier3プラン許可の行を追加。画面台帳へS5内部リンク候補・オーファン検知（KGA-09）とS2トピック網羅率（KGA-10）を追記。
- manifest/PLANの全パス実在・office_layoutのscreen_refs妥当性・アセット参照実在は監査で欠落ゼロを確認。

## このZIPに含めないもの

- 実装コード
- DB migration
- APIルート
- WordPressプラグイン実装
- 旧プロジェクトへの整合メモ
- 過去版のナビゲーション試案
- ユーザー画面に出してはいけない内部用語を第一階層メニュー化した案

## 基本原則

AI Office de SEOは、記事本文をSaaS側に恒久保存しません。WordPressをコンテンツの正本とし、SaaS側はURL、記事サマリー、構造、キーワード、GSC実績、CV日次集計、生成・改善ジョブ履歴、ユーザー要望、レギュレーション、Pack/Snapshotメタデータを保持します。
