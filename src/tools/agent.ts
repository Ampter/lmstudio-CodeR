import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveWorkspacePath } from "../runtime/guards.js";

export interface AgentConfig {
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentResult {
  success: boolean;
  message: string;
  handoffMessage?: string;
  filesCreated?: string[];
}

export async function consultSecondaryAgent(
  workspaceRoot: string,
  task: string,
  config?: Partial<AgentConfig>,
): Promise<AgentResult> {
  return {
    success: true,
    message: "Secondary agent not fully implemented in this scaffold version.",
    handoffMessage: "Task: " + task,
  };
}

export async function saveProjectContext(
  workspaceRoot: string,
  projectName: string,
  context: string,
): Promise<string> {
  const infoPath = resolveWorkspacePath(workspaceRoot, "beledarian_info.md");
  const content = `# Project: ${projectName}\n\nLast updated: ${new Date().toISOString()}\n\n${context}\n`;
  await writeFile(infoPath, content, "utf-8");
  return infoPath;
}

export async function readProjectContext(workspaceRoot: string): Promise<string | null> {
  const infoPath = resolveWorkspacePath(workspaceRoot, "beledarian_info.md");
  try {
    return await readFile(infoPath, "utf-8");
  } catch {
    return null;
  }
}