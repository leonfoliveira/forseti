import { act, render, screen } from "@testing-library/react";

import ContestLayout from "@/app/contests/[slug]/layout";

jest.mock("@/store/slices/contest-metadata-slice", () => ({
  ContestMetadataProvider: ({ children, slug }: any) => (
    <div>
      <span data-testid="slug">{slug}</span>
      {children}
    </div>
  ),
}));

describe("ContestLayout", () => {
  it("renders children within ContestMetadataProvider", async () => {
    const { params } = { params: Promise.resolve({ slug: "test-slug" }) };
    const children = <div data-testid="child">Child Component</div>;

    await act(async () => {
      render(<ContestLayout params={params}>{children}</ContestLayout>);
    });

    expect(screen.getByTestId("slug")).toHaveTextContent("test-slug");
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
