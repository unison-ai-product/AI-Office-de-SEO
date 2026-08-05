---
document_id: AOS-PRE-L3-CUSTOMER-OUTCOME-UI-VALIDATION
title: 顧客成果・介入別評価・運用還流 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# 顧客成果・介入別評価・運用還流 画面検証仕様

分類別L1と`AOS-L1-CUSTOMER-OUTCOME-METRICS-MAP`を現行要求の正本とし、本書はpre-L3の画面検証入力である。顧客成果、運営側プロダクト指標、内部ロジックsignalを混在させない。

## 1. 目的

公開・更新後の成果をSite全体、カテゴリー／テーマ戦略、記事の三階層で理解し、必要な次のRecommendationへ接続できる画面を検証する。単一の成功率や総合点へ丸めず、SEO本文、CTA／CV、内部リンク、認知の介入別評価、外部変更、市場変化、計測availability、復元availabilityを区別する。

## 2. 表示階層と役割

| 階層 | 通常ビュー | Office詳細 | 主な判断 |
|---|---|---|---|
| Site全体 | S1成果要約 | Site横断比較、根拠、変化要因 | 月次目的・配分を見直すか |
| カテゴリー／テーマ戦略 | S2 Cluster成果 | Keyword、Query、市場、記事配置の横断分析 | どの領域を優先・保護・観測するか |
| 記事 | S5流入・CV／施策評価 | Intervention、Lane、変更履歴、Source、rule version | 継続、改善、復元候補、観測のどれか |

内部DomainではKeyword Clusterを維持するが、顧客向け第一表示は`カテゴリー／テーマ戦略`とする。通常ビューとOfficeは同じCustomer Outcome Projectionを使い、Officeだけ別集計しない。Officeは成果分析を行える玄人向け画面であり、監視専用面に戻さない。

## 3. 介入別Evaluation Lane

| Lane | 起点・周期 | 顧客に見せる内容 | 混ぜてはいけないもの |
|---|---|---|---|
| `seo_content` | confirmed Publication Factの`effective_at`から1・3・6か月 | 割当Keyword、順位段階、表示、click、市場補正、記事目的 | CTA変更だけによるreset |
| `cta_cv` | CTA／CV変更月・累積 | CTA遷移、直接CV、直前ページからのCV到達、母数 | SEO順位だけの成功判定 |
| `internal_link` | link変更月・累積 | graph差分、遷移、link先への接続 | 本文SEO評価時計との統合 |
| `awareness` | 月次・累積 | Cluster充足、表示、指名・brand signal、関連page遷移 | 単一proxyによる因果断定 |

同一Publication Factが複数種類を変更した場合は複数Laneを並べ、記事に単一の評価時計を置かない。公開後は「新規記事」ではなく公開ページとして評価する。Recovery Backupの最長3か月は復元可能期間であり、6か月評価の保持期限ではない。

## 4. 順位・成果分類

顧客向け順位段階は7日移動窓で`圏内到達（50位以内）／上位化（10位以内）／トップ確保（3位以内）`を表示する。100位以内は内部進捗signalであり顧客成果名にしない。`protect`は運用状態として別表示し、トップ確保そのものと同義にしない。下降はhysteresis条件成立後に反映し、単日値で段階を往復させない。

成果分類は決定表の結果を、`施策後に改善／市場変化の影響／評価準備中`へ写像する。外部の実質変更がある場合は`外部変更を含むため評価準備中`、Source不足は不足理由・最終取得・次回評価日を表示する。LLMの自由説明を分類正本にせず、説明を生成する場合もrule result、Source、期間を引用する。

CVなしは単独で失敗表示しない。十分な母数、記事目的、検索インテント、優先CVを併記する。index障害、impression 0、取得欠損は順位0または記事失敗へ変換せず、Site側の確認事項へ接続する。

## 5. 通常ビューと次の行動

通常ビューは成果値の羅列ではなく、`何が変わったか／なぜそう見えるか／次に何を判断するか`を一組で表示する。改善時も自動で同じ施策を量産せず、Site固有補正、次回Recommendation、月次再計画の候補へ渡す。早期悪化は復元候補を提示するが自動復元せず、ユーザーが判断する。

評価結果から生成する次の候補は、元Intervention、評価Lane、rule version、根拠期間へ相関させる。月次計画へ還流するのは未実行Recommendationと次回配分であり、実行済み施策、過去の評価、ユーザー確定分類を遡及変更しない。Site固有補正が順位悪化リスクまたは3位以内の保護対象へ影響する場合は承認候補へ送る。匿名全体較正は同意・匿名化・管理者承認を経る。

## 6. 3秒表示契約

