import React from 'react';
import { useLanguage } from '../lib/i18n';
import type { Language } from '../lib/i18n';
import 'flag-icons/css/flag-icons.min.css';

const languages: { code: Language; flag: string; label: string }[] = [
  { code: 'si', flag: 'fi-si', label: 'SI' },
  { code: 'en', flag: 'fi-us', label: 'EN' },
  { code: 'de', flag: 'fi-de', label: 'DE' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 backdrop-blur-sm">
      {languages.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            language === code
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className={`fi ${flag}`} />
          {label}
        </button>
      ))}
    </div>
  );
};
