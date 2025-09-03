import { useState, Suspense, lazy } from 'react';
import type { Note } from '../types';
import { useAppDispatch } from '../app/hooks';
import { useLanguage } from '../app/hooks/useLanguage';
import { deleteNote, updateNote } from '../features/notes/notesSlice';
import { Edit, Trash2, Calendar, Pin, Archive, ArchiveRestore, RotateCcw, CheckSquare, Square } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { format, register } from 'timeago.js';
import ko from 'timeago.js/lib/lang/ko';
import en from 'timeago.js/lib/lang/en_US';

// 짧은 형태의 영문 로케일 정의
const enShort = (_number: number, index: number) => [
  ['just now', 'right now'],
  ['%ss ago', 'in %ss'],
  ['1m ago', 'in 1m'],
  ['%sm ago', 'in %sm'],
  ['1h ago', 'in 1h'],
  ['%sh ago', 'in %sh'],
  ['1d ago', 'in 1d'],
  ['%sd ago', 'in %sd'],
  ['1w ago', 'in 1w'],
  ['%sw ago', 'in %sw'],
  ['1mo ago', 'in 1mo'],
  ['%smo ago', 'in %smo'],
  ['1y ago', 'in 1y'],
  ['%sy ago', 'in %sy'],
][index] as [string, string];

// 지연 로딩을 위한 NoteModal
const NoteModal = lazy(() => import('./NoteModal'));

