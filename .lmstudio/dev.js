"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/runtime/guards.ts
function resolveWorkspacePath(workspaceRoot, userPath) {
  const resolved = import_node_path.default.resolve(workspaceRoot, userPath);
  const normalizedRoot = import_node_path.default.resolve(workspaceRoot);
  if (!resolved.startsWith(normalizedRoot + import_node_path.default.sep) && resolved !== normalizedRoot) {
    throw new Error(`Path escapes workspace: ${userPath}`);
  }
  const blocked = BLOCKED_SEGMENTS.find((segment) => resolved.startsWith(segment));
  if (blocked) {
    throw new Error(`Path targets blocked segment: ${blocked}`);
  }
  return resolved;
}
function assertDepth(depth, maxDepth) {
  if (!Number.isInteger(depth) || depth < 0) {
    throw new Error("Depth must be a non-negative integer.");
  }
  if (depth > maxDepth) {
    throw new Error(`Depth ${depth} exceeds max depth ${maxDepth}.`);
  }
  return depth;
}
var import_node_path, BLOCKED_SEGMENTS;
var init_guards = __esm({
  "src/runtime/guards.ts"() {
    "use strict";
    import_node_path = __toESM(require("node:path"));
    BLOCKED_SEGMENTS = [
      "/etc",
      "/proc",
      "/sys",
      "/var/run",
      "/root/.ssh",
      "/home/.ssh"
    ];
  }
});

// src/tools/project.ts
async function exists(filePath) {
  try {
    await import_promises.default.access(filePath);
    return true;
  } catch {
    return false;
  }
}
async function detectProject(workspaceRoot) {
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const packageJson = import_node_path2.default.join(root, "package.json");
  if (await exists(packageJson)) {
    return {
      language: "TypeScript/JavaScript",
      framework: "Node.js",
      testCommand: "npm test",
      buildCommand: "npm run build"
    };
  }
  if (await exists(import_node_path2.default.join(root, "pyproject.toml")) || await exists(import_node_path2.default.join(root, "requirements.txt"))) {
    return {
      language: "Python",
      framework: "Python ecosystem",
      testCommand: "pytest",
      buildCommand: "python -m build"
    };
  }
  if (await exists(import_node_path2.default.join(root, "Cargo.toml"))) {
    return {
      language: "Rust",
      framework: "Cargo",
      testCommand: "cargo test",
      buildCommand: "cargo build"
    };
  }
  if (await exists(import_node_path2.default.join(root, "go.mod"))) {
    return {
      language: "Go",
      framework: "Go modules",
      testCommand: "go test ./...",
      buildCommand: "go build ./..."
    };
  }
  if (await exists(import_node_path2.default.join(root, "pom.xml")) || await exists(import_node_path2.default.join(root, "build.gradle"))) {
    return {
      language: "JVM",
      framework: "Maven/Gradle",
      testCommand: "mvn test",
      buildCommand: "mvn package"
    };
  }
  return { language: "unknown" };
}
var import_promises, import_node_path2;
var init_project = __esm({
  "src/tools/project.ts"() {
    "use strict";
    import_promises = __toESM(require("node:fs/promises"));
    import_node_path2 = __toESM(require("node:path"));
    init_guards();
  }
});

// src/config.ts
var DEFAULT_IGNORES, ALLOWLISTED_COMMANDS, LIMITS;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    DEFAULT_IGNORES = [
      "**/.git/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/vendor/**"
    ];
    ALLOWLISTED_COMMANDS = /* @__PURE__ */ new Set([
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
      "git"
    ]);
    LIMITS = {
      maxToolCalls: 30,
      maxFixAttempts: 5,
      maxWebSearchCalls: 5,
      commandTimeoutMs: 12e4,
      commandOutputMaxBytes: 12e4,
      fileReadMaxBytes: 1e5,
      maxRepoTreeDepth: 5
    };
  }
});

// src/tools/repo.ts
async function getRepoTree(workspaceRoot, depth = 3) {
  const normalizedDepth = assertDepth(depth, LIMITS.maxRepoTreeDepth);
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const entries = await (0, import_fast_glob.default)("**/*", {
    cwd: root,
    dot: true,
    onlyFiles: false,
    unique: true,
    deep: normalizedDepth,
    ignore: DEFAULT_IGNORES
  });
  const lines = entries.sort((a, b) => a.localeCompare(b)).map((entry) => {
    const parts = entry.split("/");
    const indent = "  ".repeat(parts.length - 1);
    return `${indent}- ${import_node_path3.default.basename(entry)}`;
  });
  return { root, tree: lines.join("\n") };
}
var import_fast_glob, import_node_path3;
var init_repo = __esm({
  "src/tools/repo.ts"() {
    "use strict";
    import_fast_glob = __toESM(require("fast-glob"));
    import_node_path3 = __toESM(require("node:path"));
    init_config();
    init_guards();
  }
});

// src/tools/files.ts
async function listFiles(workspaceRoot, pattern = "**/*", limit = 200) {
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const entries = await (0, import_fast_glob2.default)(pattern, {
    cwd: root,
    ignore: DEFAULT_IGNORES,
    onlyFiles: true,
    unique: true
  });
  return entries.slice(0, limit);
}
async function readFile(workspaceRoot, userPath) {
  const absolutePath = resolveWorkspacePath(workspaceRoot, userPath);
  const stat = await import_promises2.default.stat(absolutePath);
  if (stat.size > LIMITS.fileReadMaxBytes) {
    throw new Error(`File too large (${stat.size} bytes).`);
  }
  return import_promises2.default.readFile(absolutePath, "utf8");
}
async function searchCode(workspaceRoot, pattern, filePattern = "**/*.{ts,tsx,js,jsx,py,rs,go,java,md,json}") {
  const root = resolveWorkspacePath(workspaceRoot, ".");
  const files = await listFiles(root, filePattern, 500);
  const regex = new RegExp(pattern, "i");
  const hits = [];
  for (const file of files) {
    const content = await import_promises2.default.readFile(import_node_path4.default.join(root, file), "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((lineText, index) => {
      if (regex.test(lineText)) {
        hits.push({ file, line: index + 1, snippet: lineText.trim() });
      }
    });
  }
  return hits.slice(0, 200);
}
var import_promises2, import_node_path4, import_fast_glob2;
var init_files = __esm({
  "src/tools/files.ts"() {
    "use strict";
    import_promises2 = __toESM(require("node:fs/promises"));
    import_node_path4 = __toESM(require("node:path"));
    import_fast_glob2 = __toESM(require("fast-glob"));
    init_config();
    init_guards();
  }
});

// src/tools/patch.ts
async function applyPatch(workspaceRoot, patch) {
  if (patch.op !== "replace") {
    throw new Error(`Unsupported patch op: ${patch.op}`);
  }
  const absolutePath = resolveWorkspacePath(workspaceRoot, patch.path);
  const original = await import_promises3.default.readFile(absolutePath, "utf8");
  if (!original.includes(patch.find)) {
    throw new Error(`Patch context not found in ${patch.path}`);
  }
  const desiredCount = patch.count ?? 1;
  let replacements = 0;
  let next = original;
  while (next.includes(patch.find) && replacements < desiredCount) {
    next = next.replace(patch.find, patch.replace);
    replacements += 1;
  }
  if (replacements !== desiredCount) {
    throw new Error(`Expected ${desiredCount} replacements but applied ${replacements}.`);
  }
  await import_promises3.default.writeFile(absolutePath, next, "utf8");
  return { path: patch.path, replacements };
}
var import_promises3;
var init_patch = __esm({
  "src/tools/patch.ts"() {
    "use strict";
    import_promises3 = __toESM(require("node:fs/promises"));
    init_guards();
  }
});

// src/tools/terminal.ts
async function runCommand(workspaceRoot, command, args = []) {
  if (!ALLOWLISTED_COMMANDS.has(command)) {
    throw new Error(`Command not allowlisted: ${command}`);
  }
  const cwd = resolveWorkspacePath(workspaceRoot, ".");
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      timeout: LIMITS.commandTimeoutMs,
      maxBuffer: LIMITS.commandOutputMaxBytes
    });
    return {
      command: [command, ...args].join(" "),
      stdout,
      stderr,
      exitCode: 0
    };
  } catch (error) {
    const err = error;
    return {
      command: [command, ...args].join(" "),
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message,
      exitCode: typeof err.code === "number" ? err.code : 1
    };
  }
}
var import_node_child_process, import_node_util, execFileAsync;
var init_terminal = __esm({
  "src/tools/terminal.ts"() {
    "use strict";
    import_node_child_process = require("node:child_process");
    import_node_util = require("node:util");
    init_config();
    init_guards();
    execFileAsync = (0, import_node_util.promisify)(import_node_child_process.execFile);
  }
});

// src/tools/tests.ts
async function runTests(workspaceRoot, command) {
  if (command) {
    const [head, ...parts] = command.split(" ");
    return runCommand(workspaceRoot, head, parts);
  }
  return runCommand(workspaceRoot, "npm", ["test"]);
}
var init_tests = __esm({
  "src/tools/tests.ts"() {
    "use strict";
    init_terminal();
  }
});

// src/tools/git.ts
async function gitStatus(workspaceRoot) {
  const result = await runCommand(workspaceRoot, "git", ["status", "--short"]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to read git status.");
  }
  return result.stdout.trim();
}
async function gitDiff(workspaceRoot, staged = false) {
  const args = staged ? ["diff", "--staged"] : ["diff"];
  const result = await runCommand(workspaceRoot, "git", args);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to read git diff.");
  }
  return result.stdout;
}
var init_git = __esm({
  "src/tools/git.ts"() {
    "use strict";
    init_terminal();
  }
});

// src/tools/web.ts
function classifySource(url) {
  if (/docs\.|developer\.|github\.com|nodejs\.org|typescriptlang\.org/i.test(url)) {
    return "official";
  }
  if (/stackoverflow\.com|reddit\.com|dev\.to/i.test(url)) {
    return "community";
  }
  return "unknown";
}
async function webSearch(query) {
  const endpoint = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "coding-agent-plugin/0.1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`web_search failed: ${response.status}`);
  }
  const html = await response.text();
  const matches = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].slice(0, 5);
  return matches.map((match) => {
    const url = match[1];
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    return {
      title,
      url,
      snippet: "",
      sourceType: classifySource(url)
    };
  });
}
var init_web = __esm({
  "src/tools/web.ts"() {
    "use strict";
  }
});

// src/runtime/limits.ts
function createInitialSessionState() {
  return {
    toolCalls: 0,
    fixAttempts: 0,
    webSearchCalls: 0,
    history: []
  };
}
function recordToolCall(state, toolName) {
  state.toolCalls += 1;
  state.history.push(toolName);
  if (state.toolCalls > LIMITS.maxToolCalls) {
    throw new Error(`Max tool calls reached: ${LIMITS.maxToolCalls}`);
  }
}
function recordWebSearch(state) {
  state.webSearchCalls += 1;
  if (state.webSearchCalls > LIMITS.maxWebSearchCalls) {
    throw new Error(`Max web searches reached: ${LIMITS.maxWebSearchCalls}`);
  }
}
var init_limits = __esm({
  "src/runtime/limits.ts"() {
    "use strict";
    init_config();
  }
});

