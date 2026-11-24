import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { useToast } from "@/app/_lib/hook/useToast";
import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { SettingsPageMembersTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageMembersTab";
import { MemberType } from "@/domain/enumerate/MemberType";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";

describe("SettingsPageMembersTab", () => {
  it("fills the form with members", async () => {
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(<SettingsPageMembersTab form={form.current} />);

    fireEvent.click(screen.getByTestId("add-member-button"));

    fireEvent.change(screen.getByTestId("member-name"), {
      target: { value: "New Member" },
    });
    fireEvent.change(screen.getByTestId("member-type"), {
      target: { value: MemberType.CONTESTANT },
    });
    fireEvent.change(screen.getByTestId("member-login"), {
      target: { value: "newmemberlogin" },
    });
    fireEvent.change(screen.getByTestId("member-password"), {
      target: { value: "newmemberpassword" },
    });
    fireEvent.change(screen.getByTestId("member-ip"), {
      target: { value: "192.168.0.1" },
    });

    expect(form.current.getValues("members")).toEqual([
      {
        name: "New Member",
        type: MemberType.CONTESTANT,
        login: "newmemberlogin",
        password: "newmemberpassword",
        ip: "192.168.0.1",
      },
    ]);

    fireEvent.click(screen.getByTestId("remove-member-button"));
    expect(form.current.getValues("members")).toEqual([]);
  });

  it("loads members from CSV", async () => {
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(<SettingsPageMembersTab form={form.current} />);

    fireEvent.change(screen.getByTestId("member-file-input"), {
      target: {
        files: [
          new File(
            [
              "New Member,CONTESTANT,newmemberlogin,newmemberpassword,192.168.0.1",
            ],
            "members.csv",
            { type: "text/csv" },
          ),
        ],
      },
    });

    await waitFor(() => {
      expect(form.current.getValues("members")).toEqual([
        {
          name: "New Member",
          type: MemberType.CONTESTANT,
          login: "newmemberlogin",
          password: "newmemberpassword",
          ip: "192.168.0.1",
        },
      ]);
    });
  });

  it("shows toast on load error", async () => {
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(<SettingsPageMembersTab form={form.current} />);

    fireEvent.change(screen.getByTestId("member-file-input"), {
      target: {
        files: [new File([], "members.csv", { type: "text/csv" })],
      },
    });

    await waitFor(() => {
      expect(useToast().error).toHaveBeenCalled();
    });
  });
});
