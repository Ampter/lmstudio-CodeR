import fs from "node:fs/promises";
import { resolveWorkspacePath } from "../runtime/guards.js";

export interface ReplacePatchOp {
  op: "replace";
  path: string;
  find: string;
  replace: string;
  count?: number;
}

export interface PatchResult {
  path: string;
  replacements: number;
}

export async function applyPatch(workspaceRoot: string, patch: ReplacePatchOp): Promise<PatchResult> {
  if (patch.op !== "replace") {
    throw new Error(`Unsupported patch op: ${patch.op}`);
  }

  const absolutePath = resolveWorkspacePath(workspaceRoot, patch.path);
  const original = await fs.readFile(absolutePath, "utf8");

  if (!original.includes(patch.find)) {
    throw new Error(`Patch context not found in ${patch.path}`);
  }

  const desiredCount = patch.count ?? 1;
  let replacements = 0;
  let next = original;

  while (next.includes(patch.find) && replacements < desiredCount) {
    next = next.replace(patch.find, patch.replace);
    replacements += 1;
  }

  if (replacements !== desiredCount) {
    throw new Error(`Expected ${desiredCount} replacements but applied ${replacements}.`);
  }

  await fs.writeFile(absolutePath, next, "utf8");
  return { path: patch.path, replacements };
}
