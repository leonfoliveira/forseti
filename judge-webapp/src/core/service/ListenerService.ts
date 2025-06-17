import { ListenerRepository } from "@/core/repository/ListenerRepository";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export class ListenerService {
  constructor(private readonly listenerRepository: ListenerRepository) {}

  get(): Promise<ListenerClient> {
    return this.listenerRepository.get();
  }
}
