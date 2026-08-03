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
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/design-experience-requirements_v1.md", [
  "初回ログインと日常業務の正規入口は通常ビュー",
  "Agent Officeは名称どおり",
  "詳細運用面",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/non-functional-requirements_v1.md", [
  "本番配置はAWSを前提",
  "単一task、単一AZ、特定の実行形へ不可逆に密結合しない",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/categories/screen-operation-requirements_v1.md", [
  "Entryの自動投稿はロック対象にせず",
  "Entryの数値予測は上位機能Preview",
  "開発管理画面または開発者Consoleとして扱わない",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md", [
  "schema.site.build_progress.v1",
  "schema.plan.monthly.v1",
  "schema.publication.decision.v1",
  "schema.evaluation.intervention.v1",
]);
assertIncludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md", [
  "CMS種別には依存しない。初期の書込AdapterはWordPressを対象とする",
]);
assertIncludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-screen-flow_v3.7.md", [
  "Site導入",
  "Keyword戦略Report",
  "Recommendation Intake freeze",
  "1・3・6か月",
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
  "現在は443 REQを監査対象",
  "Site接続→業界Big Keyword探索",
  "Agent Officeは監視専用ではなく",
  "Entry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜",
]);
assertIncludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-requirements-decision-summary_v1.md", [
  "未確定事項の全件台帳ではない",
  "ai-office-de-seo-open-items-register_2026-08-03.md",
  "ここにないことを「確定済み」の根拠にしない",
]);
assertIncludes("docs/reference/ai-office-de-seo-content-consistency-audit_2026-07-09.md", [
  "履歴スナップショット",
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
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-ui-parts-catalog_v1.md", [
  "本実装（React）のコンポーネント分割の正本",
  "そのままReactコンポーネント名にする",
]);
assertExcludes("docs/design/ai-office-de-seo/L3-ui-prototype/ai-office-de-seo-prototype-plan_v3.7.md", [
  "full_auto有効化の確認UI（Owner/Admin限定",
]);
assertExcludes("docs/reference/FEATURE-LIST.md", [
  "全135 REQ",
  "Claude優先ルーティング",
  "オンボーディング=コンサル・ヘルプ=専用サイト",
  "VPS→クラウド",
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
const layerPlanChecks = [
  ["/L0-charter/", "docs/plans/PLAN-L0-01-ai-office-de-seo-charter.md"],
  ["/L1-requirements/", "docs/plans/PLAN-L1-01-ai-office-de-seo-requirements.md"],
  ["/L2-domain/", "docs/plans/PLAN-L2-01-ai-office-de-seo-domain-model.md"],
];
for (const [pathFragment, planPath] of layerPlanChecks) {
  const planText = fs.readFileSync(path.join(repoRoot, planPath), "utf8");
  for (const artifactPath of manifest.canonical_paths.filter((item) => item.includes(pathFragment))) {
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
  `Requirements audit passed: ${reqDefinitions.size} REQ definitions, ${coveredRequirements.size} covered REQ, ${sourceAcceptance.size} canonical AC, ${traceAcceptance.size} traced AC.`,
);
