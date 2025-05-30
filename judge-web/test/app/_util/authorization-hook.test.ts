import { renderHook } from "@testing-library/react";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { authorizationService } from "@/app/_composition";
import { Authorization } from "@/core/domain/model/Authorization";
import { mock } from "jest-mock-extended";

jest.mock("@/app/_composition", () => ({
  authorizationService: {
    getAuthorization: jest.fn(),
  },
}));

describe("useAuthorization", () => {
  it("returns undefined initially before authorization is set", () => {
    (authorizationService.getAuthorization as jest.Mock).mockReturnValueOnce(
      undefined,
    );
    const { result } = renderHook(() => useAuthorization());
    expect(result.current).toBeUndefined();
  });

  it("returns the authorization object when authorization is available", () => {
    const mockAuthorization = mock<Authorization>();
    (authorizationService.getAuthorization as jest.Mock).mockReturnValueOnce(
      mockAuthorization,
    );
    const { result } = renderHook(() => useAuthorization());
    expect(result.current).toEqual(mockAuthorization);
  });
});
