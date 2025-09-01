import { useState, useEffect, Suspense, lazy, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addNewNote, updateNote, selectAllNotes } from '../features/notes/notesSlice';
import type { CreateNoteData, UpdateNoteData, Tag, Priority, Note } from '../types';
import { PRIORITY_OPTIONS, BACKGROUND_COLORS, DEFAULT_NOTE_DATA } from '../constants/noteOptions';
import { Plus, X, Tag as TagIcon, Flag, Palette, Save } from 'lucide-react';
import PortalModal from './PortalModal';

// 지연 로딩을 위한 TagModal
const TagModal = lazy(() => import('./TagModal'));

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  note?: Note; // 편집 모드일 때만 전달
  preselectedTag?: string | null; // 미리 선택된 태그
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, mode, note, preselectedTag }) => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [priority, setPriority] = useState<Priority>(DEFAULT_NOTE_DATA.priority);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_NOTE_DATA.backgroundColor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

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

  // 미리 선택된 태그 처리 (생성 모드에서만)
  useEffect(() => {
    if (mode === 'create' && isOpen) {
      // 'untagged'인 경우 또는 태그가 없는 경우 태그를 비워둠
      if (preselectedTag === 'untagged' || !preselectedTag) {
        setSelectedTags([]);
        return;
      }
      
      // 노트에서 사용 중인 태그에서 찾기
      let foundTag = undefined as undefined | Tag;
      if (notes.length > 0) {
        for (const note of notes) {
          const noteTag = note.tags.find(tag => tag.name === preselectedTag);
          if (noteTag) {
            foundTag = noteTag;
            break;
          }
        }
      }
      // 찾은 태그가 있으면 설정, 없으면 빈 배열
      setSelectedTags(foundTag ? [foundTag] : []);
    }
  }, [mode, preselectedTag, isOpen, notes]);

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
        const noteData: CreateNoteData = { title: title.trim(), content: content.trim(), tags: selectedTags, priority, backgroundColor };
        await dispatch(addNewNote(noteData)).unwrap();
      } else if (mode === 'edit' && note) {
        const updateData: UpdateNoteData = { id: note.id, title: title.trim(), content: content.trim(), tags: selectedTags, priority, backgroundColor };
        await dispatch(updateNote(updateData)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error(`노트 ${mode === 'create' ? '생성' : '수정'} 실패:`, error);
      alert(`노트 ${mode === 'create' ? '생성' : '수정'}에 실패했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 시 폼 초기화
  const handleClose = useCallback(() => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setPriority(DEFAULT_NOTE_DATA.priority);
    setBackgroundColor(DEFAULT_NOTE_DATA.backgroundColor);
    onClose();
  }, [onClose]);

  // 외부 클릭 감지하여 모달 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 태그 모달이 열려있을 때는 이 로직을 비활성화
      if (isTagModalOpen) {
        return;
      }
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isTagModalOpen, handleClose]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isTagModalOpen) {
          handleClose();
        }
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
  }, [isOpen, isTagModalOpen, handleClose]);

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const modalTitle = isEditMode ? '노트 수정' : '새 노트 작성';
  const submitButtonText = isEditMode ? '수정하기' : '생성하기';
  const submitButtonIcon = isEditMode ? <Save size={16} /> : <Plus size={16} />;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}
    >
      {/* 모달 컨텐츠 */}
      <div 
        ref={modalContentRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
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
              name="title"
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
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-gray-700">
                <TagIcon className="inline w-4 h-4 mr-1" />
                태그
              </span>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                태그 관리
              </button>
            </div>
            {/* 선택된 태그 표시 */}
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}
                      className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-2">
                선택된 태그가 없습니다. 태그 관리를 클릭하여 태그를 선택하세요.
              </div>
            )}
          </div>

          {/* 우선순위 + 배경색 (한 행 배치) */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
            {/* 우선순위 */}
            <div className="md:w-64">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                우선순위
              </span>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      priority === option.value ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{ backgroundColor: priority === option.value ? option.color : undefined }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 배경색 */}
            <div className="flex-1">
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="inline w-4 h-4 mr-1" />
                배경색
              </label>
              <div className="flex items-center gap-2">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setBackgroundColor(color.value)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                      backgroundColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.preview }}
                    title={color.label}
                  />
                ))}
                <div className="w-px h-8 bg-gray-300 mx-1" />
                <input
                  id="backgroundColor"
                  name="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors duration-200"
                  title="사용자 정의 색상"
                />
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>
              취소
            </button>
            <button type="submit" className="btn-primary flex items-center space-x-2" disabled={isSubmitting}>
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

      {/* 태그 모달 - Portal로 렌더링 */}
      <PortalModal isOpen={isTagModalOpen}>
        <Suspense fallback={null}>
          <TagModal
            isOpen={isTagModalOpen}
            onClose={() => setIsTagModalOpen(false)}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </Suspense>
      </PortalModal>
    </div>
  );
};

export default NoteModal;
