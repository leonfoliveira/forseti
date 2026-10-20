/* istanbul ignore file */

import React from "react";
import ReactDOM from "react-dom/client";
import { initializeCloudWatchRum } from "@/app/_lib/initializeCloudWatchRum";
import { ErrorBoundary } from "@/app/ErrorBundary";
import { App } from "./App";
import "./globals.css";

initializeCloudWatchRum();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
