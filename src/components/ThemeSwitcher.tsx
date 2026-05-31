import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-switcher relative p-2.5 rounded-xl border border-emerald-600/20 bg-white/70 hover:bg-emerald-50 dark:bg-darkBg-light/75 dark:hover:bg-darkBg-dark border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 overflow-hidden flex items-center justify-center w-10 h-10"
      aria-label="থিম পরিবর্তন করুন"
      title="থিম পরিবর্তন করুন"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: 45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -45 }}
          transition={{ duration: 0.2 }}
          className="text-emerald-700 dark:text-emerald-400"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
