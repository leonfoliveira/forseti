import { useLocation, useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/_lib/store/Store";
import { routes } from "@/config/routes";
import { ForbiddenException } from "@/domain/exception/ForbiddenException";
import { ServiceUnavailableException } from "@/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";

/**
 * Custom hook to handle errors with predefined and custom handlers.
 */
export function useErrorHandler() {
  const contest = useAppSelector((state) => state.contest);
  return useErrorHandlerRoot(contest.slug);
}

export function useErrorHandlerRoot(slug: string) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleUnauthorized() {
    navigate(`${routes.CONTEST_SIGN_IN(slug)}?expired=true`);
  }

  async function handle(
    error: Error,
    customHandlers: Record<
      string,
      (error: Error) => unknown | Promise<unknown>
    > = {},
  ) {
    console.error("Handling error:", error);
    const currentPath = pathname;

    const handlers: Record<
      string,
      (error: Error) => unknown | Promise<unknown>
    > = {
      [UnauthorizedException.name]: handleUnauthorized,
      [ForbiddenException.name]: () =>
        navigate(`${routes.FORBIDDEN}?from=${encodeURIComponent(currentPath)}`),
      [ServiceUnavailableException.name]: () =>
        navigate(
          `${routes.SERVICE_UNAVAILABLE}?from=${encodeURIComponent(currentPath)}`,
        ),
      default: () =>
        navigate(
          `${routes.INTERNAL_SERVER_ERROR}?from=${encodeURIComponent(currentPath)}`,
        ),
      ...customHandlers,
    };

    const _error = error instanceof Error ? error : new Error(String(error));
    const handler = handlers[_error.name] || handlers["default"];
    if (handler !== undefined) {
      await handler(_error);
    }
  }

  return { handle };
}
