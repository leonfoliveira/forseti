import { createSlice } from "@reduxjs/toolkit";

import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

/**
 * Redux slice for the session data.
 */
export const SessionSlice = createSlice({
  name: "session",
  initialState: null as SessionResponseDTO | null,
  reducers: {
    set(state, action: { payload: SessionResponseDTO | null }) {
      return action.payload;
    },
    clear() {
      return null;
    },
  },
});
