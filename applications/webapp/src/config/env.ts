export const env = {
  version: import.meta.env.VERSION || "latest",
  apiUrl: import.meta.env.API_URL || "http://localhost:8080",
  cloudWatchRumAppId: import.meta.env.CLOUDWATCH_RUM_APP_ID,
  cloudWatchRumRegion: import.meta.env.CLOUDWATCH_RUM_REGION,
};
