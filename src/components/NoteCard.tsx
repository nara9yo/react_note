import { useState } from 'react';
import type { Note, UpdateNoteData } from '../types';
import { useAppDispatch } from '../app/hooks';
import { deleteNote, updateNote } from '../features/notes/notesSlice';
import { DEFAULT_TAGS, PRIORITY_OPTIONS, BACKGROUND_COLORS } from '../constants/noteOptions';
import { Edit, Trash2, Save, X, Calendar, Clock, Tag as TagIcon, Flag, Palette } from 'lucide-react';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState(note.tags);
  const [editPriority, setEditPriority] = useState(note.priority);
  const [editBackgroundColor, setEditBackgroundColor] = useState(note.backgroundColor);

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
        tags: editTags,
        priority: editPriority,
        backgroundColor: editBackgroundColor,
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
    setEditTags(note.tags);
    setEditPriority(note.priority);
    setEditBackgroundColor(note.backgroundColor);
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
            className="w-full min-h-[100px] border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none px-3 py-2 resize-none"
            placeholder="내용을 입력하세요"
          />

          {/* 태그 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="inline w-4 h-4 mr-1" />
              태그
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    if (editTags.find(t => t.id === tag.id)) {
                      setEditTags(editTags.filter(t => t.id !== tag.id));
                    } else {
                      setEditTags([...editTags, tag]);
                    }
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    editTags.find(t => t.id === tag.id)
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: editTags.find(t => t.id === tag.id) ? tag.color : undefined,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 우선순위 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="inline w-4 h-4 mr-1" />
              우선순위
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditPriority(option.value)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    editPriority === option.value
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: editPriority === option.value ? option.color : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 배경색 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="inline w-4 h-4 mr-1" />
              배경색
            </label>
            <div className="flex gap-2">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setEditBackgroundColor(color.value)}
                  className={`w-6 h-6 rounded border-2 transition-all duration-200 ${
                    editBackgroundColor === color.value
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.preview }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
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
    <div className="card hover:shadow-md transition-shadow duration-200" style={{ backgroundColor: note.backgroundColor }}>
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
    </div>
  );
};

export default NoteCard;
