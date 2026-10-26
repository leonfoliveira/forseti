export const env = {
  version: import.meta.env.VITE_VERSION || "latest",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8080",
  cloudWatchRumAppId: import.meta.env.VITE_CLOUDWATCH_RUM_APP_ID,
  cloudWatchRumRegion: import.meta.env.VITE_CLOUDWATCH_RUM_REGION,
};
