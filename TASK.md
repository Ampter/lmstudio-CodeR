# TASK.md — LM Studio Coding Agent Plugin Project Blueprint

## 1) Project Overview

Build a robust **LM Studio plugin** (JavaScript/TypeScript) that turns a local model into a practical coding agent with an explicit, repeatable workflow:

1. Inspect repository structure
2. Detect project stack and likely commands
3. Create a plan
4. Read and modify code incrementally
5. Run tests/build checks
6. Analyze failures and fix iteratively
7. Use web search for unknown APIs/errors/documentation
8. Summarize outcomes, diffs, and remaining risks

The desired interaction style is: **User → Plan → Steps → Tests → Fix → Repeat**.

---

## 2) Primary Goals

- Provide a safe and useful coding-agent experience inside LM Studio.
- Keep behavior deterministic and transparent through structured tools.
- Prevent dangerous operations through sandbox/path/command controls.
- Improve reliability with explicit planning + iterative test/fix loop.
- Enable targeted web research to resolve unknown issues.

---

## 3) Non-Goals (for initial versions)

- Full IDE-like UX parity with Cursor/VS Code extensions.
- Fully autonomous long-running background agents.
- Unrestricted shell/file access.
- Automatic git commit/push without explicit user permission.

---

## 4) Core Agent Workflow (Must Follow)

For every coding request, the model should follow this exact sequence:

1. `get_repo_tree(depth)` to understand project layout.
2. `detect_project()` to infer language/framework/test/build commands.
3. Produce a concise numbered plan.
4. `read_file` + `search_code` on relevant files.
5. `apply_patch` incrementally (avoid full rewrites).
6. `run_tests` or `run_command` with safe allowlisted commands.
7. If failing: inspect error output, patch, and retry.
8. Stop on success or configured guardrail limits.
9. Return final summary (what changed, what passed, what remains).

---

## 5) Plugin Capabilities and Tools

### 5.1 Repository Understanding Tools

#### `get_repo_tree`
- **Purpose:** Return a bounded project tree (depth-limited, noisy paths excluded).
- **Inputs:** `depth?: number` (default 3, max 4 or 5).
- **Output:** normalized tree text + root path.
- **Notes:** Exclude `.git`, `node_modules`, `dist`, `build`, `.next`, large vendor folders.

#### `detect_project`
- **Purpose:** Infer likely stack and defaults.
- **Signals:**
  - `package.json` → JS/TS ecosystem
  - `pyproject.toml`/`requirements.txt` → Python
  - `Cargo.toml` → Rust
  - `go.mod` → Go
  - `pom.xml`/`build.gradle` → JVM
- **Output:** language/framework/test/build command suggestions.

### 5.2 Code Access Tools

#### `list_files`
- Glob listing with limit controls.

#### `read_file`
- UTF-8 file read with size guardrails.

#### `search_code`
- Text search returning snippets with file + line references.

### 5.3 Editing Tools

#### `apply_patch` (**recommended primary editor**)
- Apply contextual patch chunks to an existing file.
- Must reject mismatched context to avoid silent corruption.
- Return structured patch result.

#### `write_file` (optional fallback)
- Keep available only as constrained fallback with explicit warning.
- Should be disabled by default in stricter modes.

### 5.4 Execution Tools

#### `run_command`
- Execute only allowlisted command heads (`npm`, `pytest`, `cargo`, etc.).
- Enforce timeout and output size limits.

#### `run_tests`
- Wrapper around detected/project-configured test command.
- Supports explicit override (`command`) when needed.

### 5.5 Transparency Tools

#### `git_status`
- Return succinct status for changed files.

#### `git_diff`
- Return unstaged/staged diffs (bounded output).

### 5.6 External Knowledge Tool

#### `web_search`
- Used when docs or unfamiliar errors are involved.
- Prefer official documentation or authoritative sources.
- Return structured list of results (title, URL, snippet, source type).

---

## 6) Safety and Security Requirements

### 6.1 Filesystem Boundaries

- All file paths resolved via `path.resolve(workspaceRoot, userPath)`.
- Reject operations if resolved path escapes `workspaceRoot`.
- Deny access to secret/system paths.

### 6.2 Command Execution Restrictions

- Command allowlist by executable name.
- Timeout per command (e.g., 120 seconds).
- Buffer/output caps to avoid token floods.
- Optionally block networked commands for strict mode.

### 6.3 Loop Guardrails

- `MAX_TOOL_CALLS` per user request (e.g., 30).
- `MAX_FIX_ATTEMPTS` per failure loop (e.g., 5).
- `MAX_WEB_SEARCH_CALLS` (e.g., 3–5).
- On limit reached: stop and provide blocker summary.

### 6.4 Data Hygiene

- Redact obvious secrets/tokens from tool output when feasible.
- Keep logs concise and structured.
- Avoid dumping huge files/diffs into context.

---

## 7) Proposed Project Structure

```text
coding-agent-plugin/
├── manifest.json
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── types.ts
│   ├── tools/
│   │   ├── repo.ts
│   │   ├── project.ts
│   │   ├── files.ts
│   │   ├── patch.ts
│   │   ├── terminal.ts
│   │   ├── tests.ts
│   │   ├── git.ts
│   │   └── web.ts
│   ├── runtime/
│   │   ├── guards.ts
│   │   ├── limits.ts
│   │   └── session_state.ts
│   └── prompts/
│       └── coding_agent_system.txt
└── docs/
    ├── security.md
    ├── tool-contracts.md
    └── release-checklist.md
```

---

## 8) Possible Implementations by Feature

### 8.1 `apply_patch` Options

- **Option A: Unified diff parser**
  - Pros: familiar, git-like workflow.
  - Cons: more parser complexity.

