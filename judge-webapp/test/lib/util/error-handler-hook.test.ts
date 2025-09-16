import { sessionService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useErrorHandler } from "@/lib/util/error-handler-hook";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useErrorHandler", () => {
  const mockSlug = "test-contest";
  const preloadedState = {
    contestMetadata: MockContestMetadataResponseDTO({ slug: mockSlug }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  it("should handle UnauthorizedException by signing out and redirecting", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new UnauthorizedException("Unauthorized");

    result.current.handle(error);

    expect(console.error).toHaveBeenCalledWith(error);
    expect(sessionService.deleteSession).toHaveBeenCalled();
  });

  it("should handle generic Error by logging it", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new Error("Generic error");

    result.current.handle(error);

    expect(console.error).toHaveBeenCalledWith(error);
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

    expect(console.error).toHaveBeenCalledWith(error);
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

    expect(console.error).toHaveBeenCalledWith(error);
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

    expect(console.error).toHaveBeenCalled();
    expect(customHandler).toHaveBeenCalledWith(expect.any(Error));
    expect(customHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: "String error" }),
    );
  });

  it("should do nothing when no handler matches and no default is provided", async () => {
    const { result } = await renderHookWithProviders(
      () => useErrorHandler(),
      preloadedState,
    );

    const error = new Error("Unhandled error");
    error.name = "UnhandledError";

    result.current.handle(error);

    expect(console.error).toHaveBeenCalledWith(error);
    // Should not throw or cause any side effects
  });
});
