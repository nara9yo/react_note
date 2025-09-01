import React, { useState } from 'react';
import { useAppDispatch } from '../app/hooks';
import { addNewNote } from '../features/notes/notesSlice';
import { CreateNoteData } from '../types';
import { Plus, X } from 'lucide-react';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 노트 생성 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === '') {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const noteData: CreateNoteData = {
        title: title.trim(),
        content: content.trim(),
      };
      
      await dispatch(addNewNote(noteData)).unwrap();
      
      // 성공 시 폼 초기화 및 모달 닫기
      setTitle('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('노트 생성 실패:', error);
      alert('노트 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 시 폼 초기화
  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  // ESC 키로 모달 닫기
  React.useEffect(() => {
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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">새 노트 작성</h2>
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
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
              placeholder="노트 내용을 입력하세요"
              rows={8}
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>생성하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoteModal;
