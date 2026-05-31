import { useState, useEffect } from 'react';
import { calculateNisab, type NisabInputs } from '../../engines/nisabEngine';
import { 
  convertToBanglaNumber, 
  formatBanglaCurrency 
} from '../../utils/banglaNumber';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import rules from '../../config/rules.json';
import { 
  Sparkles, ArrowLeft, CheckCircle2, 
  HelpCircle, Save, RefreshCw, BarChart3 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, ResponsiveContainer 
} from 'recharts';

interface NisabFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
}

export function NisabFeature({ onSaveHistory, initialState }: NisabFeatureProps) {
  // Steps: 1: Inputs, 2: Results
  const [step, setStep] = useState(1);

  // Form Inputs
  const [goldPrice, setGoldPrice] = useState(rules.nisab.defaultGoldPricePerGram);
  const [silverPrice, setSilverPrice] = useState(rules.nisab.defaultSilverPricePerGram);
  const [userAssets, setUserAssets] = useState(120000); // ৳ ১,২০,০০০ default

  const [inputs, setInputs] = useState<NisabInputs>({
    goldPricePerGram: goldPrice,
    silverPricePerGram: silverPrice,
    userCashAndAssets: userAssets
  });

  const [result, setResult] = useState(() => calculateNisab(inputs));

  // Sync inputs
  useEffect(() => {
    setInputs({
      goldPricePerGram: Math.max(1, goldPrice),
      silverPricePerGram: Math.max(1, silverPrice),
      userCashAndAssets: Math.max(0, userAssets)
    });
  }, [goldPrice, silverPrice, userAssets]);

  useEffect(() => {
    setResult(calculateNisab(inputs));
  }, [inputs]);

  // Load from history if available
  useEffect(() => {
    if (initialState) {
      const { goldPricePerGram, silverPricePerGram, userCashAndAssets } = initialState.inputs;
      setGoldPrice(goldPricePerGram);
      setSilverPrice(silverPricePerGram);
      setUserAssets(userCashAndAssets);
      setStep(2);
    }
  }, [initialState]);

  const handleSaveToHistory = () => {
    let summaryText = 'নিসাব পূর্ণ হয়নি';
    if (result.isEligibleGold) {
      summaryText = 'স্বর্ণ ও রৌপ্য উভয় নিসাব পূর্ণ';
    } else if (result.isEligibleSilver) {
      summaryText = 'রৌপ্য নিসাব পূর্ণ হয়েছে';
    }
    const summary = `নিসাব যাচাই: মোট সম্পদ ${formatBanglaCurrency(result.userCashAndAssets)} (${summaryText})`;
    onSaveHistory(summary, inputs, result);
    alert('নিসাব যাচাই হিসাবটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setGoldPrice(rules.nisab.defaultGoldPricePerGram);
    setSilverPrice(rules.nisab.defaultSilverPricePerGram);
    setUserAssets(120000);
  };

  // Comparison chart data
  const chartData = [
    { name: 'আমার নগদ সম্পদ', পরিমাণ: result.userCashAndAssets, id: 'user' },
    { name: 'রৌপ্য নিসাব সীমা', পরিমাণ: result.silverNisabValue, id: 'silver' },
    { name: 'স্বর্ণ নিসাব সীমা', পরিমাণ: result.goldNisabValue, id: 'gold' }
  ];

  const copyText = `দ্বীনি হিসাব — নিসাব যাচাই রিপোর্ট
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
১. স্বর্ণের মূল্য (গ্রাম প্রতি): ${formatBanglaCurrency(goldPrice)}
২. রৌপ্যের মূল্য (গ্রাম প্রতি): ${formatBanglaCurrency(silverPrice)}
------------------------------------------
নিসাব সীমা তুলনা (Nisab Thresholds):
- রুপা ভিত্তিক নিসাব: ${formatBanglaCurrency(result.silverNisabValue)}
- সোনা ভিত্তিক নিসাব: ${formatBanglaCurrency(result.goldNisabValue)}
- আমার মোট সঞ্চিত সম্পদ: ${formatBanglaCurrency(result.userCashAndAssets)}
------------------------------------------
যোগ্যতা স্ট্যাটাস:
- রুপার নিসাব অতিক্রম করেছে: ${result.isEligibleSilver ? 'হ্যাঁ' : 'না'}
- সোনার নিসাব অতিক্রম করেছে: ${result.isEligibleGold ? 'হ্যাঁ' : 'না'}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-amber-500 border border-yellow-500/20 flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">নিসাব যাচাইকারী (Nisab Checker)</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">স্বর্ণ ও রৌপ্যের বর্তমান বাজার মূল্যে আপনার সম্পদ নিসাবসীমা অতিক্রম করেছে কি না দ্রুত যাচাই</p>
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
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-yellow-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-yellow-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Input Setup */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-yellow-655 dark:text-amber-500 tracking-wider uppercase">ধাপ ১: তথ্য প্রদান</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">বাজার দর ও সঞ্চিত সম্পদের পরিমাণ</h3>
              <p className="text-xs text-gray-500">স্বর্ণ-রুপার আনুমানিক গ্রাম প্রতি মূল্য এবং আপনার মোট সঞ্চিত ও লিকুইড সম্পদের পরিমাণ লিখুন:</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Cash Assets Input */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">আমার মোট সঞ্চিত অর্থ ও সম্পদ (নগদ, ব্যাংক ব্যালেন্স ও ব্যবসার মাল)</label>
                <input
                  type="number"
                  placeholder="৳ ১,২০,০০০"
                  value={userAssets || ''}
                  onChange={(e) => setUserAssets(parseFloat(e.target.value) || 0)}
                  className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-yellow-500 text-sm transition-all"
                />
              </div>

              {/* Gold/Silver pricing sliders or numerical inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">স্বর্ণের বাজার দর (৳ প্রতি গ্রাম)</label>
                  <input
                    type="number"
                    value={goldPrice || ''}
                    onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  <p className="text-[10px] text-gray-400">৭.৫ তোলা বা ৮৭.৪৫ গ্রাম হিসেবে সোনা নিসাব প্রাক্কলন</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">রৌপ্যের বাজার দর (৳ প্রতি গ্রাম)</label>
                  <input
                    type="number"
                    value={silverPrice || ''}
                    onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  <p className="text-[10px] text-gray-400">৫২.৫ তোলা বা ৬১২.৩৬ গ্রাম হিসেবে রুপা নিসাব প্রাক্কলন</p>
                </div>
              </div>

            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                disabled={userAssets < 0}
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                নিসাবসীমা তুলনা দেখুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Calculation Results */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            
            {/* 3a. Summary Status Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-md ${
              result.isEligibleSilver 
                ? 'bg-gradient-to-br from-yellow-950 via-amber-900 to-gold-950 border-amber-700 text-white shadow-amber-950/20' 
                : 'bg-white dark:bg-darkBg-light/45 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white'
            }`}>
              {result.isEligibleSilver ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30 font-siliguri">
                    আলহামদুলিল্লাহ, আপনার সম্পদ নিসাবসীমা অতিক্রম করেছে
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm opacity-75 font-siliguri">আপনার মোট সঞ্চিত সম্পদ</p>
                    <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 tracking-tight">
                      {formatBanglaCurrency(result.userCashAndAssets)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-85 leading-relaxed font-siliguri max-w-lg mx-auto">
                    {result.isEligibleGold ? (
                      <span>আপনার সম্পদ রৌপ্য নিসাব সীমা ({formatBanglaCurrency(result.silverNisabValue)}) এবং স্বর্ণ নিসাব সীমা ({formatBanglaCurrency(result.goldNisabValue)}) উভয় সীমাকেই সফলভাবে অতিক্রম করেছে। অতএব, আপনার উপর যাকাত ও কুরবানী শরিয়ত অনুসারে ফরজ ও ওয়াজিব।</span>
                    ) : (
                      <span>আপনার সম্পদ রৌপ্য নিসাব সীমা ({formatBanglaCurrency(result.silverNisabValue)}) অতিক্রম করেছে তবে স্বর্ণ নিসাব সীমা অতিক্রম করেনি। মিশ্র সম্পদ মালিকানার জন্য শরিয়তের নিয়ম মোতাবেক আপনার উপর যাকাত ফরজ এবং কুরবানী ওয়াজিব।</span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-sm">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-500/10 font-siliguri">
                      আপনার নিসাব পূর্ণ হয়নি
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-siliguri text-gray-900 dark:text-white pt-2">
                      {formatBanglaCurrency(result.userCashAndAssets)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার মোট সম্পদ রৌপ্য নিসাব সীমা ({formatBanglaCurrency(result.silverNisabValue)}) এর নিচে থাকায় আপনার উপর যাকাত বা কুরবানীর মতো বিধান প্রদেয় ওয়াজিব হয়নি।
                  </p>
                </>
              )}
            </div>

            {/* 3b. Comparison Chart */}
            <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
              <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                আপনার সম্পদের সাথে নিসাব সীমার তুলনামূলক চিত্র
              </h4>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => convertToBanglaNumber(val)} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value) => [formatBanglaCurrency(Number(value)), 'পরিমাণ']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="পরিমাণ" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, idx) => {
                        let barColor = '#d97706'; // default
                        if (entry.id === 'user') barColor = result.isEligibleSilver ? '#10b981' : '#f43f5e';
                        if (entry.id === 'silver') barColor = '#64748b';
                        if (entry.id === 'gold') barColor = '#fbbf24';
                        return <Cell key={`cell-${idx}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3c. Detailed Calculations Breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                নিসাব গণনার বিস্তারিত তথ্য
              </h4>
              
              <div className="space-y-3 font-siliguri text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">আমার মোট নগদ সম্পদ:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.userCashAndAssets)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">স্বর্ণের নিসাব সীমা (৭.৫ ভরি/৮৭.৪৫ গ্রাম):</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.goldNisabValue)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">রৌপ্যের নিসাব সীমা (৫২.৫ ভরি/৬১২.৩৬ গ্রাম):</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.silverNisabValue)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">রৌপ্য নিসাব অতিক্রম করেছে:</span>
                  <span className={`font-bold ${result.isEligibleSilver ? 'text-emerald-600' : 'text-red-500'}`}>{result.isEligibleSilver ? 'হ্যাঁ' : 'না'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">স্বর্ণ নিসাব অতিক্রম করেছে:</span>
                  <span className={`font-bold ${result.isEligibleGold ? 'text-emerald-600' : 'text-red-500'}`}>{result.isEligibleGold ? 'হ্যাঁ' : 'না'}</span>
                </div>
              </div>
            </div>

            {/* 3d. Islamic Scripture References */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-yellow-50/15 dark:bg-yellow-955/5 space-y-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-amber-500 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>নিসাবসীমা সংক্রান্ত শরয়ী নিয়মাবলী</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri border-b border-gray-100 dark:border-gray-800/40 pb-2">
                {rules.nisab.explanations.gold} {rules.nisab.explanations.silver}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-siliguri leading-normal">
                যদি কারো নিকট কিছু সোনা, কিছু রুপা এবং নগদ কিছু টাকা থাকে, তবে শরীয়তের নিয়ম অনুযায়ী সব সম্পদ একত্রিত করে মূল্য রুপার নিসাবের সাথে তুলনা করে যাকাতের বাধ্যবাধকতা বের করতে হবে।
              </p>
            </div>

            {/* 3e. Guided Flow Actions (Save, Copy, PDF, Go Back) */}
            <div className="pt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri mr-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                মূল্য সংশোধন
              </button>
              
              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-yellow-600 dark:text-amber-500" />
                যাচাই হিসেব সংরক্ষণ
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
