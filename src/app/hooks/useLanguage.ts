import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = useCallback((language: 'ko' | 'en') => {
    i18n.changeLanguage(language);
    try {
      localStorage.setItem('i18nextLng', language);
    } catch {}
  }, [i18n]);

  // 기본 언어는 한국어로 설정하고, 저장된 값이 없으면 저장
  useEffect(() => {
    try {
      const stored = localStorage.getItem('i18nextLng');
      if (!stored) {
        i18n.changeLanguage('ko');
        localStorage.setItem('i18nextLng', 'ko');
      }
    } catch {}
  }, [i18n]);

  const currentLanguage = i18n.language;

  return {
    t,
    changeLanguage,
    currentLanguage,
    isKorean: currentLanguage === 'ko',
    isEnglish: currentLanguage === 'en'
  };
};
