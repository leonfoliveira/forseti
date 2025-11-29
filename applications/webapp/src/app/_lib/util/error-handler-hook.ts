import { useAppSelector } from "@/app/_store/store";
import { sessionWritter } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";

export function useErrorHandler() {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);

  async function handleSignOut() {
    await sessionWritter.deleteCurrent();
    window.location.href = routes.CONTEST_SIGN_IN(contestMetadata.slug);
  }

  function handle(
    error: Error,
    customHandlers: Record<string, (error: Error) => void> = {},
  ) {
    console.error(error);

    const handlers: Record<string, (error: Error) => void> = {
      [UnauthorizedException.name]: handleSignOut,
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
