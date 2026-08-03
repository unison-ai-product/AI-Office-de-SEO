---
document_id: AOS-L3-SCREEN-FLOW
title: AI Office de SEO 画面遷移図 v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-08-03
related: AOS-L1-USER-JOURNEY / AOS-L3-SCREEN-INVENTORY
---

# AI Office de SEO 画面遷移図

ユーザー行動要件（REQ-UJ-01〜09）から導出。ノードは画面台帳のID。**遷移図にない遷移をジャーニーが要求しない／ジャーニーにない行き止まりを作らない**（AC-UJ検証対象）。

## 0. 現行Lifecycle正本（2026-08-03）

以下を現行の最上位画面遷移とする。本書の全節はこのLifecycleを詳細化する。既存プロトの実装遷移は `ai-office-de-seo-screen-connection-map_v1.md` に隔離し、本書の正規遷移を上書きしない。

本図は将来像だけを示す参考図ではなく、画面台帳、URL／状態、画面Availability、受入試験へ渡す遷移正本である。プロト実装は後続更新とするが、画面設計では各遷移の入口条件、保持Context、保留理由、復帰先まで本図へ一致させる。

```mermaid
flowchart LR
  A[S7 Site導入\n新規/既存] --> B{Site種別}
  B -->|新規| C[S2 市場探索\nbig keyword方向確認]
  B -->|既存| D[S2 GSC/Upload/CMS取込]
  C --> E[S2 分析・Cluster化]
  D --> E
  E --> F{Report種別}
  F -->|新規| G[S2 Keyword戦略Report]
  F -->|既存| H[S2 Keyword・Site診断Report]
  G --> I[S1 月次計画]
  H --> I
  I --> J[S1 Recommendation Queue]
  J -->|採用| K[Recommendation Intake freeze]
  J -->|保留/除外| J
  K --> L{施策種別}
  L -->|新規/リライト| M[S3 Agent Workflow]
  L -->|予定/自動運用| N[S4 Automation]
  L -->|CTA/内部link Patch| O[W2/W4 軽量施策確認]
  L -->|観測| P[S5 要監視]
  L -->|技術対応| Q[W10 ユーザー対応/Support]
  M --> R[CMS下書き・承認/Automation]
  N --> R
  O --> R
  R --> S[S5 公開・更新後評価]
  S --> T[S6 Site学習/全体補正候補]
  T --> I
```

### 0.1 新規Site導入

```mermaid
flowchart TD
  A[Site設定・CMS接続] --> B[業界/業種・商品・顧客・地域・横断軸]
  B --> C[big keyword候補]
  C --> D{方向性確認}
  D -->|除外/追加| C
  D -->|開始| E[市場Keyword探索]
  E --> F[Cluster分析・分類]
  F --> G[戦略Reportを領域ごとに開放]
  G --> H[月次計画・Recommendation]
```

### 0.2 既存Site導入

```mermaid
flowchart TD
  A[Site設定] --> B[CMS/GSC接続またはKeyword upload]
  B --> C[GSC・upload・記事・市場Keyword統合]
  C --> D[Cluster分析・記事対応・Market/Share計算]
  D --> E[Keyword・Site診断Report]
  E --> F[月次計画・Recommendation]
```

### 0.3 Recommendationから評価まで

```mermaid
flowchart TD
  A[Recommendation version] --> B[採用]
  B --> C[schema.intake.recommendation.v1 freeze]
  C --> D[Preflight\n権限/予算/接続/重複/保護/鮮度]
  D -->|変化あり| E[held/superseded\n理由と解除条件]
  D -->|成立| F[Workflow/Ticket]
  F --> G[QA/限定Repair]
  G --> H[CMS下書き/公開判定]
  H --> I[公開・更新event]
  I --> J[SEO/CTA-CV/認知評価\n1・3・6か月＋月次/累積]
  J --> K[Site補正/匿名補正候補]
  K --> L[再推薦/次月計画]
```

### 0.4 Reportから月次計画・Recommendation

