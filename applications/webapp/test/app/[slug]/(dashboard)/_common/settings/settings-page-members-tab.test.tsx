import { fireEvent, screen } from "@testing-library/dom";
import { useForm } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPageMembersTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-members-tab";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";

describe("SettingsPageMembersTab", () => {
  it("renders member fields correctly", async () => {
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(<SettingsPageMembersTab form={result.current} />);

    fireEvent.click(screen.getByTestId("add-member-button"));
    fireEvent.change(screen.getByTestId("member-name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByTestId("member-type"), {
      target: { value: "ADMIN" },
    });
    fireEvent.change(screen.getByTestId("member-login"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByTestId("member-password"), {
      target: { value: "password123" },
    });
    expect(result.current.getValues("members")).toEqual([
      {
        name: "John Doe",
        type: "ADMIN",
        login: "johndoe",
        password: "password123",
      },
    ]);

    fireEvent.click(screen.getByTestId("remove-member-button"));
    expect(screen.queryByTestId("member-name")).not.toBeInTheDocument();
    expect(result.current.getValues("members")).toEqual([]);
  });
});
