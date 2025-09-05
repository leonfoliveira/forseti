import ContestPage from "@/app/[slug]/page";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/config/routes", () => ({
  routes: {
    CONTEST_LEADERBOARD: jest.fn(),
  },
}));

const mockRedirect = require("next/navigation").redirect;

const { routes } = require("@/config/routes");

describe("ContestPage", () => {
  const mockParams = Promise.resolve({ slug: "test-contest" });

  beforeEach(() => {
    jest.clearAllMocks();
    routes.CONTEST_LEADERBOARD.mockReturnValue("/test-contest/leaderboard");
  });

  it("should redirect to contest leaderboard", async () => {
    await ContestPage({ params: mockParams });

    expect(routes.CONTEST_LEADERBOARD).toHaveBeenCalledWith("test-contest");
    expect(mockRedirect).toHaveBeenCalledWith("/test-contest/leaderboard");
  });

  it("should handle different slug values", async () => {
    const differentParams = Promise.resolve({ slug: "another-contest" });
    routes.CONTEST_LEADERBOARD.mockReturnValue("/another-contest/leaderboard");

    await ContestPage({ params: differentParams });

    expect(routes.CONTEST_LEADERBOARD).toHaveBeenCalledWith("another-contest");
    expect(mockRedirect).toHaveBeenCalledWith("/another-contest/leaderboard");
  });

  it("should handle slug with special characters", async () => {
    const specialParams = Promise.resolve({ slug: "contest-2024_special" });
    routes.CONTEST_LEADERBOARD.mockReturnValue(
      "/contest-2024_special/leaderboard",
    );

    await ContestPage({ params: specialParams });

    expect(routes.CONTEST_LEADERBOARD).toHaveBeenCalledWith(
      "contest-2024_special",
    );
    expect(mockRedirect).toHaveBeenCalledWith(
      "/contest-2024_special/leaderboard",
    );
  });

  it("should be an async function (server component)", () => {
    expect(ContestPage.constructor.name).toBe("AsyncFunction");
  });

  it("should await params before processing", async () => {
    const paramsPromise = Promise.resolve({ slug: "awaited-contest" });
    routes.CONTEST_LEADERBOARD.mockReturnValue("/awaited-contest/leaderboard");

    await ContestPage({ params: paramsPromise });

    expect(routes.CONTEST_LEADERBOARD).toHaveBeenCalledWith("awaited-contest");
    expect(mockRedirect).toHaveBeenCalledWith("/awaited-contest/leaderboard");
  });

  it("should call redirect exactly once", async () => {
    await ContestPage({ params: mockParams });

    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it("should call CONTEST_LEADERBOARD route function exactly once", async () => {
    await ContestPage({ params: mockParams });

    expect(routes.CONTEST_LEADERBOARD).toHaveBeenCalledTimes(1);
  });
});
