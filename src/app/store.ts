// Redux Toolkit 라이브러리 import
import { configureStore } from '@reduxjs/toolkit';
// Redux 슬라이스 리듀서들 import
import notesReducer from '../features/notes/notesSlice';
import tagsReducer from '../features/tags/tagsSlice';

// Redux 스토어 설정
// - 노트와 태그 상태를 관리하는 중앙 스토어
// - Redux DevTools 지원으로 개발 시 상태 디버깅 가능
export const store = configureStore({
  reducer: {
    notes: notesReducer, // 노트 관련 상태 관리
    tags: tagsReducer,   // 태그 관련 상태 관리
  },
  // 개발 환경에서 Redux DevTools 활성화
  // - 프로덕션에서는 비활성화하여 보안 강화
  devTools: process.env.NODE_ENV !== 'production',
});

// 스토어의 타입 추론을 위한 타입들
// - TypeScript에서 타입 안전성 보장
export type RootState = ReturnType<typeof store.getState>; // 전체 상태 타입
export type AppDispatch = typeof store.dispatch; // 디스패치 함수 타입
