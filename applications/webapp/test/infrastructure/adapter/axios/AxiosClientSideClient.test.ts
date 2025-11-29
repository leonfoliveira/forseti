import axios, { AxiosError } from "axios";

import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AxiosClientSideClient } from "@/infrastructure/adapter/axios/AxiosClientSideClient";

jest.mock("axios", () => ({
  request: jest.fn(),
  AxiosError: jest.requireActual("axios").AxiosError,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AxiosClientSideClient", () => {
  const baseUrl = "https://example.com";
  const sut = new AxiosClientSideClient(baseUrl);

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.cookie for each test
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "csrf_token=test-csrf-token",
    });
  });

  describe("get", () => {
    it("should call axios.request with GET method and inject CSRF token", async () => {
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const response = await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-csrf-token": "test-csrf-token",
        },
      });
      expect(response).toEqual(mockResponse);
    });

    it("should not inject CSRF token when not available in cookies", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "",
      });
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const response = await sut.get("/test");

      // When no CSRF token is found, no headers should be set
      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
      });
      expect(response).toEqual(mockResponse);
    });

    it("should merge CSRF token with existing headers", async () => {
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test", {
        headers: { "Content-Type": "application/json" },
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "test-csrf-token",
        },
      });
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
        mockedAxios.request.mockRejectedValueOnce(error);

        await expect(sut.get("/test")).rejects.toThrow(exception);
      },
    );

    it("should throw a generic error for unknown error types", async () => {
      const error = new Error("Unknown error");
      mockedAxios.request.mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow(error);
    });

    it("should allow config override including URL", async () => {
      await sut.get("/test", {
        url: "https://override.com",
        headers: { Authorization: "Bearer token" },
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: "https://override.com",
        method: "GET",
        headers: {
          Authorization: "Bearer token",
          "x-csrf-token": "test-csrf-token",
        },
        withCredentials: true,
      });
    });
  });

  describe("post", () => {
    it("should call axios.request with POST method and inject CSRF token", async () => {
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const response = await sut.post("/test", { data: "test-data" });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "POST",
        data: "test-data",
        withCredentials: true,
        headers: {
          "x-csrf-token": "test-csrf-token",
        },
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe("put", () => {
    it("should call axios.request with PUT method and inject CSRF token", async () => {
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const response = await sut.put("/test", { data: "test-data" });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "PUT",
        data: "test-data",
        withCredentials: true,
        headers: {
          "x-csrf-token": "test-csrf-token",
        },
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe("delete", () => {
    it("should call axios.request with DELETE method and inject CSRF token", async () => {
      mockedAxios.request.mockResolvedValue({ headers: {} });

      await sut.delete("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "DELETE",
        withCredentials: true,
        headers: {
          "x-csrf-token": "test-csrf-token",
        },
      });
    });
  });

  describe("CSRF token injection", () => {
    it("should extract CSRF token from document.cookie", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "csrf_token=extracted-token; other=value",
      });
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-csrf-token": "extracted-token",
        },
      });
    });

    it("should handle complex cookie strings", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "session=abc123; csrf_token=complex-token-value; path=/; secure",
      });
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-csrf-token": "complex-token-value",
        },
      });
    });

    it("should not inject CSRF token when cookie is empty", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "",
      });
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      const callArgs = mockedAxios.request.mock.calls[0][0];
      // When no CSRF token, headers object shouldn't be set at all
      expect(callArgs.headers).toBeUndefined();
    });

    it("should not inject CSRF token when csrf_token cookie is not present", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "other_cookie=value; session=abc123",
      });
      const mockResponse = { data: "response data", headers: {} };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      const callArgs = mockedAxios.request.mock.calls[0][0];
      // When no CSRF token, headers object shouldn't be set at all
      expect(callArgs.headers).toBeUndefined();
    });
  });
});
