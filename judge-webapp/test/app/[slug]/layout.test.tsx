import { render } from "@testing-library/react";
import { notFound } from "next/navigation";
import React from "react";

import ContestLayout from "@/app/[slug]/layout";
import { sessionService, contestService } from "@/config/composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";

jest.mock("@/lib/component/footer", () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>,
}));

jest.mock("@/lib/component/header", () => ({
  Header: () => <div data-testid="header">Header Component</div>,
}));

jest.mock("@/store/store-provider", () => ({
  StoreProvider: ({
    children,
    preloadedState,
  }: {
    children: React.ReactNode;
    preloadedState: any;
  }) => (
    <div
      data-testid="store-provider"
      data-preloaded-state={JSON.stringify(preloadedState)}
    >
      {children}
    </div>
  ),
}));

describe("ContestLayout", () => {
  const TestChildren = () => (
    <div data-testid="test-children">Test Content</div>
  );

  const mockSession = { id: "session-1" };
  const mockContestMetadata = { id: "contest-1", slug: "test-contest" };
  const mockParams = Promise.resolve({ slug: "test-contest" });
  beforeEach(() => {
    jest.clearAllMocks();
    (sessionService.getSession as jest.Mock).mockResolvedValue(mockSession);
    (contestService.findContestMetadataBySlug as jest.Mock).mockResolvedValue(
      mockContestMetadata,
    );
  });

  it("should call notFound for invalid slug format", async () => {
    const invalidParams = Promise.resolve({ slug: "invalid/slug" });

    await ContestLayout({
      params: invalidParams,
      children: <TestChildren />,
    });

    expect(notFound).toHaveBeenCalled();
  });

  it("should render layout with header, content, and footer when data loads successfully", async () => {
    const { getByTestId } = render(
      await ContestLayout({
        params: mockParams,
        children: <TestChildren />,
      }),
    );

    expect(getByTestId("store-provider")).toBeInTheDocument();
    expect(getByTestId("header")).toBeInTheDocument();
    expect(getByTestId("test-children")).toBeInTheDocument();
    expect(getByTestId("footer")).toBeInTheDocument();
  });

  it("should pass correct preloaded state to StoreProvider", async () => {
    const { getByTestId } = render(
      await ContestLayout({
        params: mockParams,
        children: <TestChildren />,
      }),
    );

    const storeProvider = getByTestId("store-provider");
    const preloadedState = JSON.parse(
      storeProvider.getAttribute("data-preloaded-state") || "{}",
    );

    expect(preloadedState).toEqual({
      session: mockSession,
      contestMetadata: mockContestMetadata,
    });
  });

  it("should call sessionService", async () => {
    await ContestLayout({
      params: mockParams,
      children: <TestChildren />,
    });

    expect(sessionService.getSession).toHaveBeenCalled();
  });

  it("should call contestService with slug from params", async () => {
    await ContestLayout({
      params: mockParams,
      children: <TestChildren />,
    });

    expect(contestService.findContestMetadataBySlug).toHaveBeenCalledWith(
      "test-contest",
    );
  });

  it("should have correct layout structure with CSS classes", async () => {
    const { container } = render(
      await ContestLayout({
        params: mockParams,
        children: <TestChildren />,
      }),
    );

    const mainContainer = container.querySelector(
      ".flex.flex-col.min-h-screen",
    );
    expect(mainContainer).toBeInTheDocument();

    const contentContainer = container.querySelector(".flex-1.flex.flex-col");
    expect(contentContainer).toBeInTheDocument();
  });

  it("should call notFound when NotFoundException is thrown", async () => {
    (contestService.findContestMetadataBySlug as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest not found"),
    );

    await ContestLayout({
      params: mockParams,
      children: <TestChildren />,
    });

    expect(notFound).toHaveBeenCalled();
  });

  it("should rethrow non-NotFoundException errors", async () => {
    const genericError = new Error("Generic error");
    (contestService.findContestMetadataBySlug as jest.Mock).mockRejectedValue(
      genericError,
    );

    await expect(
      ContestLayout({
        params: mockParams,
        children: <TestChildren />,
      }),
    ).rejects.toThrow("Generic error");

    expect(notFound).not.toHaveBeenCalled();
  });

  it("should be an async function (server component)", () => {
    expect(ContestLayout.constructor.name).toBe("AsyncFunction");
  });

  it("should have dynamic rendering enabled", () => {
    // This test verifies that the component exports dynamic = "force-dynamic"
    const layoutModule = require("@/app/[slug]/layout");
    expect(layoutModule.dynamic).toBe("force-dynamic");
  });

  it("should handle session service errors gracefully", async () => {
    const authError = new Error("Session service error");
    (sessionService.getSession as jest.Mock).mockRejectedValue(authError);

    await expect(
      ContestLayout({
        params: mockParams,
        children: <TestChildren />,
      }),
    ).rejects.toThrow("Session service error");
  });
});
