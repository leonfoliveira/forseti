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

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  async request(path, options = {}, multiPart = false) {
    const headers = {
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

module.exports = { ApiClient };
