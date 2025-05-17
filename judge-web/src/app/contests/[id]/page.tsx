"use client";

import { useAtomValue } from "jotai";
import { containerAtom } from "@/app/_atom/container-atom";
import { use, useEffect } from "react";
import { redirect } from "next/navigation";

function ContestPage({ params }: { params: Promise<{ id: number }> }) {
  const { authorizationService } = useAtomValue(containerAtom);
  const { id } = use(params);

  useEffect(() => {
    const authorization = authorizationService.getAuthorization();
    if (!authorization) {
      redirect(`/contests/${id}/auth`);
    }
  }, [authorizationService, id]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h1 className="text-uppercase">Contest {id}</h1>
    </div>
  );
}

export default ContestPage;
