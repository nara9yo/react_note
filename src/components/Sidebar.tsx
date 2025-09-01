import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectAllNotes } from '../features/notes/notesSlice';
import type { Tag } from '../types';
import {
  BookOpen,
  Tag as TagIcon,
  Archive,
  Trash2,
  X
} from 'lucide-react';

interface SidebarProps {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  onViewChange: (view: 'notes' | 'archive' | 'trash') => void;
  currentView: 'notes' | 'archive' | 'trash';
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedTag,
  onTagSelect,
  onViewChange,
  currentView,
  searchTerm,
  onSearchChange,
  onClose
}) => {
  const notes = useAppSelector(selectAllNotes);

  // 태그별 노트 개수 계산 (active notes만 포함)
  const getTagCounts = () => {
    const tagCounts: { [key: string]: number } = {};
    const allTags: Tag[] = [];
    
    // archive되거나 deleted된 노트 제외
    const activeNotes = notes.filter(note => !note.archived && !note.deleted);
    
    activeNotes.forEach(note => {
      if (note.tags.length === 0) {
        tagCounts['untagged'] = (tagCounts['untagged'] || 0) + 1;
      } else {
        note.tags.forEach(tag => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
          if (!allTags.find(t => t.id === tag.id)) {
            allTags.push(tag);
          }
        });
      }
    });

    return { tagCounts, allTags };
  };

  // Archive용 태그별 노트 개수 계산
  const getArchivedTagCounts = () => {
    const tagCounts: { [key: string]: number } = {};
    const allTags: Tag[] = [];
    
    // archived된 노트만 포함 (deleted 제외)
    const archivedNotes = notes.filter(note => note.archived && !note.deleted);
    
    archivedNotes.forEach(note => {
      if (note.tags.length === 0) {
        tagCounts['untagged'] = (tagCounts['untagged'] || 0) + 1;
      } else {
        note.tags.forEach(tag => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
          if (!allTags.find(t => t.id === tag.id)) {
            allTags.push(tag);
          }
        });
      }
    });

    return { tagCounts, allTags };
  };

  const { tagCounts, allTags } = getTagCounts();
  const { tagCounts: archivedTagCounts, allTags: archivedAllTags } = getArchivedTagCounts();

  // 전체 노트 개수 (active notes만)
  const totalNotesCount = notes.filter(note => !note.archived && !note.deleted).length;

  // 보관된 노트 개수
  const archivedNotesCount = notes.filter(note => note.archived && !note.deleted).length;

  // 삭제된 노트 개수
  const deletedNotesCount = notes.filter(note => note.deleted).length;

  // Trash용 태그별 노트 개수 계산
  const getDeletedTagCounts = () => {
    const tagCounts: { [key: string]: number } = {};
    const allTags: Tag[] = [];

    const deletedNotes = notes.filter(note => note.deleted);

    deletedNotes.forEach(note => {
      if (note.tags.length === 0) {
        tagCounts['untagged'] = (tagCounts['untagged'] || 0) + 1;
      } else {
        note.tags.forEach(tag => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
          if (!allTags.find(t => t.id === tag.id)) {
            allTags.push(tag);
          }
        });
      }
    });

    return { tagCounts, allTags };
  };

  const { tagCounts: deletedTagCounts, allTags: deletedAllTags } = getDeletedTagCounts();

  const handleTagClick = (tagName: string | null) => {
    onTagSelect(tagName);
  };

  const handleViewChange = (view: 'notes' | 'archive' | 'trash') => {
    onViewChange(view);
    onTagSelect(null); // 뷰 변경 시 태그 선택 해제
  };



  return (
    <div className="w-64 bg-yellow-50 border-r border-yellow-200 h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-yellow-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-800">React Note</h1>
        </div>
        {/* 모바일에서만 닫기 버튼 표시 */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-yellow-100 transition-colors duration-200 md:hidden"
            aria-label="사이드바 닫기"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* 검색 및 정렬 */}
      <div className="p-4 border-b border-yellow-200 space-y-3">
        <div className="relative">
          <label htmlFor="search-notes" className="sr-only">
            노트 검색
          </label>
          <input
            id="search-notes"
            name="search-notes"
            type="text"
            placeholder="노트의 제목을 입력해주세요."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none text-sm"
          />
        </div>

      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          {/* Notes 섹션 */}
          <div className="p-4">
            <div 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                currentView === 'notes' && !selectedTag 
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'hover:bg-yellow-100 text-gray-700'
              }`}
              onClick={() => handleViewChange('notes')}
            >
              <BookOpen size={20} />
              <span className="font-medium">Notes</span>
              <span className="ml-auto text-sm text-gray-500">({totalNotesCount})</span>
            </div>

            {/* 태그별 분류 */}
            {currentView === 'notes' && (
              <div className="mt-3 space-y-1">
                {/* 태그 미지정 */}
                {tagCounts['untagged'] > 0 && (
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                      selectedTag === 'untagged' 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'hover:bg-yellow-100 text-gray-600'
                    }`}
                    onClick={() => handleTagClick('untagged')}
                  >
                    <TagIcon size={16} />
                    <span className="text-sm">태그 미지정</span>
                    <span className="ml-auto text-xs text-gray-500">({tagCounts['untagged']})</span>
                  </div>
                )}

                {/* 태그별 분류 */}
                {allTags.map(tag => (
                  <div 
                    key={tag.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                      selectedTag === tag.name 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'hover:bg-yellow-100 text-gray-600'
                    }`}
                    onClick={() => handleTagClick(tag.name)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                    <span className="ml-auto text-xs text-gray-500">({tagCounts[tag.name]})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archive 섹션 */}
          <div className="p-4 border-t border-yellow-200">
            <div 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                currentView === 'archive' && !selectedTag
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'hover:bg-yellow-100 text-gray-700'
              }`}
              onClick={() => handleViewChange('archive')}
            >
              <Archive size={20} />
              <span className="font-medium">Archive</span>
              <span className="ml-auto text-sm text-gray-500">({archivedNotesCount})</span>
            </div>

            {/* Archive의 태그별 분류 */}
            {currentView === 'archive' && (
              <div className="mt-3 space-y-1">
                {/* 태그 미지정 */}
                {archivedTagCounts['untagged'] > 0 && (
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                      selectedTag === 'untagged' 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'hover:bg-yellow-100 text-gray-600'
                    }`}
                    onClick={() => handleTagClick('untagged')}
                  >
                    <TagIcon size={16} />
                    <span className="text-sm">태그 미지정</span>
                    <span className="ml-auto text-xs text-gray-500">({archivedTagCounts['untagged']})</span>
                  </div>
                )}

                {/* 태그별 분류 */}
                {archivedAllTags.map(tag => (
                  <div 
                    key={tag.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                      selectedTag === tag.name 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'hover:bg-yellow-100 text-gray-600'
                    }`}
                    onClick={() => handleTagClick(tag.name)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                    <span className="ml-auto text-xs text-gray-500">({archivedTagCounts[tag.name]})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trash 섹션 */}
          <div className="p-4 border-t border-yellow-200">
            <div 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                currentView === 'trash' 
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'hover:bg-yellow-100 text-gray-700'
              }`}
              onClick={() => handleViewChange('trash')}
            >
              <Trash2 size={20} />
              <span className="font-medium">Trash</span>
              <span className="ml-auto text-xs text-gray-500">({deletedNotesCount})</span>
            </div>

            {/* Trash의 태그별 분류 */}
            {currentView === 'trash' && (
              <div className="mt-3 space-y-1">
                {/* 태그 미지정 */}
                {deletedTagCounts['untagged'] > 0 && (
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                      selectedTag === 'untagged' 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'hover:bg-yellow-100 text-gray-600'
                    }`}
                    onClick={() => handleTagClick('untagged')}
                  >
                    <TagIcon size={16} />
                    <span className="text-sm">태그 미지정</span>
                    <span className="ml-auto text-xs text-gray-500">({deletedTagCounts['untagged']})</span>
                  </div>
                )}

                {/* 태그별 분류 */}
                {deletedAllTags.map(tag => (
                  <div 
                    key={tag.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                      selectedTag === tag.name 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'hover:bg-yellow-100 text-gray-600'
                    }`}
                    onClick={() => handleTagClick(tag.name)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                    <span className="ml-auto text-xs text-gray-500">({deletedTagCounts[tag.name]})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
