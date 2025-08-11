import { Authorization } from "@/core/domain/model/Authorization";
import { createSlice } from "@reduxjs/toolkit";
import { useAppSelector } from "../store";

export const authorizationSlice = createSlice({
  name: "authorization",
  initialState: undefined as Authorization | undefined,
  reducers: {
    set: (state, action: { payload: Authorization | undefined }) => {
      state = action.payload;
    },
  },
});

export function useAuthorization() {
  return useAppSelector((state) => state.authorization);
}
