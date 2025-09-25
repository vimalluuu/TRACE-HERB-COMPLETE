import React, { useState, useEffect } from 'react';
import { LANGUAGES, t } from '../utils/simpleTranslations';

// Language selection modal/screen
export const LanguageSelectionModal = ({ onLanguageSelect, currentLanguage = 'en' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌿</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('selectLanguage', currentLanguage)}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(LANGUAGES).map(([code, language]) => (
            <button
              key={code}
              onClick={() => onLanguageSelect(code)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${currentLanguage === code
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    {language.nativeName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language.name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Language switch button for header
export const LanguageSwitchButton = ({ currentLanguage, onLanguageChange }) => {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{LANGUAGES[currentLanguage]?.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {LANGUAGES[currentLanguage]?.nativeName}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showSelector && (
        <LanguageSelectionModal
          currentLanguage={currentLanguage}
          onLanguageSelect={(lang) => {
            onLanguageChange(lang);
            setShowSelector(false);
          }}
        />
      )}
    </>
  );
};

// Simple dropdown component
export const SimpleDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  required = false,
  language = 'en'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herb-green-500 focus:border-transparent text-left bg-white"
      >
        <div className="flex justify-between items-center">
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  LanguageSelectionModal,
  LanguageSwitchButton,
  SimpleDropdown
};
