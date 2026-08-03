---
document_id: AOS-L3-SCREEN-FLOW
title: AI Office de SEO 画面遷移図 v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-07-05
related: AOS-L1-USER-JOURNEY / AOS-L3-SCREEN-INVENTORY
---

# AI Office de SEO 画面遷移図

ユーザー行動要件（REQ-UJ-01〜09）から導出。ノードは画面台帳のID。**遷移図にない遷移をジャーニーが要求しない／ジャーニーにない行き止まりを作らない**（AC-UJ検証対象）。

## 0. 現行Lifecycle正本（2026-08-03）

以下を現行の最上位画面遷移とする。後続節の旧S3起点フローは、手動起動や既存プロトの履歴としてのみ使用し、本経路を置き換えない。

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
  S1 -->|おすすめ採用| S3
  S2 -->|選択/ギャップ/昇格から起動・プリセット引継| S3
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

## 2. 生成〜公開フロー（UJ-05）

```mermaid
flowchart TD
  A[起点選択 S3<br/>keyword/news/video<br/>※引継時プリセット] --> B{アサイン台帳<br/>プレチェック}
  B -->|assigned済| B2[リライト誘導→UJ-06] 
  B -->|OK| C[実行オプション<br/>今すぐ/おまかせ<br/>鮮度highは今すぐ既定]
  C --> D[Preflight見積<br/>予約] --> E[W5 進捗 13状態<br/>停止/再開/キャンセル]
  E --> F[W3 構成・QA<br/>記事タイプ/見出しフロー表示]
  F -->|hard gate保留| G[対応: 要望追加→再実行<br/>or キャンセル]
  G --> E
  F -->|通過| H[W4 プレビュー承認] -->|承認| I[S4 公開/予約]
  H -->|差し戻し| E
  I --> J[W7 完了通知] --> K[S5 効果追跡]
```

## 3. キーワード戦略→生成フロー（UJ-04）

```mermaid
flowchart TD
  A[S2 マップ] --> B[属性フィルター/価値スコア] --> C[ギャップマトリクス]
  A --> D[手動追加/シード展開/CSV] --> A
  A --> E[昇格キュー/起点別候補<br/>news・video] -->|採用| F[選択→生成起動]
  C -->|未カバー象限| F
  E -->|却下| A
  F -->|単一| G[S3 プリセット引継]
  F -->|複数一括| H[おまかせ投入<br/>Preflight合算]
  A --> I[アサイン整理<br/>付替/分類変更]
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
  A[W9 登録・同意] --> B[S7 顧客組織/サイト作成<br/>Google接続/WP接続]
  B -->|失敗| B2[再認可導線] --> B
  B --> C[S6 文体指定<br/>です・ます/だ・である × 文語/口語<br/>Site言い回し学習 ON=サンプル10本]
  C --> D[S6 ターゲット軸/主張軸]
  D --> E[S2 マップ確認・補充] --> F[S3 初回生成] --> G[W4 承認→公開]
  G --> H{承認済み新規記事<br/>15件到達?}
  H -->|未達| F
  H -->|到達| I[W9 自動公開の責任範囲・予算・品質・停止条件へ同意]
  I --> J[新規記事の自動公開を解放]
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
flowchart LR
  A[S1 プランニングタブ<br/>目標設定] --> B[推奨配分の確認・調整]
  B --> C[S2 トポロジータブ<br/>強化カテゴリ/コア記事/順序確定]
  C --> D[日次: UJ-03ループ＋<br/>S1 変動タブ確認]
  D --> E[週次: 進捗 vs 予測レンジ<br/>→配分微調整]
  E --> F[月末: 実績・乖離要因<br/>plan.monthly_closed通知]
  F -->|翌月へ引き継ぎ| A
```

補足: 各Sノードは第二階層タブ（画面台帳§5）を持ち、通知・引き継ぎはタブへ直リンクする（2遷移以内の前提）。

## 8. 検証規約

- 各ジャーニー（REQ-UJ-02〜09）のステップ列は本図のパスとして到達可能であること（AC-UJ-02〜09）。
- 終端のないノード（行き止まり）を作らない（REQ-UJ-01）。空状態・完了状態の次アクションは画面台帳§0に従う。
- プロト検証: PT-S（本図の全パスをクリック到達で検証、通知→対処2遷移以内の計測）。
