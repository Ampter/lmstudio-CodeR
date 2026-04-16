import { runCommand } from "./terminal.js";

export async function gitStatus(workspaceRoot: string): Promise<string> {
  const result = await runCommand(workspaceRoot, "git", ["status", "--short"]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to read git status.");
  }

  return result.stdout.trim();
}

export async function gitDiff(workspaceRoot: string, staged = false): Promise<string> {
  const args = staged ? ["diff", "--staged"] : ["diff"];
  const result = await runCommand(workspaceRoot, "git", args);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to read git diff.");
  }

  return result.stdout;
}

export async function gitCommit(workspaceRoot: string, message: string): Promise<{ success: boolean; summary: string }> {
  const result = await runCommand(workspaceRoot, "git", ["commit", "-m", message]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to commit.");
  }

  return { success: true, summary: result.stdout };
}

export async function gitLog(workspaceRoot: string, maxCount = 10): Promise<string[]> {
  const result = await runCommand(workspaceRoot, "git", ["log", `--max-count=${maxCount}`, "--oneline"]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to read git log.");
  }

  return result.stdout.trim().split("\n").filter(Boolean);
}
