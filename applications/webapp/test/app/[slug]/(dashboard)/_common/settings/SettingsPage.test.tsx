import React from "react";
import { render, screen } from "@testing-library/react";

import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPage";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MockContestResponseDTO, MockContestWithMembersAndProblemsDTO, MockLeaderboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/settings/SettingsPageContestTab", () => ({
  SettingsPageContestTab: () => <div data-testid="contest-settings">Contest fields</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/_common/settings/SettingsPageProblemsTab", () => ({
  SettingsPageProblemsTab: () => <div data-testid="problem-settings">Problem fields</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/_common/settings/SettingsPageMembersTab", () => ({
  SettingsPageMembersTab: () => <div data-testid="member-settings">Member fields</div>,
}));
jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: () => ContestStatus.IN_PROGRESS,
}));
jest.mock("@/app/_lib/component/shadcn/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: { children: React.ReactNode; value: string; onClick?: () => void }) => (
    <button data-testid={`settings-trigger-${value}`} onClick={onClick}>{children}</button>
  ),
}));

describe("SettingsPage", () => {
  it("shows tabs and the contest settings panel initially", async () => {
    await renderWithProviders(
      <SettingsPage contest={MockContestWithMembersAndProblemsDTO()} leaderboard={MockLeaderboardResponseDTO()} />,
      { contest: MockContestResponseDTO() },
    );
    expect(screen.getByTestId("settings-trigger-contest")).toBeInTheDocument();
    expect(screen.getByTestId("settings-trigger-problems")).toBeInTheDocument();
    expect(screen.getByTestId("settings-trigger-members")).toBeInTheDocument();
    expect(screen.getByTestId("contest-settings")).toBeInTheDocument();
  });
});
