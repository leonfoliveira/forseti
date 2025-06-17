import { ListenerRepository } from "@/core/repository/ListenerRepository";
import { StompConnector } from "@/adapter/stomp/StompConnector";

export class StompListenerRepository implements ListenerRepository {
  constructor(private readonly stompConnector: StompConnector) {}

  async get(): Promise<any> {
    return await this.stompConnector.connect();
  }
}
