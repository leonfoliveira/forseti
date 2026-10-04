import { fireEvent, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { SettingsPageMembersTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageMembersTab";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/form/ControlledField", () => ({
  ControlledField: ({ name }: { name: string }) => <input data-testid={name} />,
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  FieldSet: ({ children }: { children: React.ReactNode }) => (
    <fieldset>{children}</fieldset>
  ),
}));

function Harness() {
  const form = useForm<SettingsFormType>({
    defaultValues: {
      contest: {
        slug: "",
        title: "",
        languages: {} as never,
        startAt: "",
        endAt: "",
      },
      problems: [],
      members: [],
    },
  });
  return <SettingsPageMembersTab form={form} />;
}

describe("SettingsPageMembersTab", () => {
  it("adds a member row and provides the CSV input", async () => {
    await renderWithProviders(<Harness />);
    expect(screen.getByTestId("member-file-input")).toHaveAttribute(
      "accept",
      ".csv",
    );
    expect(screen.queryByTestId("member-row")).toBeNull();
    fireEvent.click(screen.getByTestId("add-member-button"));
    expect(screen.getByTestId("member-row")).toBeInTheDocument();
    expect(screen.getByTestId("members.0.name")).toBeInTheDocument();
  });
});
