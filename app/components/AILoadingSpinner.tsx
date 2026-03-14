"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AILoadingSpinner() {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-full bg-black/20 rounded-xl border border-purple-500/20 backdrop-blur-sm min-h-[300px]">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500 animate-spin" style={{ animationDuration: '3s' }}></div>
        {/* Middle rotating ring (reverse) */}
        <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        {/* Inner pulsing core */}
        <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse shadow-[0_0_20px_purple]"></div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-2">
        <h3 className="text-purple-300 font-bold tracking-widest text-sm uppercase animate-pulse">
            {language === 'ja' ? 'AIデータ解析中...' : 'Analyzing AI Data...'}
        </h3>
        <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}
