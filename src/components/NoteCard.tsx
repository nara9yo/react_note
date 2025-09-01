import { useState, Suspense, lazy } from 'react';
import type { Note } from '../types';
import { useAppDispatch } from '../app/hooks';
import { deleteNote, updateNote } from '../features/notes/notesSlice';
import { Edit, Trash2, Calendar, Pin, Archive, ArchiveRestore, RotateCcw } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

// 지연 로딩을 위한 NoteModal
const NoteModal = lazy(() => import('./NoteModal'));

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const dispatch = useAppDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Confirm 모달 관련 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    onConfirm: () => {}
  });

    // 노트 삭제 처리 (trash로 이동 또는 완전 삭제)
  const handleDelete = () => {
    if (note.deleted) {
      // 이미 trash에 있는 경우 - 완전 삭제
      setConfirmModal({
        isOpen: true,
        title: '완전 삭제',
        message: '정말로 이 노트를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        variant: 'danger',
        onConfirm: async () => {
          try {
            await dispatch(deleteNote(note.id)).unwrap();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
            console.error('노트 완전 삭제 실패:', error);
            alert('노트 완전 삭제에 실패했습니다.');
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    } else {
      // 일반 노트인 경우 - trash로 이동
      setConfirmModal({
        isOpen: true,
        title: '휴지통으로 이동',
        message: '이 노트를 휴지통으로 이동하시겠습니까?',
        variant: 'warning',
        onConfirm: async () => {
          try {
            await dispatch(updateNote({
              id: note.id,
              deleted: true
            })).unwrap();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
            console.error('노트 삭제 실패:', error);
            alert('노트 삭제에 실패했습니다.');
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    }
  };

  // 노트 보관/보관 해제 처리
  const handleArchive = () => {
    const action = note.archived ? '보관을 해제' : '보관';
    const title = note.archived ? '보관 해제' : '노트 보관';
    const message = `이 노트를 ${action}하시겠습니까?`;
    
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
          })).unwrap();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('노트 보관 상태 변경 실패:', error);
          alert('노트 보관 상태 변경에 실패했습니다.');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 노트 복원 처리 (trash에서 일반 노트로)
  const handleRestore = () => {
    setConfirmModal({
      isOpen: true,
      title: '노트 복원',
      message: '이 노트를 복원하시겠습니까?',
      variant: 'success',
      onConfirm: async () => {
        try {
          await dispatch(updateNote({
            id: note.id,
            deleted: false
          })).unwrap();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('노트 복원 실패:', error);
          alert('노트 복원에 실패했습니다.');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 편집 모달 열기
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // 날짜 포맷팅 (이미지 형식: MM/DD/YY H:MM AM/PM)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시를 12시로 표시
    return `${hours}:${minutes} ${ampm}`;
  };

  // 우선순위 텍스트 변환 (한국어)
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
      default: return '보통';
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
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden h-full flex flex-col"
      style={{ 
        backgroundColor: note.backgroundColor,
      }}
    >
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* 상단: 제목(왼쪽) + 우선순위 + 압정아이콘(오른쪽) */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 mr-3">
            {note.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(note.priority)}`}>
              {getPriorityText(note.priority)}
            </span>
            <Pin className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* 중앙: 노트 내용 */}
        <div className="text-gray-700 leading-relaxed flex-1">
          <p className="line-clamp-3 whitespace-pre-wrap text-sm">
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
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{formatDate(note.createdAt)} {formatTime(note.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {note.deleted ? (
              // Trash에 있는 노트의 버튼들
              <>
                <button
                  onClick={handleRestore}
                  className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                  title="복원"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  title="완전 삭제"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              // 일반 노트의 버튼들
              <>
                <button
                  onClick={handleEdit}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                  title="수정"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={handleArchive}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                  title={note.archived ? "보관 해제" : "보관"}
                >
                  {note.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 편집 모달 */}
      <Suspense fallback={null}>
        <NoteModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          note={note}
        />
      </Suspense>

      {/* Confirm 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default NoteCard;



