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

  it("should set contest metadata when payload is provided", () => {
    const initialState = null;
    const contestMetadata = makeContestMetadata();
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.set(contestMetadata),
    );
    expect(state).toEqual(contestMetadata);
    expect(state?.title).toBe("Test Contest");
    expect(state?.slug).toBe("test-contest");
    expect(state?.languages).toEqual([Language.CPP_17, Language.JAVA_21]);
  });

  it("should replace existing contest metadata with new one", () => {
    const oldContest = makeContestMetadata({
      title: "Old Contest",
      slug: "old-contest",
      id: "old-123",
    });
    const newContest = makeContestMetadata({
      title: "New Contest",
      slug: "new-contest",
      id: "new-123",
    });

    const state = contestMetadataSlice.reducer(
      oldContest,
      contestMetadataSlice.actions.set(newContest),
    );
    expect(state?.title).toBe("New Contest");
    expect(state?.slug).toBe("new-contest");
    expect(state?.id).toBe("new-123");
  });

  it("should handle setting contest with different languages", () => {
    const initialState = null;
    const contestWithPython = makeContestMetadata({
      languages: [Language.PYTHON_3_13],
      title: "Python Contest",
    });
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.set(contestWithPython),
    );
    expect(state?.languages).toEqual([Language.PYTHON_3_13]);
    expect(state?.title).toBe("Python Contest");
  });

  it("should handle setting contest with multiple languages", () => {
    const initialState = null;
    const multiLanguageContest = makeContestMetadata({
      languages: [Language.CPP_17, Language.JAVA_21, Language.PYTHON_3_13],
      title: "Multi-Language Contest",
    });
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.set(multiLanguageContest),
    );
    expect(state?.languages).toEqual([
      Language.CPP_17,
      Language.JAVA_21,
      Language.PYTHON_3_13,
    ]);
    expect(state?.title).toBe("Multi-Language Contest");
  });

  it("should handle setting contest with different time periods", () => {
    const initialState = null;
    const futureContest = makeContestMetadata({
      startAt: "2025-01-01T09:00:00Z",
      endAt: "2025-01-01T18:00:00Z",
      title: "Future Contest",
    });
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.set(futureContest),
    );
    expect(state?.startAt).toBe("2025-01-01T09:00:00Z");
    expect(state?.endAt).toBe("2025-01-01T18:00:00Z");
    expect(state?.title).toBe("Future Contest");
  });

  it("should maintain contest metadata structure", () => {
    const initialState = null;
    const contestMetadata = makeContestMetadata();
    const state = contestMetadataSlice.reducer(
      initialState,
      contestMetadataSlice.actions.set(contestMetadata),
    );

    // Verify all required fields are present
    expect(state).toHaveProperty("id");
    expect(state).toHaveProperty("slug");
    expect(state).toHaveProperty("title");
    expect(state).toHaveProperty("languages");
    expect(state).toHaveProperty("startAt");
    expect(state).toHaveProperty("endAt");

    // Verify types
    expect(typeof state?.id).toBe("string");
    expect(typeof state?.slug).toBe("string");
    expect(typeof state?.title).toBe("string");
    expect(Array.isArray(state?.languages)).toBe(true);
    expect(typeof state?.startAt).toBe("string");
    expect(typeof state?.endAt).toBe("string");
  });
});
