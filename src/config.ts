import type { RuntimeLimits } from "./types.js";

export const DEFAULT_IGNORES = [
  "**/.git/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/vendor/**",
];

export const ALLOWLISTED_COMMANDS = new Set([
  "npm",
  "pnpm",
  "yarn",
  "node",
  "npx",
  "python",
  "pytest",
  "pip",
  "cargo",
  "go",
  "gradle",
  "mvn",
  "git",
]);

export const LIMITS: RuntimeLimits = {
  maxToolCalls: 30,
  maxFixAttempts: 5,
  maxWebSearchCalls: 5,
  commandTimeoutMs: 120_000,
  commandOutputMaxBytes: 120_000,
  fileReadMaxBytes: 100_000,
  maxRepoTreeDepth: 5,
};
