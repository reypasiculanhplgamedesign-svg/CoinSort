import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");
const network = process.env.AD_NETWORK || "applovin";

const variations = [
  {
    mode: "10_CLICKS",
    label: "10-clicks interaction limit",
  },
  {
    mode: "60_SECONDS",
    label: "60-second time limit",
  },
  {
    mode: "FULL",
    label: "full unrestricted gameplay",
  },
];

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
}

console.log("\n[build:variations] Completed production builds:");
for (const variation of variations) {
  console.log(`- dist-inline-${network}-${variation.mode}/index.html`);
}
