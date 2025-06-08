import { fireEvent, render, screen } from "@testing-library/react";
import { formatDateTime } from "@/app/_util/date-utils";
import { useRouter } from "next/navigation";
import { ContestsTable } from "@/app/root/contests/_component/contests-table";
import React from "react";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { Language } from "@/core/domain/enumerate/Language";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("ContestsTable", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  const mockContests: WithStatus<ContestMetadataResponseDTO>[] = [
    {
      id: "1",
      slug: "contest-a",
      title: "Contest A",
      languages: [Language.PYTHON_3_13_3],
      startAt: "2023-01-01T10:00:00Z",
      endAt: "2023-01-08T10:00:00Z",
      status: ContestStatus.IN_PROGRESS,
    },
  ];

  it("renders table headers correctly", () => {
    render(<ContestsTable contests={[]} />);

    expect(screen.getAllByTestId("table-header-cell")).toHaveLength(5);
  });

  it("renders contest data correctly", () => {
    render(<ContestsTable contests={mockContests} />);

    expect(screen.getByTestId("slug")).toHaveTextContent(
      mockContests[0].slug.toString(),
    );
    expect(screen.getByTestId("title")).toHaveTextContent(
      mockContests[0].title,
    );
    expect(screen.getByTestId("startAt")).toHaveTextContent(
      formatDateTime(mockContests[0].startAt),
    );
    expect(screen.getByTestId("endAt")).toHaveTextContent(
      formatDateTime(mockContests[0].endAt),
    );
    expect(screen.getByTestId("badge")).toHaveClass("badge-success");
  });

  it("calls router.push on row click", () => {
    render(<ContestsTable contests={mockContests} />);

    const row = screen.getByTestId("row");
    fireEvent.click(row);
    expect(mockPush).toHaveBeenCalledWith("/root/contests/1");
  });
});
