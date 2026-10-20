/* istanbul ignore file */

import { AwsRum, type AwsRumConfig } from "aws-rum-web";
import { env } from "@/config/env";

let rum: AwsRum | undefined;

export function initializeCloudWatchRum(): void {
  if (typeof window === "undefined" || rum) {
    return;
  }

  if (!env.cloudWatchRumAppId || !env.cloudWatchRumRegion) {
    return;
  }

  const config: AwsRumConfig = {
    allowCookies: true,
    endpoint: `https://dataplane.rum.${env.cloudWatchRumRegion}.amazonaws.com`,
    sessionSampleRate: 1,
    telemetries: [
      "errors",
      "performance",
      [
        "http",
        {
          addXRayTraceIdHeader: true,
        },
      ],
    ],
    enableXRay: true,
    enableW3CTraceId: true,
  };

  try {
    rum = new AwsRum(
      env.cloudWatchRumAppId,
      env.version,
      env.cloudWatchRumRegion,
      config,
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CloudWatch RUM initialization failed", error);
    }
  }
}
