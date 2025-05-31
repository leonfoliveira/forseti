import { render } from "@testing-library/react";
import { redirect } from "next/navigation";
import ContestPage from "@/app/contests/[id]/page";
import React, { use } from "react";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockUse = use as jest.Mock;

describe("ContestPage", () => {
  const id = 123;
  const getParams = Promise.resolve({ id });

  beforeEach(async () => {
    mockUse.mockReturnValue({ id });
  });

  it("redirects to the leaderboard page with the correct ID", async () => {
    render(<ContestPage params={getParams} />);

    expect(redirect).toHaveBeenCalledWith(`/contests/${id}/leaderboard`);
  });
});
