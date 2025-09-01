import { configureStore } from '@reduxjs/toolkit';
import notesReducer from '../features/notes/notesSlice';

// Redux 스토어 설정
export const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
  // 개발 환경에서 Redux DevTools 활성화
  devTools: process.env.NODE_ENV !== 'production',
});

// 스토어의 타입 추론을 위한 타입들
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
