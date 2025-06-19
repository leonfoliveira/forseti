import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { ClarificationRepository } from "@/core/repository/ClarificationRepository";

export class AxiosClarificationRepository implements ClarificationRepository {
  private basePath = "/v1/clarifications";

  constructor(private readonly axiosClient: AxiosClient) {}

  async deleteById(id: string): Promise<void> {
    await this.axiosClient.delete(`${this.basePath}/${id}`);
  }
}
