import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { DEFAULT_IGNORES, LIMITS } from "../config.js";
import { resolveWorkspacePath } from "../runtime/guards.js";

export async function listFiles(workspaceRoot: string, pattern = "**/*", limit = 200): Promise<string[]> {
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const entries = await fg(pattern, {
    cwd: root,
    ignore: DEFAULT_IGNORES,
    onlyFiles: true,
    unique: true,
  });

  return entries.slice(0, limit);
}

export async function readFile(workspaceRoot: string, userPath: string): Promise<string> {
  const absolutePath = resolveWorkspacePath(workspaceRoot, userPath);
  const stat = await fs.stat(absolutePath);
  if (stat.size > LIMITS.fileReadMaxBytes) {
    throw new Error(`File too large (${stat.size} bytes).`);
  }

  return fs.readFile(absolutePath, "utf8");
}

export async function searchCode(
  workspaceRoot: string,
  pattern: string,
  filePattern = "**/*.{ts,tsx,js,jsx,py,rs,go,java,md,json}",
): Promise<Array<{ file: string; line: number; snippet: string }>> {
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const files = await listFiles(root, filePattern, 500);
  const regex = new RegExp(pattern, "i");
  const hits: Array<{ file: string; line: number; snippet: string }> = [];

  for (const file of files) {
    const content = await fs.readFile(path.join(root, file), "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((lineText, index) => {
      if (regex.test(lineText)) {
        hits.push({ file, line: index + 1, snippet: lineText.trim() });
      }
    });
  }

  return hits.slice(0, 200);
}
