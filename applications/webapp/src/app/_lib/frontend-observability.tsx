"use client";

import {
  faro,
  getWebInstrumentations,
  initializeFaro,
} from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import { useEffect } from "react";

import { clientConfig } from "@/config/config";

export default function FrontendObservability() {
  useEffect(() => {
    if (faro.api) {
      return;
    }

    if (clientConfig.env !== "production") {
      return;
    }

    initializeFaro({
      url: `${clientConfig.alloyPublicUrl}/collect`,
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
  }, []);

  return null;
}
