import { execSync } from "child_process";

async function globalSetup() {
  console.log("Bringing up Docker Compose services...");
  execSync("docker-compose up -d --build", { stdio: "inherit" });

  console.log("Waiting for Docker services to stabilize (5 seconds)...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Docker Compose services are up.");
}

export default globalSetup;