- **Option B: Structured patch operations**
  - `{ op: "replace", path, find, replace, count }`
  - Pros: easier validation and deterministic behavior.
  - Cons: less expressive for multi-hunk edits.

- **Recommendation:** Start with structured ops for safety, then add unified diff support.

### 8.2 `web_search` Provider Options

- **Tavily API**: LLM-friendly JSON responses; easy integration.
- **Brave Search API**: broad web coverage; good quality results.
- **SerpAPI**: flexible search backend; mature ecosystem.

- **Recommendation:** Tavily first (fast to implement), Brave as fallback provider.

### 8.3 Git Integration Options

- Shell out to `git` CLI (simple and practical).
- Native library wrappers (higher complexity, less dependency on local git).

- **Recommendation:** Start with `git` CLI read-only commands.

### 8.4 Repo Tree Discovery Options

- Use `fast-glob` to build normalized tree text.
- Use `tree` command if available; fallback to glob if absent.

- **Recommendation:** Prefer `fast-glob` for cross-platform behavior.

---

## 9) Prompting and Behavior Design

### System Prompt Requirements

The system instructions should enforce:

- mandatory first calls (`get_repo_tree`, `detect_project`),
- planning before edits,
- incremental editing,
- test/run after major changes,
- bounded fix loops,
- selective web search,
- clear final summary format.

### Suggested Final Output Format

1. Plan
2. Actions taken
3. Files changed
4. Test results
5. Open risks / next steps

---

## 10) Observability and Debugging

Track per request/session:

- tool call count and order,
- command duration,
- test pass/fail history,
- patch apply success/failure reasons,
- search queries used.

Use logs to identify failure modes (looping, bad edits, noisy outputs).

---

## 11) Testing Strategy

### 11.1 Unit Tests

- path resolution and workspace escape prevention,
- command allowlist enforcement,
- patch apply correctness,
- search result truncation and formatting,
- loop guard counters.

### 11.2 Integration Tests

- sample repos (Node/Python/Rust),
- end-to-end task: fix failing test and re-run,
- web search-assisted bug fix simulation.

### 11.3 Adversarial/Safety Tests

- `../../etc/passwd` path attempts,
- disallowed command execution attempts,
- oversized file read/diff attempts,
- intentional infinite-fix-loop prompts.

---

## 12) Milestone Plan

### Phase 1 — MVP Core Agent
- Tools: `get_repo_tree`, `detect_project`, `read_file`, `search_code`, `write_file`, `run_command`, `run_tests`.
- Basic guardrails and prompt rules.

### Phase 2 — Reliability
- Replace `write_file` with `apply_patch`.
- Add `git_status` + `git_diff`.
- Add loop guard state.

### Phase 3 — Research + UX
- Implement real `web_search` provider.
- Add source citation behavior in summaries.
- Optional auto-bootstrap on session start.

### Phase 4 — Hardening
- Extensive tests, failure analytics, stricter policy modes.
- Optional settings UI for limits and provider keys.

---

## 13) Suggested Sources and References

Use authoritative documentation first:

1. **LM Studio official docs**
   - Plugin SDK docs
   - CLI workflows (`lms dev`, plugin manifest expectations)

2. **Node.js official docs**
   - `fs`, `path`, `child_process`, `AbortController`/timeouts

3. **TypeScript official docs**
   - strict typings and project config best practices

4. **Provider docs (for web search)**
   - Tavily API docs
   - Brave Search API docs
   - SerpAPI docs

5. **Git documentation**
   - `git status`, `git diff`, unified diff format

6. **Security references**
   - OWASP guidance for command injection/path traversal patterns

> Prefer official docs and primary sources over third-party tutorials for implementation details.

---

## 14) Risks and Mitigations

- **Risk:** Model loops or over-edits.
  - **Mitigation:** strict tool/fix limits + forced plan + incremental patching.

- **Risk:** Unsafe command execution.
  - **Mitigation:** executable allowlist + timeout + workspace-bound cwd.

- **Risk:** Hallucinated tool results.
  - **Mitigation:** structured tool responses + explicit error returns.

- **Risk:** Poor performance on large repos.
  - **Mitigation:** depth limits, ignore patterns, output truncation, scoped reads.

---

## 15) Deliverables Checklist

- [ ] Plugin scaffold with build/dev scripts
- [ ] Core tools implemented and registered
- [ ] Safety boundaries enforced (paths, commands, limits)
- [ ] Prompt rules enforce plan → edit → test → fix loop
- [ ] `apply_patch` available and validated
- [ ] `git_status` + `git_diff` tools
- [ ] Real `web_search` provider integration
- [ ] Unit + integration + adversarial test coverage
- [ ] Documentation (`security.md`, `tool-contracts.md`, `release-checklist.md`)

---

## 16) Definition of Done (DoD)

Project is considered done when:

- Agent consistently follows inspect/plan/edit/test/fix workflow,
- common coding tasks are completed with transparent diffs,
- failures terminate gracefully with blocker reports,
- no workspace escape or disallowed command execution is possible,
- web search improves unknown-error resolution with cited sources.

---

## 17) Optional Future Enhancements

- Multi-file transactional patch sets with rollback.
- Lightweight memory of repo map across turns.
- Auto-generated changelog from `git diff`.
- Settings UI for strict vs. permissive mode.
- Language-specific helper tools (e.g., `run_lint`, `format_code`).

---

## 18) Quick Start Summary

If starting immediately, do this first:

1. Implement `get_repo_tree` + `detect_project`.
2. Implement safe `read_file` + `search_code`.
3. Implement `apply_patch` + `run_tests`.
4. Add loop guards.
5. Add `git_status` + `git_diff`.
6. Add real `web_search`.
7. Validate with one end-to-end bug-fix scenario.

This sequence delivers a practical coding agent quickly while maintaining safety and transparency.
