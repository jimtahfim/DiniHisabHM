import { useState, useEffect } from 'react';
import { calculateFitra, type FitraInputs } from '../../engines/fitraEngine';
import { 
  convertToBanglaNumber, 
  formatBanglaCurrency 
} from '../../utils/banglaNumber';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import rules from '../../config/rules.json';
import { NumericInput } from '../../components/NumericInput';
import { 
  Heart, ArrowLeft, ArrowRight, CheckCircle2, 
  HelpCircle, Save, RefreshCw, BarChart3 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, ResponsiveContainer 
} from 'recharts';
import { useSettings } from '../../hooks/useSettings';

interface FitraFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
  settingsHook: ReturnType<typeof useSettings>;
}

export function FitraFeature({ onSaveHistory, initialState, settingsHook }: FitraFeatureProps) {
  // Steps: 1: Eligibility, 2: Calculator, 3: Results
  const [step, setStep] = useState(1);

  // Form Inputs
  const [memberCount, setMemberCount] = useState(1);
  const [selectedRateId, setSelectedRateId] = useState('wheat');

  const [inputs, setInputs] = useState<FitraInputs>(() => ({
    memberCount,
    selectedRateId,
    fitraRates: settingsHook.settings.fitraRates
  }));

  const [result, setResult] = useState(() => calculateFitra(inputs));

  // Sync inputs
  useEffect(() => {
    setInputs({
      memberCount: Math.max(1, memberCount),
      selectedRateId,
      fitraRates: settingsHook.settings.fitraRates
    });
  }, [memberCount, selectedRateId, settingsHook.settings.fitraRates]);

  useEffect(() => {
    setResult(calculateFitra(inputs));
  }, [inputs]);

  // Load from history if available
  useEffect(() => {
    if (initialState) {
      const { memberCount, selectedRateId } = initialState.inputs;
      setMemberCount(memberCount);
      setSelectedRateId(selectedRateId);
      setStep(3);
    }
  }, [initialState]);

  const handleSaveToHistory = () => {
    const summary = `ফিতরা হিসাব: সদস্য সংখ্যা ${convertToBanglaNumber(result.memberCount)} জন, মোট ${formatBanglaCurrency(result.totalFitra)} (${result.rateName} ভিত্তিক)`;
    onSaveHistory(summary, inputs, result);
    alert('ফিতরা হিসাবটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setMemberCount(1);
    setSelectedRateId('wheat');
  };

  // Generate comparison data across all rates for the comparison bar chart
  const comparisonChartData = rules.fitra.rates.map((rate) => {
    const ratePrice = settingsHook.settings.fitraRates[rate.id as keyof typeof settingsHook.settings.fitraRates] ?? rate.rate;
    return {
      name: rate.name,
      পরিমাণ: ratePrice * result.memberCount,
      id: rate.id
    };
  });

  const copyText = `দ্বীনি হিসাব — সাদকাতুল ফিতর রিপোর্ট
 তারিখ: ${new Date().toLocaleDateString('bn-BD')}
 ------------------------------------------
 ১. পরিবারের সদস্য সংখ্যা: ${convertToBanglaNumber(result.memberCount)} জন
 ২. নির্বাচিত পণ্য: ${result.rateName}
 ৩. জনপ্রতি হার: ${formatBanglaCurrency(result.ratePerPerson)}
 ------------------------------------------
 মোট প্রদেয় ফিতরা: ${formatBanglaCurrency(result.totalFitra)}
 ------------------------------------------
 হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 border border-rose-505/20 flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">সাদকাতুল ফিতর ক্যালকুলেটর</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">ঈদুল ফিতরের পূর্বে পরিবারের সদস্য সংখ্যা অনুযায়ী ফিতরার সঠিক হিসাব</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-300 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          নতুন হিসাব শুরু
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto no-print">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-rose-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-rose-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-rose-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Eligibility Wizard */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase">ধাপ ১: যোগ্যতা যাচাই</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">কার উপর সাদকাতুল ফিতর ওয়াজিব?</h3>
              <p className="text-xs sm:text-sm text-gray-500">ঈদুল ফিতরের দিন যার নিকট নিজের ও পরিবারের এক দিনের আহারের অতিরিক্ত খাদ্য বা সম্পদ থাকে, তার নিজের ও নির্ভরশীলদের পক্ষ থেকে ফিতরা আদায় করা ওয়াজিব।</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/20 dark:bg-rose-955/5 border border-rose-500/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-siliguri leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                ফিতরা ওয়াজিব হওয়ার সাধারণ শর্তাবলী:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>মুসলিম হওয়া (অমুসলিমদের উপর ফিতরা ওয়াজিব নয়)।</li>
                <li>ঈদের দিন সকালে ন্যূনতম খাদ্য বা নিساب সমমূল্য সম্পদ থাকা।</li>
                <li>পরিবারের অভিভাবক তার নিজের এবং অপ্রাপ্তবয়স্ক ও নির্ভরশীল সদস্যদের পক্ষ থেকে আদায় করবেন।</li>
              </ul>
            </div>

            {/* Navigation Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                পরবর্তী ধাপে যান
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Form Inputs */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase">ধাপ ২: তথ্য প্রদান</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">সদস্য সংখ্যা ও ফিতরার হার নির্ধারণ</h3>
              <p className="text-xs text-gray-500">আপনার পরিবারে মোট সদস্য ও ফিতরা প্রদানের জন্য উপযুক্ত খাদ্যশস্যের বাজার মূল্য নির্ধারণ করুন:</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Member Count */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">পরিবারের মোট সদস্য সংখ্যা (অভিভাবকসহ নির্ভরশীলগণ)</label>
                <NumericInput
                  placeholder="১"
                  value={memberCount}
                  onChange={(val) => setMemberCount(Math.max(1, val))}
                  showButtons={true}
                  min={1}
                  className="focus:ring-rose-500 text-sm"
                />
              </div>

              {/* Fitra Rates Commodity Selector */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">ফিতরা প্রদানের ভিত্তি (খাদ্যশস্যের ধরণ ও বাজার মূল্য)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rules.fitra.rates.map((rate) => {
                    const ratePrice = settingsHook.settings.fitraRates[rate.id as keyof typeof settingsHook.settings.fitraRates] ?? rate.rate;
                    return (
                      <button
                        key={rate.id}
                        onClick={() => setSelectedRateId(rate.id)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                          selectedRateId === rate.id
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-955/20 text-rose-800 dark:text-rose-350 shadow-sm'
                            : 'border-gray-200 dark:border-gray-800 text-gray-500'
                        }`}
                      >
                        <span className="font-bold text-xs sm:text-sm font-siliguri">{rate.name}</span>
                        <span className="text-[10px] opacity-75 font-siliguri leading-tight">{rate.description}</span>
                        <span className="text-xs font-black text-rose-700 dark:text-rose-400 mt-1">{formatBanglaCurrency(ratePrice)} (জনপ্রতি)</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri"
              >
                <ArrowLeft className="w-4 h-4" />
                পূর্ববর্তী
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                হিসাব সম্পন্ন করুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results & Comparison */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            
            {/* 3a. Summary Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-900 to-pink-950 border border-rose-700 text-white text-center space-y-3 shadow-md">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-350 border border-rose-500/30 font-siliguri">
                সাদকাতুল ফিতর মোট হিসাব বিবরণী
              </span>
              <p className="text-xs sm:text-sm opacity-75 font-siliguri">পরিবারের {convertToBanglaNumber(result.memberCount)} জন সদস্যের মোট ফিতরা</p>
              <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 tracking-tight">
                {formatBanglaCurrency(result.totalFitra)}
              </h3>
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-siliguri max-w-md mx-auto">
                আপনি <strong>{result.rateName}</strong> এর বাজার দর জনপ্রতি <strong>{formatBanglaCurrency(result.ratePerPerson)}</strong> হিসেবে মোট ফিতরা গণনা করেছেন। এটি ঈদের নামাজের পূর্বেই দরিদ্রদের মাঝে বিতরণ করা আবশ্যক।
              </p>
            </div>

            {/* 3b. Generosity Comparison Chart (Premium visual feature) */}
            <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
              <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                বিভিন্ন উপাদানে ফিতরা প্রদানের তুলনামূলক চিত্র
              </h4>
              <p className="text-xs text-gray-500 font-siliguri leading-tight">
                সামর্থ্যবান মুসলিমদের জন্য আটা ছাড়া অন্যান্য অধিক দামী শস্য (যেমন পনির বা খেজুর) দিয়ে ফিতরা প্রদান দরিদ্রদের জন্য বেশি উপকারী এবং এতে সওয়াব বেশি।
              </p>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => convertToBanglaNumber(val)} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value) => [formatBanglaCurrency(Number(value)), 'মোট পরিমাণ']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="পরিমাণ" radius={[8, 8, 0, 0]}>
                      {comparisonChartData.map((entry, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={entry.id === selectedRateId ? '#e11d48' : '#fda4af'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3c. Detailed Calculations Breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                হিসাবের বিস্তারিত তথ্য
              </h4>
              
              <div className="space-y-3 font-siliguri text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">পরিবারের মোট সদস্য সংখ্যা:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{convertToBanglaNumber(result.memberCount)} জন</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">নির্বাচিত ফিতরার ভিত্তি পণ্য:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{result.rateName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">পদ্ধতির গাণিতিক পরিমাণ:</span>
                  <span className="text-gray-600 dark:text-gray-400">{result.rateDescription}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">জনপ্রতি ফিতরার হার:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.ratePerPerson)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold text-gray-950 dark:text-white border-t border-gray-200 dark:border-gray-800/60 pt-3">
                  <span>মোট প্রদেয় সাদকাতুল ফিতর:</span>
                  <span className="text-rose-600 dark:text-rose-400">{formatBanglaCurrency(result.totalFitra)}</span>
                </div>
              </div>
            </div>

            {/* 3d. Islamic Scripture References */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-rose-50/15 dark:bg-rose-955/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>সাদকাতুল ফিতর সংক্রান্ত শরয়ী তথ্যসূত্র ও নিয়ম</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri">
                ফিতরা রমজান মাস শেষ হওয়ার পর ঈদুল ফিতরের দিন সকালে ঈদের নামাযে যাওয়ার পূর্বে প্রদান করা ওয়াজিব। তবে রমজান মাসের যেকোনো দিন সচ্ছল মুসলিমরা দরিদ্রদের সুবিধা বিবেচনা করে এটি আগেভাগেই শোধ করতে পারেন যাতে তারা ঈদের কেনাকাটা ও খাবার সংগ্রহ করতে পারে।
              </p>
              <div className="p-3 bg-white dark:bg-darkBg-dark border-l-4 border-gold-600 rounded-r-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri italic">
                {rules.references.fitra}
              </div>
            </div>

            {/* 3e. Guided Flow Actions (Save, Copy, PDF, Go Back) */}
            <div className="pt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri mr-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                সদস্য সংখ্যা সংশোধন
              </button>
              
              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                ফলাফল সংরক্ষণ করুন
              </button>

              <CopyButton text={copyText} />
              
              <PDFExportButton />
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
