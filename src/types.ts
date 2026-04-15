export interface SessionState {
  toolCalls: number;
  fixAttempts: number;
  webSearchCalls: number;
  history: string[];
}

export interface ToolResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ProjectDetection {
  language: string;
  framework?: string;
  testCommand?: string;
  buildCommand?: string;
}

export interface RepoTreeResult {
  root: string;
  tree: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceType: "official" | "community" | "unknown";
}

export interface RuntimeLimits {
  maxToolCalls: number;
  maxFixAttempts: number;
  maxWebSearchCalls: number;
  commandTimeoutMs: number;
  commandOutputMaxBytes: number;
  fileReadMaxBytes: number;
  maxRepoTreeDepth: number;
}
