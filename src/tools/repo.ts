import fg from "fast-glob";
import path from "node:path";
import { DEFAULT_IGNORES, LIMITS } from "../config.js";
import { assertDepth, resolveWorkspacePath } from "../runtime/guards.js";
import type { RepoTreeResult } from "../types.js";

export async function getRepoTree(workspaceRoot: string, depth = 3): Promise<RepoTreeResult> {
  const normalizedDepth = assertDepth(depth, LIMITS.maxRepoTreeDepth);
  const root = resolveWorkspacePath(workspaceRoot, ".");

  const entries = await fg("**/*", {
    cwd: root,
    dot: true,
    onlyFiles: false,
    unique: true,
    deep: normalizedDepth,
    ignore: DEFAULT_IGNORES,
  });

  const lines = entries
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => {
      const parts = entry.split("/");
      const indent = "  ".repeat(parts.length - 1);
      return `${indent}- ${path.basename(entry)}`;
    });

  return { root, tree: lines.join("\n") };
}
