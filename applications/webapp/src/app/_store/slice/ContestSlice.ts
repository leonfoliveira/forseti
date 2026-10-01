import { createSlice } from "@reduxjs/toolkit";

import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";

/**
 * Redux slice for the contest.
 */
export const ContestSlice = createSlice({
  name: "contest",
  initialState: null as unknown as ContestResponseDTO,
  reducers: {
    set(state, action: { payload: ContestResponseDTO }) {
      return action.payload;
    },
  },
});