// src/runtime/session_state.ts
var SessionStore;
var init_session_state = __esm({
  "src/runtime/session_state.ts"() {
    "use strict";
    init_limits();
    SessionStore = class {
      sessions = /* @__PURE__ */ new Map();
      get(sessionId) {
        if (!this.sessions.has(sessionId)) {
          this.sessions.set(sessionId, createInitialSessionState());
        }
        return this.sessions.get(sessionId);
      }
      clear(sessionId) {
        this.sessions.delete(sessionId);
      }
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  main: () => main
});
function createTools(ctl) {
  return [
    {
      name: "get_repo_tree",
      description: "Get a depth-limited repository tree view",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          depth: { type: "number", description: "Maximum depth to traverse" }
        },
        required: ["workspaceRoot"]
      },
      execute: async ({ workspaceRoot, depth }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "get_repo_tree");
        return getRepoTree(workspaceRoot, depth);
      }
    },
    {
      name: "detect_project",
      description: "Detect project ecosystem and suggest commands",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" }
        },
        required: ["workspaceRoot"]
      },
      execute: async ({ workspaceRoot }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "detect_project");
        return detectProject(workspaceRoot);
      }
    },
    {
      name: "list_files",
      description: "List files using glob pattern",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          pattern: { type: "string", description: "Glob pattern (e.g., '**/*.ts')" },
          limit: { type: "number", description: "Maximum number of files" }
        },
        required: ["workspaceRoot"]
      },
      execute: async ({ workspaceRoot, pattern, limit }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "list_files");
        return listFiles(workspaceRoot, pattern, limit);
      }
    },
    {
      name: "read_file",
      description: "Read file contents",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          filePath: { type: "string", description: "Relative path to file" }
        },
        required: ["workspaceRoot", "filePath"]
      },
      execute: async ({ workspaceRoot, filePath }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "read_file");
        return readFile(workspaceRoot, filePath);
      }
    },
    {
      name: "search_code",
      description: "Search for code patterns in files",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          pattern: { type: "string", description: "Regex pattern to search" },
          filePattern: { type: "string", description: "File glob pattern" }
        },
        required: ["workspaceRoot", "pattern"]
      },
      execute: async ({ workspaceRoot, pattern, filePattern }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "search_code");
        return searchCode(workspaceRoot, pattern, filePattern);
      }
    },
    {
      name: "apply_patch",
      description: "Apply a structured code edit",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          patch: { type: "object", description: "Patch object" }
        },
        required: ["workspaceRoot", "patch"]
      },
      execute: async ({ workspaceRoot, patch }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "apply_patch");
        return applyPatch(workspaceRoot, patch);
      }
    },
    {
      name: "run_command",
      description: "Run a shell command",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          command: { type: "string", description: "Command to run" },
          args: { type: "array", items: { type: "string" }, description: "Command arguments" }
        },
        required: ["workspaceRoot", "command"]
      },
      execute: async ({ workspaceRoot, command, args }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "run_command");
        return runCommand(workspaceRoot, command, args);
      }
    },
    {
      name: "run_tests",
      description: "Run project tests",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          command: { type: "string", description: "Test command override" }
        },
        required: ["workspaceRoot"]
      },
      execute: async ({ workspaceRoot, command }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "run_tests");
        return runTests(workspaceRoot, command);
      }
    },
    {
      name: "git_status",
      description: "Show git repository status",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" }
        },
        required: ["workspaceRoot"]
      },
      execute: async ({ workspaceRoot }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "git_status");
        return gitStatus(workspaceRoot);
      }
    },
    {
      name: "git_diff",
      description: "Show git diff",
      parameters: {
        type: "object",
        properties: {
          workspaceRoot: { type: "string", description: "Root directory of the workspace" },
          staged: { type: "boolean", description: "Show staged changes" }
        },
        required: ["workspaceRoot"]
      },
      execute: async ({ workspaceRoot, staged }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "git_diff");
        return gitDiff(workspaceRoot, staged);
      }
    },
    {
      name: "web_search",
      description: "Search the web for documentation or errors",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" }
        },
        required: ["query"]
      },
      execute: async ({ query }) => {
        const sessionId = ctl.getContext("sessionId");
        const state = sessions.get(sessionId);
        recordToolCall(state, "web_search");
        recordWebSearch(state);
        return webSearch(query);
      }
    }
  ];
}
var sessions, main;
var init_src = __esm({
  "src/index.ts"() {
    "use strict";
    init_project();
    init_repo();
    init_files();
    init_patch();
    init_terminal();
    init_tests();
    init_git();
    init_web();
    init_session_state();
    init_limits();
    sessions = new SessionStore();
    main = async function(context) {
      context.withToolsProvider(createTools);
    };
  }
});

