import path from "path";

import * as pty from "node-pty";

import { config } from "@/test/config";

export class CLIAdapter {
  static async run(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const finalArgs = [...args];
      finalArgs.push("--root-password", config.ROOT_PASSWORD);

      console.log(
        `Running CLI command: ${config.CLI_PATH} ${finalArgs.join(" ")}`,
      );

      const ptyProcess = pty.spawn(config.CLI_PATH, finalArgs, {
        name: "xterm-color",
        cols: 80,
        rows: 24,
        cwd: path.dirname(config.CLI_PATH),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      });

      let output = "";

      const timeoutId = setTimeout(() => {
        ptyProcess.kill();
        reject(new Error("Process timed out after 60 seconds"));
      }, 60000);

      ptyProcess.onData((data: string) => {
        output += data;
      });

      ptyProcess.onExit(({ exitCode, signal }) => {
        clearTimeout(timeoutId);

        if (exitCode === 0) {
          // Clean up the output by removing ANSI escape codes and extra whitespace
          const cleanOutput = output
            // eslint-disable-next-line no-control-regex
            .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "") // Remove ALL ANSI escape sequences
            // eslint-disable-next-line no-control-regex
            .replace(/\x1b\[[0-9]*[nA-Z]/g, "") // Remove cursor positioning sequences
            // eslint-disable-next-line no-control-regex
            .replace(/\x00/g, "") // Remove null characters
            .replace(/\r\n/g, "\n") // Normalize line endings
            .replace(/\r/g, "\n") // Convert remaining \r to \n
            .replace(/\n+/g, "\n") // Remove multiple consecutive newlines
            .replace(/^\s*\n/g, "") // Remove leading empty lines
            .trim();

          console.log(`CLI command output: ${cleanOutput}`);
          resolve(cleanOutput);
        } else {
          reject(
            new Error(
              `Process exited with code ${exitCode}${signal ? ` (signal: ${signal})` : ""}. Output: ${output.trim()}`,
            ),
          );
        }
      });
    });
  }
}
