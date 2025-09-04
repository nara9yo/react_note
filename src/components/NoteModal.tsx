import { useState, useEffect, Suspense, lazy, useCallback, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useLanguage } from '../app/hooks/useLanguage';
import { addNewNote, updateNote, selectAllNotes } from '../features/notes/notesSlice';
import type { CreateNoteData, UpdateNoteData, Tag, Priority, Note } from '../types';
import { getPriorityOptions, getBackgroundColors, DEFAULT_NOTE_DATA } from '../constants/noteOptions';
import { TIMING } from '../constants/uiConstants';
import { Plus, X, Tag as TagIcon, Flag, Palette, Save, Edit } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import PortalModal from './PortalModal';
import ConfirmModal from './ConfirmModal';

// 지연 로딩을 위한 TagModal
const TagModal = lazy(() => import('./TagModal').then(module => ({ default: module.default })));

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
  const { t } = useLanguage();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentDelta, setContentDelta] = useState<string>('');
  
  // note에서 직접 contentDelta를 계산하여 안정적으로 전달
  const noteContentDelta = useMemo(() => {
    if (!note || mode === 'create') return '';
    
    try {
      const parsed = JSON.parse(note.content);
      if (parsed && typeof parsed === 'object' && parsed.ops) {
        return note.content;
      }
    } catch {
      // Delta가 아닌 경우
    }
    return '';
  }, [note, mode]);

  // note에서 직접 content를 계산하여 안정적으로 전달
  const noteContent = useMemo(() => {
    if (!note || mode === 'create') return '';
    
    try {
      const parsed = JSON.parse(note.content);
      if (parsed && typeof parsed === 'object' && parsed.ops) {
        // Delta인 경우 빈 문자열 반환
        return '';
      }
    } catch {
      // Delta가 아닌 경우
    }
    return note.content;
  }, [note, mode]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [priority, setPriority] = useState<Priority>(DEFAULT_NOTE_DATA.priority);
  const [backgroundColor, setBackgroundColor] = useState<string>(DEFAULT_NOTE_DATA.backgroundColor);

  // Modal state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 초기 로딩 상태 추적
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 모바일에서 모달 오픈 시 배경 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    const style = document.body.style as CSSStyleDeclaration & { overscrollBehavior?: string };
    const prevOverflow = style.overflow;
    const prevTouchAction = (style as unknown as { touchAction?: string }).touchAction || '';
    const prevOverscroll = (style as unknown as { overscrollBehavior?: string }).overscrollBehavior || '';
    document.body.style.overflow = 'hidden';
    (style as unknown as { overscrollBehavior?: string }).overscrollBehavior = 'none';
    (style as unknown as { touchAction?: string }).touchAction = 'none';
    return () => {
      document.body.style.overflow = prevOverflow || '';
      (style as unknown as { overscrollBehavior?: string }).overscrollBehavior = prevOverscroll || '';
      (style as unknown as { touchAction?: string }).touchAction = prevTouchAction || '';
    };
  }, [isOpen]);
  
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

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    // Early return: 모달이 닫힌 경우
    if (!isOpen) {
      // 닫힐 때 모든 상태 초기화 (애니메이션 등 고려)
      setTimeout(() => {
        setTitle('');
        setContent('');
        setContentDelta('');
        setSelectedTags([]);
        setPriority(DEFAULT_NOTE_DATA.priority);
        setBackgroundColor(DEFAULT_NOTE_DATA.backgroundColor);
        setIsDirty(false);
        setIsInitialLoad(true);
        setModalTitle('');
      }, TIMING.MODAL_ANIMATION_DELAY);
      return;
    }

    // 생성 모드 처리
      if (mode === 'create') {
        setTitle('');
        setContent('');
        setContentDelta('');
        setSelectedTags([]);
        setPriority(DEFAULT_NOTE_DATA.priority);
        setBackgroundColor(DEFAULT_NOTE_DATA.backgroundColor);
        setModalTitle(t('modal.title.newNote'));
        setIsDirty(false); // 생성 모드에서는 처음엔 clean
        setIsInitialLoad(false); // 생성 모드에서는 즉시 입력 감지 시작
      return;
    }

    // Early return: 노트가 없는 경우
    if (!note) return;

    // 편집/보기 모드 처리
        setTitle(note.title);
    
        // note.content 이 Delta(JSON)면 Delta 초기화, 아니면 HTML로 초기화
        try {
          const parsed = JSON.parse(note.content);
          if (parsed && typeof parsed === 'object' && parsed.ops) {
            setContentDelta(note.content);
            setContent('');
          } else {
            setContent(note.content);
            setContentDelta('');
          }
        } catch {
          setContent(note.content);
          setContentDelta('');
        }
    
        setSelectedTags(note.tags);
        setPriority(note.priority);
        setBackgroundColor(note.backgroundColor);
    
        // isDirty는 모달이 처음 열릴 때만 false로 설정
        if (mode === 'view') {
          setIsDirty(false); // 보기 모드에서는 처음엔 clean
          // 초기 로딩 완료 후 변경 감지 시작
          setTimeout(() => {
            setIsInitialLoad(false);
          }, TIMING.CONTENT_CHANGE_DELAY * 2);
        } else if (mode === 'edit') {
          setIsDirty(true); // 편집 모드에서는 바로 수정 가능
          setIsInitialLoad(false);
        }
        
        // Trash에 있는 노트인지 확인하여 타이틀 설정
        if (note.deleted) {
          setModalTitle(t('modal.title.viewNoteTrash'));
        } else {
          setModalTitle(mode === 'view' ? t('modal.title.viewNote') : t('modal.title.editNote'));
    }
  }, [isOpen, mode, note, t]);

  // 모달 타이틀 업데이트 (언어 변경 시)
  useEffect(() => {
    // Early return: 모달이 닫힌 경우
    if (!isOpen) return;

    // 생성 모드 처리
      if (mode === 'create') {
        setModalTitle(t('modal.title.newNote'));
      return;
    }

    // Early return: 노트가 없는 경우
    if (!note) return;

    // 편집/보기 모드 처리
        if (note.deleted) {
          setModalTitle(t('modal.title.viewNoteTrash'));
        } else {
          setModalTitle(mode === 'view' ? t('modal.title.viewNote') : t('modal.title.editNote'));
    }
  }, [t, isOpen, mode, note]);

  // '보기' 모드에서 사용자가 실제로 내용을 변경했을 때만 '수정' 모드로 전환
  useEffect(() => {
    // Early return: 조건이 맞지 않는 경우
    if (!isOpen || mode !== 'view' || isReadOnly || !note || !isDirty) return;

    // isDirty가 true가 된 후에만 실행 (사용자가 실제로 변경한 경우)
    const timer = setTimeout(() => {
      // Trash에 있는 노트인지 확인하여 타이틀 설정
      if (note.deleted) {
        setModalTitle(t('modal.title.editNote'));
      } else {
        setModalTitle(t('modal.title.editNote'));
      }
    }, TIMING.CONTENT_CHANGE_DELAY);

    return () => clearTimeout(timer);
  }, [isOpen, mode, isReadOnly, note, isDirty, t]);

  // 보기 모드에서 사용자 입력 감지 (초기 로딩 완료 후에만)
  useEffect(() => {
    // Early return: 조건이 맞지 않는 경우
    if (!isOpen || mode !== 'view' || isReadOnly || !note || isInitialLoad) return;

    // 사용자가 실제로 변경했는지 확인
    const hasUserChanged = 
      note.title !== title ||
      note.priority !== priority ||
      note.backgroundColor !== backgroundColor ||
      JSON.stringify(note.tags.map(t => t.id).sort()) !== JSON.stringify(selectedTags.map(t => t.id).sort());

    if (hasUserChanged && !isDirty) {
      setIsDirty(true);
    }
  }, [isOpen, mode, isReadOnly, note, title, priority, backgroundColor, selectedTags, isDirty, isInitialLoad]);

  // 생성 모드에서 내용 변경 시 isDirty 설정
  useEffect(() => {
    // Early return: 조건이 맞지 않는 경우
    if (!isOpen || mode !== 'create' || isInitialLoad) return;

    const hasChanged = 
      title !== '' ||
      content !== '' ||
      priority !== DEFAULT_NOTE_DATA.priority ||
      backgroundColor !== DEFAULT_NOTE_DATA.backgroundColor ||
      selectedTags.length > 0;
    
    if (hasChanged && !isDirty) {
      setIsDirty(true);
    }
  }, [isOpen, mode, title, content, priority, backgroundColor, selectedTags, isDirty, isInitialLoad]);

  // 미리 선택된 태그 처리 (생성 모드에서만)
  useEffect(() => {
    // Early return: 조건이 맞지 않는 경우
    if (!isOpen || mode !== 'create' || !preselectedTag) return;

    // 태그 없음 처리
      if (preselectedTag === 'untagged') {
        setSelectedTags([]);
        return;
      }

    // 미리 선택된 태그 찾기
      let foundTag = undefined as undefined | Tag;
      for (const n of notes) {
        const noteTag = n.tags.find(tag => tag.name === preselectedTag);
        if (noteTag) {
          foundTag = noteTag;
          break;
        }
      }
      setSelectedTags(foundTag ? [foundTag] : []);
  }, [isOpen, mode, preselectedTag, notes]);

  // 모달이 열리고 생성 모드일 때 제목 입력란에 포커스
  useEffect(() => {
    // Early return: 조건이 맞지 않는 경우
    if (!isOpen || mode !== 'create') return;

    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, TIMING.FOCUS_DELAY); // 애니메이션 시간을 고려하여 약간의 지연 후 포커스
    
    return () => clearTimeout(timer);
  }, [isOpen, mode]);

  // 노트 생성/수정 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') {
      setConfirmModal({
        isOpen: true,
        title: t('error.saveFailed'),
        message: t('message.saveFailed'),
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
      const contentToSave = contentDelta && contentDelta.length > 0 ? contentDelta : content;
      if (mode === 'create') {
        const noteData: CreateNoteData = { title: title.trim(), content: contentToSave, tags: selectedTags, priority, backgroundColor };
        await dispatch(addNewNote(noteData)).unwrap();
      } else if ((mode === 'edit' || mode === 'view') && note) {
        const updateData: UpdateNoteData = { id: note.id, title: title.trim(), content: contentToSave, tags: selectedTags, priority, backgroundColor };
        await dispatch(updateNote(updateData)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error(t(mode === 'create' ? 'error.noteCreateFailed' : 'error.noteUpdateFailed'), error);
      setConfirmModal({
        isOpen: true,
        title: t(mode === 'create' ? 'modal.title.createFailed' : 'modal.title.updateFailed'),
        message: t(mode === 'create' ? 'message.createFailed' : 'message.updateFailed'),
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



  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((showColorDropdown || showPriorityDropdown) && modalContentRef.current) {
        const target = event.target as Element;
        if (!modalContentRef.current.contains(target)) {
          setShowColorDropdown(false);
          setShowPriorityDropdown(false);
        }
      }
    };

    if (showColorDropdown || showPriorityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorDropdown, showPriorityDropdown]);

  if (!isOpen) return null;

  const finalIsReadOnly = isReadOnly;
  const submitButtonText = mode === 'create' ? t('button.save') : t('button.save');
  const submitButtonIcon = mode === 'create' ? <Plus size={16} /> : <Save size={16} />;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-modal
                 max-sm:items-stretch max-sm:justify-stretch overscroll-contain touch-pan-y"
    >
      {/* 모달 컨텐츠 */}
      <div 
        ref={modalContentRef}
        className="relative bg-white shadow-xl w-full mx-4 modal-max-height overflow-hidden flex flex-col
                   sm:rounded-lg sm:max-w-2xl
                   max-sm:mx-0 max-sm:my-0 max-sm:max-h-screen max-sm:max-w-none max-sm:rounded-none max-sm:h-screen max-sm:w-screen"
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">{modalTitle}</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 space-y-6 max-h-[calc(90vh-120px)] sm:max-h-[calc(90vh-120px)] max-sm:max-h-[calc(100vh-120px)]">
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.title')} *
            </label>
            <input
              ref={titleInputRef}
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
              placeholder={t('placeholder.title')}
              required
              disabled={isSubmitting || finalIsReadOnly}
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <label id="content-label" className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.content')}
            </label>
            <div 
              className={`border border-gray-300 rounded-lg transition-all duration-200 ${!finalIsReadOnly && 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'}`}
              style={{ backgroundColor: backgroundColor }}
            >
              <RichTextEditor
                value={noteContent || content}
                onChange={setContent}
                onDeltaChange={setContentDelta}
                initialDelta={noteContentDelta || contentDelta}
                readOnly={isSubmitting || finalIsReadOnly}
                placeholder={t('placeholder.content')}
                backgroundColor={backgroundColor}
                ariaLabelledBy="content-label"
              />
            </div>
          </div>

          {/* 태그 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-gray-700">
                <TagIcon className="inline w-4 h-4 mr-1" />
                {t('label.tags')}
              </span>
              {!isReadOnly && (
              <button
                type="button"
                onClick={() => setIsTagModalOpen(true)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors duration-200 flex items-center gap-1"
                disabled={isSubmitting || finalIsReadOnly}
              >
                <TagIcon className="w-3 h-3" />
                  {t('menu.tagManagement')}
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
                {t('message.untagged')}
              </div>
            )}
          </div>

          {/* 우선순위 + 배경색 (한 행 배치) */}
          <div className="flex flex-row gap-4 items-start">
            {/* 우선순위 */}
            <div className="min-w-[220px] flex-shrink-0">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                {t('label.priority')}
              </span>
              
              {/* 모바일: 커스텀 드롭다운 */}
              <div className="block sm:hidden">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-left flex items-center justify-between"
                    disabled={isSubmitting || finalIsReadOnly}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: getPriorityOptions().find(p => p.value === priority)?.color || '#6b7280' }}
                      />
                      <span>{getPriorityOptions().find(p => p.value === priority)?.label || t('label.priority')}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showPriorityDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {getPriorityOptions().map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPriority(option.value);
                            setShowPriorityDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: option.color }}
                          />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 데스크톱: 기존 버튼 형태 */}
              <div className="hidden sm:flex gap-1 flex-nowrap">
                {getPriorityOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${priority === option.value ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
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
                {t('label.backgroundColor')}
              </label>
              
              {/* 모바일: 드롭다운 + 커스텀 색상 선택기 */}
              <div className="block sm:hidden">
                <div className="flex items-center gap-2">
                  {/* 드롭다운 */}
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setShowColorDropdown(!showColorDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-left flex items-center justify-between"
                      disabled={isSubmitting || finalIsReadOnly}
                    >
              <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: backgroundColor }}
                        />
                        <span>{getBackgroundColors().find(c => c.value === backgroundColor)?.label || t('label.backgroundColor')}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showColorDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {getBackgroundColors().map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                              setBackgroundColor(color.value);
                              setShowColorDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <div 
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: color.preview }}
                            />
                            <span>{color.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 커스텀 색상 선택기 */}
                  <input
                    id="backgroundColor"
                    name="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    disabled={isSubmitting || finalIsReadOnly}
                    title="커스텀 색상 선택"
                  />
                </div>
              </div>
              
              {/* 데스크톱: 기존 형태 */}
              <div className="hidden sm:flex items-center gap-1 flex-wrap">
                {getBackgroundColors().map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setBackgroundColor(color.value)}
                    className={`w-6 h-6 rounded border-2 transition-all duration-200 ${backgroundColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
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
          <div className="flex justify-end space-x-3 pt-4 flex-shrink-0">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>
              {isReadOnly ? t('button.close') : t('button.cancel')}
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn-primary flex items-center space-x-2" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{mode === 'create' ? t('message.loading') : t('message.loading')}</span>
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
                    setModalTitle(t('modal.title.editNote'));
                  } else {
                    setModalTitle(t('modal.title.editNote'));
                  }
                }}
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <Edit size={16} />
                <span>{t('button.edit')}</span>
              </button>
            )}

            {/* Trash 노트인 경우 수정 불가 안내 메시지 */}
            {isReadOnly && note?.deleted && (
              <div className="flex-1 text-center">
                <p className="text-sm text-gray-500 italic">
                  {t('message.untagged')}
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
