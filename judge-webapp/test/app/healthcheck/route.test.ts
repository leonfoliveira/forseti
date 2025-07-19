/**
 * @jest-environment node
 */

import { GET } from "@/app/healthcheck/route";

describe("GET healthcheck route", () => {
  it("returns a status of UP", async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(json).toEqual({ status: "UP" });
  });
});
