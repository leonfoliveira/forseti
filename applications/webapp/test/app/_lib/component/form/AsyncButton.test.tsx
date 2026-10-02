import { render, screen } from "@testing-library/react";

import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";

describe("AsyncButton", () => {
  it("disables while loading and replaces its icon with a spinner", () => {
    render(<AsyncButton isLoading data-testid="async-button" icon={<span data-testid="button-icon" />}>Save</AsyncButton>);
    expect(screen.getByTestId("async-button")).toBeDisabled();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("button-icon")).toBeNull();
  });
});
