import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export type BallonType = {
  id: string;
  color: string;
};

export const balloonSlice = createSlice({
  name: "balloon",
  initialState: [] as BallonType[],
  reducers: {
    addBallon: (state, action: { payload: Omit<BallonType, "id"> }) => {
      state.push({ ...action.payload, id: uuidv4() });
    },
    removeBallon: (state, action: { payload: { id: string } }) => {
      return state.filter((ballon) => ballon.id !== action.payload.id);
    },
  },
});
