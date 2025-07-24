import { render } from "@testing-library/react";
import ContestPage from "@/app/contests/[slug]/page";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useAuthorization } from "@/app/_component/context/authorization-context";

jest.mock("@/app/_component/context/authorization-context");
jest.mock("@/app/contests/[slug]/_component/context/contest-metadata-context");

describe("ContestPage", () => {
  it.each([
    [MemberType.CONTESTANT, routes.CONTEST_CONTESTANT],
    [MemberType.JURY, routes.CONTEST_JURY],
    [MemberType.ROOT, routes.CONTEST_GUEST],
  ])("should redirect to correct pages", (memberType, routeFactory) => {
    const contest = { slug: "test-slug" };
    (useContestMetadata as jest.Mock).mockReturnValue(contest);
    const authorization = { member: { type: memberType } };
    (useAuthorization as jest.Mock).mockReturnValue({ authorization });

    render(<ContestPage />);

    expect(mockRedirect).toHaveBeenCalledWith(routeFactory(contest.slug));
  });

  it("should redirect to guest page for no authorization", () => {
    const contest = { slug: "test-slug" };
    (useContestMetadata as jest.Mock).mockReturnValue(contest);
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: undefined,
    });

    render(<ContestPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_GUEST(contest.slug),
    );
  });
});
