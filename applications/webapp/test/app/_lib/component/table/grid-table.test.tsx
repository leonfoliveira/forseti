import { render, screen } from "@testing-library/react";

import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableColumn,
  GridTableHeader,
  GridTableRow,
} from "@/app/_lib/component/table/grid-table";

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

  describe("GridTableHeader", () => {
    it("should render a header row with proper role and styling", () => {
      render(
        <GridTableHeader data-testid="grid-header">
          <GridTableColumn>Header 1</GridTableColumn>
          <GridTableColumn>Header 2</GridTableColumn>
        </GridTableHeader>,
      );

      const header = screen.getByTestId("grid-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("role", "row");
      expect(header).toHaveClass("contents");
    });

    it("should clone children with additional className", () => {
      render(
        <GridTableHeader>
          <GridTableColumn data-testid="header-column">Header</GridTableColumn>
        </GridTableHeader>,
      );

      const column = screen.getByTestId("header-column");
      expect(column).toHaveClass("contents", "bg-content3/50");
    });

    it("should handle non-React element children safely", () => {
      render(
        <GridTableHeader>
          <GridTableColumn>Valid Column</GridTableColumn>
          {null}
          {undefined}
          Plain text
        </GridTableHeader>,
      );

      expect(screen.getByText("Valid Column")).toBeInTheDocument();
      expect(screen.getByText("Plain text")).toBeInTheDocument();
    });

    it("should merge custom className with cloned children", () => {
      render(
        <GridTableHeader className="custom-header-class">
          <GridTableColumn
            className="original-class"
            data-testid="header-column"
          >
            Header
          </GridTableColumn>
        </GridTableHeader>,
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

  describe("GridTableColumn", () => {
    it("should render a column header with proper role and styling", () => {
      render(
        <GridTableColumn data-testid="grid-column">
          Column Header
        </GridTableColumn>,
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
        <GridTableColumn className="custom-column" data-testid="grid-column">
          Column Header
        </GridTableColumn>,
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
      render(<GridTableColumn>Column Content</GridTableColumn>);

      expect(screen.getByText("Column Content")).toBeInTheDocument();
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTableColumn id="column-id" data-custom="column-value">
          Column
        </GridTableColumn>,
      );

      const column = screen.getByRole("columnheader");
      expect(column).toHaveAttribute("id", "column-id");
      expect(column).toHaveAttribute("data-custom", "column-value");
    });
  });

  describe("GridTableBody", () => {
    it("should render a body with proper role and styling", () => {
      render(
        <GridTableBody data-testid="grid-body">
          <GridTableRow>
            <GridTableCell>Cell content</GridTableCell>
          </GridTableRow>
        </GridTableBody>,
      );

      const body = screen.getByTestId("grid-body");
      expect(body).toBeInTheDocument();
      expect(body).toHaveAttribute("role", "rowgroup");
      expect(body).toHaveClass("contents");
    });

    it("should display empty content when no children are provided", () => {
      const emptyContent = <div data-testid="empty">No data available</div>;

      render(<GridTableBody emptyContent={emptyContent} />);

      const emptyDiv = screen.getByTestId("empty");
      expect(emptyDiv).toBeInTheDocument();
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should display empty content with default styling when no children", () => {
      const emptyContent = "No data";

      render(<GridTableBody emptyContent={emptyContent} />);

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
        <GridTableBody emptyContent="Empty">
          <GridTableRow>
            <GridTableCell>Cell content</GridTableCell>
          </GridTableRow>
        </GridTableBody>,
      );

      expect(screen.getByText("Cell content")).toBeInTheDocument();
      expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    });

    it("should accept custom className and merge it with default classes", () => {
      render(
        <GridTableBody className="custom-body" data-testid="grid-body">
          <div>Body content</div>
        </GridTableBody>,
      );

      const body = screen.getByTestId("grid-body");
      expect(body).toHaveClass("contents", "custom-body");
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTableBody id="body-id" data-custom="body-value">
          <div>Body</div>
        </GridTableBody>,
      );

      const body = screen.getByRole("rowgroup");
      expect(body).toHaveAttribute("id", "body-id");
      expect(body).toHaveAttribute("data-custom", "body-value");
    });
  });

  describe("GridTableRow", () => {
    it("should render a row with proper role and styling", () => {
      render(
        <GridTableRow data-testid="grid-row">
          <GridTableCell>Cell 1</GridTableCell>
          <GridTableCell>Cell 2</GridTableCell>
        </GridTableRow>,
      );

      const row = screen.getByTestId("grid-row");
      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute("role", "row");
      expect(row).toHaveClass("contents");
    });

    it("should clone children with additional className", () => {
      render(
        <GridTableRow className="row-custom">
          <GridTableCell className="original-cell" data-testid="row-cell">
            Cell
          </GridTableCell>
        </GridTableRow>,
      );

      const cell = screen.getByTestId("row-cell");
      expect(cell).toHaveClass("original-cell", "row-custom");
    });

    it("should handle non-React element children safely", () => {
      render(
        <GridTableRow>
          <GridTableCell>Valid Cell</GridTableCell>
          {null}
          {undefined}
          Plain text
        </GridTableRow>,
      );

      expect(screen.getByText("Valid Cell")).toBeInTheDocument();
      expect(screen.getByText("Plain text")).toBeInTheDocument();
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTableRow id="row-id" data-custom="row-value">
          <GridTableCell>Cell</GridTableCell>
        </GridTableRow>,
      );

      const row = screen.getByRole("row");
      expect(row).toHaveAttribute("id", "row-id");
      expect(row).toHaveAttribute("data-custom", "row-value");
    });
  });

  describe("GridTableCell", () => {
    it("should render a cell with proper role and styling", () => {
      render(
        <GridTableCell data-testid="grid-cell">Cell content</GridTableCell>,
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
        <GridTableCell className="custom-cell" data-testid="grid-cell">
          Cell content
        </GridTableCell>,
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
      render(<GridTableCell>Cell Content</GridTableCell>);

      expect(screen.getByText("Cell Content")).toBeInTheDocument();
    });

    it("should forward HTML props to the div element", () => {
      render(
        <GridTableCell id="cell-id" data-custom="cell-value">
          Cell
        </GridTableCell>,
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
          <GridTableHeader>
            <GridTableColumn>Name</GridTableColumn>
            <GridTableColumn>Age</GridTableColumn>
          </GridTableHeader>
          <GridTableBody>
            <GridTableRow>
              <GridTableCell>John</GridTableCell>
              <GridTableCell>25</GridTableCell>
            </GridTableRow>
            <GridTableRow>
              <GridTableCell>Jane</GridTableCell>
              <GridTableCell>30</GridTableCell>
            </GridTableRow>
          </GridTableBody>
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
          <GridTableHeader>
            <GridTableColumn>Name</GridTableColumn>
            <GridTableColumn>Age</GridTableColumn>
          </GridTableHeader>
          <GridTableBody emptyContent="No users found" />
        </GridTable>,
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    it("should apply custom styles throughout the table structure", () => {
      render(
        <GridTable className="custom-table">
          <GridTableHeader className="custom-header">
            <GridTableColumn className="custom-column">Name</GridTableColumn>
          </GridTableHeader>
          <GridTableBody className="custom-body">
            <GridTableRow className="custom-row">
              <GridTableCell className="custom-cell">John</GridTableCell>
            </GridTableRow>
          </GridTableBody>
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
