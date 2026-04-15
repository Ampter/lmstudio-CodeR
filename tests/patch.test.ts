import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyPatch } from "../src/tools/patch.js";

describe("applyPatch", () => {
  it("replaces matching context", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "patch-test-"));
    const filePath = path.join(dir, "sample.txt");
    await fs.writeFile(filePath, "hello world\n", "utf8");

    const result = await applyPatch(dir, {
      op: "replace",
      path: "sample.txt",
      find: "world",
      replace: "agent",
    });

    expect(result.replacements).toBe(1);
    expect(await fs.readFile(filePath, "utf8")).toContain("hello agent");
  });
});
