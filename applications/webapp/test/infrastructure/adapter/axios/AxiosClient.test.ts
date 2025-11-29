import axios, { AxiosError } from "axios";

import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

jest.mock("axios", () => ({
  request: jest.fn(),
  AxiosError: jest.requireActual("axios").AxiosError,
}));

describe("AxiosClient", () => {
  const baseUrl = "https://example.com";

  const sut = new AxiosClient(baseUrl);

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
          "x-csrf-token": "abc",
        },
        withCredentials: true,
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
          "x-csrf-token": "abc",
        },
      });
    });
  });
});
