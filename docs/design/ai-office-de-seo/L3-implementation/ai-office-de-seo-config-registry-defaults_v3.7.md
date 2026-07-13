---
document_id: AOS-L3-CONFIG-REGISTRY-DEFAULTS
title: AI Office de SEO Config Registry初期値テンプレート（L3スケルトン） v3.7
version: 3.7
layer: L3
kind: design
status: skeleton
updated_at: 2026-07-05
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO Config Registry初期値テンプレート（L3スケルトン）

要求書に「初期値・要調整」として散在する数値を、設定レジストリの初期値として一元登録する台帳（REQ-BILL-10 / REQ-ADM-09。検証: AC-BILL-07, AC-ADM-06）。値はすべて既定値であり、レジストリの値が優先する。スコープ上書き: グローバル → プラン → テナント/サイト。

## 1. 登録形式

`{ config_key, value, unit, scope_default, source_req, status(draft/active), effective_from, note }`。version・freeze・監査・影響プレビューは REQ-ADM-09 に従う。

## 2. 初期値台帳（出典REQ付き）

### 品質しきい値（REQ-PACK-10）
| config_key | 初期値 | 出典 |
|---|---|---|
| quality.keyword_density.min / max | 0.5% / 3%（中庸1〜2%） | REQ-PACK-10 |
| quality.flesch_reading_ease.target | 60〜70（読者層で調整） | REQ-PACK-10 |
| quality.passive_ratio.max | 10% | REQ-PACK-10 |
| quality.competitor_term_coverage.target | 80%（競合3件以上一致） | REQ-PACK-10 |
| quality.original_element_count.min | 1（YMYL・激戦は引き上げ） | REQ-PACK-10 |
| quality.near_duplicate_similarity.max | TODO(L3) | REQ-PACK-10（初期値未定と明示） |
| quality.inter_unit_redundancy.max / term_consistency.min | TODO(L3) | REQ-AGENT-11 |
| adm.pack_rollout.canary_ratio / eval.golden_set_size / eval.regression_threshold / eval.human_sample_size | TODO(L3) | REQ-ADM-10, REQ-DUR-02 |
| pack.writing_method.modifier_max（既定2）/ pack.fewshot.token_budget_per_entry | TODO(L3) | REQ-PACK-19 |
| pack.style_color.token_budget / quality.ai_phrase_density.max | TODO(L3) | REQ-PACK-16, REQ-PACK-09 |
| pack.sim.persona_runs_per_validate.max / pack.sim.article_qa.enabled（既定off） | TODO(L3) | REQ-PACK-21 |

### 判定ウィンドウ・カニバリ（REQ-KGA-07/08）
| config_key | 初期値 | 出典 |
|---|---|---|
| kga.cannibalization.coverage_overlap | >50% | REQ-KGA-07 |
| kga.cannibalization.traffic_split | ≥30% | REQ-KGA-07 |
| kga.rewrite_window.primary / extended | 3か月 / 6か月 | REQ-KGA-08 |
| kga.gsc_daily_retention | 16か月（GSC保持に整合） | REQ-KGA-08（v3.7.1確定） |
| kga.realtime_retention | 1週間（日次より細かいデータのみ） | REQ-KGA-08 |

