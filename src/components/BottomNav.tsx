import React from 'react';
import { ClipboardList, PlusCircle, Menu } from 'lucide-react';

export type MainTab = 'orders' | 'create' | 'menu';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  orderCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, orderCount }) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100/80 shadow-[0_-4px_25px_rgba(109,40,217,0.08)] pb-safe"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 h-16 items-center px-4">
        {/* 1. My Orders */}
        <button
          type="button"
          onClick={() => onChangeTab('orders')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group ${
            activeTab === 'orders' ? 'text-[#6D28D9]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <ClipboardList
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'orders' ? 'scale-110 stroke-[2.4]' : 'group-hover:scale-105'
              }`}
            />
            {typeof orderCount === 'number' && orderCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-[#6D28D9] text-white text-[10px] font-bold rounded-full min-w-[16px] text-center shadow-xs">
                {orderCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] font-semibold tracking-tight mt-1 transition-colors ${
              activeTab === 'orders' ? 'text-[#6D28D9]' : 'text-gray-500'
            }`}
          >
            My Orders
          </span>
          {activeTab === 'orders' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] absolute bottom-1" />
          )}
        </button>

        {/* 2. Create Order (Highlighted center action) */}
        <button
          type="button"
          onClick={() => onChangeTab('create')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group ${
            activeTab === 'create' ? 'text-[#6D28D9]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div
            className={`w-10 h-10 -mt-2 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] text-white shadow-purple-500/30 scale-105 ring-2 ring-purple-300'
                : 'bg-purple-50 text-[#6D28D9] group-hover:bg-purple-100'
            }`}
          >
            <PlusCircle className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span
            className={`text-[11px] font-bold tracking-tight mt-0.5 transition-colors ${
              activeTab === 'create' ? 'text-[#6D28D9]' : 'text-gray-500'
            }`}
          >
            Create Order
          </span>
        </button>

        {/* 3. Menu */}
        <button
          type="button"
          onClick={() => onChangeTab('menu')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group ${
            activeTab === 'menu' ? 'text-[#6D28D9]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Menu
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'menu' ? 'scale-110 stroke-[2.4]' : 'group-hover:scale-105'
            }`}
          />
          <span
            className={`text-[11px] font-semibold tracking-tight mt-1 transition-colors ${
              activeTab === 'menu' ? 'text-[#6D28D9]' : 'text-gray-500'
            }`}
          >
            Menu
          </span>
          {activeTab === 'menu' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] absolute bottom-1" />
          )}
        </button>
      </div>
    </nav>
  );
};
