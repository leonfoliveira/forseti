process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

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

  constructor(private readonly baseUrl: string) {}

  async request(
    path: string,
    options: Record<string, any> = {},
    multiPart = false
  ) {
    const headers: Record<string, any> = {
      "X-Forwarded-For": getRandomIp(),
      Cookie: this.sessionId ? `session_id=${this.sessionId}` : "",
    };
    if (!multiPart) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${path}: ${response.status} - ${body}`);
    }
    return response;
  }
}
