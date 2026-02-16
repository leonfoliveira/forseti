import { screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import React from "react";

import ContestLayout from "@/app/[slug]/layout";
import { sessionReader, contestReader } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));

jest.mock("@/app/_lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

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

  it("redirects to 404 page on NotFoundException", async () => {
    const error = new NotFoundException("Contest not found");
    (sessionReader.getCurrent as jest.Mock).mockRejectedValueOnce(error);

    await renderWithProviders(
      <ContestLayout>
        <TestChildren />
      </ContestLayout>,
    );

    expect(redirect).toHaveBeenCalledWith(routes.NOT_FOUND);
  });

  it("renders error page on fetch failure", async () => {
    const error = new Error("Failed to fetch data");
    (sessionReader.getCurrent as jest.Mock).mockRejectedValueOnce(error);

    await renderWithProviders(
      <ContestLayout>
        <TestChildren />
      </ContestLayout>,
    );

    const errorPage = await screen.findByTestId("error-page");
    expect(errorPage).toBeInTheDocument();
  });

  it("renders header, footer, and children on successful data fetch", async () => {
    (sessionReader.getCurrent as jest.Mock).mockResolvedValueOnce(mockSession);
    (contestReader.findMetadataBySlug as jest.Mock).mockResolvedValueOnce(
      mockContestMetadata,
    );

    await renderWithProviders(
      <ContestLayout>
        <TestChildren />
      </ContestLayout>,
    );

    const header = await screen.findByTestId("header");
    const footer = await screen.findByTestId("footer");
    const children = await screen.findByTestId("test-children");

    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(children).toBeInTheDocument();
  });
});
