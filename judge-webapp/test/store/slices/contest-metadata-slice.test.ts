import { Language } from "@/core/domain/enumerate/Language";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";

describe("contestMetadataSlice", () => {
  const makeContestMetadata = (
    overrides: Partial<ContestMetadataResponseDTO> = {},
  ): ContestMetadataResponseDTO => ({
    id: "contest-123",
    slug: "test-contest",
    title: "Test Contest",
    languages: [Language.CPP_17, Language.JAVA_21],
    startAt: "2024-12-01T10:00:00Z",
    endAt: "2024-12-01T15:00:00Z",
    ...overrides,
  });

  const initialState = {
    isLoading: true as const,
    error: null,
    data: null,
  };

  it("should set loading to false and store data on success", () => {
    const contestMetadata = makeContestMetadata();
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.success(contestMetadata),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data).toEqual(contestMetadata);
    expect(state.data?.title).toBe("Test Contest");
    expect(state.data?.slug).toBe("test-contest");
    expect(state.data?.languages).toEqual([Language.CPP_17, Language.JAVA_21]);
  });

  it("should replace existing contest metadata with new one", () => {
    const oldContest = makeContestMetadata({
      title: "Old Contest",
      slug: "old-contest",
      id: "old-123",
    });
    const stateWithOldData = {
      isLoading: false as const,
      error: null,
      data: oldContest,
    };

    const newContest = makeContestMetadata({
      title: "New Contest",
      slug: "new-contest",
      id: "new-123",
    });

    const state = contestMetadataSlice.reducer(
      stateWithOldData,
      contestMetadataSlice.actions.success(newContest),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data?.title).toBe("New Contest");
    expect(state.data?.slug).toBe("new-contest");
    expect(state.data?.id).toBe("new-123");
  });

  it("should handle setting contest with different languages", () => {
    const contestWithPython = makeContestMetadata({
      languages: [Language.PYTHON_3_13],
      title: "Python Contest",
    });
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.success(contestWithPython),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data?.languages).toEqual([Language.PYTHON_3_13]);
    expect(state.data?.title).toBe("Python Contest");
  });

  it("should handle setting contest with multiple languages", () => {
    const multiLanguageContest = makeContestMetadata({
      languages: [Language.CPP_17, Language.JAVA_21, Language.PYTHON_3_13],
      title: "Multi-Language Contest",
    });
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.success(multiLanguageContest),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data?.languages).toEqual([
      Language.CPP_17,
      Language.JAVA_21,
      Language.PYTHON_3_13,
    ]);
    expect(state.data?.title).toBe("Multi-Language Contest");
  });

  it("should handle setting contest with different time periods", () => {
    const futureContest = makeContestMetadata({
      startAt: "2025-01-01T09:00:00Z",
      endAt: "2025-01-01T18:00:00Z",
      title: "Future Contest",
    });
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.success(futureContest),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data?.startAt).toBe("2025-01-01T09:00:00Z");
    expect(state.data?.endAt).toBe("2025-01-01T18:00:00Z");
    expect(state.data?.title).toBe("Future Contest");
  });

  it("should maintain contest metadata structure", () => {
    const contestMetadata = makeContestMetadata();
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.success(contestMetadata),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);

    // Verify all required fields are present
    expect(state.data).toHaveProperty("id");
    expect(state.data).toHaveProperty("slug");
    expect(state.data).toHaveProperty("title");
    expect(state.data).toHaveProperty("languages");
    expect(state.data).toHaveProperty("startAt");
    expect(state.data).toHaveProperty("endAt");

    // Verify types
    expect(typeof state.data?.id).toBe("string");
    expect(typeof state.data?.slug).toBe("string");
    expect(typeof state.data?.title).toBe("string");
    expect(Array.isArray(state.data?.languages)).toBe(true);
    expect(typeof state.data?.startAt).toBe("string");
    expect(typeof state.data?.endAt).toBe("string");
  });

  it("should set error and clear data on fail", () => {
    const stateWithData = {
      isLoading: false as const,
      error: null,
      data: makeContestMetadata(),
    };

    const error = new Error("Failed to load contest metadata");
    const state = contestMetadataSlice.reducer(
      stateWithData,
      contestMetadataSlice.actions.fail(error),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
    expect(state.data).toBe(null);
  });
});
