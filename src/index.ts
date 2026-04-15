import { detectProject } from "./tools/project.js";
import { getRepoTree } from "./tools/repo.js";
import { listFiles, readFile, searchCode } from "./tools/files.js";
import { applyPatch } from "./tools/patch.js";
import { runCommand } from "./tools/terminal.js";
import { runTests } from "./tools/tests.js";
import { gitDiff, gitStatus } from "./tools/git.js";
import { webSearch } from "./tools/web.js";
import { SessionStore } from "./runtime/session_state.js";
import { recordToolCall, recordWebSearch } from "./runtime/limits.js";

const sessions = new SessionStore();

export const tools = {
  async get_repo_tree(sessionId: string, workspaceRoot: string, depth?: number) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "get_repo_tree");
    return getRepoTree(workspaceRoot, depth);
  },

  async detect_project(sessionId: string, workspaceRoot: string) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "detect_project");
    return detectProject(workspaceRoot);
  },

  async list_files(sessionId: string, workspaceRoot: string, pattern?: string, limit?: number) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "list_files");
    return listFiles(workspaceRoot, pattern, limit);
  },

  async read_file(sessionId: string, workspaceRoot: string, filePath: string) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "read_file");
    return readFile(workspaceRoot, filePath);
  },

  async search_code(sessionId: string, workspaceRoot: string, pattern: string, filePattern?: string) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "search_code");
    return searchCode(workspaceRoot, pattern, filePattern);
  },

  async apply_patch(sessionId: string, workspaceRoot: string, patch: Parameters<typeof applyPatch>[1]) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "apply_patch");
    return applyPatch(workspaceRoot, patch);
  },

  async run_command(sessionId: string, workspaceRoot: string, command: string, args?: string[]) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "run_command");
    return runCommand(workspaceRoot, command, args);
  },

  async run_tests(sessionId: string, workspaceRoot: string, command?: string) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "run_tests");
    return runTests(workspaceRoot, command);
  },

  async git_status(sessionId: string, workspaceRoot: string) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "git_status");
    return gitStatus(workspaceRoot);
  },

  async git_diff(sessionId: string, workspaceRoot: string, staged?: boolean) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "git_diff");
    return gitDiff(workspaceRoot, staged);
  },

  async web_search(sessionId: string, query: string) {
    const state = sessions.get(sessionId);
    recordToolCall(state, "web_search");
    recordWebSearch(state);
    return webSearch(query);
  },
};

export type ToolRegistry = typeof tools;
