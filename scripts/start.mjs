#!/usr/bin/env node
/**
 * AI Hub — One-command startup
 * Starts all services: WeWe RSS (Docker), fetch watcher, and WebUI
 * Usage: node scripts/start.mjs
 */

import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
};

function log(tag, color, msg) {
  console.log(`${color}[${tag}]${COLORS.reset} ${msg}`);
}

function tryExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
  } catch {
    return null;
  }
}

async function startWeWeRSS() {
  // Check if Docker is available
  if (!tryExec("docker --version")) {
    log("WeWe", COLORS.yellow, "Docker not found — skipping WeChat sources (optional)");
    return false;
  }

  // Check if container exists
  const containerExists = tryExec("docker inspect wewe-rss --format '{{.State.Status}}'");

  if (containerExists === "running") {
    log("WeWe", COLORS.green, "Already running on port 4000");
    return true;
  }

  if (containerExists) {
    // Container exists but not running
    tryExec("docker start wewe-rss");
    log("WeWe", COLORS.green, "Started (port 4000)");
    return true;
  }

  // Container doesn't exist — create it
  log("WeWe", COLORS.blue, "Creating WeWe RSS container (first time)...");
  const result = tryExec(`docker run -d \
    --name wewe-rss \
    -p 4000:4000 \
    -e DATABASE_TYPE=sqlite \
    -e AUTH_CODE=123456 \
    -e CRON_EXPRESSION="*/10 * * * *" \
    -v ${ROOT}/wewe-data:/app/data \
    cooderl/wewe-rss:latest`);

  if (result) {
    log("WeWe", COLORS.green, "Created and started (port 4000, scan every 10min)");
    log("WeWe", COLORS.yellow, "→ Open http://localhost:4000 to configure WeChat accounts (auth code: 123456)");
    return true;
  } else {
    log("WeWe", COLORS.yellow, "Failed to create container — WeChat sources will be skipped");
    return false;
  }
}

function startFetchWatch(hasWeWe) {
  if (!hasWeWe) {
    // No WeWe, just do a one-time fetch
    log("Fetch", COLORS.blue, "Running initial fetch...");
    try {
      execSync("node scripts/engine.mjs once", { cwd: ROOT, stdio: "inherit" });
    } catch {}
    return null;
  }

  log("Watch", COLORS.cyan, "Starting WeWe watcher (auto-fetch on update, check every 120s)");
  const proc = spawn("node", ["scripts/watch-wewe.mjs"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout.on("data", (d) => {
    const line = d.toString().trim();
    if (line && !line.includes("No updates")) {
      log("Watch", COLORS.cyan, line.replace(/^\[.*?\]\s*/, ""));
    }
  });
  proc.stderr.on("data", (d) => {
    log("Watch", COLORS.red, d.toString().trim());
  });
  return proc;
}

function startWebUI() {
  log("WebUI", COLORS.green, "Starting at http://localhost:3000");
  const proc = spawn("npx", ["next", "dev"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  proc.stdout.on("data", (d) => {
    const line = d.toString().trim();
    if (line && !line.includes("compiling")) {
      log("WebUI", COLORS.green, line.replace(/^\s*[▲○ƒ├└│─]+\s*/, "").trim());
    }
  });
  proc.stderr.on("data", (d) => {
    const line = d.toString().trim();
    if (line && !line.includes("ExperimentalWarning")) {
      log("WebUI", COLORS.red, line);
    }
  });
  return proc;
}

async function main() {
  console.log("");
  console.log(`${COLORS.green}╔══════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.green}║        AI Hub — Starting Up          ║${COLORS.reset}`);
  console.log(`${COLORS.green}╚══════════════════════════════════════╝${COLORS.reset}`);
  console.log("");

  // Step 1: WeWe RSS
  const hasWeWe = await startWeWeRSS();
  console.log("");

  // Step 2: Initial fetch if no data
  const db = path.join(ROOT, "data", "ai-hub.db");
  const newsCount = tryExec(`sqlite3 "${db}" "SELECT COUNT(*) FROM news"`) || "0";
  if (parseInt(newsCount) === 0) {
    log("Fetch", COLORS.blue, "No data found, running initial fetch...");
    try {
      execSync("node scripts/engine.mjs once && node scripts/fetch-papers.mjs", {
        cwd: ROOT,
        stdio: "inherit",
      });
    } catch {}
    console.log("");
  }

  // Step 3: Start watcher
  const watchProc = startFetchWatch(hasWeWe);
  console.log("");

  // Step 4: Start WebUI
  const webProc = startWebUI();

  // Wait a moment then print summary
  setTimeout(() => {
    console.log("");
    console.log(`${COLORS.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
    console.log(`${COLORS.green}  ✓ AI Hub is running!${COLORS.reset}`);
    console.log(`${COLORS.gray}    WebUI:     ${COLORS.reset}http://localhost:3000`);
    if (hasWeWe) {
      console.log(`${COLORS.gray}    WeWe RSS:  ${COLORS.reset}http://localhost:4000`);
      console.log(`${COLORS.gray}    Watcher:   ${COLORS.reset}Auto-fetch on WeChat updates`);
    }
    console.log(`${COLORS.gray}    Press Ctrl+C to stop${COLORS.reset}`);
    console.log(`${COLORS.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
    console.log("");
  }, 3000);

  // Handle cleanup on exit
  process.on("SIGINT", () => {
    console.log(`\n${COLORS.yellow}Shutting down...${COLORS.reset}`);
    if (watchProc) watchProc.kill();
    if (webProc) webProc.kill();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    if (watchProc) watchProc.kill();
    if (webProc) webProc.kill();
    process.exit(0);
  });
}

main();
