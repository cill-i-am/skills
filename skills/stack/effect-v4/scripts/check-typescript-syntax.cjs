#!/usr/bin/env node
/** Parse TypeScript source and fenced examples. This is NOT a semantic typecheck. */
const fs = require("node:fs")
const path = require("node:path")
const root = path.resolve(__dirname, "..")
let ts
try {
  ts = require(process.env.EFFECT_SYNTAX_COMPILER ?? "typescript")
} catch {
  try { ts = require(path.join(root, "examples/node_modules/typescript")) }
  catch {
    console.error("TypeScript is not available. Install the example dev dependency or supply NODE_PATH for an existing compiler.")
    process.exit(2)
  }
}
if (typeof ts.createSourceFile !== "function") {
  console.error("This TypeScript package does not expose the JavaScript parser API. Use npm run check for semantic checking, or point EFFECT_SYNTAX_COMPILER to an available parser-compatible TypeScript module for syntax-only checking.")
  process.exit(2)
}
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (["node_modules", "dist", ".git"].includes(entry.name)) return []
  const filename = path.join(dir, entry.name)
  return entry.isDirectory() ? walk(filename) : [filename]
})
const files = walk(root)
const sources = []
for (const filename of files) {
  const content = fs.readFileSync(filename, "utf8")
  if (/\.tsx?$/.test(filename)) sources.push({ name: path.relative(root, filename), content, kind: filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS })
  if (filename.endsWith(".md")) {
    let index = 0
    for (const match of content.matchAll(/```(?:ts|typescript|tsx)\n([\s\S]*?)\n```/g)) {
      sources.push({ name: `${path.relative(root, filename)}#typescript-${++index}`, content: match[1], kind: ts.ScriptKind.TS })
    }
  }
}
const errors = []
for (const source of sources) {
  const parsed = ts.createSourceFile(source.name, source.content, ts.ScriptTarget.Latest, true, source.kind)
  for (const diagnostic of parsed.parseDiagnostics) {
    const location = parsed.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
    errors.push({ file: source.name, line: location.line + 1, column: location.character + 1,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") })
  }
}
console.log(JSON.stringify({
  check: "TypeScript syntax parsing only", typescript: ts.version,
  sources: sources.length, errors,
  status: errors.length ? "failed" : "passed",
  limitation: "Does not resolve Effect imports, validate overloads/types, execute code, or prove runtime behaviour."
}, null, 2))
process.exitCode = errors.length ? 1 : 0
