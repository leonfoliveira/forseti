import { Spinner } from "@/app/_component/spinner";
import React from "react";

export function LoadingPage() {
  return (
    <div className="h-dvh flex justify-center items-center">
      <Spinner size="lg" />
    </div>
  );
}
