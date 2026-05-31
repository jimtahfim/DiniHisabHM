import { useState, useEffect } from 'react';
import { calculateQurbani, type QurbaniInputs } from '../../engines/qurbaniEngine';
import { 
  convertToBanglaNumber, 
  formatBanglaCurrency 
} from '../../utils/banglaNumber';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import { NumericInput } from '../../components/NumericInput';
import rules from '../../config/rules.json';
import { 
  Flame, ArrowLeft, ArrowRight, CheckCircle2, 
  HelpCircle, Save, RefreshCw, BarChart2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

interface QurbaniFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
}

export function QurbaniFeature({ onSaveHistory, initialState }: QurbaniFeatureProps) {
  // Steps: 1: Eligibility, 2: Calculator, 3: Results
  const [step, setStep] = useState(1);

  // Eligibility
  const [hasNisabExtra, setHasNisabExtra] = useState<boolean | null>(null);

  // Form Inputs
  const [animalType, setAnimalType] = useState<QurbaniInputs['animalType']>('cow');
  const [price, setPrice] = useState(120000); // ৳ ১,২০,০০০ default cow
  const [shares, setShares] = useState(7); // 7 shares default for cow

  const [inputs, setInputs] = useState<QurbaniInputs>({
    hasNisabExtra: false,
    animalType,
    price,
    shares
  });

  const [result, setResult] = useState(() => calculateQurbani(inputs));

  // Handle animal type changes to auto-adjust shares defaults
  const handleAnimalTypeChange = (type: QurbaniInputs['animalType']) => {
    setAnimalType(type);
    if (type === 'goat' || type === 'sheep' || type === 'share') {
      setShares(1);
      if (type === 'goat' || type === 'sheep') setPrice(25050); // standard goat price
      if (type === 'share') setPrice(18000); // standard share price
    } else {
      setShares(7);
      setPrice(120000); // standard cow price
    }
  };

  // Sync inputs
  useEffect(() => {
    setInputs({
      hasNisabExtra: hasNisabExtra === true,
      animalType,
      price,
      shares: (animalType === 'goat' || animalType === 'sheep' || animalType === 'share') ? 1 : Math.max(1, Math.min(7, shares))
    });
  }, [hasNisabExtra, animalType, price, shares]);

  useEffect(() => {
    setResult(calculateQurbani(inputs));
  }, [inputs]);

  // Load from history if available
  useEffect(() => {
    if (initialState) {
      const { hasNisabExtra, animalType, price, shares } = initialState.inputs;
      setHasNisabExtra(hasNisabExtra);
      setAnimalType(animalType);
      setPrice(price);
      setShares(shares);
      setStep(3);
    }
  }, [initialState]);

  const handleSaveToHistory = () => {
    const summary = result.isEligible 
      ? `কুরবানী: প্রদেয় ${formatBanglaCurrency(result.costPerPerson)} (${result.animalLabel} ভিত্তিক, ফরজ)` 
      : 'কুরবানী ওয়াজিব নয়';
    onSaveHistory(summary, inputs, result);
    alert('কুরবানী হিসাবটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setHasNisabExtra(null);
    setAnimalType('cow');
    setPrice(120000);
    setShares(7);
  };

  // Chart setup: compares my share cost vs other shares' cost
  const COLORS = ['#ea580c', '#e2e8f0'];
  const chartData = [
    { name: 'আমার অংশ ব্যয়', value: result.costPerPerson },
    { name: 'অন্যান্য শরিকদের ব্যয়', value: result.totalCost - result.costPerPerson }
  ];

  const copyText = `দ্বীনি হিসাব — কুরবানী যোগ্যতা ও হিসাব রিপোর্ট
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
১. কুরবানী যোগ্যতা: ${result.isEligible ? 'ওয়াজিব' : 'এখনও ওয়াজিব নয়'}
২. পশুর ধরণ: ${result.animalLabel}
৩. পশুর মোট মূল্য/বাজেট: ${formatBanglaCurrency(result.totalCost)}
৪. শরিক বা অংশের সংখ্যা: ${convertToBanglaNumber(result.sharesCount)} টি
------------------------------------------
আমার অংশের প্রাক্কলিত ব্যয়: ${formatBanglaCurrency(result.costPerPerson)}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-455 border border-orange-500/20 flex items-center justify-center shadow-sm">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">কুরবানী যোগ্যতা ও ব্যয় হিসাব</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">আপনার উপর কুরবানী ওয়াজিব কি না তা যাচাই এবং পশুর অংশের খরচ বণ্টন</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-255 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          নতুন হিসাব শুরু
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto no-print">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
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
              <span className="text-xs font-bold text-orange-655 dark:text-orange-400 tracking-wider uppercase">ধাপ ১: যোগ্যতা যাচাই</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">কার উপর কুরবানী ওয়াজিব হয়?</h3>
              <p className="text-xs sm:text-sm text-gray-500">১০ই জিলহজ্জ ফজর থেকে ১২ই জিলহজ্জ সূর্যাস্ত পর্যন্ত সময়ের মধ্যে যার মালিকানায় নিসাব পরিমাণ উদ্বৃত্ত অর্থ বা সম্পদ থাকে, তার উপর কুরবানী করা ওয়াজিব।</p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Question 1 */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold text-xs">১</span>
                  ১০ই থেকে ১২ই জিলহজ্জের মধ্যে আপনার নিকট কি মৌলিক প্রয়োজনের অতিরিক্ত ও ঋণমুক্ত ৫২.৫ তোলা রুপার সমমূল্য সম্পদ (৳৮০-৯০ হাজার বা ততোধিক মূল্যের ক্যাশ/সোনা/রুপা) রয়েছে?
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setHasNisabExtra(true)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      hasNisabExtra === true
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-white hover:bg-gray-50 dark:bg-darkBg-light dark:hover:bg-darkBg-dark border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    হ্যাঁ, আছে
                  </button>
                  <button
                    onClick={() => setHasNisabExtra(false)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      hasNisabExtra === false
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white hover:bg-gray-50 dark:bg-darkBg-light dark:hover:bg-darkBg-dark border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    না, নেই
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                disabled={hasNisabExtra === null}
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:dark:bg-darkBg-light disabled:text-gray-400 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                পরবর্তী ধাপে যান
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Calculator Forms */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-455 tracking-wider uppercase">ধাপ ২: তথ্য প্রদান</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">কুরবানীর পশুর ধরণ ও অংশের খরচ</h3>
              <p className="text-xs text-gray-500">আপনার পরিকল্পিত পশুর ধরণ, মোট মূল্য ও ভাগের সংখ্যা বাংলায় বা ইংরেজিতে দিন:</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Animal Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">পশুর ধরণ নির্বাচন করুন</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(['cow', 'goat', 'sheep', 'camel', 'buffalo', 'share'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAnimalTypeChange(type)}
                      className={`p-3 rounded-xl border font-bold text-xs sm:text-sm transition-all ${
                        animalType === type
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300'
                          : 'border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      {type === 'cow' && 'গরু (১-৭ অংশ)'}
                      {type === 'goat' && 'ছাগল (১ অংশ)'}
                      {type === 'sheep' && 'ভেড়া (১ অংশ)'}
                      {type === 'camel' && 'উট (১-৭ অংশ)'}
                      {type === 'buffalo' && 'মহিষ (১-৭ অংশ)'}
                      {type === 'share' && 'পশুর একটি অংশ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">
                  {animalType === 'share' ? 'অংশের মূল্য (৳)' : 'পশুর মোট বাজার মূল্য (৳)'}
                </label>
                <NumericInput
                  placeholder="৳ ১,২০,০০০"
                  value={price}
                  onChange={(val) => setPrice(val)}
                  className="focus:ring-orange-500 text-sm"
                />
              </div>

              {/* Shares selection */}
              {!(animalType === 'goat' || animalType === 'sheep' || animalType === 'share') && (
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">মোট অংশ বা শরিকের সংখ্যা (অনধিক ৭ শরিক)</label>
                  <select
                    value={shares}
                    onChange={(e) => setShares(parseInt(e.target.value) || 1)}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>{convertToBanglaNumber(num)} শরিক বা অংশ</option>
                    ))}
                  </select>
                </div>
              )}

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
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                হিসাব ফলাফল দেখুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Calculation Results */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            
            {/* 3a. Summary Status Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-md ${
              result.isEligible 
                ? 'bg-gradient-to-br from-orange-900 to-red-950 border-orange-700 text-white shadow-orange-950/20' 
                : 'bg-white dark:bg-darkBg-light/45 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white'
            }`}>
              {result.isEligible ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 font-siliguri">
                    আলহামদুলিল্লাহ, আপনার উপর কুরবানী ওয়াজিব (Wajib)
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm opacity-75 font-siliguri">আপনার অংশের আনুমানিক ব্যয়</p>
                    <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 tracking-tight">
                      {formatBanglaCurrency(result.costPerPerson)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার নিসাব পরিমাণ অতিরিক্ত সঞ্চিত সম্পত্তি রয়েছে, অতএব জিলহজ্জের ১০, ১১ ও ১২ তারিখের যেকোনো দিন আপনার পক্ষ থেকে অন্তত একটি কুরবানী বা পশু উৎসর্গ শরিকানা অংশ আদায় করা ওয়াজিব।
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-sm">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-500/10 font-siliguri">
                      আপনার উপর কুরবানী ওয়াজিব নয়
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-siliguri text-gray-900 dark:text-white pt-2">
                      ৳ ০
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri max-w-lg mx-auto">
                    ১০ই জিলহজ্জ থেকে ১২ই জিলহজ্জের মধ্যে আপনার নিকট মৌলিক প্রয়োজন মেটানোর পর রুপার নিসাব সমমূল্যের উদ্বৃত্ত সম্পদ নেই, তাই আপনার উপর কুরবানী করার শরয়ী বাধ্যবাধকতা নেই। সামর্থ্য হলে নফল কুরবানী করতে পারেন।
                  </p>
                </>
              )}
            </div>

            {/* 3b. Pie Chart representing shares cost split (only if shares count > 1) */}
            {result.sharesCount > 1 && (
              <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
                <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-orange-600 dark:text-orange-455" />
                  পশুর মোট বাজেটের শরিকানা ব্যয় বিভাজন
                </h4>
                <div className="h-56 w-full flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
                  <div className="h-48 w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatBanglaCurrency(Number(value)), 'পরিমাণ']}
                          contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="grid grid-cols-1 gap-2.5 text-xs font-siliguri w-full sm:w-1/2">
                    {chartData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-bold text-gray-800 dark:text-gray-200">{entry.name}:</span>
                        <span className="text-gray-500 dark:text-gray-400">{formatBanglaCurrency(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3c. Detailed Calculations Breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                কুরবানী হিসাবের বিস্তারিত তথ্য
              </h4>
              
              <div className="space-y-3 font-siliguri text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">পশুর ধরণ:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{result.animalLabel}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">মোট অংশ বা শরিকের সংখ্যা:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{convertToBanglaNumber(result.sharesCount)} টি</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40 font-bold">
                  <span className="text-gray-500">পশুর মোট মূল্য:</span>
                  <span className="text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.totalCost)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold text-gray-955 dark:text-white border-t border-gray-200 dark:border-gray-800/60 pt-3">
                  <span>আমার অংশের প্রদেয় খরচ:</span>
                  <span className="text-orange-655 dark:text-orange-400">{formatBanglaCurrency(result.costPerPerson)}</span>
                </div>
              </div>
            </div>

            {/* 3d. Islamic Scripture References */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-orange-50/15 dark:bg-orange-950/5 space-y-4">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>কুরবানী সংক্রান্ত শরয়ী তথ্যসূত্র ও নিয়ম</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri">
                কুরবানীর পশু হতে হবে সম্পূর্ণ সুস্থ, নিখুঁত ও শরীয়ত নির্ধারিত বয়সের (গরু/মহিষ ন্যূনতম ২ বছর, ছাগল/ভেড়া ন্যূনতম ১ বছর, উট ন্যূনতম ৫ বছর)। একটি গরু, মহিষ বা উটে সর্বোচ্চ ৭ জন অংশ বা শরিক নিতে পারেন। ছাগল, ভেড়া বা দুম্বায় কেবল ১ জনই শরিক হতে পারেন।
              </p>
              <div className="p-3 bg-white dark:bg-darkBg-dark border-l-4 border-gold-600 rounded-r-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri italic">
                {rules.references.qurbani}
              </div>
            </div>

            {/* 3e. Guided Flow Actions (Save, Copy, PDF, Go Back) */}
            <div className="pt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri mr-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                তথ্য সংশোধন
              </button>
              
              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                হিসাব সংরক্ষণ
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
