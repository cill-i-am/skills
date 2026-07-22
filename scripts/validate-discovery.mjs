import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

const root = process.cwd();
const errors = [];

const files = {
  domain:
    "skills/planning/domain-modeling/SKILL.md",
  domainAgent:
    "skills/planning/domain-modeling/agents/openai.yaml",
  domainPlacement:
    "skills/planning/domain-modeling/references/domain-doc-placement.md",
  adrGuidance:
    "skills/planning/domain-modeling/references/adr-guidance.md",
  wayfinder: "skills/planning/wayfinder/SKILL.md",
  wayfinderAgent: "skills/planning/wayfinder/agents/openai.yaml",
  grilling: "skills/planning/grilling/SKILL.md",
  toPrd: "skills/execution-loop/to-prd/SKILL.md",
  toIssues: "skills/execution-loop/to-issues/SKILL.md",
  domainTemplate:
    "skills/execution-loop/linear-setup/assets/docs/agents/domain.md",
  executionPolicy:
    "skills/execution-loop/linear-setup/assets/docs/agents/execution-policy.md",
};

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function requireText(label, content, required) {
  for (const text of required) {
    if (!content.includes(text)) {
      errors.push(`${label}: missing semantic contract: ${text}`);
    }
  }
}

const [
  domain,
  domainPlacement,
  adrGuidance,
  wayfinder,
  grilling,
  toPrd,
  toIssues,
  domainTemplate,
  executionPolicy,
] = await Promise.all([
  read(files.domain),
  read(files.domainPlacement),
  read(files.adrGuidance),
  read(files.wayfinder),
  read(files.grilling),
  read(files.toPrd),
  read(files.toIssues),
  read(files.domainTemplate),
  read(files.executionPolicy),
]);

requireText("domain-modeling", domain, [
  "Challenge overloaded terms",
  "Stress-test scenarios",
  "Cross-check evidence",
  "Do not force a root `CONTEXT.md`",
  "Hard to reverse",
  "Surprising without context",
  "A real tradeoff",
  "It does not grant\nimplementation, tracker mutation, publication, or filesystem-write authority",
]);
requireText("domain placement", domainPlacement, [
  "Find The Existing Owner First",
  "nearest semantic owner",
  "One Durable Owner",
  "not mandatory names",
]);
requireText("ADR guidance", adrGuidance, [
  "All three are required",
  "One to three sentences",
  "Add `Status`, `Considered Options`, or `Consequences` only",
]);

requireText("wayfinder", wayfinder, [
  "Wayfinder owns decision discovery, not implementation slicing",
  "docs/agents/execution-policy.md",
  "grilling\n  -> wayfinder when the route is still foggy\n  -> to-prd\n  -> to-issues\n  -> orchestrator",
  "The low-resolution map is a Linear Project plus a draft PRD or Project document",
  "## Decisions So Far",
  "## Not Yet Specified",
  "## Out Of Scope",
  "The frontier\nis the open, unblocked decision Issues",
  "One decision Issue per session is the\nfocus default, not a rigid invariant",
  "Read-only discovery works without Linear access",
  "Do not pre-slice fog into implementation work",
  "to-prd` owns consolidation into product truth",
]);
requireText("grilling", grilling, [
  "Use `../domain-modeling/`",
  "A separate grill-with-docs alias is\nunnecessary",
  "Use `../wayfinder/` before `to-prd`",
]);
requireText("to-prd", toPrd, [
  "Wayfinder map and resolved decision Issues",
  "hand it back to\n   `wayfinder`",
  "settled product intent has one durable owner",
]);
requireText("to-issues", toIssues, [
  "still a Wayfinder map or contains unresolved decision issues",
  "Do not reinterpret decision work as delivery work",
]);

requireText("domain setup template", domainTemplate, [
  "## Resolve Placement",
  "Canonical glossary/domain language",
  "Repository-wide ADRs",
  "## ADR Threshold",
  "Hard to reverse",
  "Surprising without context",
  "A real tradeoff",
  "one durable owner",
]);
requireText("execution authority", executionPolicy, [
  "This document is the canonical owner of workflow phases, role authority",
]);

function routeDiscovery({ fog, prdReady, unresolvedDecision }) {
  if (unresolvedDecision || fog) {
    return "wayfinder";
  }
  return prdReady ? "to-issues" : "to-prd";
}

function shouldCreateAdr({ hardToReverse, surprising, tradeoff }) {
  return hardToReverse && surprising && tradeoff;
}

const scenarios = [
  {
    id: "named destination with fog",
    actual: routeDiscovery({ fog: true, prdReady: false, unresolvedDecision: false }),
    expected: "wayfinder",
  },
  {
    id: "Wayfinder completion",
    actual: routeDiscovery({ fog: false, prdReady: false, unresolvedDecision: false }),
    expected: "to-prd",
  },
  {
    id: "ready PRD",
    actual: routeDiscovery({ fog: false, prdReady: true, unresolvedDecision: false }),
    expected: "to-issues",
  },
  {
    id: "unresolved decision is not delivery-ready",
    actual: routeDiscovery({ fog: false, prdReady: true, unresolvedDecision: true }),
    expected: "wayfinder",
  },
  {
    id: "ADR needs all three tests",
    actual: shouldCreateAdr({
      hardToReverse: true,
      surprising: true,
      tradeoff: false,
    }),
    expected: false,
  },
  {
    id: "qualifying ADR",
    actual: shouldCreateAdr({
      hardToReverse: true,
      surprising: true,
      tradeoff: true,
    }),
    expected: true,
  },
];

for (const scenario of scenarios) {
  if (!isDeepStrictEqual(scenario.actual, scenario.expected)) {
    errors.push(
      `${scenario.id}: expected ${JSON.stringify(scenario.expected)}, got ${JSON.stringify(scenario.actual)}`,
    );
  }
}

async function listFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await listFiles(entryPath)));
    } else {
      result.push(entryPath);
    }
  }
  return result.sort();
}

const installedRoot = await mkdtemp(path.join(os.tmpdir(), "discovery-skills-"));
try {
  for (const skillName of ["domain-modeling", "wayfinder"]) {
    const source = path.join(root, "skills", "planning", skillName);
    const installed = path.join(installedRoot, skillName);
    await cp(source, installed, { recursive: true });
    const sourceFiles = await listFiles(source);
    const installedFiles = await listFiles(installed);
    const sourceRelative = sourceFiles.map((file) => path.relative(source, file));
    const installedRelative = installedFiles.map((file) =>
      path.relative(installed, file),
    );
    if (!isDeepStrictEqual(sourceRelative, installedRelative)) {
      errors.push(`${skillName}: installed copy file list drifted`);
      continue;
    }
    for (const relativePath of sourceRelative) {
      const [sourceContent, installedContent] = await Promise.all([
        readFile(path.join(source, relativePath), "utf8"),
        readFile(path.join(installed, relativePath), "utf8"),
      ]);
      if (sourceContent !== installedContent) {
        errors.push(`${skillName}: installed copy drifted at ${relativePath}`);
      }
    }
  }
} finally {
  await rm(installedRoot, { force: true, recursive: true });
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Discovery and domain validation passed.");
for (const scenario of scenarios) {
  console.log(`Scenario ${scenario.id}: passed`);
}