S1成果、S2カテゴリー／テーマ戦略、S5記事評価、Office成果WorkbenchをすべてNavigation・drill downから到達可能にする。集計、GSC取得、外部SERP取得、市場補正、checkpoint評価が処理中でも、標準利用条件P95 3秒以内に前回確定Snapshot、利用可能なLane、部分結果、または理由・最終更新・次回更新を持つ状態を表示する。最新評価完了まで全面spinnerにせず、stale値を最新として偽装しない。

## 7. 検証fixture

| ID | 条件 | 期待表示・操作 | 禁止する実装 |
|---|---|---|---|
| OUT-UI-01 | Site成果を開く | Site要約からカテゴリー／テーマ戦略へ | 記事一覧だけを表示 |
| OUT-UI-02 | 戦略領域を選択 | Cluster内Keyword・記事成果へ | MarketとShareを混合 |
| OUT-UI-03 | 記事を選択 | Intervention別Laneと履歴へ | 単一総合点だけを表示 |
| OUT-UI-04 | Officeで同じ記事を開く | 同じ値＋根拠・比較軸 | Office独自集計 |
| OUT-UI-05 | 100位以内・50位外 | 内部signalだけ | 順位獲得と表示 |
| OUT-UI-06 | 7日平均48位 | 圏内到達 | トップ確保 |
| OUT-UI-07 | 7日平均9位 | 上位化 | 単日の順位を強調 |
| OUT-UI-08 | 7日平均2位 | トップ確保＋別のprotect状態 | 自動的に変更禁止 |
| OUT-UI-09 | 一日だけ4.5位 | hysteresis期間を待つ | 即座にトップ解除 |
| OUT-UI-10 | Publication Factなし | 評価起点未成立 | 予約日から1か月評価 |
| OUT-UI-11 | SEO本文更新 | 1・3・6か月Lane | CTA Laneをreset |
| OUT-UI-12 | CTAだけ変更 | 変更月・累積CV | SEO Laneをreset |
| OUT-UI-13 | 内部link追加 | graph・遷移Lane | 本文リライト成功へ算入 |
| OUT-UI-14 | 認知目的記事 | 認知proxyとavailability | CVなしで失敗 |
| OUT-UI-15 | 同一Factで本文＋CTA変更 | 二つのLane | 一つの評価時計へ統合 |
| OUT-UI-16 | 1か月checkpoint | 早期悪化・異常・観測・復元候補 | 長期成功を確定 |
| OUT-UI-17 | 3か月checkpoint | 中期効果 | Backupが必ず利用可能と表示 |
| OUT-UI-18 | 6か月checkpoint | 持続性評価 | 6か月Backup保持を要求 |
| OUT-UI-19 | Backup削除済み | 評価継続＋復元不可 | 評価履歴を削除 |
| OUT-UI-20 | 市場需要が同方向に減少 | 市場変化の影響 | 記事失敗へ直結 |
| OUT-UI-21 | AIO／listing増・CTR低下 | 市場変化の影響 | AI Office失敗へ直結 |
| OUT-UI-22 | Source不足 | 評価準備中＋不足・次回日 | 0として計算 |
| OUT-UI-23 | materialな外部変更 | 外部変更を含む表示 | AI Office単独成果 |
| OUT-UI-24 | 軽微な装飾変更 | 履歴だけ | 全Laneを評価準備中へ戻す |
| OUT-UI-25 | index障害 | Site側確認事項へ | 順位0・記事失敗 |
| OUT-UI-26 | CV 0・母数不足 | 観測継続 | CTA失敗を確定 |
| OUT-UI-27 | 直前ページからCV到達 | 単ホップの名称で表示 | アシストCV／経路分析 |
| OUT-UI-28 | GA4補助値あり | Sourceを分離 | 自前Trackerへ加算 |
| OUT-UI-29 | 早期悪化 | 復元候補とユーザー判断 | 自動復元 |
| OUT-UI-30 | 改善評価 | Site補正・次回推薦候補 | 過去の割当を自動上書き |
| OUT-UI-31 | 匿名全体較正候補 | 管理者承認待ち | 即時全Siteへ適用 |
| OUT-UI-32 | 結果から月次再計画 | 未実行分・次回配分だけ更新 | 実行済み施策を変更 |
| OUT-UI-33 | 評価集計が10分 | 3秒以内に前回値＋更新中 | 10分間全面spinner |
| OUT-UI-34 | 初回評価前 | checkpoint・必要Source・予定日 | 成果ページを隠す |

## 8. Finding記録

検証結果は`SF-UI-11`へ記録する。意味変更は`REQ-BUS-10`、`REQ-LOGIC-06/09/13/14`、`REQ-MEASURE-02/13/14`、Customer Outcome Metrics Map、`INV-OUTCOME-001〜003`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
