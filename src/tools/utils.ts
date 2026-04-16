import os from "node:os";
import { readFile, writeFile, appendFile as fsAppendFile } from "node:fs/promises";
import path from "node:path";

export async function getSystemInfo(): Promise<{
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: string;
  freeMemory: string;
  homeDir: string;
  hostname: string;
}> {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
    homeDir: os.homedir(),
    hostname: os.hostname(),
  };
}

export async function readClipboard(): Promise<string> {
  return "";
}

export async function writeClipboard(_text: string): Promise<string> {
  return "";
}

export async function saveMemory(
  workspaceRoot: string,
  fact: string,
): Promise<{ success: boolean; message: string }> {
  const memoryFile = path.join(workspaceRoot, "memory.md");
  const timestamp = new Date().toISOString();
  const entry = `\n- [${timestamp}] ${fact}`;

  try {
    await fsAppendFile(memoryFile, entry, "utf-8");
    return { success: true, message: "Fact saved to memory." };
  } catch {
    try {
      await writeFile(memoryFile, "# Long-Term Memory\n" + entry, "utf-8");
      return { success: true, message: "Fact saved to memory (new file created)." };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save memory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}