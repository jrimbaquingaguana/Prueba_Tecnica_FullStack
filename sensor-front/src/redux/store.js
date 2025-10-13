import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import sensorsReducer from './sensorsSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sensors: sensorsReducer,
    theme: themeReducer,
  },
});
