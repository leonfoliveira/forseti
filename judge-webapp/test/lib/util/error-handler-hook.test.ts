import { renderHook, act } from "@testing-library/react";

import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useErrorHandler } from "@/lib/util/error-handler-hook";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { mockAppDispatch, mockRouter } from "@/test/jest.setup";

// Mock console.error
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("useErrorHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
    (authenticationService.cleanAuthorization as jest.Mock) = jest.fn();
  });

  describe("handle function", () => {
    it("should log the error to console", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error("Test error");

      act(() => {
        result.current.handle(error);
      });

      expect(mockConsoleError).toHaveBeenCalledWith(error);
    });

    it("should handle UnauthorizedException by clearing authorization", async () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new UnauthorizedException("Unauthorized");

      await act(async () => {
        result.current.handle(error);
      });

      // Should dispatch reset action
      expect(mockAppDispatch).toHaveBeenCalledWith(
        authorizationSlice.actions.reset(),
      );

      // Should call authentication service to clean authorization
      expect(authenticationService.cleanAuthorization).toHaveBeenCalled();

      // Should dispatch reset action with null
      expect(mockAppDispatch).toHaveBeenCalledWith(
        authorizationSlice.actions.reset(),
      );
    });

    it("should handle UnauthorizedException even when cleanAuthorization throws", async () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new UnauthorizedException("Unauthorized");

      // Mock cleanAuthorization to throw an error
      (authenticationService.cleanAuthorization as jest.Mock).mockRejectedValue(
        new Error("Clean failed"),
      );

      await act(async () => {
        result.current.handle(error);
      });

      // Should still dispatch reset action
      expect(mockAppDispatch).toHaveBeenCalledWith(
        authorizationSlice.actions.reset(),
      );

      // Should still dispatch success action with null in finally block
      expect(mockAppDispatch).toHaveBeenCalledWith(
        authorizationSlice.actions.reset(),
      );
    });

    it("should handle ForbiddenException by navigating to forbidden page", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new ForbiddenException("Forbidden");

      act(() => {
        result.current.handle(error);
      });

      expect(mockRouter.push).toHaveBeenCalledWith(routes.FORBIDDEN);
    });

    it("should handle NotFoundException by navigating to not found page", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new NotFoundException("Not found");

      act(() => {
        result.current.handle(error);
      });

      expect(mockRouter.push).toHaveBeenCalledWith(routes.NOT_FOUND);
    });

    it("should use custom handlers when provided", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error("Custom error");
      const customHandler = jest.fn();
      const customHandlers = {
        Error: customHandler,
      };

      act(() => {
        result.current.handle(error, customHandlers);
      });

      expect(customHandler).toHaveBeenCalledWith(error);
    });

    it("should override default handlers with custom handlers", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new ForbiddenException("Forbidden");
      const customHandler = jest.fn();
      const customHandlers = {
        [ForbiddenException.name]: customHandler,
      };

      act(() => {
        result.current.handle(error, customHandlers);
      });

      expect(customHandler).toHaveBeenCalledWith(error);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it("should handle non-Error objects by converting them to Error", () => {
      const { result } = renderHook(() => useErrorHandler());
      const errorMessage = "String error";
      const customHandler = jest.fn();
      const customHandlers = {
        Error: customHandler,
      };

      act(() => {
        result.current.handle(errorMessage as any, customHandlers);
      });

      expect(customHandler).toHaveBeenCalledWith(new Error("String error"));
    });

    it("should use default handler when provided and no specific handler matches", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error("Unknown error");
      const defaultHandler = jest.fn();
      const customHandlers = {
        default: defaultHandler,
      };

      act(() => {
        result.current.handle(error, customHandlers);
      });

      expect(defaultHandler).toHaveBeenCalledWith(error);
    });

    it("should do nothing when no handler matches and no default handler is provided", () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error("Unknown error");

      act(() => {
        result.current.handle(error);
      });

      // Should only log the error, no other actions
      expect(mockAppDispatch).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it("should handle class names correctly for different exception types", () => {
      const { result } = renderHook(() => useErrorHandler());

      // Test UnauthorizedException
      const unauthorizedError = new UnauthorizedException("Unauthorized");
      expect(unauthorizedError.name).toBe("UnauthorizedException");

      // Test ForbiddenException
      const forbiddenError = new ForbiddenException("Forbidden");
      expect(forbiddenError.name).toBe("ForbiddenException");

      // Test NotFoundException
      const notFoundError = new NotFoundException("Not found");
      expect(notFoundError.name).toBe("NotFoundException");

      // Verify handlers are called correctly
      act(() => {
        result.current.handle(forbiddenError);
      });
      expect(mockRouter.push).toHaveBeenCalledWith(routes.FORBIDDEN);

      jest.clearAllMocks();

      act(() => {
        result.current.handle(notFoundError);
      });
      expect(mockRouter.push).toHaveBeenCalledWith(routes.NOT_FOUND);
    });
  });

  describe("clearAuthorization function", () => {
    it("should execute the clearAuthorization flow correctly", async () => {
      const { result } = renderHook(() => useErrorHandler());

      // Access the clearAuthorization function indirectly through UnauthorizedException handling
      const error = new UnauthorizedException("Test");

      await act(async () => {
        result.current.handle(error);
      });

      // Verify the sequence of calls
      expect(mockAppDispatch).toHaveBeenCalledWith(
        authorizationSlice.actions.reset(),
      );
      expect(authenticationService.cleanAuthorization).toHaveBeenCalled();
    });
  });
});
