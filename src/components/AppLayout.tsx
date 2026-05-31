import { type ReactNode } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { History, HelpCircle, Settings } from 'lucide-react';
import { convertToBanglaNumber } from '../utils/banglaNumber';

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export function AppLayout({
  children,
  activeTab,
  setActiveTab,
  historyCount,
  onOpenHistory
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-darkBg-darkest text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Premium Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-darkBg-dark/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md shadow-emerald-900/10 dark:shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-350">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="nav-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fbbf24" />
                    <stop offset="100%" stop-color="#d97706" />
                  </linearGradient>
                  <linearGradient id="nav-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#34d399" />
                    <stop offset="100%" stop-color="#064e3b" />
                  </linearGradient>
                </defs>
                <path d="M 50 5 L 85 25 L 85 75 L 50 95 L 15 75 L 15 25 Z" fill="url(#nav-emerald-grad)" stroke="url(#nav-gold-grad)" stroke-width="3" stroke-linejoin="round" />
                <path d="M 50 30 L 50 65 M 35 40 L 65 40 M 35 40 L 30 55 M 35 40 L 40 55 M 65 40 L 60 55 M 65 40 L 70 55 M 35 55 L 25 55 A 1 1 0 0 0 45 55 Z M 65 55 L 55 55 A 1 1 0 0 0 75 55 Z M 40 65 L 60 65" stroke="url(#nav-gold-grad)" stroke-width="3.5" stroke-linecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 dark:text-white font-siliguri m-0 leading-none">
                দ্বীনি হিসাব
              </h1>
              <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium font-siliguri mt-1 leading-none">
                আপনার দ্বীনি হিসাব ও যোগ্যতা যাচাই এক প্ল্যাটফর্মে
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links & Actions */}
          <div className="flex items-center gap-3">


            {/* History Trigger Button */}
            <button
              onClick={onOpenHistory}
              className="relative p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-darkBg-light/75 hover:bg-emerald-50 dark:hover:bg-darkBg-dark text-emerald-800 dark:text-emerald-400 flex items-center justify-center transition-all w-10 h-10"
              title="হিসাবের ইতিহাস"
            >
              <History className="w-5 h-5" />
              {historyCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-600 dark:bg-gold-600 border-2 border-white dark:border-darkBg-darkest text-[10px] font-bold text-white font-siliguri animate-bounce">
                  {convertToBanglaNumber(historyCount)}
                </span>
              )}
            </button>

            {/* Settings Trigger Button */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2.5 rounded-xl border transition-all w-10 h-10 flex items-center justify-center ${
                activeTab === 'settings'
                  ? 'border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-darkBg-light/75 hover:bg-emerald-50 dark:hover:bg-darkBg-dark text-emerald-800 dark:text-emerald-400'
              }`}
              title="সেটিংস"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Theme switcher */}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-8">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-white dark:bg-darkBg-light/50 border-t border-gray-200/50 dark:border-gray-800/50 py-8 sm:py-12 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-emerald-950 dark:text-white font-siliguri">ইসলামী বিধানের ভিত্তি</h3>
          </div>
          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri">
            দ্বীনি হিসাব প্ল্যাটফর্মের হিসাবসমূহ মূলত কুরআন, সহীহ হাদীস এবং নির্ভরযোগ্য ইসলামী ফিকহ ও হানাফি মাযহাবের মূলনীতি অনুযায়ী সুনির্দিষ্ট নিয়মে প্রণয়ন করা হয়েছে। যাকাত, মীরাস এবং উশরের মতো বাধ্যবাধকতার ক্ষেত্রে জটিল বা সংবেদনশীল বিষয়গুলোর জন্য কোনো যোগ্য মুফতি বা আলেমের সাথে সরাসরি পরামর্শ করার জন্য ব্যবহারকারীকে বিশেষভাবে অনুরোধ জানানো হচ্ছে।
          </p>
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-6 sm:my-8 max-w-sm mx-auto" />
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-siliguri">
            © ১৪৪৭ হিজরি - ২০২৬ দ্বীনি হিসাব। সর্বস্বত্ব সংরক্ষিত। এটি একটি উন্মুক্ত ইসলামী গাইড ও ফাইন্যান্সিয়াল প্ল্যাটফর্ম।
          </p>
        </div>
      </footer>
    </div>
  );
}
