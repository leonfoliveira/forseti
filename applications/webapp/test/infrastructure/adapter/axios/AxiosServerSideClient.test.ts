import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AxiosServerSideClient } from "@/infrastructure/adapter/axios/AxiosServerSideClient";

jest.mock("axios", () => ({
  request: jest.fn(),
  AxiosError: jest.requireActual("axios").AxiosError,
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

describe("AxiosServerSideClient", () => {
  const baseUrl = "https://example.com";
  const sut = new AxiosServerSideClient(baseUrl);

  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup cookie store mock
    mockedCookies.mockResolvedValue(mockCookieStore as any);
    mockCookieStore.get.mockReturnValue(undefined);
    mockCookieStore.set.mockReturnValue(undefined);
  });

  describe("basic HTTP methods", () => {
    beforeEach(() => {
      // Mock empty response headers by default
      mockedAxios.request.mockResolvedValue({
        data: "response data",
        headers: {},
      });
    });

    it("should make GET request", async () => {
      const response = await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {},
      });
      expect(response.data).toBe("response data");
    });

    it("should make POST request", async () => {
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

    it("should make PUT request", async () => {
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

    it("should make DELETE request", async () => {
      await sut.delete("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "DELETE",
        withCredentials: true,
        headers: {},
      });
    });
  });

  describe("error handling", () => {
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
  });

  describe("cookie forwarding from client to API", () => {
    beforeEach(() => {
      mockedAxios.request.mockResolvedValue({
        data: "response",
        headers: {},
      });
    });

    it("should forward session_id cookie from client to API", async () => {
      mockCookieStore.get.mockImplementation((cookieName: string) => {
        if (cookieName === "session_id") {
          return { value: "test-session-id" };
        }
        return undefined;
      });

      await sut.get("/test");

      // Debug: Check what was actually called
      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          Cookie: "session_id=test-session-id",
        },
      });
    });

    it("should append multiple cookies to existing Cookie header", async () => {
      mockCookieStore.get.mockImplementation((cookieName: string) => {
        if (cookieName === "session_id") {
          return { value: "test-session-id" };
        }
        return undefined;
      });

      await sut.get("/test", {
        headers: { Cookie: "existing=value" },
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          Cookie: "existing=value; session_id=test-session-id",
        },
      });
    });

    it("should not add Cookie header when no cookies to forward", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {},
      });
    });

    it("should only forward cookies in COOKIES_TO_FORWARD_FROM_CLIENT_TO_API", async () => {
      mockCookieStore.get.mockImplementation((cookieName: string) => {
        if (cookieName === "session_id") {
          return { value: "test-session-id" };
        }
        if (cookieName === "other_cookie") {
          return { value: "other-value" };
        }
        return undefined;
      });

      await sut.get("/test");

      const callArgs = mockedAxios.request.mock.calls[0][0];
      expect(callArgs.headers?.Cookie).toBe("session_id=test-session-id");
      expect(callArgs.headers?.Cookie).not.toContain("other_cookie");
    });
  });

  describe("header forwarding from client to API", () => {
    beforeEach(() => {
      mockedAxios.request.mockResolvedValue({
        data: "response",
        headers: {},
      });
    });

    it("should forward x-csrf-token header from client to API", async () => {
      mockCookieStore.get.mockImplementation((headerName: string) => {
        if (headerName === "x-csrf-token") {
          return { value: "test-csrf-token" };
        }
        return undefined;
      });

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-csrf-token": "test-csrf-token",
        },
      });
    });

    it("should forward x-forwarded-for header from client to API", async () => {
      mockCookieStore.get.mockImplementation((headerName: string) => {
        if (headerName === "x-forwarded-for") {
          return { value: "192.168.1.1" };
        }
        return undefined;
      });

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });
    });

    it("should forward user-agent header from client to API", async () => {
      mockCookieStore.get.mockImplementation((headerName: string) => {
        if (headerName === "user-agent") {
          return { value: "Mozilla/5.0" };
        }
        return undefined;
      });

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      });
    });

    it("should forward multiple headers simultaneously", async () => {
      mockCookieStore.get.mockImplementation((headerName: string) => {
        if (headerName === "x-csrf-token") {
          return { value: "test-csrf-token" };
        }
        if (headerName === "x-forwarded-for") {
          return { value: "192.168.1.1" };
        }
        if (headerName === "user-agent") {
          return { value: "Mozilla/5.0" };
        }
        return undefined;
      });

      await sut.get("/test");

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "x-csrf-token": "test-csrf-token",
          "x-forwarded-for": "192.168.1.1",
          "user-agent": "Mozilla/5.0",
        },
      });
    });

    it("should only forward headers in HEADERS_TO_FORWARD_FROM_CLIENT_TO_API", async () => {
      mockCookieStore.get.mockImplementation((headerName: string) => {
        if (headerName === "x-csrf-token") {
          return { value: "test-csrf-token" };
        }
        if (headerName === "authorization") {
          return { value: "Bearer token" };
        }
        return undefined;
      });

      await sut.get("/test");

      const callArgs = mockedAxios.request.mock.calls[0][0];
      expect(callArgs.headers?.["x-csrf-token"]).toBe("test-csrf-token");
      expect(callArgs.headers?.authorization).toBeUndefined();
    });

    it("should merge forwarded headers with existing request headers", async () => {
      mockCookieStore.get.mockImplementation((headerName: string) => {
        if (headerName === "x-csrf-token") {
          return { value: "forwarded-csrf-token" };
        }
        return undefined;
      });

      await sut.get("/test", {
        headers: { "content-type": "application/json" },
      });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          "content-type": "application/json",
          "x-csrf-token": "forwarded-csrf-token",
        },
      });
    });
  });

  describe("cookie forwarding from API to client", () => {
    it("should forward session_id cookie from API response to client", async () => {
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": ["session_id=new-session-id; Path=/; HttpOnly"],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session_id",
        "new-session-id",
      );
    });

    it("should forward csrf_token cookie from API response to client", async () => {
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": ["csrf_token=new-csrf-token; Path=/; HttpOnly"],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "csrf_token",
        "new-csrf-token",
      );
    });

    it("should forward multiple cookies from API response to client", async () => {
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": [
            "session_id=new-session-id; Path=/; HttpOnly",
            "csrf_token=new-csrf-token; Path=/",
          ],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session_id",
        "new-session-id",
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "csrf_token",
        "new-csrf-token",
      );
    });

    it("should only forward cookies in COOKIES_TO_FORWARD_FROM_API_TO_CLIENT", async () => {
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": [
            "session_id=new-session-id; Path=/; HttpOnly",
            "other_cookie=other-value; Path=/",
          ],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session_id",
        "new-session-id",
      );
      expect(mockCookieStore.set).not.toHaveBeenCalledWith(
        "other_cookie",
        expect.anything(),
      );
    });

    it("should handle cookies with additional attributes", async () => {
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": [
            "session_id=new-session-id; Path=/; HttpOnly; Secure; SameSite=Strict",
          ],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session_id",
        "new-session-id",
      );
    });

    it("should handle malformed cookie strings gracefully", async () => {
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": ["malformed-cookie-without-equals"],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      // Should not throw an error
      await expect(sut.get("/test")).resolves.toBeDefined();
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("should not attempt to forward cookies when no set-cookie header present", async () => {
      const mockResponse = {
        data: "response",
        headers: {},
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });
  });

  describe("combined forwarding scenarios", () => {
    it("should forward cookies and headers from client to API and cookies from API to client", async () => {
      // Setup client data
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === "session_id") {
          return { value: "client-session-id" };
        }
        if (name === "x-csrf-token") {
          return { value: "client-csrf-token" };
        }
        return undefined;
      });

      // Setup API response
      const mockResponse = {
        data: "response",
        headers: {
          "set-cookie": ["session_id=new-session-id; Path=/; HttpOnly"],
        },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      await sut.get("/test");

      // Verify forwarding to API
      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        withCredentials: true,
        headers: {
          Cookie: "session_id=client-session-id",
          "x-csrf-token": "client-csrf-token",
        },
      });

      // Verify forwarding from API
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session_id",
        "new-session-id",
      );
    });
  });
});
