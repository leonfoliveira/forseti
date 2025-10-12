import path from "path";

export const config = {
  CLI_PATH:
    process.env.CLI_PATH ||
    path.resolve(__dirname, "../../../applications/cli/dist/forseti"),
  ROOT_PASSWORD: process.env.ROOT_PASSWORD || "forseti",
  API_URL: process.env.API_URL || "http://localhost:8080",
};
