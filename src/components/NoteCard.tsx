import { useState } from 'react';
import type { Note, UpdateNoteData } from '../types';
import { useAppDispatch } from '../app/hooks';
import { deleteNote, updateNote } from '../features/notes/notesSlice';
import { Edit, Trash2, Save, X, Calendar, Clock } from 'lucide-react';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

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

  // 노트 수정 처리
  const handleUpdate = async () => {
    if (editTitle.trim() === '') {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      const updateData: UpdateNoteData = {
        id: note.id,
        title: editTitle.trim(),
        content: editContent.trim(),
      };
      
      await dispatch(updateNote(updateData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('노트 수정 실패:', error);
    }
  };

  // 수정 취소
  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <div className="card">
        <div className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-xl font-semibold border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1"
            placeholder="제목을 입력하세요"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[120px] border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none px-3 py-2 resize-none"
            placeholder="내용을 입력하세요"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-1"
            >
              <X size={16} />
              <span>취소</span>
            </button>
            <button
              onClick={handleUpdate}
              className="btn-primary flex items-center space-x-1"
            >
              <Save size={16} />
              <span>저장</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {note.title}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
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
    </div>
  );
};

export default NoteCard;
