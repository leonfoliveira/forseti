import { render, screen } from "@testing-library/react";
import React from "react";
import { ProblemStatusBadge } from "@/app/contests/[id]/_component/problem-status-badge";

describe("ProblemStatusBadge", () => {
  it("renders AC badge with no wrong submissions when isAccepted is true and wrongSubmissions is 0", () => {
    render(<ProblemStatusBadge isAccepted={true} wrongSubmissions={0} />);
    expect(screen.getByTestId("badge:ac")).toBeInTheDocument();
    expect(screen.queryByTestId("badge:wa")).not.toBeInTheDocument();
    expect(screen.getByTestId("badge:ac")).not.toHaveTextContent("+");
  });

  it("renders AC badge with wrong submissions when isAccepted is true and wrongSubmissions is greater than 0", () => {
    render(<ProblemStatusBadge isAccepted={true} wrongSubmissions={3} />);
    expect(screen.getByTestId("badge:ac")).toBeInTheDocument();
    expect(screen.queryByTestId("badge:wa")).not.toBeInTheDocument();
    expect(screen.getByTestId("badge:ac")).toHaveTextContent("+3");
  });

  it("renders badge with only wrong submissions when isAccepted is false and wrongSubmissions is greater than 0", () => {
    render(<ProblemStatusBadge isAccepted={false} wrongSubmissions={3} />);
    expect(screen.queryByTestId("badge:ac")).not.toBeInTheDocument();
    expect(screen.getByTestId("badge:wa")).toBeInTheDocument();
  });

  it("renders null when isAccepted is false and wrongSubmissions is 0", () => {
    const { container } = render(
      <ProblemStatusBadge isAccepted={false} wrongSubmissions={0} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
