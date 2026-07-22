import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

const root = process.cwd();
const templateRoot = path.join(
  root,
  "skills",
  "execution-loop",
  "linear-setup",
  "assets",
  "docs",
  "agents",
);
const errors = [];

const requiredPolicyText = [
  "## Policy Precedence",
  "## Delivery Contract",
  "**Dispatch:**",
  "**Build:**",
  "**Verify:**",
  "**Decide:**",
  "## Ready Issues And Planning",
  "Tier A — routine reversible work",
  "Tier B — high-risk internal work",
  "Tier C — external or irreversible effects",
  "## Role Authority",
  "## Finding Disposition",
  "Fix before merge",
  "Residual risk",
  "Follow-up",
  "Human decision required",
  "## Proof Of Outcome",
  "Only one active watcher owns a PR's next poll",
];

const removedAuthorityText = [
  "Create the paired user-visible reviewer/spec thread at the same dispatch time",
  "release bounded edit authority",
  "Obtain one independent plan review",
  "Expected review stack",
  "Get user approval on the plan",
  "`pre-edit blocker`",
  "`pre-merge blocker`",
  "`deferred hardening`",
];

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

function forbidText(label, content, forbidden) {
  for (const text of forbidden) {
    if (content.includes(text)) {
      errors.push(`${label}: obsolete authority contract remains: ${text}`);
    }
  }
}

async function validateTemplateSet(directory, label) {
  const policy = await readFile(path.join(directory, "execution-policy.md"), "utf8");
  const workflow = await readFile(path.join(directory, "linear-workflow.md"), "utf8");
  const issue = await readFile(path.join(directory, "issue-template.md"), "utf8");
  const worker = await readFile(
    path.join(directory, "worker-thread-template.md"),
    "utf8",
  );
  const reviewer = await readFile(
    path.join(directory, "reviewer-thread-template.md"),
    "utf8",
  );
  const combined = [policy, workflow, issue, worker, reviewer].join("\n");

  requireText(`${label}/execution-policy.md`, policy, requiredPolicyText);
  requireText(`${label}/issue-template.md`, issue, [
    "## Proof Of Outcome",
    "Risk tier: A routine reversible | B high-risk internal | C external/irreversible",
  ]);
  requireText(`${label}/worker-thread-template.md`, worker, [
    "If it does, begin; do not rewrite",
    "Tier A has no pre-edit reviewer",
    "physically exercise the changed outcome",
  ]);
  requireText(`${label}/reviewer-thread-template.md`, reviewer, [
    "exact-head implementation",
    "Do not edit, merge, change Linear state, grant",
    "The reviewer reports evidence. The orchestrator decides.",
  ]);
  forbidText(label, combined, removedAuthorityText);
}

function dispatchScenario({ ready, tier, dangerousSeam = false, external = false }) {
  if (!ready) {
    return {
      action: "triage-before-dispatch",
      worker: false,
      human: "only-for-material-product-choice",
    };
  }

  return {
    action: "build",
    worker: true,
    preEditReview: tier === "B" && dangerousSeam ? "focused-timeboxed" : "none",
    externalApproval: tier === "C" && external ? "effect-only" : "none",
    finalReview: "one-exact-head-review",
    decisionOwner: "orchestrator",
  };
}

function dispositionScenario(kind) {
  const dispositions = {
    fixableDefect: "fix-and-continue",
    speculativeHardening: "residual-risk-or-follow-up",
    credentialLeak: "fix-before-merge",
    postCorrectionSafetyDefect: "fix-before-merge-and-verify-delta",
  };
  return dispositions[kind];
}

function watcherScenario({ staleHead, duplicateWatcher }) {
  return {
    action: staleHead ? "refresh-or-delete-stale-watcher" : "poll-current-head",
    createSecondWatcher: !duplicateWatcher,
    historyReplay: false,
  };
}

function ciContentionScenario({ failsInParallel, passesAlone, fullRerunPasses }) {
  if (failsInParallel && passesAlone && fullRerunPasses) {
    return "record-contention-and-continue-with-unchanged-assertion";
  }
  return "investigate-reproducible-failure";
}

