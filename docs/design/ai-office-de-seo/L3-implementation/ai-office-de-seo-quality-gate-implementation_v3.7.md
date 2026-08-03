---
document_id: AOS-L3-QUALITY-GATE-IMPL
title: AI Office de SEO Quality Gate実装・較正設計（L3スケルトン） v3.7
version: 3.7
layer: L3
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO Quality Gate実装・較正設計（L3スケルトン）

REQ-PACK-09の各ゲートを検証実装へ、REQ-PACK-10の計測指標を計測実装＋Config Registry初期値へ確定する。few-shot選定基準とQA合否基準は同一のgate定義を単一ソースとする（REQ-PACK-12。検証: AC-PACK-12）。

本書は`REQ-LOGIC-06・07`、`REQ-NFR-02・05`、`REQ-TECH-10`の現行要求を、詳細正本である`REQ-PACK-*`へ接続する。品質判定は公開責任を製品側へ移すものではなく、hard gate対象も二段階確認と版付き同意を経たユーザーの手動公開を禁止しない。日本語可読性、YMYL、near-duplicate等の未較正値はOpen Items RegisterのDD-11〜13／OC-05へ接続する。

## 1. ゲート実装台帳（hard）

各ゲートについて、計測実装（機械判定・一般システム側、REQ-KGA-08）と、LLM補助判定の要否（エージェント内限定）を確定する。

| gate_key | 主要シグナルの計測実装 | しきい値（Config参照） | true open／較正 |
|---|---|---|---|
| scaled_content_abuse | n-gram重複・near-duplicate類似度、独自要素カウント | near_duplicate_similarity（初期値・要調整） | 類似度アルゴリズム選定（simhash等）と競合セット取得経路 |
| scraping_thin | 外部本文との近似度、付加価値要素の有無 | 同上 | 「本文非保持」制約下での比較方式（hash/シングリング） |
| keyword_stuffing | キーフレーズ密度・不自然反復・配置偏り | 0.5〜3%（健全域、初期値） | 日本語向け分かち書き・類語被覆の扱い |
| deceptive_claim | タイトル・本文一致度、未確定事項の断定検出 | title_body_match | 意味的一致の計測方式（埋め込み類似 or LLM補助） |
| authorship_integrity | 著者・About整合、架空経歴の禁止 | — | 判定に必要なサイト方針データの参照（source.site.*） |
| injected_link_or_hidden | 不自然アンカー・非表示要素の検出 | — | 出力段（slot封入前）での静的検査 |
| site_reputation_fit | Domain Positioningとのトピック整合 | — | 整合度の計測方式 |

hard該当時は通常の自動公開経路を止め、同一の公開権限者による二段階確認と同意記録を要求する。確認後の公開操作はユーザー責任で許可し、システムが恒久的に公開不能へ固定しない（検証: AC-QUALITY-02/05）。

## 2. ゲート実装台帳（advisory / 修飾）

original_value / comprehensiveness / needs_met_intent / title_honesty / eeat_trust / first_hand_experience / production_quality / freshness_honesty / coherence_flow / argument_structure / human_voice、修飾: ymyl_bar / review_depth。

追随実装（v3.7.39〜41追加分）:

| gate_key | 主要シグナルの計測実装 | しきい値（Config参照） | true open／較正 |
|---|---|---|---|
| coherence_flow | Cohesion QA（Semantic Assembly後、装飾前の1パス読み通し・LLM）＋inter_unit_redundancy（ユニット間n-gram冗長度）・term_consistency（用語ロック逸脱率） | quality.inter_unit_redundancy.max / term_consistency.min | n-gram窓幅・用語ロック照合の正規化方式（REQ-AGENT-11） |
| argument_structure | claim_evidence / nuance_qualificationユニット整合・citation_ratio・飛躍/論点先取のLLM検査 | citation_ratio | 論証パターンの判定プロンプトとfew-shot（REQ-PACK-20 academicレンズ） |
| human_voice | AI定型表現辞書の決定論検出（ai_phrase_density）＋参照アンカー対比（gate_tags付き手書き例示・style_color）のLLM検査 | quality.ai_phrase_density.max | 辞書初期構築（D-27）・対比プロンプト・誤検知較正（ゴールデン評価併用、REQ-PACK-09） |

- 計測正本: competitor_term_coverage（目標≥80%・初期値）、日本語向け可読性指標（選定まではadvisory）、original_element_count（最低1・YMYLは引き上げ）、citation_ratio、inter_unit_redundancy / term_consistency / ai_phrase_density（v1.1/v1.2追補、Gate A-5）。
- DD-11／D-11: 日本語可読性指標を検証・選定する。英語向けFlesch値を日本語記事の合否基準として使用しない。選定前はadvisoryとする。
- DD-12: YMYL分類器（健康・安全／金融／行政・社会）のtaxonomyと誤分類時の確認強度を検証する。疑義は警告と二段階確認へ寄せるが、システムが恒久的な公開禁止を決定しない。

検証: AC-QUALITY-04/06/07。

## 3. 較正手順（L3で確定・運用で更新）

- 初期しきい値はすべてConfig Registry（AOS-L3-CONFIG-REGISTRY-DEFAULTS）に登録し、要求書の数値は既定値として扱う（REQ-BILL-10 / REQ-ADM-09）。
- QA実績（どのgateが落ちやすいか）に基づき、few-shot正例/反例とゲートしきい値を同時に更新する（単一ソース、REQ-PACK-12）。
- コンテンツスコアの順位相関は約0.17〜0.28に留まる（網羅の検証であって順位予測ではない）ことを較正判断でも維持し、スコア追従のためにoriginal_value/narrative品質を犠牲にしない（REQ-PACK-10）。
- DD-13: 較正データセットは、Site学習用サンプルや実運用本文を無断で横断転用せず、許諾済み・手書き・公開利用可能な正例／反例と匿名化された判定統計を分離する。hard／advisory区分の変更はCatalog改版、golden regression、人手review、canary、rollbackを必須とする。

## 4. 実行位置

機械計測は一般システム（決定論的）、最終品質判断のLLM部分はQA Executor内に限定（REQ-KGA-08 / REQ-AGENT-08。検証: AC-KGA-07）。QA結果は `schema.snapshot.qa.v1` で返す。Cohesion QA（coherence_flow）はSemantic Assembly後、Presentation Assembly／装飾前のQA工程内パスとして実行し、検品レンズ（REQ-PACK-20）は決定論チェック先行→LLM検査の順でQA Ticketをgate束へ展開する。Persona Simulation（REQ-PACK-21）は記事QAの既定経路に含まれない（Validate/ゴールデン評価の補助・既定off）。
