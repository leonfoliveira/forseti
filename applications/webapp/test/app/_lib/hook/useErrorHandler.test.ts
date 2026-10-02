import { act } from "@testing-library/react";
import { useRouter } from "next/navigation";

import { useErrorHandlerRoot } from "@/app/_lib/hook/useErrorHandler";
import { ForbiddenException } from "@/domain/exception/ForbiddenException";
import { ServiceUnavailableException } from "@/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useErrorHandler hook", () => {
  beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));

  it("routes built-in exceptions and allows custom handlers to override them", async () => {
    const router = useRouter();
    const { result } = await renderHookWithProviders(() => useErrorHandlerRoot("contest"));
    await act(async () => result.current.handle(new UnauthorizedException("expired")));
    expect(router.push).toHaveBeenCalledWith(expect.stringContaining("expired=true"));
    await act(async () => result.current.handle(new ForbiddenException("denied")));
    expect(router.push).toHaveBeenLastCalledWith(expect.stringContaining("/error/403"));
    const custom = jest.fn();
    await act(async () => result.current.handle(new ServiceUnavailableException("offline"), {
      ServiceUnavailableException: custom,
    }));
    expect(custom).toHaveBeenCalledWith(expect.objectContaining({ name: "ServiceUnavailableException" }));
  });
});
