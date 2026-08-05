import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const designRoot = path.join(repoRoot, "docs", "design", "ai-office-de-seo");
const l1Root = path.join(designRoot, "L1-requirements");
const tracePath = path.join(l1Root, "ai-office-de-seo-acceptance-trace_v3.7.md");
const manifestPath = path.join(repoRoot, "manifest.json");

function markdownFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(target));
    else if (entry.name.endsWith(".md")) files.push(target);
  }
  return files;
}

function fail(errors, message) {
  errors.push(message);
}

const allDocuments = markdownFiles(designRoot);
const reqDefinitions = new Map();
const duplicateRequirements = [];

for (const file of allDocuments) {
  const text = fs.readFileSync(file, "utf8");
  const patterns = [
    /^#{2,6}\s+(REQ-[A-Z0-9-]+(?:\.\d+)?)\b/gm,
    /^#{2,6}[^\r\n]*［(REQ-[A-Z0-9-]+(?:\.\d+)?)］[ \t]*$/gm,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (reqDefinitions.has(match[1]) && reqDefinitions.get(match[1]) !== file) {
        duplicateRequirements.push(
          `${match[1]}: ${path.relative(repoRoot, reqDefinitions.get(match[1]))} / ${path.relative(repoRoot, file)}`,
        );
      } else {
        reqDefinitions.set(match[1], file);
      }
    }
  }
}

const canonicalSources = [
  ...markdownFiles(path.join(l1Root, "categories")),
  ...markdownFiles(path.join(l1Root, "logic")),
];
const sourceAcceptance = new Map();
const duplicateAcceptance = [];

for (const file of canonicalSources) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/^- \[ \] (AC-L1-[A-Z0-9-]+): (.+)$/gm)) {
    if (sourceAcceptance.has(match[1])) {
      duplicateAcceptance.push(match[1]);
    }
    sourceAcceptance.set(match[1], { text: match[2], file });
  }
}

const traceText = fs.readFileSync(tracePath, "utf8");
const traceAcceptance = new Map();
const coveredRequirements = new Set();
const errors = [];

