import { CompatClient } from "@stomp/stompjs";

import { ServerException } from "@/core/domain/exception/ServerException";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";

export class StompClient implements ListenerClient {
  constructor(private readonly client: CompatClient) {}

  /**
   * Connect to the STOMP server.
   */
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

  /**
   * Subscribe to a STOMP topic.
   *
   * @param topic The topic to subscribe to.
   * @param callback Callback function to handle received messages.
   */
  async subscribe<TData>(topic: string, callback: (data: TData) => void) {
    this.client.subscribe(topic, (message) => {
      const data = JSON.parse(message.body) as TData;
      callback(data);
    });
    console.debug(`Subscribed to topic: ${topic}`);
  }

  /**
   * Disconnect from the STOMP server.
   */
  async disconnect() {
    return new Promise<void>((resolve) => {
      this.client.onDisconnect = () => {
        console.debug("Disconnected from stomp server");
        resolve();
      };

      this.client.deactivate();
    });
  }
}
