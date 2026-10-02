import { act, render } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";

import ContestPage from "@/app/[slug]/page";
import { routes } from "@/config/routes";

describe("ContestPage", () => {
  it("redirects to the contest leaderboard", async () => {
    jest.mocked(usePathname).mockReturnValue("/spring");
    const router = useRouter();
    await act(async () => render(<ContestPage />));
    expect(router.replace).toHaveBeenCalledWith(routes.CONTEST_LEADERBOARD("spring"));
  });
});
