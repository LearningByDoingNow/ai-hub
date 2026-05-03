import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  const { task } = await req.json();

  const scripts: Record<string, string> = {
    news: "scripts/engine.mjs",
    papers: "scripts/fetch-papers.mjs",
    all: "scripts/engine.mjs",
  };

  const script = scripts[task];
  if (!script) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }

  const scriptPath = path.join(process.cwd(), script);

  return new Promise<NextResponse>((resolve) => {
    const args = task === "all" ? [scriptPath, "once"] : [scriptPath];
    execFile("node", args, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({
          ok: false,
          error: error.message,
          output: stderr || stdout,
        }));
      } else {
        resolve(NextResponse.json({
          ok: true,
          output: stdout,
        }));
      }
    });
  });
}
