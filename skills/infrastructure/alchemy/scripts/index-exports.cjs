// Enumerate public import targets and names from the release's TypeScript source.
// Run after installing assets/examples. No project code or provider is executed.
const fs = require("node:fs");
const path = require("node:path");
const ts = require(require.resolve("typescript", { paths: [path.join(__dirname, "../assets/examples")] }));

const root = path.resolve(process.argv[2]);
const targets = new Map();
const files = new Set();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(name) : [name];
  });
}

for (const dir of fs.readdirSync(path.join(root, "packages"))) {
  const base = path.join(root, "packages", dir);
  const pkg = JSON.parse(fs.readFileSync(path.join(base, "package.json"), "utf8"));
  if (pkg.private) continue;
  const source = walk(path.join(base, "src")).filter((file) => file.endsWith(".ts"));
  for (const file of source) files.add(file);
  for (const [subpath, condition] of Object.entries(pkg.exports || {})) {
    let target = typeof condition === "string" ? condition : condition.bun || condition.default || condition.types;
    if (!target) continue;
    if (dir === "frontend-frameworks") {
      target = target.replace(/^\.\/dist\//, "./src/").replace(/(?:\.d\.ts|\.js)$/, ".ts");
    }
    const name = pkg.name + (subpath === "." ? "" : subpath.slice(1));
    const full = path.resolve(base, target);
    if (full.includes("*")) {
      const [prefix, suffix] = full.split("*");
      for (const file of source) {
        if (!file.startsWith(prefix) || !file.endsWith(suffix)) continue;
        const key = name.replace("*", file.slice(prefix.length, file.length - suffix.length));
        if (!targets.has(key)) targets.set(key, file);
      }
    } else {
      const declaration = full.replace(/\.ts$/, ".d.ts");
      targets.set(name, !fs.existsSync(full) && fs.existsSync(declaration) ? declaration : full);
    }
  }
}
const options = { noLib: true, skipLibCheck: true, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, allowImportingTsExtensions: true, types: [] };
const host = ts.createCompilerHost(options);
host.resolveModuleNames = (names, from) => names.map((name) => {
  let file = targets.get(name);
  if (!file && name.startsWith(".")) {
    const base = path.resolve(path.dirname(from), name);
    file = [base, base.replace(/\.js$/, ".ts"), base + ".ts", base + "/index.ts"].find((f) => files.has(f));
  }
  return files.has(file) ? { resolvedFileName: file, extension: ts.Extension.Ts } : undefined;
});
const program = ts.createProgram([...files], options, host);
const checker = program.getTypeChecker();
for (const [name, file] of [...targets].sort(([a],[b]) => a.localeCompare(b, "en"))) {
  const source = program.getSourceFile(file);
  const symbol = source && checker.getSymbolAtLocation(source);
  const exports = symbol ? checker.getExportsOfModule(symbol).map((e) => e.name).sort() : [];
  process.stdout.write(JSON.stringify([name, path.relative(root, file), exports]) + "\n");
}
