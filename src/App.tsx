// React 훅 및 컴포넌트 import
import { useState, Suspense, lazy, useEffect } from 'react';
// Redux 관련 import
import { Provider } from 'react-redux';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { store } from './app/store';
// Redux 슬라이스에서 액션 및 셀렉터 import
import { selectAllNotes } from './features/notes/notesSlice';
import { fetchTags, updateAllTagsUsageCount } from './features/tags/tagsSlice';
// Lucide React 아이콘 import
import { Plus, BookOpen, Menu, X, Archive, Trash2, Tag as TagIcon } from 'lucide-react';
// 다국어 훅 import
import { useLanguage } from './app/hooks/useLanguage';
// UI 상수 import
// UI 상수는 이제 CSS 클래스로 관리됨 (index.css 참조)

// 지연 로딩을 위한 컴포넌트들
// - 코드 스플리팅으로 초기 번들 크기 최적화
// - 사용자가 실제로 필요할 때만 컴포넌트 로드
const NoteList = lazy(() => import('./components/NoteList'));
const NoteModal = lazy(() => import('./components/NoteModal'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const TagModal = lazy(() => import('./components/TagModal'));
// const LanguageSelector = lazy(() => import('./components/LanguageSelector'));

// 메인 앱 콘텐츠 컴포넌트
function AppContent() {
  // Redux 관련 훅들
  const dispatch = useAppDispatch(); // Redux 액션 디스패치 함수
  const notes = useAppSelector(selectAllNotes); // 모든 노트 데이터
  const { t } = useLanguage(); // 다국어 번역 함수
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false); // 노트 생성/편집 모달
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false); // 태그 관리 모달
  
  // 필터링 및 뷰 상태
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // 선택된 태그
  const [currentView, setCurrentView] = useState<'notes' | 'archive' | 'trash'>('notes'); // 현재 뷰
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  
  // UI 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열림/닫힘
  const [isMobile, setIsMobile] = useState(false); // 모바일 화면 여부

  // 화면 크기 감지 및 모바일 여부 확인
  // - 반응형 디자인을 위한 화면 크기 모니터링
  // - 768px 미만을 모바일로 간주 (Tailwind CSS md 브레이크포인트)
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

    checkScreenSize(); // 초기 화면 크기 확인
    window.addEventListener('resize', checkScreenSize); // 리사이즈 이벤트 리스너 등록

    // 클린업: 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [t]);

  // 앱 시작 시 태그 초기화
  // - Firebase에서 태그 데이터 로드
  // - 각 태그의 사용량 카운트 업데이트
  useEffect(() => {
    const initializeTags = async () => {
      try {
        // Firebase에서 태그 목록 로드
        await dispatch(fetchTags()).unwrap();

        // 각 태그의 사용량 카운트 업데이트
        await dispatch(updateAllTagsUsageCount()).unwrap();
      } catch (error) {
        console.error(t('error.tagInitFailed'), error);
        // 오류가 발생해도 앱은 계속 실행 (태그 기능만 제한됨)
      }
    };

    initializeTags();
  }, [dispatch, t]);

  // 태그 선택 핸들러
  // - 선택된 태그로 노트 필터링
  // - 모바일에서는 태그 선택 후 사이드바 자동 닫기
  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    // 모바일에서 태그 선택 시 사이드바 자동 닫기
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // 뷰 변경 핸들러 (Notes, Archive, Trash)
  // - 현재 보기 모드 변경
  // - 모바일에서는 뷰 변경 후 사이드바 자동 닫기
  const handleViewChange = (view: 'notes' | 'archive' | 'trash') => {
    setCurrentView(view);
    // 모바일에서 뷰 변경 시 사이드바 자동 닫기
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // 검색어 변경 핸들러
  // - 노트 제목 및 내용에서 검색어로 필터링
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // 사이드바 토글 핸들러
  // - 사이드바 열림/닫힘 상태 전환
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 사이드바 닫기 핸들러
  // - 모바일에서만 사이드바 닫기 (데스크톱에서는 항상 열려있음)
  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // 현재 선택된 메뉴 정보 가져오기
  // - 헤더에 표시할 아이콘, 제목, 스타일 정보 반환
  // - 태그 선택 시: 태그 아이콘과 색상
  // - 기본 뷰 시: 해당 뷰의 아이콘과 제목
  const getCurrentMenuInfo = () => {
    // 미분류 노트 태그인 경우
    if (selectedTag === 'untagged') {
      return {
        icon: <TagIcon size={20} className="text-gray-600" />,
        title: t('message.untagged'),
        textClass: 'text-gray-600'
      };
    } 
    // 특정 태그가 선택된 경우
    else if (selectedTag) {
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
          title: t('menu.archive'),
          textClass: 'text-gray-600'
        };
      case 'trash':
        return {
          icon: <Trash2 size={20} className="text-gray-600" />,
          title: t('menu.trash'),
          textClass: 'text-gray-600'
        };
      default:
        return {
          icon: <BookOpen size={20} className="text-gray-600" />,
          title: t('menu.notes'),
          textClass: 'text-gray-600'
        };
    }
  };

  const currentMenu = getCurrentMenuInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 컨텐츠 영역 */}
      <div className="flex h-screen">
        {/* 사이드바 영역 */}
        {/* - 지연 로딩으로 초기 번들 크기 최적화 */}
        {/* - 모바일에서는 오버레이로 표시, 데스크톱에서는 고정 */}
        <Suspense fallback={
          <div className="w-64 bg-yellow-50 border-r border-yellow-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        }>
          <div 
            className={`
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              ${isMobile ? 'fixed inset-y-0 left-0 z-sidebar-mobile' : 'relative'}
              transition-transform ease-in-out transition-normal
            `}
          >
            <Sidebar
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
              onViewChange={handleViewChange}
              currentView={currentView}
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              onClose={closeSidebar}
              onTagManagementOpen={() => setIsTagManagementOpen(true)}
            />
          </div>
        </Suspense>

        {/* 모바일에서 사이드바가 열려있을 때 오버레이 */}
        {/* - 사이드바 외부 클릭 시 사이드바 닫기 */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 md:hidden backdrop-blur-xs z-overlay"
            onClick={closeSidebar}
          />
        )}

        {/* 메인 콘텐츠 영역 */}
        <main 
          className={`flex-1 flex flex-col transition-all transition-normal ${isMobile && isSidebarOpen ? 'ml-0' : ''}`}
        >
          {/* 상단 헤더 */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                  {/* 모바일 사이드바 토글 버튼 */}
                  {/* - 모바일에서만 표시되는 햄버거 메뉴 버튼 */}
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden"
                    aria-label={t('aria.toggleSidebar')}
                  >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>

                  {/* 현재 선택된 메뉴 표시 */}
                  {/* - 선택된 태그나 뷰에 따른 아이콘과 제목 */}
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
                <div className="flex items-center space-x-4">
                  {/* 새 노트 생성 버튼 */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>{t('menu.newNote')}</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* 노트 리스트 영역 */}
          {/* - 선택된 태그, 뷰, 검색어에 따른 노트 필터링 표시 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
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

      {/* 노트 생성/편집 모달 */}
      {/* - 새 노트 생성 또는 기존 노트 편집 */}
      <Suspense fallback={null}>
        <NoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode="create"
          preselectedTag={selectedTag}
        />
      </Suspense>

      {/* 태그 관리 모달 */}
      {/* - 태그 생성, 수정, 삭제 기능 */}
      <Suspense fallback={null}>
        <TagModal
          isOpen={isTagManagementOpen}
          onClose={() => setIsTagManagementOpen(false)}
          mode="manage"
        />
      </Suspense>
    </div>
  );
}

// 메인 App 컴포넌트
// - Redux Provider로 앱 전체에 스토어 제공
// - AppContent 컴포넌트를 감싸서 Redux 상태 관리 활성화
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
