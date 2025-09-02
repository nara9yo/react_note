import React from 'react';
import { useLanguage } from '../app/hooks/useLanguage';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <button
        type="button"
        onClick={() => changeLanguage('ko')}
        className={`text-sm transition-colors ${currentLanguage === 'ko' ? 'font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
        style={{ color: currentLanguage === 'ko' ? 'var(--color-primary)' : undefined }}
        aria-pressed={currentLanguage === 'ko'}
      >
        한국어
      </button>
      <span className="text-gray-400">|</span>
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`text-sm transition-colors ${currentLanguage === 'en' ? 'font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
        style={{ color: currentLanguage === 'en' ? 'var(--color-primary)' : undefined }}
        aria-pressed={currentLanguage === 'en'}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSelector;
