import { useState, useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { addNewNote, updateNote } from '../features/notes/notesSlice';
import type { CreateNoteData, UpdateNoteData, Tag, Priority, Note } from '../types';
import { DEFAULT_TAGS, PRIORITY_OPTIONS, BACKGROUND_COLORS, DEFAULT_NOTE_DATA } from '../constants/noteOptions';
import { Plus, X, Tag as TagIcon, Flag, Palette, Save } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  note?: Note; // 편집 모드일 때만 전달
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, mode, note }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [priority, setPriority] = useState<Priority>(DEFAULT_NOTE_DATA.priority);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_NOTE_DATA.backgroundColor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 편집 모드일 때 기존 노트 데이터로 초기화
  useEffect(() => {
    if (mode === 'edit' && note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags);
      setPriority(note.priority);
      setBackgroundColor(note.backgroundColor);
    }
  }, [mode, note]);

  // 노트 생성/수정 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === '') {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // 새 노트 생성
        const noteData: CreateNoteData = {
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
          priority,
          backgroundColor,
        };
        
        await dispatch(addNewNote(noteData)).unwrap();
      } else if (mode === 'edit' && note) {
        // 기존 노트 수정
        const updateData: UpdateNoteData = {
          id: note.id,
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
          priority,
          backgroundColor,
        };
        
        await dispatch(updateNote(updateData)).unwrap();
      }
      
      // 성공 시 폼 초기화 및 모달 닫기
      handleClose();
    } catch (error) {
      console.error(`노트 ${mode === 'create' ? '생성' : '수정'} 실패:`, error);
      alert(`노트 ${mode === 'create' ? '생성' : '수정'}에 실패했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 시 폼 초기화
  const handleClose = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setPriority(DEFAULT_NOTE_DATA.priority);
    setBackgroundColor(DEFAULT_NOTE_DATA.backgroundColor);
    onClose();
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const modalTitle = isEditMode ? '노트 수정' : '새 노트 작성';
  const submitButtonText = isEditMode ? '수정하기' : '생성하기';
  const submitButtonIcon = isEditMode ? <Save size={16} /> : <Plus size={16} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{modalTitle}</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
              placeholder="노트 제목을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <div 
              className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200"
              style={{ backgroundColor: backgroundColor }}
            >
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border-0 focus:outline-none resize-none"
                placeholder="노트 내용을 입력하세요"
                rows={6}
                disabled={isSubmitting}
              />
            </div>
          </div>

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
                    if (selectedTags.find(t => t.id === tag.id)) {
                      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedTags.find(t => t.id === tag.id)
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTags.find(t => t.id === tag.id) ? tag.color : undefined,
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
                  onClick={() => setPriority(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    priority === option.value
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: priority === option.value ? option.color : undefined,
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
            <div className="flex items-center gap-3">
              {/* 미리 정의된 색상 */}
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setBackgroundColor(color.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                    backgroundColor === color.value
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.preview }}
                  title={color.label}
                />
              ))}
              
              {/* 구분선 */}
              <div className="w-px h-8 bg-gray-300 mx-2" />
              
              {/* 사용자 정의 색상 */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors duration-200"
                  title="사용자 정의 색상"
                />
                <span className="text-sm text-gray-500 font-mono min-w-[70px]">
                  {backgroundColor}
                </span>
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? '수정 중...' : '생성 중...'}</span>
                </>
              ) : (
                <>
                  {submitButtonIcon}
                  <span>{submitButtonText}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
