import path from "path";

import * as pty from "node-pty";

import { config } from "@/test/config";

export class CLIAdapter {
  static async run(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`Running CLI command: ${config.CLI_PATH} ${args.join(" ")}`);

      // Use pty to create a pseudo-terminal
      const ptyProcess = pty.spawn(config.CLI_PATH, args, {
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
      let passwordSent = false;

      // Set up a timeout
      const timeoutId = setTimeout(() => {
        ptyProcess.kill();
        reject(new Error("Process timed out after 60 seconds"));
      }, 60000);

      ptyProcess.onData((data: string) => {
        output += data;

        // Check if we need to provide the root password
        if (data.includes("Root password:") && !passwordSent) {
          passwordSent = true;
          ptyProcess.write(config.ROOT_PASSWORD + "\r");
        }
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
            .replace(/Root password:.*?[\r\n]/g, "") // Remove password prompt line
            .replace(/\*+/g, "") // Remove all asterisks (password masking)
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
