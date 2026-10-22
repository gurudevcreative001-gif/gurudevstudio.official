import React from 'react';
import { MessageCircle, ShieldCheck, Film } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100/60 px-4 py-3 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] flex items-center justify-center text-white shadow-sm shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-gray-900 tracking-tight truncate leading-tight">
                gurudevstudio.official
              </h1>
            </div>
            <p className="text-[11px] font-medium text-purple-700/90 truncate leading-none">
              Video Editing Studio
            </p>
          </div>
        </div>

        {/* Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://wa.me/919909404141?text=Hello%20gurudevstudio.official,%20I%20have%20an%20inquiry%20about%20video%20editing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors border border-emerald-200/60"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600/20 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isAdminLoggedIn
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
            title="Admin Studio Portal"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-purple-600' : 'text-gray-500'}`} />
            <span>{isAdminLoggedIn ? 'Admin Active' : 'Admin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
