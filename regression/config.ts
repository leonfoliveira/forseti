import path from "path";

export const config = {
  WEBAPP_URL: process.env.WEBAPP_URL || "http://localhost:3000",
  CLI_PATH:
    process.env.CLI_PATH || path.resolve(__dirname, "../judge-cli/dist/judge"),
  DOCKER_COMPOSE_PATH:
    process.env.DOCKER_COMPOSE_PATH ||
    path.resolve(__dirname, "../docker/development/docker-compose.yaml"),
};
