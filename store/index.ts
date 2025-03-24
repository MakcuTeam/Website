import { configureStore } from '@reduxjs/toolkit';
import discordReducer from './discordSlice';

const store = configureStore({
  reducer: {
    discord: discordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;