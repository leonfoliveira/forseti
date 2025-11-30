import { createSlice } from "@reduxjs/toolkit";

import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

/**
 * Redux slice for the session data.
 */
export const sessionSlice = createSlice({
  name: "session",
  initialState: null as SessionResponseDTO | null,
  reducers: {
    set(state, action: { payload: SessionResponseDTO | null }) {
      return action.payload;
    },
  },
});
