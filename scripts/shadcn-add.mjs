import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uiKitDir = path.join(rootDir, "packages", "ui-kit", "src");
const componentsJsonPath = path.join(rootDir, "components.json");
const tsconfigPath = path.join(rootDir, "tsconfig.json");

const internalRoots = [
  "@internal-ui-kit/components/ui",
  "@internal-ui-kit/components",
  "@internal-ui-kit/lib",
  "@internal-ui-kit/lib/utils",
];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function makeRelativeImport(fromFile, source) {
  const targetPath = path.resolve(rootDir, source);
  let relativePath = path.relative(path.dirname(fromFile), targetPath);

  if (!relativePath.startsWith(".")) {
    relativePath = `./${relativePath}`;
  }

  return toPosix(relativePath);
}

async function withTemporaryShadcnConfig(run) {
  const [originalComponentsJson, originalTsconfig] = await Promise.all([
    fs.readFile(componentsJsonPath, "utf8"),
    fs.readFile(tsconfigPath, "utf8"),
  ]);

  const parsedComponentsJson = JSON.parse(originalComponentsJson);
  const parsedTsconfig = JSON.parse(originalTsconfig);

  parsedComponentsJson.aliases = {
    ...parsedComponentsJson.aliases,
    components: "@internal-ui-kit/components",
    utils: "@internal-ui-kit/lib/utils",
    ui: "@internal-ui-kit/components/ui",
    lib: "@internal-ui-kit/lib",
  };

  parsedTsconfig.compilerOptions.paths = {
    ...parsedTsconfig.compilerOptions.paths,
    "@internal-ui-kit/*": ["./packages/ui-kit/src/*"],
  };

  await Promise.all([
    fs.writeFile(componentsJsonPath, JSON.stringify(parsedComponentsJson, null, 2), "utf8"),
    fs.writeFile(tsconfigPath, JSON.stringify(parsedTsconfig, null, 2), "utf8"),
  ]);

  try {
    await run();
  } finally {
    await Promise.all([
      fs.writeFile(componentsJsonPath, originalComponentsJson, "utf8"),
      fs.writeFile(tsconfigPath, originalTsconfig, "utf8"),
    ]);
  }
}

function rewriteImportSpecifiers(filePath, content) {
  return content.replace(
    /((?:import|export)\s[^"']*?\sfrom\s*|import\()\s*["']([^"']+)["']/g,
    (fullMatch, prefix, source) => {
      if (!internalRoots.some((root) => source === root || source.startsWith(`${root}/`))) {
        return fullMatch;
      }

      const rewrittenSource = makeRelativeImport(filePath, source);
      const quote = fullMatch.includes('"') ? '"' : "'";

      return `${prefix}${quote}${rewrittenSource}${quote}`;
    }
  );
}

async function collectSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return collectSourceFiles(fullPath);
      }

      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

async function rewriteUiKitImports() {
  const files = await collectSourceFiles(uiKitDir);

  await Promise.all(
    files.map(async (filePath) => {
      const original = await fs.readFile(filePath, "utf8");
      const rewritten = rewriteImportSpecifiers(filePath, original);

      if (rewritten !== original) {
        await fs.writeFile(filePath, rewritten, "utf8");
      }
    })
  );
}

function runShadcn(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("./node_modules/.bin/shadcn", args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`shadcn exited with code ${code}`));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  await withTemporaryShadcnConfig(() => runShadcn(args));

  if (args.includes("--dry-run")) {
    return;
  }

  await rewriteUiKitImports();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
