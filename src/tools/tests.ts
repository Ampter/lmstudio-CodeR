import { runCommand, type CommandResult } from "./terminal.js";

export async function runTests(workspaceRoot: string, command?: string): Promise<CommandResult> {
  if (command) {
    const [head, ...parts] = command.split(" ");
    return runCommand(workspaceRoot, head, parts);
  }

  return runCommand(workspaceRoot, "npm", ["test"]);
}
