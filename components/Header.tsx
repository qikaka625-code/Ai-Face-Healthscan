import React from 'react';
import { Activity, Menu } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#1e1e1e] border-b border-[#333]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-medium text-gray-100">AI FaceHealth Scan</h1>
          <p className="text-xs text-gray-400">Powered by Gemini 3.0 Pro</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex bg-[#121212] rounded-lg p-1 border border-[#333]">
          <button
            onClick={() => setLanguage('zh')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              language === 'zh' 
                ? 'bg-[#333] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage('vi')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              language === 'vi' 
                ? 'bg-[#333] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Tiếng Việt
          </button>
        </div>
        <button className="p-2 hover:bg-[#333] rounded-full transition-colors text-gray-400">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;