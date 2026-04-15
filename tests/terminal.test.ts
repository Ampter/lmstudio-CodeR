import { describe, expect, it } from "vitest";
import { runCommand } from "../src/tools/terminal.js";

describe("runCommand", () => {
  it("rejects commands outside allowlist", async () => {
    await expect(runCommand(process.cwd(), "bash", ["-lc", "echo hi"]))
      .rejects
      .toThrow(/not allowlisted/);
  });
});
