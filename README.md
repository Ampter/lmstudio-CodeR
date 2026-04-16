# CodeR

CodeR is a TypeScript-based LM Studio plugin scaffold that adds a **safe coding-agent toolchain** for local models.

## Installation

### 1) Prerequisites
- LM Studio (Plugins beta enabled)
- LM Studio CLI (`lms`) available in your shell
- Node.js 20+ and npm 10+ (for local development)

### 2) Install dependencies
```bash
npm install
```

### 3) Build the plugin
```bash
npm run build
```

This compiles TypeScript into `dist/`. The LM Studio manifest now uses plugin metadata fields (`type`, `runner`, `owner`, `revision`) that `lms dev` expects.

> Runtime note: the plugin package is intentionally built as **CommonJS** so LM Studio can load generated `production.js` bundles that use `require(...)` without triggering Node's ES module scope errors.

## Install in LM Studio

From the project root, install this local plugin into LM Studio:

```bash
lms dev --install
```

What this does:
- validates your plugin files (including required manifest fields like `type`, `runner`, and `owner`)
- prepares/builds the plugin as needed
- installs it into your local LM Studio plugin list

After installation, open LM Studio and enable/select the plugin in the Plugins UI.

### Development mode (auto-reload)
If you are actively changing code, run:

```bash
lms dev
```

This starts a local plugin dev server with rebuild/reload on file changes.

### Install from LM Studio Hub (published plugins)
Working on it

## How it works

CodeR exposes a set of tools that guide a model through a practical coding loop:

1. Inspect the repository (`get_repo_tree`)
2. Detect the project stack (`detect_project`)
3. Read/search relevant files (`read_file`, `search_code`, `list_files`, `find_files`)
4. Read documents (`read_document`)
5. Edit code safely (`apply_patch`, `replace_text_in_file`)
6. File management (`save_file`, `make_directory`, `move_file`, `copy_file`, `delete_path`, `delete_files_by_pattern`)
7. Run checks (`run_tests`, `run_command`)
8. Execute code (`run_javascript`, `run_python`)
9. Inspect changes (`git_status`, `git_diff`, `git_commit`, `git_log`)
10. Web research (`web_search`, `get_site_contents`, `fetch_web_content`, `wikipedia_search`)
11. Delegate to agents (`consult_secondary_agent`, `save_project_context`)
12. System utilities (`get_system_info`, `save_memory`)

All tool calls are tracked per session with runtime limits to prevent uncontrolled loops.

## Available tools

### File System
- `get_repo_tree`: Depth-limited repository tree view.
- `list_files`: Glob-based file listing with limits.
- `find_files`: Find files using glob pattern.
- `read_file`: Guarded UTF-8 file read.
- `search_code`: Pattern search with snippets and file/line references.
- `make_directory`: Create a new directory.
- `delete_path`: Delete a file or directory.
- `move_file`: Move or rename a file.
- `copy_file`: Copy a file to a new location.
- `replace_text_in_file`: Replace a specific string in a file.
- `delete_files_by_pattern`: Delete multiple files matching a regex pattern.

### Code Editing
- `apply_patch`: Structured, context-validated edits.

### Execution
- `run_command`: Allowlisted shell command execution.
- `run_tests`: Project test runner wrapper.

### Git
- `git_status`: Concise repository status.
- `git_diff`: Staged/unstaged diff output.
- `git_commit`: Commit staged changes.
- `git_log`: Get recent git commit history.

### Project
- `detect_project`: Detects ecosystem and suggests likely commands.

### Web
- `web_search`: Structured web results for documentation/error research.
- `get_site_contents`: Fetch and extract text content from a URL.
- `fetch_web_content`: Fetch clean text content from a URL with title.
- `wikipedia_search`: Search Wikipedia for information.

### Utilities
- `get_system_info`: Get system information (OS, CPU, Memory).
- `save_memory`: Save information to long-term memory.

### Agents
- `consult_secondary_agent`: Consult a secondary agent to handle complex tasks.
- `save_project_context`: Save project context for sub-agents.
- `read_project_context`: Read saved project context.

### Documents
- `read_document`: Read content from PDF or DOCX files.

## Security model

The scaffold is designed to be safe by default:

- File operations are constrained to the workspace root.
- Commands are allowlisted and timeout-limited.
- Output sizes are capped.
- Session guardrails bound tool calls and web searches.

See `docs/security.md` and `docs/tool-contracts.md` for details.
