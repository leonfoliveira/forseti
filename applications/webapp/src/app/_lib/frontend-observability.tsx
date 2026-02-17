"use client";

import {
  faro,
  getWebInstrumentations,
  initializeFaro,
} from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

import { clientConfig, isClientSide, serverConfig } from "@/config/config";

export default function FrontendObservability() {
  if (faro.api) {
    return null;
  }

  if (clientConfig.env !== "production") {
    return null;
  }

  const url = isClientSide()
    ? clientConfig.alloyPublicUrl
    : serverConfig.alloyInternalUrl;

  try {
    initializeFaro({
      url: `${url}/collect`,
      app: {
        name: "webapp-client",
        version: clientConfig.version,
        environment: clientConfig.env,
      },

      instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
      ],
    });
  } catch {
    return null;
  }
  return null;
}