function assertIncludes(relativePath, requiredFragments) {
  const absolutePath = path.join(repoRoot, relativePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  for (const fragment of requiredFragments) {
    if (!text.includes(fragment)) fail(errors, `${relativePath}: missing current-policy fragment: ${fragment}`);
  }
}

function assertExcludes(relativePath, forbiddenFragments) {
  const absolutePath = path.join(repoRoot, relativePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  for (const fragment of forbiddenFragments) {
    if (text.includes(fragment)) fail(errors, `${relativePath}: stale operative fragment remains: ${fragment}`);
  }
}

// Cross-document decisions are owned by DDD bounded contexts. The domain
// registry is the single source of truth for aggregate invariants, canonical
// sources, contradiction patterns, and positive/negative fixtures.
const invariantRegistryPath = path.join(
  designRoot,
  "L2-domain",
  "ai-office-de-seo-domain-invariant-registry_v1.json",
);
const invariantRegistry = JSON.parse(fs.readFileSync(invariantRegistryPath, "utf8"));
const boundedContextKeys = new Set();
const invariantIds = new Set();
const requirementPrefixOwners = new Map();
const requirementIdOwners = new Map();
for (const context of invariantRegistry.bounded_contexts) {
  if (boundedContextKeys.has(context.context_key)) {
    fail(errors, `domain invariant registry: duplicate bounded context ${context.context_key}`);
  }
  boundedContextKeys.add(context.context_key);
  if (!context.aggregate_root) fail(errors, `domain invariant registry: ${context.context_key} has no aggregate root`);
  for (const prefix of context.owned_requirement_prefixes ?? []) {
    if (requirementPrefixOwners.has(prefix)) {
      fail(
        errors,
        `domain invariant registry: REQ-${prefix}-* is owned by both ${requirementPrefixOwners.get(prefix)} and ${context.context_key}`,
      );
    } else {
      requirementPrefixOwners.set(prefix, context.context_key);
    }
  }
  for (const reqId of context.owned_requirement_ids ?? []) {
    if (!reqDefinitions.has(reqId)) {
      fail(errors, `domain invariant registry: ${context.context_key} owns undefined requirement ${reqId}`);
    } else if (requirementIdOwners.has(reqId)) {
      fail(
        errors,
        `domain invariant registry: ${reqId} is owned by both ${requirementIdOwners.get(reqId)} and ${context.context_key}`,
      );
    } else {
      requirementIdOwners.set(reqId, context.context_key);
    }
  }
  for (const reqId of context.owner_requirements ?? []) {
    if (!reqDefinitions.has(reqId)) {
      fail(errors, `domain invariant registry: ${context.context_key} references undefined owner ${reqId}`);
    }
  }
  for (const invariant of context.invariants ?? []) {
    if (invariantIds.has(invariant.invariant_id)) {
      fail(errors, `domain invariant registry: duplicate invariant ${invariant.invariant_id}`);
    }
    invariantIds.add(invariant.invariant_id);
    if (!(invariant.bad_fixtures?.length > 0) || !(invariant.good_fixtures?.length > 0)) {
      fail(errors, `domain invariant registry: ${invariant.invariant_id} requires bad and good fixtures`);
    }
    for (const relativePath of invariant.canonical_sources ?? []) {
      if (!fs.existsSync(path.join(repoRoot, relativePath))) {
        fail(errors, `domain invariant registry: ${invariant.invariant_id} missing source ${relativePath}`);
      }
    }
  }
}
for (const reqId of reqDefinitions.keys()) {
  const prefix = reqId.match(/^REQ-([A-Z0-9]+)-/)?.[1];
  const exactOwner = requirementIdOwners.get(reqId);
  const prefixOwner = prefix ? requirementPrefixOwners.get(prefix) : undefined;
  if (exactOwner && prefixOwner && exactOwner !== prefixOwner) {
    fail(errors, `domain invariant registry: ${reqId} has conflicting exact and prefix owners`);
  } else if (!exactOwner && !prefixOwner) {
    fail(errors, `domain invariant registry: ${reqId} has no owning bounded context`);
  }
}
for (const [prefix, contextKey] of requirementPrefixOwners) {
  if (![...reqDefinitions.keys()].some((reqId) => reqId.startsWith(`REQ-${prefix}-`))) {
    fail(errors, `domain invariant registry: ${contextKey} owns unused prefix REQ-${prefix}-*`);
  }
}
const semanticPolicyRules = invariantRegistry.bounded_contexts.flatMap((context) =>
  context.invariants.map((invariant) => ({
    id: `${context.context_key}/${invariant.invariant_id}`,
    aggregateRoot: context.aggregate_root,
    files: invariant.canonical_sources,
    forbidden: invariant.forbidden_patterns.map((pattern) => new RegExp(pattern, "i")),
    badFixtures: invariant.bad_fixtures,
    goodFixtures: invariant.good_fixtures,
  })),
);
const negativeFixtureCount = semanticPolicyRules.reduce(
  (count, rule) => count + rule.badFixtures.length,
  0,
);

function paragraphUnits(text) {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

for (const rule of semanticPolicyRules) {
  for (const [index, fixture] of rule.badFixtures.entries()) {
    const detected = rule.forbidden.some((pattern) => pattern.test(fixture));
    if (!detected) fail(errors, `policy detector ${rule.id}: bad fixture ${index + 1} was not detected`);
  }
  for (const [index, fixture] of rule.goodFixtures.entries()) {
    const falselyDetected = rule.forbidden.some((pattern) => pattern.test(fixture));
    if (falselyDetected) fail(errors, `policy detector ${rule.id}: good fixture ${index + 1} was rejected`);
  }
  for (const relativePath of rule.files) {
    const text = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
    for (const paragraph of paragraphUnits(text)) {
      const matched = rule.forbidden.find((pattern) => pattern.test(paragraph));
      if (matched) {
        fail(errors, `${relativePath}: domain invariant conflict ${rule.id} (${rule.aggregateRoot}): ${matched}`);
        break;
      }
    }
  }
}
const tracePattern =
  /^- \[ \] (AC-L1-[A-Z0-9-]+): ([^\r\n]*?) ｜ 検証: ([^\r\n]*?) ｜ 正本: `([^`\r\n]+)`$/gm;

for (const match of traceText.matchAll(tracePattern)) {
  const [, id, text, rawRefs, canonicalPath] = match;
  if (traceAcceptance.has(id)) fail(errors, `duplicate trace AC: ${id}`);
  const refs = rawRefs.split(/\s*,\s*/);
  for (const reqId of refs) {
    if (!reqDefinitions.has(reqId)) fail(errors, `${id}: undefined requirement ${reqId}`);
    coveredRequirements.add(reqId);
  }
  const resolvedCanonicalPath = path.resolve(l1Root, canonicalPath);
  if (!fs.existsSync(resolvedCanonicalPath)) {
    fail(errors, `${id}: missing canonical path ${canonicalPath}`);
  }
  traceAcceptance.set(id, { text, refs, canonicalPath });
}

for (const match of traceText.matchAll(
  /^- \[ \] (AC-(?!L1-)[A-Z0-9-]+): [^\r\n]*? ｜ 検証: ([^｜\r\n]+)$/gm,
)) {
  const [, id, rawRefs] = match;
  if (traceAcceptance.has(id)) fail(errors, `duplicate trace AC: ${id}`);
  const refs = [...rawRefs.matchAll(/REQ-[A-Z0-9-]+(?:\.\d+)?/g)].map((item) => item[0]);
  for (const reqId of refs) {
    if (!reqDefinitions.has(reqId)) fail(errors, `${id}: undefined requirement ${reqId}`);
    coveredRequirements.add(reqId);
  }
  traceAcceptance.set(id, { text: "", refs, canonicalPath: "" });
}

for (const item of duplicateRequirements) fail(errors, `duplicate REQ: ${item}`);
for (const id of duplicateAcceptance) fail(errors, `duplicate source AC: ${id}`);

for (const [id, source] of sourceAcceptance) {
  const trace = traceAcceptance.get(id);
  if (!trace) {
    fail(errors, `${id}: missing from acceptance trace`);
    continue;
  }
  if (trace.text !== source.text) fail(errors, `${id}: source/trace text mismatch`);
  const expectedPath = path.relative(l1Root, source.file).replaceAll("\\", "/");
  if (trace.canonicalPath !== expectedPath) {
    fail(errors, `${id}: canonical path mismatch (${trace.canonicalPath} != ${expectedPath})`);
  }
}

for (const id of traceAcceptance.keys()) {
  if (id.startsWith("AC-L1-") && !sourceAcceptance.has(id)) {
    fail(errors, `${id}: trace entry has no canonical source AC`);
  }
}

for (const reqId of reqDefinitions.keys()) {
  if (!coveredRequirements.has(reqId)) fail(errors, `${reqId}: no acceptance condition verifies this requirement`);
}

// ID consistency alone cannot detect a document that still states a superseded
// product decision. Keep the small set of cross-cutting, already-decided
// invariants executable here; historical prototype ledgers are intentionally
// excluded because they preserve old values as migration evidence.
assertIncludes("docs/design/ai-office-de-seo/L0-charter/ai-office-de-seo-business-requirements_v1.md", [
  "Entry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜",
  "Entry／Standardは月契約または年契約、Premium／Enterpriseは年契約",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/customer-organization-governance-requirements_v1.md", [
  "`基本権限`: 契約者、サイトオーナー、ユーザーの3種類",
  "`目標管理`",
  "`キーワード・サイト戦略`",
  "`記事制作`",
  "`サイト分析`",
  "指定がないMembershipは契約組織内の現在および将来の全Site",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/business-requirements_v1.md", [
  "新規Site経路",
  "既存Site経路",
  "既存Site診断レポート: 市場全体とclusterを起点",
  "新規記事が15件に達するまでは個別承認",
  "1か月後の一次評価、3か月後の二次評価、6か月後の長期評価",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/logic-requirements_v1.md", [
  "既存記事とリライトを15件へ算入しない",
  "公開記事への更新はユーザー承認を必須",
  "同一権限者が対象、警告、未解消項目、責任境界を二段階で確認",
  "急変を検知した場合、その変化だけを根拠として新規記事またはリライトを即時推薦してはならない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/integration-requirements_v1.md", [
  "CMS非依存のPublication Contract",
  "WordPressは初期Adapter",
  "ページ表示、遷移元・遷移先、明示CTA・button識別子、指定サンクスページ到達",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/billing-accounting-requirements_v1.md", [
  "| Entry | 39,800円 | 43,780円 |",
  "| Premium | 198,000円 | 217,800円 | セルフ申込・年契約のみ |",
  "追加購入分は購入から180日を上限",
  "ユーザー非公開のOutput Vault staging",
  "read-after-write",
  "同一DB transactionで確定",
  "提供済み事実、Generation Outcome、commitを取消す理由ではなく",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/design-experience-requirements_v1.md", [
  "初回ログインと日常業務の正規入口は通常ビュー",
  "玄人向けの詳細分析",
  "選択式ポップアップと決定論Service",
  "必要な場合だけLLMを呼ぶ",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/README.md", [
  "L1要求整理 → L2業務・ドメイン整理 → 通常ビュー／Officeビューの画面・遷移・fixture検証 → 発見差分をL1/L2へ反映 → L3実装詳細確定",
  "L3のAPI、DDL、Event、Config、採用技術を画面検証前に最終凍結しない",
  "画面側を暫定L3へ無理に合わせず",
]);
assertIncludes("docs/plans/PLAN-L3-02-ai-office-de-seo-screen-prototype.md", [
  "lifecycle_stage: pre_l3_ui_validation",
  "画面検証の結果を制約する凍結仕様ではない",
  "画面検証結果をL1/L2へ反映した後にL3実装設計",
  "ai-office-de-seo-recommendation-ui-validation_v1.md",
  "ai-office-de-seo-standard-office-ui-validation_v1.md",
  "ai-office-de-seo-site-onboarding-ui-validation_v1.md",
  "ai-office-de-seo-keyword-report-ui-validation_v1.md",
]);
assertExcludes("docs/plans/PLAN-L3-02-ai-office-de-seo-screen-prototype.md", [
  "requires:\n    - PLAN-L3-01-ai-office-de-seo-implementation-design",
  "要求・L2/L3契約・画面遷移の整合監査後に開始",
]);
assertIncludes("docs/plans/PLAN-L3-01-ai-office-de-seo-implementation-design.md", [
  "PLAN-L3-02-ai-office-de-seo-screen-prototype",
  "画面検証未了の領域をL3確定済みと表示しない",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-handoff-gate_v3.7.md", [
  "画面検証の開始をL3詳細確定でブロックしない",
  "画面findingをL1/L2へ反映",
  "この時点で実装用versionを固定",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/GATE-A-README.md", [
  "画面検証前の暫定baseline",
  "L3全体の確定を開始条件にしない",
]);
assertIncludes("docs/reference/ai-office-de-seo-artifact-alignment-ledger_2026-08-03.md", [
  "L1→L2→画面検証→L1/L2差分反映→L3確定",
  "L3確定前に要求差分を発見",
]);
assertIncludes("docs/reference/ai-office-de-seo-prototype-modernization-register_2026-08-03.md", [
  "pre-L3実装突合",
  "visual_unverified",
  "PROTO-21",
  "PROTO-22",
  "PROTO-23",
  "PROTO-24",
  "PROTO-25",
  "SF-UI-01",
  "SF-UI-02",
  "SF-UI-03",
  "SF-UI-04",
  "SF-UI-05",
  "SF-UI-06",
  "validated`とL1/L2反映なしにL3確定へ送らない",
  "AOS-PRE-L3-RECOMMENDATION-UI-VALIDATION",
  "AOS-PRE-L3-STANDARD-OFFICE-UI-VALIDATION",
  "AOS-PRE-L3-SITE-ONBOARDING-UI-VALIDATION",
  "AOS-PRE-L3-KEYWORD-REPORT-UI-VALIDATION",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-recommendation-ui-validation_v1.md", [
  "lifecycle_stage: pre_l3_ui_validation",
  "本書はL3実装詳細ではない",
  "採用は施策を実行候補として確定する行為であり、実行開始そのものではない",
  "accepted / accepted_with_edit",
  "Decisionとfreeze済みIntakeを同時成立",
  "条件が揃い、現在の運用設定で実行可能なら、不要な再確認Modalを挟まず",
  "Officeは監視専用ではない",
  "決定論的な選択操作ではLLM呼出しが0回",
  "REC-UI-01 ready paid",
  "REC-UI-12 context roundtrip",
  "validated → reflected_to_l1_l2 → ready_for_l3",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-office-ui-requirements_v3.7.md", [
  "Recommendation Decisionを正本",
  "Decision、Intake、採用率の正本にしない",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-standard-office-ui-validation_v1.md", [
  "lifecycle_stage: pre_l3_ui_validation",
  "通常ビューは、SEOに詳しくない利用者がRecommendationに沿って主要業務を少ない操作で完了する正規入口",
  "Office独自の業務正本、認可、変更Command、成果計算を作らない",
  "Officeを成果分析から排除せず",
  "対象直結型（第一検証案）",
  "Officeハブ経由型（比較案）",
  "すぐ確認",
  "詳しく見る",
  "相談・高度操作",
  "定型操作はLLM呼出し0回",
  "VIEW-UI-01 Recommendation往復",
  "VIEW-UI-14 Graph欠損",
  "ブラウザ操作前は`open`",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-requirements_v3.7.md", [
  "GSCまたはキーワード登録のいずれか",
  "全接続を直列必須にしない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/screen-operation-requirements_v1.md", [
  "Site設定・対象Site確認",
  "部分利用可",
  "対象Site確認」をCMS write成立の意味で使わず",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-site-onboarding-ui-validation_v1.md", [
  "lifecycle_stage: pre_l3_ui_validation",
  "GSCまたはKeyword登録の少なくとも一方",
  "CMS write未成立でも分析、Report、Recommendation、生成を止めず",
  "GSC実績だけで本文変更を推測しない",
  "業務Step＋並行準備Tray（第一検証案）",
  "利用可能機能カード型（比較案）",
  "四状態を合算した保存値または単一Gateにしない",
  "ONB-UI-01 新規・接続最小",
  "ONB-UI-15 CMS非対応",
  "ブラウザ操作前は`open`",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-keyword-market-share-connection-map_v1.md", [
  "カテゴリー／テーマ戦略上の投影",
  "CMS category、slug、階層と1対1を前提にしない",
]);
assertIncludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-model_v3.7.md", [
  "Site固有のカテゴリー／テーマ戦略",
  "公共ClusterやCMS categoryと1対1を前提にしない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/business-requirements_v1.md", [
  "カテゴリー／テーマ戦略単位として扱う",
  "カテゴリー／テーマ戦略とWordPress等のCMS categoryを1対1に固定せず",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-keyword-report-ui-validation_v1.md", [
  "lifecycle_stage: pre_l3_ui_validation",
  "Site Clusterは、どのカテゴリー／テーマ領域をSiteで持ち",
  "Observed、Estimated、Article Shareを一つの「シェア率」へ合算しない",
  "判断Story＋Cluster Explorer（第一検証案）",
  "Cluster Matrix起点（比較案）",
  "AIO観測不可を0%と表示せず",
  "recommendation_feedback`をCluster分類、除外、優先度変更の正本にしない",
  "KWR-UI-01 新規実績なし",
  "KWR-UI-19 カテゴリー／テーマ配置",
  "ブラウザ操作前は`open`",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md", [
  "採用/条件付き採用/保留/除外をversion付きRecommendation Decisionへ記録",
  "feedbackは既読・UI分析補助に限定",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-keyword-gsc-article-map-requirements_v3.7.md", [
  "対象Site Keyword／Cluster versionへのユーザー調整",
  "recommendation_feedback`を分類・除外の正本にしない",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md", [
  "PT-UX-01",
  "PT-UX-02",
  "PT-UX-03",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md", [
  "非公開Output Vault stagingのupload",
  "同一DB transactionで成立した後だけ`generation.job_completed`",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-data-ddl_v3.7.md", [
  "`output_vault_provisions`",
  "Outcome確定前にユーザー取得用署名URLを発行しない",
  "同一transactionで作成",
  "`output_vault_availability`",
  "期限削除でOutcomeまたはcommit Ledgerをupdate／deleteせず",
  "`effective_time_source`",
  "予約、Command、API受付、Webhook受信、検証終了時刻からの代入を禁止",
  "`site_activations`",
  "`approved_new_article_fact_memberships`",
  "`product_loop_completions`",
  "派生Consumerの失敗・再送はFactを更新せず",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md", [
  "PT-GEN-OUTCOME-02",
  "PT-GEN-OUTCOME-03",
  "PT-GEN-OUTCOME-04",
  "PT-PUB-01",
  "PT-PUB-02",
  "PT-PUB-03",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/measurement-operations-requirements_v1.md", [
  "署名検証済みCMS変更eventの発生時刻",
  "最初の確認済み観測時刻を`estimated`",
  "`site.activated`はSiteごとに最初の条件適合Factから一度だけ",
  "`Publication Fact × Intervention version × lane type`",
  "派生処理失敗はFactを巻き戻さず再開",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-connection-map_v1.md", [
  "下書き作成を「公開」とは呼ばない",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-connection-map_v1.md", [
  "WordPressへ「登録（公開）」",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/categories/design-experience-requirements_v1.md", [
  "Office独自の業務正本",
  "定型操作でもLLMを毎回呼ぶ",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/non-functional-requirements_v1.md", [
  "本番配置はAWSを前提",
  "単一task、単一AZ、特定の実行形へ不可逆に密結合しない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/screen-operation-requirements_v1.md", [
  "Entryの自動投稿はロック対象にせず",
  "Entryの数値予測は上位機能Preview",
  "開発管理画面または開発者Consoleとして扱わない",
  "Agent Office専門分析・詳細運用",
  "選択式ポップアップを先に表示",
  "玄人向けに詳細分析・操作できる",
  "公開／更新の反映を確認しました",
  "確認できた時刻（推定）",
  "時刻Sourceの選択や内部再照合経路を一般ユーザーの設定項目にしない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-business-metrics-map_v1.md", [
  "Publication Factの`effective_at`は外部反映時刻",
  "`Fact × Intervention version × lane type`",
  "派生失敗時はFactを巻き戻さず再開",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/logic-requirements_v1.md", [
  "`schema.execution.admission.v1`としてPreflight判定",
  "Preflight結果でfreeze済みIntakeを書き換えない",
  "ready Admissionを一度consumeしてからdispatchする",
  "複数Actionの一括操作も個別Admissionを保持",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/measurement-operations-requirements_v1.md", [
  "site.setup_completed → cms.connection_profile_verified → site.first_recommendation_presented",
  "operation別`delivery_ready`または書込み可能を意味しない",
  "`recommendation.presented`によってDecision Eligibility付きversionをQueueへ判断可能に公開",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/categories/screen-operation-requirements_v1.md", [
  "自由文をそのままDomain Commandへ渡す",
]);
assertIncludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-model_v3.7.md", [
  "`candidate → proposed → presented`を提示前の主経路",
  "`accepted* → dispatched → executing → completed → evaluating → learned`だけが実行経路",
  "`excluded / expired`は当該versionの終端",
  "採用は実行開始ではない",
  "ExecutionAdmission（Recommendation Planning Process Manager）",
  "有償Actionはreserve完了前にreadyまたはdispatchしない",
  "consumeと正規Action dispatchを同じoutbox境界で確定する",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md", [
  "schema.recommendation.presentation.v1",
  "schema.recommendation.decision.v1",
  "Recommendation type、target、主Objective、Keyword Cluster、Action route等の意味境界",
  "同一transaction／transactional outbox",
  "schema.execution.admission.v1",
  "requested|evaluating|reservation_pending|ready|held|rejected|expired|consumed|superseded",
  "Provider有償呼出し、外部write、Agent Job、Patch適用",
  "`admission_id + admission_version + estimate_version`",
  "schema.site.build_progress.v1",
  "content_read_ready{state, article_scope_ref, eligible_article_count",
  "delivery_ready[]{operation, state, connection_profile_version",
  "接続Profile確認済みであることを送信可能へ読み替えない",
  "schema.plan.monthly.v1",
  "schema.publication.decision.v1",
  "schema.publication.job.v1",
  "schema.publication.fact.v1",
  "PublicationJob.state=verified",
  "transactional outbox",
  "schema.evaluation.intervention.v1",
  "lane_type(seo_content|cta_cv|internal_link|awareness)",
  "記事に単一の評価時計を持たせず",
  "Recovery Backupの最長3か月は復元可能期間",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md", [
  "Credit reserveはAgent有無に依存しない`admission_id + admission_version + estimate_version`",
  "生成credit commitは`generation_outcome_id`",
  "checkpoint再開で新しいreserve／commitを作らず",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md", [
  "reserve/commitは`ticket_id`単位",
]);
assertIncludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md", [
  "CMS種別には依存しない。初期の書込AdapterはWordPressを対象とする",
  "Evaluation Lane",
  "`seo_content`は1／3／6か月",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md", [
  "Site導入",
  "Keyword戦略Report",
  "Recommendation Intake freeze",
  "1・3・6か月",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md", [
  "新規記事の自動公開設定",
  "新規記事15件まで解放進捗",
  "同一権限者の二段階確認＋版付き同意",
  "Agent Officeはエージェントの実行状況を見ながら成果、Keyword、記事、根拠、条件、設定、Taskを玄人向けに詳細分析・操作する面",
  "定型操作は選択式、自由文は必要時だけLLM",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md", [
  "公開前承認「必須・変更不可」→既定OFFの任意設定",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-billing-credit-provider-requirements_v3.7.md", [
  "月額付与クレジットは翌月まで繰越可能",
  "最低契約6か月",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-development-unit-roadmap_v3.7.md", [
  "初期=単一VPS",
  "VPS段階はCompose相当",
  "アプリ内ヘルプ・FAQ。専用サイト構築で対応する",
  "オンボーディングはコンサルティングとして提供し、そこで価格を取る",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-user-journey-requirements_v3.7.md", [
  "対象Role: Editor以上",
]);
assertExcludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md", [
  "1サイト=1プランに伴い",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-config-registry-defaults_v3.7.md", [
  "quality.passive_ratio.max",
  "flesch_reading_ease",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-config-registry-defaults_v3.7.md", [
  "<domain>.<subject>.<property>[.<qualifier>]",
  "pack.writing_method.modifier_max | 2",
  "pack.sim.article_qa.enabled | false",
  "## 2.1 未確定keyの横断分類",
  "実行環境は`TODO(L3)`、空文字、単位不明値を`active`として登録できない",
]);
assertIncludes("docs/reference/FEATURE-LIST.md", [
  "現在は447 REQを監査対象",
  "Site接続→業界Big Keyword探索",
  "Agent Officeは実Task・Agent・工程を見ながら、Keyword、Recommendation、記事、成果、設定、Taskを玄人向けに詳細分析・操作する",
  "Entry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-requirements-decision-summary_v1.md", [
  "未確定事項の全件台帳ではない",
  "ai-office-de-seo-open-items-register_2026-08-03.md",
  "ここにないことを「確定済み」の根拠にしない",
  "Agent Officeは実行中Task、担当Agent、工程、待機、完了、失敗を見守りながら、成果のSite／Cluster／記事詳細",
]);
assertIncludes("docs/design/ai-office-de-seo/L0-charter/ai-office-de-seo-business-requirements_v1.md", [
  "CMS下書き・投稿",
  "初期提供・主検証CMSはWordPress",
  "`Blocker / High / Medium`は2026-07-13に矛盾を発見した時点の影響度",
  "Open Items Register",
  "BR-DEC-012 | Resolved | 解約時クレジット",
  "BR-DEC-019 | Resolved | 予約額",
  "BR-DEC-025 | Resolved | 請求方式",
]);
assertIncludes("docs/reference/ai-office-de-seo-content-consistency-audit_2026-07-09.md", [
  "履歴スナップショット",
]);
assertIncludes("docs/reference/ai-office-de-seo-prototype-modernization-register_2026-08-03.md", [
  "Office専門分析・微調整",
  "通常ビューのRecommendation、成果、Keyword、記事、設定、TaskからContextを維持して入り",
  "監視専用面にはしない",
]);
assertExcludes("docs/reference/ai-office-de-seo-prototype-modernization-register_2026-08-03.md", [
  "Office監視:",
]);
assertIncludes("docs/reference/ai-office-de-seo-view-sync-audit_2026-07-09.md", [
  "履歴スナップショット",
]);
assertIncludes("docs/reference/ai-office-de-seo-requirements-review_2026-07-31.md", [
  "履歴スナップショット",
]);
assertIncludes("docs/reference/ai-office-de-seo-full-requirements-gap-audit_2026-08-03.md", [
  "監査時点スナップショット",
]);
assertIncludes("docs/reference/ai-office-de-seo-reference-notes_v3.7.md", [
  "数を合わせるためにAgentや部屋を作らない",
  "Agent Officeの部屋数は固定しない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-requirements-map_v1.md", [
  "6名称は責務Catalogであり、LLM Agentの体数ではない",
  "13ペルソナを13個の常駐LLMまたは13種類の専用modelとして実装しない",
  "キャラクターとExecutorの1対1表を別途作らない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-office-ui-requirements_v3.7.md", [
  "軽い確認・微調整から高度な分析・運用まで",
  "定型操作は選択式ポップアップから決定論Service",
  "初期構成（確定）: 部屋7",
  "製品要求はReact等の特定フレームワークへ固定せず",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-office-ui-requirements_v3.7.md", [
  "Personaごとの専用LLMを必須",
  "Office独自の業務正本",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md", [
  "これはLLM Agentの個体数、model数、常駐process数またはOfficeペルソナ数を表す一覧ではない",
  "同じExecutor種別を複数Ticketが並列利用できる",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-ui-parts-catalog_v1.md", [
  "本実装（React）のコンポーネント分割の正本",
  "そのままReactコンポーネント名にする",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-office-ui-requirements_v3.7.md", [
  "React/HTML/CSS で描画する",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-navigation-ui-requirements_v3.7.md", [
  "成果、根拠、条件、配分、設定、Taskを玄人向けに詳細分析・操作する",
  "製品要求はReact等の特定フレームワークへ固定せず",
  "初期リリースはdesktop標準",
  "後続versionではAgent Office Chatをmobileの主導線",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-customer-outcome-metrics-map_v1.md", [
  "Site全体・簡単表示 | S1 サマリー",
  "Keyword Cluster・標準表示 | S2",
  "記事・標準表示 | S5",
  "Office詳細分析",
  "圏内到達",
  "上位化",
  "トップ確保",
  "直前ページからのCV到達",
  "介入別Evaluation Lane",
  "`cta_cv`",
  "Recovery Backupの最長3か月は復元availability",
  "Plan差は成果判定機能の有無ではなく",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-customer-outcome-metrics-map_v1.md", [
  "100位以内＝順位獲得",
  "名称は「アシストCV」",
  "複数ページ経路を保存する",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/measurement-operations-requirements_v1.md", [
  "REQ-MEASURE-14 顧客成果指標",
  "Thin Plugin署名付きWebhook",
  "7日移動窓",
  "施策後に改善／市場変化の影響／評価準備中",
  "単ホップ集計",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/cost-requirements_v1.md", [
  "成果補正用SERP／AIO／listing",
  "Plan差は機能ON／OFFではなく",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-user-journey-requirements_v3.7.md", [
  "セルフ導入を標準",
  "新規Site経路: 業界／業種",
  "既存Site経路: GSCを接続するかKeyword",
  "認証済みREST APIと対象投稿typeの下書き作成権限",
  "本文・見出し・公開状態を取得できた記事だけを対象",
  "GSCまたはKeyword実績だけから本文変更を推測しない",
  "再入力させずIntakeへ渡す",
  "Keyword／clusterを需要Market",
  "Articleを獲得Share",
  "確定Reportを当月目的",
  "未実行Recommendationは週次／月次に単純繰越せず",
  "本文途中停止を有効にした場合は本文Preview",
  "Semantic Assembly後にW3でCohesionを含むQuality Gate",
  "Presentation Assemblyで装飾、アイキャッチ、CTA、内部link配置、CMS形式変換",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-user-journey-requirements_v3.7.md", [
  "Site運用責任者（コンサル同席",
  "リライトRecommendationはGSCまたはCMS記事取込",
  "リライト起動→WP下書き",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md", [
  "導入完了<br/>Recommendationの採否判断へ",
  "最初の新規15記事の承認と自動運用解放は導入完了条件ではなく",
  "分析開始とCMS書込Capabilityを同一Gateにしない",
  "CMS REST API等のwrite接続は、導入時に設定できるがKeyword分析の直列必須工程にはしない",
  "CMS送信を伴うRecommendationだけ`connection_required`で保留する",
  "通常ビュー ⇄ Office",
  "顧客面 → 内部管理面",
  "本文途中停止設定",
  "本文Preview・見出し/本文編集",
  "Presentation Assembly<br/>装飾・アイキャッチ・CTA/内部link配置",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md", [
  "S7 CMS REST API接続<br/>Capability診断",
]);
assertIncludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md", [
  "日常判断の簡単操作面",
  "玄人向け詳細分析・運用・Agent操作面",
  "業務正本、認可、Command、成果計算をOfficeへ複製しない",
]);
assertExcludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md", [
  "全操作・意思決定はこちら",
  "実行状況の確認基盤（見守る・深堀り）",
  "スクロール絶対禁止",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-ui-parts-catalog_v1.md", [
  "旧モックの「1ページ=1対象・scroll禁止」は視覚baseline",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-ui-parts-catalog_v1.md", [
  "1ページ=1キーワード/1記事/1監視対象・スクロール禁止",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-data-ddl_v3.7.md", [
  "cms_content_ref",
  "cms_capability_snapshots",
  "content_output_schemas",
  "CMS edit／preview URL",
  "`cms_patch_jobs`",
  "publication_fact_projections",
  "Fact正本をSearch Performanceへ複製所有しない",
  "publication_facts（外部post、canonical URL、effect kind",
  "evaluation_lanes",
  "Search Performanceは観測Projectionを提供するだけ",
  "Recovery Backupの最長3か月と評価保持を同一TTLへ結合しない",
  "site_readiness_states / site_readiness_transitions",
  "recommendation_presentations",
  "recommendation_decisions",
  "採用Decisionだけ、またはIntakeだけが存在するcommitを禁止する",
  "意味境界を変える編集は`accepted_with_edit`にせず`manual_intakes`",
  "execution_admissions",
  "execution_admission_transitions",
  "二重Consumerによる二重Job／Patchを防ぐ",
  "Ticketのない非Agent Actionへ架空Ticketを作らず",
  "credit_reservations",
  "scope_kind(site/analysis_version/article/operation)",
  "重複boolean列を置かない",
  "該当operationだけを失効させる",
  "共通table名・共通列・業務eventをWordPressへ固定しない",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-data-ddl_v3.7.md", [
  "`wp_patch_jobs`（",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/gate-a-1-event-envelope_v1.md", [
  "wp.patch_conflict_detected",
  "publish.published | wp_url",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/gate-a-1-event-envelope_v1.md", [
  "publication.fact_recorded | publication_fact_id",
  "publication.job_verification_pending",
  "site.setup_completed | site_id",
  "site.readiness_changed | site_id",
  "`content_read_ready`は`scope_kind=article`",
  "`delivery_ready`は`scope_kind=operation`かつ`operation`必須",
  "古いeventでcurrent projectionを巻き戻さない",
  "cms.connection_profile_verified | connection_profile_id",
  "site.first_recommendation_presented | site_id",
  "recommendation.presented | recommendation_id",
  "recommendation.decision_recorded | recommendation_id",
  "requires_agent_job=false",
  "旧`recommendation.accepted`は`recommendation.decision_recorded(result=accepted)`",
  "execution.admission_requested | admission_id",
  "execution.admission_ready | admission_id",
  "execution.admission_consumed | admission_id",
  "reservation_id, admission_ref, estimate_ref, billing_subject_ref",
  "未consume、期限切れ、heldのAdmissionからProvider呼出し",
  "site.activated | activation_id",
  "product.loop_completed | loop_completion_id",
  "seo_content_lane_ref",
  "lane_type(seo_content/cta_cv/internal_link/awareness)",
  "patch.action_conflicted",
  '"principal_kind": {"enum": ["customer_user", "internal_user", "service", "ai_executor", "system"]}',
  '"acting_context"',
  "顧客本人へactorを書き換えない",
  "generation.stage_phase_entered",
  "generation.stage_phase_completed",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md", [
  "`content_read_ready`を記事単位",
  "`delivery_ready`をoperation単位",
  "保存された単一`connected` boolを正本にしない",
  "Recommendation再生成やGeneration Outcome再生成を要求しない",
  "Intake → Execution Admission → 正規Action",
  "Admissionを一度consumeし",
  "Task HistoryはJobを持つActionだけ表示",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md", [
  "PT-CMS-07",
  "delivery_ready.create_draft=ready",
  "delivery_ready.update_post=held",
  "PT-CMS-08",
  "対象operationを副作用直前に再判定できる",
  "PT-REC-07",
  "PT-REC-08",
  "PT-REC-09",
  "accepted DecisionとRecommendation Intakeが同時に存在",
  "PT-ADMIS-01",
  "PT-ADMIS-02",
  "PT-ADMIS-03",
  "Batch合計だけをreserve正本にしない",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/gate-a-1-event-envelope_v1.md", [
  '"type": {"enum": ["user", "system", "agent"]}',
  "| recommendation.accepted |",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-business-metrics-map_v1.md", [
  "site.setup_completed",
  "cms.connection_profile_verified",
  "site.first_recommendation_presented",
  "書込み可能を意味せず、`delivery_ready`はoperation別に判定する",
  "成果生成を失敗扱いにせずDeliveryだけを保留する",
  "`recommendation.decision_recorded.result`",
  "`recommendation.presented`でDecision Eligibility",
  "ブラウザ閲覧回数は使わない",
  "手動／自動判断は同一定義で別系列",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-business-metrics-map_v1.md", [
  "`site_setup_completed`",
  "`cms_connection_verified`",
  "`first_recommendation_presented`",
  "`adopted` または `adopted_with_edit`",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md", [
  "Recommendation Intakeまたは手動指定を共通Preflightへ渡す",
  "接続中CMSの保存値を編集・更新の外部正本",
  "他CMSへ固定した共通画面名・列・状態を作らない",
  "任意の本文途中Preview・ユーザー編集保護",
  "Semantic Assembly / Cohesionを含むQA・限定Repair / Presentation Assembly",
  "CMS接続Capability",
  "cms_capability_snapshot",
  "content_read_ready`は記事coverage",
  "delivery_ready`はoperation別Capability",
  "Recommendation提示・判断",
  "Decision Eligibilityをfreezeした`presented` version",
  "`recommendation_feedback`は既読、click、UI改善等の分析補助",
  "Preflight保留を「Recommendationが不採用になった」と表示しない",
  "ClientまたはLLMが実行可能性・残高を再計算しない",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md", [
  "| S4 | オートメーション | WP接続",
  "| wp_capability_snapshot、approval_requests",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-requirements_v3.7.md", [
  "CMS edit／Preview URL（初期WordPress AdapterではWP下書きURL）",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md", [
  "Presentation Assembly / Generation Outcome",
  "Self Evolution / Semantic Assembly",
  "Meaning Unit Writing → Semantic Assembly → QA／限定Repair Loop → Presentation Assembly／Placement → Generation Outcome → CMS Delivery／Approval",
  "Generation Outcome参照 → CMS Capability・出力形式検証 → CMS下書き送信 → 承認／委任条件判定",
  "presentation_assemble → decorate → featured_image → placement → cms_validate → deliverable_provided",
  "共通WorkflowをWordPress固有画面へ固定しない",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md", [
  "Meaning Unit Writing → QA → Repair Loop → Assembly",
  "WP下書き・投稿形式チェック・予約・公開/CVイベント",
  "Assembly / Placement / CMS Draft",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md", [
  "generation_outcome → cms_delivery_approval",
  "Meaning Unitの`semantic_assembly`",
  "初期画像Scopeはアイキャッチだけ",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-data-ddl_v3.7.md", [
  "`generation_stage_phases`",
  "presentation_assemble / decorate / featured_image / placement / cms_validate / deliverable_provided",
  "cms_prepare / cms_deliver / cms_verify / preview / approval_or_automation",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/gate-a-2-repository-scope-api_v1.md", [
  "resolveCustomerScope",
  "resolveDelegatedScope",
  "Site Assignment 0件=全Site",
  "Operatorには`resolveDelegatedScope`を許可しない",
  "authorization epoch更新後の旧Scope→拒否",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-requirements-map_v1.md", [
  "`CmsPlacementInstruction`",
  "共通InstructionのWP固定",
  "Semantic Assembly → QA",
  "Presentation Assembly／Placement",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-requirements-map_v1.md", [
  "`WPBlockPlacementInstruction`",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/office_layout.initial.json", [
  '"cms_draft"',
]);
assertExcludes("docs/design/ai-office-de-seo/L3-implementation/gate-a/office_layout.initial.json", [
  '"wp_draft"',
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-quality-gate-implementation_v3.7.md", [
  "Semantic Assembly後、装飾前",
  "Presentation Assembly／装飾前",
]);
assertIncludes("docs/reference/ai-office-de-seo-artifact-alignment-ledger_2026-08-03.md", [
  "Keyword分析開始とCMS write Capabilityを分離",
  "acting principalを顧客本人へ書き換えない",
  "QA前のSemantic AssemblyとQA後のPresentation Assembly",
  "真のLaunch blocker `LB-08`",
]);
assertIncludes("docs/reference/ai-office-de-seo-open-items-register_2026-08-03.md", [
  "LB-08 | 現行価格・契約・Plan構成・原価仮説に基づく財務モデル再生成",
  "製品要求・Price Catalogの正本にはしない",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-acceptance-trace_v3.7.md", [
  "同意→接続→サンプル学習→戦略入力→マップ→初回生成→承認公開",
  "フィルタ→ギャップ→補充→候補採否→生成起動/一括投入",
  "進捗→構成/QA→保留対応→承認",
  "障害対応、なりすまし調査",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-acceptance-trace_v3.7.md", [
  "分析開始とCMS書込Capabilityを同一Gateにせず",
  "任意本文途中Preview・ユーザー編集保護→Semantic Assembly",
  "Presentation Assembly（装飾・アイキャッチ・CTA・内部link・CMS形式変換）",
  "Managerの期限付き代理調査、権限失効",
  "内部actorを顧客本人へ書き換えない",
  "Managerの期限付き代理アクセスがAdmin指定の顧客・Site・operation・期限へ制限",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/security-access-requirements_v1.md", [
  "REQ-ACCESS-11 監査・期限付き代理アクセス表示",
  "export、delegate_access等のPermission",
  "internal user（Admin／Manager／Operator）",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/design-experience-requirements_v1.md", [
  "日本市場の法人・個人向け業務SaaS",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/categories/design-experience-requirements_v1.md", [
  "初期リリースは法人向け業務SaaS",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-admin-console-requirements_v3.7.md", [
  "Platform AdminがManagerへ対象顧客、Site、許可operation、理由、有効期限を指定",
  "Operatorはログ・trace確認だけ",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-admin-console-requirements_v3.7.md", [
  "impersonation）は原則read-only",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md", [
  "export / delegate_access",
  "顧客Userへのなりすましを表さない",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-ui-parts-catalog_v1.md", [
  "DelegatedAccessBanner",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-ui-parts-catalog_v1.md", [
  "ImpersonationBanner",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-navigation-ui-requirements_v3.7.md", [
  "React/HTML/CSSコンポーネントで描画する",
  "モバイルでは閲覧＋簡易承認に限定してよい",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-handoff-gate_v3.7.md", [
  "未確定事項の全件索引は **Open Items Register** を正本",
  "要求整理を停止する意味ではなく",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md", [
  "full_auto有効化の確認UI（Owner/Admin限定",
  "閲覧系のモバイル表示が動作し",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md", [
  "初期mobile業務対応を誤表示しない",
  "後続のAgent Office Chatは初期プロト受入から分離する",
]);
assertExcludes("docs/reference/FEATURE-LIST.md", [
  "全135 REQ",
  "Claude優先ルーティング",
  "オンボーディング=コンサル・ヘルプ=専用サイト",
  "VPS→クラウド",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-requirements_v3.7.md", [
  "CMS連携（初期Adapter: WordPress）",
  "接続中CMSの保存値を編集・更新の外部正本、公開表示をSEO評価の正本",
  "アプリ内FAQチャット／問い合わせを開くサポート導線",
  "version付きSupport Knowledge／FAQ Catalog",
  "外部ヘルプサイトの公開を一次応答の成立条件にしない",
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-product-requirements_v3.7.md", [
  "WordPressはコンテンツの正本である",
  "サポート窓口（ヘルプサイト",
  "ヘルプサイト・FAQ",
]);

