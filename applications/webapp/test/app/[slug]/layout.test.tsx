import { render } from "@testing-library/react";
import { notFound } from "next/navigation";
import React from "react";

import ContestLayout from "@/app/[slug]/layout";
import { sessionReader, contestReader } from "@/config/composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";

jest.mock("@/app/_lib/component/layout/footer", () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>,
}));

jest.mock("@/app/_lib/component/layout/header", () => ({
  Header: () => <div data-testid="header">Header Component</div>,
}));

jest.mock("@/app/_store/store-provider", () => ({
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

  const mockContestMetadata = { id: "contest-1", slug: "test-contest" };
  const mockSession = { id: "session-1", contest: mockContestMetadata };
  const mockParams = Promise.resolve({ slug: "test-contest" });
  beforeEach(() => {
    jest.clearAllMocks();
    (sessionReader.getCurrent as jest.Mock).mockResolvedValue(mockSession);
    (contestReader.findMetadataBySlug as jest.Mock).mockResolvedValue(
      mockContestMetadata,
    );
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

  it("should pass null session to StoreProvider if session belongs to other contest", async () => {
    (sessionReader.getCurrent as jest.Mock).mockResolvedValueOnce({
      id: "session-1",
      contest: { id: "other-contest" },
    });
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
      session: undefined,
      contestMetadata: mockContestMetadata,
    });
  });

  it("should call sessionReader", async () => {
    await ContestLayout({
      params: mockParams,
      children: <TestChildren />,
    });

    expect(sessionReader.getCurrent).toHaveBeenCalled();
  });

  it("should call contestReader with slug from params", async () => {
    await ContestLayout({
      params: mockParams,
      children: <TestChildren />,
    });

    expect(contestReader.findMetadataBySlug).toHaveBeenCalledWith(
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
    (contestReader.findMetadataBySlug as jest.Mock).mockRejectedValue(
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
    (contestReader.findMetadataBySlug as jest.Mock).mockRejectedValue(
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
    (sessionReader.getCurrent as jest.Mock).mockRejectedValue(authError);

    await expect(
      ContestLayout({
        params: mockParams,
        children: <TestChildren />,
      }),
    ).rejects.toThrow("Session service error");
  });
});
