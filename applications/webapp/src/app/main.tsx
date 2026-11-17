/* istanbul ignore file */

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { initializeCloudWatchRum } from "@/app/_lib/initializeCloudWatchRum";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { App } from "./App";
import "@/app/_lib/i18n";
import "./globals.css";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";

initializeCloudWatchRum();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
