import React from "react";
import { screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsPageContestTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageContestTab";
import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import {
  MockContestWithMembersAndProblemsDTO,
  MockLeaderboardResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: () => ContestStatus.NOT_STARTED,
}));
jest.mock("@/app/_lib/component/form/ControlledField", () => ({
  ControlledField: ({ label, name }: { label?: string; name: string }) => (
    <label data-testid={`field-${name}`}>{label}</label>
  ),
}));
jest.mock("@/app/_lib/component/feedback/ConfirmationDialog", () => ({
  ConfirmationDialog: (props: { title: string }) => (
    <div data-testid="force-dialog">{props.title}</div>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  FieldSet: ({ children }: { children: React.ReactNode }) => (
    <fieldset>{children}</fieldset>
  ),
  FieldDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  FieldError: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  FieldLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}));

function Harness() {
  const contest = MockContestWithMembersAndProblemsDTO();
  const form = useForm<SettingsFormType>({
    defaultValues: SettingsForm.fromResponseDTO(contest),
  });
  return (
    <SettingsPageContestTab
      contest={contest}
      leaderboard={MockLeaderboardResponseDTO()}
      form={form}
    />
  );
}

describe("SettingsPageContestTab", () => {
  it("renders contest fields, language options, and force-start controls", async () => {
    await renderWithProviders(<Harness />);
    expect(screen.getByTestId("settings-contest-tab")).toBeInTheDocument();
    expect(screen.getByTestId("field-contest.slug")).toHaveTextContent("Slug");
    expect(
      screen.getByTestId("field-contest.languages.CPP_17"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("force-toggle-button")).toHaveTextContent(
      "Force Start",
    );
    expect(screen.getByTestId("force-dialog")).toHaveTextContent(
      "Force Start Confirmation",
    );
  });
});
