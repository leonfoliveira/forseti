import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  renderHook,
} from "@testing-library/react";
import React from "react";
import { useFindAllSubmissionsForMemberAction } from "@/app/_action/find-all-submissions-for-member-action";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";
import { useCreateSubmissionAction } from "@/app/_action/create-submission-action";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { attachmentService, storageService } from "@/app/_composition";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { toLocaleString } from "@/app/_util/date-utils";
import ContestSubmissionPage from "@/app/contests/[id]/submissions/page";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_action/find-all-submissions-for-member-action", () => ({
  useFindAllSubmissionsForMemberAction: jest.fn(),
}));
jest.mock("@/app/_action/find-contest-by-id-action", () => ({
  useFindContestByIdAction: jest.fn(),
}));
jest.mock("@/app/_action/create-submission-action", () => ({
  useCreateSubmissionAction: jest.fn(),
}));
jest.mock("@/app/_util/authorization-hook", () => ({
  useAuthorization: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  attachmentService: {
    download: jest.fn(),
  },
  storageService: {
    getKey: jest.fn(),
    setKey: jest.fn(),
  },
}));

const mockUse = React.use as jest.Mock;
const mockUseFindAllSubmissionsForMemberAction =
  useFindAllSubmissionsForMemberAction as jest.Mock;
const mockUseFindContestByIdAction = useFindContestByIdAction as jest.Mock;
const mockUseCreateSubmissionAction = useCreateSubmissionAction as jest.Mock;
const mockUseAuthorization = useAuthorization as jest.Mock;
const mockAttachmentServiceDownload = attachmentService.download as jest.Mock;
const mockStorageServiceGetKey = storageService.getKey as jest.Mock;
const mockStorageServiceSetKey = storageService.setKey as jest.Mock;

