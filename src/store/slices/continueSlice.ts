import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContinueWatchingItem } from "@/types";

interface ContinueState {
  items: ContinueWatchingItem[];
}

const initialState: ContinueState = {
  items: [],
};

export const continueSlice = createSlice({
  name: "continue",
  initialState,
  reducers: {
    addContinueWatching: (state, action: PayloadAction<ContinueWatchingItem>) => {
      const idx = state.items.findIndex(
        (i) =>
          i.slug === action.payload.slug &&
          i.seasonNumber === action.payload.seasonNumber &&
          i.episodeNumber === action.payload.episodeNumber
      );
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.push(action.payload);
      }
      state.items.sort((a, b) => b.updatedAt - a.updatedAt);
      state.items = state.items.slice(0, 50);
    },
    removeContinueWatching: (state, action: PayloadAction<{ slug: string }>) => {
      state.items = state.items.filter((i) => i.slug !== action.payload.slug);
    },
    loadContinueWatching: (state, action: PayloadAction<ContinueWatchingItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addContinueWatching, removeContinueWatching, loadContinueWatching } = continueSlice.actions;
export default continueSlice.reducer;
