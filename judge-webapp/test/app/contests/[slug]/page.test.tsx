import { render } from "@testing-library/react";

import ContestPage from "@/app/contests/[slug]/page";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAuthorization } from "@/store/slices/authorization-slice";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { mockRedirect } from "@/test/jest.setup";

jest.mock("@/app/_context/authorization-provider");
jest.mock("@/store/slices/contest-metadata-slice");

describe("ContestPage", () => {
  it.each([
    [MemberType.CONTESTANT, routes.CONTEST_CONTESTANT],
    [MemberType.JUDGE, routes.CONTEST_JUDGE],
    [MemberType.ROOT, routes.CONTEST_GUEST],
  ])("should redirect to correct pages", (memberType, routeFactory) => {
    const contest = { slug: "test-slug" };
    (useContestMetadata as jest.Mock).mockReturnValue(contest);
    const authorization = { member: { type: memberType } };
    (useAuthorization as jest.Mock).mockReturnValue(authorization);

    render(<ContestPage />);

    expect(mockRedirect).toHaveBeenCalledWith(routeFactory(contest.slug));
  });

  it("should redirect to guest page for no authorization", () => {
    const contest = { slug: "test-slug" };
    (useContestMetadata as jest.Mock).mockReturnValue(contest);
    (useAuthorization as jest.Mock).mockReturnValue(undefined);

    render(<ContestPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_GUEST(contest.slug),
    );
  });
});
