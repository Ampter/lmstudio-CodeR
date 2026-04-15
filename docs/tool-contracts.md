# Tool Contracts

## get_repo_tree(depth?)
Returns a depth-limited normalized tree excluding noisy directories.

## detect_project()
Infers project stack from ecosystem marker files and suggests test/build commands.

## read_file(path)
Reads UTF-8 files with max-size guardrails.

## search_code(pattern, filePattern?)
Returns line-level snippets and file references for matching code.

## apply_patch(op)
Structured replace patch operation with strict context validation.

## run_command(command, args?)
Executes allowlisted commands only, with timeout and output caps.

## run_tests(command?)
Runs default detected tests or explicit override command.

## git_status()
Returns concise repository status.

## git_diff(staged?)
Returns unstaged or staged diff.

## web_search(query)
Returns structured web results for unknown errors/APIs.
