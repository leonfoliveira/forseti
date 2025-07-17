
import { mock } from "jest-mock-extended";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosClarificationRepository } from "@/adapter/axios/AxiosClarificationRepository";

describe("AxiosClarificationRepository", () => {
  const axiosClient = mock<AxiosClient>();
  const sut = new AxiosClarificationRepository(axiosClient);

  describe("deleteById", () => {
    it("should delete a clarification by id", async () => {
      const id = "clarification123";

      await sut.deleteById(id);

      expect(axiosClient.delete).toHaveBeenCalledWith(`/v1/clarifications/${id}`);
    });
  });
});
