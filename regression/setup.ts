import { execSync } from "child_process";

async function globalSetup() {
  console.log("Running setup: starting Docker containers...");
  try {
    execSync(
      "docker compose -f ../docker/test/docker-compose.yaml up -d --wait --no-recreate",
      {
        stdio: "inherit",
        cwd: __dirname,
      },
    );
    console.log("Docker containers started successfully");
  } catch (error) {
    console.error("Error starting Docker containers:", error);
  }
}

export default globalSetup;
