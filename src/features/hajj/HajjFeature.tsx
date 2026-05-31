import { useState, useEffect } from 'react';
import { calculateHajj, type HajjInputs } from '../../engines/hajjEngine';
import { 
  formatBanglaCurrency 
} from '../../utils/banglaNumber';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import { NumericInput } from '../../components/NumericInput';
import rules from '../../config/rules.json';
import { 
  Compass, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, 
  HelpCircle, Save, RefreshCw, BarChart2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

interface HajjFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
}

export function HajjFeature({ onSaveHistory, initialState }: HajjFeatureProps) {
  // Steps: 1: Eligibility, 2: Planner, 3: Results
  const [step, setStep] = useState(1);

  // Eligibility states
  const [hasPhysicalAbility, setHasPhysicalAbility] = useState<boolean | null>(null);
  const [hasFinancialAbility, setHasFinancialAbility] = useState<boolean | null>(null);
  const [isDebtFreeAndHasSavings, setIsDebtFreeAndHasSavings] = useState<boolean | null>(null);
  const [isPathSafe, setIsPathSafe] = useState<boolean | null>(null);

  // Expenses inputs
  const [packageCost, setPackageCost] = useState(650000); // ৳ ৬.৫ লাখ default
  const [travelCost, setTravelCost] = useState(150000); // ৳ ১.৫ লাখ default
  const [qurbaniCost, setQurbaniCost] = useState(30000);
  const [personalCost, setPersonalCost] = useState(50000);

  // Combined inputs
  const [inputs, setInputs] = useState<HajjInputs>({
    hasPhysicalAbility: false,
    hasFinancialAbility: false,
    isDebtFreeAndHasSavings: false,
    isPathSafe: false,
    packageCost: packageCost,
    travelCost: travelCost,
    qurbaniCost: qurbaniCost,
    personalCost: personalCost
  });

  const [result, setResult] = useState(() => calculateHajj(inputs));

  // Sync inputs
  useEffect(() => {
    setInputs({
      hasPhysicalAbility: hasPhysicalAbility === true,
      hasFinancialAbility: hasFinancialAbility === true,
      isDebtFreeAndHasSavings: isDebtFreeAndHasSavings === true,
      isPathSafe: isPathSafe === true,
      packageCost,
      travelCost,
      qurbaniCost,
      personalCost
    });
  }, [
    hasPhysicalAbility, hasFinancialAbility, isDebtFreeAndHasSavings, 
    isPathSafe, packageCost, travelCost, qurbaniCost, personalCost
  ]);

  useEffect(() => {
    setResult(calculateHajj(inputs));
  }, [inputs]);

  // Load history if available
  useEffect(() => {
    if (initialState) {
      const { 
        hasPhysicalAbility, hasFinancialAbility, isDebtFreeAndHasSavings, isPathSafe,
        packageCost, travelCost, qurbaniCost, personalCost 
      } = initialState.inputs;
      
      setHasPhysicalAbility(hasPhysicalAbility);
      setHasFinancialAbility(hasFinancialAbility);
      setIsDebtFreeAndHasSavings(isDebtFreeAndHasSavings);
      setIsPathSafe(isPathSafe);
      setPackageCost(packageCost);
      setTravelCost(travelCost);
      setQurbaniCost(qurbaniCost);
      setPersonalCost(personalCost);
      setStep(3);
    }
  }, [initialState]);

  const handleEligibilityNext = () => {
    if (hasPhysicalAbility && hasFinancialAbility && isDebtFreeAndHasSavings && isPathSafe) {
      setStep(2);
    } else {
      setStep(3); // show Hajj not obligatory yet
    }
  };

  const handleSaveToHistory = () => {
    const summary = result.isEligible 
      ? `হজ্জ প্ল্যান: মোট ${formatBanglaCurrency(result.totalCost)} (ফরজ)` 
      : 'হজ্জ এখনও ফরজ নয়';
    onSaveHistory(summary, inputs, result);
    alert('হজ্জ প্ল্যানটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setHasPhysicalAbility(null);
    setHasFinancialAbility(null);
    setIsDebtFreeAndHasSavings(null);
    setIsPathSafe(null);
    setPackageCost(650000);
    setTravelCost(150000);
    setQurbaniCost(30000);
    setPersonalCost(50000);
  };

  // Chart Setup
  const COLORS = ['#d97706', '#0f766e', '#dc2626', '#2563eb'];
  const chartData = [
    { name: 'হজ্জ প্যাকেজ', value: result.breakdown.packageCost },
    { name: 'ভ্রমণ/টিকেট', value: result.breakdown.travelCost },
    { name: 'হজ্জ কুরবানী', value: result.breakdown.qurbaniCost },
    { name: 'ব্যক্তিগত খরচ', value: result.breakdown.personalCost }
  ];

  // Clipboard copy report formatting
  const copyText = `দ্বীনি হিসাব — হজ্জ যোগ্যতা ও ব্যয়ের পরিকল্পনা
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
১. হজ্জ যোগ্যতা: ${result.isEligible ? 'ফরজ' : 'এখনও ফরজ নয়'}
------------------------------------------
ব্যয় পরিকল্পনা (Expense Planner):
- হজ্জ প্যাকেজ: ${formatBanglaCurrency(result.breakdown.packageCost)}
- বিমান/ভ্রমণ টিকেট: ${formatBanglaCurrency(result.breakdown.travelCost)}
- কুরবানী খরচ: ${formatBanglaCurrency(result.breakdown.qurbaniCost)}
- ব্যক্তিগত ও খুচরা খরচ: ${formatBanglaCurrency(result.breakdown.personalCost)}
------------------------------------------
মোট প্রাক্কলিত হজ্জ ব্যয়: ${formatBanglaCurrency(result.totalCost)}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-950/40 text-gold-600 dark:text-gold-500 border border-gold-550/20 flex items-center justify-center shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">হজ্জ প্ল্যানার ও যোগ্যতা যাচাই</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">হজ্জ ফরজ হওয়ার শর্তাবলী যাচাই এবং আনুমানিক ব্যয়ের বাজেট পরিকল্পনা</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-300 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          নতুন যাচাই শুরু
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto no-print">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-gold-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-gold-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-gold-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
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
              <span className="text-xs font-bold text-gold-600 dark:text-gold-500 tracking-wider uppercase">ধাপ ১: যোগ্যতা যাচাই</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">হজ্জ ফরজ হওয়ার শর্তাবলী</h3>
              <p className="text-xs sm:text-sm text-gray-500">শরিয়তের নিয়ম অনুসারে হজ্জ ফরয হওয়ার জন্য নিচের প্রধান শর্তগুলো পূরণ করা আবশ্যক:</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Check 1: Financial */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-300 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-50 dark:bg-gold-950/40 text-gold-700 dark:text-gold-400 font-bold text-xs">১</span>
                  আপনার নিকট কি মক্কা যাওয়া-আসা এবং হজ্জ পালনের প্রয়োজনীয় সমস্ত ব্যয় বহন করার মতো পর্যাপ্ত আর্থিক সামর্থ্য রয়েছে?
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setHasFinancialAbility(true)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      hasFinancialAbility === true ? 'bg-gold-600 border-gold-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    হ্যাঁ, আর্থিক সামর্থ্য আছে
                  </button>
                  <button
                    onClick={() => setHasFinancialAbility(false)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      hasFinancialAbility === false ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    না, সামর্থ্য নেই
                  </button>
                </div>
              </div>

              {/* Check 2: Physical */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-300 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-50 dark:bg-gold-950/40 text-gold-700 dark:text-gold-400 font-bold text-xs">২</span>
                  আপনি কি শারীরিকভাবে সুস্থ এবং হজ্জের স্বাভাবিক পরিশ্রম ও দীর্ঘ বিমান ভ্রমণ করার মতো শারীরিক সক্ষমতা সম্পন্ন?
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setHasPhysicalAbility(true)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      hasPhysicalAbility === true ? 'bg-gold-600 border-gold-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    হ্যাঁ, শারীরিকভাবে সক্ষম
                  </button>
                  <button
                    onClick={() => setHasPhysicalAbility(false)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      hasPhysicalAbility === false ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    না, শারীরিকভাবে অক্ষম
                  </button>
                </div>
              </div>

              {/* Check 3: Family maintenance & debts */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-300 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-50 dark:bg-gold-950/40 text-gold-700 dark:text-gold-400 font-bold text-xs">৩</span>
                  আপনি কি ঋণমুক্ত এবং আপনার হজ্জ পালনের পুরো সময়টাতে দেশে আপনার উপর নির্ভরশীল পরিবারের ভরণপোষণ নিশ্চিত করার মতো তহবিল সঞ্চিত রয়েছে?
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setIsDebtFreeAndHasSavings(true)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      isDebtFreeAndHasSavings === true ? 'bg-gold-600 border-gold-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    হ্যাঁ, সঞ্চয় আছে ও ঋণমুক্ত
                  </button>
                  <button
                    onClick={() => setIsDebtFreeAndHasSavings(false)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      isDebtFreeAndHasSavings === false ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    না, ঋণ আছে বা পর্যাপ্ত সঞ্চয় নেই
                  </button>
                </div>
              </div>

              {/* Check 4: Safe Travel path */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-300 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-50 dark:bg-gold-950/40 text-gold-700 dark:text-gold-400 font-bold text-xs">৪</span>
                  ভ্রমণ পথ কি বর্তমানে নিরাপদ? (মহিলাদের জন্য হজ্জ ভ্রমণের সময়ে সাথে যাওয়ার মতো মাহরাম ব্যক্তি থাকা আবশ্যক)
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setIsPathSafe(true)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      isPathSafe === true ? 'bg-gold-600 border-gold-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    হ্যাঁ, নিরাপদ পথ ও মাহরাম আছে
                  </button>
                  <button
                    onClick={() => setIsPathSafe(false)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      isPathSafe === false ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-gray-200 dark:bg-darkBg-light dark:text-gray-300'
                    }`}
                  >
                    না, পথ নিরাপদ নয় / মাহরাম নেই
                  </button>
                </div>
              </div>

            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                disabled={hasPhysicalAbility === null || hasFinancialAbility === null || isDebtFreeAndHasSavings === null || isPathSafe === null}
                onClick={handleEligibilityNext}
                className="px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-700 disabled:bg-gray-200 disabled:dark:bg-darkBg-light disabled:text-gray-400 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                পরবর্তী ধাপে যান
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Hajj Expense Planner Form */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-gold-600 dark:text-gold-500 tracking-wider uppercase">ধাপ ২: ব্যয় পরিকল্পনা (Planner)</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">হজ্জ খরচের আনুমানিক প্রাক্কলন ও বাজেট</h3>
              <p className="text-xs text-gray-500">আপনার হজ্জের পরিকল্পনা অনুযায়ী আনুমানিক ব্যয়গুলো এখানে পরিবর্তন করতে পারেন:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Package Cost */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">হজ্জ সরকারি/বেসরকারি প্যাকেজ (হোটেল, মিনা ও আরাফাত সেবা)</label>
                <NumericInput
                  placeholder="৳ ৬,৫০,০০০"
                  value={packageCost}
                  onChange={(val) => setPackageCost(val)}
                  className="focus:ring-gold-500 text-sm"
                />
              </div>

              {/* Flight tickets */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">বিমান টিকিট ও যাতায়াত ভাড়া</label>
                <NumericInput
                  placeholder="৳ ১,৫০,০০০"
                  value={travelCost}
                  onChange={(val) => setTravelCost(val)}
                  className="focus:ring-gold-500 text-sm"
                />
              </div>

              {/* Hajj Qurbani */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">হজ্জের কুরবানী (দম) খরচ</label>
                <NumericInput
                  placeholder="৳ ৩০,০০০"
                  value={qurbaniCost}
                  onChange={(val) => setQurbaniCost(val)}
                  className="focus:ring-gold-500 text-sm"
                />
              </div>

              {/* Personal Cost */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">ব্যক্তিগত ও আনুসঙ্গিক খুচরা খরচ (হাদিয়া, খাদ্য ও মোবাইল খরচ)</label>
                <NumericInput
                  placeholder="৳ ৫০,০০০"
                  value={personalCost}
                  onChange={(val) => setPersonalCost(val)}
                  className="focus:ring-gold-500 text-sm"
                />
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
                className="px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                বাজেট ও ফলাফল দেখুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Distribution & Results Dashboard */}
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
                ? 'bg-gradient-to-br from-gold-900 to-gold-950 border-gold-700 text-white shadow-gold-950/20' 
                : 'bg-white dark:bg-darkBg-light/45 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white'
            }`}>
              {result.isEligible ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30 font-siliguri animate-bounce">
                    আলহামদুলিল্লাহ, আপনার উপর হজ্জ ফরজ হয়েছে
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm opacity-75 font-siliguri">হজ্জের জন্য প্রাক্কলিত মোট বাজেট</p>
                    <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 tracking-tight">
                      {formatBanglaCurrency(result.totalCost)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার হজ্জ পালনের জন্য প্রয়োজনীয় শারীরিক সক্ষমতা, আর্থিক সাধ্য, ঋণমুক্ততা এবং পরিবারের পর্যাপ্ত জীবিকা সংস্থান রয়েছে। অতএব, জীবনে অন্তত একবার হজ্জ সম্পাদন করা আপনার উপর আল্লাহর পক্ষ থেকে ফরজ।
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-sm">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-500/10 font-siliguri">
                      হজ্জ এখনও আপনার উপর ফরজ নয়
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-siliguri text-gray-900 dark:text-white pt-2">
                      {formatBanglaCurrency(result.totalCost)} (পরিকল্পিত বাজেট)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri max-w-lg mx-auto">
                    হজ্জ ফরজ হওয়ার জন্য প্রয়োজনীয় শারীরিক সুস্থতা, সামগ্রিক আর্থিক সাধ্য, সম্পূর্ণ ঋণমুক্ত থাকা বা পরিবারের ভরণপোষণ নিশ্চিত করার শর্তগুলো এখনও পুরোপুরি পূরণ হয়নি। আপনার সামর্থ্য বৃদ্ধির জন্য আল্লাহ আপনার সহায় হোন।
                  </p>
                </>
              )}
            </div>

            {/* 3b. Recharts Pie Chart representing expense splits */}
            {result.totalCost > 0 && (
              <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
                <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                  ব্যয় প্রাক্কলনের বিভাজন চিত্র (Expense Pie Chart)
                </h4>
                <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
                  <div className="h-56 w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
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
                  {/* Legend Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 text-xs font-siliguri w-full sm:w-1/2">
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

            {/* 3c. Detailed Expenses List breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-6">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                হজ্জ বাজেটের বিস্তারিত হিসাব বিবরণী
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm font-siliguri">
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">হজ্জ প্যাকেজ মূল্য:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.packageCost)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">বিমান ও যাতায়াত টিকিট:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.travelCost)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">কুরবানী খরচ:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.qurbaniCost)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">ব্যক্তিগত ও হাদিয়া বাজেট:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.personalCost)}</span>
                </div>
                <div className="flex justify-between py-2.5 font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800 md:col-span-2 pt-3 text-base">
                  <span>মোট প্রাক্কলিত হজ্জ বাজেট:</span>
                  <span className="text-gold-600 dark:text-gold-500">{formatBanglaCurrency(result.totalCost)}</span>
                </div>
              </div>
            </div>

            {/* 3d. Hajj Obligation explanation */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-gold-50/15 dark:bg-gold-950/5 space-y-4">
              <div className="flex items-center gap-2 text-gold-800 dark:text-gold-500 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>হজ্জ ফরয হওয়া সংক্রান্ত শরয়ী তথ্যসূত্র</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri space-y-2">
                <p>হজ্জ ইসলামের অত্যন্ত গুরুত্বপূর্ণ একটি রুকন। সামর্থ্যবান ব্যক্তির উপর জীবনে একবার হজ্জ করা ফরজ। হজ্জ ফরজ হওয়ার শর্তগুলো পূরণ হওয়ার পর অহেতুক বিলম্ব করা অত্যন্ত গুনাহের কাজ।</p>
                <div className="font-semibold text-emerald-800 dark:text-emerald-400 pt-1">হজ্জ ফরজ হওয়ার শর্তাবলী:</div>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {rules.hajj.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-white dark:bg-darkBg-dark border-l-4 border-gold-600 rounded-r-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri italic">
                {rules.references.hajj}
              </div>
            </div>

            {/* 3e. Guided Flow Actions (Save, Copy, PDF, Go Back) */}
            <div className="pt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => setStep(result.isEligible ? 2 : 1)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri mr-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                তথ্য সংশোধন
              </button>
              
              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                পরিকল্পনা সংরক্ষণ
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
