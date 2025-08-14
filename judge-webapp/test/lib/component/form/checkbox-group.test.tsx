import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { CheckboxGroup } from "@/lib/component/form/checkbox-group";

jest.mock("@/lib/component/form/checkbox", () => ({
  Checkbox: () => (
    <input type="checkbox" data-testid="checkbox-group:checkbox" />
  ),
}));

describe("CheckboxGroup", () => {
  const options = [
    { value: "1", label: { id: "option-1", defaultMessage: "Option 1" } },
    { value: "2", label: { id: "option-2", defaultMessage: "Option 2" } },
    { value: "3", label: { id: "option-3", defaultMessage: "Option 3" } },
  ];

  const TestComponent = () => {
    const form = useForm();
    return (
      <CheckboxGroup
        form={form}
        name="test"
        label={{ id: "label", defaultMessage: "Test label" }}
        options={options}
      />
    );
  };

  it("renders a checkbox group with the given options", () => {
    render(<TestComponent />);
    const checkboxGroup = screen.getByTestId("checkbox-group");
    expect(checkboxGroup).toBeInTheDocument();
    const checkboxes = screen.getAllByTestId("checkbox-group:checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  it("renders the label", () => {
    render(<TestComponent />);
    const label = screen.getByTestId("checkbox-group:label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label");
  });
});
