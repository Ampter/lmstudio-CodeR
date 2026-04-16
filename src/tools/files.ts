import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { DEFAULT_IGNORES, LIMITS } from "../config.js";
import { resolveWorkspacePath } from "../runtime/guards.js";

export async function makeDirectory(workspaceRoot: string, dirName: string): Promise<string> {
  const absolutePath = resolveWorkspacePath(workspaceRoot, dirName);
  await fs.mkdir(absolutePath, { recursive: true });
  return absolutePath;
}

export async function deletePath(workspaceRoot: string, targetPath: string): Promise<string> {
  const absolutePath = resolveWorkspacePath(workspaceRoot, targetPath);
  await fs.rm(absolutePath, { recursive: true, force: true });
  return absolutePath;
}

export async function moveFile(workspaceRoot: string, source: string, destination: string): Promise<{ from: string; to: string }> {
  const sourcePath = resolveWorkspacePath(workspaceRoot, source);
  const destPath = resolveWorkspacePath(workspaceRoot, destination);
  await fs.rename(sourcePath, destPath);
  return { from: sourcePath, to: destPath };
}

export async function copyFile(workspaceRoot: string, source: string, destination: string): Promise<{ from: string; to: string }> {
  const sourcePath = resolveWorkspacePath(workspaceRoot, source);
  const destPath = resolveWorkspacePath(workspaceRoot, destination);
  await fs.copyFile(sourcePath, destPath);
  return { from: sourcePath, to: destPath };
}

export async function replaceTextInFile(
  workspaceRoot: string,
  fileName: string,
  oldString: string,
  newString: string,
): Promise<{ success: boolean; message: string }> {
  const filePath = resolveWorkspacePath(workspaceRoot, fileName);
  const content = await fs.readFile(filePath, "utf8");

  if (!content.includes(oldString)) {
    return { success: false, message: "Could not find the exact 'old_string' in the file." };
  }

  const occurrenceCount = content.split(oldString).length - 1;
  if (occurrenceCount > 1) {
    return { success: false, message: `Found ${occurrenceCount} occurrences of 'old_string'. Please provide more context to make it unique.` };
  }

  const newContent = content.replace(oldString, newString);
  await fs.writeFile(filePath, newContent, "utf8");
  return { success: true, message: `Successfully replaced text in ${fileName}` };
}

export async function deleteFilesByPattern(workspaceRoot: string, pattern: string): Promise<{ deletedCount: number; deletedFiles: string[] }> {
  if (pattern.length > 100) {
    throw new Error("Pattern too complex (max 100 characters)");
  }

  const regex = new RegExp(pattern);
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const files = await fg("*", { cwd: root, onlyFiles: true });
  const deleted: string[] = [];

  for (const file of files) {
    if (regex.test(file)) {
      await fs.rm(path.join(root, file), { force: true });
      deleted.push(file);
    }
  }

  return { deletedCount: deleted.length, deletedFiles: deleted };
}

export async function findFiles(workspaceRoot: string, pattern: string, limit = 200): Promise<string[]> {
  return listFiles(workspaceRoot, pattern, limit);
}

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
