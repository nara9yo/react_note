import { useState, Suspense, lazy, useEffect } from 'react';
import { Provider } from 'react-redux';
import { useAppSelector } from './app/hooks';
import { store } from './app/store';
import { selectAllNotes } from './features/notes/notesSlice';
import { Plus, BookOpen, Menu, X, Archive, Trash2, Tag as TagIcon } from 'lucide-react';

// 지연 로딩을 위한 컴포넌트
const NoteList = lazy(() => import('./components/NoteList'));
const NoteModal = lazy(() => import('./components/NoteModal'));
const Sidebar = lazy(() => import('./components/Sidebar'));

function AppContent() {
  const notes = useAppSelector(selectAllNotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'notes' | 'archive' | 'trash'>('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지 및 모바일 여부 확인
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md 브레이크포인트
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // 데스크톱에서는 사이드바 기본 표시
      } else {
        setIsSidebarOpen(false); // 모바일에서는 사이드바 기본 숨김
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    // 모바일에서 태그 선택 시 사이드바 자동 닫기
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleViewChange = (view: 'notes' | 'archive' | 'trash') => {
    setCurrentView(view);
    // 모바일에서 뷰 변경 시 사이드바 자동 닫기
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // 현재 선택된 메뉴 정보 가져오기
  const getCurrentMenuInfo = () => {
    if (selectedTag === 'untagged') {
      return {
        icon: <TagIcon size={20} className="text-gray-600" />,
        title: '태그 미지정',
        textClass: 'text-gray-600'
      };
    } else if (selectedTag) {
      // 노트에서 사용 중인 태그에서 찾기
      let foundTag = undefined as undefined | { name: string; color: string };
      for (const note of notes) {
        const noteTag = note.tags.find(tag => tag.name === selectedTag);
        if (noteTag) {
          foundTag = noteTag;
          break;
        }
      }
      if (foundTag) {
        return {
          icon: <TagIcon size={20} style={{ color: foundTag.color }} />,
          title: foundTag.name,
          color: foundTag.color
        };
      }
    }

          // 기본 뷰 (Notes, Archive, Trash)
      switch (currentView) {
        case 'archive':
          return {
            icon: <Archive size={20} className="text-gray-600" />,
            title: 'Archive',
            textClass: 'text-gray-600'
          };
        case 'trash':
          return {
            icon: <Trash2 size={20} className="text-gray-600" />,
            title: 'Trash',
            textClass: 'text-gray-600'
          };
        default:
          return {
            icon: <BookOpen size={20} className="text-gray-600" />,
            title: 'Notes',
            textClass: 'text-gray-600'
          };
      }
  };

  const currentMenu = getCurrentMenuInfo();

  return (
    <div className="min-h-screen bg-gray-50">
        {/* 메인 컨텐츠 영역 */}
        <div className="flex h-screen">
          {/* 사이드바 */}
          <Suspense fallback={
            <div className="w-64 bg-yellow-50 border-r border-yellow-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          }>
            <div className={`
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
              transition-transform duration-300 ease-in-out
            `}>
                          <Sidebar
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
              onViewChange={handleViewChange}
              currentView={currentView}
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              onClose={closeSidebar}
            />
            </div>
          </Suspense>

          {/* 모바일에서 사이드바가 열려있을 때 오버레이 */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* 메인 콘텐츠 */}
          <main className={`flex-1 flex flex-col transition-all duration-300 ${
            isMobile && isSidebarOpen ? 'ml-0' : ''
          }`}>
            {/* 헤더 */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    {/* 모바일 사이드바 토글 버튼 */}
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden"
                      aria-label="사이드바 토글"
                    >
                      {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    
                    {/* 현재 선택된 메뉴 표시 */}
                    <div className="flex items-center space-x-3">
                      {currentMenu.icon}
                      <h1 
                        className={`text-2xl font-bold ${currentMenu.textClass || ''}`}
                        style={currentMenu.color ? { color: currentMenu.color } : {}}
                      >
                        {currentMenu.title}
                      </h1>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>새 노트</span>
                  </button>
                </div>
              </div>
            </header>

            {/* 노트 리스트 */}
            <div className="flex-1 p-6 overflow-y-auto">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }>
                <NoteList
                  selectedTag={selectedTag}
                  currentView={currentView}
                  searchTerm={searchTerm}
                />
              </Suspense>
            </div>
          </main>
        </div>

        {/* 노트 생성 모달 */}
        <Suspense fallback={null}>
          <NoteModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            mode="create"
            preselectedTag={selectedTag}
          />
        </Suspense>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
