import { type PluginContext, type ToolsProviderController, tool, text } from "@lmstudio/sdk";
import { z } from "zod";
import { detectProject } from "./tools/project.js";
import { getRepoTree } from "./tools/repo.js";
import { listFiles, readFile, searchCode } from "./tools/files.js";
import { applyPatch, type ReplacePatchOp } from "./tools/patch.js";
import { runCommand } from "./tools/terminal.js";
import { runTests } from "./tools/tests.js";
import { gitDiff, gitStatus } from "./tools/git.js";
import { webSearch, getSiteContents } from "./tools/web.js";

let toolCallCount = 0;
let webSearchCount = 0;

export async function toolsProvider(ctl: ToolsProviderController) {
  const tools = [
    tool({
      name: "get_repo_tree",
      description: text`Get a depth-limited repository tree view`,
      parameters: { workspaceRoot: z.string(), depth: z.number().optional() },
      implementation: async ({ workspaceRoot, depth }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return getRepoTree(workspaceRoot, depth);
      },
    }),
    tool({
      name: "detect_project",
      description: text`Detect project ecosystem and suggest commands`,
      parameters: { workspaceRoot: z.string() },
      implementation: async ({ workspaceRoot }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return detectProject(workspaceRoot);
      },
    }),
    tool({
      name: "list_files",
      description: text`List files using glob pattern`,
      parameters: { workspaceRoot: z.string(), pattern: z.string().optional(), limit: z.number().optional() },
      implementation: async ({ workspaceRoot, pattern, limit }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return listFiles(workspaceRoot, pattern, limit);
      },
    }),
    tool({
      name: "read_file",
      description: text`Read file contents`,
      parameters: { workspaceRoot: z.string(), filePath: z.string() },
      implementation: async ({ workspaceRoot, filePath }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return readFile(workspaceRoot, filePath);
      },
    }),
    tool({
      name: "search_code",
      description: text`Search for code patterns in files`,
      parameters: { workspaceRoot: z.string(), pattern: z.string(), filePattern: z.string().optional() },
      implementation: async ({ workspaceRoot, pattern, filePattern }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return searchCode(workspaceRoot, pattern, filePattern);
      },
    }),
    tool({
      name: "apply_patch",
      description: text`Apply a structured code edit`,
      parameters: { workspaceRoot: z.string(), patch: z.record(z.string()) },
      implementation: async ({ workspaceRoot, patch }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return applyPatch(workspaceRoot, patch as unknown as ReplacePatchOp);
      },
    }),
    tool({
      name: "run_command",
      description: text`Run a shell command`,
      parameters: { workspaceRoot: z.string(), command: z.string(), args: z.array(z.string()).optional() },
      implementation: async ({ workspaceRoot, command, args }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return runCommand(workspaceRoot, command, args);
      },
    }),
    tool({
      name: "run_tests",
      description: text`Run project tests`,
      parameters: { workspaceRoot: z.string(), command: z.string().optional() },
      implementation: async ({ workspaceRoot, command }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return runTests(workspaceRoot, command);
      },
    }),
    tool({
      name: "git_status",
      description: text`Show git repository status`,
      parameters: { workspaceRoot: z.string() },
      implementation: async ({ workspaceRoot }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return gitStatus(workspaceRoot);
      },
    }),
    tool({
      name: "git_diff",
      description: text`Show git diff`,
      parameters: { workspaceRoot: z.string(), staged: z.boolean().optional() },
      implementation: async ({ workspaceRoot, staged }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return gitDiff(workspaceRoot, staged);
      },
    }),
    tool({
      name: "get_site_contents",
      description: text`Get the text contents of a URL`,
      parameters: { url: z.string() },
      implementation: async ({ url }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return getSiteContents(url);
      },
    }),
    tool({
      name: "web_search",
      description: text`Search the web for documentation or errors`,
      parameters: { query: z.string() },
      implementation: async ({ query }) => {
        toolCallCount++;
        webSearchCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        if (webSearchCount > 10) return "Error: Web search limit exceeded";
        return webSearch(query);
      },
    }),
  ];
  return tools;
}

export async function main(context: PluginContext) {
  context.withToolsProvider(toolsProvider);
}
