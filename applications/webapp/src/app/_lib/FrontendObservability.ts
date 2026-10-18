import {
  faro,
  getWebInstrumentations,
  initializeFaro,
} from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import { useEffect } from "react";

import { env } from "@/config/env";

export function FrontendObservability() {
  useEffect(() => {
    if (faro.api) {
      return;
    }

    if (!env.otelUrl) {
      return;
    }

    initializeFaro({
      url: env.otelUrl,
      app: {
        name: "webapp",
        version: env.version,
        environment: process.env.NODE_ENV,
      },

      instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
      ],
    });
  }, []);

  return null;
}