### 取得・バッチ（REQ-SRC-05/06/07、REQ-KGA-11）
| config_key | 初期値 | 出典 |
|---|---|---|
| src.batch_priority | P0〜P5の定義 | REQ-SRC-05 |
| src.serp_cache_ttl | 日次〜週次 | REQ-SRC-06 |
| src.news_youtube_aio_ttl | 短TTL（TODO(L3): 具体値） | REQ-SRC-06 |
| src.global_quota.* / fair_share.* / jitter.* | TODO(L3) | REQ-SRC-07（窓・同時実行・重みはL3較正と明示） |
| kga.gsc.dimension_scope / priority | REQ-KGA-11 §11.2の設計 | REQ-KGA-11 |
| kga.attribute.filter_weights / gap_matrix重み | TODO(L3) ※modifier/entity辞書・業界タクソノミ本体はCatalog（REQ-ADM-10管理・版固定）でありレジストリ対象は重み・しきい値のみ | REQ-KGA-13 |
| kga.match.containment_core_token_ratio / co_landing_overlap / serp_verify_click_min・日次予算 / confidence段別重み | TODO(L3) | REQ-KGA-15 |
| kga.longtail.cluster_promote_clicks / promote_impressions / 定常評価周期・優先度 | TODO(L3) | REQ-KGA-16 |
| kga.topology.階層割当規則（規模/語数/intent重み） / リンク再調整の生成条件 | TODO(L3) | REQ-KGA-19 |
| kga.watch.急変しきい値 / 変動保留ガード期間 / 季節検知パラメータ / index検査の日次予算・優先度 | TODO(L3) | REQ-KGA-20, REQ-KGA-21 |
| product.plan.予測レンジ式・重み / wpa.engage.計測既定OFF | TODO(L3) | REQ-PRODUCT-17, REQ-WPA-11 |
| auto.change_budget（日次/週次本数・クレジット） / cooldown期間 / 振動検知条件 | TODO(L3) | REQ-PRODUCT-18 |
| wpa.patch.適用レート・同時数 / rwr.flash.残差しきい値・文字数規約 / cvp.有効期間既定 | TODO(L3) | REQ-WPA-12, REQ-RWR-09, REQ-WPA-13 |
| summary.要旨長上限 / embed.model_version・用途トグル | TODO(L3) | REQ-PRODUCT-20 |
| sched.静穏窓既定 / 窓内オフセット方式 / ノード同時実行上限・キュー水位 | TODO(L3) | REQ-SRC-10 |
| capacity.利用率しきい値（CPU/mem/DB接続/ストレージ/窓消化率） / 密度目標・移行トリガ | TODO(L3・負荷試験で実測） | REQ-DUR-06 |
| recovery.rpo_target / rto_target / 演習周期・未実施アラート | TODO(L3・初期例示から実測で締める） | REQ-DUR-08 |
| inbound.rate（API/ログイン/webhook別） / mail.送信レート・バウンス停止しきい値・リトライ上限 | TODO(L3) | REQ-SEC-15, REQ-PRODUCT-21 |
| heal.フラッピング判定 / 保守周期（ログローテ・DBメンテ） / auth.step_up経過しきい値・招待トークン期限 | TODO(L3) | REQ-DUR-10, REQ-SEC-16 |
| support.sla目安（severity×プラン） / 会話レート・上限 / チケット保持期間 | TODO(L3) | REQ-PRODUCT-22 |
| master.prior算入（既定: 除外） / 内部クレジット付与額 / 先行Flag許可 / showcase.公表最小標本数・撤回時削除猶予 | TODO(L3) | REQ-PRODUCT-23 |
| facts.鮮度期限（種別別） / サイズ上限 / ロールアップ周期 | TODO(L3) | REQ-PRODUCT-19 |
| kga.origin.news_trend評価周期 / 鮮度期限 / video面比率しきい値 | TODO(L3) | REQ-KGA-18 |
| kga.value.weights{demand, realizable_ctr, serp_features, intent_cv, fit} / expected_ctr基線パラメータ / aio残差有意しきい値 | TODO(L3)（固定AIO低下率は設定項目にしない＝自サイト残差で較正） | REQ-KGA-17 |
| net.k_anonymity_threshold / segment_min_samples / prior縮小推定の重み関数 | TODO(L3) | REQ-PRODUCT-13 |
| agent.suspend.max_hold / reserve保持TTL / 一時本文延長上限 | TODO(L3) | REQ-AGENT-10 |
| notif.digest_window / retention / channel既定 / bill.balance_low_threshold | TODO(L3) | REQ-PRODUCT-11, REQ-BILL-02 |
| cust.tier3.plan_gate / default_enabled / strong注意表示 | TODO(L3) | REQ-PRODUCT-12 |
| product.export.row_limit / rate / formats、announce.throttle / 対象既定 | TODO(L3) | REQ-PRODUCT-14, REQ-PRODUCT-16 |
| bill.lane.scheduled係数 / batch_sla目標 / フォールバックポリシー | TODO(L3)（割引実数はCost Table） | REQ-BILL-11 |

### Query Fanout（REQ-SRC-02/09）
| config_key | 初期値 | 出典 |
|---|---|---|
| fanout.stop.max_depth 他停止条件一式 | TODO(L3) | REQ-SRC-02（列挙のみ・値未定） |
| fanout.facet_weights / subquery_count | TODO(L3)（第三者の本数は非公式と明示） | REQ-SRC-09 |

### 性能（REQ-SEC-06）
| config_key | 初期値 | 出典 |
|---|---|---|
| perf.list_initial_p95 | 2秒 | REQ-SEC-06 |
| perf.keyword_map_cached_p95 | 3秒 | REQ-SEC-06 |
| perf.job_submit_p95 | 1秒 | REQ-SEC-06 |

### 課金・原価（REQ-BILL-06/10）
| config_key | 初期値 | 出典 |
|---|---|---|
| bill.cache_hit_rate.assumed / floor | TODO(L3)（運用データで較正と明示） | REQ-BILL-06 |
| bill.reserve.miss_ceiling_factor | TODO(L3) | REQ-BILL-06 |
| bill.plans / credit_packs / grade_factors | TODO(L3)（要求にハードコードしない） | REQ-BILL-10 |

### ループ・停止ガード（REQ-AGENT-06、REQ-ADM-04）
| config_key | 初期値 | 出典 |
|---|---|---|
| agent.repair_loop.max / max_tokens / max_credit / timeout | TODO(L3) | REQ-AGENT-06 |
| adm.retry_limit / circuit_breaker / workflow_max_token | TODO(L3) | REQ-ADM-04 |

### 内部リンク（REQ-KGA-09・第三者ヒューリスティック）
| config_key | 初期値 | 出典 |
|---|---|---|
| link.contextual_per_1000_words | 2〜5本（公式ではない・要調整） | REQ-KGA-09 |
| link.click_depth.max / publish_inbound_links | 3クリック / 2〜3記事 | REQ-KGA-09 |

## 3. 安全不変条件（設定対象外・本レジストリに含めない）

SiteSandboxContext、記事本文非保持、GSC/WPのテナント・サイト境界、Stripe/credit台帳の監査、直接公開の承認・停止制御、Provider APIキー原文非表示（REQ-ADM-09）。TODO(L3): 許可config_keyホワイトリストによる技術的強制。
