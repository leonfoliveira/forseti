import { Authorization } from "@/core/domain/model/Authorization";
import { createSlice } from "@reduxjs/toolkit";
import { useAppSelector } from "../store";

export const authorizationSlice = createSlice({
  name: "authorization",
  initialState: null as Authorization | null,
  reducers: {
    set: (state, action: { payload: Authorization | null }) => {
      return action.payload;
    },
  },
});

export function useAuthorization() {
  return useAppSelector((state) => state.authorization);
}
