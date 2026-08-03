---
document_id: AOS-L1-AUTHORIZATION-OPERATION-MATRIX
title: AI Office de SEO 認可・業務操作接続マトリクス v1
version: 1.0
layer: L1
kind: requirements_map
status: draft
updated_at: 2026-08-03
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 認可・業務操作接続マトリクス

## 1. 目的

顧客側基本権限、業務権限、Site Assignment、Agent、Automation、CMS副作用、内部Roleを一つの認可判断へ接続する。本書は新しいRole体系を作らず、`REQ-ORG-03〜07`と`REQ-ACCESS-01〜18`を操作単位で展開する索引である。

## 2. 顧客側の構成

```text
Membership
├─ 基本権限: 契約者 / サイトオーナー / ユーザー
├─ 業務権限: 目標管理 / キーワード・サイト戦略 / 記事制作 / サイト分析
└─ Site Assignment: 指定なし=全Site / 指定あり=指定Siteのみ
```

- 基本権限と業務権限は加算ではなく用途が異なる。基本権限は契約・組織・Site管理、業務権限はSEO業務状態の変更を扱う。
- 契約者またはサイトオーナーであることだけを理由に、記事公開、Keyword戦略変更、分析設定変更を許可しない。
- ユーザーは業務権限がなくても、Site Assignment内のDashboard、Recommendation、記事、Task History、完成済み分析を閲覧できる。
- `Viewer`は作らない。業務権限を持たない`ユーザー`が閲覧専用状態を表現する。
- 旧`Owner / Admin / Editor / Viewer`は現行認可の正本ではない。移行時は操作Permissionへ写像し、旧Role名を直接判定しない。

## 3. 操作マトリクス

凡例: `○`=単独で必要、`＋`=組合せが必要、`—`=付与根拠にしない。すべてSite Assignment、tenant境界、Plan、予算、接続、step-up等の追加条件を別途評価する。

| 操作 | 契約者 | サイトオーナー | ユーザー | 必要な業務権限 | 補足 |
|---|---:|---:|---:|---|---|
| 契約・Plan・請求・追加credit購入・解約 | ○ | — | — | なし | 購入・解約等はstep-up |
| 代表契約者変更 | ○ | — | — | なし | 契約者複数可、代表は1名 |
| 顧客組織・契約者・サイトオーナー付与 | ○ | — | — | なし | サイトオーナーは上位基本権限を付与不可 |
| Site内ユーザー追加・削除、業務権限付与 | ○ | ○ | — | なし | サイトオーナーは担当Site内のみ |
| Site Assignment変更 | ○ | ○ | — | なし | サイトオーナーは担当Siteへの付与だけ。指定全解除は全Site化確認 |
| Site接続・秘密再発行 | ○ | ○ | — | なし | step-up、接続Scope確認 |
| Site予算・credit配賦 | ○ | ○ | — | なし | 契約金額・追加購入は契約者のみ |
| 自動運用Policy作成・停止 | ○ | ○ | — | なし | 委任operation、予算、同意、期限、停止条件を固定 |
| Dashboard・Recommendation・完成済み分析閲覧 | ○ | ○ | ○ | なし | Site Assignment内 |
| Site目的・KPI・月次方針・計画確定 | — | — | ＋ | 目標管理 | 契約者等もタグが必要 |
| Keyword Cluster・配分・推薦方針・Site戦略変更 | — | — | ＋ | キーワード・サイト戦略 | ブランド、商品、顧客、文体・装飾方針の戦略入力を含む |
| 新規記事・リライト・画像・装飾の生成 | — | — | ＋ | 記事制作 | Preflight、credit、保護条件を別判定 |
| 完成記事確認・差し戻し・承認 | — | — | ＋ | 記事制作 | 制作者／検収者の別Roleを要求しない |
| CMS下書き送信・予約・手動公開・既存記事更新 | — | — | ＋ | 記事制作 | CMS write Scopeと公開条件を副作用直前に再判定。初期WordPress Adapterも同じ操作契約を使う |
| 分析条件・比較・評価・Report設定変更 | — | — | ＋ | サイト分析 | 完成済み結果の閲覧とは別 |
| CTA・内部link軽量Patchの採用 | — | — | ＋ | 記事制作 | 戦略条件変更を伴う場合はキーワード・サイト戦略も必要 |
| Recommendationの採用 | — | — | ＋ | 施策に対応する業務権限 | 採用後の実行typeから必要Permissionを解決 |
| Recommendationの保留・除外 | — | — | ＋ | キーワード・サイト戦略 | 個別記事の実行保留だけなら記事制作でも可 |
| Agentへの質問・説明依頼 | ○ | ○ | ○ | なし | 可視範囲内、状態変更なし |
| Agent会話による目標・戦略・記事・分析変更案 | — | — | ＋ | 対応する業務権限 | 会話時とProposal確定時に再判定 |
| Agent Taskの停止・再開 | — | — | ＋ | 起動施策に対応する業務権限 | 他人起動TaskでもSite範囲とoperationを評価 |
| hard gate例外手動公開 | — | — | ＋ | 記事制作 | 二段階確認、版付き同意、step-up、監査。判定は消さない |
| データexport | 条件付き | 条件付き | 条件付き | resource別 | 請求exportは契約者、業務dataはSite可視範囲。内部logは不可 |

