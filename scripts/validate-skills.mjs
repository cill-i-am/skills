import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skillsRoot = path.join(root, "skills");
const requiredAgentTemplates = [
  "README.md",
  "domain.md",
  "execution-policy.md",
  "issue-template.md",
  "linear-workflow.md",
  "prd-template.md",
  "reviewer-thread-template.md",
  "triage-states.md",
  "worker-thread-template.md",
];
const requiredAgentInterfaceFields = [
  "display_name",
  "short_description",
  "default_prompt",
];

const errors = [];

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      yield* walk(entryPath);
      continue;
    }

    yield entryPath;
  }
}

function parseFrontmatter(filePath, content) {
  if (!content.startsWith("---\n")) {
    errors.push(`${filePath}: missing frontmatter block`);
    return undefined;
  }

  const endIndex = content.indexOf("\n---", 4);
  if (endIndex === -1) {
    errors.push(`${filePath}: unterminated frontmatter block`);
    return undefined;
  }

  const fields = new Map();
  for (const line of content.slice(4, endIndex).split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    fields.set(
      line.slice(0, separatorIndex).trim(),
      line.slice(separatorIndex + 1).trim(),
    );
  }

  return fields;
}

function hasYamlField(content, fieldName) {
  const pattern = new RegExp(`^\\s{2}${fieldName}:\\s*.+$`, "m");
  return pattern.test(content);
}

for await (const filePath of walk(skillsRoot)) {
  const relativePath = path.relative(root, filePath);
  const content = await readFile(filePath, "utf8");

  if (path.basename(filePath) === "SKILL.md") {
    const frontmatter = parseFrontmatter(relativePath, content);
    const skillDirectoryName = path.basename(path.dirname(filePath));
    const name = frontmatter?.get("name");
    const description = frontmatter?.get("description");

    if (name === undefined || name.length === 0) {
      errors.push(`${relativePath}: missing name`);
    } else if (name !== skillDirectoryName) {
      errors.push(
        `${relativePath}: name "${name}" does not match directory "${skillDirectoryName}"`,
      );
    }

    if (description === undefined || description.length === 0) {
      errors.push(`${relativePath}: missing description`);
    }
  }

  if (content.includes("list_projects")) {
    errors.push(`${relativePath}: stale list_projects thread-tool reference`);
  }

  if (
    path.extname(filePath) === ".yaml" &&
    path.basename(path.dirname(filePath)) === "agents"
  ) {
    if (!/^interface:\s*$/m.test(content)) {
      errors.push(`${relativePath}: missing interface block`);
    }

    for (const fieldName of requiredAgentInterfaceFields) {
      if (!hasYamlField(content, fieldName)) {
        errors.push(`${relativePath}: missing interface.${fieldName}`);
      }
    }
  }
}

const templateRoot = path.join(
  skillsRoot,
  "execution-loop",
  "linear-setup",
  "assets",
  "docs",
  "agents",
);

for (const templateName of requiredAgentTemplates) {
  try {
    await readFile(path.join(templateRoot, templateName), "utf8");
  } catch {
    errors.push(`linear-setup template missing: ${templateName}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Skill bundle validation passed.");
