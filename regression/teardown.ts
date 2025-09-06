import { execSync } from "child_process";

async function globalTeardown() {
  console.log("Running teardown: stopping Docker containers...");
  try {
    execSync("docker compose -f ../docker/test/docker-compose.yaml down", {
      stdio: "inherit",
      cwd: __dirname,
    });
    console.log("Docker containers stopped successfully");
  } catch (error) {
    console.error("Error stopping Docker containers:", error);
  }
}

export default globalTeardown;
