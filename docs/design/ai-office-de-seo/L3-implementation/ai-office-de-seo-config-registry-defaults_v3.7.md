---
document_id: AOS-L3-CONFIG-REGISTRY-DEFAULTS
title: AI Office de SEO Config Registry初期値台帳 v3.7
version: 3.7
layer: L3
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# AI Office de SEO Config Registry初期値台帳

要求書に「初期値・要調整」として散在する数値を、設定レジストリの初期値として一元登録する台帳である。現行の設定管理正本は`REQ-PAC-07`、Plan／価格は`REQ-BILLING-*`、旧`REQ-BILL-10 / REQ-ADM-09`は詳細移行参照とする。確定済み値は既定値として登録し、`TODO(L3)`は値が未確定であることを明示する占位値であって実行時に受理しない。スコープ上書き: グローバル → プラン → テナント/サイト。

## 1. 登録形式

`{ config_key, value, unit, scope_default, source_req, status(draft/active), effective_from, note }`。version・freeze・監査・影響プレビューは REQ-ADM-09 に従う。

命名は`<domain>.<subject>.<property>[.<qualifier>]`の小文字snake_case segmentとし、値そのもの、Plan表示名、Provider名、model名をkeyへ埋め込まない。単一値は1 key、同じversionで不可分な構造値だけJSON objectとする。許可scopeはkey Catalogに`global / plan / tenant / site`から列挙し、狭いscopeが許可されていないkeyの上書きを拒否する。

## 2. 初期値台帳（出典REQ付き）

### 品質しきい値（REQ-PACK-10）
| config_key | 初期値 | 出典 |
|---|---|---|
| quality.keyword_density.min / max | 0.5% / 3%（中庸1〜2%） | REQ-PACK-10 |
| quality.japanese_readability.mode | advisory（指標選定・人手較正完了までhard gateにしない） | REQ-PACK-10, D-11 |
| quality.competitor_term_coverage.target | 80%（競合3件以上一致） | REQ-PACK-10 |
| quality.original_element_count.min | 1（YMYL・激戦は引き上げ） | REQ-PACK-10 |
| quality.near_duplicate_similarity.max | TODO(L3) | REQ-PACK-10（初期値未定と明示） |
| quality.inter_unit_redundancy.max / term_consistency.min | TODO(L3) | REQ-AGENT-11 |
| adm.pack_rollout.canary_ratio / eval.golden_set_size / eval.regression_threshold / eval.human_sample_size | TODO(L3) | REQ-ADM-10, REQ-DUR-02 |
| pack.writing_method.modifier_max | 2 | REQ-PACK-19 |
| pack.fewshot.token_budget_per_entry | 未較正（OC-05。代表Packの品質・cost測定で確定） | REQ-PACK-12 |
| pack.style_color.token_budget / quality.ai_phrase_density.max | TODO(L3) | REQ-PACK-16, REQ-PACK-09 |
| pack.sim.persona_runs_per_validate.max | 未較正（OC-05） | REQ-PACK-21 |
| pack.sim.article_qa.enabled | false | REQ-PACK-21 |

### 判定ウィンドウ・カニバリ（REQ-KGA-07/08）
| config_key | 初期値 | 出典 |
|---|---|---|
| kga.cannibalization.coverage_overlap | >50% | REQ-KGA-07 |
| kga.cannibalization.traffic_split | ≥30% | REQ-KGA-07 |
| kga.rewrite_window.primary / extended | 3か月 / 6か月 | REQ-KGA-08 |
| kga.gsc_daily_retention | 16か月（GSC保持に整合） | REQ-KGA-08（v3.7.1確定） |
| kga.realtime_retention | 1週間（日次より細かいデータのみ） | REQ-KGA-08 |
| evaluation.checkpoints | 1か月 / 3か月 / 6か月 | REQ-LOGIC-06/08 |
| prediction.unlock.clicks_per_28d | 1,000 click。判定不能な記事は個別にlocked | REQ-LOGIC-07 |
| rewrite.backup.retention.max | 3か月。Site容量上限超過時は古いものから削除 | REQ-DATA-05, REQ-IRG-08 |

