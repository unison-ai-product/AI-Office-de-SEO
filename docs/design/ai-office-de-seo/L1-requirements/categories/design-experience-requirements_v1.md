---
document_id: AOS-L1-DESIGN-EXPERIENCE-REQUIREMENTS
title: AI Office de SEO デザイン・体験要求 v1.1
version: 1.1
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

### REQ-DESIGN-04 Responsive・Accessibility

主要操作はdesktop、tablet、mobileの情報優先度を定義し、狭幅で重要な状態・承認・費用を隠さない。keyboard操作、可視focus、contrast、label、error関連付け、screen reader名称、reduced motionを共通componentと受入試験へ含める。基準値は `REQ-NFR-11` を参照する。

### REQ-DESIGN-05 待機・進行Feedback

短時間処理は即時feedback、長時間処理は受付、現在stage、完了済みstage、待機理由、残りの見込み、取消・離脱可否を示す。画面を閉じても処理が継続すること、戻った時に同じ相関IDへ復帰できることを明示する。架空のpercent、架空の作業、固定時間animationで待ち時間を偽装しない。

### REQ-DESIGN-06 UI文言・i18n

状態名、操作名、警告、課金、権限、障害文言はversion付きUI Copy Registryで管理し、同じ概念へ複数の呼称を割り当てない。変数、plural、日付、時刻、数値、通貨、locale fallbackを定義し、翻訳不能な文字列連結を避ける。禁止語・非推奨語は理由と代替語を持つ。

### REQ-DESIGN-07 HTML/CSS・画像境界

構造、文字、状態、操作、表、chart、responsive layoutはHTML/CSS/componentで実装し、意味を画像だけに埋め込まない。画像assetは装飾、ブランド、アイキャッチ等へ限定し、alt、比率、loading、解像度、cache方針を持つ。生成画像Pattern Editorの業務操作は `REQ-SCREEN-15` と `REQ-LOGIC-10` を参照する。

### REQ-DESIGN-08 Agent Office演出

Agent・キャラクタ・workspace演出は実eventとstageへ対応し、動作中、待機、保留、失敗、完了を視覚的に区別する。演出を無効化・簡略化しても全操作と状態理解が成立し、reduced motionでは大きい移動・反復animationを抑制する。演出assetの追加が初期表示や対話操作の性能予算を超えない。

## 受入条件

- [ ] AC-L1-DESIGN-01: 通常ビューとAgent Officeビューが同一jobの状態・進行・失敗理由を一致して表示する。
- [ ] AC-L1-DESIGN-02: 非専門者が主要画面で次の操作・状態・理由・影響・費用を内部実装用語なしに理解できる。
- [ ] AC-L1-DESIGN-03: Recommendationの根拠、優先度成分、unknown、再評価条件をロジック結果どおり表示できる。
- [ ] AC-L1-DESIGN-04: 主要操作が狭幅、keyboard、screen reader、reduced motionで完了できる。
- [ ] AC-L1-DESIGN-05: 長時間処理から離脱・復帰しても相関IDと実stageが維持され、架空進捗を表示しない。
- [ ] AC-L1-DESIGN-06: UI Copy Registryから状態・操作・警告をlocale別に一貫表示できる。
- [ ] AC-L1-DESIGN-07: 画像非表示でも主要情報と操作が失われず、画像assetにalt・size・loading方針が適用される。
- [ ] AC-L1-DESIGN-08: Agent Office演出が実eventと一致し、演出OFF・reduced motionでも同じ業務を完了できる。
