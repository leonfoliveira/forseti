export function DisconnectionBanner() {
  return (
    <div
      className="bg-red-600 text-center text-sm text-white"
      data-testid="disconnection-banner"
    >
      Connection to server lost. Live updates are unavailable. Attempting to
      reconnect...
    </div>
  );
}
