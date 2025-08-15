import { useRouter } from "next/navigation";

import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { useAppDispatch } from "@/store/store";

export function useErrorHandler() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  async function clearAuthorization() {
    dispatch(authorizationSlice.actions.reset());
    try {
      await authenticationService.cleanAuthorization();
    } catch {
    } finally {
      dispatch(authorizationSlice.actions.success(null));
      router.push(routes.ROOT);
    }
  }

  function handle(
    error: Error,
    customHandlers: Record<string, (error: Error) => void> = {},
  ) {
    console.error(error);

    const handlers: Record<string, (error: Error) => void> = {
      [UnauthorizedException.name]: () => clearAuthorization(),
      [ForbiddenException.name]: () => router.push(routes.FORBIDDEN),
      [NotFoundException.name]: () => router.push(routes.NOT_FOUND),
      ...customHandlers,
    };

    const _error = error instanceof Error ? error : new Error(String(error));
    const handler = handlers[_error.name] || handlers["default"];
    if (handler !== undefined) {
      return handler(_error);
    }
  }

  return { handle };
}
