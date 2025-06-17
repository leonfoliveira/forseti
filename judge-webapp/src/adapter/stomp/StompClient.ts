import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { CompatClient } from "@stomp/stompjs";

export class StompClient implements ListenerClient {
  constructor(
    private readonly stompConnector: StompConnector,
    private readonly compatClient: CompatClient,
  ) {}

  async subscribe<TData>(
    topic: string,
    callback: (data: TData) => void,
  ): Promise<ListenerClient> {
    await this.stompConnector.subscribe(this.compatClient, topic, callback);
    return this;
  }

  async close(): Promise<void> {
    if (this.compatClient !== undefined) {
      await this.stompConnector.disconnect(this.compatClient);
    }
  }
}
