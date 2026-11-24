import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { SessionRepository } from "@/port/output/repository/SessionRepository";

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
