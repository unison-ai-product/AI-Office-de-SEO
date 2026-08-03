import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const designRoot = path.join(repoRoot, "docs", "design", "ai-office-de-seo");
const l1Root = path.join(designRoot, "L1-requirements");
const tracePath = path.join(l1Root, "ai-office-de-seo-acceptance-trace_v3.7.md");

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
assertIncludes("docs/design/ai-office-de-seo/L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md", [
  "schema.site.build_progress.v1",
  "schema.plan.monthly.v1",
  "schema.publication.decision.v1",
  "schema.evaluation.intervention.v1",
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
]);
assertExcludes("docs/design/ai-office-de-seo/L1-requirements/ai-office-de-seo-user-journey-requirements_v3.7.md", [
  "対象Role: Editor以上",
]);
assertExcludes("docs/design/ai-office-de-seo/L2-domain/ai-office-de-seo-glossary_v3.7.md", [
  "1サイト=1プランに伴い",
]);

if (errors.length) {
  console.error(`Requirements audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Requirements audit passed: ${reqDefinitions.size} REQ definitions, ${coveredRequirements.size} covered REQ, ${sourceAcceptance.size} canonical AC, ${traceAcceptance.size} traced AC.`,
);
