import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../app/hooks/useLanguage';
import type { SortOptions, PrioritySortOrder, DateSortOrder } from '../types';

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortOptions: SortOptions;
  onSortOptionsChange: (options: SortOptions) => void;
}

const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  sortOptions,
  onSortOptionsChange
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const handlePriorityChange = (order: PrioritySortOrder | null) => {
    onSortOptionsChange({
      ...sortOptions,
      priority: order
    });
  };

  const handleDateChange = (order: DateSortOrder) => {
    onSortOptionsChange({
      ...sortOptions,
      date: order
    });
  };

  const handleClear = () => {
    onSortOptionsChange({
      priority: null,
      date: 'created'
    });
  };

  const getPriorityLabel = (priority: PrioritySortOrder) => {
    return priority === 'low-to-high' ? t('sort.priority.lowToHigh') : t('sort.priority.highToLow');
  };

  const getDateLabel = (date: DateSortOrder) => {
    switch (date) {
      case 'created':
        return t('sort.date.created');
      case 'edited':
        return t('sort.date.edited');
      default:
        return t('sort.date.created');
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-sort-modal">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('menu.sort')}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              CLEAR
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 우선순위 정렬 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">{t('sort.priority')}:</h3>
          <div className="space-y-2">
            {(['low-to-high', 'high-to-low'] as const).map((order) => (
              <label key={order} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  checked={sortOptions.priority === order}
                  onChange={() => handlePriorityChange(order)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{getPriorityLabel(order)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 날짜 정렬 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">{t('sort.date')}:</h3>
          <div className="space-y-2">
            {(['created', 'edited'] as const).map((order) => (
              <label key={order} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="date"
                  checked={sortOptions.date === order}
                  onChange={() => handleDateChange(order)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{getDateLabel(order)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortModal;
