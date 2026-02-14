export interface ListenerClient {
  /**
   * Connects to the listener service.
   */
  connect: (onDisconnect?: () => void) => Promise<void>;

  /**
   * Subscribes to a specific topic with a callback to handle incoming data.
   */
  subscribe: <TData>(
    topic: string,
    callback: (data: TData) => void,
  ) => Promise<void>;

  /**
   * Disconnects from the listener service.
   */
  disconnect: () => Promise<void>;
}
