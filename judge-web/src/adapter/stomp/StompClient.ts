import SockJS from "sockjs-client";
import { CompatClient, Stomp, StompSubscription } from "@stomp/stompjs";

export class StompClient {
  private readonly client: CompatClient;
  private listeners: Map<string, StompSubscription> = new Map();
  private isConnected = false;

  constructor(private readonly wsUrl: string) {
    const socket = new SockJS(this.wsUrl);
    this.client = Stomp.over(socket);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.client.onConnect = () => {
        this.isConnected = true;
        resolve();
      };

      this.client.onStompError = (error) => {
        reject(new Error(`STOMP error: ${error.headers["message"]}`));
      };

      this.client.activate();
    });
  }

  async subscribe<TBody>(topic: string, listener: (body: TBody) => void) {
    await this.connect();

    const subscription = this.client.subscribe(`/topic${topic}`, (message) => {
      const body = JSON.parse(message.body);
      listener(body);
    });

    this.listeners.set(subscription.id, subscription);
    return subscription.id;
  }

  unsubscribe(id: string) {
    const subscription = this.listeners.get(id);
    if (subscription) {
      subscription.unsubscribe();
      this.listeners.delete(id);
    }
  }
}
