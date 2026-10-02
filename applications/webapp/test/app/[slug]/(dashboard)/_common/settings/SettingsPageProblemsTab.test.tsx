import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsForm, SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { SettingsPageProblemsTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageProblemsTab";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/form/ControlledField", () => ({
  ControlledField: ({ name }: { name: string }) => <input data-testid={name} />,
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  FieldSet: ({ children }: { children: React.ReactNode }) => <fieldset>{children}</fieldset>,
}));

function Harness() {
  const contest = MockContestWithMembersAndProblemsDTO();
  const form = useForm<SettingsFormType>({ defaultValues: SettingsForm.fromResponseDTO(contest) });
  return <SettingsPageProblemsTab contest={contest} form={form} />;
}

describe("SettingsPageProblemsTab", () => {
  it("renders problem configuration and supports reordering", async () => {
    await renderWithProviders(<Harness />);
    expect(screen.getByTestId("settings-problems-tab")).toBeInTheDocument();
    expect(screen.getByTestId("problem-item")).toBeInTheDocument();
    expect(screen.getByTestId("problems.0.title")).toBeInTheDocument();
    expect(screen.getByTestId("move-problem-down-button")).toBeDisabled();
    fireEvent.click(screen.getByTestId("add-problem-button"));
    expect(screen.getAllByTestId("problem-item")).toHaveLength(2);
  });
});
