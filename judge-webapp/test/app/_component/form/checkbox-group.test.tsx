import { render, screen } from "@testing-library/react";
import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { useForm } from "react-hook-form";

jest.mock("@/app/_component/form/checkbox", () => ({
  Checkbox: () => (
    <input type="checkbox" data-testid="checkbox-group:checkbox" />
  ),
}));

describe("CheckboxGroup", () => {
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  const TestComponent = () => {
    const form = useForm();
    return (
      <CheckboxGroup
        form={form}
        name="test"
        s={((key: string) => key) as any}
        label="Test label"
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
