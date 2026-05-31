import { FileDown } from 'lucide-react';

export function PDFExportButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gold-600 hover:bg-gold-700 text-white shadow-gold-600/10 w-full sm:w-auto"
      title="হিসাবটি পিডিএফ বা প্রিন্ট করুন"
    >
      <FileDown className="w-4 h-4" />
      পিডিএফ ডাউনলোড / প্রিন্ট
    </button>
  );
}
