---
document_id: AOS-L1-NOTIFICATION-RECIPIENT-ROUTING
title: AI Office de SEO 業務通知・受信者解決マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# 業務通知・受信者解決マップ

## 1. 原則

通知を受け取るためだけの「記事担当者」「Task担当者」を必須にしない。業務event、対象tenant／Site、対象Resource、必要操作、発行者、基本権限、業務Permission、Site付与、購読設定から受信者をサーバー側で解決する。

Web内の通知Centerを正本とし、現在画面を開いている適格ユーザーにはpopup／toastを補助表示する。popupを閉じても通知Centerの記録を消さない。email等は補助チャネルである。

## 2. Recipient Resolver

1. eventのtenant／Site／Resource Scopeを確定する。
2. Resourceを閲覧できるMembershipだけを候補にする。
3. 判断・操作を要求するeventは、Authorization Operation Matrixから必要Permissionを解決し、実行可能者を優先する。
4. event発行者またはTask起動者が可視Scope内なら、完了・失敗・停止等の購読候補に含める。
5. ユーザー設定、Site既定、tenant既定、必須通知Policyを合成する。
6. 同一correlation、同一状態、同一受信者の重複を抑止する。
7. 未処理の承認・停止等で実行可能な受信者が0人の場合、対象Siteのサイトオーナーへfallbackする。請求・契約継続は契約者へfallbackする。

fallback通知は権限を付与しない。サイトオーナー自身が対象操作を実行できない場合は、適格者への権限付与、Site付与または別受信者設定の導線を示す。

## 3. 通知class

| class | 例 | recipient basis | OFF可否 |
|---|---|---|---|
| `action_required` | 承認、hard gate、接続再認可、停止解除 | 対象操作を実行できる者＋購読 | in-app完全OFF不可 |
| `continuity` | 支払失敗、権限喪失、Site停止、容量停止 | 契約者／サイトオーナー等の継続判断者 | in-app完全OFF不可 |
| `task_result` | 完了、失敗、再開、取消 | 起動者＋可視Scope・購読者 | OFF／digest可 |
| `recommendation` | 新規推薦、評価、監視変化 | 対応業務Permission・購読 | OFF／digest可 |
| `system_notice` | Plugin更新、メンテナンス、運営告知 | 対象Plan／tenant／Site・購読Policy | 重要度により最低in-app |
| `informational` | 次窓繰延べ、軽微な完了 | 可視Scope・購読 | OFF／digest可 |

顧客向け業務通知と、内部Operator向けalert／incident／security／cost anomalyを同じ受信者解決へ混ぜない。内部alertを顧客通知Centerへ表示しない。

## 4. Channel・状態

channelは`in_app_center / in_app_popup / email`を初期対象とする。将来のchat等はAdapter追加とし、初期要求へ広げない。

通知状態は`unread / read / acknowledged / actioned / archived`を分ける。既読は対応完了を意味しない。対象Resourceの状態が解消しても通知履歴は残し、`actioned`へ関連結果を参照する。

popupはユーザーがログイン中で、対象tenant／Siteを閲覧可能で、event設定が即時かつpopup ONの場合だけ表示する。Dashboardへ単なる完了popupを大量表示せず、同種eventは集約する。

## 5. 設定

- ユーザー単位: event class／type、channel、即時／digest、ON／OFF
- Site既定: Site内の初期購読と必須通知fallback
- tenant既定: 組織全体の初期値
- Platform必須Policy: action required／continuityの最低in-app

上書き順と適用結果を表示し、ユーザーがOFFにしたemailをSite既定で黙って再有効化しない。バウンス抑制は配信状態として表示し、in-app通知へ影響させない。

## 6. 遷移

通知は対象Task、記事、Recommendation、承認、接続、請求等へ直接遷移し、AvailabilityとAuthorizationを遷移先で再判定する。通知を受け取った事実を操作権限として扱わない。通常ビューは要点、Officeは同一通知から関連Task、Agent、原因、履歴、影響を詳細表示する。

## 7. 根拠

`REQ-SCREEN-19`、`REQ-PRODUCT-11/21`、`REQ-ACCESS-14〜16`、Authorization Operation Matrix、UI Availability State Map。

