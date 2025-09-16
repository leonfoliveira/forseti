import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SessionResponseDTO } from "@/core/repository/dto/response/session/SessionResponseDTO";
import { SessionRepository } from "@/core/repository/SessionRepository";

export class AxiosSessionRepository implements SessionRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async getSession(): Promise<SessionResponseDTO> {
    const response =
      await this.axiosClient.get<SessionResponseDTO>("/v1/session/me");
    return response.data;
  }

  async deleteSession(): Promise<void> {
    await this.axiosClient.delete("/v1/session/me");
  }
}
