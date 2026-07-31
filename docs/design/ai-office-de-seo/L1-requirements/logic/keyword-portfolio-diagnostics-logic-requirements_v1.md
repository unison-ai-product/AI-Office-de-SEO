---
document_id: AOS-L1-LOGIC-KEYWORD-PORTFOLIO-DIAGNOSTICS
title: AI Office de SEO Keyword Portfolio診断ロジック要求 v1.0
version: 1.0
layer: L1
kind: logic_requirements
status: draft
updated_at: 2026-07-31
---

# Query Drift・カニバリ・カバー率ロジック要求

## REQ-KPD-01 入力・正規化

入力はversion固定されたKeyword Group、プライマリ・セカンダリ、同一SERP／intent cluster、記事assignment、GSC query・page・click・impression・position、canonical URL、計測期間、匿名化・切捨て情報である。queryとURLを正規化し、取得不能、匿名化、期間不足、index障害を0件と混同しない。

## REQ-KPD-02 カバー率

登録Keyword Groupのうち、主担当記事がありindex可能な集合の比率を登録カバー率とする。クリック加重カバー率は、観測可能queryをgroupへ決定論matchし、match済みclick合計を観測可能click合計で割る。匿名化・切捨てによる不可視分は分母外として上限を別表示し、100%を全検索需要の完全被覆と表現しない。

## REQ-KPD-03 Query Drift

記事に割り当てたcluster外queryのclick share、impression share、継続期間を算出する。cluster外click shareが30%以上かつ2評価窓継続した場合を `drift_candidate` とし、50%以上かつ主担当clusterのclickが減少している場合を `drift_high` とする。index障害、季節性、AIO・listing面変化、query match confidence不足では確定せず `observe` とする。

## REQ-KPD-04 カニバリ

同一Keyword Groupで複数URLの獲得query集合のJaccard被覆率が50%超、かつ上位2URLへのclick分散で第2URL shareが30%以上の場合を候補とする。canonical違い、pagination、意図の異なるSERP、campaign URLは除外する。候補は統合、主担当再割当、内部link調整、意図分離、observeへ分類し、自動統合しない。

公開前の新規記事またはリライトではGSC実績を待たず、対象clusterと既存記事clusterのSERP上位URL集合の重複、検索意図、主従keyword、既存assignment、記事typeを比較する。SERP重複がrule versionの警告域を超え、同一意図・同一主担当を競合する場合は `cannibal_risk` とし、新規作成の抑制、既存記事への追記、意図分離、主担当再割当を提案する。SERP重複だけで公開を禁止またはカニバリ確定せず、比較対象SERPの取得日時とconfidenceを表示する。

## REQ-KPD-05 confidence・unknown

診断confidenceは期間充足、click母数、query可視率、match confidence、indexability、SERP鮮度から算出する。最低click母数と期間はSite規模別rule versionへ持ち、未達時は `insufficient_data` とする。匿名化率が高い場合は観測可能範囲の結果と構造的上限を併記する。

## REQ-KPD-06 状態・再計算・出力

状態は `healthy / gap / drift_candidate / drift_high / cannibal_candidate / protected / observe / insufficient_data` とする。GSC日次取込、assignment変更、cluster version変更、公開・更新、index状態変更、月次計画で差分再計算する。出力は対象group・URL、式の入力値、判定rule version、confidence、除外理由、推奨operation、次回評価日を返す。

## 境界値・受入条件

- [ ] AC-L1-KPD-01: 匿名化されたqueryを流入0としてカバー率へ算入しない。
- [ ] AC-L1-KPD-02: drift shareが30%未満、または1評価窓だけの場合はdrift確定しない。
- [ ] AC-L1-KPD-03: query被覆率50%以下、または第2URL click share30%未満ではカニバリ候補にしない。
- [ ] AC-L1-KPD-04: index障害・市場変化・低confidence時は記事失敗ではなくobserveまたはinsufficient_dataになる。
- [ ] AC-L1-KPD-05: 判定結果から入力値、除外、rule version、次回評価を再現できる。
