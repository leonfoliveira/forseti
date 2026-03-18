import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function getRandomIp() {
  const blocks = [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
  return blocks.join(".");
}

export class ApiClient {
  public sessionId: string | null = null;
  public csrfToken: string | null = null;

  constructor(private readonly baseUrl: string) {}

  async request<T = any>(
    path: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const headers: Record<string, any> = {
      "X-Forwarded-For": getRandomIp(),
      ...(config.headers || {}),
    };
    if (this.sessionId != null) {
      headers.Cookie = `session_id=${this.sessionId};`;
    }
    if (this.csrfToken != null) {
      headers["x-csrf-token"] = this.csrfToken;
    }

    return axios<T>({
      url: `${this.baseUrl}${path}`,
      ...config,
      headers,
    });
  }
}
