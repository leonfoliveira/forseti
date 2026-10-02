import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();

  async function handleUnauthorized() {
    router.push(`${routes.CONTEST_SIGN_IN(slug)}?expired=true`);
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
        router.push(
          `${routes.FORBIDDEN}?from=${encodeURIComponent(currentPath)}`,
        ),
      [ServiceUnavailableException.name]: () =>
        router.push(
          `${routes.SERVICE_UNAVAILABLE}?from=${encodeURIComponent(currentPath)}`,
        ),
      default: () =>
        router.push(
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
