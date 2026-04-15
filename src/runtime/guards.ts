import path from "node:path";

const BLOCKED_SEGMENTS = [
  "/etc",
  "/proc",
  "/sys",
  "/var/run",
  "/root/.ssh",
  "/home/.ssh",
];

export function resolveWorkspacePath(workspaceRoot: string, userPath: string): string {
  const resolved = path.resolve(workspaceRoot, userPath);
  const normalizedRoot = path.resolve(workspaceRoot);
  if (!resolved.startsWith(normalizedRoot + path.sep) && resolved !== normalizedRoot) {
    throw new Error(`Path escapes workspace: ${userPath}`);
  }

  const blocked = BLOCKED_SEGMENTS.find((segment) => resolved.startsWith(segment));
  if (blocked) {
    throw new Error(`Path targets blocked segment: ${blocked}`);
  }

  return resolved;
}

export function assertDepth(depth: number, maxDepth: number): number {
  if (!Number.isInteger(depth) || depth < 0) {
    throw new Error("Depth must be a non-negative integer.");
  }

  if (depth > maxDepth) {
    throw new Error(`Depth ${depth} exceeds max depth ${maxDepth}.`);
  }

  return depth;
}
