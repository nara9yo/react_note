import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import NoteList from './components/NoteList';
import NoteModal from './components/NoteModal';
import { Plus, BookOpen } from 'lucide-react';

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
                <h1 className="text-2xl font-bold text-gray-900">노트 앱</h1>
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
          <NoteList />
        </main>

        {/* 노트 생성 모달 */}
        <NoteModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          mode="create"
        />
      </div>
    </Provider>
  );
}

export default App;
