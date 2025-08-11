import { createSlice } from "@reduxjs/toolkit";

import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

import { useAppSelector } from "../store";

export const contestSlice = createSlice({
  name: "contest",
  initialState: null as ContestMetadataResponseDTO | null,
  reducers: {
    set: (state, action: { payload: ContestMetadataResponseDTO }) => {
      return action.payload;
    },
  },
});

export function useContest() {
  return useAppSelector((state) => state.contest);
}
