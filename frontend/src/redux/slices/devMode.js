import { createSlice } from "@reduxjs/toolkit";

const devModeSlice = createSlice({
  name: "devMode",
  initialState: {
    enabled: false,
  },
  reducers: {
    toggleDevMode: (state) => {
      state.enabled = !state.enabled;
    },
    setDevMode: (state, action) => {
      state.enabled = action.payload;
    },
  },
});

export const { toggleDevMode, setDevMode } = devModeSlice.actions;
export default devModeSlice.reducer;
