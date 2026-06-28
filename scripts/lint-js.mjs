import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src", "vite.config.js"];
const failures = [];

function collectJsFiles(path) {
  const stat = statSync(path);
  if (stat.isFile()) {
    return path.endsWith(".js") || path.endsWith(".mjs") ? [path] : [];
  }
  return readdirSync(path).flatMap((entry) => collectJsFiles(join(path, entry)));
}

const files = roots.flatMap(collectJsFiles);

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failures.push({ file, error: result.stderr || result.stdout });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`Syntax/module check failed: ${failure.file}`);
    console.error(failure.error);
  }
  process.exit(1);
}

console.log(`Checked ${files.length} JavaScript modules.`);
