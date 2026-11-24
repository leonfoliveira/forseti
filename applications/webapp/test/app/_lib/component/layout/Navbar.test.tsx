import { screen } from "@testing-library/react";

import { Navbar } from "@/app/_lib/component/layout/Navbar";
import { MemberType } from "@/domain/enumerate/MemberType";
import {
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Navbar", () => {
  it("renders all tabs for admin user", async () => {
    await renderWithProviders(<Navbar />, {
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Admin", type: MemberType.ADMIN },
      }),
      contest: MockContestResponseDTO(),
    });

    expect(screen.getByTestId("tab-leaderboard")).toBeInTheDocument();
    expect(screen.getByTestId("tab-problems")).toBeInTheDocument();
    expect(screen.getByTestId("tab-submissions")).toBeInTheDocument();
    expect(screen.getByTestId("tab-announcements")).toBeInTheDocument();
    expect(screen.getByTestId("tab-clarifications")).toBeInTheDocument();
    expect(screen.getByTestId("tab-print-requests")).toBeInTheDocument();
    expect(screen.getByTestId("tab-settings")).toBeInTheDocument();
    expect(screen.getByTestId("tab-about")).toBeInTheDocument();
  });

  it("hides clarifications tab if not enabled", async () => {
    await renderWithProviders(<Navbar />, {
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Admin", type: MemberType.ADMIN },
      }),
      contest: {
        settings: {
          isClarificationEnabled: false,
        },
      } as never,
    });

    expect(screen.queryByTestId("tab-clarifications")).not.toBeInTheDocument();
  });

  it("hides print requests tab if not enabled", async () => {
    await renderWithProviders(<Navbar />, {
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Admin", type: MemberType.ADMIN },
      }),
      contest: MockContestResponseDTO({
        settings: {
          ...MockContestResponseDTO().settings,
          isPrintRequestEnabled: false,
        },
      }),
    });

    expect(screen.queryByTestId("tab-print-requests")).not.toBeInTheDocument();
  });

  it("hides print requests tab if member type is not allowed", async () => {
    await renderWithProviders(<Navbar />, {
      session: MockSessionResponseDTO({
        member: {
          id: "member-1",
          name: "Contestant",
          type: MemberType.JUDGE,
        },
      }),
      contest: MockContestResponseDTO(),
    });

    expect(screen.queryByTestId("tab-print-requests")).not.toBeInTheDocument();
  });

  it("hides settings tab for non-admin users", async () => {
    await renderWithProviders(<Navbar />, {
      session: MockSessionResponseDTO({
        member: {
          id: "member-1",
          name: "Contestant",
          type: MemberType.CONTESTANT,
        },
      }),
      contest: MockContestResponseDTO(),
    });

    expect(screen.queryByTestId("tab-settings")).not.toBeInTheDocument();
  });
});
