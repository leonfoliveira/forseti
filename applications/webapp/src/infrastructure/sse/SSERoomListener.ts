export abstract class SSERoomListener {
  constructor(private readonly apiUrl: string) {}

  private eventSource?: EventSource;
  private hasConnected = false;
  private heartbeatWatchdog?: NodeJS.Timeout;
  static readonly HEARTBEAT_TIMEOUT_MS = 20000;

  /**
   * Subscribe to a SSE room and setup callbacks and heartbeat cycle
   *
   * @param path Request path
   * @param listeners Map with listeners for each event
   * @param onDisconnect Callback for disconnections
   * @param onReconnect Callback for reconnections
   * @returns
   */
  async _subscribe(
    path: string,
    listeners: Record<string, (data: any) => void>,
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.debug("Connecting to:", path);

      if (this.eventSource) {
        this.unsubscribe();
      }

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

        this.resetHeartbeatWatchdog();
        resolve();
      };

      this.eventSource.onerror = (error) => {
        console.error("Error in SSE room:", error);

        if (this.hasConnected) {
          onDisconnect?.();
        }
        this.clearHeartbeatWatchdog();
        reject(error);
      };

      this.eventSource.addEventListener("heartbeat", () => {
        console.debug("Received heartbeat");
        this.resetHeartbeatWatchdog();
      });

      Object.entries(listeners).forEach(([eventName, callback]) => {
        this.eventSource?.addEventListener(eventName, (event) => {
          console.debug("Received event:", event);
          const parsedData = JSON.parse(event.data);
          callback(parsedData);
        });
      });
    });
  }

  /**
   * Unsubscribe to a SSE room
   */
  async unsubscribe(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
      this.hasConnected = false;
    }
  }

  private resetHeartbeatWatchdog(onDisconnect?: () => void) {
    this.clearHeartbeatWatchdog();
    this.heartbeatWatchdog = setTimeout(() => {
      onDisconnect?.();
    }, SSERoomListener.HEARTBEAT_TIMEOUT_MS);
  }

  private clearHeartbeatWatchdog() {
    if (this.heartbeatWatchdog) {
      clearTimeout(this.heartbeatWatchdog);
    }
  }
}
