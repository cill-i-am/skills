import { access, cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const sourceRoot = path.join(process.cwd(), "skills");
const templates = [
  "README.md", "workflow.md", "domain.md", "execution-policy.md",
  "issue-template.md", "prd-template.md", "reviewer-thread-template.md",
  "triage-states.md", "worker-thread-template.md",
];
const modeReferences = ["workflow-selection.md", "linear.md", "repo.md"];

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(file));
    else files.push(file);
  }
  return files;
}

async function validate(skillsRoot) {
  const errors = [];
  const skills = new Map();
  const files = await filesUnder(skillsRoot);
  for (const file of files.filter((file) => path.basename(file) === "SKILL.md")) {
    const label = path.relative(skillsRoot, file);
    const content = await readFile(file, "utf8");
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    const name = frontmatter?.match(/^name:[ \t]*([^\r\n]+)$/m)?.[1]?.trim();
    const description = frontmatter?.match(/^description:[ \t]*([^\r\n]+)$/m)?.[1]?.trim();
    const directory = path.dirname(file);
    if (!name || name !== path.basename(directory) || !/^[a-z0-9-]+$/.test(name)) {
      errors.push(`${label}: skill name missing or inconsistent with its directory`);
    }
    if (!description) errors.push(`${label}: missing description`);
    if (skills.has(name)) errors.push(`${label}: duplicate skill name ${name}`);
    if (name) skills.set(name, directory);
    try {
      const metadata = await readFile(path.join(directory, "agents/openai.yaml"), "utf8");
      if (!/^interface:\s*$/m.test(metadata)) errors.push(`${label}: missing interface block`);
      for (const field of ["display_name", "short_description", "default_prompt"]) {
        const value = metadata.match(new RegExp(`^  ${field}:[ \\t]*([^\\r\\n]+)$`, "m"))?.[1]?.trim();
        if (!value) errors.push(`${label}: missing interface.${field}`);
        if (field === "default_prompt" && !value?.includes("$" + name)) {
          errors.push(`${label}: default prompt must invoke $${name}`);
        }
      }
    } catch {
      errors.push(`${label}: missing agents/openai.yaml`);
    }
  }

  for (const file of files.filter((file) => file.endsWith(".md"))) {
    // Asset templates can describe receiving-project paths; these are checked after setup.
    // The template index itself links bundled assets and can be checked here.
    if (file.split(path.sep).includes("assets") && path.basename(file) !== "README.md") continue;
    const prose = (await readFile(file, "utf8")).replace(/```[\s\S]*?```/g, "");
    for (const match of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
      const reference = match[1];
      if (/^(?:[a-zA-Z][a-zA-Z\d+.-]*:|#|\/)/.test(reference)) continue;
      const target = reference.split("#")[0];
      try {
        await access(path.resolve(path.dirname(file), decodeURIComponent(target)));
      } catch {
        errors.push(`${path.relative(skillsRoot, file)}: missing local reference: ${reference}`);
      }
    }
  }

  const setup = skills.get("workflow-setup");
  if (!setup) errors.push("workflow-setup is missing");
  else {
    for (const resource of [
      ...templates.map((name) => path.join("assets/docs/agents", name)),
      ...modeReferences.map((name) => path.join("references", name)),
    ]) {
      try {
        await access(path.join(setup, resource));
      } catch {
        errors.push(`workflow-setup: missing resource ${resource}`);
      }
    }
  }
  if (skills.size === 0) errors.push("No skills found");
  if (errors.length) throw new Error(errors.join("\n"));
  return skills;
}

const installedRoot = await mkdtemp(path.join(os.tmpdir(), "skills-flat-validation-"));
try {
  const skills = await validate(sourceRoot);
  for (const [name, directory] of skills) {
    await cp(directory, path.join(installedRoot, name), { recursive: true });
  }
  await validate(installedRoot);
  console.log(`Validated ${skills.size} skills: metadata, workflow resources, and local links in source and flat layouts.`);
  console.log("Packaging checks only; agent behavior requires separate evaluation.");
} finally {
  await rm(installedRoot, { recursive: true, force: true });
}
