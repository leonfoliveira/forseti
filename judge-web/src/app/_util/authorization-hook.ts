import { useEffect, useState } from "react";
import { Authorization } from "@/core/domain/model/Authorization";
import { authorizationService } from "@/app/_composition";

export function useAuthorization() {
  const [authorization, setAuthorization] = useState<
    Authorization | undefined
  >();

  useEffect(() => {
    setAuthorization(authorizationService.getAuthorization());
  }, []);

  return authorization;
}