```mermaid
flowchart TD
  A[Keyword分析・Cluster] --> B{Site種別}
  B -->|新規| C[Keyword戦略Report\n市場・適合・構造・制作順]
  B -->|既存| D[Keyword・Site診断Report\nMarket/Share・Keyword・記事/Query・診断]
  C --> E[Cluster単位\n優先/通常/保留/除外]
  D --> E
  E --> F[影響差分\n未実行推薦・配分・credit]
  F --> G[Report version確定]
  G --> H[MonthlyPlan\nsource_report_ref]
  H --> I[Recommendation\nsource_report_ref]
  I -->|詳細| J[Market/Share/Keyword/記事/根拠]
  J -->|深掘り| K[Office Keyword room\n同一Context]
```

## 1. 全体マップ（通常ビュー）

サイドメニュー=第一階層7項目、ヘッダー=グローバル要素（REQ-NAV-02）。W系は呼び出し元文脈で開く（パネル/ドロワー、第三階層）。

```mermaid
flowchart LR
  subgraph GH[ヘッダー常設]
    GS[グローバル検索] --- NC[W7 通知センター] --- JI[ジョブインジケータ→W5] --- HELP[ヘルプ/ステータス] --- SUP[W10 サポート]
  end
  subgraph SIDE[サイドメニュー]
    S1[S1 ダッシュボード]; S2[S2 キーワード管理]; S3[S3 コンテンツ作成]; S4[S4 オートメーション]; S5[S5 検索流入分析]; S6[S6 学習ナレッジ]; S7[S7 設定]
  end
  S1 -->|承認待ち| W4[W4 承認キュー]
  S1 -->|Recommendation採用| RI[Recommendation Intake freeze]
  S2 -->|Report/ClusterからRecommendation採用| RI
  RI -->|新規/リライト| S3
  RI -->|予定/軽量Patch| S4
  RI -->|観測| S5
  S2 --> W1[W1 詳細ワークベンチ]
  S3 --> W5[W5 ジョブ進捗] --> W3[W3 プレビュー/QA]
  W3 -->|通過| W4 -->|承認| S4
  W3 -->|hard gate保留| W3
  S4 --> W8[W8 緊急停止/おまかせ]
  S5 -->|リライト起動| S3
  S5 --> W2[W2 差分プレビュー] --> W4
  S6 --> S3
  S7 --> W9[W9 同意/テナント切替]
  NC -->|2遷移以内で対処| W4 & W5 & S7 & S5
  W5 --> W6[W6 ジョブ履歴]
```

### 1.1 通常ビューとAgent Officeの往復・変更フロー（2026-08-03現行要求）

通常ビューとOfficeは別システムではない。通常ビューは簡単操作、Officeは同じ対象を深掘りし、Agentとの会話や詳細条件から操作するViewである。Office内の状態変更は会話文を直接実行せず、共通の変更案・Task・Commandへ変換する。

```mermaid
flowchart LR
  N[通常ビュー\n要点・推薦・承認] -->|対象文脈を保持| O[Agent Office\n部屋・Agent・詳細]
  O --> Q{会話・詳細操作}
  Q -->|質問・探索| A[根拠・一覧・分析説明]
  Q -->|状態変更を伴う| P[変更案\n対象・差分・影響・クレジット]
  P -->|確定| C[共通Command/Event]
  C --> S[業務正本を更新]
  S --> N
  S --> O
  A --> O
  O -->|簡単操作へ戻る| N
```

## 2. Recommendation／手動指定から生成〜公開（UJ-05）

既定入口はversion付きRecommendationである。S3でKeyword、目的、CTA、内部link、品質、予算を再入力しない。ユーザー探索による手動指定も許可するが、Recommendationと同じIntake SchemaとPreflightへ正規化する。

