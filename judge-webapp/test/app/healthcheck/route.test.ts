/**
 * @jest-environment node
 */

import { GET } from "@/app/healthcheck/route";

describe("healthcheck route", () => {
  it("should return status UP", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "UP" });
  });
});
