export function handleError(
  error: unknown,
  handlers: Record<string, (error: Error) => void>,
) {
  const _error = error instanceof Error ? error : new Error(String(error));
  const handler = handlers[_error.name] || handlers["default"];
  if (handler !== undefined) {
    return handler(_error);
  }
}
