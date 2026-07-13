import { createSlice } from "@reduxjs/toolkit";

interface SearchState {
  isOpen: boolean;
  query: string;
  type: "all" | "movie" | "series";
}

const initialState: SearchState = {
  isOpen: false,
  query: "",
  type: "all",
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    openSearch: (state) => { state.isOpen = true; },
    closeSearch: (state) => { state.isOpen = false; },
    setQuery: (state, action) => { state.query = action.payload; },
    setType: (state, action) => { state.type = action.payload; },
  },
});

export const { openSearch, closeSearch, setQuery, setType } = searchSlice.actions;
export default searchSlice.reducer;
