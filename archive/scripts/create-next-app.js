/*
Usage:
  Use the shared generator to add new apps with the standard config files:
  ```
    pnpm create:next-app <app-name> --port 3335
  ```
  This seeds a Next.js app in `apps/<app-name>` using the shared `@lib/config` presets.
*/

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const name = args.find((arg) => !arg.startsWith("--"));

const portFlagIndex = args.indexOf("--port");
const port = portFlagIndex !== -1 ? args[portFlagIndex + 1] : "3000";

if (!name) {
  console.error("Usage: pnpm create:next-app <name> [--port 3000]");
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(name)) {
  console.error("App name must be lowercase letters, numbers, or hyphens.");
  process.exit(1);
}

if (!/^\d+$/.test(port)) {
  console.error("Port must be a number.");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const templateDir = path.join(rootDir, "scripts", "create-next-app");
const appsDir = path.join(rootDir, "apps");
const targetDir = path.join(appsDir, name);

if (!fs.existsSync(templateDir)) {
  console.error(`Template directory not found: ${templateDir}`);
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`Target already exists: ${targetDir}`);
  process.exit(1);
}

const textExtensions = new Set([".js", ".cjs", ".ts", ".tsx", ".json", ".css", ".md", ".d.ts"]);

const copyDir = (source, destination) => {
  fs.mkdirSync(destination, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
};

const replaceTokensInFile = (filePath) => {
  const extension = path.extname(filePath);
  const baseName = path.basename(filePath);
  const isText = textExtensions.has(extension) || baseName === "package.json";

  if (!isText) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const updated = contents.replace(/__APP_NAME__/g, name).replace(/__DEV_PORT__/g, port);

  if (updated !== contents) {
    fs.writeFileSync(filePath, updated, "utf8");
  }
};

const replaceTokensInDir = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replaceTokensInDir(entryPath);
      continue;
    }

    replaceTokensInFile(entryPath);
  }
};

copyDir(templateDir, targetDir);
replaceTokensInDir(targetDir);

console.log(`Created new app at ${path.relative(rootDir, targetDir)}`);
console.log("Next steps:");
console.log(`  pnpm install`);
console.log(`  pnpm --filter ${name} dev`);
