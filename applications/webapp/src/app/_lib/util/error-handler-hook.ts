import { usePathname, useRouter } from "next/navigation";

import { useAppSelector } from "@/app/_store/store";
import { sessionWritter } from "@/config/composition";
import { routes } from "@/config/routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { ServiceUnavailableException } from "@/core/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";

/**
 * Custom hook to handle errors with predefined and custom handlers.
 */
export function useErrorHandler() {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await sessionWritter.deleteCurrent();
    window.location.href = routes.CONTEST_SIGN_IN(contestMetadata.slug);
  }

  function handle(
    error: Error,
    customHandlers: Record<string, (error: Error) => void> = {},
  ) {
    const currentPath = pathname;

    const handlers: Record<string, (error: Error) => void> = {
      [UnauthorizedException.name]: handleSignOut,
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
      handler(_error);
    }
  }

  return { handle };
}
