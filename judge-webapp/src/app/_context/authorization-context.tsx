import React, { createContext, useContext, useEffect } from "react";
import { Authorization } from "@/core/domain/model/Authorization";
import { LoadableState, useLoadableState } from "@/app/_util/loadable-state";
import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";

const AuthorizationContext = createContext({
  authorizationState: {} as LoadableState<Authorization | undefined>,
  setAuthorization: (() => {}) as (authorization: Authorization) => void,
  clearAuthorization: (() => {}) as unknown as (
    signInPath: string
  ) => Promise<void>,
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
    async function load() {
      authorizationState.start();
      try {
        const authorization = await authenticationService.getAuthorization();
        authorizationState.finish(authorization);
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          authorizationState.finish(undefined);
        } else {
          authorizationState.fail(error);
        }
      }
    }

    load();
  }, []);

  function setAuthorization(authorization: Authorization) {
    authorizationState.finish(authorization);
  }

  async function clearAuthorization(signInPath: string) {
    authorizationState.start();
    try {
      await authenticationService.cleanAuthorization();
      window.location.href = signInPath;
    } catch (error) {
      authorizationState.fail(error);
    }
  }

  /**
   * Ensures that the authorization state is loaded before rendering children.
   */
  if (authorizationState.isLoading) {
    return <LoadingPage />;
  }
  if (authorizationState.error) {
    return <ErrorPage />;
  }

  return (
    <AuthorizationContext.Provider
      value={{
        authorizationState,
        setAuthorization,
        clearAuthorization,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}

export const useAuthorization = () =>
  useContext(AuthorizationContext).authorizationState.data;
export const useAuthorizationContext = () => useContext(AuthorizationContext);
