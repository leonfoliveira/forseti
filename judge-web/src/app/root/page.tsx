"use client";

import { useAtomValue } from "jotai";
import { containerAtom } from "@/app/_atom/container-atom";
import { useEffect } from "react";
import { redirect } from "next/navigation";

function RootPage() {
  const { authorizationService } = useAtomValue(containerAtom);

  useEffect(() => {
    const authorization = authorizationService.getAuthorization();
    if (!authorization) {
      redirect("/root/auth");
    }
  }, [authorizationService]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h1 className="text-uppercase">Root</h1>
    </div>
  );
}

export default RootPage;
