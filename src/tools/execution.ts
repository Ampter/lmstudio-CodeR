import { spawn } from "child_process";
import { writeFile, rm } from "node:fs/promises";
import path from "node:path";

export async function runJavascript(
  workspaceRoot: string,
  javascript: string,
  timeoutSeconds = 5,
): Promise<{ stdout: string; stderr: string }> {
  const scriptFileName = `temp_script_${Date.now()}.ts`;
  const scriptFilePath = path.join(workspaceRoot, scriptFileName);

  try {
    await writeFile(scriptFilePath, javascript, "utf-8");

    return new Promise((resolve, reject) => {
      const childProcess = spawn(
        "deno",
        [
          "run",
          "--allow-read=.",
          "--allow-write=.",
          "--no-prompt",
          "--deny-net",
          "--deny-env",
          "--deny-sys",
          "--deny-run",
          "--deny-ffi",
          scriptFilePath,
        ],
        {
          cwd: workspaceRoot,
          timeout: timeoutSeconds * 1000,
          stdio: "pipe",
        },
      );

      let stdout = "";
      let stderr = "";

      childProcess.stdout.on("data", (data) => {
        stdout += data;
      });
      childProcess.stderr.on("data", (data) => {
        stderr += data;
      });

      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        } else {
          reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
        }
      });

      childProcess.on("error", (err) => {
        reject(err);
      });
    });
  } finally {
    await rm(scriptFilePath, { force: true }).catch(() => {});
  }
}

export async function runPython(
  workspaceRoot: string,
  python: string,
  timeoutSeconds = 5,
): Promise<{ stdout: string; stderr: string }> {
  const scriptFileName = `temp_script_${Date.now()}.py`;
  const scriptFilePath = path.join(workspaceRoot, scriptFileName);

  try {
    await writeFile(scriptFilePath, python, "utf-8");

    return new Promise((resolve, reject) => {
      const childProcess = spawn(
        "python",
        [scriptFilePath],
        {
          cwd: workspaceRoot,
          timeout: timeoutSeconds * 1000,
          stdio: "pipe",
        },
      );

      let stdout = "";
      let stderr = "";

      childProcess.stdout.on("data", (data) => {
        stdout += data;
      });
      childProcess.stderr.on("data", (data) => {
        stderr += data;
      });

      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        } else {
          reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
        }
      });

      childProcess.on("error", (err) => {
        reject(err);
      });
    });
  } finally {
    await rm(scriptFilePath, { force: true }).catch(() => {});
  }
}