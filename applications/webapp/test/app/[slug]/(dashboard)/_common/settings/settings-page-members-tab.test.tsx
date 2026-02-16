import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPageMembersTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-members-tab";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { MemberLoader } from "@/app/_lib/util/member-loader";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";

jest.mock("@/app/_lib/util/member-loader", () => ({
  MemberLoader: {
    loadFromCsv: jest.fn(),
  },
}));

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

  it("loads members from CSV file", async () => {
    const mockMembers = [
      {
        name: "Contestant",
        type: "CONTESTANT",
        login: "login",
        password: "password",
      },
    ];
    (MemberLoader.loadFromCsv as jest.Mock).mockResolvedValue(mockMembers);
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(<SettingsPageMembersTab form={result.current} />);

    const file = new File(
      ["Contestant,CONTESTANT,login,password"],
      "members.csv",
      { type: "text/csv" },
    );

    const fileInput = screen.getByTestId("member-file-input");
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(result.current.getValues("members")).toEqual(mockMembers);
  });

  it("shows error toast when loading CSV fails", async () => {
    const mockError = new Error("Failed to load CSV");
    (MemberLoader.loadFromCsv as jest.Mock).mockRejectedValue(mockError);
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(<SettingsPageMembersTab form={result.current} />);

    const file = new File(
      ["Contestant,CONTESTANT,login,password"],
      "members.csv",
      { type: "text/csv" },
    );

    const fileInput = screen.getByTestId("member-file-input");
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
