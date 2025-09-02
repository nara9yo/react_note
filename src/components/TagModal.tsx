import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { updateNote } from '../features/notes/notesSlice';
import { 
  fetchTags, 
  addTag, 
  updateTag, 
  deleteTag
} from '../features/tags/tagsSlice';
import type { Tag } from '../types';
import { X, Plus, Search, Tag as TagIcon, Edit2, Trash2, Check } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'select' | 'manage';
  selectedTags?: Tag[]; // select 모드에서만 사용
  onTagsChange?: (tags: Tag[]) => void; // select 모드에서만 사용
}

const TagModal: React.FC<TagModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  selectedTags = [], 
  onTagsChange 
}) => {
  const dispatch = useAppDispatch();
  const { notes } = useAppSelector((state) => state.notes);
  const { tags, loading } = useAppSelector((state) => state.tags);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    type?: 'alert' | 'confirm';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    type: 'confirm',
    onConfirm: () => {},
  });

  // 태그가 로드되지 않았으면 로드
  useEffect(() => {
    if (isOpen && mode === 'manage' && tags.length === 0) {
      const loadTags = async () => {
        try {
          // 태그 로드
          await dispatch(fetchTags()).unwrap();
        } catch (error) {
          // BloomFilter 오류나 기타 Firestore 오류 처리
          if (error instanceof Error && error.name === 'BloomFilterError') {
            console.warn('BloomFilter 오류 발생 - 태그 로드 건너뜀:', error);
            return;
          }
          console.error('태그 로드 실패:', error);
        }
      };
      
      loadTags();
    }
  }, [isOpen, mode, tags.length, dispatch]);

  // 모든 태그 (Redux store + 노트에서 사용 중인 태그들 + 현재 선택된 태그들)
  const getAllTags = () => {
    const reduxTags = tags;
    const noteTags: Tag[] = [];
    
    // 노트에서 사용 중인 모든 태그 수집
    notes.forEach(note => {
      note.tags.forEach(tag => {
        if (!noteTags.find(nt => nt.id === tag.id)) {
          noteTags.push(tag);
        }
      });
    });
    
    // Redux 태그와 노트 태그를 합치되, 중복 제거
    const allTagsMap = new Map<string, Tag>();
    
    // Redux 태그 먼저 추가
    reduxTags.forEach(tag => {
      allTagsMap.set(tag.name, tag);
    });
    
    // 노트 태그 추가 (이름이 같으면 덮어쓰기)
    noteTags.forEach(tag => {
      allTagsMap.set(tag.name, tag);
    });
    
    // 현재 선택된 태그들도 추가 (select 모드에서 임시 태그 포함)
    selectedTags.forEach(tag => {
      allTagsMap.set(tag.name, tag);
    });
    
    return Array.from(allTagsMap.values());
  };

  const allTags = getAllTags();

  // 검색어에 따라 태그 필터링
  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 새 태그 추가
  const handleAddNewTag = async () => {
    const trimmedName = newTagName.trim();
    
    // 중복 검사: Redux store, 노트 태그, 현재 선택된 태그 모두 확인
    const isDuplicate = allTags.find(tag => tag.name === trimmedName) ||
                       selectedTags.find(tag => tag.name === trimmedName);
    
    if (trimmedName && !isDuplicate) {
      try {
        // 모든 모드에서 실제 태그 생성 (Redux store에 저장)
        const newTag = await dispatch(addTag({
          name: trimmedName,
        color: newTagColor,
        usageCount: 0
        })).unwrap();
      
        // select 모드에서는 생성된 태그를 선택된 태그 목록에 추가
        if (mode === 'select' && onTagsChange) {
      const updatedTags = [...selectedTags, newTag];
      onTagsChange(updatedTags);
        }
        
        // 입력 필드 초기화
      setNewTagName('');
              setNewTagColor('#3b82f6');
      } catch (error) {
        console.error('새 태그 추가 실패:', error);
        setConfirmModal({
          isOpen: true,
          title: '태그 추가 실패',
          message: '새 태그 추가에 실패했습니다. 다시 시도해주세요.',
          variant: 'danger',
          type: 'alert',
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
        });
      }
    } else if (trimmedName && isDuplicate) {
      // 중복 태그가 있을 때 알림 표시
      setConfirmModal({
        isOpen: true,
        title: '중복 태그',
        message: `"${trimmedName}" 태그는 이미 존재합니다.`,
        variant: 'warning',
        type: 'alert',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  // 태그 선택/해제 (select 모드)
  const handleTagToggle = (tag: Tag) => {
    if (mode !== 'select' || !onTagsChange) return;
    
    const isSelected = selectedTags.find(t => t.id === tag.id);
    let updatedTags: Tag[];

    if (isSelected) {
      updatedTags = selectedTags.filter(t => t.id !== tag.id);
    } else {
      updatedTags = [...selectedTags, tag];
    }

    onTagsChange(updatedTags);
  };

  // 태그 편집 시작 (manage 모드)
  const handleStartEdit = (tag: Tag) => {
    if (mode !== 'manage') return;
    
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  // 태그 편집 저장 (manage 모드)
  const handleSaveEdit = () => {
    if (mode !== 'manage' || !editingTag) return;
    
    if (editName.trim() && (editName !== editingTag.name || editColor !== editingTag.color)) {
      // Confirm 모달 표시
      setConfirmModal({
        isOpen: true,
        title: '태그 수정',
        message: `태그 "${editingTag.name}"을 "${editName.trim()}"으로 수정하시겠습니까?`,
        variant: 'info',
        onConfirm: async () => {
          try {
            // Redux store에서 태그 업데이트
            await dispatch(updateTag({
              id: editingTag.id,
              name: editName.trim(),
              color: editColor
            })).unwrap();
            
            // 노트에서 사용 중인 태그도 업데이트
            const notesToUpdate = notes.filter(note => 
              note.tags.some(tag => tag.id === editingTag.id)
            );

            // 각 노트의 태그를 업데이트
            for (const note of notesToUpdate) {
              const updatedTags = note.tags.map(tag => 
                tag.id === editingTag.id 
                  ? { ...tag, name: editName.trim(), color: editColor }
                  : tag
              );

              await dispatch(updateNote({
                id: note.id,
                tags: updatedTags
              })).unwrap();
            }

            // 편집 상태 초기화
            setEditingTag(null);
            setEditName('');
            setEditColor('');
            
            // Confirm 모달 닫기
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
            console.error('태그 업데이트 실패:', error);
            setConfirmModal({
              isOpen: true,
              title: '수정 실패',
              message: '태그 업데이트에 실패했습니다. 다시 시도해주세요.',
              variant: 'danger',
              type: 'alert',
              onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
              }
            });
          }
        },
      });
    } else {
      // 변경사항이 없으면 편집 상태만 초기화
      setEditingTag(null);
      setEditName('');
      setEditColor('');
    }
  };

  // 태그 편집 취소 (manage 모드)
  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditName('');
    setEditColor('');
  };

  // 태그 삭제 (manage 모드)
  const handleDeleteTag = (tag: Tag) => {
    if (mode !== 'manage') return;
    
    // 실제 사용량을 다시 계산하여 확인
    const actualUsageCount = notes.filter(note => 
      !note.deleted && !note.archived && note.tags.some(t => t.id === tag.id)
    ).length;
    
    if (actualUsageCount > 0) {
      // 사용 중인 태그 삭제 시도 시 Confirm 모달 표시
      setConfirmModal({
        isOpen: true,
        title: '태그 삭제 불가',
        message: `이 태그는 ${actualUsageCount}개의 활성 노트에서 사용 중입니다. 먼저 노트에서 태그를 제거해주세요.`,
        variant: 'warning',
        type: 'alert',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }
    
    // Confirm 모달 표시
    setConfirmModal({
      isOpen: true,
      title: '태그 삭제',
      message: `태그 "${tag.name}"을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          // 노트에서 사용 중인 태그 제거
          const notesToUpdate = notes.filter(note => 
            note.tags.some(noteTag => noteTag.id === tag.id)
          );

          // 각 노트에서 해당 태그를 제거
          for (const note of notesToUpdate) {
            const updatedTags = note.tags.filter(noteTag => noteTag.id !== tag.id);

            await dispatch(updateNote({
              id: note.id,
              tags: updatedTags
            })).unwrap();
          }

          // Redux store에서 태그 삭제
          await dispatch(deleteTag(tag.id)).unwrap();
          
          // Confirm 모달 닫기
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('태그 삭제 실패:', error);
          setConfirmModal({
            isOpen: true,
            title: '삭제 실패',
            message: '태그 삭제에 실패했습니다. 다시 시도해주세요.',
            variant: 'danger',
            type: 'alert',
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
          });
        }
      },
    });
  };

  // 모달 닫기
  const handleClose = useCallback(() => {
    setSearchTerm('');
    setNewTagName('');
            setNewTagColor('#3b82f6');
    setEditingTag(null);
    setEditName('');
    setEditColor('');
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
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

  if (!isOpen) return null;

  const isSelectMode = mode === 'select';

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-10000
                 max-sm:items-stretch max-sm:justify-stretch"
    >
      {/* 모달 컨텐츠 */}
      <div 
        className={`relative bg-white shadow-xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden
                   sm:rounded-xl sm:${isSelectMode ? 'max-w-md' : 'max-w-2xl'}
                   max-sm:mx-0 max-sm:my-0 max-sm:max-h-screen max-sm:max-w-none max-sm:rounded-none max-sm:h-screen max-sm:w-screen`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSelectMode ? '태그 선택' : '태그 관리'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* 검색 및 새 태그 입력 */}
        <div className="p-6 border-b border-gray-200 space-y-4 flex-shrink-0">
          {/* 검색 */}
          <div>
            <label htmlFor="tagSearch" className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              태그 검색
            </label>
            <input
              id="tagSearch"
              name="tagSearch"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus-blue focus:outline-none transition-colors duration-200"
              placeholder="태그 이름으로 검색"
            />
          </div>

          {/* 새 태그 추가 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="newTagName" className="block text-sm font-medium text-gray-700 mb-2">
                <Plus className="inline w-4 h-4 mr-1" />
                새 태그 추가
              </label>
              <input
                id="newTagName"
                name="newTagName"
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus-blue focus:outline-none transition-colors duration-200"
                placeholder="새 태그 이름 입력"
              />
            </div>
            <div className="flex items-end">
              <label htmlFor="newTagColor" className="block text-sm font-medium text-gray-700 mb-2">
                색상
              </label>
              <input
                id="newTagColor"
                name="newTagColor"
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer ml-2"
                title="태그 색상 선택"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddNewTag}
                disabled={!newTagName.trim()}
                className="px-4 py-2 btn-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 h-10 flex items-center"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        {/* 태그 목록 */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-200px)] sm:max-h-[calc(90vh-200px)] max-sm:max-h-[calc(100vh-200px)]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isSelectMode ? '사용 가능한 태그' : '기존 태그 관리'}
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto"></div>
              <p className="text-gray-500 text-sm">태그를 불러오는 중...</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">사용 가능한 태그가 없습니다.</p>
          ) : (
            <div className={isSelectMode ? "flex flex-wrap gap-2" : "space-y-3"}>
              {filteredTags.map((tag) => {
                const isEditing = editingTag?.id === tag.id;
                const isSelected = isSelectMode && selectedTags.find(t => t.id === tag.id);

                if (isSelectMode) {
                  // Select 모드: 태그 선택/해제 UI
                return (
                  <div
                    key={tag.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'selected' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className={`font-medium text-sm ${isSelected ? 'selected-text' : 'text-gray-900'}`}>
                        {tag.name}
                      </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">({tag.usageCount || 0})</span>
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
                } else {
                  // Manage 모드: 태그 편집/삭제 UI
                  return (
                    <div
                      key={tag.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* 태그 색상 */}
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      
                      {/* 태그 정보 */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                              title="태그 색상 변경"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-gray-900">{tag.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({tag.usageCount || 0}개 노트)</span>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors duration-200"
                              title="저장"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                              title="취소"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(tag)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors duration-200"
                              title="편집"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                              title="삭제"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* 하단 영역 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {isSelectMode && selectedTags.length > 0 && (
            <div className="mb-3">
              <h3 className="text-base font-medium text-gray-900 mb-2">선택된 태그</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: tag.color }}>
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag.name}
                    <button 
                      onClick={() => handleTagToggle(tag)} 
                      className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button 
              onClick={handleClose} 
              className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                isSelectMode 
                  ? 'w-full bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isSelectMode ? '완료' : '완료'}
            </button>
          </div>
        </div>
      </div>
      
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

export default TagModal;
