import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";

import { BusinessException } from "@/domain/exception/BusinessException";
import { ConflictException } from "@/domain/exception/ConflictException";
import { ForbiddenException } from "@/domain/exception/ForbiddenException";
import { NotFoundException } from "@/domain/exception/NotFoundException";
import { ServerException } from "@/domain/exception/ServerException";
import { ServiceUnavailableException } from "@/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

describe("AxiosClient", () => {
  const request = jest.spyOn(axios, "request");
  const client = new AxiosClient("https://api.example.test");

  afterEach(() => {
    request.mockReset();
    document.cookie = "csrf_token=; Max-Age=0; path=/";
  });

  it("builds requests with the base URL and credentials", async () => {
    const response = { data: { ok: true } } as AxiosResponse<{ ok: boolean }>;
    request.mockResolvedValue(response);

    await expect(client.get<{ ok: boolean }>("/resource")).resolves.toBe(
      response,
    );
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      url: "https://api.example.test/resource",
      withCredentials: true,
    });
  });

  it("preserves caller configuration and injects the CSRF cookie", async () => {
    document.cookie = "csrf_token=csrf-value; path=/";
    request.mockResolvedValue({ data: "created" } as AxiosResponse<string>);
    const config = { headers: { "content-type": "application/json" } };

    await client.post("/items", { ...config, data: { name: "test" } });

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      url: "https://api.example.test/items",
      withCredentials: true,
      headers: {
        "content-type": "application/json",
        [AxiosClient.CSRF_HEADER_NAME]: "csrf-value",
      },
      data: { name: "test" },
    });
  });

  it.each([
    [400, BusinessException],
    [401, UnauthorizedException],
    [403, ForbiddenException],
    [404, NotFoundException],
    [409, ConflictException],
    [503, ServiceUnavailableException],
    [500, ServerException],
  ])("maps HTTP %i errors to %s", async (status, ExceptionType) => {
    const response = {
      status,
      data: { message: "request failed" },
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse;
    request.mockRejectedValue(
      new AxiosError(
        "axios error",
        undefined,
        { headers: new AxiosHeaders() },
        {},
        response,
      ),
    );

    await expect(client.get("/resource")).rejects.toBeInstanceOf(ExceptionType);
  });

  it("rethrows non-Axios errors", async () => {
    const error = new Error("network unavailable");
    request.mockRejectedValue(error);

    await expect(client.get("/resource")).rejects.toBe(error);
  });

  it("issues DELETE requests and resolves without a response body", async () => {
    request.mockResolvedValue({ data: undefined } as AxiosResponse);

    await expect(client.delete("/resource")).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith({
      method: "DELETE",
      url: "https://api.example.test/resource",
      withCredentials: true,
    });
  });
});
