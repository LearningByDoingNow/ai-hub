import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { existsSync } from "fs";

let running: string | null = null;

function runInBackground(script: string, args: string[] = []) {
  const cwd = process.cwd();
  return new Promise<void>((resolve) => {
    execFile("node", [path.join(cwd, script), ...args], { timeout: 180000 }, () => {
      resolve();
    });
  });
}

export async function POST(req: NextRequest) {
  const sqliteExists = existsSync(path.join(process.cwd(), "data", "ai-hub.db"));
  if (!sqliteExists) {
    return NextResponse.json(
      { ok: false, error: "Pipeline is not available in serverless environment. Run locally with: npm run fetch:all" },
      { status: 503 }
    );
  }

  const { task } = await req.json();

  const validTasks = ["news", "papers", "all"];
  if (!validTasks.includes(task)) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }

  if (running) {
    return NextResponse.json({ ok: true, status: "already_running", task: running });
  }

  running = task;

  const jobs: Promise<void>[] = [];
  if (task === "all" || task === "news") {
    jobs.push(runInBackground("scripts/engine.mjs", ["once"]));
  }
  if (task === "all" || task === "papers") {
    jobs.push(runInBackground("scripts/fetch-papers.mjs"));
  }

  Promise.all(jobs).finally(() => { running = null; });

  return NextResponse.json({ ok: true, status: "started", task });
}

export async function GET() {
  return NextResponse.json({ running });
}
