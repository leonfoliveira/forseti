import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import axios, { AxiosError, AxiosResponse } from "axios";
import { mock, MockProxy } from "jest-mock-extended";

describe("AxiosClient", () => {
  let axiosClient: AxiosClient;
  let authorizationService: MockProxy<AuthorizationService>;

  beforeEach(() => {
    authorizationService = mock<AuthorizationService>();
    axiosClient = new AxiosClient("http://example.com", authorizationService);
  });

  describe("get", () => {
    it("sends a GET request and returns the response", async () => {
      const response = { data: { key: "value" } };
      jest.spyOn(axios, "request").mockResolvedValue(response);

      const result = await axiosClient.get("/path");

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://example.com/path",
        }),
      );
      expect(result).toEqual(response);
    });
  });

  describe("post", () => {
    it("sends a POST request and returns the response", async () => {
      const response = { data: { key: "value" } };
      jest.spyOn(axios, "request").mockResolvedValue(response);

      const result = await axiosClient.post("/path", {
        data: { key: "value" },
      });

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: "http://example.com/path",
        }),
      );
      expect(result).toEqual(response);
    });
  });

  describe("request error handling", () => {
    it("throws BusinessException for 400 status", async () => {
      const error = new AxiosError(
        "Bad Request",
        undefined,
        undefined,
        undefined,
        {
          status: 400,
        } as AxiosResponse,
      );
      jest.spyOn(axios, "request").mockRejectedValueOnce(error);

      await expect(axiosClient.get("/path")).rejects.toThrow(BusinessException);
    });

    it("throws UnauthorizedException for 401 status", async () => {
      const error = new AxiosError(
        "Unauthorized",
        undefined,
        undefined,
        undefined,
        {
          status: 401,
          data: { message: "Unauthorized" },
        } as AxiosResponse,
      );
      jest.spyOn(axios, "request").mockRejectedValueOnce(error);

      await expect(axiosClient.get("/path")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("throws ForbiddenException for 403 status", async () => {
      const error = new AxiosError(
        "Forbidden",
        undefined,
        undefined,
        undefined,
        {
          status: 403,
          data: { message: "Forbidden" },
        } as AxiosResponse,
      );
      jest.spyOn(axios, "request").mockRejectedValueOnce(error);

      await expect(axiosClient.get("/path")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("throws NotFoundException for 404 status", async () => {
      const error = new AxiosError(
        "Not Found",
        undefined,
        undefined,
        undefined,
        {
          status: 404,
          data: { message: "Not Found" },
        } as AxiosResponse,
      );
      jest.spyOn(axios, "request").mockRejectedValueOnce(error);

      await expect(axiosClient.get("/path")).rejects.toThrow(NotFoundException);
    });

    it("throws ServerException for other 5xx statuses", async () => {
      const error = new AxiosError(
        "Internal Server Error",
        undefined,
        undefined,
        undefined,
        {
          status: 500,
          data: { message: "Server error" },
        } as AxiosResponse,
      );
      jest.spyOn(axios, "request").mockRejectedValueOnce(error);

      await expect(axiosClient.get("/path")).rejects.toThrow(ServerException);
    });
  });
});
