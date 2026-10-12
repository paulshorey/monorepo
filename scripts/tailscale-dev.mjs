import { readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shared = process.env.TAILSCALE_DEV_HOME ?? path.join(os.homedir(), "git", "tailscale-dev");
try {
  const manifest = JSON.parse(await readFile(path.join(shared, "package.json"), "utf8"));
  if (manifest.name !== "@paulshorey/tailscale-dev" || !manifest.version.startsWith("1.")) {
    throw new Error("This profile requires version 1 of the shared Tailscale development tool.");
  }
  const { runCli } = await import(pathToFileURL(path.join(shared, "cli.mjs")).href);
  const [action = "start", ...args] = process.argv.slice(2).filter((arg) => arg !== "--");
  await runCli([action, `--root=${root}`, ...args]);
} catch (error) {
  console.error(error.code === "ENOENT" ? `Install the shared tool at ${shared}; see tailscale.dev.json and the project Tailscale guide.` : error.message);
  process.exitCode = 1;
}
