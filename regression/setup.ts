import { execSync } from "child_process";

async function globalSetup() {
  try {
    console.log("Setup: starting Docker containers...");
    execSync(
      "docker compose -f ../docker/test/docker-compose.yaml up -d --wait --no-recreate",
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
