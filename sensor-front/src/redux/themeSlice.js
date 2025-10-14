import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: localStorage.getItem('theme') || 'dark', // 🔹 modo oscuro por defecto
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;

      // 🌙 Aplica el tema directamente al <html>
      document.documentElement.setAttribute('data-theme', state.mode);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
