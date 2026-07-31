---
document_id: AOS-L1-DESIGN-EXPERIENCE-REQUIREMENTS
title: AI Office de SEO デザイン・体験要求 v1.2
version: 1.2
layer: L1
kind: design_experience_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO デザイン・体験要求

## 責務

情報の理解しやすさ、視覚表現、操作感、アクセシビリティ、Agent Office体験を定義する。

重点:

- 通常ビューとAgent Officeビューの同一状態・同一詳細
- SEO非専門者向けの平易な用語
- レコメンド理由と優先度成分の理解
- responsive、keyboard、focus、contrast、reduced motion
- 読込中でも重さを感じさせない視覚フィードバック
- UI文言レジストリ、i18n、禁止語
- HTML/CSS描画と画像アセットの境界
- キャラクタ演出と実イベントの一致

業務操作は画面・操作要求、性能値は非機能要求を正本とする。

既存ソース: `ai-office-de-seo-navigation-ui-requirements_v3.7.md`、`ai-office-de-seo-agent-office-ui-requirements_v3.7.md`、`Design.md`。

## 要求

### REQ-DESIGN-01 状態の同一性

通常ビュー、Agent Officeビュー、通知、詳細画面は同じjob・Recommendation・承認・障害の正本状態を共有し、同じ対象を矛盾する状態で表示しない。Agent Officeは独自の部屋、会話、探索、詳細設定、Agent指示、表示状態を持てるが、公開・課金・承認・job完了等の業務事実を別管理しない。表示状態は `REQ-SCREEN-04/05/11` の正本状態とeventから導出し、演出の完了を処理完了として表示しない。

### REQ-DESIGN-02 情報階層・平易な用語

主要画面は「次に行う操作、現在の状態、理由、影響、費用」を先に示し、内部のPack、Executor、queue、model route等を第一階層へ露出しない。SEO専門語は必要な場所だけで使用し、平易な説明、具体例、詳細展開を提供する。

### REQ-DESIGN-03 Recommendation説明

Recommendationは結論だけでなく、目的、対象、主要根拠、優先度成分、変更内容、費用、データ不足、再評価条件を同じ視覚構造で示す。数値がunknownの場合に0や低評価の色へ変換せず、未計測・不足・取得不能を区別する。UIは `REQ-LOGIC-*` の結果を説明し、独自スコアを計算しない。

### REQ-DESIGN-04 Desktop First・Accessibility

初期リリースは法人向け業務SaaSとしてdesktopを標準利用環境とし、通常ビューとAgent Officeの主要業務をdesktopで成立させる。狭幅表示で閲覧不能や重要情報の欠落を起こさないが、mobileでの記事編集、画像Pattern Editor、全業務完結を初期受入条件にしない。keyboard操作、可視focus、contrast、label、error関連付け、screen reader名称、reduced motionを共通componentと受入試験へ含める。基準値は `REQ-NFR-11` を参照する。

### REQ-DESIGN-05 待機・進行Feedback

短時間処理は即時feedback、長時間処理は受付、現在stage、完了済みstage、待機理由、残りの見込み、取消・離脱可否を示す。画面を閉じても処理が継続すること、戻った時に同じ相関IDへ復帰できることを明示する。架空のpercent、架空の作業、固定時間animationで待ち時間を偽装しない。

### REQ-DESIGN-06 UI文言・i18n

状態名、操作名、警告、課金、権限、障害文言はversion付きUI Copy Registryで管理し、同じ概念へ複数の呼称を割り当てない。変数、plural、日付、時刻、数値、通貨、locale fallbackを定義し、翻訳不能な文字列連結を避ける。禁止語・非推奨語は理由と代替語を持つ。

### REQ-DESIGN-07 HTML/CSS・画像境界

構造、文字、状態、操作、表、chart、responsive layoutはHTML/CSS/componentで実装し、意味を画像だけに埋め込まない。画像assetは装飾、ブランド、アイキャッチ等へ限定し、alt、比率、loading、解像度、cache方針を持つ。生成画像Pattern Editorの業務操作は `REQ-SCREEN-15` と `REQ-LOGIC-10` を参照する。

### REQ-DESIGN-08 Agent Office演出

