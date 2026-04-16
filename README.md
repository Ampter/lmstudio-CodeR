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
If/when this plugin is published, you can install by artifact name:

```bash
lms get <owner>/<plugin-name>
```

## How it works

CodeR exposes a set of tools that guide a model through a practical coding loop:

1. Inspect the repository (`get_repo_tree`)
2. Detect the project stack (`detect_project`)
3. Read/search relevant files (`read_file`, `search_code`, `list_files`)
4. Edit code safely (`apply_patch`)
5. Run checks (`run_tests`, `run_command`)
6. Inspect changes (`git_status`, `git_diff`)
7. Fetch web page contents (`get_site_contents`)
8. Use web lookup for unknown issues (`web_search`)

All tool calls are tracked per session with runtime limits to prevent uncontrolled loops.

## Available tools

- `get_repo_tree`: Depth-limited repository tree view.
- `detect_project`: Detects ecosystem and suggests likely commands.
- `list_files`: Glob-based file listing with limits.
- `read_file`: Guarded UTF-8 file read.
- `search_code`: Pattern search with snippets and file/line references.
- `apply_patch`: Structured, context-validated edits.
- `run_command`: Allowlisted shell command execution.
- `run_tests`: Project test runner wrapper.
- `git_status`: Concise repository status.
- `git_diff`: Staged/unstaged diff output.
- `get_site_contents`: Fetch and extract text content from a URL.
- `web_search`: Structured web results for documentation/error research.

## Security model

The scaffold is designed to be safe by default:

- File operations are constrained to the workspace root.
- Commands are allowlisted and timeout-limited.
- Output sizes are capped.
- Session guardrails bound tool calls and web searches.

See `docs/security.md` and `docs/tool-contracts.md` for details.
