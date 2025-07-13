import axios, { AxiosError } from "axios";
import { mock } from "jest-mock-extended";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { Authorization } from "@/core/domain/model/Authorization";
import { BusinessException } from "@/core/domain/exception/BusinessException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";

jest.mock("axios", () => ({
  request: jest.fn(),
  AxiosError: jest.requireActual("axios").AxiosError,
}));

describe("AxiosClient", () => {
  const baseUrl = "https://example.com";
  const authorizationService = mock<AuthorizationService>();

  const sut = new AxiosClient(baseUrl, authorizationService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should call axios.request with GET method", async () => {
      const mockResponse = { data: "response data" };
      (axios.request as jest.Mock).mockResolvedValue(mockResponse);
      const authorization = { accessToken: "mocked-token" } as Authorization;
      authorizationService.getAuthorization.mockReturnValueOnce(authorization);

      const response = await sut.get("/test");

      expect(axios.request).toHaveBeenCalledWith({
        url: `${baseUrl}/test`,
        method: "GET",
        headers: { Authorization: `Bearer ${authorization.accessToken}` },
      });
      expect(response).toEqual(mockResponse);
    });

    it.each([
      [400, BusinessException],
      [401, UnauthorizedException],
      [403, ForbiddenException],
      [404, NotFoundException],
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
        headers: { Authorization: "custom" },
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
        headers: { Authorization: null },
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
        headers: { Authorization: null },
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
        headers: { Authorization: null },
      });
    });
  });
});
