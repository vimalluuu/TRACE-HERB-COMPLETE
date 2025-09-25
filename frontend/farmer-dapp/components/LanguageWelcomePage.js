import React, { useState } from 'react';
import { LANGUAGES, t } from '../utils/simpleTranslations';

const LanguageWelcomePage = ({ onLanguageSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setShowDropdown(false);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onLanguageSelect(selectedLanguage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
            TRACE HERB
          </h1>
          <p className="text-lg text-gray-600 font-medium mb-6">
            Farmer Portal
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto"></div>
        </div>

        {/* Language Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {selectedLanguage ? t('selectLanguage', selectedLanguage) : 'Select Your Language'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {selectedLanguage ? t('selectLanguage', selectedLanguage) : 'Choose your preferred language to continue'}
          </p>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 text-left bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                {selectedLanguage ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{LANGUAGES[selectedLanguage]?.flag}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {LANGUAGES[selectedLanguage]?.nativeName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {LANGUAGES[selectedLanguage]?.name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 font-medium">Choose your language / अपनी भाषा चुनें</span>
                )}
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Options */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                {Object.entries(LANGUAGES).map(([code, language]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageSelect(code)}
                    className={`
                      w-full p-4 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl
                      ${selectedLanguage === code ? 'bg-green-50 border-green-200' : ''}
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
                      {selectedLanguage === code && (
                        <div className="ml-auto">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedLanguage}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg
            ${selectedLanguage 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-green-200 hover:shadow-green-300 transform hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {selectedLanguage ? t('continue', selectedLanguage) : 'Continue / जारी रखें'}
        </button>

        {/* Language Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can change your language anytime from the settings
          </p>
          <p className="text-sm text-gray-500">
            आप सेटिंग्स से कभी भी अपनी भाषा बदल सकते हैं
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-medium text-gray-700">Mobile Friendly</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl mb-2">🌿</div>
            <div className="text-sm font-medium text-gray-700">Easy Herb Entry</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium text-gray-700">No Typing Required</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-xl">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-sm font-medium text-gray-700">Secure & Private</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageWelcomePage;
