import { execSync } from "child_process";

import { config } from "./config";

async function globalSetup() {
  console.log("Setup: starting Docker containers...");
  try {
    execSync(
      `docker compose -f ${config.DOCKER_COMPOSE_PATH} up -d --wait --no-recreate`,
      {
        stdio: "inherit",
        cwd: __dirname,
      },
    );
    console.log("Setup: Docker containers started successfully");
  } catch (error) {
    console.error("Setup: Error starting Docker containers:", error);
  }
}

export default globalSetup;
