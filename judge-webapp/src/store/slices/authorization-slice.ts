import { createSlice } from "@reduxjs/toolkit";

import { Authorization } from "@/core/domain/model/Authorization";

import { useAppSelector } from "../store";

type AuthorizationState =
  | { isLoading: true; error: null; data: null }
  | { isLoading: false; error: null; data: Authorization | null }
  | { isLoading: false; error: Error; data: null };

export const authorizationSlice = createSlice({
  name: "authorization",
  initialState: {
    isLoading: true,
    error: null,
    data: null,
  } as AuthorizationState,
  reducers: {
    success: (state, action: { payload: Authorization | null }) => {
      state.isLoading = false;
      state.error = null;
      state.data = action.payload;
    },
    fail: (state, action: { payload: Error }) => {
      state.isLoading = false;
      state.error = action.payload;
      state.data = null;
    },
    reset: (state) => {
      state.isLoading = true;
      state.error = null;
      state.data = null;
    },
  },
});

export function useAuthorization() {
  return useAppSelector((state) => state.authorization.data);
}
