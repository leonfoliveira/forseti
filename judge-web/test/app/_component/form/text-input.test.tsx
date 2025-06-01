import { screen, fireEvent, render, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import React from "react";
import { TextInput } from "@/app/_component/form/text-input";
import { useTranslations } from "next-intl";

describe("TextInput", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  const s = jest.fn().mockReturnValue("message") as unknown as ReturnType<
    typeof useTranslations
  >;

  it("renders the text input with the correct label", () => {
    render(
      <TextInput
        fm={form}
        name="username"
        s={s}
        label="Enter your username"
        data-testid="text-input"
      />,
    );
    expect(screen.getByTestId("text-input:label")).toHaveTextContent(
      "Enter your username",
    );
  });

  it("updates the value when text is entered", () => {
    render(
      <TextInput
        fm={form}
        name="username"
        s={s}
        label="Enter your username"
        data-testid="text-input"
      />,
    );
    const input = screen.getByTestId("text-input:input");
    fireEvent.change(input, { target: { value: "newuser" } });
    expect(input).toHaveValue("newuser");
  });

  it("renders as a password input when the password prop is true", () => {
    render(
      <TextInput
        fm={form}
        name="password"
        s={s}
        label="Enter your password"
        password
        data-testid="text-input"
      />,
    );
    const input = screen.getByTestId("text-input:input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders as a text input when the password prop is false", () => {
    render(
      <TextInput
        fm={form}
        name="username"
        s={s}
        label="Enter your username"
        data-testid="text-input"
      />,
    );
    const input = screen.getByTestId("text-input:input");
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders the error message when there is a validation error", () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm());
    form.setError("username", {
      type: "required",
      message: "This field is required",
    });
    render(
      <TextInput
        fm={form}
        name="username"
        s={s}
        label="Enter your username"
        data-testid="text-input"
      />,
    );
    expect(screen.getByTestId("text-input:error")).not.toBeEmptyDOMElement();
  });
});