describe("ContestSubmissionPage", () => {
  const contestId = 123;
  const memberId = 456;
  const getParams = Promise.resolve({ id: contestId });

  const mockSubmissions = [
    {
      id: 1,
      createdAt: "2025-01-01T10:00:00Z",
      problem: { id: 101, title: "Problem Alpha" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.ACCEPTED,
      code: "code1.java",
    },
    {
      id: 2,
      createdAt: "2025-01-01T10:05:00Z",
      problem: { id: 102, title: "Problem Beta" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.WRONG_ANSWER,
      code: "code2.py",
    },
  ];

  const mockContest = {
    id: contestId,
    problems: [
      { id: 101, title: "Problem Alpha" },
      { id: 102, title: "Problem Beta" },
    ],
    languages: [Language.PYTHON_3_13_3],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUse.mockReturnValue({ id: contestId });

    mockUseAuthorization.mockReturnValue({ member: { id: memberId } });
    mockUseFindAllSubmissionsForMemberAction.mockReturnValue({
      data: mockSubmissions,
      setData: jest.fn(),
      isLoading: false,
      act: jest.fn(),
    });
    mockUseFindContestByIdAction.mockReturnValue({
      data: mockContest,
      isLoading: false,
      act: jest.fn().mockResolvedValue(mockContest),
    });
    mockUseCreateSubmissionAction.mockReturnValue({
      data: null,
      isLoading: false,
      act: jest.fn(),
    });
    mockStorageServiceGetKey.mockReturnValue(null);
  });

  const {
    result: {
      current: { formatLanguage },
    },
  } = renderHook(() => useContestFormatter());

  it("renders spinner when submissions data is loading", () => {
    mockUseFindAllSubmissionsForMemberAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
    render(<ContestSubmissionPage params={getParams} />);
    expect(screen.getByTestId("submissions:spinner")).toBeInTheDocument();
  });

  it("renders 'No submission yet' message when no submissions are available", () => {
    mockUseFindAllSubmissionsForMemberAction.mockReturnValue({
      data: [],
      isLoading: false,
      act: jest.fn(),
    });
    render(<ContestSubmissionPage params={getParams} />);
    expect(screen.getByTestId("submissions:empty")).toBeInTheDocument();
  });

  it("renders submissions table with correct data", () => {
    render(<ContestSubmissionPage params={getParams} />);

    expect(screen.getAllByTestId("table-header-cell")).toHaveLength(4);

    const rows = screen.getAllByTestId("submission:row");
    expect(rows).toHaveLength(2);

    expect(
      within(rows[0]).getByTestId("submission:created-at"),
    ).toHaveTextContent(toLocaleString(mockSubmissions[0].createdAt));
    expect(within(rows[0]).getByTestId("submission:title")).toHaveTextContent(
      mockSubmissions[0].problem.title,
    );
    expect(
      within(rows[0]).getByTestId("submission:language"),
    ).toHaveTextContent(formatLanguage(mockSubmissions[0].language));
    expect(
      within(within(rows[0]).getByTestId("submission:status")).getByTestId(
        "badge",
      ),
    ).toBeInTheDocument();

    expect(
      within(rows[1]).getByTestId("submission:created-at"),
    ).toHaveTextContent(toLocaleString(mockSubmissions[1].createdAt));
    expect(within(rows[1]).getByTestId("submission:title")).toHaveTextContent(
      mockSubmissions[1].problem.title,
    );
    expect(
      within(rows[1]).getByTestId("submission:language"),
    ).toHaveTextContent(formatLanguage(mockSubmissions[0].language));
    expect(
      within(within(rows[1]).getByTestId("submission:status")).getByTestId(
        "badge",
      ),
    ).toBeInTheDocument();
  });

  it("calls attachmentService.download when a submission row is clicked", () => {
    render(<ContestSubmissionPage params={getParams} />);

    const submissionRows = screen.getAllByTestId("submission:row");
    fireEvent.click(submissionRows[0]);
    expect(mockAttachmentServiceDownload).toHaveBeenCalledWith(
      mockSubmissions[0].code,
    );

    fireEvent.click(submissionRows[1]);
    expect(mockAttachmentServiceDownload).toHaveBeenCalledWith(
      mockSubmissions[1].code,
    );
  });

  it("calls findAllSubmissionsForMemberAction.act and findContestByIdAction.act on initial render", async () => {
    const mockFindAllSubmissionsAct = jest.fn();
    const mockFindContestAct = jest.fn().mockResolvedValue(mockContest);

    mockUseFindAllSubmissionsForMemberAction.mockReturnValue({
      data: [],
      setData: jest.fn(),
      isLoading: false,
      act: mockFindAllSubmissionsAct,
    });
    mockUseFindContestByIdAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: mockFindContestAct,
    });

    render(<ContestSubmissionPage params={getParams} />);

    expect(mockFindAllSubmissionsAct).toHaveBeenCalledWith(contestId, memberId);
    expect(mockFindContestAct).toHaveBeenCalledWith(contestId);
    await waitFor(() => expect(mockFindContestAct).toHaveBeenCalledTimes(1));
  });

  it("initializes form with active language from storage if available and valid", async () => {
    mockStorageServiceGetKey.mockReturnValue(Language.PYTHON_3_13_3);

    render(<ContestSubmissionPage params={getParams} />);

    await waitFor(() => {
      expect(screen.getByTestId("form:language:select")).toHaveValue(
        Language.PYTHON_3_13_3,
      );
    });
  });

  it("does not initialize form with active language if not valid for contest", async () => {
    mockStorageServiceGetKey.mockReturnValue(Language.PYTHON_3_13_3);
    mockUseFindContestByIdAction.mockReturnValue({
      data: { ...mockContest, languages: [] },
      isLoading: false,
      act: jest.fn(),
    });

    render(<ContestSubmissionPage params={getParams} />);

    await waitFor(() => {
      expect(screen.getByTestId("form:language:select")).not.toHaveValue();
    });
  });

  it("submits the form and updates submissions list", async () => {
    const mockSetSubmissions = jest.fn();
    const mockCreateSubmissionAct = jest.fn().mockResolvedValue({
      id: 3,
      createdAt: "2025-01-01T11:00:00Z",
      problem: { id: 101, title: "Problem Alpha" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.JUDGING,
      code: "new_code.java",
    });

    mockUseFindAllSubmissionsForMemberAction.mockReturnValue({
      data: [],
      setData: mockSetSubmissions,
      isLoading: false,
      act: jest.fn(),
    });
    mockUseCreateSubmissionAction.mockReturnValue({
      data: null,
      isLoading: false,
      act: mockCreateSubmissionAct,
    });

    render(<ContestSubmissionPage params={getParams} />);

    const problemSelect = screen.getByTestId("form:problem:select");
    const languageSelect = screen.getByTestId("form:language:select");
    const codeInput = screen.getByTestId("form:code:input");
    const submitButton = screen.getByTestId("form:submit");

    fireEvent.change(problemSelect, { target: { value: "101" } });
    fireEvent.change(languageSelect, {
      target: { value: Language.PYTHON_3_13_3 },
    });
    fireEvent.change(codeInput, {
      target: {
        files: [
          new File(["console.log('hi');"], "test.java", { type: "text/plain" }),
        ],
      },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateSubmissionAct).toHaveBeenCalledWith(
        contestId,
        expect.objectContaining({
          problemId: 101,
          language: Language.PYTHON_3_13_3,
        }),
      );
    });

    const cb = mockSetSubmissions.mock.calls[0][0];
    expect(cb()).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 3, language: Language.PYTHON_3_13_3 }),
      ]),
    );
    expect(mockStorageServiceSetKey).toHaveBeenCalledWith(
      "active-language",
      Language.PYTHON_3_13_3,
    );
  });

  it("disables form when findContestByIdAction is loading", async () => {
    mockUseFindContestByIdAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
    render(<ContestSubmissionPage params={getParams} />);
    expect(screen.getByTestId("form:submission")).toHaveAttribute("disabled");
  });

  it("disables form when createSubmissionAction is loading and shows spinner", async () => {
    mockUseCreateSubmissionAction.mockReturnValue({
      data: null,
      isLoading: true,
      act: jest.fn(),
    });
    render(<ContestSubmissionPage params={getParams} />);
    expect(screen.getByTestId("form:submission")).toHaveAttribute("disabled");
    expect(
      await screen.findByTestId("form:submit:spinner"),
    ).toBeInTheDocument();
  });
});