```mermaid
flowchart TD
  A{入口} -->|既定| B[Recommendation採用<br/>Intake version freeze]
  A -->|ユーザー探索| C[S2/S3 手動指定<br/>Keyword/URL/要望]
  C --> D[共通Intakeへ正規化]
  B --> E[Preflight<br/>権限/credit/接続/重複/保護/依存]
  D --> E
  E -->|不足/競合| E2[理由・必要操作・相談<br/>保留/修正/中止]
  E -->|成立| F[W5 Agent Workflow<br/>停止/再開/キャンセル]
  F --> G{Outline確認設定}
  G -->|ON| H[見出し構成を確認・修正・確定]
  G -->|OFF| I[Meaning Unit Writing]
  H --> I
  I --> J[QA/限定Repair]
  J -->|hard gate該当| K[二段階確認＋同意<br/>または差し戻し]
  J -->|通過| L[装飾・画像・Assembly]
  K -->|公開継続| L
  K -->|修正| F
  L --> M[CMS下書き送信<br/>編集URL/Preview URL]
  M --> N{公開条件}
  N -->|新規15件未満| O[完成記事の承認必須]
  N -->|新規15件到達＋自動運用有効| P[S4 予約/公開]
  N -->|リライト/記事置換| Q[差分確認・承認必須]
  O -->|承認| P
  Q -->|承認| P
  O -->|差し戻し| F
  Q -->|差し戻し| F
  P --> R[W7 完了通知] --> S[S5 公開/更新後評価]
```

## 3. キーワード分析→Report→Recommendation（UJ-04）

```mermaid
flowchart TD
  A[S2 Keyword分析<br/>Market/Share/Cluster] --> B{Site種別}
  A --> A2[追加/除外/分類修正] --> A
  B -->|新規| C[Keyword戦略Report]
  B -->|既存| D[Keyword・Site診断Report]
  C --> E[Cluster単位<br/>優先/通常/保留/除外]
  D --> E
  E --> F[月次計画・記事/施策配分]
  F --> G[Recommendation Queue]
  G -->|採用| H[Intake freeze→UJ-05]
  G -->|詳細| I[W1/Office<br/>Keyword・記事・根拠]
  G -->|保留/除外| J[履歴＋次回再評価条件]
  I -->|方針変更案を確定| K[未実行Recommendation再計算] --> G
```

## 4. 通知起点の対処フロー（UJ-03/07、通知→2遷移以内）

```mermaid
flowchart LR
  N[W7 通知] -->|承認依頼| W4[W4] -->|承認/差戻| END1[完了]
  N -->|hard gate保留| W3[W3] -->|再実行/取消| END2[完了]
  N -->|再認可要求| S7c[S7 連携] -->|再認可| END3[完了]
  N -->|残高低下/支払失敗| S7b[S7 クレジット/請求] --> END4[完了]
  N -->|カニバリ/昇格候補| S2orS5[S2/S5] -->|採用/却下/起動| END5[完了]
  N -->|Kill Switch| W8[W8] -->|解除/確認| END6[完了]
  N -->|チケット更新| W10a[W10 サポート] --> END7[完了]
  ANY[解決しない事象<br/>各画面/ヘルプ] --> W10b[W10 サポート<br/>AI一次応答] -->|自己解決| END8[完了]
  W10b -->|未解決/明示要求| ESC[エスカレーション<br/>ADM-S12へ] --> W10b
```

## 5. 初期導入フロー（UJ-02）

```mermaid
flowchart TD
  A[W9 登録・必要同意] --> B[S7 契約主体・顧客組織・Site作成]
  B --> C[S7 Site設定<br/>新規/既存・業界/業種・商品・顧客・地域・横断軸]
  C --> D[S7 CMS REST API接続<br/>Capability診断]
  D -->|失敗/不足| D2[再認証・権限確認・Plugin更新<br/>分析継続/送信保留] --> D
  D --> E[S6 文体・ブランド・装飾設定<br/>言い回し学習は任意]
  E --> F{Site種別}
  F -->|新規| G[S2 big keyword方向確認<br/>市場探索]
  F -->|既存| H[S7 GSC接続またはKeyword upload]
  H --> I[S2 GSC/upload/CMS記事統合]
  G --> J[S2 Cluster分析]
  I --> J
  J --> K{Report種別}
  K -->|新規| L[S2 Keyword戦略Report]
  K -->|既存| M[S2 Keyword・Site診断Report]
  L --> N[S1 月次計画→Recommendation]
  M --> N
  N --> O[UJ-05 新規記事制作]
  O --> P[CMS下書き→完成記事承認→公開]
  P --> Q{本システム経由で承認・公開した<br/>新規記事15件到達?}
  Q -->|未達| N
  Q -->|到達| R[S4 自動運用設定<br/>責任範囲・予算・品質・停止条件・同意]
  R --> S[新規記事の個別承認省略を解放]
```

