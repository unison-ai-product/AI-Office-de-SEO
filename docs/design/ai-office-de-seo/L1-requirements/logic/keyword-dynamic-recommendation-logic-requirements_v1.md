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

`target_fit / industry_fit / freshness / cost_estimate / execution_risk / content_dependency / content_feasibility / cooldown / summary_coverage / assignment_state / effect_measurement_state`。

`content_feasibility`は、Siteの主目的と想定読者への適合、商品・サービス・一次情報・実務知識等の利用可能な独自材料、読了後に達成させる目的、既存上位との差分、単純要約ではない付加価値を記事として成立させられる度合いとする。材料不足を検索量やLLM生成能力で補ったことにせず、不足項目とユーザーへ依頼する入力を返す。

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

`base = strategic_need × market_realizability × target_fit × industry_fit × content_feasibility`

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
| 市場価値はあるが記事成立性が不足 | `request_input` または `observe` |
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

セカンダリが継続的に強い実績を持つ場合はプライマリとの単純入れ替えを行わない。Siteに設定または推定された複数の2階層「業界／業種」と、対象顧客、共通課題、商品・サービス、地域、ファネル、補足記述からなる横断軸を入力として、同一SERP、intent、co-landing、順位、表示、クリック、CV実績を再集計し、クラスタ境界、代表語、プライマリ／セカンダリ重みを再計算する。

複数業界の配分比率は、ユーザーの優先順、記事数、キーワード、Site実績、横断軸から算出し、ユーザーへ割合入力を要求しない。新規または実績不足のSiteは該当する複数の業界／業種priorを横断軸で調整した初期値を使用し、Site実績の蓄積に応じてSite固有補正の比重を高める。結果は業界別の辞書・算式補正候補として版管理し、Site固有較正と匿名化済み全体較正へ分けて還流する。

Site固有補正は既存割当を直接変更しない範囲で自動適用する。順位悪化リスク、3位以内の保護対象への波及、または補正適用後の順位悪化を検知した場合は補正の自動適用を停止し、影響差分と根拠を持つ承認候補へ切り替える。

記事は主担当の業界／業種を1組、関連分類を複数持つ。推定分類をユーザーが修正した場合は、修正後を正本として固定し、修正差分をキーワード配分、記事分類、Site分析、業界推定の較正データへ戻す。自動推定は確定値を上書きせず、乖離時は変更候補だけを出力する。

複数業界の優先方式は `manual_priority` と `auto_priority` を持つ。手動方式はユーザー指定の優先順を制約とし、自動方式は月次目的、記事充足、キーワード機会、流入、CV、Site実績、横断軸から優先順と配分を算出する。

分類・横断軸変更時は、ユーザー指定予定を維持する。システム自動予約の未実行項目だけを再検証し、目的不一致を `needs_review` へ遷移させる。

業界／業種、横断軸または優先度の変更は増分再計算トリガとする。実行済み施策・確定済み評価は当時のversionを保持し、未実行候補、未確定クラスタ、次回配分だけを再計算する。業界／業種別標本が不足する場合はglobal priorへfallbackし、fallback使用、availability、confidence、次回再評価条件を出力する。

## 10. フィードバック  ［REQ-KRL-10］

採用、編集、保留、却下理由、実施後効果を保存する。入力事実を上書きせず、重みの評価データとして扱う。同じ根拠・同じ条件で却下された候補は抑制期間中に再提示しない。

## 11. 受入条件

- [ ] AC-L1-KRL-01: 市場影響3軸と戦略必要性3軸が独立して算出・保存される。
- [ ] AC-L1-KRL-02: unknownが0扱いされず、availabilityとconfidenceに反映される。
- [ ] AC-L1-KRL-03: strategy mix変更だけで優先順位が再計算され、元の観測値は変わらない。
- [ ] AC-L1-KRL-04: 総合点から各加点・減点と根拠を再現できる。
- [ ] AC-L1-KRL-05: 充足済みキーワードに新規記事を重複推薦しない。
- [ ] AC-L1-KRL-06: 急変・変動中の対象が要監視キューへ分離され、cooldown中、効果測定待ちとともに自動実行対象にならない。
- [ ] AC-L1-KRL-07: 入力更新時に対象グループだけが増分再計算される。
- [ ] AC-L1-KRL-08: recommendationからTicket/Edit Planへ対象・目的・根拠・予算が引き継がれる。
- [ ] AC-L1-KRL-09: UIで6成分と順位変動理由を確認できる。
- [ ] AC-L1-KRL-10: 同条件で却下された候補の反復が抑制される。
- [ ] AC-L1-KRL-11: 検索ボリュームと表示回数の変化から季節性・需要変化を分離し、AIO・リスティング出現率による自然検索面の縮小を記事固有の悪化へ直接帰属させない。
- [ ] AC-L1-KRL-12: プライマリ高々1つと複数セカンダリの割当集合で獲得順位を評価し、順位なしをインデックス診断へ送り、CVなし単体では失敗判定しない。
- [ ] AC-L1-KRL-13: セカンダリ優位時に単純な主従入れ替えを行わず、業界別実績からクラスタ・代表語・主従重みの補正候補を再計算し、版と根拠を追跡できる。
- [ ] AC-L1-KRL-14: 実績不足時は複数の業界／業種priorとユーザー指定の横断軸を使用し、Site実績の蓄積に応じてSite固有補正の比重を高められる。
- [ ] AC-L1-KRL-15: 業界の優先順とSite実績等から配分比率を算出し、未設定時は非保証の業界推定を行い、順位悪化リスクがあるSite固有補正を承認待ちへ切り替えられる。
- [ ] AC-L1-KRL-16: ユーザー修正分類を正本・較正データとして使用し、手動／自動の業界優先方式を選択でき、分類変更時は自動予約の未実行項目だけを再検証できる。
- [ ] AC-L1-KRL-17: 市場価値とは別に記事成立性が評価され、想定読者、Site目的、独自材料、読後目的または既存情報との差分が不足する候補を自動生成へ送らず、追加入力依頼または観測へ振り分けられる。
