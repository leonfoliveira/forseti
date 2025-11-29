import { createSlice } from "@reduxjs/toolkit";

import { ContestMetadataResponseDTO } from "@/core/port/driven/repository/dto/response/contest/ContestMetadataResponseDTO";

export const contestMetadataSlice = createSlice({
  name: "contestMetadata",
  initialState: null as unknown as ContestMetadataResponseDTO,
  reducers: {
    set(state, action: { payload: ContestMetadataResponseDTO }) {
      return action.payload;
    },
  },
});
