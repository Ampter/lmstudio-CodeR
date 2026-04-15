import { describe, expect, it } from "vitest";
import { assertDepth, resolveWorkspacePath } from "../src/runtime/guards.js";

describe("guards", () => {
  it("prevents workspace escape", () => {
    expect(() => resolveWorkspacePath("/workspace/CodeR", "../../etc/passwd")).toThrow(/escapes workspace/);
  });

  it("accepts valid nested path", () => {
    expect(resolveWorkspacePath("/workspace/CodeR", "src/index.ts")).toContain("/workspace/CodeR/src/index.ts");
  });

  it("enforces depth boundaries", () => {
    expect(() => assertDepth(6, 5)).toThrow(/exceeds/);
    expect(assertDepth(3, 5)).toBe(3);
  });
});
