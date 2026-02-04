import { render, screen } from "@testing-library/react";

import { GridTable } from "@/app/_lib/component/base/table/grid-table";

describe("GridTable Components", () => {
  describe("GridTable", () => {
    it("should render a table with proper role and styling", () => {
      render(
        <GridTable data-testid="grid-table">
          <div>Table content</div>
        </GridTable>,
      );

      const table = screen.getByTestId("grid-table");
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute("role", "table");
      expect(table).toHaveClass("grid", "bg-content1", "p-8", "items-center");
    });

    it("should accept custom className and merge it with default classes", () => {
      render(
        <GridTable className="custom-class" data-testid="grid-table">
          <div>Table content</div>
        </GridTable>,
      );

      const table = screen.getByTestId("grid-table");
      expect(table).toHaveClass(
        "grid",
        "bg-content1",
        "p-8",
        "items-center",
        "custom-class",
      );
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTable id="test-id" data-custom="test-value">
          <div>Table content</div>
        </GridTable>,
      );

      const table = screen.getByRole("table");
      expect(table).toHaveAttribute("id", "test-id");
      expect(table).toHaveAttribute("data-custom", "test-value");
    });

    it("should render children content", () => {
      render(
        <GridTable>
          <div>Child content</div>
        </GridTable>,
      );

      expect(screen.getByText("Child content")).toBeInTheDocument();
    });
  });

  describe("GridTable.Header", () => {
    it("should render a header row with proper role and styling", () => {
      render(
        <GridTable.Header data-testid="grid-header">
          <GridTable.Column>Header 1</GridTable.Column>
          <GridTable.Column>Header 2</GridTable.Column>
        </GridTable.Header>,
      );

      const header = screen.getByTestId("grid-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("role", "row");
      expect(header).toHaveClass("contents");
    });

    it("should clone children with additional className", () => {
      render(
        <GridTable.Header>
          <GridTable.Column data-testid="header-column">
            Header
          </GridTable.Column>
        </GridTable.Header>,
      );

      const column = screen.getByTestId("header-column");
      expect(column).toHaveClass("contents", "bg-content3/50");
    });

    it("should handle non-React element children safely", () => {
      render(
        <GridTable.Header>
          <GridTable.Column>Valid Column</GridTable.Column>
          {null}
          {undefined}
          Plain text
        </GridTable.Header>,
      );

      expect(screen.getByText("Valid Column")).toBeInTheDocument();
      expect(screen.getByText("Plain text")).toBeInTheDocument();
    });

    it("should merge custom className with cloned children", () => {
      render(
        <GridTable.Header className="custom-header-class">
          <GridTable.Column
            className="original-class"
            data-testid="header-column"
          >
            Header
          </GridTable.Column>
        </GridTable.Header>,
      );

      const column = screen.getByTestId("header-column");
      expect(column).toHaveClass(
        "original-class",
        "contents",
        "bg-content3/50",
        "custom-header-class",
      );
    });
  });

  describe("GridTable.Column", () => {
    it("should render a column header with proper role and styling", () => {
      render(
        <GridTable.Column data-testid="grid-column">
          Column Header
        </GridTable.Column>,
      );

      const column = screen.getByTestId("grid-column");
      expect(column).toBeInTheDocument();
      expect(column).toHaveAttribute("role", "columnheader");
      expect(column).toHaveClass(
        "py-2",
        "px-4",
        "font-semibold",
        "text-sm",
        "h-full",
        "flex",
        "items-center",
      );
    });

    it("should accept custom className and merge it with default classes", () => {
      render(
        <GridTable.Column className="custom-column" data-testid="grid-column">
          Column Header
        </GridTable.Column>,
      );

      const column = screen.getByTestId("grid-column");
      expect(column).toHaveClass(
        "py-2",
        "px-4",
        "font-semibold",
        "text-sm",
        "h-full",
        "flex",
        "items-center",
        "custom-column",
      );
    });

    it("should render children content", () => {
      render(<GridTable.Column>Column Content</GridTable.Column>);

      expect(screen.getByText("Column Content")).toBeInTheDocument();
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTable.Column id="column-id" data-custom="column-value">
          Column
        </GridTable.Column>,
      );

      const column = screen.getByRole("columnheader");
      expect(column).toHaveAttribute("id", "column-id");
      expect(column).toHaveAttribute("data-custom", "column-value");
    });
  });

  describe("GridTable.Body", () => {
    it("should render a body with proper role and styling", () => {
      render(
        <GridTable.Body data-testid="grid-body">
          <GridTable.Row>
            <GridTable.Cell>Cell content</GridTable.Cell>
          </GridTable.Row>
        </GridTable.Body>,
      );

      const body = screen.getByTestId("grid-body");
      expect(body).toBeInTheDocument();
      expect(body).toHaveAttribute("role", "rowgroup");
      expect(body).toHaveClass("contents");
    });

    it("should display empty content when no children are provided", () => {
      const emptyContent = <div data-testid="empty">No data available</div>;

      render(<GridTable.Body emptyContent={emptyContent} />);

      const emptyDiv = screen.getByTestId("empty");
      expect(emptyDiv).toBeInTheDocument();
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should display empty content with default styling when no children", () => {
      const emptyContent = "No data";

      render(<GridTable.Body emptyContent={emptyContent} />);

      const emptyContainer = screen.getByText("No data");
      expect(emptyContainer).toHaveClass(
        "col-span-full",
        "flex",
        "justify-center",
        "items-center",
        "py-20",
        "text-neutral-400",
      );
    });

    it("should render children when provided", () => {
      render(
        <GridTable.Body emptyContent="Empty">
          <GridTable.Row>
            <GridTable.Cell>Cell content</GridTable.Cell>
          </GridTable.Row>
        </GridTable.Body>,
      );

      expect(screen.getByText("Cell content")).toBeInTheDocument();
      expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    });

    it("should accept custom className and merge it with default classes", () => {
      render(
        <GridTable.Body className="custom-body" data-testid="grid-body">
          <div>Body content</div>
        </GridTable.Body>,
      );

      const body = screen.getByTestId("grid-body");
      expect(body).toHaveClass("contents", "custom-body");
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTable.Body id="body-id" data-custom="body-value">
          <div>Body</div>
        </GridTable.Body>,
      );

      const body = screen.getByRole("rowgroup");
      expect(body).toHaveAttribute("id", "body-id");
      expect(body).toHaveAttribute("data-custom", "body-value");
    });
  });

  describe("GridTable.Row", () => {
    it("should render a row with proper role and styling", () => {
      render(
        <GridTable.Row data-testid="grid-row">
          <GridTable.Cell>Cell 1</GridTable.Cell>
          <GridTable.Cell>Cell 2</GridTable.Cell>
        </GridTable.Row>,
      );

      const row = screen.getByTestId("grid-row");
      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute("role", "row");
      expect(row).toHaveClass("contents");
    });

    it("should clone children with additional className", () => {
      render(
        <GridTable.Row className="row-custom">
          <GridTable.Cell className="original-cell" data-testid="row-cell">
            Cell
          </GridTable.Cell>
        </GridTable.Row>,
      );

      const cell = screen.getByTestId("row-cell");
      expect(cell).toHaveClass("original-cell", "row-custom");
    });

    it("should handle non-React element children safely", () => {
      render(
        <GridTable.Row>
          <GridTable.Cell>Valid Cell</GridTable.Cell>
          {null}
          {undefined}
          Plain text
        </GridTable.Row>,
      );

      expect(screen.getByText("Valid Cell")).toBeInTheDocument();
      expect(screen.getByText("Plain text")).toBeInTheDocument();
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTable.Row id="row-id" data-custom="row-value">
          <GridTable.Cell>Cell</GridTable.Cell>
        </GridTable.Row>,
      );

      const row = screen.getByRole("row");
      expect(row).toHaveAttribute("id", "row-id");
      expect(row).toHaveAttribute("data-custom", "row-value");
    });
  });

  describe("GridTable.Cell", () => {
    it("should render a cell with proper role and styling", () => {
      render(
        <GridTable.Cell data-testid="grid-cell">Cell content</GridTable.Cell>,
      );

      const cell = screen.getByTestId("grid-cell");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute("role", "cell");
      expect(cell).toHaveClass(
        "h-full",
        "py-2",
        "px-4",
        "text-sm",
        "flex",
        "items-center",
      );
    });

    it("should accept custom className and merge it with default classes", () => {
      render(
        <GridTable.Cell className="custom-cell" data-testid="grid-cell">
          Cell content
        </GridTable.Cell>,
      );

      const cell = screen.getByTestId("grid-cell");
      expect(cell).toHaveClass(
        "h-full",
        "py-2",
        "px-4",
        "text-sm",
        "flex",
        "items-center",
        "custom-cell",
      );
    });

    it("should render children content", () => {
      render(<GridTable.Cell>Cell Content</GridTable.Cell>);

      expect(screen.getByText("Cell Content")).toBeInTheDocument();
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTable.Cell id="cell-id" data-custom="cell-value">
          Cell
        </GridTable.Cell>,
      );

      const cell = screen.getByRole("cell");
      expect(cell).toHaveAttribute("id", "cell-id");
      expect(cell).toHaveAttribute("data-custom", "cell-value");
    });
  });

  describe("Integration Tests", () => {
    it("should render a complete table structure", () => {
      render(
        <GridTable data-testid="complete-table">
          <GridTable.Header>
            <GridTable.Column>Name</GridTable.Column>
            <GridTable.Column>Age</GridTable.Column>
          </GridTable.Header>
          <GridTable.Body>
            <GridTable.Row>
              <GridTable.Cell>John</GridTable.Cell>
              <GridTable.Cell>25</GridTable.Cell>
            </GridTable.Row>
            <GridTable.Row>
              <GridTable.Cell>Jane</GridTable.Cell>
              <GridTable.Cell>30</GridTable.Cell>
            </GridTable.Row>
          </GridTable.Body>
        </GridTable>,
      );

      // Check table structure
      const table = screen.getByTestId("complete-table");
      expect(table).toHaveAttribute("role", "table");

      // Check headers
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();

      // Check data cells
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();

      // Check roles
      expect(screen.getAllByRole("columnheader")).toHaveLength(2);
      expect(screen.getAllByRole("row")).toHaveLength(3); // 1 header + 2 data rows
      expect(screen.getAllByRole("cell")).toHaveLength(4);
    });

    it("should render empty table with empty content", () => {
      render(
        <GridTable>
          <GridTable.Header>
            <GridTable.Column>Name</GridTable.Column>
            <GridTable.Column>Age</GridTable.Column>
          </GridTable.Header>
          <GridTable.Body emptyContent="No users found" />
        </GridTable>,
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    it("should apply custom styles throughout the table structure", () => {
      render(
        <GridTable className="custom-table">
          <GridTable.Header className="custom-header">
            <GridTable.Column className="custom-column">Name</GridTable.Column>
          </GridTable.Header>
          <GridTable.Body className="custom-body">
            <GridTable.Row className="custom-row">
              <GridTable.Cell className="custom-cell">John</GridTable.Cell>
            </GridTable.Row>
          </GridTable.Body>
        </GridTable>,
      );

      const table = screen.getByRole("table");
      expect(table).toHaveClass("custom-table");

      const column = screen.getByRole("columnheader");
      expect(column).toHaveClass("custom-column", "custom-header");

      const cell = screen.getByRole("cell");
      expect(cell).toHaveClass("custom-cell", "custom-row");
    });
  });
});
