---
document_id: AOS-L1-LOGIC-ARTICLE-SUMMARY-COMPLETENESS
title: AI Office de SEO Article Summary抽出・完全性ロジック要求 v1.0
version: 1.0
layer: L1
kind: logic_requirements
status: draft
updated_at: 2026-07-31
---

# Article Summary抽出・完全性ロジック要求

## REQ-ASUM-01 入力・availability

入力はSite、URL、取得時刻、HTTP状態、canonical、title、meta、見出し階層、本文一時参照、内部・外部link、CTA識別子、構造化data、公開・更新日時、content hash、取得方式・versionである。本文取得不能、部分取得、認証要求、非HTML、サイズ上限超過をavailabilityとして区別し、空本文へ正規化しない。

## REQ-ASUM-02 正規化・抽出

navigation、footer、cookie banner等の共通boilerplateをSite ruleと抽出versionで除外し、見出し順、section要点、対象問い、主張、用語、CTA、内部link、外部根拠、FAQ、表、画像・動画等の存在、イベント発生pointを短い構造化事実へ変換する。引用や数値はsource sectionへ参照可能にし、抽出後の本文全文を恒久保持しない。

## REQ-ASUM-03 完全性判定

必要field集合を記事typeと目的ごとにversion管理する。field `i` の状態を `present=1 / partial=0.5 / absent=0 / unknown=除外`、重みを `w_i` とし、完全性を `sum(w_i × state_i) / sum(availabilityが既知のw_i)` で算出する。unknownをabsentへ変換しない。既知重みが全体の60%未満ならscoreを公開せず `insufficient_input` とする。

必須fieldがabsentの場合は総合scoreにかかわらず `incomplete_required`、必須fieldが既知で全てpresentかpartialかつscore 0.8以上を `usable`、0.6以上0.8未満を `partial`、0.6未満を `incomplete` とする。閾値はarticle type rule versionへ保持し、変更を既存判定へ遡及しない。

## REQ-ASUM-04 不足分類・出力

不足は `content_gap / structure_gap / intent_gap / evidence_gap / conversion_gap / internal_link_gap / extraction_unknown` に分類する。出力はSummary version、content hash、availability、抽出事実、完全性scoreまたはunknown、既知率、必須不足、原因、推薦へ使用可能なfield、再取得条件を返す。抽出不能を記事品質不良と断定しない。

## REQ-ASUM-05 状態遷移・再計算

状態は `queued → fetched → extracted → assessed → usable/partial/incomplete/insufficient_input → stale` とする。content hash、canonical、抽出rule、article type、目的、取得availabilityが変化した場合だけ再計算する。同一hash・同一ruleでは再取得・再解析せず、TTL到達時は外部状態だけ確認して変化がある対象を更新する。

## 境界値・受入条件

- [ ] AC-L1-ASUM-01: 本文取得不能と本文なしを区別し、取得不能を不足score 0として扱わない。
- [ ] AC-L1-ASUM-02: 既知重み59%ではscoreを出さず、60%以上で初めて完全性を算出する。
- [ ] AC-L1-ASUM-03: 必須field欠落時はscore 0.8以上でも `incomplete_required` になる。
- [ ] AC-L1-ASUM-04: 同一content hash・rule versionの再同期で本文再解析を行わない。
- [ ] AC-L1-ASUM-05: Summary生成後に本文一時領域が期限内削除され、抽出事実から不足理由を追跡できる。
