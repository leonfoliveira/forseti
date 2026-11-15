import { screen } from "@testing-library/react";

import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AsyncButton", () => {
  it("renders a button with a loading state", async () => {
    await renderWithProviders(
      <AsyncButton
        data-testid="async-button"
        icon={<span data-testid="button-icon" />}
      >
        Save
      </AsyncButton>,
    );
    expect(screen.getByTestId("async-button")).toBeEnabled();
    expect(screen.getByTestId("async-button")).toHaveTextContent("Save");
    expect(screen.getByTestId("button-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("disables while loading and replaces its icon with a spinner", async () => {
    await renderWithProviders(
      <AsyncButton
        isLoading
        data-testid="async-button"
        icon={<span data-testid="button-icon" />}
      >
        Save
      </AsyncButton>,
    );
    expect(screen.getByTestId("async-button")).toBeDisabled();
    expect(screen.queryByTestId("button-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
