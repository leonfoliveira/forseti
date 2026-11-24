import { fireEvent,screen } from "@testing-library/react";
import React from "react";
import { useForm } from "react-hook-form";

import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Checkbox } from "@/app/_lib/component/shadcn/checkbox";
import { Input } from "@/app/_lib/component/shadcn/input";
import { Switch } from "@/app/_lib/component/shadcn/switch";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/shadcn/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/checkbox", () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/switch", () => ({
  Switch: (props: any) => <input type="checkbox" {...props} />,
}));

describe("ControlledField", () => {
  it("renders input successfully", async () => {
    const { result } = await renderHookWithProviders(() =>
      useForm<{ title: string }>({ defaultValues: { title: "" } }),
    );
    await renderWithProviders(
      <ControlledField
        form={result.current}
        name="title"
        label="brand"
        field={<Input data-testid="title-input" />}
      />,
    );

    fireEvent.change(screen.getByTestId("title-input"), {
      target: { value: "New Title" },
    });

    expect(result.current.getValues("title")).toBe("New Title");
  });

  it("renders file input successfully", async () => {
    const { result } = await renderHookWithProviders(() =>
      useForm<{ file: File[] | null }>({ defaultValues: { file: null } }),
    );
    await renderWithProviders(
      <ControlledField
        form={result.current}
        name="file"
        label="brand"
        field={<Input data-testid="file-input" type="file" />}
      />,
    );

    const file = new File(["file content"], "file.txt", { type: "text/plain" });
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file] },
    });

    expect(result.current.getValues("file")).toEqual([file]);
  });

  it("renders checkbox successfully", async () => {
    const { result } = await renderHookWithProviders(() =>
      useForm<{ agree: boolean }>({ defaultValues: { agree: false } }),
    );
    await renderWithProviders(
      <ControlledField
        form={result.current}
        name="agree"
        label="brand"
        field={<Checkbox data-testid="agree-checkbox" />}
      />,
    );

    fireEvent.click(screen.getByTestId("agree-checkbox"));

    expect(result.current.getValues("agree")).toBe(true);
  });

  it("renders switch successfully", async () => {
    const { result } = await renderHookWithProviders(() =>
      useForm<{ agree: boolean }>({ defaultValues: { agree: false } }),
    );
    await renderWithProviders(
      <ControlledField
        form={result.current}
        name="agree"
        label="brand"
        field={<Switch data-testid="agree-switch" />}
      />,
    );

    fireEvent.click(screen.getByTestId("agree-switch"));

    expect(result.current.getValues("agree")).toBe(true);
  });
});
