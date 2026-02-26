export enum ListenerStatus {
  // The listener is not connected and has not attempted to connect yet.
  DISCONNECTED,
  // The listener is successfully connected and receiving updates.
  CONNECTED,
  // The listener failed to connect or was disconnected after being connected.
  FAILURE,
}
