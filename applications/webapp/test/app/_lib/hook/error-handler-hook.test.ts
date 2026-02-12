import { useErrorHandler } from "@/app/_lib/hook/error-handler-hook";
import { sessionWritter } from "@/config/composition";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { ServiceUnavailableException } from "@/core/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { usePathname, useRouter } from "@/test/jest.setup";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useErrorHandler", () => {
  const mockSlug = "test-contest";
  const mockPath = "/test/path";
  const preloadedState = {
    contestMetadata: MockContestMetadataResponseDTO({ slug: mockSlug }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue(mockPath);
  });

  it("should handle UnauthorizedException by signing out and redirecting", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new UnauthorizedException("Unauthorized");

    result.current.handle(error);

    expect(sessionWritter.deleteCurrent).toHaveBeenCalled();
  });

  it("should handle ForbiddenException by redirecting with from parameter", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new ForbiddenException("Forbidden");

    result.current.handle(error);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/403?from=${encodeURIComponent(mockPath)}`,
    );
  });

  it("should handle ServiceUnavailableException by redirecting with from parameter", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new ServiceUnavailableException("Service unavailable");

    result.current.handle(error);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/503?from=${encodeURIComponent(mockPath)}`,
    );
  });

  it("should handle generic Error by redirecting to 500 with from parameter", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new Error("Generic error");

    result.current.handle(error);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/500?from=${encodeURIComponent(mockPath)}`,
    );
  });

  it("should use custom handler when provided", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const customHandler = jest.fn();
    const error = new Error("Custom error");
    error.name = "CustomError";

    result.current.handle(error, { CustomError: customHandler });

    expect(customHandler).toHaveBeenCalledWith(error);
  });

  it("should use default handler when provided", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const defaultHandler = jest.fn();
    const error = new Error("Unknown error");

    result.current.handle(error, { default: defaultHandler });

    expect(defaultHandler).toHaveBeenCalledWith(error);
  });

  it("should convert non-Error objects to Error", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const customHandler = jest.fn();
    const errorString = "String error";

    result.current.handle(errorString as any, { Error: customHandler });

    expect(customHandler).toHaveBeenCalledWith(expect.any(Error));
    expect(customHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: "String error" }),
    );
  });

  it("should use default router push when no handler matches and no default is provided", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new Error("Unhandled error");
    error.name = "UnhandledError";

    result.current.handle(error);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/500?from=${encodeURIComponent(mockPath)}`,
    );
  });
});