### 取得・バッチ（REQ-SRC-05/06/07、REQ-KGA-11）
| config_key | 初期値 | 出典 |
|---|---|---|
| src.batch_priority | P0〜P5の定義 | REQ-SRC-05 |
| src.serp_cache_ttl | 日次〜週次 | REQ-SRC-06 |
| src.news_youtube_ttl | 短TTL（TODO(L3): Source別具体値） | REQ-SRC-06 |
| observation.aio.full_cycle | 月次 | REQ-LOGIC-05, REQ-CAV-03 |
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
| recovery.rpo_target / recovery.rto_target | 1時間 / 4時間（初期内部目標。復元演習で検証） | REQ-IRG-06, REQ-DUR-08 |
| recovery.exercise_interval / overdue_alert | TODO(L3・運用設計で確定) | REQ-DUR-08 |
| inbound.rate（API/ログイン/webhook別） / mail.送信レート・バウンス停止しきい値・リトライ上限 | TODO(L3) | REQ-SEC-15, REQ-PRODUCT-21 |
| heal.フラッピング判定 / 保守周期（ログローテ・DBメンテ） / auth.step_up経過しきい値・招待トークン期限 | TODO(L3) | REQ-DUR-10, REQ-SEC-16 |
| support.sla目安（severity×プラン） / 会話レート・上限 / チケット保持期間 | TODO(L3) | REQ-PRODUCT-22 |
| master.prior.include | false | REQ-PRODUCT-23 |
| master.internal_credit / master.early_flag / showcase.publication_min_samples / showcase.withdrawal_grace | 未較正またはLaunch判断 | REQ-PRODUCT-23 |
| facts.鮮度期限（種別別） / サイズ上限 / ロールアップ周期 | TODO(L3) | REQ-PRODUCT-19 |
| kga.origin.news_trend評価周期 / 鮮度期限 / video面比率しきい値 | TODO(L3) | REQ-KGA-18 |
| kga.value.weights{demand, realizable_ctr, aio_pressure, paid_pressure, domain_credibility_fit, serp_features, intent_cv, fit} / expected_ctr基線パラメータ / aio残差有意しきい値 | TODO(L3)（固定AIO低下率・推測広告費・一般化ドメインパワーは設定しない） | REQ-KGA-17 |
| kga.strategy.profile / weights{site_necessity, traffic_opportunity, conversion_opportunity} / profile_recommend_threshold | TODO(L3・foundation/growth/conversion/authority/balanced別) | REQ-KGA-23 |
| kga.strategy.dynamic_priority.weights{strategic_need, attainable_value, urgency, confidence, cost, risk} / recalc_triggers / stale_after | TODO(L3・実施後効果で較正) | REQ-KGA-23, REQ-PRODUCT-24 |
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
| perf.ui.client_payload_budget | TODO(L3・代表画面で実測) | REQ-SEC-06 |
| perf.ui.initial_api_request_budget | TODO(L3・代表画面で実測) | REQ-SEC-06 |
| perf.db.query_count_budget | TODO(L3・画面/API別に実測) | REQ-SEC-06 |
| perf.db.slow_query_threshold | TODO(L3・負荷試験で確定) | REQ-SEC-06 |
| perf.db.scanned_rows_budget | TODO(L3・代表クエリ別に実測) | REQ-SEC-06 |
| retention.site_storage_budget | TODO(L3・データ群別に定義) | REQ-SEC-06 |

### 記事能力サマリー・レコメンド（REQ-PRODUCT-20/24）
| config_key | 初期値 | 出典 |
|---|---|---|
| summary.digest.max_chars / summary.array.max_items | TODO(L3・保存量と推薦精度を実測) | REQ-PRODUCT-20 |
| summary.freshness.max_age / summary.retry_limit | TODO(L3・記事タイプ別に定義) | REQ-PRODUCT-20 |
| summary.storage.max_bytes_per_article | TODO(L3・代表記事で実測) | REQ-PRODUCT-20, REQ-SEC-06 |
| recommendation.weights.value / urgency / confidence / cost / risk | TODO(L3・説明可能な成分別重み) | REQ-PRODUCT-24 |
| recommendation.stale_after / repeat_suppression_window | TODO(L3・運用結果で較正) | REQ-PRODUCT-24 |
| recommendation.queue.max_items / batch.max_items | TODO(L3・画面性能と変更予算で確定) | REQ-PRODUCT-24, REQ-SEC-06 |

