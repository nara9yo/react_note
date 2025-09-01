import { useState } from 'react';
import type { Note } from '../types';
import { useAppDispatch } from '../app/hooks';
import { deleteNote } from '../features/notes/notesSlice';
import { Edit, Trash2, Calendar, Clock, Tag as TagIcon, Flag } from 'lucide-react';
import NoteModal from './NoteModal';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const dispatch = useAppDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 노트 삭제 처리
  const handleDelete = async () => {
    if (window.confirm('정말로 이 노트를 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteNote(note.id)).unwrap();
      } catch (error) {
        console.error('노트 삭제 실패:', error);
      }
    }
  };

  // 편집 모달 열기
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

     

     return (
     <div 
       className="card hover:shadow-lg transition-all duration-200 border-0" 
       style={{ 
         backgroundColor: note.backgroundColor,
         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
       }}
     >
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {note.title}
          </h3>
          <div className="flex space-x-2">
                         <button
               onClick={handleEdit}
               className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
               title="수정"
             >
               <Edit size={16} />
             </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="text-gray-700 leading-relaxed">
          <p className="line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>

        {/* 태그와 우선순위 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 태그들 */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 우선순위 */}
          <div className="flex items-center gap-1">
            <Flag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {note.priority === 'low' && '낮음'}
              {note.priority === 'medium' && '보통'}
              {note.priority === 'high' && '높음'}
            </span>
          </div>
        </div>

        {/* 날짜 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{formatDate(note.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{formatTime(note.updatedAt)}</span>
          </div>
                 </div>
       </div>

       {/* 편집 모달 */}
       <NoteModal
         isOpen={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         mode="edit"
         note={note}
       />
     </div>
   );
 };

export default NoteCard;
