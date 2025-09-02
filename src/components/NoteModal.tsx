import { useState, useEffect, Suspense, lazy, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addNewNote, updateNote, selectAllNotes } from '../features/notes/notesSlice';
import type { CreateNoteData, UpdateNoteData, Tag, Priority, Note } from '../types';
import { PRIORITY_OPTIONS, BACKGROUND_COLORS, DEFAULT_NOTE_DATA } from '../constants/noteOptions';
import { Plus, X, Tag as TagIcon, Flag, Palette, Save, Edit } from 'lucide-react';
import PortalModal from './PortalModal';
import ConfirmModal from './ConfirmModal';

// 지연 로딩을 위한 TagModal
const TagModal = lazy(() => import('./TagModal'));

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  note?: Note; // 편집/보기 모드일 때만 전달
  preselectedTag?: string | null; // 생성 모드에서 미리 선택된 태그
  isReadOnly?: boolean; // 휴지통에 있을 때
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, mode, note, preselectedTag, isReadOnly = false }) => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [priority, setPriority] = useState<Priority>(DEFAULT_NOTE_DATA.priority);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_NOTE_DATA.backgroundColor);

  // Modal state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  
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
    onConfirm: () => {}
  });

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setTitle('');
        setContent('');
        setSelectedTags([]);
        setPriority(DEFAULT_NOTE_DATA.priority);
        setBackgroundColor(DEFAULT_NOTE_DATA.backgroundColor);
        setModalTitle('새 노트 작성');
        setIsDirty(false); // 생성 모드에서는 처음엔 clean
      } else if (note) {
        setTitle(note.title);
        setContent(note.content);
        setSelectedTags(note.tags);
        setPriority(note.priority);
        setBackgroundColor(note.backgroundColor);
        // isDirty는 모달이 처음 열릴 때만 false로 설정
        if (mode === 'view') {
          setIsDirty(false); // 보기 모드에서는 처음엔 clean
        } else if (mode === 'edit') {
          setIsDirty(true); // 편집 모드에서는 바로 수정 가능
        }
        
        // Trash에 있는 노트인지 확인하여 타이틀 설정
        if (note.deleted) {
          setModalTitle('노트 보기 (Trash)');
        } else {
          setModalTitle(mode === 'view' ? '노트 보기' : '노트 수정');
        }
      }
    } else {
      // 닫힐 때 모든 상태 초기화 (애니메이션 등 고려)
      setTimeout(() => {
        setTitle('');
        setContent('');
        setSelectedTags([]);
        setPriority(DEFAULT_NOTE_DATA.priority);
        setBackgroundColor(DEFAULT_NOTE_DATA.backgroundColor);
        setIsDirty(false);
        setModalTitle('');
      }, 200);
    }
  }, [isOpen, mode, note]);

  // '보기' 모드에서 내용 변경 시 '수정' 모드로 전환
  useEffect(() => {
    if (isOpen && mode === 'view' && !isReadOnly && note) {
      // 초기 로딩이 완료된 후에만 변경 감지 시작
      const timer = setTimeout(() => {
        const hasChanged = 
          note.title !== title ||
          note.content !== content ||
          note.priority !== priority ||
          note.backgroundColor !== backgroundColor ||
          JSON.stringify(note.tags.map(t => t.id).sort()) !== JSON.stringify(selectedTags.map(t => t.id).sort());

        if (hasChanged && !isDirty) {
          setIsDirty(true);
          // Trash에 있는 노트인지 확인하여 타이틀 설정
          if (note.deleted) {
            setModalTitle('노트 수정 (Trash)');
          } else {
            setModalTitle('노트 수정');
          }
        }
      }, 100); // 초기 로딩 완료 후 100ms 지연

      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, isReadOnly, note, title, content, priority, backgroundColor, selectedTags]);

  // 생성 모드에서 내용 변경 시 isDirty 설정
  useEffect(() => {
    if (isOpen && mode === 'create') {
      const timer = setTimeout(() => {
        const hasChanged = 
          title !== '' ||
          content !== '' ||
          priority !== DEFAULT_NOTE_DATA.priority ||
          backgroundColor !== DEFAULT_NOTE_DATA.backgroundColor ||
          selectedTags.length > 0;
        
        if (hasChanged && !isDirty) {
          setIsDirty(true);
        }
      }, 100); // 초기 로딩 완료 후 100ms 지연

      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, title, content, priority, backgroundColor, selectedTags]);

  // 미리 선택된 태그 처리 (생성 모드에서만)
  useEffect(() => {
    if (isOpen && mode === 'create' && preselectedTag) {
      if (preselectedTag === 'untagged') {
        setSelectedTags([]);
        return;
      }
      let foundTag = undefined as undefined | Tag;
      for (const n of notes) {
        const noteTag = n.tags.find(tag => tag.name === preselectedTag);
        if (noteTag) {
          foundTag = noteTag;
          break;
        }
      }
      setSelectedTags(foundTag ? [foundTag] : []);
    }
  }, [isOpen, mode, preselectedTag, notes]);

  // 노트 생성/수정 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') {
      setConfirmModal({
        isOpen: true,
        title: '입력 오류',
        message: '제목을 입력해주세요.',
        variant: 'warning',
        type: 'alert',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const noteData: CreateNoteData = { title: title.trim(), content: content.trim(), tags: selectedTags, priority, backgroundColor };
        await dispatch(addNewNote(noteData)).unwrap();
      } else if ((mode === 'edit' || mode === 'view') && note) {
        const updateData: UpdateNoteData = { id: note.id, title: title.trim(), content: content.trim(), tags: selectedTags, priority, backgroundColor };
        await dispatch(updateNote(updateData)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error(`노트 ${mode === 'create' ? '생성' : '수정'} 실패:`, error);
      setConfirmModal({
        isOpen: true,
        title: `${mode === 'create' ? '생성' : '수정'} 실패`,
        message: `노트 ${mode === 'create' ? '생성' : '수정'}에 실패했습니다. 다시 시도해주세요.`,
        variant: 'danger',
        type: 'alert',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 시 폼 초기화
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // 외부 클릭 감지하여 모달 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(target) &&
        !(target instanceof Element && target.closest('.portal-modal-root'))
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

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

  const finalIsReadOnly = isReadOnly;
  const submitButtonText = mode === 'create' ? '생성하기' : '수정하기';
  const submitButtonIcon = mode === 'create' ? <Plus size={16} /> : <Save size={16} />;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-9999"
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
              disabled={isSubmitting || finalIsReadOnly}
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <div 
              className={`border border-gray-300 rounded-lg transition-all duration-200 ${
                !finalIsReadOnly && 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
              }`}
              style={{ backgroundColor: backgroundColor }}
            >
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border-0 focus:outline-none resize-none"
                placeholder="노트 내용을 입력하세요"
                rows={6}
                disabled={isSubmitting || finalIsReadOnly}
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
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsTagModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isSubmitting || finalIsReadOnly}
                >
                  태그 관리
                </button>
              )}
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
                      disabled={isSubmitting || finalIsReadOnly}
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
                    disabled={isSubmitting || finalIsReadOnly}
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
                    disabled={isSubmitting || finalIsReadOnly}
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
                  disabled={isSubmitting || finalIsReadOnly}
                />
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>
              {isReadOnly ? '닫기' : '취소'}
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn-primary flex items-center space-x-2" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{mode === 'create' ? '생성 중...' : '수정 중...'}</span>
                  </>
                ) : (
                  <>
                    {submitButtonIcon}
                    <span>{submitButtonText}</span>
                  </>
                )}
              </button>
            )}
            {/* 보기 모드에서 수정 버튼 (Trash가 아닌 경우) */}
            {mode === 'view' && !isReadOnly && !isDirty && (
              <button 
                type="button" 
                onClick={() => {
                  setIsDirty(true);
                  // 모달 타이틀도 수정 모드로 변경
                  if (note?.deleted) {
                    setModalTitle('노트 수정 (Trash)');
                  } else {
                    setModalTitle('노트 수정');
                  }
                }}
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <Edit size={16} />
                <span>수정하기</span>
              </button>
            )}

            {/* Trash 노트인 경우 수정 불가 안내 메시지 */}
            {isReadOnly && note?.deleted && (
              <div className="flex-1 text-center">
                <p className="text-sm text-gray-500 italic">
                  Trash에 있는 노트는 수정할 수 없습니다
                </p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 태그 모달 - Portal로 렌더링 */}
      <PortalModal isOpen={isTagModalOpen}>
        <Suspense fallback={null}>
          <TagModal
            isOpen={isTagModalOpen}
            onClose={() => setIsTagModalOpen(false)}
            mode="select"
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </Suspense>
      </PortalModal>
      
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

export default NoteModal;
