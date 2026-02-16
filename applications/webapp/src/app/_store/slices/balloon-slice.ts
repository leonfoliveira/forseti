import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export type BalloonType = {
  id: string;
  color: string;
};

export const balloonSlice = createSlice({
  name: "balloon",
  initialState: [] as BalloonType[],
  reducers: {
    addBalloon: (state, action: { payload: Omit<BalloonType, "id"> }) => {
      state.push({ ...action.payload, id: uuidv4() });
    },
    removeBalloon: (state, action: { payload: { id: string } }) => {
      return state.filter((balloon) => balloon.id !== action.payload.id);
    },
  },
});
