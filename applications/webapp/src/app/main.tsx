import React from "react";
import ReactDOM from "react-dom/client";
import { FrontendObservability } from "@/app/_lib/FrontendObservability";
import { ErrorBoundary } from "@/app/ErrorBundary";
import { App } from "./App";
import "./globals.css";

if (import.meta.env.DEV) {
  window.addEventListener("error", (event) => {
    console.error("[window.error]", {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[unhandledrejection]", event.reason);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <FrontendObservability />
    </ErrorBoundary>
  </React.StrictMode>,
);
