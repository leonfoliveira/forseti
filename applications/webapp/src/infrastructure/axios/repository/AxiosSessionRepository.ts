import { SessionRepository } from "@/port/output/repository/SessionRepository";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

export class AxiosSessionRepository implements SessionRepository {
  private basePath = "/v1/sessions";

  constructor(private readonly axiosClient: AxiosClient) {}

  async getCurrent(): Promise<SessionResponseDTO> {
    const response = await this.axiosClient.get<SessionResponseDTO>(
      `${this.basePath}/me`,
    );
    return response.data;
  }

  async deleteCurrent(): Promise<void> {
    await this.axiosClient.delete(`${this.basePath}/me`);
  }
}
