import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchNotes } from '../features/notes/notesSlice';
import type { Tag } from '../types';
import { DEFAULT_TAGS } from '../constants/noteOptions';
import { X, Plus, Search, Tag as TagIcon } from 'lucide-react';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, selectedTags, onTagsChange }) => {
  const dispatch = useAppDispatch();
  const { notes } = useAppSelector((state) => state.notes);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  // 모든 노트에서 사용 중인 태그들을 추출하고 사용 횟수 계산
  const allUsedTags = notes.reduce((acc, note) => {
    note.tags.forEach((tag) => {
      const existingTag = acc.find(t => t.name === tag.name);
      if (existingTag) {
        existingTag.usageCount = (existingTag.usageCount || 0) + 1;
      } else {
        acc.push({ ...tag, usageCount: 1 });
      }
    });
    return acc;
  }, [] as Tag[]);

  // 기본 태그와 사용 중인 태그를 합치고 중복 제거
  const allAvailableTags = [
    ...DEFAULT_TAGS,
    ...allUsedTags.filter(usedTag => 
      !DEFAULT_TAGS.find(defaultTag => defaultTag.name === usedTag.name)
    )
  ];

  // 검색어에 따라 태그 필터링
  const filteredTags = allAvailableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 새 태그 추가
  const handleAddNewTag = () => {
    if (newTagName.trim() && !allAvailableTags.find(tag => tag.name === newTagName.trim())) {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        color: newTagColor,
        usageCount: 0
      };
      
      const updatedTags = [...selectedTags, newTag];
      onTagsChange(updatedTags);
      setNewTagName('');
      setNewTagColor('#3b82f6');
    }
  };

  // 태그 선택/해제
  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.find(t => t.id === tag.id);
    let updatedTags: Tag[];

    if (isSelected) {
      updatedTags = selectedTags.filter(t => t.id !== tag.id);
    } else {
      updatedTags = [...selectedTags, tag];
    }

    onTagsChange(updatedTags);
  };

  // 모달 닫기 (의존성 안전)
  const handleClose = useCallback(() => {
    setSearchTerm('');
    setNewTagName('');
    setNewTagColor('#3b82f6');
    onClose();
  }, [onClose]);

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
  }, [isOpen, handleClose]);

  // 노트 데이터 로드
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotes());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">태그 선택</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* 검색 및 새 태그 입력 */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* 검색 */}
          <div>
            <label htmlFor="tagSearch" className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              태그 검색
            </label>
            <input
              id="tagSearch"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
              placeholder="태그 이름으로 검색하세요"
            />
          </div>

          {/* 새 태그 추가 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="newTagName" className="block text-sm font-medium text-gray-700 mb-2">
                <Plus className="inline w-4 h-4 mr-1" />
                새 태그 이름
              </label>
              <input
                id="newTagName"
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                placeholder="새 태그 이름을 입력하세요"
              />
            </div>
            <div>
              <label htmlFor="newTagColor" className="block text-sm font-medium text-gray-700 mb-2">
                색상
              </label>
              <input
                id="newTagColor"
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                title="태그 색상 선택"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddNewTag}
                disabled={!newTagName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        {/* 태그 목록 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">사용 가능한 태그</h3>
          {filteredTags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">검색 결과가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const isSelected = selectedTags.find(t => t.id === tag.id);
                const isCustomTag = !DEFAULT_TAGS.find(t => t.name === tag.name);
                return (
                  <div
                    key={tag.id}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                    <span className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{tag.name}</span>
                    {isCustomTag && (
                      <span className="text-xs text-gray-500 flex-shrink-0">({tag.usageCount || 0})</span>
                    )}
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 선택된 태그 표시 */}
        {selectedTags.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-3">선택된 태그</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: tag.color }}>
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                  <button onClick={() => handleTagToggle(tag)} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button onClick={handleClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
