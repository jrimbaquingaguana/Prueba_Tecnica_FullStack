import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'auto' // 'auto', 'light', 'dark'
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      // Aplica inmediatamente al HTML
      if (state.mode === 'auto') {
        const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        document.documentElement.setAttribute('data-theme', darkMediaQuery.matches ? 'dark' : 'light');
        darkMediaQuery.addEventListener('change', () => {
          document.documentElement.setAttribute('data-theme', darkMediaQuery.matches ? 'dark' : 'light');
        });
      } else {
        document.documentElement.setAttribute('data-theme', state.mode);
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