interface NoteCardProps {
  note: Note;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isSelectionMode = false, isSelected = false, onSelectionToggle }) => {
  const dispatch = useAppDispatch();
  const { t, currentLanguage } = useLanguage();

  // timeago.js에 언어별 로케일 등록
  register('ko', ko);
  register('en', en);
  register('en_short', enShort);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; mode: 'view' | 'edit' }>({ isOpen: false, mode: 'view' });
  
  // Confirm 모달 관련 상태
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

    // 노트 삭제 처리 (trash로 이동 또는 완전 삭제)
  const handleDelete = () => {
    if (note.deleted) {
      // 이미 trash에 있는 경우 - 완전 삭제
      setConfirmModal({
        isOpen: true,
        title: t('modal.title.permanentDelete'),
        message: t('message.permanentDeleteConfirm'),
        variant: 'danger',
        onConfirm: async () => {
          try {
            await dispatch(deleteNote(note.id)).unwrap();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
            console.error(t('error.permanentDeleteFailed'), error);
            setConfirmModal({
              isOpen: true,
              title: t('error.deleteFailed'),
              message: t('error.retryMessage'),
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
    } else {
      // 일반 노트인 경우 - trash로 이동
      setConfirmModal({
        isOpen: true,
        title: t('modal.title.moveToTrash'),
        message: t('message.moveToTrash'),
        variant: 'warning',
        onConfirm: async () => {
          try {
            await dispatch(updateNote({
              id: note.id,
              deleted: true
              // pinned 상태는 trash에서도 유지
            })).unwrap();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
            console.error(t('error.deleteFailed'), error);
            setConfirmModal({
              isOpen: true,
              title: t('error.deleteFailed'),
              message: t('error.retryMessage'),
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
    }
  };

  // 노트 Archive/Archive 해제 처리
  const handleArchive = () => {
    const title = note.archived ? t('modal.title.unarchiveNote') : t('modal.title.archiveNote');
    const message = note.archived ? t('message.unarchiveConfirm') : t('message.archiveConfirm');
    
    setConfirmModal({
      isOpen: true,
      title,
      message,
      variant: 'info',
      onConfirm: async () => {
        try {
          await dispatch(updateNote({
            id: note.id,
            archived: !note.archived
            // pinned 상태는 Archive/Archive 해제와 무관하게 유지
          })).unwrap();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.archiveFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('error.archiveFailed'),
            message: t('error.retryMessage'),
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

  // 노트 복원 처리 (trash에서 일반 노트로)
  const handleRestore = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal.title.restoreNote'),
      message: t('message.restoreConfirm'),
      variant: 'success',
      onConfirm: async () => {
        try {
          await dispatch(updateNote({
            id: note.id,
            deleted: false
          })).unwrap();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.restoreFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('error.restoreFailed'),
            message: t('error.retryMessage'),
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

  // 노트 고정/고정 해제 처리
  const handlePin = () => {
    const title = note.pinned ? t('modal.title.unpinNote') : t('modal.title.pinNote');
    const message = note.pinned ? t('message.unpinConfirm') : t('message.pinConfirm');
    
    setConfirmModal({
      isOpen: true,
      title,
      message,
      variant: 'info',
      onConfirm: async () => {
        try {
          await dispatch(updateNote({
            id: note.id,
            pinned: !note.pinned
          })).unwrap();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(t('error.pinFailed'), error);
          setConfirmModal({
            isOpen: true,
            title: t('error.pinFailed'),
            message: t('error.retryMessage'),
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

  // 편집 모달 열기
  const openInViewMode = () => setModalConfig({ isOpen: true, mode: 'view' });
  const openInEditMode = () => setModalConfig({ isOpen: true, mode: 'edit' });

  // 날짜 포맷팅 (timeago.js 활용)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // 현재 시간과의 차이 계산
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      // 7일 이내면 timeago.js로 상대적 시간 표시, 그 외에는 절대 날짜 표시
      if (diffInDays <= 7) {
        const locale = currentLanguage === 'en' ? 'en_short' : currentLanguage;
        return format(date, locale);
      } else {
        // 7일 초과시 절대 날짜 표시 (현재 언어에 맞는 형식)
        const userLocale = currentLanguage === 'ko' ? 'ko-KR' : 'en-US';
        const dateOptions: Intl.DateTimeFormatOptions = {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        };
        return date.toLocaleDateString(userLocale, dateOptions);
      }
    } catch (error) {
      console.error(t('error.dateFormatFailed'), error);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      
      // timeago.js로 현재 언어에 맞는 상대적 시간 표시
      // 영문의 경우 짧은 형태 사용
      const locale = currentLanguage === 'en' ? 'en_short' : currentLanguage;
      return format(date, locale);
    } catch (error) {
      console.error(t('error.timeFormatFailed'), error);
      return 'Invalid Time';
    }
  };

  // 우선순위 텍스트 변환 (다국어)
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return t('label.priority.low');
      case 'medium': return t('label.priority.medium');
      case 'high': return t('label.priority.high');
      default: return t('label.priority.medium');
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border overflow-hidden flex flex-col ${isSelectionMode && isSelected
          ? 'selected' 
          : 'border-gray-100'
      }`}
      style={{ 
        backgroundColor: isSelectionMode && isSelected ? '#eff6ff' : note.backgroundColor,
        minHeight: '200px'
      }}
    >
      <div className="p-3 space-y-2 flex-1 flex flex-col cursor-pointer" onClick={openInViewMode}>
        {/* 상단: 선택 체크박스 + 제목(왼쪽) + 우선순위 + 압정아이콘(오른쪽) */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1 mr-3">
            {isSelectionMode && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelectionToggle?.(note.id); }}
                className="p-1 rounded transition-colors duration-200 hover:bg-gray-100"
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">
              {note.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(note.priority)}`}>
              {getPriorityText(note.priority)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); if (!note.deleted) handlePin(); }}
              disabled={note.deleted}
              className={`p-1 rounded transition-colors duration-200 ${note.deleted
                  ? 'text-gray-300 cursor-not-allowed' // trash에서는 비활성화
                  : note.pinned 
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title={note.deleted ? t('message.untagged') : (note.pinned ? t('button.deselect') : t('button.select'))}
            >
              <Pin 
                className="w-4 h-4" 
                fill={note.pinned ? "currentColor" : "none"} 
              />
            </button>
          </div>
        </div>

        {/* 중앙: 노트 내용 */}
        <div className="text-gray-700 leading-relaxed flex-1">
          <p className="line-clamp-2 whitespace-pre-wrap text-xs">
            {note.content}
          </p>
        </div>

        {/* 태그 섹션 */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 flex-shrink-0">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 하단: 날짜/시간(왼쪽) + 액션 버튼들(오른쪽) */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="flex items-center space-x-1 min-w-0">
              <Calendar size={14} className="flex-shrink-0" />
              <span className="truncate">{t('label.createdAt')}: {formatDate(note.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 min-w-0">
              <span className="flex-shrink-0">•</span>
              <span className="truncate">{t('label.updatedAt')}: {formatTime(note.updatedAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {note.deleted ? (
              // Trash에 있는 노트의 버튼들
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRestore(); }}
                  className="p-1 text-gray-700 bg-gray-50 border border-gray-200 rounded transition-colors duration-200 hover:bg-gray-100"
                  title={t('button.restore')}
                >
                  <RotateCcw size={14} />
                </button>
                                 <button
                   onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                   className="p-1 text-gray-700 bg-gray-50 border border-gray-200 rounded transition-colors duration-200 hover:bg-gray-100"
                  title={t('modal.title.permanentDelete')}
                 >
                   <Trash2 size={14} />
                 </button>
              </>
            ) : (
              // 일반 노트의 버튼들
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); openInEditMode(); }}
                  className="p-1 text-gray-700 bg-gray-50 border border-gray-200 rounded transition-colors duration-200 hover:bg-gray-100"
                  title={t('button.edit')}
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  className="p-1 text-gray-700 bg-gray-50 border border-gray-200 rounded transition-colors duration-200 hover:bg-gray-100"
                  title={t('button.delete')}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleArchive(); }}
                  className="p-1 text-gray-700 bg-gray-50 border border-gray-200 rounded transition-colors duration-200 hover:bg-gray-100"
                  title={note.archived ? t('button.restore') : t('button.archive')}
                >
                  {note.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 편집 모달 */}
      <Suspense fallback={null}>
        <NoteModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig({ isOpen: false, mode: 'view' })}
          mode={modalConfig.mode}
          note={note}
          isReadOnly={note.deleted}
        />
      </Suspense>

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
    </div>
  );
};

export default NoteCard;



