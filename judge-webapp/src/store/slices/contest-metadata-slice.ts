import { createSlice } from "@reduxjs/toolkit";

import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

import { useAppSelector } from "../store";

type ContestMetadataState =
  | { isLoading: true; error: null; data: null }
  | { isLoading: false; error: null; data: ContestMetadataResponseDTO }
  | { isLoading: false; error: Error; data: null };

export const contestMetadataSlice = createSlice({
  name: "contestMetadata",
  initialState: {
    isLoading: true,
    error: null,
    data: null,
  } as ContestMetadataState,
  reducers: {
    success: (state, action: { payload: ContestMetadataResponseDTO }) => {
      state.isLoading = false;
      state.error = null;
      state.data = action.payload;
    },
    fail: (state, action: { payload: Error }) => {
      state.isLoading = false;
      state.error = action.payload;
      state.data = null;
    },
  },
});

export function useContestMetadata() {
  return useAppSelector((state) => state.contestMetadata.data!);
}
