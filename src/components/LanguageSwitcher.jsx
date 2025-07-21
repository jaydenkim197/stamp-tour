import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${language === 'ko' ? 'active' : ''}`}
        onClick={() => handleLanguageChange('ko')}
        title={t('korean')}
      >
        🇰🇷 한국어
      </button>
      <button
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => handleLanguageChange('en')}
        title={t('english')}
      >
        🇺🇸 English
      </button>
    </div>
  );
};

export default LanguageSwitcher; 