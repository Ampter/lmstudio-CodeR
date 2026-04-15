import { createInitialSessionState } from "./limits.js";
import type { SessionState } from "../types.js";

export class SessionStore {
  private readonly sessions = new Map<string, SessionState>();

  get(sessionId: string): SessionState {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, createInitialSessionState());
    }

    return this.sessions.get(sessionId)!;
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