const l3DecisionText = fs.readFileSync(
  path.join(repoRoot, "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md"),
  "utf8",
);
const openItemsText = fs.readFileSync(
  path.join(repoRoot, "docs/reference/ai-office-de-seo-open-items-register_2026-08-03.md"),
  "utf8",
);
const l3DecisionIds = new Set([...l3DecisionText.matchAll(/^\| (D-\d{2}) \|/gm)].map((match) => match[1]));
const crosswalkStart = openItemsText.indexOf("## 9. L3 Decision Table全件対応");
const crosswalkText = crosswalkStart >= 0 ? openItemsText.slice(crosswalkStart) : "";
const crosswalkIds = new Set([...crosswalkText.matchAll(/^\| (D-\d{2}) \|/gm)].map((match) => match[1]));
for (const id of l3DecisionIds) {
  if (!crosswalkIds.has(id)) fail(errors, `open items crosswalk: missing ${id}`);
}
for (const id of crosswalkIds) {
  if (!l3DecisionIds.has(id)) fail(errors, `open items crosswalk: undefined ${id}`);
}

const downstreamRoots = [
  path.join(designRoot, "L2-domain"),
  path.join(designRoot, "L3-implementation"),
  path.join(designRoot, "L3-ui-prototype"),
];
const migratedLegacyPattern = /REQ-(?:PRODUCT|KGA|WPA|BILL(?!ING)|SEC|ADM|DUR|SRC|RWR|AOUI|NAV|UJ)-/;
const migrationBoundaryPattern = /現行要求|現行[^\r\n]{0,20}正本|分類別|旧互換baseline|prototype-baseline/;
for (const file of downstreamRoots.flatMap((root) => markdownFiles(root))) {
  const content = fs.readFileSync(file, "utf8");
  if (migratedLegacyPattern.test(content) && !migrationBoundaryPattern.test(content)) {
    fail(errors, `${path.relative(repoRoot, file)}: legacy requirement refs lack a current-requirement boundary`);
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const manifestArrayFields = [
  "canonical_paths",
  "current_detail_paths",
  "domain_paths",
  "cross_cutting_paths",
  "feature_summary_paths",
  "l3_preparation_paths",
  "gate_a_paths",
  "prototype_paths",
  "plan_paths",
  "ui_support_paths",
  "prototype_baseline_paths",
  "audit_snapshot_paths",
  "reference_paths",
];
const roleSeparatedManifestFields = [
  "canonical_paths",
  "current_detail_paths",
  "domain_paths",
  "cross_cutting_paths",
  "feature_summary_paths",
  "l3_preparation_paths",
  "gate_a_paths",
  "prototype_paths",
  "plan_paths",
  "ui_support_paths",
  "prototype_baseline_paths",
  "audit_snapshot_paths",
  "reference_paths",
];
const manifestSingletonFields = [
  "verification_log",
  "alignment_ledger",
  "open_items_register",
  "prototype_modernization_register",
];
for (const field of manifestArrayFields) {
  for (const relativePath of manifest[field] ?? []) {
    if (!fs.existsSync(path.join(repoRoot, relativePath))) {
      fail(errors, `manifest.${field}: missing path ${relativePath}`);
    }
  }
}
for (const relativePath of manifest.audit_snapshot_paths ?? []) {
  const content = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  if (!/(?:履歴|監査時点)スナップショット/.test(content)) {
    fail(errors, `${relativePath}: audit snapshot lacks a history/current-truth boundary banner`);
  }
}
for (const relativePath of manifest.prototype_baseline_paths ?? []) {
  if (!relativePath.endsWith(".md")) continue;
  const content = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  if (!/プロトタイプbaseline/.test(content) || !/正本ではない/.test(content)) {
    fail(errors, `${relativePath}: prototype baseline lacks a current-requirement boundary banner`);
  }
}
const manifestPathRoles = new Map();
for (const field of roleSeparatedManifestFields) {
  for (const relativePath of manifest[field] ?? []) {
    const normalizedPath = relativePath.replaceAll("\\", "/");
    const previousRole = manifestPathRoles.get(normalizedPath);
    if (previousRole) {
      fail(errors, `manifest: ${normalizedPath} is classified as both ${previousRole} and ${field}`);
    } else {
      manifestPathRoles.set(normalizedPath, field);
    }
  }
}
if (!manifest.prototype_policy || !/modification is prohibited/i.test(manifest.prototype_policy)) {
  fail(errors, "manifest.prototype_policy: prototype modification prohibition is missing");
}
for (const field of manifestSingletonFields) {
  const relativePath = manifest[field];
  if (!relativePath || !fs.existsSync(path.join(repoRoot, relativePath))) {
    fail(errors, `manifest.${field}: missing path ${relativePath ?? "(unset)"}`);
  }
}
const classifiedMarkdown = new Set(
  [
    ...manifestArrayFields.flatMap((field) => manifest[field] ?? []),
    ...manifestSingletonFields.map((field) => manifest[field]).filter(Boolean),
  ].map((item) => item.replaceAll("\\", "/")),
);
for (const markdownFile of markdownFiles(path.join(repoRoot, "docs"))) {
  const relativePath = path.relative(repoRoot, markdownFile).replaceAll("\\", "/");
  if (!classifiedMarkdown.has(relativePath)) {
    fail(errors, `manifest: unclassified Markdown artifact ${relativePath}`);
  }
}
for (const markdownFile of markdownFiles(path.join(repoRoot, "docs"))) {
  const content = fs.readFileSync(markdownFile, "utf8");
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (!rawTarget || /^(?:https?:|mailto:|#)/.test(rawTarget)) continue;
    const withoutAnchor = rawTarget.split("#")[0];
    if (!/[\\/]|\.[a-z0-9]{1,8}$/i.test(withoutAnchor)) continue;
    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(withoutAnchor);
    } catch {
      fail(errors, `${path.relative(repoRoot, markdownFile)}: invalid encoded link ${rawTarget}`);
      continue;
    }
    const resolvedTarget = path.resolve(path.dirname(markdownFile), decodedTarget);
    if (!fs.existsSync(resolvedTarget)) {
      fail(errors, `${path.relative(repoRoot, markdownFile)}: broken local link ${rawTarget}`);
    }
  }
}
for (const relativePath of manifest.gate_a_paths ?? []) {
  if (!relativePath.endsWith(".md")) continue;
  const content = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  if (/^status:\s*frozen/m.test(content)) {
    fail(errors, `${relativePath}: Gate A cannot remain frozen during current-requirement alignment`);
  }
}
for (const canonicalFile of [...canonicalSources, path.join(l1Root, "README.md")]) {
  const relativePath = path.relative(repoRoot, canonicalFile).replaceAll("\\", "/");
  if (!manifest.canonical_paths.includes(relativePath)) {
    fail(errors, `manifest.canonical_paths: missing current canonical document ${relativePath}`);
  }
}

const lifecycleLogicPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L1-requirements/categories/logic-requirements_v1.md",
);
const lifecycleLogic = fs.readFileSync(lifecycleLogicPath, "utf8");
if (/リライトRecommendationはGSC連携またはWordPress連携を必要とする/.test(lifecycleLogic)) {
  fail(errors, "logic requirements: stale rewrite entry condition allows GSC without article content retrieval");
}
const businessLifecyclePath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L1-requirements/categories/business-requirements_v1.md",
);
const businessLifecycle = fs.readFileSync(businessLifecyclePath, "utf8");
if (/リライト候補の生成はGSC連携またはWordPress連携の少なくとも一方/.test(businessLifecycle)) {
  fail(errors, "business requirements: stale rewrite entry condition allows GSC without article retrieval");
}
for (const requiredPhrase of [
  "対象記事の本文・見出し・公開状態を取得できることを必須",
  "GSCまたはKeyword実績だけでは本文変更を伴うリライトRecommendationを生成しない",
  "CMS引渡し",
]) {
  if (!businessLifecycle.includes(requiredPhrase)) {
    fail(errors, `business requirements: current lifecycle phrase missing: ${requiredPhrase}`);
  }
}
for (const stalePhrase of [
  "通過成果へ装飾を適用してWordPress下書きへ送り",
  "成果物: Research Brief、Outline Contract、Section Brief、記事Snapshot、品質・Repair結果、WordPress下書き",
  "差分をWordPress下書きへ送り",
  "WordPress下書き、リスク表示、差分確認",
]) {
  if (businessLifecycle.includes(stalePhrase)) {
    fail(errors, `business requirements: CMS-independent lifecycle regressed to WordPress-only wording: ${stalePhrase}`);
  }
}
for (const requiredPhrase of [
  "接続中CMSの下書き",
  "CMS下書き／持ち出し成果",
  "初期WordPress Adapter",
]) {
  if (!businessLifecycle.includes(requiredPhrase)) {
    fail(errors, `business requirements: CMS core / initial adapter separation missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "対象記事の本文・見出し・公開状態を取得できること",
  "GSCまたはKeyword実績だけでは本文変更を伴うRecommendationを成立させない",
  "Semantic Assembly",
  "Presentation Assembly",
]) {
  if (!lifecycleLogic.includes(requiredPhrase)) {
    fail(errors, `logic requirements: current lifecycle phrase missing: ${requiredPhrase}`);
  }
}

const screenFlowPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md",
);
const screenFlow = fs.readFileSync(screenFlowPath, "utf8");
for (const requiredPhrase of [
  "CMS write再診断",
  "connection_required",
  "成果保持・再接続/再送/持ち出し",
  "本文・見出し・公開状態を取得できる経路",
]) {
  if (!screenFlow.includes(requiredPhrase)) {
    fail(errors, `screen flow: current transition phrase missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "現行Lifecycle正本",
  "新規Site導入",
  "既存Site導入",
  "Reportから月次計画・Recommendation",
  "Recommendation／手動指定から生成〜公開",
  "Article Read Snapshot取得",
  "CMS Delivery準備",
  "公開・更新後評価",
  "通常ビューとAgent Officeの往復・詳細操作フロー",
  "正規遷移契約マトリクス",
]) {
  if (!screenFlow.includes(requiredPhrase)) {
    fail(errors, `screen flow: lifecycle transition coverage missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "新規Site → big keyword方向確認",
  "既存Site → Keyword統合",
  "分析 → 戦略／診断Report",
  "Report → 月次計画",
  "Recommendation → Intake",
  "Intake → Execution Admission → 正規Action",
  "QA済みPresentation → Generation Outcome",
  "Generation Outcome → CMS下書き",
  "CMS下書き → 公開・更新",
  "Publication Fact → 評価 → 次回計画",
]) {
  if (!screenFlow.includes(requiredPhrase)) {
    fail(errors, `screen flow: canonical transition contract missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "transition_outcome",
  "schema.ui.availability.v1",
  "blocked / degraded / preview / partial / pending / ready",
  "reasons[].class/code",
]) {
  if (!screenFlow.includes(requiredPhrase)) {
    fail(errors, `screen flow: transition/availability separation missing: ${requiredPhrase}`);
  }
}
const navigationPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-navigation-ui-requirements_v3.7.md",
);
const navigation = fs.readFileSync(navigationPath, "utf8");
const authorizationMatrix = fs.readFileSync(
  path.join(
    repoRoot,
    "docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-authorization-operation-matrix_v1.md",
  ),
  "utf8",
);
if (/\| WordPress下書き送信・予約・手動公開 \|/.test(authorizationMatrix)) {
  fail(errors, "authorization matrix: CMS operation remains fixed to WordPress-only wording");
}
if (!authorizationMatrix.includes("CMS下書き送信・予約・手動公開・既存記事更新")) {
  fail(errors, "authorization matrix: CMS side-effect operation coverage missing");
}
for (const currentLabel of ["5. サイトページ管理", "6. ナレッジ管理", "### サイトページ管理", "### ナレッジ管理"]) {
  if (!navigation.includes(currentLabel)) {
    fail(errors, `navigation: current first-level responsibility missing: ${currentLabel}`);
  }
}
if (/^5\. 検索流入分析$|^6\. 学習ナレッジ管理$/m.test(navigation)) {
  fail(errors, "navigation: superseded S5/S6 first-level labels remain canonical");
}
for (const requiredPhrase of [
  "月次プランニング（目的、重点領域、記事・施策配分、予算配分",
  "新規SiteのKeyword戦略レポートと既存SiteのKeyword・Site診断レポート",
  "重複する目標管理を置かない",
  "介入別Evaluation Laneによる施策評価",
  "CMS接続の基本設定",
]) {
  if (!navigation.includes(requiredPhrase)) {
    fail(errors, `navigation: current lifecycle responsibility missing: ${requiredPhrase}`);
  }
}
if (/^- 予算管理、目標管理$/m.test(navigation)) {
  fail(errors, "navigation: monthly goal management remains duplicated under automation");
}
if (
  JSON.stringify(manifest.user_navigation) !==
  JSON.stringify([
    "ダッシュボード",
    "キーワード管理",
    "コンテンツ作成",
    "オートメーション",
    "サイトページ管理",
    "ナレッジ管理",
    "設定",
  ])
) {
  fail(errors, "manifest.user_navigation: does not match current REQ-NAV-01 labels");
}
const screenInventoryPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md",
);
const screenInventory = fs.readFileSync(screenInventoryPath, "utf8");
const prototypeSource = fs.readFileSync(path.join(repoRoot, "prototype/AI Office de SEO.dc.html"), "utf8");
const modernizationRegister = fs.readFileSync(
  path.join(repoRoot, "docs/reference/ai-office-de-seo-prototype-modernization-register_2026-08-03.md"),
  "utf8",
);
const knownPrototypeDrift = [
  [/選ぶ・決めるはこの通常ビューで/, "PROTO-22"],
  [/役割分担どおり実行はしない/, "PROTO-22"],
  [/recFbSet\(id, v\)/, "PROTO-21"],
  [/'目標管理': \{ screen: 'automation', auTab: 'goal' \}/, "PROTO-23"],
  [/明日のおすすめで再提案されます/, "PROTO-24"],
  [/実行前に必ずプレビューと見積が出ます/, "PROTO-25"],
];
for (const [pattern, findingId] of knownPrototypeDrift) {
  if (pattern.test(prototypeSource) && !modernizationRegister.includes(findingId)) {
    fail(errors, `prototype semantic drift ${findingId}: implementation evidence is not registered`);
  }
}
for (const requiredPhrase of [
  "成果を利用可能にしました",
  "非公開staging upload、QA seal、hash検証だけを成果提供やJob完了として顧客へ表示しない",
  "通常ビューは期限と必要操作、OfficeはProvision証拠、Outcome／commit相関、Delivery影響、Incidentを詳しく表示",
  "公開／更新の反映を確認しました",
  "確認できた時刻（推定）",
  "ユーザーへ時刻Source選択を要求しない",
]) {
  if (!screenInventory.includes(requiredPhrase)) {
    fail(errors, `screen inventory: Generation Outcome display boundary missing: ${requiredPhrase}`);
  }
}
if (!/## 1\. 旧詳細コンポーネント棚卸し（互換baseline・現行責務の正本ではない）/.test(screenInventory)) {
  fail(errors, "screen inventory: legacy detailed component table lacks a noncanonical boundary");
}
if (/責務の所属は§1の各行を正とし/.test(screenInventory)) {
  fail(errors, "screen inventory: current tab register still delegates responsibility to the legacy table");
}
const currentTabRegister = screenInventory.split("## 5. 第二階層タブ台帳")[1]?.split("### 5.1")[0] || "";
if (/\| S4 \|[^\r\n]+\*\*目標管理/.test(currentTabRegister)) {
  fail(errors, "screen inventory: monthly goal management regressed from S1 planning into S4 automation");
}
for (const requiredPhrase of [
  "月次目的・記事／施策配分・予算配分・実績乖離はS1プランニングを正本",
  "S4に重複する目標管理タブを置かない",
  "戦略・診断レポート（新規Site戦略／既存Site診断を分離",
  "施策評価（`seo_content`はconfirmed Publication Factの`effective_at`から1・3・6か月",
]) {
  if (!screenInventory.includes(requiredPhrase)) {
    fail(errors, `screen inventory: S1 planning / S4 automation boundary missing: ${requiredPhrase}`);
  }
}

