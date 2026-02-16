import { CompatClient } from "@stomp/stompjs";

import { ServerException } from "@/core/domain/exception/ServerException";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";

export class StompClient implements ListenerClient {
  constructor(private readonly client: CompatClient) {}

  /**
   * Connect to the STOMP server.
   */
  async connect(onDisconnect?: () => void) {
    return new Promise<void>((resolve, reject) => {
      if (this.client.connected) {
        console.debug("Already connected to stomp server");
        return resolve();
      }

      const connectTimeout = setTimeout(() => {
        reject(
          new ServerException("STOMP connection timeout after 10 seconds"),
        );
      }, 10000);

      this.client.onConnect = () => {
        clearTimeout(connectTimeout);
        console.debug("Connected to stomp server");
        resolve();
      };

      this.client.onDisconnect = () => {
        console.debug("Connection lost to stomp server");
        if (onDisconnect) {
          onDisconnect();
        }
      };

      this.client.onStompError = (error) => {
        clearTimeout(connectTimeout);
        console.error("STOMP error details:", {
          command: error.command,
          headers: error.headers,
          body: error.body,
          binaryBody: error.binaryBody,
          isBinaryBody: error.isBinaryBody,
        });
        reject(
          new ServerException(
            error.headers["message"] ||
              `STOMP Error: ${error.command || "Unknown command"}`,
          ),
        );
      };

      this.client.onWebSocketError = (event) => {
        clearTimeout(connectTimeout);
        console.error("WebSocket error:", event);
        reject(new ServerException("WebSocket connection failed"));
      };

      this.client.activate();
    });
  }

  /**
   * Subscribe to a STOMP topic.
   * If the client is not connected, the subscription will not be made.
   *
   * @param topic The topic to subscribe to.
   * @param callback Callback function to handle received messages.
   */
  async subscribe<TData>(topic: string, callback: (data: TData) => void) {
    if (!this.client.connected) {
      return;
    }

    this.client.subscribe(topic, (message) => {
      console.debug(`Received message on topic ${topic}:`, message);
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
      resolve();

      this.client.deactivate();
    });
  }
}
