---
document_id: AOS-L1-LOGIC-KEYWORD-RECOMMENDATION
title: AI Office de SEO キーワード動的レコメンド・ロジック要求 v1.0
version: 1.0
layer: L1
kind: logic_requirements
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO キーワード動的レコメンド・ロジック要求

## 1. 目的  ［REQ-KRL-01］

キーワードの優先順位を検索ボリュームだけで固定せず、市場影響とサイト戦略上の必要性を分離して計算し、新規記事、リライト、統合、内部リンク、保護、観測、見送りを動的にレコメンドする。

ロジックはLLMの自由判断にしない。観測値、ArticleSummary、Keyword Map、GSC、CV、サイトトポロジー、設定レジストリを入力とする決定論ロジックとする。

## 2. 入力契約  ［REQ-KRL-02］

各入力値は `value / availability / observed_at / source_ref / confidence` を持つ。

### 2.1 市場影響

| キー | 定義 | 範囲 |
|---|---|---|
| `aio_pressure` | AIO出現、上部占有、被引用、自サイトCTR残差による自然クリック抑制 | 0〜1 / unknown |
| `paid_pressure` | リスティング、ショッピング、ローカル広告等の上部占有 | 0〜1 / unknown |
| `domain_credibility_gap` | 当該意図で必要な信用性と自サイト現在値との差 | 0〜1 / unknown |
| `search_volume_delta` | 対象キーワード群の検索ボリューム変化率。季節性・需要変化の観測に使用 | -1〜1 / unknown |
| `impression_delta` | 同一期間のGSC表示回数変化率 | -1〜1 / unknown |

`domain_credibility_gap` は単一の外部ドメインスコアだけで確定しない。トピック被覆、ArticleSummary品質、GSC実績、被リンク・ブランド/entity観測、著者・運営・根拠・更新性、YMYL近接を成分として持つ。

### 2.2 戦略必要性

| キー | 定義 | 範囲 |
|---|---|---|
| `site_necessity` | 商品・カテゴリ・課題・サイト構造・信用形成に必要 | 0〜1 |
| `traffic_need` | 実現可能な検索流入の増加に必要 | 0〜1 |
| `conversion_need` | CV導線・商用意図・ファネル欠損の解消に必要 | 0〜1 |

### 2.3 補助入力

`target_fit / industry_fit / freshness / cost_estimate / execution_risk / content_dependency / cooldown / summary_coverage / assignment_state / effect_measurement_state`。

## 3. 前処理  ［REQ-KRL-03］

1. キーワードを正規化し、同一SERP/intentクラスタへ集約する。
2. ArticleSummaryとAssignment Ledgerから既存記事の充足、担当、重複、保護を取得する。
3. GSC・CVは判定期間と欠損状態を適用する。
4. AIO・広告面は地域・device・取得日時を揃える。AIOは週次または鮮度期限到達時の観測を基本とし、短期間の変動を追って反復取得しない。
5. 全成分を0〜1へ正規化する。
6. `unknown` を0へ置換しない。利用可能成分だけで暫定計算しconfidenceを下げる。
7. 順位・表示・クリック減少時は、検索ボリューム変化率とGSC表示回数変化率の同方向性・変化量を比較し、季節性または需要変化の寄与を算出する。
8. AIO出現率・リスティング出現率が高い、または上昇している期間は自然検索面の縮小寄与を算出し、記事固有の悪化から分離する。

記事への割当は既存のKeyword Map／Assignment Ledgerを正本とし、主担当キーワードグループの代表語をプライマリ、高々1つ、同一SERP／intentクラスタ内の関連語・ロングテール・PAA・言い換えをセカンダリ、複数として扱う。公開後の獲得評価はこの割当集合との一致を判定し、無関係な偶発流入語だけで成功としない。セカンダリ3〜5件程度は一般的な観測目安であり、固定しきい値にはしない。

## 4. 市場実現性  ［REQ-KRL-04］

初期算式:

`market_penalty = wa × aio_pressure + wp × paid_pressure + wd × domain_credibility_gap`

`market_realizability = clamp(1 - market_penalty, floor, 1)`

- `wa/wp/wd/floor` はConfig Registryで版管理する。
- 3成分は合成後も個別に保存する。
- 1成分が高いだけで候補を削除しない。
- unknownがある場合は推定値と観測済み値を区別する。

## 5. 戦略配分  ［REQ-KRL-05］

サイト単位で `strategy_mix{site, traffic, conversion}` を持ち、合計を1とする。

`strategic_need = site_necessity × mix.site + traffic_need × mix.traffic + conversion_need × mix.conversion`

推奨mixは、サイトトポロジー被覆、GSC流入、CV実績、月次目標から算出する。自動確定せず、ユーザーが採用・調整する。

## 6. 動的優先度  ［REQ-KRL-06］

初期算式:

`base = strategic_need × market_realizability × target_fit × industry_fit`

`dynamic_priority = clamp(base × freshness_adjustment + dependency_bonus - cost_penalty - risk_penalty, 0, 1)`

`cost_penalty` は `REQ-COST-04/07` のexpected costとcost confidenceから算出し、本書内にProvider単価や固定金額を重複定義しない。

保存するもの:

- 各入力成分
- strategy mix
- 加点・減点
- 算式version
- dynamic priority
- confidence
- calculated_at
- next_recalc_at

単一の総合点だけを保存してはならない。

## 7. 行動決定  ［REQ-KRL-07］

