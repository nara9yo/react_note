import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { useLanguage } from '../app/hooks/useLanguage';
import { fetchNotes, selectAllNotes, selectNotesStatus, selectNotesError, updateNote, deleteNote } from '../features/notes/notesSlice';
import NoteCard from './NoteCard';
import ConfirmModal from './ConfirmModal';
import SortModal from './SortModal';
import type { Note, SortOptions } from '../types';
import { Loader2, AlertCircle, FileText, Pin, SortAsc, CheckSquare, Square, RotateCcw, Trash2, ArchiveRestore, Archive } from 'lucide-react';

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
  const { t } = useLanguage();
  // localStorage에서 정렬 옵션 불러오기
  const getInitialSortOptions = (): SortOptions => {
    try {
      const saved = localStorage.getItem('noteSortOptions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 유효한 정렬 옵션인지 검증
        if (parsed && typeof parsed === 'object') {
          const validPriority = ['low-to-high', 'high-to-low', null].includes(parsed.priority);
          const validDate = ['created', 'edited'].includes(parsed.date);
          if (validPriority && validDate) {
            return parsed;
          }
        }
      }
    } catch (error) {
      console.error(t('error.sortOptionLoadFailed'), error);
    }
    // 기본값 반환
    return {
      priority: null,
      date: 'created'
    };
  };

  const [sortOptions, setSortOptions] = useState<SortOptions>(getInitialSortOptions);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Confirm 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
    type?: 'alert' | 'confirm';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    type: 'confirm',
    onConfirm: () => { }
  });

  // 컴포넌트 마운트 시 노트 목록 불러오기
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotes());
    }
  }, [status, dispatch]);

  // 노트 필터링 및 정렬
  const getFilteredAndSortedNotes = () => {
    const filteredNotes = notes.filter(note => {
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

    // 고정된 노트를 먼저 표시하고, 그 다음 정렬 옵션에 따라 정렬
    filteredNotes.sort((a, b) => {
      // 고정 상태가 다르면 고정된 노트를 먼저
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // 고정 상태가 같으면 정렬 옵션에 따라 정렬
      
      // 1. 우선순위 정렬이 선택된 경우
      if (sortOptions.priority) {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        
        if (sortOptions.priority === 'low-to-high') {
          if (priorityA !== priorityB) return priorityA - priorityB;
        } else {
          if (priorityA !== priorityB) return priorityB - priorityA;
        }
      }
      
      // 2. 날짜 정렬
      let dateA: number, dateB: number;
      
      switch (sortOptions.date) {
        case 'created':
          dateA = new Date(a.createdAt).getTime();
          dateB = new Date(b.createdAt).getTime();
          break;
        case 'edited':
          dateA = new Date(a.updatedAt).getTime();
          dateB = new Date(b.updatedAt).getTime();
          break;
        default:
          dateA = new Date(a.createdAt).getTime();
          dateB = new Date(b.createdAt).getTime();
          break;
      }
      
      return dateB - dateA; // 최신순 정렬
    });

    return filteredNotes;
  };

  const filteredNotes = getFilteredAndSortedNotes();

  // 고정된 노트와 일반 노트 분리
  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const regularNotes = filteredNotes.filter(note => !note.pinned);

  // 정렬 모달 열기
  const openSortModal = () => {
    setIsSortModalOpen(true);
  };

  // 정렬 옵션 변경 및 localStorage 저장
  const handleSortOptionsChange = (options: SortOptions) => {
    setSortOptions(options);
    
    // localStorage에 정렬 옵션 저장
    try {
      localStorage.setItem('noteSortOptions', JSON.stringify(options));
    } catch (error) {
      console.error(t('error.sortOptionSaveFailed'), error);
    }
  };

  // 선택 모드 토글
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotes([]);
  };

  // 노트 선택/해제
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedNotes.length === filteredNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(filteredNotes.map(note => note.id));
    }
  };

  // 선택된 노트 복구
  const handleRestoreSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.restoreNotes'),
      message: t('message.restoreNotesConfirm', { count: selectedNotes.length }),
      variant: 'success',
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedNotes.map(noteId => 
              dispatch(updateNote({ id: noteId, deleted: false })).unwrap()
            )
          );
          setSelectedNotes([]);
          setIsSelectionMode(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.noteRestoreFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('modal.title.restoreFailed'),
            message: t('message.restoreFailed'),
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
        }
      }
    });
  };

  // 선택된 노트 완전 삭제 (Trash용)
  const handleDeleteSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.permanentDeleteNotes'),
      message: t('message.permanentDeleteNotesConfirm', { count: selectedNotes.length }),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedNotes.map(noteId => 
              dispatch(deleteNote(noteId)).unwrap()
            )
          );
          setSelectedNotes([]);
          setIsSelectionMode(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.deleteFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('modal.title.deleteFailed'),
            message: t('message.deleteFailed'),
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 선택된 노트 Trash로 이동 (Archive용)
  const handleMoveToTrashSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.moveToTrashNotes'),
      message: t('message.moveToTrashNotesConfirm', { count: selectedNotes.length }),
      variant: 'warning',
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedNotes.map(noteId => 
              dispatch(updateNote({ id: noteId, deleted: true })).unwrap()
            )
          );
          setSelectedNotes([]);
          setIsSelectionMode(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.noteTrashMoveFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('modal.title.moveFailed'),
            message: t('message.moveFailed'),
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 선택된 노트 Archive 해제 (Archive용)
  const handleUnarchiveSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.unarchiveNotes'),
      message: t('message.unarchiveNotesConfirm', { count: selectedNotes.length }),
      variant: 'info',
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedNotes.map(noteId => 
              dispatch(updateNote({ id: noteId, archived: false })).unwrap()
            )
          );
          setSelectedNotes([]);
          setIsSelectionMode(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.noteUnarchiveFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('modal.title.unarchiveFailed'),
            message: t('message.unarchiveFailed'),
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Notes 뷰에서 보관 처리
  const handleArchiveSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.archiveNotes'),
      message: t('message.archiveNotesConfirm', { count: selectedNotes.length }),
      variant: 'info',
      onConfirm: async () => {
        try {
          for (const noteId of selectedNotes) {
            await dispatch(updateNote({
              id: noteId,
              archived: true
            })).unwrap();
          }
          setSelectedNotes([]);
          setIsSelectionMode(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.noteArchiveFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('modal.title.archiveFailed'),
            message: t('message.archiveFailed'),
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Notes 뷰에서 삭제 처리 (Trash로 이동)
  const handleDeleteFromNotes = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.deleteNotes'),
      message: t('message.deleteNotesConfirm', { count: selectedNotes.length }),
      variant: 'warning',
      onConfirm: async () => {
        try {
          for (const noteId of selectedNotes) {
            await dispatch(updateNote({
              id: noteId,
              deleted: true
            })).unwrap();
          }
          setSelectedNotes([]);
          setIsSelectionMode(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.deleteFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('modal.title.deleteFailed'),
            message: t('message.deleteFailed'),
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue animate-spin mb-4" />
        <p className="text-gray-600">{t('message.loadingNotes')}</p>
      </div>
    );
  }

  // 에러 상태
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-2">{t('message.loadNotesFailed')}</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchNotes())}
          className="btn-primary"
        >
          {t('button.retry')}
        </button>
      </div>
    );
  }

  // 노트가 없는 경우
  if (status === 'succeeded' && filteredNotes.length === 0) {
    const emptyMessage = selectedTag 
      ? `"${selectedTag}" ${t('message.noNotes')}`
      : currentView === 'archive' 
        ? t('message.noNotes')
        : currentView === 'trash'
          ? t('message.noNotes')
          : t('message.noNotes');

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 text-center max-w-md">
          {currentView === 'notes' && t('menu.newNote')}
        </p>
      </div>
    );
  }

  // 노트 목록 렌더링
  return (
    <div className="space-y-6">
      {/* 상단 헤더 - 정렬 버튼 및 선택 모드 버튼 */}
      {filteredNotes.length > 0 && (
        <div className="flex justify-between items-center">
                     {/* 모든 뷰에서 선택 모드 버튼 표시 */}
           {(currentView === 'trash' || currentView === 'archive' || currentView === 'notes') && (
            <div className="flex items-center gap-2">
              {isSelectionMode ? (
                <>
                                     <button
                     onClick={toggleSelectAll}
                     className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100"
                   >
                     {selectedNotes.length === filteredNotes.length ? <CheckSquare size={14} /> : <Square size={14} />}
                    {selectedNotes.length === filteredNotes.length ? t('button.clearSelection') : t('button.selectAll')}
                   </button>
                  <button
                    onClick={toggleSelectionMode}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors duration-200"
                  >
                    {t('button.cancel')}
                  </button>
                </>
              ) : (
                                 <button
                   onClick={toggleSelectionMode}
                   className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm hover:bg-gray-100 transition-colors duration-200 flex items-center gap-1"
                 >
                   <CheckSquare size={14} />
                  {t('button.select')}
                 </button>
              )}
              
                             {/* 선택된 노트가 있을 때 액션 버튼들 */}
               {isSelectionMode && selectedNotes.length > 0 && (
                 <div className="flex items-center gap-2">
                   {currentView === 'trash' ? (
                     <>
                       <button
                         onClick={handleRestoreSelected}
                         className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors duration-200 flex items-center gap-1"
                       >
                         <RotateCcw size={14} />
                        {t('button.restoreWithCount', { count: selectedNotes.length })}
                       </button>
                       <button
                         onClick={handleDeleteSelected}
                         className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors duration-200 flex items-center gap-1"
                       >
                         <Trash2 size={14} />
                        {t('button.deleteWithCount', { count: selectedNotes.length })}
                       </button>
                     </>
                                       ) : currentView === 'archive' ? (
                      <>
                                                 <button
                           onClick={handleUnarchiveSelected}
                           className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100"
                         >
                           <ArchiveRestore size={14} />
                        {t('button.unarchiveWithCount', { count: selectedNotes.length })}
                         </button>
                        <button
                          onClick={handleMoveToTrashSelected}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors duration-200 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                        {t('button.moveToTrashWithCount', { count: selectedNotes.length })}
                        </button>
                      </>
                    ) : currentView === 'notes' ? (
                      <>
                                                 <button
                           onClick={handleArchiveSelected}
                           className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100"
                         >
                           <Archive size={14} />
                        {t('button.archiveWithCount', { count: selectedNotes.length })}
                         </button>
                         <button
                           onClick={handleDeleteFromNotes}
                           className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100"
                         >
                           <Trash2 size={14} />
                        {t('button.deleteWithCount', { count: selectedNotes.length })}
                         </button>
                      </>
                    ) : null}
                 </div>
               )}
            </div>
          )}
          
          <button
            onClick={openSortModal}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors duration-200 flex items-center gap-1"
          >
            <SortAsc size={14} />
            {t('menu.sort')}
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
          <div className="grid grid-cols-1 gap-4" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {pinnedNotes.map((note: Note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isSelectionMode={isSelectionMode}
                isSelected={selectedNotes.includes(note.id)}
                onSelectionToggle={toggleNoteSelection}
                maxContentLines={4}
              />
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
          <div className="grid grid-cols-1 gap-4" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {regularNotes.map((note: Note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isSelectionMode={isSelectionMode}
                isSelected={selectedNotes.includes(note.id)}
                onSelectionToggle={toggleNoteSelection}
                maxContentLines={4}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirm 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 정렬 모달 */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        sortOptions={sortOptions}
        onSortOptionsChange={handleSortOptionsChange}
      />
    </div>
  );
};

export default NoteList;