// .lmstudio/entry.ts
var import_sdk = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk.LMStudioClient({
  clientIdentifier,
  clientPasskey,
  baseUrl
});
globalThis.__LMS_PLUGIN_CONTEXT = true;
var predictionLoopHandlerSet = false;
var promptPreprocessorSet = false;
var configSchematicsSet = false;
var globalConfigSchematicsSet = false;
var toolsProviderSet = false;
var generatorSet = false;
var selfRegistrationHost = client.plugins.getSelfRegistrationHost();
var pluginContext = {
  withPredictionLoopHandler: (generate) => {
    if (predictionLoopHandlerSet) {
      throw new Error("PredictionLoopHandler already registered");
    }
    if (toolsProviderSet) {
      throw new Error("PredictionLoopHandler cannot be used with a tools provider");
    }
    predictionLoopHandlerSet = true;
    selfRegistrationHost.setPredictionLoopHandler(generate);
    return pluginContext;
  },
  withPromptPreprocessor: (preprocess) => {
    if (promptPreprocessorSet) {
      throw new Error("PromptPreprocessor already registered");
    }
    promptPreprocessorSet = true;
    selfRegistrationHost.setPromptPreprocessor(preprocess);
    return pluginContext;
  },
  withConfigSchematics: (configSchematics) => {
    if (configSchematicsSet) {
      throw new Error("Config schematics already registered");
    }
    configSchematicsSet = true;
    selfRegistrationHost.setConfigSchematics(configSchematics);
    return pluginContext;
  },
  withGlobalConfigSchematics: (globalConfigSchematics) => {
    if (globalConfigSchematicsSet) {
      throw new Error("Global config schematics already registered");
    }
    globalConfigSchematicsSet = true;
    selfRegistrationHost.setGlobalConfigSchematics(globalConfigSchematics);
    return pluginContext;
  },
  withToolsProvider: (toolsProvider) => {
    if (toolsProviderSet) {
      throw new Error("Tools provider already registered");
    }
    if (predictionLoopHandlerSet) {
      throw new Error("Tools provider cannot be used with a predictionLoopHandler");
    }
    toolsProviderSet = true;
    selfRegistrationHost.setToolsProvider(toolsProvider);
    return pluginContext;
  },
  withGenerator: (generator) => {
    if (generatorSet) {
      throw new Error("Generator already registered");
    }
    generatorSet = true;
    selfRegistrationHost.setGenerator(generator);
    return pluginContext;
  }
};
Promise.resolve().then(() => (init_src(), src_exports)).then(async (module2) => {
  return await module2.main(pluginContext);
}).then(() => {
  selfRegistrationHost.initCompleted();
}).catch((error) => {
  console.error("Failed to execute the main function of the plugin.");
  console.error(error);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3J1bnRpbWUvZ3VhcmRzLnRzIiwgIi4uL3NyYy90b29scy9wcm9qZWN0LnRzIiwgIi4uL3NyYy9jb25maWcudHMiLCAiLi4vc3JjL3Rvb2xzL3JlcG8udHMiLCAiLi4vc3JjL3Rvb2xzL2ZpbGVzLnRzIiwgIi4uL3NyYy90b29scy9wYXRjaC50cyIsICIuLi9zcmMvdG9vbHMvdGVybWluYWwudHMiLCAiLi4vc3JjL3Rvb2xzL3Rlc3RzLnRzIiwgIi4uL3NyYy90b29scy9naXQudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYi50cyIsICIuLi9zcmMvcnVudGltZS9saW1pdHMudHMiLCAiLi4vc3JjL3J1bnRpbWUvc2Vzc2lvbl9zdGF0ZS50cyIsICIuLi9zcmMvaW5kZXgudHMiLCAiZW50cnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuY29uc3QgQkxPQ0tFRF9TRUdNRU5UUyA9IFtcbiAgXCIvZXRjXCIsXG4gIFwiL3Byb2NcIixcbiAgXCIvc3lzXCIsXG4gIFwiL3Zhci9ydW5cIixcbiAgXCIvcm9vdC8uc3NoXCIsXG4gIFwiL2hvbWUvLnNzaFwiLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVXb3Jrc3BhY2VQYXRoKHdvcmtzcGFjZVJvb3Q6IHN0cmluZywgdXNlclBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJlc29sdmVkID0gcGF0aC5yZXNvbHZlKHdvcmtzcGFjZVJvb3QsIHVzZXJQYXRoKTtcbiAgY29uc3Qgbm9ybWFsaXplZFJvb3QgPSBwYXRoLnJlc29sdmUod29ya3NwYWNlUm9vdCk7XG4gIGlmICghcmVzb2x2ZWQuc3RhcnRzV2l0aChub3JtYWxpemVkUm9vdCArIHBhdGguc2VwKSAmJiByZXNvbHZlZCAhPT0gbm9ybWFsaXplZFJvb3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBhdGggZXNjYXBlcyB3b3Jrc3BhY2U6ICR7dXNlclBhdGh9YCk7XG4gIH1cblxuICBjb25zdCBibG9ja2VkID0gQkxPQ0tFRF9TRUdNRU5UUy5maW5kKChzZWdtZW50KSA9PiByZXNvbHZlZC5zdGFydHNXaXRoKHNlZ21lbnQpKTtcbiAgaWYgKGJsb2NrZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBhdGggdGFyZ2V0cyBibG9ja2VkIHNlZ21lbnQ6ICR7YmxvY2tlZH1gKTtcbiAgfVxuXG4gIHJldHVybiByZXNvbHZlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydERlcHRoKGRlcHRoOiBudW1iZXIsIG1heERlcHRoOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoIU51bWJlci5pc0ludGVnZXIoZGVwdGgpIHx8IGRlcHRoIDwgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkRlcHRoIG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlci5cIik7XG4gIH1cblxuICBpZiAoZGVwdGggPiBtYXhEZXB0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRGVwdGggJHtkZXB0aH0gZXhjZWVkcyBtYXggZGVwdGggJHttYXhEZXB0aH0uYCk7XG4gIH1cblxuICByZXR1cm4gZGVwdGg7XG59XG4iLCAiaW1wb3J0IGZzIGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyByZXNvbHZlV29ya3NwYWNlUGF0aCB9IGZyb20gXCIuLi9ydW50aW1lL2d1YXJkcy5qc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9qZWN0RGV0ZWN0aW9uIH0gZnJvbSBcIi4uL3R5cGVzLmpzXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIGV4aXN0cyhmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgZnMuYWNjZXNzKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXRlY3RQcm9qZWN0KHdvcmtzcGFjZVJvb3Q6IHN0cmluZyk6IFByb21pc2U8UHJvamVjdERldGVjdGlvbj4ge1xuICBjb25zdCByb290ID0gcmVzb2x2ZVdvcmtzcGFjZVBhdGgod29ya3NwYWNlUm9vdCwgXCIuXCIpO1xuXG4gIGNvbnN0IHBhY2thZ2VKc29uID0gcGF0aC5qb2luKHJvb3QsIFwicGFja2FnZS5qc29uXCIpO1xuICBpZiAoYXdhaXQgZXhpc3RzKHBhY2thZ2VKc29uKSkge1xuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZTogXCJUeXBlU2NyaXB0L0phdmFTY3JpcHRcIixcbiAgICAgIGZyYW1ld29yazogXCJOb2RlLmpzXCIsXG4gICAgICB0ZXN0Q29tbWFuZDogXCJucG0gdGVzdFwiLFxuICAgICAgYnVpbGRDb21tYW5kOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICB9O1xuICB9XG5cbiAgaWYgKGF3YWl0IGV4aXN0cyhwYXRoLmpvaW4ocm9vdCwgXCJweXByb2plY3QudG9tbFwiKSkgfHwgYXdhaXQgZXhpc3RzKHBhdGguam9pbihyb290LCBcInJlcXVpcmVtZW50cy50eHRcIikpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlOiBcIlB5dGhvblwiLFxuICAgICAgZnJhbWV3b3JrOiBcIlB5dGhvbiBlY29zeXN0ZW1cIixcbiAgICAgIHRlc3RDb21tYW5kOiBcInB5dGVzdFwiLFxuICAgICAgYnVpbGRDb21tYW5kOiBcInB5dGhvbiAtbSBidWlsZFwiLFxuICAgIH07XG4gIH1cblxuICBpZiAoYXdhaXQgZXhpc3RzKHBhdGguam9pbihyb290LCBcIkNhcmdvLnRvbWxcIikpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlOiBcIlJ1c3RcIixcbiAgICAgIGZyYW1ld29yazogXCJDYXJnb1wiLFxuICAgICAgdGVzdENvbW1hbmQ6IFwiY2FyZ28gdGVzdFwiLFxuICAgICAgYnVpbGRDb21tYW5kOiBcImNhcmdvIGJ1aWxkXCIsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChhd2FpdCBleGlzdHMocGF0aC5qb2luKHJvb3QsIFwiZ28ubW9kXCIpKSkge1xuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZTogXCJHb1wiLFxuICAgICAgZnJhbWV3b3JrOiBcIkdvIG1vZHVsZXNcIixcbiAgICAgIHRlc3RDb21tYW5kOiBcImdvIHRlc3QgLi8uLi5cIixcbiAgICAgIGJ1aWxkQ29tbWFuZDogXCJnbyBidWlsZCAuLy4uLlwiLFxuICAgIH07XG4gIH1cblxuICBpZiAoYXdhaXQgZXhpc3RzKHBhdGguam9pbihyb290LCBcInBvbS54bWxcIikpIHx8IGF3YWl0IGV4aXN0cyhwYXRoLmpvaW4ocm9vdCwgXCJidWlsZC5ncmFkbGVcIikpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlOiBcIkpWTVwiLFxuICAgICAgZnJhbWV3b3JrOiBcIk1hdmVuL0dyYWRsZVwiLFxuICAgICAgdGVzdENvbW1hbmQ6IFwibXZuIHRlc3RcIixcbiAgICAgIGJ1aWxkQ29tbWFuZDogXCJtdm4gcGFja2FnZVwiLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4geyBsYW5ndWFnZTogXCJ1bmtub3duXCIgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFJ1bnRpbWVMaW1pdHMgfSBmcm9tIFwiLi90eXBlcy5qc1wiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9JR05PUkVTID0gW1xuICBcIioqLy5naXQvKipcIixcbiAgXCIqKi9ub2RlX21vZHVsZXMvKipcIixcbiAgXCIqKi9kaXN0LyoqXCIsXG4gIFwiKiovYnVpbGQvKipcIixcbiAgXCIqKi8ubmV4dC8qKlwiLFxuICBcIioqL3ZlbmRvci8qKlwiLFxuXTtcblxuZXhwb3J0IGNvbnN0IEFMTE9XTElTVEVEX0NPTU1BTkRTID0gbmV3IFNldChbXG4gIFwibnBtXCIsXG4gIFwicG5wbVwiLFxuICBcInlhcm5cIixcbiAgXCJub2RlXCIsXG4gIFwibnB4XCIsXG4gIFwicHl0aG9uXCIsXG4gIFwicHl0ZXN0XCIsXG4gIFwicGlwXCIsXG4gIFwiY2FyZ29cIixcbiAgXCJnb1wiLFxuICBcImdyYWRsZVwiLFxuICBcIm12blwiLFxuICBcImdpdFwiLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBMSU1JVFM6IFJ1bnRpbWVMaW1pdHMgPSB7XG4gIG1heFRvb2xDYWxsczogMzAsXG4gIG1heEZpeEF0dGVtcHRzOiA1LFxuICBtYXhXZWJTZWFyY2hDYWxsczogNSxcbiAgY29tbWFuZFRpbWVvdXRNczogMTIwXzAwMCxcbiAgY29tbWFuZE91dHB1dE1heEJ5dGVzOiAxMjBfMDAwLFxuICBmaWxlUmVhZE1heEJ5dGVzOiAxMDBfMDAwLFxuICBtYXhSZXBvVHJlZURlcHRoOiA1LFxufTtcbiIsICJpbXBvcnQgZmcgZnJvbSBcImZhc3QtZ2xvYlwiO1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgREVGQVVMVF9JR05PUkVTLCBMSU1JVFMgfSBmcm9tIFwiLi4vY29uZmlnLmpzXCI7XG5pbXBvcnQgeyBhc3NlcnREZXB0aCwgcmVzb2x2ZVdvcmtzcGFjZVBhdGggfSBmcm9tIFwiLi4vcnVudGltZS9ndWFyZHMuanNcIjtcbmltcG9ydCB0eXBlIHsgUmVwb1RyZWVSZXN1bHQgfSBmcm9tIFwiLi4vdHlwZXMuanNcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFJlcG9UcmVlKHdvcmtzcGFjZVJvb3Q6IHN0cmluZywgZGVwdGggPSAzKTogUHJvbWlzZTxSZXBvVHJlZVJlc3VsdD4ge1xuICBjb25zdCBub3JtYWxpemVkRGVwdGggPSBhc3NlcnREZXB0aChkZXB0aCwgTElNSVRTLm1heFJlcG9UcmVlRGVwdGgpO1xuICBjb25zdCByb290ID0gcmVzb2x2ZVdvcmtzcGFjZVBhdGgod29ya3NwYWNlUm9vdCwgXCIuXCIpO1xuXG4gIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmZyhcIioqLypcIiwge1xuICAgIGN3ZDogcm9vdCxcbiAgICBkb3Q6IHRydWUsXG4gICAgb25seUZpbGVzOiBmYWxzZSxcbiAgICB1bmlxdWU6IHRydWUsXG4gICAgZGVlcDogbm9ybWFsaXplZERlcHRoLFxuICAgIGlnbm9yZTogREVGQVVMVF9JR05PUkVTLFxuICB9KTtcblxuICBjb25zdCBsaW5lcyA9IGVudHJpZXNcbiAgICAuc29ydCgoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpKVxuICAgIC5tYXAoKGVudHJ5KSA9PiB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGVudHJ5LnNwbGl0KFwiL1wiKTtcbiAgICAgIGNvbnN0IGluZGVudCA9IFwiICBcIi5yZXBlYXQocGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICByZXR1cm4gYCR7aW5kZW50fS0gJHtwYXRoLmJhc2VuYW1lKGVudHJ5KX1gO1xuICAgIH0pO1xuXG4gIHJldHVybiB7IHJvb3QsIHRyZWU6IGxpbmVzLmpvaW4oXCJcXG5cIikgfTtcbn1cbiIsICJpbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCBmZyBmcm9tIFwiZmFzdC1nbG9iXCI7XG5pbXBvcnQgeyBERUZBVUxUX0lHTk9SRVMsIExJTUlUUyB9IGZyb20gXCIuLi9jb25maWcuanNcIjtcbmltcG9ydCB7IHJlc29sdmVXb3Jrc3BhY2VQYXRoIH0gZnJvbSBcIi4uL3J1bnRpbWUvZ3VhcmRzLmpzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0RmlsZXMod29ya3NwYWNlUm9vdDogc3RyaW5nLCBwYXR0ZXJuID0gXCIqKi8qXCIsIGxpbWl0ID0gMjAwKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICBjb25zdCByb290ID0gcmVzb2x2ZVdvcmtzcGFjZVBhdGgod29ya3NwYWNlUm9vdCwgXCIuXCIpO1xuICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZmcocGF0dGVybiwge1xuICAgIGN3ZDogcm9vdCxcbiAgICBpZ25vcmU6IERFRkFVTFRfSUdOT1JFUyxcbiAgICBvbmx5RmlsZXM6IHRydWUsXG4gICAgdW5pcXVlOiB0cnVlLFxuICB9KTtcblxuICByZXR1cm4gZW50cmllcy5zbGljZSgwLCBsaW1pdCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZSh3b3Jrc3BhY2VSb290OiBzdHJpbmcsIHVzZXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBhYnNvbHV0ZVBhdGggPSByZXNvbHZlV29ya3NwYWNlUGF0aCh3b3Jrc3BhY2VSb290LCB1c2VyUGF0aCk7XG4gIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5zdGF0KGFic29sdXRlUGF0aCk7XG4gIGlmIChzdGF0LnNpemUgPiBMSU1JVFMuZmlsZVJlYWRNYXhCeXRlcykge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmlsZSB0b28gbGFyZ2UgKCR7c3RhdC5zaXplfSBieXRlcykuYCk7XG4gIH1cblxuICByZXR1cm4gZnMucmVhZEZpbGUoYWJzb2x1dGVQYXRoLCBcInV0ZjhcIik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWFyY2hDb2RlKFxuICB3b3Jrc3BhY2VSb290OiBzdHJpbmcsXG4gIHBhdHRlcm46IHN0cmluZyxcbiAgZmlsZVBhdHRlcm4gPSBcIioqLyoue3RzLHRzeCxqcyxqc3gscHkscnMsZ28samF2YSxtZCxqc29ufVwiLFxuKTogUHJvbWlzZTxBcnJheTx7IGZpbGU6IHN0cmluZzsgbGluZTogbnVtYmVyOyBzbmlwcGV0OiBzdHJpbmcgfT4+IHtcbiAgY29uc3Qgcm9vdCA9IHJlc29sdmVXb3Jrc3BhY2VQYXRoKHdvcmtzcGFjZVJvb3QsIFwiLlwiKTtcbiAgY29uc3QgZmlsZXMgPSBhd2FpdCBsaXN0RmlsZXMocm9vdCwgZmlsZVBhdHRlcm4sIDUwMCk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImlcIik7XG4gIGNvbnN0IGhpdHM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyBsaW5lOiBudW1iZXI7IHNuaXBwZXQ6IHN0cmluZyB9PiA9IFtdO1xuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShwYXRoLmpvaW4ocm9vdCwgZmlsZSksIFwidXRmOFwiKTtcbiAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoL1xccj9cXG4vKTtcbiAgICBsaW5lcy5mb3JFYWNoKChsaW5lVGV4dCwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChyZWdleC50ZXN0KGxpbmVUZXh0KSkge1xuICAgICAgICBoaXRzLnB1c2goeyBmaWxlLCBsaW5lOiBpbmRleCArIDEsIHNuaXBwZXQ6IGxpbmVUZXh0LnRyaW0oKSB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBoaXRzLnNsaWNlKDAsIDIwMCk7XG59XG4iLCAiaW1wb3J0IGZzIGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyByZXNvbHZlV29ya3NwYWNlUGF0aCB9IGZyb20gXCIuLi9ydW50aW1lL2d1YXJkcy5qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlcGxhY2VQYXRjaE9wIHtcbiAgb3A6IFwicmVwbGFjZVwiO1xuICBwYXRoOiBzdHJpbmc7XG4gIGZpbmQ6IHN0cmluZztcbiAgcmVwbGFjZTogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXRjaFJlc3VsdCB7XG4gIHBhdGg6IHN0cmluZztcbiAgcmVwbGFjZW1lbnRzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHBseVBhdGNoKHdvcmtzcGFjZVJvb3Q6IHN0cmluZywgcGF0Y2g6IFJlcGxhY2VQYXRjaE9wKTogUHJvbWlzZTxQYXRjaFJlc3VsdD4ge1xuICBpZiAocGF0Y2gub3AgIT09IFwicmVwbGFjZVwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBwYXRjaCBvcDogJHtwYXRjaC5vcH1gKTtcbiAgfVxuXG4gIGNvbnN0IGFic29sdXRlUGF0aCA9IHJlc29sdmVXb3Jrc3BhY2VQYXRoKHdvcmtzcGFjZVJvb3QsIHBhdGNoLnBhdGgpO1xuICBjb25zdCBvcmlnaW5hbCA9IGF3YWl0IGZzLnJlYWRGaWxlKGFic29sdXRlUGF0aCwgXCJ1dGY4XCIpO1xuXG4gIGlmICghb3JpZ2luYWwuaW5jbHVkZXMocGF0Y2guZmluZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBhdGNoIGNvbnRleHQgbm90IGZvdW5kIGluICR7cGF0Y2gucGF0aH1gKTtcbiAgfVxuXG4gIGNvbnN0IGRlc2lyZWRDb3VudCA9IHBhdGNoLmNvdW50ID8/IDE7XG4gIGxldCByZXBsYWNlbWVudHMgPSAwO1xuICBsZXQgbmV4dCA9IG9yaWdpbmFsO1xuXG4gIHdoaWxlIChuZXh0LmluY2x1ZGVzKHBhdGNoLmZpbmQpICYmIHJlcGxhY2VtZW50cyA8IGRlc2lyZWRDb3VudCkge1xuICAgIG5leHQgPSBuZXh0LnJlcGxhY2UocGF0Y2guZmluZCwgcGF0Y2gucmVwbGFjZSk7XG4gICAgcmVwbGFjZW1lbnRzICs9IDE7XG4gIH1cblxuICBpZiAocmVwbGFjZW1lbnRzICE9PSBkZXNpcmVkQ291bnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICR7ZGVzaXJlZENvdW50fSByZXBsYWNlbWVudHMgYnV0IGFwcGxpZWQgJHtyZXBsYWNlbWVudHN9LmApO1xuICB9XG5cbiAgYXdhaXQgZnMud3JpdGVGaWxlKGFic29sdXRlUGF0aCwgbmV4dCwgXCJ1dGY4XCIpO1xuICByZXR1cm4geyBwYXRoOiBwYXRjaC5wYXRoLCByZXBsYWNlbWVudHMgfTtcbn1cbiIsICJpbXBvcnQgeyBleGVjRmlsZSB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJub2RlOnV0aWxcIjtcbmltcG9ydCB7IEFMTE9XTElTVEVEX0NPTU1BTkRTLCBMSU1JVFMgfSBmcm9tIFwiLi4vY29uZmlnLmpzXCI7XG5pbXBvcnQgeyByZXNvbHZlV29ya3NwYWNlUGF0aCB9IGZyb20gXCIuLi9ydW50aW1lL2d1YXJkcy5qc1wiO1xuXG5jb25zdCBleGVjRmlsZUFzeW5jID0gcHJvbWlzaWZ5KGV4ZWNGaWxlKTtcblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kUmVzdWx0IHtcbiAgY29tbWFuZDogc3RyaW5nO1xuICBzdGRvdXQ6IHN0cmluZztcbiAgc3RkZXJyOiBzdHJpbmc7XG4gIGV4aXRDb2RlOiBudW1iZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Db21tYW5kKHdvcmtzcGFjZVJvb3Q6IHN0cmluZywgY29tbWFuZDogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSA9IFtdKTogUHJvbWlzZTxDb21tYW5kUmVzdWx0PiB7XG4gIGlmICghQUxMT1dMSVNURURfQ09NTUFORFMuaGFzKGNvbW1hbmQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb21tYW5kIG5vdCBhbGxvd2xpc3RlZDogJHtjb21tYW5kfWApO1xuICB9XG5cbiAgY29uc3QgY3dkID0gcmVzb2x2ZVdvcmtzcGFjZVBhdGgod29ya3NwYWNlUm9vdCwgXCIuXCIpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgeyBzdGRvdXQsIHN0ZGVyciB9ID0gYXdhaXQgZXhlY0ZpbGVBc3luYyhjb21tYW5kLCBhcmdzLCB7XG4gICAgICBjd2QsXG4gICAgICB0aW1lb3V0OiBMSU1JVFMuY29tbWFuZFRpbWVvdXRNcyxcbiAgICAgIG1heEJ1ZmZlcjogTElNSVRTLmNvbW1hbmRPdXRwdXRNYXhCeXRlcyxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb21tYW5kOiBbY29tbWFuZCwgLi4uYXJnc10uam9pbihcIiBcIiksXG4gICAgICBzdGRvdXQsXG4gICAgICBzdGRlcnIsXG4gICAgICBleGl0Q29kZTogMCxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IGVyciA9IGVycm9yIGFzIE5vZGVKUy5FcnJub0V4Y2VwdGlvbiAmIHsgc3Rkb3V0Pzogc3RyaW5nOyBzdGRlcnI/OiBzdHJpbmc7IGNvZGU/OiBudW1iZXIgfTtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWFuZDogW2NvbW1hbmQsIC4uLmFyZ3NdLmpvaW4oXCIgXCIpLFxuICAgICAgc3Rkb3V0OiBlcnIuc3Rkb3V0ID8/IFwiXCIsXG4gICAgICBzdGRlcnI6IGVyci5zdGRlcnIgPz8gZXJyLm1lc3NhZ2UsXG4gICAgICBleGl0Q29kZTogdHlwZW9mIGVyci5jb2RlID09PSBcIm51bWJlclwiID8gZXJyLmNvZGUgOiAxLFxuICAgIH07XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBydW5Db21tYW5kLCB0eXBlIENvbW1hbmRSZXN1bHQgfSBmcm9tIFwiLi90ZXJtaW5hbC5qc1wiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuVGVzdHMod29ya3NwYWNlUm9vdDogc3RyaW5nLCBjb21tYW5kPzogc3RyaW5nKTogUHJvbWlzZTxDb21tYW5kUmVzdWx0PiB7XG4gIGlmIChjb21tYW5kKSB7XG4gICAgY29uc3QgW2hlYWQsIC4uLnBhcnRzXSA9IGNvbW1hbmQuc3BsaXQoXCIgXCIpO1xuICAgIHJldHVybiBydW5Db21tYW5kKHdvcmtzcGFjZVJvb3QsIGhlYWQsIHBhcnRzKTtcbiAgfVxuXG4gIHJldHVybiBydW5Db21tYW5kKHdvcmtzcGFjZVJvb3QsIFwibnBtXCIsIFtcInRlc3RcIl0pO1xufVxuIiwgImltcG9ydCB7IHJ1bkNvbW1hbmQgfSBmcm9tIFwiLi90ZXJtaW5hbC5qc1wiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2l0U3RhdHVzKHdvcmtzcGFjZVJvb3Q6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkNvbW1hbmQod29ya3NwYWNlUm9vdCwgXCJnaXRcIiwgW1wic3RhdHVzXCIsIFwiLS1zaG9ydFwiXSk7XG4gIGlmIChyZXN1bHQuZXhpdENvZGUgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LnN0ZGVyciB8fCBcIkZhaWxlZCB0byByZWFkIGdpdCBzdGF0dXMuXCIpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5zdGRvdXQudHJpbSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2l0RGlmZih3b3Jrc3BhY2VSb290OiBzdHJpbmcsIHN0YWdlZCA9IGZhbHNlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgYXJncyA9IHN0YWdlZCA/IFtcImRpZmZcIiwgXCItLXN0YWdlZFwiXSA6IFtcImRpZmZcIl07XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkNvbW1hbmQod29ya3NwYWNlUm9vdCwgXCJnaXRcIiwgYXJncyk7XG4gIGlmIChyZXN1bHQuZXhpdENvZGUgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LnN0ZGVyciB8fCBcIkZhaWxlZCB0byByZWFkIGdpdCBkaWZmLlwiKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc3Rkb3V0O1xufVxuIiwgImltcG9ydCB0eXBlIHsgV2ViU2VhcmNoUmVzdWx0IH0gZnJvbSBcIi4uL3R5cGVzLmpzXCI7XG5cbmZ1bmN0aW9uIGNsYXNzaWZ5U291cmNlKHVybDogc3RyaW5nKTogV2ViU2VhcmNoUmVzdWx0W1wic291cmNlVHlwZVwiXSB7XG4gIGlmICgvZG9jc1xcLnxkZXZlbG9wZXJcXC58Z2l0aHViXFwuY29tfG5vZGVqc1xcLm9yZ3x0eXBlc2NyaXB0bGFuZ1xcLm9yZy9pLnRlc3QodXJsKSkge1xuICAgIHJldHVybiBcIm9mZmljaWFsXCI7XG4gIH1cblxuICBpZiAoL3N0YWNrb3ZlcmZsb3dcXC5jb218cmVkZGl0XFwuY29tfGRldlxcLnRvL2kudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIFwiY29tbXVuaXR5XCI7XG4gIH1cblxuICByZXR1cm4gXCJ1bmtub3duXCI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3ZWJTZWFyY2gocXVlcnk6IHN0cmluZyk6IFByb21pc2U8V2ViU2VhcmNoUmVzdWx0W10+IHtcbiAgY29uc3QgZW5kcG9pbnQgPSBgaHR0cHM6Ly9kdWNrZHVja2dvLmNvbS9odG1sLz9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX1gO1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGVuZHBvaW50LCB7XG4gICAgaGVhZGVyczoge1xuICAgICAgXCJVc2VyLUFnZW50XCI6IFwiY29kaW5nLWFnZW50LXBsdWdpbi8wLjEuMFwiLFxuICAgIH0sXG4gIH0pO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYHdlYl9zZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgfVxuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIGNvbnN0IG1hdGNoZXMgPSBbLi4uaHRtbC5tYXRjaEFsbCgvPGFbXj5dKmNsYXNzPVwicmVzdWx0X19hXCJbXj5dKmhyZWY9XCIoW15cIl0rKVwiW14+XSo+KC4qPyk8XFwvYT4vZyldLnNsaWNlKDAsIDUpO1xuXG4gIHJldHVybiBtYXRjaGVzLm1hcCgobWF0Y2gpID0+IHtcbiAgICBjb25zdCB1cmwgPSBtYXRjaFsxXTtcbiAgICBjb25zdCB0aXRsZSA9IG1hdGNoWzJdLnJlcGxhY2UoLzxbXj5dKz4vZywgXCJcIikudHJpbSgpO1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZSxcbiAgICAgIHVybCxcbiAgICAgIHNuaXBwZXQ6IFwiXCIsXG4gICAgICBzb3VyY2VUeXBlOiBjbGFzc2lmeVNvdXJjZSh1cmwpLFxuICAgIH07XG4gIH0pO1xufVxuIiwgImltcG9ydCB7IExJTUlUUyB9IGZyb20gXCIuLi9jb25maWcuanNcIjtcbmltcG9ydCB0eXBlIHsgU2Vzc2lvblN0YXRlIH0gZnJvbSBcIi4uL3R5cGVzLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbml0aWFsU2Vzc2lvblN0YXRlKCk6IFNlc3Npb25TdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgdG9vbENhbGxzOiAwLFxuICAgIGZpeEF0dGVtcHRzOiAwLFxuICAgIHdlYlNlYXJjaENhbGxzOiAwLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjb3JkVG9vbENhbGwoc3RhdGU6IFNlc3Npb25TdGF0ZSwgdG9vbE5hbWU6IHN0cmluZyk6IHZvaWQge1xuICBzdGF0ZS50b29sQ2FsbHMgKz0gMTtcbiAgc3RhdGUuaGlzdG9yeS5wdXNoKHRvb2xOYW1lKTtcblxuICBpZiAoc3RhdGUudG9vbENhbGxzID4gTElNSVRTLm1heFRvb2xDYWxscykge1xuICAgIHRocm93IG5ldyBFcnJvcihgTWF4IHRvb2wgY2FsbHMgcmVhY2hlZDogJHtMSU1JVFMubWF4VG9vbENhbGxzfWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvcmRGaXhBdHRlbXB0KHN0YXRlOiBTZXNzaW9uU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuZml4QXR0ZW1wdHMgKz0gMTtcbiAgaWYgKHN0YXRlLmZpeEF0dGVtcHRzID4gTElNSVRTLm1heEZpeEF0dGVtcHRzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBNYXggZml4IGF0dGVtcHRzIHJlYWNoZWQ6ICR7TElNSVRTLm1heEZpeEF0dGVtcHRzfWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvcmRXZWJTZWFyY2goc3RhdGU6IFNlc3Npb25TdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS53ZWJTZWFyY2hDYWxscyArPSAxO1xuICBpZiAoc3RhdGUud2ViU2VhcmNoQ2FsbHMgPiBMSU1JVFMubWF4V2ViU2VhcmNoQ2FsbHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE1heCB3ZWIgc2VhcmNoZXMgcmVhY2hlZDogJHtMSU1JVFMubWF4V2ViU2VhcmNoQ2FsbHN9YCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjcmVhdGVJbml0aWFsU2Vzc2lvblN0YXRlIH0gZnJvbSBcIi4vbGltaXRzLmpzXCI7XG5pbXBvcnQgdHlwZSB7IFNlc3Npb25TdGF0ZSB9IGZyb20gXCIuLi90eXBlcy5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU2Vzc2lvblN0b3JlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBzZXNzaW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBTZXNzaW9uU3RhdGU+KCk7XG5cbiAgZ2V0KHNlc3Npb25JZDogc3RyaW5nKTogU2Vzc2lvblN0YXRlIHtcbiAgICBpZiAoIXRoaXMuc2Vzc2lvbnMuaGFzKHNlc3Npb25JZCkpIHtcbiAgICAgIHRoaXMuc2Vzc2lvbnMuc2V0KHNlc3Npb25JZCwgY3JlYXRlSW5pdGlhbFNlc3Npb25TdGF0ZSgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZXNzaW9ucy5nZXQoc2Vzc2lvbklkKSE7XG4gIH1cblxuICBjbGVhcihzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBMTVN0dWRpb0NsaWVudCwgdHlwZSBQbHVnaW5Db250ZXh0LCB0eXBlIFRvb2xzUHJvdmlkZXIsIHR5cGUgVG9vbHNQcm92aWRlckNvbnRyb2xsZXIsIHR5cGUgVG9vbCB9IGZyb20gXCJAbG1zdHVkaW8vc2RrXCI7XG5pbXBvcnQgeyBkZXRlY3RQcm9qZWN0IH0gZnJvbSBcIi4vdG9vbHMvcHJvamVjdC5qc1wiO1xuaW1wb3J0IHsgZ2V0UmVwb1RyZWUgfSBmcm9tIFwiLi90b29scy9yZXBvLmpzXCI7XG5pbXBvcnQgeyBsaXN0RmlsZXMsIHJlYWRGaWxlLCBzZWFyY2hDb2RlIH0gZnJvbSBcIi4vdG9vbHMvZmlsZXMuanNcIjtcbmltcG9ydCB7IGFwcGx5UGF0Y2ggfSBmcm9tIFwiLi90b29scy9wYXRjaC5qc1wiO1xuaW1wb3J0IHsgcnVuQ29tbWFuZCB9IGZyb20gXCIuL3Rvb2xzL3Rlcm1pbmFsLmpzXCI7XG5pbXBvcnQgeyBydW5UZXN0cyB9IGZyb20gXCIuL3Rvb2xzL3Rlc3RzLmpzXCI7XG5pbXBvcnQgeyBnaXREaWZmLCBnaXRTdGF0dXMgfSBmcm9tIFwiLi90b29scy9naXQuanNcIjtcbmltcG9ydCB7IHdlYlNlYXJjaCB9IGZyb20gXCIuL3Rvb2xzL3dlYi5qc1wiO1xuaW1wb3J0IHsgU2Vzc2lvblN0b3JlIH0gZnJvbSBcIi4vcnVudGltZS9zZXNzaW9uX3N0YXRlLmpzXCI7XG5pbXBvcnQgeyByZWNvcmRUb29sQ2FsbCwgcmVjb3JkV2ViU2VhcmNoIH0gZnJvbSBcIi4vcnVudGltZS9saW1pdHMuanNcIjtcblxuY29uc3Qgc2Vzc2lvbnMgPSBuZXcgU2Vzc2lvblN0b3JlKCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVRvb2xzKGN0bDogYW55KSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogXCJnZXRfcmVwb190cmVlXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJHZXQgYSBkZXB0aC1saW1pdGVkIHJlcG9zaXRvcnkgdHJlZSB2aWV3XCIsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICB3b3Jrc3BhY2VSb290OiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlc2NyaXB0aW9uOiBcIlJvb3QgZGlyZWN0b3J5IG9mIHRoZSB3b3Jrc3BhY2VcIiB9LFxuICAgICAgICAgIGRlcHRoOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlc2NyaXB0aW9uOiBcIk1heGltdW0gZGVwdGggdG8gdHJhdmVyc2VcIiB9LFxuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlZDogW1wid29ya3NwYWNlUm9vdFwiXSxcbiAgICAgIH0sXG4gICAgICBleGVjdXRlOiBhc3luYyAoeyB3b3Jrc3BhY2VSb290LCBkZXB0aCB9OiB7IHdvcmtzcGFjZVJvb3Q6IHN0cmluZzsgZGVwdGg/OiBudW1iZXIgfSkgPT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uSWQgPSBjdGwuZ2V0Q29udGV4dChcInNlc3Npb25JZFwiKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICAgICAgcmVjb3JkVG9vbENhbGwoc3RhdGUsIFwiZ2V0X3JlcG9fdHJlZVwiKTtcbiAgICAgICAgcmV0dXJuIGdldFJlcG9UcmVlKHdvcmtzcGFjZVJvb3QsIGRlcHRoKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcImRldGVjdF9wcm9qZWN0XCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlY3QgcHJvamVjdCBlY29zeXN0ZW0gYW5kIHN1Z2dlc3QgY29tbWFuZHNcIixcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZVwiIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVkOiBbXCJ3b3Jrc3BhY2VSb290XCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHdvcmtzcGFjZVJvb3QgfTogeyB3b3Jrc3BhY2VSb290OiBzdHJpbmcgfSkgPT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uSWQgPSBjdGwuZ2V0Q29udGV4dChcInNlc3Npb25JZFwiKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICAgICAgcmVjb3JkVG9vbENhbGwoc3RhdGUsIFwiZGV0ZWN0X3Byb2plY3RcIik7XG4gICAgICAgIHJldHVybiBkZXRlY3RQcm9qZWN0KHdvcmtzcGFjZVJvb3QpO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFwibGlzdF9maWxlc1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiTGlzdCBmaWxlcyB1c2luZyBnbG9iIHBhdHRlcm5cIixcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZVwiIH0sXG4gICAgICAgICAgcGF0dGVybjogeyB0eXBlOiBcInN0cmluZ1wiLCBkZXNjcmlwdGlvbjogXCJHbG9iIHBhdHRlcm4gKGUuZy4sICcqKi8qLnRzJylcIiB9LFxuICAgICAgICAgIGxpbWl0OiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlc2NyaXB0aW9uOiBcIk1heGltdW0gbnVtYmVyIG9mIGZpbGVzXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFtcIndvcmtzcGFjZVJvb3RcIl0sXG4gICAgICB9LFxuICAgICAgZXhlY3V0ZTogYXN5bmMgKHsgd29ya3NwYWNlUm9vdCwgcGF0dGVybiwgbGltaXQgfTogeyB3b3Jrc3BhY2VSb290OiBzdHJpbmc7IHBhdHRlcm4/OiBzdHJpbmc7IGxpbWl0PzogbnVtYmVyIH0pID0+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkID0gY3RsLmdldENvbnRleHQoXCJzZXNzaW9uSWRcIik7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgICAgIHJlY29yZFRvb2xDYWxsKHN0YXRlLCBcImxpc3RfZmlsZXNcIik7XG4gICAgICAgIHJldHVybiBsaXN0RmlsZXMod29ya3NwYWNlUm9vdCwgcGF0dGVybiwgbGltaXQpO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFwicmVhZF9maWxlXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZWFkIGZpbGUgY29udGVudHNcIixcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZVwiIH0sXG4gICAgICAgICAgZmlsZVBhdGg6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUmVsYXRpdmUgcGF0aCB0byBmaWxlXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFtcIndvcmtzcGFjZVJvb3RcIiwgXCJmaWxlUGF0aFwiXSxcbiAgICAgIH0sXG4gICAgICBleGVjdXRlOiBhc3luYyAoeyB3b3Jrc3BhY2VSb290LCBmaWxlUGF0aCB9OiB7IHdvcmtzcGFjZVJvb3Q6IHN0cmluZzsgZmlsZVBhdGg6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHNlc3Npb25JZCA9IGN0bC5nZXRDb250ZXh0KFwic2Vzc2lvbklkXCIpO1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgICAgICByZWNvcmRUb29sQ2FsbChzdGF0ZSwgXCJyZWFkX2ZpbGVcIik7XG4gICAgICAgIHJldHVybiByZWFkRmlsZSh3b3Jrc3BhY2VSb290LCBmaWxlUGF0aCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJzZWFyY2hfY29kZVwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiU2VhcmNoIGZvciBjb2RlIHBhdHRlcm5zIGluIGZpbGVzXCIsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICB3b3Jrc3BhY2VSb290OiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlc2NyaXB0aW9uOiBcIlJvb3QgZGlyZWN0b3J5IG9mIHRoZSB3b3Jrc3BhY2VcIiB9LFxuICAgICAgICAgIHBhdHRlcm46IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUmVnZXggcGF0dGVybiB0byBzZWFyY2hcIiB9LFxuICAgICAgICAgIGZpbGVQYXR0ZXJuOiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlc2NyaXB0aW9uOiBcIkZpbGUgZ2xvYiBwYXR0ZXJuXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFtcIndvcmtzcGFjZVJvb3RcIiwgXCJwYXR0ZXJuXCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHdvcmtzcGFjZVJvb3QsIHBhdHRlcm4sIGZpbGVQYXR0ZXJuIH06IHsgd29ya3NwYWNlUm9vdDogc3RyaW5nOyBwYXR0ZXJuOiBzdHJpbmc7IGZpbGVQYXR0ZXJuPzogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkID0gY3RsLmdldENvbnRleHQoXCJzZXNzaW9uSWRcIik7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgICAgIHJlY29yZFRvb2xDYWxsKHN0YXRlLCBcInNlYXJjaF9jb2RlXCIpO1xuICAgICAgICByZXR1cm4gc2VhcmNoQ29kZSh3b3Jrc3BhY2VSb290LCBwYXR0ZXJuLCBmaWxlUGF0dGVybik7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJhcHBseV9wYXRjaFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiQXBwbHkgYSBzdHJ1Y3R1cmVkIGNvZGUgZWRpdFwiLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgd29ya3NwYWNlUm9vdDogeyB0eXBlOiBcInN0cmluZ1wiLCBkZXNjcmlwdGlvbjogXCJSb290IGRpcmVjdG9yeSBvZiB0aGUgd29ya3NwYWNlXCIgfSxcbiAgICAgICAgICBwYXRjaDogeyB0eXBlOiBcIm9iamVjdFwiLCBkZXNjcmlwdGlvbjogXCJQYXRjaCBvYmplY3RcIiB9LFxuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlZDogW1wid29ya3NwYWNlUm9vdFwiLCBcInBhdGNoXCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHdvcmtzcGFjZVJvb3QsIHBhdGNoIH06IHsgd29ya3NwYWNlUm9vdDogc3RyaW5nOyBwYXRjaDogUGFyYW1ldGVyczx0eXBlb2YgYXBwbHlQYXRjaD5bMV0gfSkgPT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uSWQgPSBjdGwuZ2V0Q29udGV4dChcInNlc3Npb25JZFwiKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICAgICAgcmVjb3JkVG9vbENhbGwoc3RhdGUsIFwiYXBwbHlfcGF0Y2hcIik7XG4gICAgICAgIHJldHVybiBhcHBseVBhdGNoKHdvcmtzcGFjZVJvb3QsIHBhdGNoKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcInJ1bl9jb21tYW5kXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJSdW4gYSBzaGVsbCBjb21tYW5kXCIsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICB3b3Jrc3BhY2VSb290OiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlc2NyaXB0aW9uOiBcIlJvb3QgZGlyZWN0b3J5IG9mIHRoZSB3b3Jrc3BhY2VcIiB9LFxuICAgICAgICAgIGNvbW1hbmQ6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiQ29tbWFuZCB0byBydW5cIiB9LFxuICAgICAgICAgIGFyZ3M6IHsgdHlwZTogXCJhcnJheVwiLCBpdGVtczogeyB0eXBlOiBcInN0cmluZ1wiIH0sIGRlc2NyaXB0aW9uOiBcIkNvbW1hbmQgYXJndW1lbnRzXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFtcIndvcmtzcGFjZVJvb3RcIiwgXCJjb21tYW5kXCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHdvcmtzcGFjZVJvb3QsIGNvbW1hbmQsIGFyZ3MgfTogeyB3b3Jrc3BhY2VSb290OiBzdHJpbmc7IGNvbW1hbmQ6IHN0cmluZzsgYXJncz86IHN0cmluZ1tdIH0pID0+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkID0gY3RsLmdldENvbnRleHQoXCJzZXNzaW9uSWRcIik7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgICAgIHJlY29yZFRvb2xDYWxsKHN0YXRlLCBcInJ1bl9jb21tYW5kXCIpO1xuICAgICAgICByZXR1cm4gcnVuQ29tbWFuZCh3b3Jrc3BhY2VSb290LCBjb21tYW5kLCBhcmdzKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcInJ1bl90ZXN0c1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiUnVuIHByb2plY3QgdGVzdHNcIixcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZVwiIH0sXG4gICAgICAgICAgY29tbWFuZDogeyB0eXBlOiBcInN0cmluZ1wiLCBkZXNjcmlwdGlvbjogXCJUZXN0IGNvbW1hbmQgb3ZlcnJpZGVcIiB9LFxuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlZDogW1wid29ya3NwYWNlUm9vdFwiXSxcbiAgICAgIH0sXG4gICAgICBleGVjdXRlOiBhc3luYyAoeyB3b3Jrc3BhY2VSb290LCBjb21tYW5kIH06IHsgd29ya3NwYWNlUm9vdDogc3RyaW5nOyBjb21tYW5kPzogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkID0gY3RsLmdldENvbnRleHQoXCJzZXNzaW9uSWRcIik7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgICAgIHJlY29yZFRvb2xDYWxsKHN0YXRlLCBcInJ1bl90ZXN0c1wiKTtcbiAgICAgICAgcmV0dXJuIHJ1blRlc3RzKHdvcmtzcGFjZVJvb3QsIGNvbW1hbmQpO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFwiZ2l0X3N0YXR1c1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiU2hvdyBnaXQgcmVwb3NpdG9yeSBzdGF0dXNcIixcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiUm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZVwiIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVkOiBbXCJ3b3Jrc3BhY2VSb290XCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHdvcmtzcGFjZVJvb3QgfTogeyB3b3Jrc3BhY2VSb290OiBzdHJpbmcgfSkgPT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uSWQgPSBjdGwuZ2V0Q29udGV4dChcInNlc3Npb25JZFwiKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICAgICAgcmVjb3JkVG9vbENhbGwoc3RhdGUsIFwiZ2l0X3N0YXR1c1wiKTtcbiAgICAgICAgcmV0dXJuIGdpdFN0YXR1cyh3b3Jrc3BhY2VSb290KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcImdpdF9kaWZmXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGdpdCBkaWZmXCIsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICB3b3Jrc3BhY2VSb290OiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlc2NyaXB0aW9uOiBcIlJvb3QgZGlyZWN0b3J5IG9mIHRoZSB3b3Jrc3BhY2VcIiB9LFxuICAgICAgICAgIHN0YWdlZDogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVzY3JpcHRpb246IFwiU2hvdyBzdGFnZWQgY2hhbmdlc1wiIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVkOiBbXCJ3b3Jrc3BhY2VSb290XCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHdvcmtzcGFjZVJvb3QsIHN0YWdlZCB9OiB7IHdvcmtzcGFjZVJvb3Q6IHN0cmluZzsgc3RhZ2VkPzogYm9vbGVhbiB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHNlc3Npb25JZCA9IGN0bC5nZXRDb250ZXh0KFwic2Vzc2lvbklkXCIpO1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgICAgICByZWNvcmRUb29sQ2FsbChzdGF0ZSwgXCJnaXRfZGlmZlwiKTtcbiAgICAgICAgcmV0dXJuIGdpdERpZmYod29ya3NwYWNlUm9vdCwgc3RhZ2VkKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcIndlYl9zZWFyY2hcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNlYXJjaCB0aGUgd2ViIGZvciBkb2N1bWVudGF0aW9uIG9yIGVycm9yc1wiLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgcXVlcnk6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVzY3JpcHRpb246IFwiU2VhcmNoIHF1ZXJ5XCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQ6IFtcInF1ZXJ5XCJdLFxuICAgICAgfSxcbiAgICAgIGV4ZWN1dGU6IGFzeW5jICh7IHF1ZXJ5IH06IHsgcXVlcnk6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHNlc3Npb25JZCA9IGN0bC5nZXRDb250ZXh0KFwic2Vzc2lvbklkXCIpO1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgICAgICByZWNvcmRUb29sQ2FsbChzdGF0ZSwgXCJ3ZWJfc2VhcmNoXCIpO1xuICAgICAgICByZWNvcmRXZWJTZWFyY2goc3RhdGUpO1xuICAgICAgICByZXR1cm4gd2ViU2VhcmNoKHF1ZXJ5KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbn1cblxuZXhwb3J0IGNvbnN0IG1haW4gPSBhc3luYyBmdW5jdGlvbiAoY29udGV4dDogYW55KSB7XG4gIGNvbnRleHQud2l0aFRvb2xzUHJvdmlkZXIoY3JlYXRlVG9vbHMpO1xufTtcbiIsICJpbXBvcnQgeyBMTVN0dWRpb0NsaWVudCwgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSBcIkBsbXN0dWRpby9zZGtcIjtcblxuZGVjbGFyZSB2YXIgcHJvY2VzczogYW55O1xuXG4vLyBXZSByZWNlaXZlIHJ1bnRpbWUgaW5mb3JtYXRpb24gaW4gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmNvbnN0IGNsaWVudElkZW50aWZpZXIgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9JREVOVElGSUVSO1xuY29uc3QgY2xpZW50UGFzc2tleSA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX1BBU1NLRVk7XG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9CQVNFX1VSTDtcblxuY29uc3QgY2xpZW50ID0gbmV3IExNU3R1ZGlvQ2xpZW50KHtcbiAgY2xpZW50SWRlbnRpZmllcixcbiAgY2xpZW50UGFzc2tleSxcbiAgYmFzZVVybCxcbn0pO1xuXG4oZ2xvYmFsVGhpcyBhcyBhbnkpLl9fTE1TX1BMVUdJTl9DT05URVhUID0gdHJ1ZTtcblxubGV0IHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IGZhbHNlO1xubGV0IHByb21wdFByZXByb2Nlc3NvclNldCA9IGZhbHNlO1xubGV0IGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgdG9vbHNQcm92aWRlclNldCA9IGZhbHNlO1xubGV0IGdlbmVyYXRvclNldCA9IGZhbHNlO1xuXG5jb25zdCBzZWxmUmVnaXN0cmF0aW9uSG9zdCA9IGNsaWVudC5wbHVnaW5zLmdldFNlbGZSZWdpc3RyYXRpb25Ib3N0KCk7XG5cbmNvbnN0IHBsdWdpbkNvbnRleHQ6IFBsdWdpbkNvbnRleHQgPSB7XG4gIHdpdGhQcmVkaWN0aW9uTG9vcEhhbmRsZXI6IChnZW5lcmF0ZSkgPT4ge1xuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHRvb2xzIHByb3ZpZGVyXCIpO1xuICAgIH1cblxuICAgIHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJlZGljdGlvbkxvb3BIYW5kbGVyKGdlbmVyYXRlKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFByb21wdFByZXByb2Nlc3NvcjogKHByZXByb2Nlc3MpID0+IHtcbiAgICBpZiAocHJvbXB0UHJlcHJvY2Vzc29yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9tcHRQcmVwcm9jZXNzb3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByb21wdFByZXByb2Nlc3NvcihwcmVwcm9jZXNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aENvbmZpZ1NjaGVtYXRpY3M6IChjb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGNvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgY29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0Q29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdsb2JhbENvbmZpZ1NjaGVtYXRpY3M6IChnbG9iYWxDb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdsb2JhbCBjb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdsb2JhbENvbmZpZ1NjaGVtYXRpY3MoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhUb29sc1Byb3ZpZGVyOiAodG9vbHNQcm92aWRlcikgPT4ge1xuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSBwcmVkaWN0aW9uTG9vcEhhbmRsZXJcIik7XG4gICAgfVxuXG4gICAgdG9vbHNQcm92aWRlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0VG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdlbmVyYXRvcjogKGdlbmVyYXRvcikgPT4ge1xuICAgIGlmIChnZW5lcmF0b3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuXG4gICAgZ2VuZXJhdG9yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHZW5lcmF0b3IoZ2VuZXJhdG9yKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbn07XG5cbmltcG9ydChcIi4vLi4vc3JjL2luZGV4LnRzXCIpLnRoZW4oYXN5bmMgbW9kdWxlID0+IHtcbiAgcmV0dXJuIGF3YWl0IG1vZHVsZS5tYWluKHBsdWdpbkNvbnRleHQpO1xufSkudGhlbigoKSA9PiB7XG4gIHNlbGZSZWdpc3RyYXRpb25Ib3N0LmluaXRDb21wbGV0ZWQoKTtcbn0pLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGV4ZWN1dGUgdGhlIG1haW4gZnVuY3Rpb24gb2YgdGhlIHBsdWdpbi5cIik7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVdPLFNBQVMscUJBQXFCLGVBQXVCLFVBQTBCO0FBQ3BGLFFBQU0sV0FBVyxpQkFBQUEsUUFBSyxRQUFRLGVBQWUsUUFBUTtBQUNyRCxRQUFNLGlCQUFpQixpQkFBQUEsUUFBSyxRQUFRLGFBQWE7QUFDakQsTUFBSSxDQUFDLFNBQVMsV0FBVyxpQkFBaUIsaUJBQUFBLFFBQUssR0FBRyxLQUFLLGFBQWEsZ0JBQWdCO0FBQ2xGLFVBQU0sSUFBSSxNQUFNLDJCQUEyQixRQUFRLEVBQUU7QUFBQSxFQUN2RDtBQUVBLFFBQU0sVUFBVSxpQkFBaUIsS0FBSyxDQUFDLFlBQVksU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUMvRSxNQUFJLFNBQVM7QUFDWCxVQUFNLElBQUksTUFBTSxpQ0FBaUMsT0FBTyxFQUFFO0FBQUEsRUFDNUQ7QUFFQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLFlBQVksT0FBZSxVQUEwQjtBQUNuRSxNQUFJLENBQUMsT0FBTyxVQUFVLEtBQUssS0FBSyxRQUFRLEdBQUc7QUFDekMsVUFBTSxJQUFJLE1BQU0sdUNBQXVDO0FBQUEsRUFDekQ7QUFFQSxNQUFJLFFBQVEsVUFBVTtBQUNwQixVQUFNLElBQUksTUFBTSxTQUFTLEtBQUssc0JBQXNCLFFBQVEsR0FBRztBQUFBLEVBQ2pFO0FBRUEsU0FBTztBQUNUO0FBcENBLHNCQUVNO0FBRk47QUFBQTtBQUFBO0FBQUEsdUJBQWlCO0FBRWpCLElBQU0sbUJBQW1CO0FBQUEsTUFDdkI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQTtBQUFBOzs7QUNKQSxlQUFlLE9BQU8sVUFBb0M7QUFDeEQsTUFBSTtBQUNGLFVBQU0sZ0JBQUFDLFFBQUcsT0FBTyxRQUFRO0FBQ3hCLFdBQU87QUFBQSxFQUNULFFBQVE7QUFDTixXQUFPO0FBQUEsRUFDVDtBQUNGO0FBRUEsZUFBc0IsY0FBYyxlQUFrRDtBQUNwRixRQUFNLE9BQU8scUJBQXFCLGVBQWUsR0FBRztBQUVwRCxRQUFNLGNBQWMsa0JBQUFDLFFBQUssS0FBSyxNQUFNLGNBQWM7QUFDbEQsTUFBSSxNQUFNLE9BQU8sV0FBVyxHQUFHO0FBQzdCLFdBQU87QUFBQSxNQUNMLFVBQVU7QUFBQSxNQUNWLFdBQVc7QUFBQSxNQUNYLGFBQWE7QUFBQSxNQUNiLGNBQWM7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLE1BQU0sT0FBTyxrQkFBQUEsUUFBSyxLQUFLLE1BQU0sZ0JBQWdCLENBQUMsS0FBSyxNQUFNLE9BQU8sa0JBQUFBLFFBQUssS0FBSyxNQUFNLGtCQUFrQixDQUFDLEdBQUc7QUFDeEcsV0FBTztBQUFBLE1BQ0wsVUFBVTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsY0FBYztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUVBLE1BQUksTUFBTSxPQUFPLGtCQUFBQSxRQUFLLEtBQUssTUFBTSxZQUFZLENBQUMsR0FBRztBQUMvQyxXQUFPO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixXQUFXO0FBQUEsTUFDWCxhQUFhO0FBQUEsTUFDYixjQUFjO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBRUEsTUFBSSxNQUFNLE9BQU8sa0JBQUFBLFFBQUssS0FBSyxNQUFNLFFBQVEsQ0FBQyxHQUFHO0FBQzNDLFdBQU87QUFBQSxNQUNMLFVBQVU7QUFBQSxNQUNWLFdBQVc7QUFBQSxNQUNYLGFBQWE7QUFBQSxNQUNiLGNBQWM7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLE1BQU0sT0FBTyxrQkFBQUEsUUFBSyxLQUFLLE1BQU0sU0FBUyxDQUFDLEtBQUssTUFBTSxPQUFPLGtCQUFBQSxRQUFLLEtBQUssTUFBTSxjQUFjLENBQUMsR0FBRztBQUM3RixXQUFPO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixXQUFXO0FBQUEsTUFDWCxhQUFhO0FBQUEsTUFDYixjQUFjO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBRUEsU0FBTyxFQUFFLFVBQVUsVUFBVTtBQUMvQjtBQWhFQSxxQkFDQUM7QUFEQTtBQUFBO0FBQUE7QUFBQSxzQkFBZTtBQUNmLElBQUFBLG9CQUFpQjtBQUNqQjtBQUFBO0FBQUE7OztBQ0ZBLElBRWEsaUJBU0Esc0JBZ0JBO0FBM0JiO0FBQUE7QUFBQTtBQUVPLElBQU0sa0JBQWtCO0FBQUEsTUFDN0I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFFTyxJQUFNLHVCQUF1QixvQkFBSSxJQUFJO0FBQUEsTUFDMUM7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGLENBQUM7QUFFTSxJQUFNLFNBQXdCO0FBQUEsTUFDbkMsY0FBYztBQUFBLE1BQ2QsZ0JBQWdCO0FBQUEsTUFDaEIsbUJBQW1CO0FBQUEsTUFDbkIsa0JBQWtCO0FBQUEsTUFDbEIsdUJBQXVCO0FBQUEsTUFDdkIsa0JBQWtCO0FBQUEsTUFDbEIsa0JBQWtCO0FBQUEsSUFDcEI7QUFBQTtBQUFBOzs7QUM3QkEsZUFBc0IsWUFBWSxlQUF1QixRQUFRLEdBQTRCO0FBQzNGLFFBQU0sa0JBQWtCLFlBQVksT0FBTyxPQUFPLGdCQUFnQjtBQUNsRSxRQUFNLE9BQU8scUJBQXFCLGVBQWUsR0FBRztBQUVwRCxRQUFNLFVBQVUsVUFBTSxpQkFBQUMsU0FBRyxRQUFRO0FBQUEsSUFDL0IsS0FBSztBQUFBLElBQ0wsS0FBSztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1YsQ0FBQztBQUVELFFBQU0sUUFBUSxRQUNYLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUNqQyxJQUFJLENBQUMsVUFBVTtBQUNkLFVBQU0sUUFBUSxNQUFNLE1BQU0sR0FBRztBQUM3QixVQUFNLFNBQVMsS0FBSyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBQzNDLFdBQU8sR0FBRyxNQUFNLEtBQUssa0JBQUFDLFFBQUssU0FBUyxLQUFLLENBQUM7QUFBQSxFQUMzQyxDQUFDO0FBRUgsU0FBTyxFQUFFLE1BQU0sTUFBTSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQ3hDO0FBNUJBLHNCQUNBQztBQURBO0FBQUE7QUFBQTtBQUFBLHVCQUFlO0FBQ2YsSUFBQUEsb0JBQWlCO0FBQ2pCO0FBQ0E7QUFBQTtBQUFBOzs7QUNHQSxlQUFzQixVQUFVLGVBQXVCLFVBQVUsUUFBUSxRQUFRLEtBQXdCO0FBQ3ZHLFFBQU0sT0FBTyxxQkFBcUIsZUFBZSxHQUFHO0FBQ3BELFFBQU0sVUFBVSxVQUFNLGtCQUFBQyxTQUFHLFNBQVM7QUFBQSxJQUNoQyxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsRUFDVixDQUFDO0FBRUQsU0FBTyxRQUFRLE1BQU0sR0FBRyxLQUFLO0FBQy9CO0FBRUEsZUFBc0IsU0FBUyxlQUF1QixVQUFtQztBQUN2RixRQUFNLGVBQWUscUJBQXFCLGVBQWUsUUFBUTtBQUNqRSxRQUFNLE9BQU8sTUFBTSxpQkFBQUMsUUFBRyxLQUFLLFlBQVk7QUFDdkMsTUFBSSxLQUFLLE9BQU8sT0FBTyxrQkFBa0I7QUFDdkMsVUFBTSxJQUFJLE1BQU0sbUJBQW1CLEtBQUssSUFBSSxVQUFVO0FBQUEsRUFDeEQ7QUFFQSxTQUFPLGlCQUFBQSxRQUFHLFNBQVMsY0FBYyxNQUFNO0FBQ3pDO0FBRUEsZUFBc0IsV0FDcEIsZUFDQSxTQUNBLGNBQWMsOENBQ21EO0FBQ2pFLFFBQU0sT0FBTyxxQkFBcUIsZUFBZSxHQUFHO0FBQ3BELFFBQU0sUUFBUSxNQUFNLFVBQVUsTUFBTSxhQUFhLEdBQUc7QUFDcEQsUUFBTSxRQUFRLElBQUksT0FBTyxTQUFTLEdBQUc7QUFDckMsUUFBTSxPQUErRCxDQUFDO0FBRXRFLGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFVBQU0sVUFBVSxNQUFNLGlCQUFBQSxRQUFHLFNBQVMsa0JBQUFDLFFBQUssS0FBSyxNQUFNLElBQUksR0FBRyxNQUFNO0FBQy9ELFVBQU0sUUFBUSxRQUFRLE1BQU0sT0FBTztBQUNuQyxVQUFNLFFBQVEsQ0FBQyxVQUFVLFVBQVU7QUFDakMsVUFBSSxNQUFNLEtBQUssUUFBUSxHQUFHO0FBQ3hCLGFBQUssS0FBSyxFQUFFLE1BQU0sTUFBTSxRQUFRLEdBQUcsU0FBUyxTQUFTLEtBQUssRUFBRSxDQUFDO0FBQUEsTUFDL0Q7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTyxLQUFLLE1BQU0sR0FBRyxHQUFHO0FBQzFCO0FBakRBLElBQUFDLGtCQUNBQyxtQkFDQUM7QUFGQTtBQUFBO0FBQUE7QUFBQSxJQUFBRixtQkFBZTtBQUNmLElBQUFDLG9CQUFpQjtBQUNqQixJQUFBQyxvQkFBZTtBQUNmO0FBQ0E7QUFBQTtBQUFBOzs7QUNZQSxlQUFzQixXQUFXLGVBQXVCLE9BQTZDO0FBQ25HLE1BQUksTUFBTSxPQUFPLFdBQVc7QUFDMUIsVUFBTSxJQUFJLE1BQU0seUJBQXlCLE1BQU0sRUFBRSxFQUFFO0FBQUEsRUFDckQ7QUFFQSxRQUFNLGVBQWUscUJBQXFCLGVBQWUsTUFBTSxJQUFJO0FBQ25FLFFBQU0sV0FBVyxNQUFNLGlCQUFBQyxRQUFHLFNBQVMsY0FBYyxNQUFNO0FBRXZELE1BQUksQ0FBQyxTQUFTLFNBQVMsTUFBTSxJQUFJLEdBQUc7QUFDbEMsVUFBTSxJQUFJLE1BQU0sOEJBQThCLE1BQU0sSUFBSSxFQUFFO0FBQUEsRUFDNUQ7QUFFQSxRQUFNLGVBQWUsTUFBTSxTQUFTO0FBQ3BDLE1BQUksZUFBZTtBQUNuQixNQUFJLE9BQU87QUFFWCxTQUFPLEtBQUssU0FBUyxNQUFNLElBQUksS0FBSyxlQUFlLGNBQWM7QUFDL0QsV0FBTyxLQUFLLFFBQVEsTUFBTSxNQUFNLE1BQU0sT0FBTztBQUM3QyxvQkFBZ0I7QUFBQSxFQUNsQjtBQUVBLE1BQUksaUJBQWlCLGNBQWM7QUFDakMsVUFBTSxJQUFJLE1BQU0sWUFBWSxZQUFZLDZCQUE2QixZQUFZLEdBQUc7QUFBQSxFQUN0RjtBQUVBLFFBQU0saUJBQUFBLFFBQUcsVUFBVSxjQUFjLE1BQU0sTUFBTTtBQUM3QyxTQUFPLEVBQUUsTUFBTSxNQUFNLE1BQU0sYUFBYTtBQUMxQztBQTNDQSxJQUFBQztBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFlO0FBQ2Y7QUFBQTtBQUFBOzs7QUNhQSxlQUFzQixXQUFXLGVBQXVCLFNBQWlCLE9BQWlCLENBQUMsR0FBMkI7QUFDcEgsTUFBSSxDQUFDLHFCQUFxQixJQUFJLE9BQU8sR0FBRztBQUN0QyxVQUFNLElBQUksTUFBTSw0QkFBNEIsT0FBTyxFQUFFO0FBQUEsRUFDdkQ7QUFFQSxRQUFNLE1BQU0scUJBQXFCLGVBQWUsR0FBRztBQUVuRCxNQUFJO0FBQ0YsVUFBTSxFQUFFLFFBQVEsT0FBTyxJQUFJLE1BQU0sY0FBYyxTQUFTLE1BQU07QUFBQSxNQUM1RDtBQUFBLE1BQ0EsU0FBUyxPQUFPO0FBQUEsTUFDaEIsV0FBVyxPQUFPO0FBQUEsSUFDcEIsQ0FBQztBQUVELFdBQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLEtBQUssR0FBRztBQUFBLE1BQ3BDO0FBQUEsTUFDQTtBQUFBLE1BQ0EsVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGLFNBQVMsT0FBTztBQUNkLFVBQU0sTUFBTTtBQUNaLFdBQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLEtBQUssR0FBRztBQUFBLE1BQ3BDLFFBQVEsSUFBSSxVQUFVO0FBQUEsTUFDdEIsUUFBUSxJQUFJLFVBQVUsSUFBSTtBQUFBLE1BQzFCLFVBQVUsT0FBTyxJQUFJLFNBQVMsV0FBVyxJQUFJLE9BQU87QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRjtBQTNDQSwrQkFDQSxrQkFJTTtBQUxOO0FBQUE7QUFBQTtBQUFBLGdDQUF5QjtBQUN6Qix1QkFBMEI7QUFDMUI7QUFDQTtBQUVBLElBQU0sb0JBQWdCLDRCQUFVLGtDQUFRO0FBQUE7QUFBQTs7O0FDSHhDLGVBQXNCLFNBQVMsZUFBdUIsU0FBMEM7QUFDOUYsTUFBSSxTQUFTO0FBQ1gsVUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLElBQUksUUFBUSxNQUFNLEdBQUc7QUFDMUMsV0FBTyxXQUFXLGVBQWUsTUFBTSxLQUFLO0FBQUEsRUFDOUM7QUFFQSxTQUFPLFdBQVcsZUFBZSxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQ2xEO0FBVEE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFQSxlQUFzQixVQUFVLGVBQXdDO0FBQ3RFLFFBQU0sU0FBUyxNQUFNLFdBQVcsZUFBZSxPQUFPLENBQUMsVUFBVSxTQUFTLENBQUM7QUFDM0UsTUFBSSxPQUFPLGFBQWEsR0FBRztBQUN6QixVQUFNLElBQUksTUFBTSxPQUFPLFVBQVUsNEJBQTRCO0FBQUEsRUFDL0Q7QUFFQSxTQUFPLE9BQU8sT0FBTyxLQUFLO0FBQzVCO0FBRUEsZUFBc0IsUUFBUSxlQUF1QixTQUFTLE9BQXdCO0FBQ3BGLFFBQU0sT0FBTyxTQUFTLENBQUMsUUFBUSxVQUFVLElBQUksQ0FBQyxNQUFNO0FBQ3BELFFBQU0sU0FBUyxNQUFNLFdBQVcsZUFBZSxPQUFPLElBQUk7QUFDMUQsTUFBSSxPQUFPLGFBQWEsR0FBRztBQUN6QixVQUFNLElBQUksTUFBTSxPQUFPLFVBQVUsMEJBQTBCO0FBQUEsRUFDN0Q7QUFFQSxTQUFPLE9BQU87QUFDaEI7QUFuQkE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNFQSxTQUFTLGVBQWUsS0FBNEM7QUFDbEUsTUFBSSxrRUFBa0UsS0FBSyxHQUFHLEdBQUc7QUFDL0UsV0FBTztBQUFBLEVBQ1Q7QUFFQSxNQUFJLDBDQUEwQyxLQUFLLEdBQUcsR0FBRztBQUN2RCxXQUFPO0FBQUEsRUFDVDtBQUVBLFNBQU87QUFDVDtBQUVBLGVBQXNCLFVBQVUsT0FBMkM7QUFDekUsUUFBTSxXQUFXLGtDQUFrQyxtQkFBbUIsS0FBSyxDQUFDO0FBQzVFLFFBQU0sV0FBVyxNQUFNLE1BQU0sVUFBVTtBQUFBLElBQ3JDLFNBQVM7QUFBQSxNQUNQLGNBQWM7QUFBQSxJQUNoQjtBQUFBLEVBQ0YsQ0FBQztBQUVELE1BQUksQ0FBQyxTQUFTLElBQUk7QUFDaEIsVUFBTSxJQUFJLE1BQU0sc0JBQXNCLFNBQVMsTUFBTSxFQUFFO0FBQUEsRUFDekQ7QUFFQSxRQUFNLE9BQU8sTUFBTSxTQUFTLEtBQUs7QUFDakMsUUFBTSxVQUFVLENBQUMsR0FBRyxLQUFLLFNBQVMsOERBQThELENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQztBQUU3RyxTQUFPLFFBQVEsSUFBSSxDQUFDLFVBQVU7QUFDNUIsVUFBTSxNQUFNLE1BQU0sQ0FBQztBQUNuQixVQUFNLFFBQVEsTUFBTSxDQUFDLEVBQUUsUUFBUSxZQUFZLEVBQUUsRUFBRSxLQUFLO0FBQ3BELFdBQU87QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLE1BQ1QsWUFBWSxlQUFlLEdBQUc7QUFBQSxJQUNoQztBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBdkNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0dPLFNBQVMsNEJBQTBDO0FBQ3hELFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGdCQUFnQjtBQUFBLElBQ2hCLFNBQVMsQ0FBQztBQUFBLEVBQ1o7QUFDRjtBQUVPLFNBQVMsZUFBZSxPQUFxQixVQUF3QjtBQUMxRSxRQUFNLGFBQWE7QUFDbkIsUUFBTSxRQUFRLEtBQUssUUFBUTtBQUUzQixNQUFJLE1BQU0sWUFBWSxPQUFPLGNBQWM7QUFDekMsVUFBTSxJQUFJLE1BQU0sMkJBQTJCLE9BQU8sWUFBWSxFQUFFO0FBQUEsRUFDbEU7QUFDRjtBQVNPLFNBQVMsZ0JBQWdCLE9BQTJCO0FBQ3pELFFBQU0sa0JBQWtCO0FBQ3hCLE1BQUksTUFBTSxpQkFBaUIsT0FBTyxtQkFBbUI7QUFDbkQsVUFBTSxJQUFJLE1BQU0sNkJBQTZCLE9BQU8saUJBQWlCLEVBQUU7QUFBQSxFQUN6RTtBQUNGO0FBakNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUEsSUFHYTtBQUhiO0FBQUE7QUFBQTtBQUFBO0FBR08sSUFBTSxlQUFOLE1BQW1CO0FBQUEsTUFDUCxXQUFXLG9CQUFJLElBQTBCO0FBQUEsTUFFMUQsSUFBSSxXQUFpQztBQUNuQyxZQUFJLENBQUMsS0FBSyxTQUFTLElBQUksU0FBUyxHQUFHO0FBQ2pDLGVBQUssU0FBUyxJQUFJLFdBQVcsMEJBQTBCLENBQUM7QUFBQSxRQUMxRDtBQUVBLGVBQU8sS0FBSyxTQUFTLElBQUksU0FBUztBQUFBLE1BQ3BDO0FBQUEsTUFFQSxNQUFNLFdBQXlCO0FBQzdCLGFBQUssU0FBUyxPQUFPLFNBQVM7QUFBQSxNQUNoQztBQUFBLElBQ0Y7QUFBQTtBQUFBOzs7QUNqQkE7QUFBQTtBQUFBO0FBQUE7QUFjQSxTQUFTLFlBQVksS0FBVTtBQUM3QixTQUFPO0FBQUEsSUFDTDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsWUFBWTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFVBQ1YsZUFBZSxFQUFFLE1BQU0sVUFBVSxhQUFhLGtDQUFrQztBQUFBLFVBQ2hGLE9BQU8sRUFBRSxNQUFNLFVBQVUsYUFBYSw0QkFBNEI7QUFBQSxRQUNwRTtBQUFBLFFBQ0EsVUFBVSxDQUFDLGVBQWU7QUFBQSxNQUM1QjtBQUFBLE1BQ0EsU0FBUyxPQUFPLEVBQUUsZUFBZSxNQUFNLE1BQWlEO0FBQ3RGLGNBQU0sWUFBWSxJQUFJLFdBQVcsV0FBVztBQUM1QyxjQUFNLFFBQVEsU0FBUyxJQUFJLFNBQVM7QUFDcEMsdUJBQWUsT0FBTyxlQUFlO0FBQ3JDLGVBQU8sWUFBWSxlQUFlLEtBQUs7QUFBQSxNQUN6QztBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixZQUFZO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsVUFDVixlQUFlLEVBQUUsTUFBTSxVQUFVLGFBQWEsa0NBQWtDO0FBQUEsUUFDbEY7QUFBQSxRQUNBLFVBQVUsQ0FBQyxlQUFlO0FBQUEsTUFDNUI7QUFBQSxNQUNBLFNBQVMsT0FBTyxFQUFFLGNBQWMsTUFBaUM7QUFDL0QsY0FBTSxZQUFZLElBQUksV0FBVyxXQUFXO0FBQzVDLGNBQU0sUUFBUSxTQUFTLElBQUksU0FBUztBQUNwQyx1QkFBZSxPQUFPLGdCQUFnQjtBQUN0QyxlQUFPLGNBQWMsYUFBYTtBQUFBLE1BQ3BDO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLFlBQVk7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxVQUNWLGVBQWUsRUFBRSxNQUFNLFVBQVUsYUFBYSxrQ0FBa0M7QUFBQSxVQUNoRixTQUFTLEVBQUUsTUFBTSxVQUFVLGFBQWEsaUNBQWlDO0FBQUEsVUFDekUsT0FBTyxFQUFFLE1BQU0sVUFBVSxhQUFhLDBCQUEwQjtBQUFBLFFBQ2xFO0FBQUEsUUFDQSxVQUFVLENBQUMsZUFBZTtBQUFBLE1BQzVCO0FBQUEsTUFDQSxTQUFTLE9BQU8sRUFBRSxlQUFlLFNBQVMsTUFBTSxNQUFtRTtBQUNqSCxjQUFNLFlBQVksSUFBSSxXQUFXLFdBQVc7QUFDNUMsY0FBTSxRQUFRLFNBQVMsSUFBSSxTQUFTO0FBQ3BDLHVCQUFlLE9BQU8sWUFBWTtBQUNsQyxlQUFPLFVBQVUsZUFBZSxTQUFTLEtBQUs7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixZQUFZO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsVUFDVixlQUFlLEVBQUUsTUFBTSxVQUFVLGFBQWEsa0NBQWtDO0FBQUEsVUFDaEYsVUFBVSxFQUFFLE1BQU0sVUFBVSxhQUFhLHdCQUF3QjtBQUFBLFFBQ25FO0FBQUEsUUFDQSxVQUFVLENBQUMsaUJBQWlCLFVBQVU7QUFBQSxNQUN4QztBQUFBLE1BQ0EsU0FBUyxPQUFPLEVBQUUsZUFBZSxTQUFTLE1BQW1EO0FBQzNGLGNBQU0sWUFBWSxJQUFJLFdBQVcsV0FBVztBQUM1QyxjQUFNLFFBQVEsU0FBUyxJQUFJLFNBQVM7QUFDcEMsdUJBQWUsT0FBTyxXQUFXO0FBQ2pDLGVBQU8sU0FBUyxlQUFlLFFBQVE7QUFBQSxNQUN6QztBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixZQUFZO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsVUFDVixlQUFlLEVBQUUsTUFBTSxVQUFVLGFBQWEsa0NBQWtDO0FBQUEsVUFDaEYsU0FBUyxFQUFFLE1BQU0sVUFBVSxhQUFhLDBCQUEwQjtBQUFBLFVBQ2xFLGFBQWEsRUFBRSxNQUFNLFVBQVUsYUFBYSxvQkFBb0I7QUFBQSxRQUNsRTtBQUFBLFFBQ0EsVUFBVSxDQUFDLGlCQUFpQixTQUFTO0FBQUEsTUFDdkM7QUFBQSxNQUNBLFNBQVMsT0FBTyxFQUFFLGVBQWUsU0FBUyxZQUFZLE1BQXdFO0FBQzVILGNBQU0sWUFBWSxJQUFJLFdBQVcsV0FBVztBQUM1QyxjQUFNLFFBQVEsU0FBUyxJQUFJLFNBQVM7QUFDcEMsdUJBQWUsT0FBTyxhQUFhO0FBQ25DLGVBQU8sV0FBVyxlQUFlLFNBQVMsV0FBVztBQUFBLE1BQ3ZEO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLFlBQVk7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxVQUNWLGVBQWUsRUFBRSxNQUFNLFVBQVUsYUFBYSxrQ0FBa0M7QUFBQSxVQUNoRixPQUFPLEVBQUUsTUFBTSxVQUFVLGFBQWEsZUFBZTtBQUFBLFFBQ3ZEO0FBQUEsUUFDQSxVQUFVLENBQUMsaUJBQWlCLE9BQU87QUFBQSxNQUNyQztBQUFBLE1BQ0EsU0FBUyxPQUFPLEVBQUUsZUFBZSxNQUFNLE1BQTBFO0FBQy9HLGNBQU0sWUFBWSxJQUFJLFdBQVcsV0FBVztBQUM1QyxjQUFNLFFBQVEsU0FBUyxJQUFJLFNBQVM7QUFDcEMsdUJBQWUsT0FBTyxhQUFhO0FBQ25DLGVBQU8sV0FBVyxlQUFlLEtBQUs7QUFBQSxNQUN4QztBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixZQUFZO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsVUFDVixlQUFlLEVBQUUsTUFBTSxVQUFVLGFBQWEsa0NBQWtDO0FBQUEsVUFDaEYsU0FBUyxFQUFFLE1BQU0sVUFBVSxhQUFhLGlCQUFpQjtBQUFBLFVBQ3pELE1BQU0sRUFBRSxNQUFNLFNBQVMsT0FBTyxFQUFFLE1BQU0sU0FBUyxHQUFHLGFBQWEsb0JBQW9CO0FBQUEsUUFDckY7QUFBQSxRQUNBLFVBQVUsQ0FBQyxpQkFBaUIsU0FBUztBQUFBLE1BQ3ZDO0FBQUEsTUFDQSxTQUFTLE9BQU8sRUFBRSxlQUFlLFNBQVMsS0FBSyxNQUFtRTtBQUNoSCxjQUFNLFlBQVksSUFBSSxXQUFXLFdBQVc7QUFDNUMsY0FBTSxRQUFRLFNBQVMsSUFBSSxTQUFTO0FBQ3BDLHVCQUFlLE9BQU8sYUFBYTtBQUNuQyxlQUFPLFdBQVcsZUFBZSxTQUFTLElBQUk7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixZQUFZO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsVUFDVixlQUFlLEVBQUUsTUFBTSxVQUFVLGFBQWEsa0NBQWtDO0FBQUEsVUFDaEYsU0FBUyxFQUFFLE1BQU0sVUFBVSxhQUFhLHdCQUF3QjtBQUFBLFFBQ2xFO0FBQUEsUUFDQSxVQUFVLENBQUMsZUFBZTtBQUFBLE1BQzVCO0FBQUEsTUFDQSxTQUFTLE9BQU8sRUFBRSxlQUFlLFFBQVEsTUFBbUQ7QUFDMUYsY0FBTSxZQUFZLElBQUksV0FBVyxXQUFXO0FBQzVDLGNBQU0sUUFBUSxTQUFTLElBQUksU0FBUztBQUNwQyx1QkFBZSxPQUFPLFdBQVc7QUFDakMsZUFBTyxTQUFTLGVBQWUsT0FBTztBQUFBLE1BQ3hDO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLFlBQVk7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxVQUNWLGVBQWUsRUFBRSxNQUFNLFVBQVUsYUFBYSxrQ0FBa0M7QUFBQSxRQUNsRjtBQUFBLFFBQ0EsVUFBVSxDQUFDLGVBQWU7QUFBQSxNQUM1QjtBQUFBLE1BQ0EsU0FBUyxPQUFPLEVBQUUsY0FBYyxNQUFpQztBQUMvRCxjQUFNLFlBQVksSUFBSSxXQUFXLFdBQVc7QUFDNUMsY0FBTSxRQUFRLFNBQVMsSUFBSSxTQUFTO0FBQ3BDLHVCQUFlLE9BQU8sWUFBWTtBQUNsQyxlQUFPLFVBQVUsYUFBYTtBQUFBLE1BQ2hDO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLFlBQVk7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxVQUNWLGVBQWUsRUFBRSxNQUFNLFVBQVUsYUFBYSxrQ0FBa0M7QUFBQSxVQUNoRixRQUFRLEVBQUUsTUFBTSxXQUFXLGFBQWEsc0JBQXNCO0FBQUEsUUFDaEU7QUFBQSxRQUNBLFVBQVUsQ0FBQyxlQUFlO0FBQUEsTUFDNUI7QUFBQSxNQUNBLFNBQVMsT0FBTyxFQUFFLGVBQWUsT0FBTyxNQUFtRDtBQUN6RixjQUFNLFlBQVksSUFBSSxXQUFXLFdBQVc7QUFDNUMsY0FBTSxRQUFRLFNBQVMsSUFBSSxTQUFTO0FBQ3BDLHVCQUFlLE9BQU8sVUFBVTtBQUNoQyxlQUFPLFFBQVEsZUFBZSxNQUFNO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsWUFBWTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFVBQ1YsT0FBTyxFQUFFLE1BQU0sVUFBVSxhQUFhLGVBQWU7QUFBQSxRQUN2RDtBQUFBLFFBQ0EsVUFBVSxDQUFDLE9BQU87QUFBQSxNQUNwQjtBQUFBLE1BQ0EsU0FBUyxPQUFPLEVBQUUsTUFBTSxNQUF5QjtBQUMvQyxjQUFNLFlBQVksSUFBSSxXQUFXLFdBQVc7QUFDNUMsY0FBTSxRQUFRLFNBQVMsSUFBSSxTQUFTO0FBQ3BDLHVCQUFlLE9BQU8sWUFBWTtBQUNsQyx3QkFBZ0IsS0FBSztBQUNyQixlQUFPLFVBQVUsS0FBSztBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQXhOQSxJQVlNLFVBOE1PO0FBMU5iO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTSxXQUFXLElBQUksYUFBYTtBQThNM0IsSUFBTSxPQUFPLGVBQWdCLFNBQWM7QUFDaEQsY0FBUSxrQkFBa0IsV0FBVztBQUFBLElBQ3ZDO0FBQUE7QUFBQTs7O0FDNU5BLGlCQUFtRDtBQUtuRCxJQUFNLG1CQUFtQixRQUFRLElBQUk7QUFDckMsSUFBTSxnQkFBZ0IsUUFBUSxJQUFJO0FBQ2xDLElBQU0sVUFBVSxRQUFRLElBQUk7QUFFNUIsSUFBTSxTQUFTLElBQUksMEJBQWU7QUFBQSxFQUNoQztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUVBLFdBQW1CLHVCQUF1QjtBQUUzQyxJQUFJLDJCQUEyQjtBQUMvQixJQUFJLHdCQUF3QjtBQUM1QixJQUFJLHNCQUFzQjtBQUMxQixJQUFJLDRCQUE0QjtBQUNoQyxJQUFJLG1CQUFtQjtBQUN2QixJQUFJLGVBQWU7QUFFbkIsSUFBTSx1QkFBdUIsT0FBTyxRQUFRLHdCQUF3QjtBQUVwRSxJQUFNLGdCQUErQjtBQUFBLEVBQ25DLDJCQUEyQixDQUFDLGFBQWE7QUFDdkMsUUFBSSwwQkFBMEI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sMENBQTBDO0FBQUEsSUFDNUQ7QUFDQSxRQUFJLGtCQUFrQjtBQUNwQixZQUFNLElBQUksTUFBTSw0REFBNEQ7QUFBQSxJQUM5RTtBQUVBLCtCQUEyQjtBQUMzQix5QkFBcUIseUJBQXlCLFFBQVE7QUFDdEQsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLHdCQUF3QixDQUFDLGVBQWU7QUFDdEMsUUFBSSx1QkFBdUI7QUFDekIsWUFBTSxJQUFJLE1BQU0sdUNBQXVDO0FBQUEsSUFDekQ7QUFDQSw0QkFBd0I7QUFDeEIseUJBQXFCLHNCQUFzQixVQUFVO0FBQ3JELFdBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxzQkFBc0IsQ0FBQyxxQkFBcUI7QUFDMUMsUUFBSSxxQkFBcUI7QUFDdkIsWUFBTSxJQUFJLE1BQU0sc0NBQXNDO0FBQUEsSUFDeEQ7QUFDQSwwQkFBc0I7QUFDdEIseUJBQXFCLG9CQUFvQixnQkFBZ0I7QUFDekQsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLDRCQUE0QixDQUFDLDJCQUEyQjtBQUN0RCxRQUFJLDJCQUEyQjtBQUM3QixZQUFNLElBQUksTUFBTSw2Q0FBNkM7QUFBQSxJQUMvRDtBQUNBLGdDQUE0QjtBQUM1Qix5QkFBcUIsMEJBQTBCLHNCQUFzQjtBQUNyRSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsbUJBQW1CLENBQUMsa0JBQWtCO0FBQ3BDLFFBQUksa0JBQWtCO0FBQ3BCLFlBQU0sSUFBSSxNQUFNLG1DQUFtQztBQUFBLElBQ3JEO0FBQ0EsUUFBSSwwQkFBMEI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sNERBQTREO0FBQUEsSUFDOUU7QUFFQSx1QkFBbUI7QUFDbkIseUJBQXFCLGlCQUFpQixhQUFhO0FBQ25ELFdBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxlQUFlLENBQUMsY0FBYztBQUM1QixRQUFJLGNBQWM7QUFDaEIsWUFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsSUFDaEQ7QUFFQSxtQkFBZTtBQUNmLHlCQUFxQixhQUFhLFNBQVM7QUFDM0MsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQUVBLHdEQUE0QixLQUFLLE9BQU1DLFlBQVU7QUFDL0MsU0FBTyxNQUFNQSxRQUFPLEtBQUssYUFBYTtBQUN4QyxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ1osdUJBQXFCLGNBQWM7QUFDckMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVO0FBQ2xCLFVBQVEsTUFBTSxvREFBb0Q7QUFDbEUsVUFBUSxNQUFNLEtBQUs7QUFDckIsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCIsICJmcyIsICJwYXRoIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiZmciLCAicGF0aCIsICJpbXBvcnRfbm9kZV9wYXRoIiwgImZnIiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X3Byb21pc2VzIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiaW1wb3J0X2Zhc3RfZ2xvYiIsICJmcyIsICJpbXBvcnRfcHJvbWlzZXMiLCAibW9kdWxlIl0KfQo=
