import { readFile } from "node:fs/promises";
import { resolveWorkspacePath } from "../runtime/guards.js";

export async function readDocument(
  workspaceRoot: string,
  filePath: string,
): Promise<{ content: string; metadata?: Record<string, unknown> }> {
  const absolutePath = resolveWorkspacePath(workspaceRoot, filePath);
  const ext = absolutePath.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return readPdf(absolutePath);
  } else if (ext === "docx") {
    return readDocx(absolutePath);
  }

  throw new Error("Unsupported document format. Use read_file for text files.");
}

async function readPdf(filePath: string): Promise<{ content: string; metadata?: Record<string, unknown> }> {
  const dataBuffer = await readFile(filePath);
  const text = extractTextFromPdf(dataBuffer);
  return { content: text };
}

function extractTextFromPdf(buffer: Buffer): string {
  const text = "";
  let inText = false;
  let textContent = "";

  const str = buffer.toString("binary");
  for (let i = 0; i < str.length; i++) {
    if (str.slice(i, i + 5) === "BT\n") {
      inText = true;
    }
    if (str.slice(i, i + 3) === "ET\n") {
      inText = false;
      textContent += " ";
    }
    if (inText && str[i].charCodeAt(0) >= 32 && str[i].charCodeAt(0) <= 126) {
      textContent += str[i];
    }
  }

  return textContent.trim();
}

async function readDocx(filePath: string): Promise<{ content: string; metadata?: Record<string, unknown> }> {
  return { content: "DOCX reading requiresadm-zip dependency. Install manually if needed." };
}