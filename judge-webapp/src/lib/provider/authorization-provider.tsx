import React, { createContext, useContext, useEffect } from "react";

import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { Authorization } from "@/core/domain/model/Authorization";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useLoadableState } from "@/lib/util/loadable-state";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { useAppDispatch } from "@/store/store";

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
  const authorizationState = useLoadableState({ isLoading: true });
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
