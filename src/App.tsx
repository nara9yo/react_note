import { useState, Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { Plus, BookOpen } from 'lucide-react';

// 지연 로딩을 위한 컴포넌트
const NoteList = lazy(() => import('./components/NoteList'));
const NoteModal = lazy(() => import('./components/NoteModal'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">React Note</h1>
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

        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <NoteList />
          </Suspense>
        </main>

        {/* 노트 생성 모달 */}
        <Suspense fallback={null}>
          <NoteModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            mode="create"
          />
        </Suspense>
      </div>
    </Provider>
  );
}

export default App;
