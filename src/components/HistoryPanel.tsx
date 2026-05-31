import { type HistoryEntry } from '../hooks/useHistory';
import { History, Trash2, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  isOpen,
  onClose,
  history,
  onSelectEntry,
  onDeleteEntry,
  onClearHistory
}: HistoryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-45 no-print"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-darkBg-dark shadow-2xl border-l border-gray-100 dark:border-gray-800 z-50 overflow-y-auto no-print"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-siliguri">হিসাবের ইতিহাস</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-darkBg-light dark:hover:bg-darkBg-dark border border-gray-200/50 dark:border-gray-800/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Toolbar */}
              {history.length > 0 && (
                <div className="flex justify-end py-3">
                  <button
                    onClick={() => {
                      if (confirm('আপনি কি সব হিসেব মুছে ফেলতে চান?')) {
                        onClearHistory();
                      }
                    }}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    সব মুছুন
                  </button>
                </div>
              )}

              {/* History List */}
              <div className="space-y-4 mt-2">
                {history.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <History className="w-12 h-12 mx-auto stroke-1 mb-3 opacity-60 text-gray-400" />
                    <p className="text-sm font-siliguri">কোনো হিসাবের ইতিহাস পাওয়া যায়নি</p>
                    <p className="text-xs mt-1">ক্যালকুলেটর ব্যবহার করে হিসাব সংরক্ষণ করলে এখানে তালিকা দেখতে পাবেন।</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800/60 bg-gray-50/50 dark:bg-darkBg-light/30 hover:border-emerald-600/30 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-3 shadow-sm hover:shadow-md group"
                    >
                      <div>
                        {/* Tool Badge */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/10 dark:border-emerald-500/20 font-siliguri">
                            {entry.toolName}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">{entry.timestamp}</span>
                        </div>
                        {/* Summary */}
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-siliguri">
                          {entry.summary}
                        </h4>
                      </div>

                      {/* Footer actions inside card */}
                      <div className="flex items-center justify-end gap-2 border-t border-gray-100/60 dark:border-gray-800/40 pt-2.5">
                        <button
                          onClick={() => {
                            onSelectEntry(entry);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform"
                        >
                          আবার খুলুন
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1"
                          title="ইতিহাস থেকে মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
