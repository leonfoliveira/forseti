import { useState } from "react";
import { useToast } from "@/app/_util/toast-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect } from "next/navigation";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";

export type Fetcher<T> = {
  isLoading: boolean;
  hasError: boolean;
  data: T | undefined;
  fetch: (fn: () => Promise<T>, config?: FetcherConfig) => Promise<T>;
};

type FetcherConfig = {
  authRedirect?: string;
  errors?: Record<string, string | (() => void)>;
};

export function useFetcher<T>(initialData?: T | undefined): Fetcher<T> {
  const [state, setState] = useState({
    isLoading: false,
    hasError: false,
    data: initialData,
  });
  const toast = useToast();

  async function fetch(
    fn: () => Promise<T>,
    config: FetcherConfig = {},
  ): Promise<T> {
    setState({ isLoading: true, hasError: false, data: undefined });
    try {
      const data = await fn();
      setState({ isLoading: false, hasError: false, data });
      return data;
    } catch (error) {
      setState({ isLoading: false, hasError: true, data: undefined });

      const handler = (config.errors || {})[(error as Error).name];
      if (handler) {
        if (typeof handler === "string") {
          toast.error(handler);
        } else if (typeof handler === "function") {
          handler();
        }
      } else if (
        config.authRedirect &&
        (error instanceof UnauthorizedException ||
          error instanceof ForbiddenException)
      ) {
        redirect(config.authRedirect);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    }
  }

  return { ...state, fetch };
}
