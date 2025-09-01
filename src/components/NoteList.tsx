import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchNotes, selectAllNotes, selectNotesStatus, selectNotesError } from '../features/notes/notesSlice';
import NoteCard from './NoteCard';
import type { Note } from '../types';
import { Loader2, AlertCircle, FileText, Pin, SortAsc, SortDesc } from 'lucide-react';

interface NoteListProps {
  selectedTag: string | null;
  currentView: 'notes' | 'archive' | 'trash';
  searchTerm: string;
}

const NoteList: React.FC<NoteListProps> = ({ selectedTag, currentView, searchTerm }) => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  const status = useAppSelector(selectNotesStatus);
  const error = useAppSelector(selectNotesError);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 컴포넌트 마운트 시 노트 목록 불러오기
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotes());
    }
  }, [status, dispatch]);

  // 노트 필터링 및 정렬
  const getFilteredAndSortedNotes = () => {
    let filteredNotes = notes.filter(note => {
      // 뷰별 필터링 (삭제된 노트는 trash에만 표시)
      if (currentView === 'archive' && (!note.archived || note.deleted)) return false;
      if (currentView === 'trash' && !note.deleted) return false;
      if (currentView === 'notes' && (note.archived || note.deleted)) return false;

      // 태그별 필터링 (trash에서는 태그 필터링 적용 안함)
      if (currentView !== 'trash') {
        if (selectedTag === 'untagged') {
          return note.tags.length === 0;
        } else if (selectedTag) {
          return note.tags.some(tag => tag.name === selectedTag);
        }
      }

      // 검색어 필터링
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return note.title.toLowerCase().includes(searchLower) || 
               note.content.toLowerCase().includes(searchLower);
      }

      return true;
    });

    // 고정된 노트를 먼저 표시하고, 그 다음 날짜순 정렬
    filteredNotes.sort((a, b) => {
      // 고정 상태가 다르면 고정된 노트를 먼저
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // 고정 상태가 같으면 날짜순 정렬
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filteredNotes;
  };

  const filteredNotes = getFilteredAndSortedNotes();

  // 고정된 노트와 일반 노트 분리
  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const regularNotes = filteredNotes.filter(note => !note.pinned);

  // 정렬 순서 토글
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

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
  if (status === 'succeeded' && filteredNotes.length === 0) {
    const emptyMessage = selectedTag 
      ? `"${selectedTag}" 태그의 노트가 없습니다.`
      : currentView === 'archive' 
        ? '보관된 노트가 없습니다.'
        : currentView === 'trash'
          ? '휴지통이 비어있습니다.'
          : '노트가 없습니다.';

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 text-center max-w-md">
          {currentView === 'notes' && '새로운 노트를 작성해보세요!'}
        </p>
      </div>
    );
  }

  // 노트 목록 렌더링
  return (
    <div className="space-y-6">
      {/* 상단 헤더 - 정렬 버튼 */}
      {filteredNotes.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={toggleSortOrder}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors duration-200 flex items-center gap-1"
          >
            {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
            정렬
          </button>
        </div>
      )}

      {/* 고정된 노트 섹션 */}
      {pinnedNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="w-5 h-5 text-red-500" fill="currentColor" />
            <h2 className="text-lg font-semibold text-gray-800">
              Pinned {currentView === 'archive' ? 'Archived' : currentView === 'trash' ? 'Trash' : 'Notes'} ({pinnedNotes.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note: Note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* 일반 노트 섹션 */}
      {regularNotes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {currentView === 'notes' ? 'All Notes' : currentView === 'archive' ? 'Archived Notes' : 'Trash'} 
            ({regularNotes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNotes.map((note: Note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;
