import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";
import { ServerException } from "@/core/domain/exception/ServerException";
import { AuthorizationService } from "@/core/service/AuthorizationService";

export class StompConnector {
  constructor(
    private readonly wsUrl: string,
    private readonly authorizationService: AuthorizationService,
  ) {}

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

  async subscribe<TData>(
    client: CompatClient,
    topic: string,
    callback: (data: TData) => void,
  ) {
    client.subscribe(
      topic,
      (message) => {
        const data = JSON.parse(message.body) as TData;
        callback(data);
      },
      {
        Authorization: this.getAuthorizationHeader() as string,
      },
    );
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

  private getAuthorizationHeader() {
    const authorization = this.authorizationService.getAuthorization();
    if (authorization != null) {
      return `Bearer ${authorization.accessToken}`;
    }
    return null;
  }
}
