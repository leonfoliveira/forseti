import React, { createContext, useContext, useEffect } from "react";
import { Authorization } from "@/core/domain/model/Authorization";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { useLoadableState } from "@/app/_util/loadable-state";
import { ErrorPage } from "@/app/_component/page/error-page";
import { authenticationService } from "@/config/composition";
import { useRouter } from "next/navigation";

const AuthorizationContext = createContext({
  authorization: {} as Authorization | undefined,
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
  const router = useRouter();

  useEffect(() => {
    async function load() {
      authorizationState.start();
      try {
        const authorization = await authenticationService.getAuthorization();
        authorizationState.finish(authorization);
      } catch (error) {
        authorizationState.fail(error);
      }
    }

    load();
  }, []);

  /**
   * Stores a new authorization
   */
  function setAuthorization(authorization: Authorization) {
    authorizationState.finish(authorization);
  }

  /**
   * Delete the stored authorization
   */
  async function clearAuthorization(signInPath: string) {
    authorizationState.start();
    try {
      await authenticationService.cleanAuthorization();
      router.push(signInPath);
      authorizationState.finish(undefined);
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
        authorization: authorizationState.data,
        setAuthorization,
        clearAuthorization,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}

export const useAuthorization = () =>
  useContext(AuthorizationContext).authorization;
export const useAuthorizationContext = () => useContext(AuthorizationContext);
