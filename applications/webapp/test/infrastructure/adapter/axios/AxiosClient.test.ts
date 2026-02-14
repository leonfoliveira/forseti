import axios, { AxiosError } from "axios";

import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { ServiceUnavailableException } from "@/core/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

jest.mock("axios", () => ({
  request: jest.fn(),
  AxiosError: jest.requireActual("axios").AxiosError,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Concrete implementation for testing the abstract AxiosClient
class TestAxiosClient extends AxiosClient {
  private requestModifications: any = {};
  private responseModifications: any = {};

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  protected async proxyRequest(requestConfig: any): Promise<void> {
    // Apply any test modifications to the request
    requestConfig.headers = requestConfig.headers || {};
    Object.assign(requestConfig.headers, this.requestModifications);
  }

  protected async proxyResponse(response: any): Promise<void> {
    // Apply any test modifications to the response
    Object.assign(response, this.responseModifications);
  }

  // Test helper methods
  setRequestModifications(modifications: any) {
    this.requestModifications = modifications;
  }

  setResponseModifications(modifications: any) {
    this.responseModifications = modifications;
  }
}

describe("AxiosClient (Abstract Base Class)", () => {
  const baseUrl = "https://example.com";
  let sut: TestAxiosClient;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new TestAxiosClient(baseUrl);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    sut = new TestAxiosClient(baseUrl);
  });

  describe("HTTP methods", () => {
    beforeEach(() => {
      mockedAxios.request.mockResolvedValue({
        data: "response data",
        headers: {},
      });
    });

    describe("get", () => {
      it("should make GET request with correct parameters", async () => {
        const response = await sut.get("/test");

        expect(mockedAxios.request).toHaveBeenCalledWith({
          url: `${baseUrl}/test`,
          method: "GET",
          withCredentials: true,
          headers: {},
        });
        expect(response.data).toBe("response data");
      });

      it("should merge request config with defaults", async () => {
        await sut.get("/test", {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        });

        expect(mockedAxios.request).toHaveBeenCalledWith({
          url: `${baseUrl}/test`,
          method: "GET",
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        });
      });

      it("should allow URL override in config", async () => {
        await sut.get("/test", {
          url: "https://override.com/custom",
        });

        expect(mockedAxios.request).toHaveBeenCalledWith({
          url: "https://override.com/custom",
          method: "GET",
          withCredentials: true,
          headers: {},
        });
      });
    });

    describe("post", () => {
      it("should make POST request with correct parameters", async () => {
        const response = await sut.post("/test", { data: "test-data" });

        expect(mockedAxios.request).toHaveBeenCalledWith({
          url: `${baseUrl}/test`,
          method: "POST",
          data: "test-data",
          withCredentials: true,
          headers: {},
        });
        expect(response.data).toBe("response data");
      });
    });

    describe("put", () => {
      it("should make PUT request with correct parameters", async () => {
        const response = await sut.put("/test", { data: "test-data" });

        expect(mockedAxios.request).toHaveBeenCalledWith({
          url: `${baseUrl}/test`,
          method: "PUT",
          data: "test-data",
          withCredentials: true,
          headers: {},
        });
        expect(response.data).toBe("response data");
      });
    });

    describe("delete", () => {
      it("should make DELETE request with correct parameters", async () => {
        await sut.delete("/test");

        expect(mockedAxios.request).toHaveBeenCalledWith({
          url: `${baseUrl}/test`,
          method: "DELETE",
          withCredentials: true,
          headers: {},
        });
      });

      it("should not return response data for DELETE requests", async () => {
        const result = await sut.delete("/test");
        expect(result).toBeUndefined();
      });
    });
  });

  describe("proxy methods integration", () => {
    it("should call proxyRequest before making the request", async () => {
      sut.setRequestModifications({ "X-Custom-Header": "test-value" });

      mockedAxios.request.mockResolvedValue({
        data: "response data",
        headers: {},
      });

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: { "X-Custom-Header": "test-value" },
      });
    });
  });

  describe("error handling", () => {
    it.each([
      [400, BusinessException, "Bad request"],
      [401, UnauthorizedException, "Unauthorized"],
      [403, ForbiddenException, "Forbidden"],
      [404, NotFoundException, "Not found"],
      [409, ConflictException, "Conflict"],
      [503, ServiceUnavailableException, "Service Unavailable"],
      [500, ServerException, "Internal server error"],
    ])(
      "should throw %s for status %d",
      async (status: number, ExceptionClass: any, message: string) => {
        const error = new AxiosError("Request failed");
        error.response = {
          status,
          data: { message },
        } as any;

        // Reset the mock for this specific error
        mockedAxios.request.mockReset();
        mockedAxios.request.mockRejectedValueOnce(error);

        await expect(sut.get("/test")).rejects.toThrow(ExceptionClass);

        // Reset and test the message
        mockedAxios.request.mockReset();
        mockedAxios.request.mockRejectedValueOnce(error);
        await expect(sut.get("/test")).rejects.toThrow(message);
      },
    );

    it("should throw ServerException for unknown HTTP status codes", async () => {
      const error = new AxiosError("Request failed");
      error.response = {
        status: 418, // I'm a teapot
        data: { message: "Unknown status" },
      } as any;
      mockedAxios.request.mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow(ServerException);
    });

    it("should handle string error response data", async () => {
      const error = new AxiosError("Request failed");
      error.response = {
        status: 400,
        data: "Simple error message",
      } as any;
      mockedAxios.request.mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow("Simple error message");
    });

    it("should fall back to error.message when no response data", async () => {
      const error = new AxiosError("Network error");
      error.response = {
        status: 500,
        data: null,
      } as any;
      mockedAxios.request.mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow("Network error");
    });

    it("should re-throw non-AxiosError errors unchanged", async () => {
      const error = new Error("Custom error");
      mockedAxios.request.mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow("Custom error");

      // Reset and test the error type
      mockedAxios.request.mockReset();
      mockedAxios.request.mockRejectedValueOnce(error);
      await expect(sut.get("/test")).rejects.toThrow(Error);
    });

    it("should handle AxiosError without response", async () => {
      const error = new AxiosError("Network timeout");
      error.response = undefined;
      mockedAxios.request.mockRejectedValueOnce(error);

      await expect(sut.get("/test")).rejects.toThrow(AxiosError);

      // Reset and test the message
      mockedAxios.request.mockReset();
      mockedAxios.request.mockRejectedValueOnce(error);
      await expect(sut.get("/test")).rejects.toThrow("Network timeout");
    });
  });

  describe("request configuration", () => {
    beforeEach(() => {
      mockedAxios.request.mockResolvedValue({
        data: "response data",
        headers: {},
      });
    });

    it("should preserve original headers when proxyRequest adds new ones", async () => {
      sut.setRequestModifications({ "X-Proxy-Header": "proxy-value" });

      await sut.get("/test", {
        headers: { Authorization: "Bearer token" },
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          Authorization: "Bearer token",
          "X-Proxy-Header": "proxy-value",
        },
      });
    });

    it("should always set withCredentials to true", async () => {
      await sut.get("/test", {
        withCredentials: false, // Should be overridden
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {},
      });
    });

    it("should handle missing headers in request config", async () => {
      sut.setRequestModifications({ "X-Test": "value" });

      await sut.get("/test", {
        timeout: 1000,
        // no headers property
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        timeout: 1000,
        headers: { "X-Test": "value" },
      });
    });
  });
});
