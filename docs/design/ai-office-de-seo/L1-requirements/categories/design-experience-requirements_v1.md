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

通常ビュー、Agent Officeビュー、通知、詳細画面は同じjob・Recommendation・承認・障害状態を異なる表現で表示し、独自状態を作らない。表示状態は `REQ-SCREEN-04/05/11` の正本状態とeventから導出し、演出の完了を処理完了として表示しない。

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

初回ログインと日常業務の正規入口は通常ビューとし、Recommendationの採否、承認、設定、費用確認等の「選ぶ・決める」操作を優先する。Agent Officeは名称どおり、実行中Task、詳細情報、担当Agent、進捗、成果、Loop、蓄積Knowledgeを「複数のAgentを働かせている」体験として確認する別ビューとする。通常ビューから対象Task、記事、Keyword、RecommendationのContextを維持して該当する部屋・Agent・詳細へ遷移し、戻ると元の判断位置へ復帰する。

Officeはフロア、部屋、エレベーター、役割別Agent、ライブフィードを持つ既存モックの空間構造を基線とする。経営者がゲーム内のオフィスを訪れ、NPCが自律的に働いているような第一印象を与えつつ、各Agentの行動、会話、状態、成果を実Taskと一致させる。Agentを選択または呼びかけると、その役割、現在Task、完了成果、判断待ち、参照Knowledgeを会話的に確認できる。

### REQ-DESIGN-10 3D表現と段階的縮退

Agent Officeは2D画像を配置した現行モックから、奥行き、カメラ移動、立体的な部屋・Agent、状態Animationを持つ軽量な2.5D／3D表現へ発展可能にする。ただし3D AssetやRender Engineを業務状態・Navigation・Task操作の正本にせず、同じOffice Scene Contractを軽量2D、簡略3D、標準3Dへ描画できるようにする。

初回表示では画面骨格、Task状態、操作を先に利用可能にし、高品質Assetを遅延読込する。端末性能、GPU、通信、省電力、reduced motion、描画失敗に応じて品質を自動調整または2Dへ縮退し、ユーザーが品質を手動変更できる。縮退によってTask、詳細、会話、通知、通常ビューへの復帰を失わない。

### REQ-DESIGN-11 Loop・Knowledge Graph表現

Agent Officeの詳細情報は内部ログの時系列表示だけにせず、目的、Recommendation、Keyword cluster、記事、Task、成果、計測、評価、学習、次回Recommendationの関係を、LoopおよびKnowledge Graphとして探索できる表現を持つ。nodeとedgeは正本entity・event・version・根拠から導出し、存在しない因果関係やAgentの架空行動を生成しない。

Graphは全件を一度に描画せず、選択対象を中心に必要範囲だけ展開し、期間、Site、目的、Agent、状態で絞り込む。視覚表現と同じ内容を一覧・詳細でも確認でき、Task History、記事遍歴、Recommendation理由、Knowledge設定へ相互遷移できる。

### REQ-DESIGN-12 将来のMobile Office Chat

mobile対応は初期リリースの必須範囲外とする。後続versionではAgent Office Chatをmobileの主導線とし、通知、要確認事項、承認前のチェック、簡易な数値説明、修正指示、Task状態確認を会話形式で提供する。長文編集、詳細設定、画像Pattern編集、複雑なGraph操作はdesktopへ引き継ぎ、mobileだけで無理に再現しない。

## 受入条件

- [ ] AC-L1-DESIGN-01: 通常ビューとAgent Officeビューが同一jobの状態・進行・失敗理由を一致して表示する。
- [ ] AC-L1-DESIGN-02: 非専門者が主要画面で次の操作・状態・理由・影響・費用を内部実装用語なしに理解できる。
- [ ] AC-L1-DESIGN-03: Recommendationの根拠、優先度成分、unknown、再評価条件をロジック結果どおり表示できる。
- [ ] AC-L1-DESIGN-04: desktopの主要操作がkeyboard、screen reader、reduced motionで完了でき、狭幅でも重要状態を失わず、初期mobile非対応範囲を誤表示しない。
- [ ] AC-L1-DESIGN-05: 長時間処理から離脱・復帰しても相関IDと実stageが維持され、架空進捗を表示しない。
- [ ] AC-L1-DESIGN-06: UI Copy Registryから状態・操作・警告をlocale別に一貫表示できる。
- [ ] AC-L1-DESIGN-07: 画像非表示でも主要情報と操作が失われず、画像assetにalt・size・loading方針が適用される。
- [ ] AC-L1-DESIGN-08: Agent Office演出が実eventと一致し、演出OFF・reduced motionでも同じ業務を完了できる。
- [ ] AC-L1-DESIGN-09: 通常ビューで選択・承認を行い、Contextを維持してOfficeの該当Agent・Task・詳細を確認し、元の判断位置へ復帰できる。
- [ ] AC-L1-DESIGN-10: Officeを標準3D、簡略3D、軽量2Dへ切り替えても、同じTask状態・詳細・会話・操作を利用できる。
- [ ] AC-L1-DESIGN-11: Recommendationから制作・計測・評価・学習・次回Recommendationまでを実entityに基づくLoop／Knowledge Graphと一覧の両方で追跡できる。
- [ ] AC-L1-DESIGN-12: 初期リリースがdesktop標準として成立し、後続mobile Chatへ通知・確認・説明・修正指示を追加してもdesktop業務の正本を分岐させない。
