"use client";

import React, { useEffect } from "react";

import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

export function AuthorizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, error } = useAppSelector((state) => state.authorization);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function load() {
      try {
        const authorization = await authenticationService.getAuthorization();
        dispatch(authorizationSlice.actions.success(authorization));
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          dispatch(authorizationSlice.actions.success(null));
        } else {
          dispatch(authorizationSlice.actions.fail(error as Error));
        }
      }
    }

    load();
  }, []);

  /**
   * Ensures that the authorization is loaded before rendering children components.
   */
  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage />;
  }

  return children;
}
