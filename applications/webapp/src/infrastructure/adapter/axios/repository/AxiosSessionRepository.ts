import { SessionRepository } from "@/core/port/driven/repository/SessionRepository";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosSessionRepository implements SessionRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async getCurrent(): Promise<SessionResponseDTO> {
    const response =
      await this.axiosClient.get<SessionResponseDTO>("/v1/sessions/me");
    return response.data;
  }

  async deleteCurrent(): Promise<void> {
    await this.axiosClient.delete("/v1/sessions/me");
  }
}
