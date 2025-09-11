import { execSync } from "child_process";

import { config } from "./config";

async function globalTeardown() {
  console.log("Teardown: stopping Docker containers...");
  try {
    execSync(`docker compose -f ${config.DOCKER_COMPOSE_PATH} down`, {
      stdio: "inherit",
      cwd: __dirname,
    });
    console.log("Teardown: Docker containers stopped successfully");
  } catch (error) {
    console.error("Teardown: Error stopping Docker containers:", error);
  }
}

export default globalTeardown;
