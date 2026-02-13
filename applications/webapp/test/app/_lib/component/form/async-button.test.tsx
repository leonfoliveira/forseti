import { screen } from "@testing-library/dom";

import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AsyncButton", () => {
  it("should render spinner when isLoading is true", async () => {
    await renderWithProviders(
      <AsyncButton isLoading icon={<span data-testid="icon" />}>
        Click Me
      </AsyncButton>,
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("should not render spinner when isLoading is false", async () => {
    await renderWithProviders(
      <AsyncButton icon={<span data-testid="icon" />}>Click Me</AsyncButton>,
    );

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
