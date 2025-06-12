import React, { createContext, useContext, useEffect } from "react";
import { Authorization } from "@/core/domain/model/Authorization";
import { authorizationService } from "@/app/_composition";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { useLoadableState } from "@/app/_util/loadable-state";
import { ErrorPage } from "@/app/_component/page/error-page";

const AuthorizationContext = createContext({
  authorization: {} as Authorization | undefined,
  setAuthorization: (() => {}) as (authorization: Authorization) => void,
  clearAuthorization: (() => {}) as () => void,
});

export function AuthorizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorizationState = useLoadableState<Authorization | undefined>({
    isLoading: true,
  });

  useEffect(() => {
    authorizationState.start();
    try {
      const authorization = authorizationService.getAuthorization();
      authorizationState.finish(authorization);
    } catch (error) {
      authorizationState.fail(error);
    }
  }, []);

  function _setAuthorization(authorization: Authorization) {
    authorizationService.setAuthorization(authorization);
    authorizationState.finish(authorization);
  }

  function clearAuthorization() {
    authorizationService.deleteAuthorization();
    authorizationState.finish(undefined);
  }

  if (authorizationState.isLoading) {
    return <LoadingPage />;
  }
  if (authorizationState.error) {
    return <ErrorPage />;
  }

  return (
    <AuthorizationContext.Provider
      value={{
        authorization: authorizationState.data,
        setAuthorization: _setAuthorization,
        clearAuthorization,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}

export const useAuthorization = () => useContext(AuthorizationContext);
