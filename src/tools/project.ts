import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspacePath } from "../runtime/guards.js";
import type { ProjectDetection } from "../types.js";

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function detectProject(workspaceRoot: string): Promise<ProjectDetection> {
  const root = resolveWorkspacePath(workspaceRoot, ".");

  const packageJson = path.join(root, "package.json");
  if (await exists(packageJson)) {
    return {
      language: "TypeScript/JavaScript",
      framework: "Node.js",
      testCommand: "npm test",
      buildCommand: "npm run build",
    };
  }

  if (await exists(path.join(root, "pyproject.toml")) || await exists(path.join(root, "requirements.txt"))) {
    return {
      language: "Python",
      framework: "Python ecosystem",
      testCommand: "pytest",
      buildCommand: "python -m build",
    };
  }

  if (await exists(path.join(root, "Cargo.toml"))) {
    return {
      language: "Rust",
      framework: "Cargo",
      testCommand: "cargo test",
      buildCommand: "cargo build",
    };
  }

  if (await exists(path.join(root, "go.mod"))) {
    return {
      language: "Go",
      framework: "Go modules",
      testCommand: "go test ./...",
      buildCommand: "go build ./...",
    };
  }

  if (await exists(path.join(root, "pom.xml")) || await exists(path.join(root, "build.gradle"))) {
    return {
      language: "JVM",
      framework: "Maven/Gradle",
      testCommand: "mvn test",
      buildCommand: "mvn package",
    };
  }

  return { language: "unknown" };
}
