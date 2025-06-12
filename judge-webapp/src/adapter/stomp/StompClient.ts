import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { CompatClient } from "@stomp/stompjs";

export class StompClient implements ListenerClient {
  private client: CompatClient | undefined;

  constructor(private readonly stompConnector: StompConnector) {}

  async subscribe<TData>(
    topic: string,
    callback: (data: TData) => void,
  ): Promise<ListenerClient> {
    this.client = await this.stompConnector.connect();
    console.log("<<<<< SUBSCRIBING >>>>>", topic);
    await this.stompConnector.subscribe(this.client, topic, callback);
    return this;
  }

  async unsubscribe(): Promise<void> {
    console.log("<<<<< UNSUBSCRIBING >>>>>");
    if (this.client !== undefined) {
      await this.stompConnector.disconnect(this.client);
    }
  }
}
