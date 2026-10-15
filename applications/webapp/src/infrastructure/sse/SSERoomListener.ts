export abstract class SSERoomListener {
  constructor(private readonly apiUrl: string) {}

  private eventSource?: EventSource;
  private hasConnected = false;

  async subscribe(
    path: string,
    listeners: Record<string, (data: any) => void>,
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.debug("Connecting to:", path);

      this.eventSource = new EventSource(`${this.apiUrl}${path}`, {
        withCredentials: true,
      });

      this.eventSource.onopen = () => {
        console.debug("Connected to SSE room on path:", path);
        if (!this.hasConnected) {
          this.hasConnected = true;
        } else {
          onReconnect?.();
        }
        resolve();
      };

      this.eventSource.onmessage = (event) => {
        console.debug("Received event:", event);
        const parsedData = JSON.parse(event.data);
        const eventName = parsedData.eventName;
        const eventData = parsedData.data;

        if (listeners[eventName as never]) {
          listeners[eventName as keyof typeof listeners](eventData);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error("Error in SSE room:", error);
        if (this.hasConnected) {
          onDisconnect?.();
        }
        reject(error);
      };
    });
  }

  async unsubscribe(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
      this.hasConnected = false;
    }
  }
}