## 4. Recommendation・Agent・Automationの判定連鎖

1. Recommendation表示: `read recommendation`をMembershipとSite Assignmentで判定。
2. 採用: Recommendation Typeから必要業務Permissionを解決し、`execute / approve / update`を判定。
3. Intake freeze: 判定に使用したprincipal、Permission、Site Scope、policy versionを参照として保持するが、永続的な権限証明にはしない。
4. job起動: 現在のMembership、Site、Plan、予算、接続、委任を再判定。
5. Agent tool: toolごとにread/write、resource、件数、外部送信先を再判定。
6. CMS下書き／公開: `connect / write_draft / schedule / publish / update_existing`を別actionとして副作用直前に再判定。
7. Automation: 設定者本人のsessionを再利用せず、service principal＋Automation Policy＋現在policyで判定。
8. 評価・学習: Site内学習、匿名全体較正候補、Showcase利用を別Permissionと目的で判定。

## 5. Agent Office

- 通常ビューとOfficeは同じ`AuthorizationDecision`を使う。
- Officeへ入ったこと、Agentに話しかけたこと、設備を開いたことはPermission追加の根拠にならない。
- 質問はread権限内で回答する。状態変更はProposalを作成し、確定時に対象actionを再判定する。
- 複数の変更を含む会話はactionごとに分解し、一部だけ許可される場合は許可・拒否・追加条件を項目別に示す。
- 開発者向け設定、内部trace、Provider payload、秘密情報はOfficeから到達させない。

## 6. 内部Roleとの分離

| 内部Role | 許可 | 顧客側との境界 |
|---|---|---|
| Admin | 内部Role付与、Manager代理権限付与、Platform設定 | 顧客Membershipを兼用しない |
| Manager | Adminが指定した顧客・Site・operation・期限内の運用 | 顧客本人として記録しない |
| Operator | 機微情報を除去したlog、metric、trace閲覧 | 顧客data変更、本文、秘密へアクセス不可 |

通常対応不能な重大incidentだけをbreak-glassへ分離し、内部Roleへ常設全tenant権限を付けない。

## 7. 画面表示

- 権限不足、Plan不足、データ不足、接続不足、予算不足、承認待ち、step-up要求を別理由codeとして表示する。
- 非表示だけでなく、利用価値を理解させる必要がある機能はロック表示できる。ただしAPIは同じPermissionで拒否する。
- 権限設定画面は3基本権限、4業務権限、Site Assignmentだけを顧客へ提示する。低水準Permission、継承、競合規則、内部Roleを表示しない。

## 8. 検証

- 同一操作を通常ビュー、Office、API、worker、Agent tool、Automationから行って同じ判定になる。
- 契約者／サイトオーナーでも業務権限なしではSEO業務状態を変更できない。
- 業務権限があってもSite Assignment外、Plan外、予算外、接続Scope外では実行できない。
- 設定者退会・権限取消・Site移管・Automation期限切れ後は自動副作用が止まる。
- 旧Role名、client申告Role、画面表示状態を認可根拠にできない。

正本: `REQ-ORG-03〜12`、`REQ-ACCESS-01〜18`、`REQ-BILLING-11/14`、`REQ-LOGIC-04`、`REQ-SCREEN-06/08/18`。