const scenarios = [
  {
    id: "A Ready routine feature",
    actual: dispatchScenario({ ready: true, tier: "A" }),
    expected: {
      action: "build",
      worker: true,
      preEditReview: "none",
      externalApproval: "none",
      finalReview: "one-exact-head-review",
      decisionOwner: "orchestrator",
    },
  },
  {
    id: "B Under-specified issue",
    actual: dispatchScenario({ ready: false, tier: "A" }),
    expected: {
      action: "triage-before-dispatch",
      worker: false,
      human: "only-for-material-product-choice",
    },
  },
  {
    id: "C High-risk migration",
    actual: dispatchScenario({ ready: true, tier: "B", dangerousSeam: true }),
    expected: {
      action: "build",
      worker: true,
      preEditReview: "focused-timeboxed",
      externalApproval: "none",
      finalReview: "one-exact-head-review",
      decisionOwner: "orchestrator",
    },
  },
  {
    id: "D Reproducible implementation defect",
    actual: dispositionScenario("fixableDefect"),
    expected: "fix-and-continue",
  },
  {
    id: "E Speculative hardening",
    actual: dispositionScenario("speculativeHardening"),
    expected: "residual-risk-or-follow-up",
  },
  {
    id: "F Credential leak",
    actual: dispositionScenario("credentialLeak"),
    expected: "fix-before-merge",
  },
  {
    id: "G External provider action",
    actual: dispatchScenario({ ready: true, tier: "C", external: true }),
    expected: {
      action: "build",
      worker: true,
      preEditReview: "none",
      externalApproval: "effect-only",
      finalReview: "one-exact-head-review",
      decisionOwner: "orchestrator",
    },
  },
  {
    id: "H CI contention",
    actual: ciContentionScenario({
      failsInParallel: true,
      passesAlone: true,
      fullRerunPasses: true,
    }),
    expected: "record-contention-and-continue-with-unchanged-assertion",
  },
  {
    id: "I Stale heartbeat",
    actual: watcherScenario({ staleHead: true, duplicateWatcher: true }),
    expected: {
      action: "refresh-or-delete-stale-watcher",
      createSecondWatcher: false,
      historyReplay: false,
    },
  },
  {
    id: "J Post-correction blocker",
    actual: dispositionScenario("postCorrectionSafetyDefect"),
    expected: "fix-before-merge-and-verify-delta",
  },
];

await validateTemplateSet(templateRoot, "source templates");

const installedRoot = await mkdtemp(
  path.join(os.tmpdir(), "lean-execution-installed-"),
);
try {
  await cp(templateRoot, installedRoot, { recursive: true });
  await validateTemplateSet(installedRoot, "installed templates");
} finally {
  await rm(installedRoot, { force: true, recursive: true });
}

const authoritySurfaces = [
  "skills/execution-loop/orchestrator/SKILL.md",
  "skills/execution-loop/worker/SKILL.md",
  "skills/execution-loop/production-ready/SKILL.md",
  "skills/execution-loop/ci-watch/SKILL.md",
  "skills/execution-loop/reconcile-project/SKILL.md",
  "skills/execution-loop/worktree-isolation/SKILL.md",
  "skills/execution-loop/review-swarm/SKILL.md",
  "skills/core-standards/code-review/SKILL.md",
  "skills/core-standards/tdd/SKILL.md",
];
const authorityContent = (
  await Promise.all(authoritySurfaces.map((file) => read(file)))
).join("\n");
forbidText("role and capability skills", authorityContent, removedAuthorityText);

requireText(
  "production-ready",
  await read("skills/execution-loop/production-ready/SKILL.md"),
  [
    "This skill is an evidence aggregator and decision input.",
    "Do not recursively invoke them here.",
  ],
);
requireText(
  "review-swarm",
  await read("skills/execution-loop/review-swarm/SKILL.md"),
  ["It is not a routine production-ready dependency or workflow phase."],
);
requireText(
  "ci-watch",
  await read("skills/execution-loop/ci-watch/SKILL.md"),
  ["One watcher owns one PR's next poll."],
);

for (const scenario of scenarios) {
  if (!isDeepStrictEqual(scenario.actual, scenario.expected)) {
    errors.push(
      `${scenario.id}: expected ${JSON.stringify(scenario.expected)}, got ${JSON.stringify(scenario.actual)}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Execution authority validation passed for source and installed templates.");
for (const scenario of scenarios) {
  console.log(`Scenario ${scenario.id}: passed`);
}
