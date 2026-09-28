#!/usr/bin/env node
/**
 * Fetch secrets from Infisical and write to .env files.
 *
 * Required environment variables:
 *   INFISICAL_MACHINE_CLIENT_SECRET - Machine identity client secret
 *   INFISICAL_MACHINE_CLIENT_ID     - Machine identity client ID
 *   INFISICAL_PROJECT_ID            - Project ID (found in Project Settings or URL)
 *
 * Backward-compatible alias:
 *   INFISICAL_MACHINE_ID - Used as the client ID if INFISICAL_MACHINE_CLIENT_ID is not set
 *
 * Optional environment variables:
 *   INFISICAL_ENV        - Environment slug (default: "dev")
 *   INFISICAL_SITE_URL   - Custom Infisical instance URL (default: https://app.infisical.com)
 *
 * Usage:
 *   node scripts/fetch-infisical.mjs /m/apps/log-next apps/log-next/.env
 *   node scripts/fetch-infisical.mjs --app write-node
 *   node scripts/fetch-infisical.mjs --all
 *   pnpm run env:pull -- /m/apps/log-next apps/log-next/.env
 *   pnpm run env:pull:all
 */

import { InfisicalSDK } from "@infisical/sdk";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// App configurations: logical app name -> candidate Infisical paths + local .env path.
// Candidate paths let us migrate app names without breaking existing secret mounts.
const APPS = [
  {
    name: "log-next",
    outputFile: "apps/log-next/.env",
    infisicalPaths: ["/trading/apps/log-next"],
  },
  {
    name: "view-next",
    outputFile: "apps/view-next/.env",
    infisicalPaths: ["/trading/apps/view-next"],
  },
  {
    name: "write-node",
    outputFile: "apps/write-node/.env",
    infisicalPaths: ["/trading/apps/write-node"],
  },
  {
    name: "tradingview-node",
    outputFile: "apps/tradingview-node/.env",
    infisicalPaths: ["/trading/apps/tradingview-node"],
  },
];

const APPS_BY_NAME = new Map(APPS.map((app) => [app.name, app]));

function normalizeSecretPath(secretPath) {
  if (!secretPath || secretPath === "/") {
    return "/";
  }

  return secretPath.replace(/\/+$/, "") || "/";
}

async function createAuthenticatedClient(options) {
  const { clientId, clientSecret, siteUrl } = options;

  const client = new InfisicalSDK({
    siteUrl: siteUrl || undefined,
  });

  await client.auth().universalAuth.login({
    clientId,
    clientSecret,
  });

  return client;
}

async function fetchSecrets(infisicalPath, outputFile, options) {
  const { client, projectId, env } = options;

  // Fetch secrets from the specified path
  const secrets = await client.secrets().listSecrets({
    projectId,
    environment: env,
    secretPath: infisicalPath,
    expandSecretReferences: true,
    includeImports: false,
  });

  const requestedPath = normalizeSecretPath(infisicalPath);
  const returnedPaths = [...new Set(secrets.secrets.map((secret) => normalizeSecretPath(secret.secretPath)))];

  if (requestedPath !== "/" && returnedPaths.length > 0 && !returnedPaths.includes(requestedPath)) {
    throw new Error(`Infisical returned secrets from ${returnedPaths.join(", ")} for requested path ${requestedPath}; refusing to overwrite ${outputFile}.`);
  }

  // Convert to dotenv format
  const dotenvContent = secrets.secrets.map((secret) => `${secret.secretKey}=${secret.secretValue}`).join("\n");

  // Ensure output directory exists
  const fullPath = outputFile.startsWith("/") ? outputFile : resolve(ROOT, outputFile);
  mkdirSync(dirname(fullPath), { recursive: true });

  // Write .env file
  writeFileSync(fullPath, dotenvContent + "\n", "utf-8");

  console.log(`✓ ${infisicalPath} → ${outputFile} (${secrets.secrets.length} secrets)`);
}

async function fetchAppSecrets(app, options) {
  const errors = [];

  for (const infisicalPath of app.infisicalPaths) {
    try {
      await fetchSecrets(infisicalPath, app.outputFile, options);
      return;
    } catch (error) {
      errors.push(`${infisicalPath}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | "));
}

async function main() {
  const clientId = process.env.INFISICAL_MACHINE_CLIENT_ID || process.env.INFISICAL_MACHINE_ID;
  const clientSecret = process.env.INFISICAL_MACHINE_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID;
  const env = process.env.INFISICAL_ENV || "dev";
  const siteUrl = process.env.INFISICAL_SITE_URL;

  if (!clientId) {
    console.error("Error: INFISICAL_MACHINE_CLIENT_ID environment variable is required.");
    console.error("You can also use INFISICAL_MACHINE_ID as a compatibility alias.");
    console.error("Important: this must be the machine identity Client ID, not the identity record ID.");
    process.exit(1);
  }

  if (!clientSecret) {
    console.error("Error: INFISICAL_MACHINE_CLIENT_SECRET environment variable is required.");
    console.error("Set it to the client secret you created for the machine identity.");
    process.exit(1);
  }

  if (!projectId) {
    console.error("Error: INFISICAL_PROJECT_ID environment variable is required.");
    console.error("Find it in Project Settings or in the URL: https://app.infisical.com/project/{projectId}/...");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const client = await createAuthenticatedClient({ clientId, clientSecret, siteUrl });
  const options = { client, projectId, env };

  const appFlagIndex = args.indexOf("--app");
  const appName = appFlagIndex === -1 ? undefined : args[appFlagIndex + 1];

  if (appFlagIndex !== -1) {
    if (!appName) {
      console.error("Usage: fetch-infisical.mjs --app <app-name>");
      console.error(`Known apps: ${APPS.map((app) => app.name).join(", ")}`);
      process.exit(1);
    }

    const app = APPS_BY_NAME.get(appName);
    if (!app) {
      console.error(`Unknown app "${appName}".`);
      console.error(`Known apps: ${APPS.map((knownApp) => knownApp.name).join(", ")}`);
      process.exit(1);
    }

    await fetchAppSecrets(app, options);
    return;
  }

  // Handle --all flag to fetch all apps
  if (args.includes("--all") || args.length === 0) {
    console.log(`Fetching secrets for all apps (env: ${env})...\n`);
    for (const app of APPS) {
      try {
        await fetchAppSecrets(app, options);
      } catch (error) {
        console.error(`✗ ${app.name}: ${error.message}`);
      }
    }
  } else {
    // Single app: fetch-infisical.mjs <infisical-path> <output-file>
    const [infisicalPath, outputFile] = args;
    if (!infisicalPath || !outputFile) {
      console.error("Usage: fetch-infisical.mjs <infisical-path> <output-file>");
      console.error("       fetch-infisical.mjs --app <app-name>");
      console.error("       fetch-infisical.mjs --all");
      console.error("Example: fetch-infisical.mjs /m/apps/log-next apps/log-next/.env");
      process.exit(1);
    }
    await fetchSecrets(infisicalPath, outputFile, options);
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
