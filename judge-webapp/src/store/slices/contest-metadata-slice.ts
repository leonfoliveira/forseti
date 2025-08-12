import { createSlice } from "@reduxjs/toolkit";

import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

import { useAppSelector } from "../store";

export const contestMetadataSlice = createSlice({
  name: "contestMetadata",
  initialState: null as unknown as ContestMetadataResponseDTO,
  reducers: {
    set: (state, action: { payload: ContestMetadataResponseDTO }) => {
      return action.payload;
    },
  },
});

export function useContestMetadata() {
  return useAppSelector((state) => state.contestMetadata);
}
