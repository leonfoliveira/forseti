import React from "react";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { ControlledField } from "@/app/_lib/component/form/ControlledField";

describe("ControlledField", () => {
  it("connects the field to react-hook-form and displays validation feedback", () => {
    function Harness() {
      const form = useForm<{ title: string }>({ defaultValues: { title: "" } });
      React.useEffect(() => form.setError("title", { message: "Title is required" }), [form]);
      return <ControlledField form={form} name="title" label="Title" field={<input data-testid="title-input" />} />;
    }
    render(<Harness />);
    expect(screen.getByLabelText("Title")).toHaveAttribute("data-testid", "title-input");
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required");
  });
});
