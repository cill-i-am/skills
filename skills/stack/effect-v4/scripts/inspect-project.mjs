#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const requested = path.resolve(process.argv[2] ?? process.cwd())
const readJson = (filename) => JSON.parse(fs.readFileSync(filename, "utf8"))
const ancestors = (start) => {
  const paths = []
  for (let current = start;; current = path.dirname(current)) {
    paths.push(current)
    if (path.dirname(current) === current) break
  }
  return paths
}

try {
  if (!fs.statSync(requested).isDirectory()) throw new Error("Project path must be a directory")
  const roots = ancestors(requested)
  const root = roots.find((dir) => fs.existsSync(path.join(dir, "package.json")))
  if (!root) throw new Error("No package.json found in the directory or its ancestors")
  const manifest = readJson(path.join(root, "package.json"))
  const declared = { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies }
  const req = createRequire(path.join(root, "package.json"))
  const packages = Object.keys(declared).filter((name) => name === "effect" || name.startsWith("@effect/"))
  if (!packages.includes("effect")) packages.unshift("effect")
  const resolved = packages.sort().map((name) => {
    try {
      const filename = req.resolve(`${name}/package.json`)
      const pkg = readJson(filename)
      return { name, declared: declared[name] ?? null, installed: pkg.version,
        metadata: filename, peerDependencies: pkg.peerDependencies ?? {}, status: "resolved" }
    } catch (error) {
      return { name, declared: declared[name] ?? null, installed: null,
        status: "metadata-not-resolved", reason: error.code ?? error.message }
    }
  })
  const effect = resolved.find((item) => item.name === "effect")
  const major = effect?.installed ? Number(effect.installed.split(".")[0]) : null
  const report = {
    requested, packageRoot: root, packageName: manifest.name ?? null,
    mode: "read-only metadata inspection; no installation, imports, or project scripts executed",
    installedEffectV4: major === 4,
    packages: resolved,
    lockfiles: roots.flatMap((dir) => ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"]
      .map((name) => path.join(dir, name)).filter((file) => fs.existsSync(file))),
    typeConfigurations: roots.map((dir) => path.join(dir, "tsconfig.json")).filter((file) => fs.existsSync(file)),
    scripts: manifest.scripts ?? {},
    conclusion: major === 4
      ? "Installed Effect 4 identified. Check integration peer ranges and the relevant declarations next."
      : major === null
        ? "Installed Effect could not be resolved. Declared ranges alone do not prove an installed version."
        : "This skill targets Effect 4. Do not apply its snippets to the detected different major."
  }
  console.log(JSON.stringify(report, null, 2))
  process.exitCode = major === 4 ? 0 : 1
} catch (error) {
  console.error(JSON.stringify({ error: error.message, requested }, null, 2))
  process.exitCode = 2
}
