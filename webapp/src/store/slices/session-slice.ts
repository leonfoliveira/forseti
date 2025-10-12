import { createSlice } from "@reduxjs/toolkit";

import { SessionResponseDTO } from "@/core/repository/dto/response/session/SessionResponseDTO";

export const sessionSlice = createSlice({
  name: "session",
  initialState: null as SessionResponseDTO | null,
  reducers: {
    set(state, action: { payload: SessionResponseDTO | null }) {
      return action.payload;
    },
  },
});