### Semantic Metric・Data Fidelity（REQ-DATA-17／REQ-KRL-11／REQ-BILLING-17／REQ-TECH-21）

| config_key | 初期値 | 出典 |
|---|---|---|
| metric.preaggregation.refresh_interval / stale_after / rebuild_concurrency | TODO(L3・代表MetricのP95と更新遅延を負荷試験で確定) | REQ-TECH-21 |
| metric.preaggregation.max_rows / cache_ttl / partial_release_min_coverage | TODO(L3・Metric／grain別のscan量と表示価値を実測) | REQ-TECH-21, REQ-NFR-03 |
| analytics.migration.scan_rows / ingestion_backlog / storage_bytes / query_p95 / monthly_aws_cost / ops_hours | TODO(L3・version付き移行判定に必要な6 Dimensionを同時記録) | REQ-TECH-21 |
| calibration.minimum_samples / freshness_limit / variance_limit | TODO(L3・global固定。Plan／tenant／Site上書き禁止) | REQ-KRL-11, REQ-DATA-17 |
| calibration.weight_policy_version / fallback_policy_version | TODO(L3・決定論fixtureと匿名cohort検証後にCatalog版を登録) | REQ-KRL-11 |
| entitlement.data_fidelity.coverage / freshness / grain / detailed_retention / recalculation / site_feature_depth / external_acquisition_capacity / searchable_history | TODO(L3・β原価／負荷実測後にPlan Configurationへ登録) | REQ-BILLING-17 |

`calibration.minimum_samples / freshness_limit / variance_limit`は統計的安全条件であり許可Scopeを`global`に固定する。PlanはData Fidelity Entitlementによって観測対象と処理Capacityを増減できるが、これらの条件、Metric Definition、較正weightへ上書き値を持たない。Analytics Store移行は単一閾値で自動実行せず、version付き観測Snapshot、費用差、rollback plan、ADR承認を必要とする。

### 課金・原価（REQ-BILL-06/10）
| config_key | 初期値 | 出典 |
|---|---|---|
| bill.cache_hit_rate.assumed / floor | TODO(L3)（運用データで較正と明示） | REQ-BILL-06 |
| bill.reserve.miss_ceiling_factor | TODO(L3) | REQ-BILL-06 |
| pricing.plan.entry.monthly_fee_jpy_ex_tax | 39,800 | REQ-BILLING-01 |
| pricing.plan.standard.monthly_fee_jpy_ex_tax | 98,000 | REQ-BILLING-01 |
| pricing.plan.premium.monthly_fee_jpy_ex_tax | 198,000 | REQ-BILLING-01 |
| pricing.plan.enterprise.monthly_fee_jpy_ex_tax | 398,000〜（個別見積） | REQ-BILLING-01 |
| pricing.annual.system_fee_discount | 10%（creditは対象外） | REQ-BILLING-02 |
| plan.entry.site_limit / user_limit | 1 / 3 | REQ-BILLING-01 |
| plan.standard.site_limit / user_limit | 3 / 10 | REQ-BILLING-01 |
| plan.premium.site_limit / user_limit | 5 / 30 | REQ-BILLING-01 |
| plan.enterprise.site_limit / user_limit | 個別 | REQ-BILLING-01 |
| entitlement.high_quality_generation | Standard以上。品質に応じcredit消費 | REQ-BILLING-01 |
| entitlement.numeric_prediction | Standard以上かつdata condition成立 | REQ-BILLING-01, REQ-LOGIC-09 |
| entitlement.dedicated_rewrite_backup | Premium以上 | REQ-BILLING-01, REQ-IRG-08 |
| entitlement.generic_webhook_external_api | Premium以上 | REQ-BILLING-01, REQ-INT-09 |
| credit.monthly_grant.expiry | 請求期間末 | REQ-BILLING-03 |
| credit.purchased.expiry_max | 180日 | REQ-BILLING-03 |
| payment.dunning.grace / retry_max | 14日 / 8回（初期値。決済実装時に再検証） | REQ-BILLING-10 |
| trial.cumulative_customer_limit / duration | 10社 / 1〜3か月 | REQ-BILLING-15 |
| bill.credit_products / quality_grade_factors / weekly_generation_limits | TODO(L3・実装後の実原価／負荷計測で確定) | REQ-BILLING-04, REQ-COST-01〜11 |