| 条件 | 第一候補 |
|---|---|
| 未充足かつ既存担当なし | `create_new` |
| 担当記事あり・不足/意図ずれ/鮮度低下 | `rewrite` |
| 複数記事が同一意図を競合 | `merge_or_canonicalize` |
| 内容充足・リンク不足 | `internal_link` |
| 好調・変更リスク高 | `protect` |
| データ不足・変動中・効果測定待ち | `observe` |
| 充足済み・価値低・追加不要 | `do_nothing` |

決定前に重複、保護、cooldown、変更予算、SERP変動、stale、effect measurement stateを検査する。

## 8. レコメンド出力  ［REQ-KRL-08］

recommendation itemは次を持つ。

- keyword group / target article
- actionと代替action
- dynamic priorityと各成分
- 「サイトに必要・流入に必要・CVに必要」
- 「AI検索の影響・広告の強さ・信用性との距離」
- なぜ今か、何を変えるか、見送る場合
- cost、risk、confidence、freshness
- evidence refs
- formula version
- stale/expiry条件
- Ticket/Edit Planへの引き継ぎ値

## 9. 再計算  ［REQ-KRL-09］

対象グループだけを増分再計算する。

トリガ:

- GSC/CV更新。ただし急変は通常候補へ直接投入せず要監視キューへ送る
- 週次のAIO/広告/SERP構成再評価または鮮度期限到達
- ArticleSummary更新
- Assignment/Topology更新
- 新規公開、リライト、統合、リンク、CTA実施
- 効果測定完了、cooldown終了、季節到来
- strategy mix、辞書、算式version変更

算式・辞書・mixの全体改版時のみ全件バッチを許可する。

順位、SERP、表示、クリック等の急変は再計算要求として記録するが、施策を即時推薦しない。要監視キューでは週次に観測値だけを更新し、1か月・3か月・6か月周期の正式評価によって通常候補へ戻すか判断する。急変をAIO即時再取得のトリガにしない。

公開ページの効果評価では、観測変化から季節性・需要変化寄与とAIO・リスティング市場圧力寄与を控除し、残差だけを記事固有変化として扱う。入力不足または寄与分離のconfidence不足時は記事固有の成功・悪化を確定しない。

プライマリ＋セカンダリの割当集合に順位が付かない場合は `rewrite` へ直接送らず、`index_diagnostic` を第一候補とする。診断はnoindex、canonical、robots、公開状態、サイトマップ、クロール等の観測結果とユーザーが確認すべき内容を返す。本システムはサイト構築・サイト全体設定の管理を責務としないため自動修復せず、ユーザーエスカレーションで終端する。将来対応は別versionの要求・Permissionとして扱う。CVなしは単独で異常または失敗に分類せず、十分なクリック母数がある場合だけCVR評価へ進める。

セカンダリが継続的に強い実績を持つ場合はプライマリとの単純入れ替えを行わない。Siteに設定された複数の2階層「業界／業種」と、ユーザーが明記した横断軸を入力として、同一SERP、intent、co-landing、順位、表示、クリック、CV実績を再集計し、クラスタ境界、代表語、プライマリ／セカンダリ重みを再計算する。新規または実績不足のSiteは該当する複数の業界／業種priorを横断軸で調整した初期値を使用し、Site実績の蓄積に応じてSite固有補正の比重を高める。結果は業界別の辞書・算式補正候補として版管理し、Site固有較正と匿名化済み全体較正へ分けて還流する。

## 10. フィードバック  ［REQ-KRL-10］

採用、編集、保留、却下理由、実施後効果を保存する。入力事実を上書きせず、重みの評価データとして扱う。同じ根拠・同じ条件で却下された候補は抑制期間中に再提示しない。

## 11. 受入条件

- [ ] AC-KRL-01: 市場影響3軸と戦略必要性3軸が独立して算出・保存される。
- [ ] AC-KRL-02: unknownが0扱いされず、availabilityとconfidenceに反映される。
- [ ] AC-KRL-03: strategy mix変更だけで優先順位が再計算され、元の観測値は変わらない。
- [ ] AC-KRL-04: 総合点から各加点・減点と根拠を再現できる。
- [ ] AC-KRL-05: 充足済みキーワードに新規記事を重複推薦しない。
- [ ] AC-KRL-06: 急変・変動中の対象が要監視キューへ分離され、cooldown中、効果測定待ちとともに自動実行対象にならない。
- [ ] AC-KRL-07: 入力更新時に対象グループだけが増分再計算される。
- [ ] AC-KRL-08: recommendationからTicket/Edit Planへ対象・目的・根拠・予算が引き継がれる。
- [ ] AC-KRL-09: UIで6成分と順位変動理由を確認できる。
- [ ] AC-KRL-10: 同条件で却下された候補の反復が抑制される。
- [ ] AC-KRL-11: 検索ボリュームと表示回数の変化から季節性・需要変化を分離し、AIO・リスティング出現率による自然検索面の縮小を記事固有の悪化へ直接帰属させない。
- [ ] AC-KRL-12: プライマリ高々1つと複数セカンダリの割当集合で獲得順位を評価し、順位なしをインデックス診断へ送り、CVなし単体では失敗判定しない。
- [ ] AC-KRL-13: セカンダリ優位時に単純な主従入れ替えを行わず、業界別実績からクラスタ・代表語・主従重みの補正候補を再計算し、版と根拠を追跡できる。
- [ ] AC-KRL-14: 実績不足時は複数の業界／業種priorとユーザー指定の横断軸を使用し、Site実績の蓄積に応じてSite固有補正の比重を高められる。
