export interface ListenerClient {
  connect: () => Promise<void>;

  subscribe: <TData>(
    topic: string,
    callback: (data: TData) => void,
  ) => Promise<void>;

  disconnect: () => Promise<void>;
}
