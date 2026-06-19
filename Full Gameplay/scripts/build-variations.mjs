import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");
const network = process.env.AD_NETWORK || "applovin";
const deploymentRoot = path.join(projectRoot, "dist-variations", network);

const variations = [
  {
    mode: "10_CLICKS",
    slug: "10-clicks",
    label: "10-clicks interaction limit",
  },
  {
    mode: "60_SECONDS",
    slug: "60-seconds",
    label: "60-second time limit",
  },
  {
    mode: "FULL",
    slug: "full",
    label: "full unrestricted gameplay",
  },
];

function assertBuildOutput(variation, outputFile) {
  if (!fs.existsSync(outputFile)) {
    throw new Error(`Missing build output for ${variation.mode}: ${outputFile}`);
  }

  const html = fs.readFileSync(outputFile, "utf8");
  if (!html.startsWith("<!-- ad-network:")) {
    throw new Error(`${variation.mode} build is missing the required ad-network comment on line 1.`);
  }
  if (/<script[^>]*type="module"/.test(html)) {
    throw new Error(`${variation.mode} build still contains a module script.`);
  }
  if (/<script[^>]*crossorigin/.test(html)) {
    throw new Error(`${variation.mode} build still contains a crossorigin script attribute.`);
  }
}

fs.mkdirSync(deploymentRoot, { recursive: true });

for (const variation of variations) {
  const outDir = `dist-inline-${network}-${variation.mode}`;
  console.log(`\n[build:variations] Building ${variation.mode} (${variation.label}) -> ${outDir}`);

  const result = spawnSync(
    process.execPath,
    [viteBin, "build", "--config", "vite/config-inline.prod.mjs"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        AD_NETWORK: network,
        BUILD_MODE: variation.mode,
        ITERATION_MODE: variation.mode,
      },
      stdio: "inherit",
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const outputFile = path.join(projectRoot, outDir, "index.html");
  assertBuildOutput(variation, outputFile);

  const standaloneFile = path.join(deploymentRoot, `coin-sort-${variation.slug}-${network}.html`);
  fs.copyFileSync(outputFile, standaloneFile);
  console.log(`[build:variations] Standalone file: ${path.relative(projectRoot, standaloneFile)}`);
}

console.log("\n[build:variations] Completed production builds:");
for (const variation of variations) {
  console.log(`- dist-inline-${network}-${variation.mode}/index.html`);
  console.log(`- dist-variations/${network}/coin-sort-${variation.slug}-${network}.html`);
}