const l3DecisionPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md",
);
const l3Decision = fs.readFileSync(l3DecisionPath, "utf8");
if (/\| D-03 \|[^\r\n]+\| open \|/.test(l3Decision)) {
  fail(errors, "L3 decision D-03: authorization contract is decided and must not be tracked as open");
}
if (!/\| D-03 \|[^\r\n]+contract decided[^\r\n]+LB-05/.test(l3Decision)) {
  fail(errors, "L3 decision D-03: contract decision and remaining LB-05 evidence are not separated");
}
if (!/\| D-28 \|[^\r\n]+DD-14[^\r\n]+画面実装着手前[^\r\n]+open/.test(l3Decision)) {
  fail(errors, "L3 decision D-28: accessibility design gap is not classified before screen implementation");
}
const domainModelPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-domain-model_v3.7.md",
);
const domainModel = fs.readFileSync(domainModelPath, "utf8");
for (const requiredPhrase of ["Article Read Snapshot", "GSCまたはKeyword実績だけの候補", "Rewrite Intakeへdispatchしない"]) {
  if (!domainModel.includes(requiredPhrase)) {
    fail(errors, `domain model: rewrite retrieval invariant missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of ["CmsDeliveryJob", "生成完了とCMS送信成功を同じ状態にしない", "持ち出しを公開成功としない"]) {
  if (!domainModel.includes(requiredPhrase)) {
    fail(errors, `domain model: CMS Delivery invariant missing: ${requiredPhrase}`);
  }
}
const eventCatalogPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-implementation/gate-a/gate-a-1-event-envelope_v1.md",
);
const eventCatalog = fs.readFileSync(eventCatalogPath, "utf8");
if (!/search\.rewrite_candidate_raised \|[^\r\n]+article_read_snapshot_ref[^\r\n]+input_availability/.test(eventCatalog)) {
  fail(errors, "event catalog: rewrite candidate event lacks article retrieval and availability evidence");
}
for (const currentEvent of [
  "generation.semantic_assembled",
  "generation.presentation_assembled",
  "cms.draft_created",
]) {
  if (!eventCatalog.includes(`| ${currentEvent} |`)) {
    fail(errors, `event catalog: current workflow event missing: ${currentEvent}`);
  }
}
for (const currentEvent of [
  "generation.output_vault_provision_verified",
  "generation.deliverable_provided",
  "generation.output_vault_expiring",
  "generation.output_vault_expired",
  "generation.output_vault_deleted",
  "generation.output_vault_access_failed",
]) {
  if (!eventCatalog.includes(`| ${currentEvent} |`)) {
    fail(errors, `event catalog: Generation Outcome event missing: ${currentEvent}`);
  }
}
for (const requiredPhrase of [
  "同じDB transaction／outbox batchで作成",
  "Provision検証だけでは発行しない",
  "v1.10改訂",
  "v1.11改訂",
  "effective_time_source",
  "derivation keyで冪等化",
  "遅延確定時も`effective_at`とeventの`occurred_at`を混同しない",
]) {
  if (!eventCatalog.includes(requiredPhrase)) {
    fail(errors, `event catalog: atomic Generation Outcome rule missing: ${requiredPhrase}`);
  }
}
if (/^\| generation\.article_assembled \||^\| publish\.draft_created \|/m.test(eventCatalog)) {
  fail(errors, "event catalog: legacy assembly/draft aliases remain active event rows");
}
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-inventory_v3.7.md", [
  "### 0.7 Plan別Data Fidelity・Semantic Metric表示",
  "Agent Officeは通常ビューと同じ`schema.metric.snapshot.v1`",
  "FID-UI-01〜36",
  "SF-UI-16",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md", [
  "Metric要約 → 通常ビュー内drilldown → Office詳細",
  "S7 Plan変更影響 → Upgrade／Downgrade確定",
  "過去Observation Fact・確定評価・Metric Definitionを変更しない",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-connection-map_v1.md", [
  "# 11. Plan別Data Fidelity・Semantic Metric接続",
  "Office専用算式・Metric copy・認可迂回",
  "P95 3秒以内にページ骨格と値または理由付き状態",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/non-functional-requirements_v1.md", [
  "### REQ-NFR-16 分析Workload隔離・優先順位",
  "interactive_read / business_command / publication_write / billing_authorization / source_ingest / metric_rollup / search_rebuild / export",
  "weighted fair share、age昇格、hard cap",
  "AC-L1-NFR-16",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-aws-operations-recovery-map_v1.md", [
  "| Analytics Projection |",
  "事前集計は将来最適化ではなく初期表示契約の一部",
  "物理的な列指向DBを全領域の必須依存にしない",
  "Analytics／Search",
  "Analytics overload shedding",
  "Metric／Search projection rebuild",
  "Plan別weight適用下で下位Planがage昇格",
]);
const agentRuntimePath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md",
);
const agentRuntime = fs.readFileSync(agentRuntimePath, "utf8");
if (/workflow\.rewrite\.v1`: GSC Query Drift／Cause Analysis/.test(agentRuntime)) {
  fail(errors, "agent runtime: rewrite workflow remains incorrectly fixed to GSC Query Drift");
}
for (const requiredPhrase of ["Article Read Snapshot確認", "Edit Plan freeze", "ユーザー承認"]) {
  if (!agentRuntime.includes(requiredPhrase)) {
    fail(errors, `agent runtime: current rewrite workflow element missing: ${requiredPhrase}`);
  }
}
const contractSchemasPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md",
);
const contractSchemas = fs.readFileSync(contractSchemasPath, "utf8");
for (const requiredPhrase of [
  "schema.generation.outcome.v1",
  "vault_provision_ref",
  "vault_verification_ref",
  "credit_commit_ref",
  "schema.output_vault.availability.v1",
  "read-after-write検証",
]) {
  if (!contractSchemas.includes(requiredPhrase)) {
    fail(errors, `contract schemas: atomic Generation Outcome contract missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "effective_time{source(signed_cms_event|verified_cms_value|first_confirmed_observation)",
  "precision(exact|estimated)",
  "予約、Command、API受付、Webhook受信、検証終了時刻を代用しない",
  "unique(site_id,publication_fact_id)",
  "unique(publication_fact_id,intervention_version,lane_type)",
  "eventの発生時刻をbackdateしない",
]) {
  if (!contractSchemas.includes(requiredPhrase)) {
    fail(errors, `contract schemas: Publication effective time / derivation contract missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "schema.snapshot.article_read.v1",
  "public_state(published|draft|private|redirected|not_found|unknown)",
  "availability{body, headings, public_state, freshness, reason_codes[]}",
  "Article Read SnapshotなしにEdit Plan",
]) {
  if (!contractSchemas.includes(requiredPhrase)) {
    fail(errors, `contract schemas: Article Read Snapshot contract missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "schema.cms.delivery.v1",
  "state(prepared|connection_required|permission_required|delivering|draft_created|",
  "記事生成の完了とCMS送信成功を同じ状態にしない",
  "持ち出したことをCMS公開・更新成功として扱わない",
]) {
  if (!contractSchemas.includes(requiredPhrase)) {
    fail(errors, `contract schemas: CMS Delivery contract missing: ${requiredPhrase}`);
  }
}
for (const requiredPhrase of [
  "schema.metric.definition.v1",
  "schema.calibration.snapshot.v1",
  "schema.metric.snapshot.v1",
  "schema.metric.preaggregation.v1",
  "同じmetric／scope／grain／window／filterから別の値を作らない",
  "同じMetric Definitionの式や較正weightへPlan係数を加えない",
]) {
  if (!contractSchemas.includes(requiredPhrase)) {
    fail(errors, `contract schemas: Semantic Metric / Calibration contract missing: ${requiredPhrase}`);
  }
}
const metricDdlPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-data-ddl_v3.7.md",
);
const metricDdl = fs.readFileSync(metricDdlPath, "utf8");
for (const requiredPhrase of [
  "domain_metric_definitions",
  "hierarchical_calibration_snapshots",
  "metric_snapshots",
  "metric_preaggregations",
  "data_fidelity_entitlements",
  "通常／Office別の値列を作らず",
]) {
  if (!metricDdl.includes(requiredPhrase)) {
    fail(errors, `data DDL: Semantic Metric / Data Fidelity boundary missing: ${requiredPhrase}`);
  }
}
for (const currentEvent of [
  "calibration.snapshot_published",
  "metric.definition_published",
  "metric.preaggregation_refreshed",
  "metric.preaggregation_staled",
  "billing.data_fidelity_entitlement_changed",
]) {
  if (!eventCatalog.includes(`| ${currentEvent} |`)) {
    fail(errors, `event catalog: Semantic Metric / Data Fidelity event missing: ${currentEvent}`);
  }
}
const metricConfigPath = path.join(
  repoRoot,
  "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-config-registry-defaults_v3.7.md",
);
const metricConfig = fs.readFileSync(metricConfigPath, "utf8");
for (const requiredPhrase of [
  "analytics.migration.scan_rows",
  "calibration.minimum_samples",
  "Plan／tenant／Site上書き禁止",
  "entitlement.data_fidelity.coverage",
]) {
  if (!metricConfig.includes(requiredPhrase)) {
    fail(errors, `config registry: Semantic Metric / Data Fidelity key missing: ${requiredPhrase}`);
  }
}
const handoffGate = fs.readFileSync(
  path.join(repoRoot, "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-handoff-gate_v3.7.md"),
  "utf8",
);
for (const requiredPhrase of ["B-7 | Semantic Metric Schema Registry", "B-8 | Data Fidelity Query Admission"]) {
  if (!handoffGate.includes(requiredPhrase)) {
    fail(errors, `handoff gate: Semantic Metric implementation gate missing: ${requiredPhrase}`);
  }
}
const l3DecisionTable = fs.readFileSync(
  path.join(repoRoot, "docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md"),
  "utf8",
);
if (!l3DecisionTable.includes("| D-36 | Semantic Metric実行方式とAnalytics Store段階移行")) {
  fail(errors, "L3 decision table: Analytics Store staged migration decision missing: D-36");
}
const layerPlanChecks = [
  ["/L0-charter/", "docs/plans/PLAN-L0-01-ai-office-de-seo-charter.md"],
  ["/L1-requirements/", "docs/plans/PLAN-L1-01-ai-office-de-seo-requirements.md"],
  ["/L2-domain/", "docs/plans/PLAN-L2-01-ai-office-de-seo-domain-model.md"],
];
const planControlledPaths = [
  ...(manifest.canonical_paths ?? []),
  ...(manifest.current_detail_paths ?? []),
  ...(manifest.domain_paths ?? []),
  ...(manifest.cross_cutting_paths ?? []),
];
for (const [pathFragment, planPath] of layerPlanChecks) {
  const planText = fs.readFileSync(path.join(repoRoot, planPath), "utf8");
  for (const artifactPath of planControlledPaths.filter((item) => item.includes(pathFragment))) {
    if (!planText.includes(artifactPath)) {
      fail(errors, `${planPath}: missing generated canonical artifact ${artifactPath}`);
    }
  }
}

if (errors.length) {
  console.error(`Requirements audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Requirements audit passed: ${reqDefinitions.size} REQ definitions, ${coveredRequirements.size} covered REQ, ${sourceAcceptance.size} canonical AC, ${traceAcceptance.size} traced AC; ${boundedContextKeys.size} bounded contexts, ${invariantIds.size} domain invariants, ${negativeFixtureCount} contradiction fixtures verified.`,
);
