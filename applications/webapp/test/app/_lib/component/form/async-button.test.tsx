import { screen } from "@testing-library/dom";

import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AsyncButton", () => {
  it("should render children correctly", async () => {
    await renderWithProviders(<AsyncButton>Click Me</AsyncButton>);

    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("should render spinner when isLoading is true", async () => {
    await renderWithProviders(<AsyncButton isLoading>Click Me</AsyncButton>);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should not render spinner when isLoading is false", async () => {
    await renderWithProviders(<AsyncButton>Click Me</AsyncButton>);

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
});
