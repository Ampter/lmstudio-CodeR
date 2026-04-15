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
