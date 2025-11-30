import { createSlice } from "@reduxjs/toolkit";

import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";

/**
 * Redux slice for the contest metadata.
 */
export const contestMetadataSlice = createSlice({
  name: "contestMetadata",
  initialState: null as unknown as ContestMetadataResponseDTO,
  reducers: {
    set(state, action: { payload: ContestMetadataResponseDTO }) {
      return action.payload;
    },
  },
});