## 6. 管理コンソール全体（UJ-08）

```mermaid
flowchart LR
  subgraph DAILY[日次]
    A1[ADM-S1 運用/アラートack] --> A4[ADM-S4 コスト/乖離/マッチ率] -->|較正| A7[ADM-S7 設定レジストリ<br/>影響プレビュー→承認]
  end
  subgraph CHANGE[変更統制]
    A8[ADM-S8 Pack/辞書/ラベル] --> V[draft→Preview→Validate→Approve→Publish] --> A4
    A2[ADM-S2 課金/価格改定] --> V
    A7 -->|ネットワーク学習提案の承認| V
  end
  subgraph INCIDENT[障害]
    A1 -->|起票| A6[ADM-S6 トレース] --> A10[ADM-S10 Flag/Kill Switch] --> A1
  end
  A9[ADM-S9 期限付き顧客アクセス/オフボーディング] --- A5[ADM-S5 監査ログ]
  A3[ADM-S3 プロバイダ/Canary] --> A4
  A11[ADM-S11 データ保護/DR]
  subgraph SUPPORT[サポート]
    A12[ADM-S12 サポートデスク<br/>キュー/SLA/deflection] -->|FAQ還流起票| A8
    A12 -.->|顧客調査の権限申請導線| A9
  end
```

## 7. 月次プランニング・フロー（UJ-09）

```mermaid
flowchart TD
  A[月初 S1計画案<br/>目的・重点領域・傾向配分・予算・週次枠] --> B{運用方式}
  B -->|手動| C[権限者が差分確認・確定]
  B -->|自動| D[期限まで変更/停止を受付]
  D -->|変更なし| E[自動確定]
  D -->|変更あり| C
  C --> F[Recommendation Queue]
  E --> F
  F --> G[週次 実行予定選択<br/>上限・credit・依存・保護・品質]
  G --> H{週次運用方式}
  H -->|手動| I[一括確認→実行]
  H -->|自動| J[通知→自動実行]
  I --> K[日次 Dashboard判断Loop]
  J --> K
  K --> L[週次 未実行Recommendation再評価<br/>維持/順位変更/監視/失効]
  L --> M[月末 実績・乖離・1/3/6か月評価]
  M --> N[翌月計画案へ反映] --> A
```

補足: 各Sノードは第二階層タブ（画面台帳§5）を持ち、通知・引き継ぎはタブへ直リンクする（2遷移以内の前提）。

## 8. 検証規約

- 各ジャーニー（REQ-UJ-02〜09）のステップ列は本図のパスとして到達可能であること（AC-UJ-02〜09）。
- 終端のないノード（行き止まり）を作らない（REQ-UJ-01）。空状態・完了状態の次アクションは画面台帳§0に従う。
- プロト検証: PT-S（本図の全パスをクリック到達で検証、通知→対処2遷移以内の計測）。
- 遷移ごとに `source screen/tab/filter`、`tenant_id`、`site_id`、対象IDとversion、`correlation_id` を保持し、戻る操作で起点Contextを復元する。
- 入口条件を満たさない場合は別画面へ黙って迂回させず、同一Contextで `権限 / Plan / credit・予算 / CMS・GSC等の接続 / データ / 承認 / 処理中 / 障害` を分離表示し、解消画面と復帰先を示す。
- `screen-inventory` は画面責務、`screen-flow` は正規遷移、`screen-connection-map` は既存プロト実測と追随差分を正本とし、同じ目的で競合する遷移定義を複製しない。
