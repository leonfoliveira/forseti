import { fireEvent, renderHook, screen } from "@testing-library/react";
import { useForm, UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { MembersSettings } from "@/app/[slug]/(dashboard)/settings/_tab/members-settings";
import { renderWithProviders } from "@/test/render-with-providers";

describe("MembersSettings", () => {
  const { result: form } = renderHook(
    () => useForm() as UseFormReturn<SettingsForm>,
  );

  it("should render empty state correctly", async () => {
    await renderWithProviders(<MembersSettings form={form.current} />);

    expect(screen.queryByTestId("member")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.getByTestId("add-first-member")).toBeEnabled();
  });

  it("should handle member addition and removal", async () => {
    await renderWithProviders(<MembersSettings form={form.current} />);

    fireEvent.click(screen.getByTestId("add-first-member"));
    expect(screen.getByTestId("member")).toBeInTheDocument();
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeEnabled();
    expect(screen.getByLabelText("Name")).toBeEnabled();
    expect(screen.getByLabelText("Login")).toBeEnabled();
    expect(screen.getByLabelText("Password")).toBeEnabled();

    fireEvent.click(screen.getByTestId("add-member"));
    const members = screen.getAllByTestId("member");
    expect(members).toHaveLength(2);

    fireEvent.click(screen.getAllByTestId("remove-member")[0]);
    expect(screen.getByTestId("member")).toBeInTheDocument();
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("remove-member"));
    expect(screen.queryByTestId("member")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });
});
