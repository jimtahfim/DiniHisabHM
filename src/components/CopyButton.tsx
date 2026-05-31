import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto ${
        copied
          ? 'bg-emerald-600 text-white shadow-emerald-600/10'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-600/10 dark:border-emerald-600/20'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'copied' : 'copy'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              ফলাফল কপি করা হয়েছে!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              ফলাফল কপি করুন
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
