# Security Model

## Filesystem
- All filesystem paths are resolved against workspace root.
- Paths escaping workspace root are rejected.
- Sensitive system segments are blocked.

## Command Execution
- Commands are restricted to an executable allowlist.
- Per-command timeout and output caps are enforced.
- Working directory is fixed to workspace root.

## Runtime Guardrails
- Global tool-call limit per session.
- Fix-attempt limit to prevent infinite loops.
- Web-search call limit to reduce noise and abuse.