Agent・キャラクタ・workspace演出は実eventとstageへ対応し、動作中、待機、保留、失敗、完了を視覚的に区別する。演出を無効化・簡略化しても全操作と状態理解が成立し、reduced motionでは大きい移動・反復animationを抑制する。演出assetの追加が初期表示や対話操作の性能予算を超えない。

Agent Officeは「仕事をしている様子」を伝える体験層であり、ユーザーが業務の進行とTask Historyを理解できるようにする。開発監査ログの行をキャラクタ動作へ直接変換したり、内部debug情報を見せたりせず、実eventを業務上のstage、成果、待機理由、次操作へ翻訳して表示する。

### REQ-DESIGN-09 通常ビューと仮想Officeの役割

初回ログインと日常業務の正規入口は通常ビューとし、Recommendationの採否、承認、基本設定、費用確認等を少ない判断と操作で完了できる簡単操作面とする。Agent Officeは名称どおり、実行中Task、詳細情報、担当Agent、進捗、成果、Loop、蓄積Knowledgeを確認するだけでなく、通常ビューでは複雑になる詳細探索、方針調整、Agentへの指示、Workflow・Recommendation構成の変更を行う詳細運用面とする。

通常ビューが推薦Keywordを提示する場合、Agent OfficeではKeyword一覧、cluster、採用・除外根拠、優先度成分、業界・目的・実績との関係を確認し、Keywordの選択条件、重み、除外、推薦の方向性を権限・変更可能範囲内で調整できる。同様に、記事制作、リライト、計測、評価、Knowledge等も、通常ビューの簡単操作とOfficeの詳細操作を対応付ける。

通常ビューから対象Task、記事、Keyword、RecommendationのContextを維持して該当する部屋・Agent・詳細へ遷移し、Officeで変更した設定・指示・方針はversion、影響範囲、再計算対象を持って正本へ反映する。通常ビューへ戻ると元の判断位置へ復帰し、変更後のRecommendationと状態を簡潔に確認できる。

通常ビューの各操作に詳細確認・詳細設定・根拠探索が必要な場合は、Office側に対応する詳細導線を持たせる。両画面は同じ権限、業務entity、command、eventを使用し、表示密度と操作体験だけを変える。Agentへの質問は回答に留め、業務状態を変える会話は変更案として影響とcreditを表示してから確定する。Agent Officeへ内部管理者専用の開発操作、監査logまたはdebug情報を持ち込まない。

Officeはフロア、部屋、エレベーター、役割別Agent、ライブフィードを持つ既存モックの空間構造を基線とする。経営者がゲーム内のオフィスを訪れ、NPCが自律的に働いているような第一印象を与えつつ、各Agentの行動、会話、状態、成果を実Taskと一致させる。Agentを選択または呼びかけると、その役割、現在Task、完了成果、判断待ち、参照Knowledgeを会話的に確認できる。

部屋、Agent、設備、設定項目は、ゲームにおけるショップ、装備、能力構成に相当する発見性と操作感を持たせる。ユーザーはエレベーターで担当部門へ移動し、Agentへ話しかけ、詳細情報を取得し、Agentの動き方、参照Knowledge、推薦方針、実行条件を変更できる。ただし名称、説明、結果、費用、影響はSEO業務の意味を保ち、ゲーム用語だけで業務判断を要求しない。

将来の拡張アプリは、通常ビューでは新しい機能、設定、レポートまたは連携として追加し、Agent Officeでは新しいフロア、部屋、設備、専門Agent、既存設備のupgrade等として空間へ反映できる。例えばAI可視性アプリは分析室または観測設備、Crawler logアプリは技術監視設備、追加CMS Adapterは入稿設備として表現できる。表現形式はApp ManifestのOffice Scene Extensionで宣言し、同じ機能を二重実装しない。

購入前はOffice内に建設予定区画、閉じた部屋、設備Catalog等として存在と効果を確認できるが、業務上必要な標準機能を不自然に撤去した未完成Officeとして見せない。購入、インストール、Site割当、権限同意、初回同期の各状態を、`購入可能／工事中／設定待ち／稼働中／停止中` 等の理解可能な状態へ対応付ける。課金状態や権限不足を演出だけで隠さず、通常ビューの契約・設定画面へ移動できる。

### REQ-DESIGN-10 3D表現と段階的縮退

