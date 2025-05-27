import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";
import { ServerException } from "@/core/domain/exception/ServerException";

export class StompClient {
  constructor(private readonly wsUrl: string) {}

  async connect() {
    const socket = new SockJS(this.wsUrl);
    const client = Stomp.over(socket);

    return new Promise<CompatClient>((resolve, reject) => {
      client.onConnect = () => {
        resolve(client);
      };

      client.onStompError = (error) => {
        reject(
          new ServerException(
            error.headers["message"] || "Unknown STOMP error",
          ),
        );
      };

      client.activate();
    });
  }

  async disconnect(client: CompatClient) {
    if (client.connected) {
      return new Promise<void>((resolve) => {
        client.onDisconnect = () => {
          resolve();
        };

        client.deactivate();
      });
    }
  }
}
