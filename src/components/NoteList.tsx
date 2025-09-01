import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchNotes, selectAllNotes, selectNotesStatus, selectNotesError } from '../features/notes/notesSlice';
import NoteCard from './NoteCard';
import type { Note } from '../types';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

const NoteList: React.FC = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  const status = useAppSelector(selectNotesStatus);
  const error = useAppSelector(selectNotesError);

  // 컴포넌트 마운트 시 노트 목록 불러오기
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotes());
    }
  }, [status, dispatch]);

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">노트를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-2">노트를 불러오는데 실패했습니다.</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchNotes())}
          className="btn-primary"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 노트가 없는 경우
  if (status === 'succeeded' && notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">아직 노트가 없습니다</h3>
        <p className="text-gray-500 text-center max-w-md">
          첫 번째 노트를 작성해보세요!<br />
          생각과 아이디어를 기록하고 정리할 수 있습니다.
        </p>
      </div>
    );
  }

  // 노트 목록 렌더링
  return (
    <div className="space-y-6">
      {notes.map((note: Note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};

export default NoteList;
