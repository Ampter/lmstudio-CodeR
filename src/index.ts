import { type PluginContext, type ToolsProviderController, tool, text } from "@lmstudio/sdk";
import { z } from "zod";
import { detectProject } from "./tools/project.js";
import { getRepoTree } from "./tools/repo.js";
import {
  listFiles,
  readFile,
  searchCode,
  makeDirectory,
  deletePath,
  moveFile,
  copyFile,
  replaceTextInFile,
  deleteFilesByPattern,
  findFiles,
} from "./tools/files.js";
import { applyPatch, type ReplacePatchOp } from "./tools/patch.js";
import { runCommand } from "./tools/terminal.js";
import { runTests } from "./tools/tests.js";
import { gitDiff, gitStatus, gitCommit, gitLog } from "./tools/git.js";
import { webSearch, getSiteContents, wikipediaSearch, fetchWebContent } from "./tools/web.js";
import { getSystemInfo, readClipboard, writeClipboard, saveMemory } from "./tools/utils.js";
import { runJavascript, runPython } from "./tools/execution.js";
import { consultSecondaryAgent, saveProjectContext, readProjectContext } from "./tools/agent.js";

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
    tool({
      name: "make_directory",
      description: text`Create a new directory`,
      parameters: { workspaceRoot: z.string(), directoryName: z.string() },
      implementation: async ({ workspaceRoot, directoryName }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return makeDirectory(workspaceRoot, directoryName);
      },
    }),
    tool({
      name: "delete_path",
      description: text`Delete a file or directory`,
      parameters: { workspaceRoot: z.string(), path: z.string() },
      implementation: async ({ workspaceRoot, path }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return deletePath(workspaceRoot, path);
      },
    }),
    tool({
      name: "move_file",
      description: text`Move or rename a file`,
      parameters: { workspaceRoot: z.string(), source: z.string(), destination: z.string() },
      implementation: async ({ workspaceRoot, source, destination }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return moveFile(workspaceRoot, source, destination);
      },
    }),
    tool({
      name: "copy_file",
      description: text`Copy a file to a new location`,
      parameters: { workspaceRoot: z.string(), source: z.string(), destination: z.string() },
      implementation: async ({ workspaceRoot, source, destination }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return copyFile(workspaceRoot, source, destination);
      },
    }),
    tool({
      name: "replace_text_in_file",
      description: text`Replace a specific string in a file`,
      parameters: { workspaceRoot: z.string(), fileName: z.string(), oldString: z.string(), newString: z.string() },
      implementation: async ({ workspaceRoot, fileName, oldString, newString }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return replaceTextInFile(workspaceRoot, fileName, oldString, newString);
      },
    }),
    tool({
      name: "delete_files_by_pattern",
      description: text`Delete multiple files matching a regex pattern`,
      parameters: { workspaceRoot: z.string(), pattern: z.string() },
      implementation: async ({ workspaceRoot, pattern }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return deleteFilesByPattern(workspaceRoot, pattern);
      },
    }),
    tool({
      name: "find_files",
      description: text`Find files using glob pattern`,
      parameters: { workspaceRoot: z.string(), pattern: z.string(), limit: z.number().optional() },
      implementation: async ({ workspaceRoot, pattern, limit }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return findFiles(workspaceRoot, pattern, limit);
      },
    }),
    tool({
      name: "wikipedia_search",
      description: text`Search Wikipedia for information`,
      parameters: { query: z.string() },
      implementation: async ({ query }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return wikipediaSearch(query);
      },
    }),
    tool({
      name: "fetch_web_content",
      description: text`Fetch clean text content from a URL`,
      parameters: { url: z.string() },
      implementation: async ({ url }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return fetchWebContent(url);
      },
    }),
    tool({
      name: "git_commit",
      description: text`Commit staged changes`,
      parameters: { workspaceRoot: z.string(), message: z.string() },
      implementation: async ({ workspaceRoot, message }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return gitCommit(workspaceRoot, message);
      },
    }),
    tool({
      name: "git_log",
      description: text`Get recent git commit history`,
      parameters: { workspaceRoot: z.string(), maxCount: z.number().optional() },
      implementation: async ({ workspaceRoot, maxCount }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return gitLog(workspaceRoot, maxCount);
      },
    }),
    tool({
      name: "get_system_info",
      description: text`Get system information`,
      parameters: {},
      implementation: async () => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return getSystemInfo();
      },
    }),
    tool({
      name: "save_memory",
      description: text`Save information to long-term memory`,
      parameters: { workspaceRoot: z.string(), fact: z.string() },
      implementation: async ({ workspaceRoot, fact }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return saveMemory(workspaceRoot, fact);
      },
    }),
    tool({
      name: "run_javascript",
      description: text`Run JavaScript code using Deno`,
      parameters: { workspaceRoot: z.string(), javascript: z.string(), timeoutSeconds: z.number().optional() },
      implementation: async ({ workspaceRoot, javascript, timeoutSeconds }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return runJavascript(workspaceRoot, javascript, timeoutSeconds);
      },
    }),
    tool({
      name: "run_python",
      description: text`Run Python code`,
      parameters: { workspaceRoot: z.string(), python: z.string(), timeoutSeconds: z.number().optional() },
      implementation: async ({ workspaceRoot, python, timeoutSeconds }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return runPython(workspaceRoot, python, timeoutSeconds);
      },
    }),
    tool({
      name: "consult_secondary_agent",
      description: text`Consult a secondary agent to handle complex tasks`,
      parameters: {
        workspaceRoot: z.string(),
        task: z.string(),
        model: z.string().optional(),
        systemPrompt: z.string().optional(),
      },
      implementation: async ({ workspaceRoot, task, model, systemPrompt }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return consultSecondaryAgent(workspaceRoot, task, { model, systemPrompt });
      },
    }),
    tool({
      name: "save_project_context",
      description: text`Save project context for sub-agents`,
      parameters: { workspaceRoot: z.string(), projectName: z.string(), context: z.string() },
      implementation: async ({ workspaceRoot, projectName, context }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return saveProjectContext(workspaceRoot, projectName, context);
      },
    }),
    tool({
      name: "read_project_context",
      description: text`Read saved project context`,
      parameters: { workspaceRoot: z.string() },
      implementation: async ({ workspaceRoot }) => {
        toolCallCount++;
        if (toolCallCount > 100) return "Error: Tool call limit exceeded";
        return readProjectContext(workspaceRoot);
      },
    }),
  ];
  return tools;
}

export async function main(context: PluginContext) {
  context.withToolsProvider(toolsProvider);
}
