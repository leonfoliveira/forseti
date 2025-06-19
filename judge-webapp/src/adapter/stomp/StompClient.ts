import { CompatClient } from "@stomp/stompjs";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { ServerException } from "@/core/domain/exception/ServerException";
import { AuthorizationService } from "@/core/service/AuthorizationService";

export class StompClient implements ListenerClient {
  constructor(
    private readonly client: CompatClient,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.client.connected) {
        console.debug("Already connected to stomp server");
        return resolve();
      }

      this.client.onConnect = () => {
        console.debug("Connected to stomp server");
        resolve();
      };

      this.client.onStompError = (error) => {
        console.error("STOMP error: ", error);
        reject(
          new ServerException(
            error.headers["message"] || "Unknown STOMP error",
          ),
        );
      };

      this.client.activate();
    });
  }

  async subscribe<TData>(topic: string, callback: (data: TData) => void) {
    this.client.subscribe(
      topic,
      (message) => {
        const data = JSON.parse(message.body) as TData;
        callback(data);
      },
      {
        Authorization: this.getAuthorizationHeader() as string,
      },
    );
    console.debug(`Subscribed to topic: ${topic}`);
  }

  async disconnect() {
    return new Promise<void>((resolve) => {
      this.client.onDisconnect = () => {
        console.debug("Disconnected from stomp server");
        resolve();
      };

      this.client.deactivate();
    });
  }

  private getAuthorizationHeader() {
    const authorization = this.authorizationService.getAuthorization();
    if (authorization != null) {
      return `Bearer ${authorization.accessToken}`;
    }
    return null;
  }
}
