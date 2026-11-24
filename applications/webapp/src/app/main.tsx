/* istanbul ignore file */

import "@/app/_lib/i18n";
import "./globals.css";

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";
import { initializeCloudWatchRum } from "@/app/_lib/initializeCloudWatchRum";
import { ErrorBoundary } from "@/app/ErrorBoundary";

import { App } from "./App";

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
