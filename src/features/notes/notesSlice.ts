// Redux Toolkit 라이브러리 import
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
// Firebase API 함수들 import
import {
  fetchNotesAPI,
  addNoteAPI,
  deleteNoteAPI,
  updateNoteAPI
} from './notesAPI';
// 타입 import
import type { Note, CreateNoteData, UpdateNoteData, NotesState } from '../../types';
// 다국어 설정 import (에러 메시지용)
import i18n from '../../i18n';

// 노트 상태 초기값
// - 빈 노트 배열, 유휴 상태, 에러 없음으로 시작
const initialState: NotesState = {
  notes: [],
  status: 'idle',
  error: null,
};

// 비동기 Thunk 액션들
// - Firebase와의 비동기 통신을 위한 액션들

// 노트 목록 가져오기
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async () => {
    const response = await fetchNotesAPI();
    return response;
  }
);

// 새 노트 추가
export const addNewNote = createAsyncThunk(
  'notes/addNewNote',
  async (noteData: CreateNoteData) => {
    const response = await addNoteAPI(noteData);
    return response;
  }
);

// 노트 삭제
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId: string) => {
    await deleteNoteAPI(noteId);
    return noteId;
  }
);

// 노트 업데이트
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async (noteData: UpdateNoteData) => {
    const response = await updateNoteAPI(noteData);
    return response;
  }
);

// 노트 슬라이스
const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    // 로컬 상태 초기화
    clearNotes: (state) => {
      state.notes = [];
      state.status = 'idle';
      state.error = null;
    },
    // 에러 상태 초기화
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotes
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action: PayloadAction<Note[]>) => {
        state.status = 'succeeded';
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || i18n.t('message.loadNotesFailed');
      })

      // addNewNote
      .addCase(addNewNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addNewNote.fulfilled, (state, action: PayloadAction<Note>) => {
        state.status = 'succeeded';
        state.notes.unshift(action.payload); // 새 노트를 맨 앞에 추가
        state.error = null;
      })
      .addCase(addNewNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || i18n.t('message.createFailed');
      })

      // deleteNote
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.notes = state.notes.filter(note => note.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || i18n.t('message.deleteFailed');
      })

      // updateNote
      .addCase(updateNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action: PayloadAction<Note>) => {
        state.status = 'succeeded';
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || i18n.t('message.updateFailed');
      });
  },
});

// 액션 생성자들
export const { clearNotes, clearError } = notesSlice.actions;

// 선택자들
export const selectAllNotes = (state: { notes: NotesState }) => state.notes.notes;
export const selectNotesStatus = (state: { notes: NotesState }) => state.notes.status;
export const selectNotesError = (state: { notes: NotesState }) => state.notes.error;
export const selectNoteById = (state: { notes: NotesState }, noteId: string) =>
  state.notes.notes.find(note => note.id === noteId);

export default notesSlice.reducer;