Agent Officeは2D画像を配置した現行モックから、奥行き、カメラ移動、立体的な部屋・Agent、状態Animationを持つ軽量な2.5D／3D表現へ発展可能にする。ただし3D AssetやRender Engineを業務状態・Navigation・Task操作の正本にせず、同じOffice Scene Contractを軽量2D、簡略3D、標準3Dへ描画できるようにする。

拡張アプリが追加するScene assetはCoreとは別bundleとして遅延取得し、未導入アプリの3D asset、animation、音声を初期読込しない。asset取得失敗時も通常ビューと軽量Office componentで機能を操作でき、Office描画の失敗をアプリ機能の停止として扱わない。

初回表示では画面骨格、Task状態、操作を先に利用可能にし、高品質Assetを遅延読込する。端末性能、GPU、通信、省電力、reduced motion、描画失敗に応じて品質を自動調整または2Dへ縮退し、ユーザーが品質を手動変更できる。縮退によってTask、詳細、会話、通知、通常ビューへの復帰を失わない。

### REQ-DESIGN-11 Loop・Knowledge Graph表現

Agent Officeの詳細情報は内部ログの時系列表示だけにせず、目的、Recommendation、Keyword cluster、記事、Task、成果、計測、評価、学習、次回Recommendationの関係を、LoopおよびKnowledge Graphとして探索できる表現を持つ。nodeとedgeは正本entity・event・version・根拠から導出し、存在しない因果関係やAgentの架空行動を生成しない。

Graphは全件を一度に描画せず、選択対象を中心に必要範囲だけ展開し、期間、Site、目的、Agent、状態で絞り込む。視覚表現と同じ内容を一覧・詳細でも確認でき、Task History、記事遍歴、Recommendation理由、Knowledge設定へ相互遷移できる。

### REQ-DESIGN-12 将来のMobile Office Chat

mobile対応は初期リリースの必須範囲外とする。後続versionではAgent Office Chatをmobileの主導線とし、通知、要確認事項、承認前のチェック、簡易な数値説明、修正指示、Task状態確認を会話形式で提供する。長文編集、詳細設定、画像Pattern編集、複雑なGraph操作はdesktopへ引き継ぎ、mobileだけで無理に再現しない。

## 受入条件

- [ ] AC-L1-DESIGN-01: 通常ビューとAgent Officeビューが同一jobの業務状態を一致して表示しつつ、Office固有の部屋・会話・詳細設定を保持できる。
- [ ] AC-L1-DESIGN-02: 非専門者が主要画面で次の操作・状態・理由・影響・費用を内部実装用語なしに理解できる。
- [ ] AC-L1-DESIGN-03: Recommendationの根拠、優先度成分、unknown、再評価条件をロジック結果どおり表示できる。
- [ ] AC-L1-DESIGN-04: desktopの主要操作がkeyboard、screen reader、reduced motionで完了でき、狭幅でも重要状態を失わず、初期mobile非対応範囲を誤表示しない。
- [ ] AC-L1-DESIGN-05: 長時間処理から離脱・復帰しても相関IDと実stageが維持され、架空進捗を表示しない。
- [ ] AC-L1-DESIGN-06: UI Copy Registryから状態・操作・警告をlocale別に一貫表示できる。
- [ ] AC-L1-DESIGN-07: 画像非表示でも主要情報と操作が失われず、画像assetにalt・size・loading方針が適用される。
- [ ] AC-L1-DESIGN-08: Agent Office演出が実eventと一致し、演出OFF・reduced motionでも同じ業務を完了できる。
- [ ] AC-L1-DESIGN-09: 通常ビューの簡単操作から同じ権限・業務正本のままOfficeの詳細へ移動し、会話による変更案の影響・creditを確認して確定し、再計算結果を両画面へ同期できる。
- [ ] AC-L1-DESIGN-10: Officeを標準3D、簡略3D、軽量2Dへ切り替えても、同じTask状態・詳細・会話・操作を利用できる。
- [ ] AC-L1-DESIGN-11: Recommendationから制作・計測・評価・学習・次回Recommendationまでを実entityに基づくLoop／Knowledge Graphと一覧の両方で追跡できる。
- [ ] AC-L1-DESIGN-12: 初期リリースがdesktop標準として成立し、後続mobile Chatへ通知・確認・説明・修正指示を追加してもdesktop業務の正本を分岐させない。
