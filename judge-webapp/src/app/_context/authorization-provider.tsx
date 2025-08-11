import React, { createContext, useContext, useEffect } from "react";
import { useLoadableState } from "@/app/_util/loadable-state";
import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { useAppDispatch } from "@/store/store";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { Authorization } from "@/core/domain/model/Authorization";

const AuthorizationContext = createContext({
  setAuthorization: (() => {}) as unknown as (
    authorization: Authorization | null,
  ) => void,
  clearAuthorization: (() => {}) as unknown as (
    signInPath: string,
  ) => Promise<void>,
});

export function AuthorizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorizationState = useLoadableState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function load() {
      authorizationState.start();
      try {
        const authorization = await authenticationService.getAuthorization();
        dispatch(authorizationSlice.actions.set(authorization));
        authorizationState.finish();
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          dispatch(authorizationSlice.actions.set(null));
          authorizationState.finish();
        } else {
          authorizationState.fail(error);
        }
      }
    }

    load();
  }, []);

  function setAuthorization(authorization: Authorization | null) {
    dispatch(authorizationSlice.actions.set(authorization));
  }

  async function clearAuthorization(signInPath: string) {
    authorizationState.start();
    try {
      await authenticationService.cleanAuthorization();
      window.location.assign(signInPath);
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
    <AuthorizationContext
      value={{
        setAuthorization,
        clearAuthorization,
      }}
    >
      {children}
    </AuthorizationContext>
  );
}

export function useSetAuthorization() {
  return useContext(AuthorizationContext);
}
