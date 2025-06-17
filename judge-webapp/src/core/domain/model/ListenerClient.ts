export interface ListenerClient {
  subscribe: <TData>(
    topic: string,
    callback: (data: TData) => void,
  ) => Promise<ListenerClient>;

  close: () => Promise<void>;
}
