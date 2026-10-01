import { SessionRepository } from "@/port/output/repository/SessionRepository";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

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
