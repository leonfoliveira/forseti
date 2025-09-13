import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { Authorization } from "@/core/domain/model/Authorization";

export class AxiosAuthorizationRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async getAuthorization(): Promise<Authorization> {
    const response = await this.axiosClient.get<Authorization>("/v1/auth/me");
    return response.data;
  }
}
