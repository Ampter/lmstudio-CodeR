import { LIMITS } from "../config.js";
import type { SessionState } from "../types.js";

export function createInitialSessionState(): SessionState {
  return {
    toolCalls: 0,
    fixAttempts: 0,
    webSearchCalls: 0,
    history: [],
  };
}

export function recordToolCall(state: SessionState, toolName: string): void {
  state.toolCalls += 1;
  state.history.push(toolName);

  if (state.toolCalls > LIMITS.maxToolCalls) {
    throw new Error(`Max tool calls reached: ${LIMITS.maxToolCalls}`);
  }
}

export function recordFixAttempt(state: SessionState): void {
  state.fixAttempts += 1;
  if (state.fixAttempts > LIMITS.maxFixAttempts) {
    throw new Error(`Max fix attempts reached: ${LIMITS.maxFixAttempts}`);
  }
}

export function recordWebSearch(state: SessionState): void {
  state.webSearchCalls += 1;
  if (state.webSearchCalls > LIMITS.maxWebSearchCalls) {
    throw new Error(`Max web searches reached: ${LIMITS.maxWebSearchCalls}`);
  }
}
