import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/app/_component/form/button";

describe("Button", () => {
  it("renders default button", () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} tooltip="Tooltip">
        Ok
      </Button>,
    );

    expect(screen.getByTestId("button:container")).toHaveAttribute(
      "data-tip",
      "Tooltip",
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveTextContent("Ok");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("button:spinner")).not.toBeInTheDocument();
  });

  it("renders loading button", () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByTestId("button");
    expect(button).toHaveTextContent("");
    expect(screen.getByTestId("button:spinner")).toBeInTheDocument();
  });
});
