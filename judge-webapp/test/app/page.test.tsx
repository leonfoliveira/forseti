import { act, fireEvent, render, screen } from "@testing-library/react";

import HomePage from "@/app/page";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { mockAlert, mockRouter } from "@/test/jest.setup";

describe("HomePage", () => {
  it("should render the page with a form", () => {
    render(<HomePage />);

    expect(screen.getByTestId("title")).toHaveTextContent("Judge");
    expect(screen.getByTestId("slug")).toBeInTheDocument();
    expect(screen.getByTestId("join")).toHaveTextContent("Join");
    expect(screen.getByTestId("root")).toHaveTextContent("Enter as Root");
  });

  it("should alert when contest is not found", async () => {
    (
      contestService.findContestMetadataBySlug as jest.Mock
    ).mockRejectedValueOnce(new NotFoundException("Contest not found"));

    render(<HomePage />);

    fireEvent.change(screen.getByTestId("slug"), {
      target: { value: "non-existent-slug" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("join"));
    });
    expect(contestService.findContestMetadataBySlug).toHaveBeenCalledWith(
      "non-existent-slug",
    );
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage: "Not found",
      id: "app.page.join-not-found",
    });
  });

  it("should alert on failure", async () => {
    (
      contestService.findContestMetadataBySlug as jest.Mock
    ).mockRejectedValueOnce(new Error("Some error"));

    render(<HomePage />);

    fireEvent.change(screen.getByTestId("slug"), {
      target: { value: "some-slug" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("join"));
    });
    expect(contestService.findContestMetadataBySlug).toHaveBeenCalledWith(
      "some-slug",
    );
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Could not check if contest exists",
      id: "app.page.join-error",
    });
  });

  it("should redirect to contest sign-in on join button click", async () => {
    render(<HomePage />);

    fireEvent.change(screen.getByTestId("slug"), {
      target: { value: "some-slug" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("join"));
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN("some-slug"),
    );
  });

  it("should redirect to root sign-in on root button click", async () => {
    render(<HomePage />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("root"));
    });
    expect(mockRouter.push).toHaveBeenCalledWith(routes.ROOT_SIGN_IN);
  });
});
