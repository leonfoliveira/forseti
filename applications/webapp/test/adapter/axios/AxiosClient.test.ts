import axios, { AxiosError } from "axios";
import { cookies, headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";

jest.mock("axios", () => ({
  request: jest.fn(),
  AxiosError: jest.requireActual("axios").AxiosError,
}));
jest.mock("@/config/config", () => ({
  config: {
    isServer: false,
  },
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

describe("AxiosClient", () => {
  const baseUrl = "https://example.com";
  const isServer = false;

  const sut = new AxiosClient(baseUrl, isServer);

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "csrf_token=abc";
  });

  describe("get", () => {
    it("should call axios.request with GET method", async () => {
      const mockResponse = { data: "response data" };
      (axios.request as jest.Mock).mockResolvedValue(mockResponse);

      const response = await sut.get("/test");

      expect(axios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-csrf-token": "abc",
          "x-trace-id": expect.any(String),
        },
      });
      expect(response).toEqual(mockResponse);
    });

    it.each([
      [400, BusinessException],
      [401, UnauthorizedException],
      [403, ForbiddenException],
      [404, NotFoundException],
      [409, ConflictException],
      [500, ServerException],
    ])(
      "should throw the correct exception for status %d",
      async (status: number, exception: typeof BusinessException) => {
        const error = new AxiosError();
        error.response = {
          status,
          data: { message: exception.name },
        } as any;
        (axios.request as jest.Mock).mockRejectedValueOnce(error);

        await expect(sut.get("/test")).rejects.toThrow(exception);
      },
    );

    it("should throw a generic error for unknown status", async () => {
      const error = new Error();
      (axios.request as jest.Mock).mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow(error);
    });

    it("should allow config override", async () => {
      await sut.get("/test", {
        url: "https://override.com",
        headers: { Authorization: "custom" },
      });

      expect(axios.request).toHaveBeenCalledWith({
        url: "https://override.com",
        method: "GET",
        headers: {
          Authorization: "custom",
          "x-trace-id": expect.any(String),
          "x-csrf-token": "abc",
        },
        withCredentials: true,
      });
    });

    it("should forward cookies and headers in server environment", async () => {
      const sut = new AxiosClient(baseUrl, true);

      const clientCookies = [
        { name: "session_id", value: "123" },
        { name: "other", value: "value" },
      ];
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: "abc" }),
        getAll: jest.fn().mockReturnValue(clientCookies),
      };
      const clientHeaders = {
        "x-forwarded-for": "192.0.0.1",
        "user-agent": "Mozilla/5.0",
        "x-trace-id": uuidv4(),
        other: "value",
      };
      const mockHeaders = {
        forEach: jest.fn((callback) => {
          Object.entries(clientHeaders).forEach(([key, value]) => {
            callback(value, key);
          });
        }),
      };
      (headers as jest.Mock).mockResolvedValue(mockHeaders);
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      await sut.get("/test");

      expect(axios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-trace-id": clientHeaders["x-trace-id"],
          "x-csrf-token": "abc",
          Cookie: "session_id=123",
          "x-forwarded-for": clientHeaders["x-forwarded-for"],
          "user-agent": clientHeaders["user-agent"],
        },
      });
    });
  });

  describe("post", () => {
    it("should call axios.request with POST method", async () => {
      const mockResponse = { data: "response data" };
      (axios.request as jest.Mock).mockResolvedValue(mockResponse);

      const response = await sut.post("/test", { data: "value" });

      expect(axios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "POST",
        data: "value",
        withCredentials: true,
        headers: {
          "x-trace-id": expect.any(String),
          "x-csrf-token": "abc",
        },
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe("put", () => {
    it("should call axios.request with PUT method", async () => {
      const mockResponse = { data: "response data" };
      (axios.request as jest.Mock).mockResolvedValue(mockResponse);

      const response = await sut.put("/test", { data: "value" });

      expect(axios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "PUT",
        data: "value",
        withCredentials: true,
        headers: {
          "x-trace-id": expect.any(String),
          "x-csrf-token": "abc",
        },
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe("delete", () => {
    it("should call axios.request with DELETE method", async () => {
      (axios.request as jest.Mock).mockResolvedValue({});

      await sut.delete("/test");

      expect(axios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "DELETE",
        withCredentials: true,
        headers: {
          "x-trace-id": expect.any(String),
          "x-csrf-token": "abc",
        },
      });
    });
  });
});