### 公開・自動運用
| config_key | 初期値 | 出典 |
|---|---|---|
| publication.new_article_approval_unlock_count | 15件（本システム作成・人間承認証拠付き・confirmed `ai_office_publication` Factの新規記事のみ） | REQ-LOGIC-04 |
| publication.rewrite_requires_approval | true | REQ-LOGIC-05 |
| publication.hard_gate_confirmation_steps | 2（同一権限者可＋版付き同意） | REQ-LOGIC-05 |
| automation.default_enabled | false | REQ-LOGIC-04 |

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

## 2.1 未確定keyの横断分類

`TODO(L3)`を要求欠落と運用較正で混同しないため、key familyごとの解消先を固定する。実行環境は`TODO(L3)`、空文字、単位不明値を`active`として登録できない。

| key family | Open Items／L3 Decision | 確定証拠 |
|---|---|---|
| `quality.*`, `pack.*`, `eval.*`, `agent.repair_loop.*` | DD-11〜13、D-11、D-25〜27、OC-05 | 日本語golden set、human評価、precision／recall、Repair収束、原価 |
| `src.*`, `kga.attribute.*`, `kga.match.*`, `kga.longtail.*`, `fanout.*` | D-05、D-12、D-13、D-17、OC-07 | Provider契約、quota、正解set、鮮度、API原価 |
| `kga.topology.*`, `kga.watch.*`, `kga.value.*`, `kga.strategy.*`, `recommendation.*` | OC-06、OC-07 | 1・3・6か月実績、季節性、Market／Share、説明可能性、誤推薦率 |
| `auto.*`, `wpa.*`, `rwr.*`, `cvp.*`, `sched.*` | LB-01、OC-04、OC-06 | CMS負荷、週次上限、変更結果、停止・再開試験 |
| `summary.*`, `facts.*`, `embed.*`, `retention.*` | DD-09、DD-10、D-10、D-14 | 保存量、推薦精度、検索latency、費用、復元試験 |
| `capacity.*`, `perf.*`, `adm.retry_*`, `circuit_breaker` | LB-01、DD-05、DD-06、OC-04、D-08、D-20 | 負荷・障害注入・P95/P99・queue age・費用 |
| `metric.*`, `analytics.migration.*`, `calibration.*`, `entitlement.data_fidelity.*` | D-36、LB-01、DD-05、OC-07 | Metric一致fixture、P95、watermark遅延、scan量、backlog、保存量、AWS費用、運用工数、匿名cohort標本安定性 |
| `recovery.*`, `heal.*` | LB-04、D-21、OC-04 | Restore演習、RPO／RTO、flapping試験 |
| `inbound.*`, `mail.*`, `support.*`, `notif.*`, `auth.*` | D-07、DD-10、D-16、D-31、OC-04 | abuse試験、delivery／bounce、Support運用、Retention、法務review |
| `net.*`, `master.*`, `showcase.*` | OC-08、D-16、D-34 | 再識別risk、標本安定性、同意・撤回、marketing review |
| `bill.*`, `pricing.*`, `plan.*`, `credit.*`, `payment.*`, `trial.*` | LB-01〜03、LB-07、D-15、D-32、OC-01〜03 | 実Job原価、Stripe test、ledger照合、法務・価格承認 |
| `product.export.*`, `announce.*`, `cust.*` | D-16、D-31、OC-04 | Plan policy、法務、画面性能、Support運用 |

個別値が確定したら、対応するDecision／Open Itemの証拠を残し、同じ変更で`TODO(L3)`を値・単位・scope・effective_fromへ置換する。要求本文へ実測値を逆流させず、Policyとして必要な意味だけを要求へ残す。

## 3. 安全不変条件（設定対象外・本レジストリに含めない）

SiteSandboxContext、記事本文非保持、GSC/WPのテナント・サイト境界、Stripe/credit台帳の監査、直接公開の承認・停止制御、Provider APIキー原文非表示（REQ-ADM-09）。許可keyは`config_key_catalog`の外部キー、`mutable=false`、許可scope、value schemaをDBと管理APIの双方で強制する（Data DDL §7）。
