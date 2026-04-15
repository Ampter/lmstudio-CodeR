import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ALLOWLISTED_COMMANDS, LIMITS } from "../config.js";
import { resolveWorkspacePath } from "../runtime/guards.js";

const execFileAsync = promisify(execFile);

export interface CommandResult {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runCommand(workspaceRoot: string, command: string, args: string[] = []): Promise<CommandResult> {
  if (!ALLOWLISTED_COMMANDS.has(command)) {
    throw new Error(`Command not allowlisted: ${command}`);
  }

  const cwd = resolveWorkspacePath(workspaceRoot, ".");

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      timeout: LIMITS.commandTimeoutMs,
      maxBuffer: LIMITS.commandOutputMaxBytes,
    });

    return {
      command: [command, ...args].join(" "),
      stdout,
      stderr,
      exitCode: 0,
    };
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: number };
    return {
      command: [command, ...args].join(" "),
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message,
      exitCode: typeof err.code === "number" ? err.code : 1,
    };
  }
}
