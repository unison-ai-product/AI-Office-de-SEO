---
document_id: AOS-L1-LOGIC-CONTENT-QUALITY-REPAIR-ROUTING
title: AI Office de SEO 品質Gate・Repair・Routingロジック要求 v1.0
version: 1.0
layer: L1
kind: logic_requirements
status: draft
updated_at: 2026-07-31
---

# 品質Gate・Repair・Routingロジック要求

## REQ-CQR-01 入力契約

入力はResearch Brief、Outline Contract、Section Brief、生成成果、source参照、文体・Site rule、対象keyword cluster、CTA・内部link方針、YMYL分類、品質段階、Model Registry version、固定価格内Repair予算、外部availabilityである。freeze済み契約の欠落・version不一致時は検査を開始せず `input_required` とする。

## REQ-CQR-02 Gate分類

検査項目を `hard / required / advisory` に分類する。hardは重大な構造破壊、明確な虚偽・欺瞞、重大YMYL不備、スパム等、requiredはOutline逸脱、根拠不足、重複、文体・表記、内部link・CTA契約違反等、advisoryは改善提案とする。各検査はdetector version、対象section、根拠、confidence、修正可能範囲を返す。

## REQ-CQR-03 限定Repair

Repair対象はfailした検査と依存sectionだけに限定し、freeze済みOutline・ユーザー編集・合格sectionを変更しない。Repair Planは変更対象、禁止範囲、期待する合格条件、最大attemptを持つ。同じ原因・同じ入力で改善しないattemptを反復せず、上限到達前に成立不能と予測した場合は開始しない。

## REQ-CQR-04 Routing

Routingは品質段階、task種別、入力規模、言語、Provider availability、品質実績、latency、原価上限を入力に、version付きModel Registryからrouteを選択する。商品ラベルを実model名に固定せず、fallbackは同一品質・予算・data policyを満たす候補に限定する。route変更はjob内で記録し、結果比較可能にする。

## REQ-CQR-05 状態遷移

状態は `pending → checking → passed / repair_planned / blocked / advisory_only`、Repairは `repairing → rechecking → passed / blocked` とする。hard failは判定を残したまま二段階確認・同意による手動公開経路へ渡せる。required未収束は保留、advisoryだけなら公開判定を阻害しない。

## REQ-CQR-06 Preflight・課金境界

`REQ-LOGIC-11` のPreflightで固定価格内の検査・限定Repairが成立する場合だけ開始する。内部Repair回数で顧客請求を増やさず、ユーザー希望の別成果・全面再生成は新しい有償jobとする。サービス障害による再開は同一job・同一reserveで行う。

## REQ-CQR-07 出力・学習

出力は総合状態、検査別状態、対象section、根拠、detector・route・prompt version、Repair差分、未解消項目、費用実績、公開判定への影響を返す。成功・失敗はSite内較正と、同意・匿名化された全体較正へ使用できるが、ユーザー編集を無断で上書きする学習には使用しない。

## 境界値・受入条件

- [ ] AC-L1-CQR-01: freeze入力欠落またはversion不一致で有償生成・検査を開始しない。
- [ ] AC-L1-CQR-02: Repairがfail section外、ユーザー編集、合格sectionを変更しない。
- [ ] AC-L1-CQR-03: advisoryだけでは公開を停止せず、hard判定は例外公開後も監査に残る。
- [ ] AC-L1-CQR-04: route選択とfallbackをModel Registry version、品質、費用、availabilityから再現できる。
- [ ] AC-L1-CQR-05: 限定Repairと障害再開で二重課金せず、別成果の再生成だけが新規jobになる。
