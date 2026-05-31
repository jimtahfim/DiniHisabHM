import { useState, useEffect } from 'react';
import { useSettings, type GoldRates, type SilverRates } from '../../hooks/useSettings';
import { calculateZakat, type ZakatInputs } from '../../engines/zakatEngine';
import { NumericInput } from '../../components/NumericInput';
import { 
  convertToBanglaNumber, 
  formatBanglaCurrency 
} from '../../utils/banglaNumber';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import rules from '../../config/rules.json';
import { 
  Coins, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, 
  AlertTriangle, Save, RefreshCw, BarChart3 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface ZakatFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
  settingsHook: ReturnType<typeof useSettings>;
}

export function ZakatFeature({ onSaveHistory, initialState, settingsHook }: ZakatFeatureProps) {
  // Steps: 1: Eligibility, 2: Inputs, 3: Results
  const [step, setStep] = useState(1);
  
  // Eligibility states
  const [hasNisabAsset, setHasNisabAsset] = useState<boolean | null>(null);
  const [hasOneYearPassed, setHasOneYearPassed] = useState<boolean | null>(null);

  // Zakat inputs
  const [inputs, setInputs] = useState<ZakatInputs>(() => {
    if (initialState) return initialState.inputs;
    const defaultGoldCarat = settingsHook.settings.selectedGoldCarat;
    const defaultSilverCarat = settingsHook.settings.selectedSilverCarat;
    return {
      cash: 0,
      bankBalance: 0,
      goldValue: 0,
      silverValue: 0,
      businessAssets: 0,
      investments: 0,
      receivables: 0,
      debts: 0,
      goldPricePerGram: settingsHook.settings.goldRates[defaultGoldCarat],
      silverPricePerGram: settingsHook.settings.silverRates[defaultSilverCarat],
      nisabType: 'silver'
    };
  });

  // Calculate outputs
  const [result, setResult] = useState(() => {
    if (initialState) return initialState.result;
    return calculateZakat(inputs);
  });

  useEffect(() => {
    setResult(calculateZakat(inputs));
  }, [inputs]);

  // Weight-based inputs state
  const [goldCarat, setGoldCarat] = useState<keyof GoldRates>(settingsHook.settings.selectedGoldCarat);
  const [goldEntryMode, setGoldEntryMode] = useState<'value' | 'weight'>('weight');
  const [goldWeight, setGoldWeight] = useState<number>(0);
  const [goldUnit, setGoldUnit] = useState<'gram' | 'vori'>('vori'); // Default to vori
  const [goldPricePerUnit, setGoldPricePerUnit] = useState<number>(() => {
    const rateGram = settingsHook.settings.goldRates[settingsHook.settings.selectedGoldCarat];
    return Math.round(rateGram * 11.664);
  });

  const [silverCarat, setSilverCarat] = useState<keyof SilverRates>(settingsHook.settings.selectedSilverCarat);
  const [silverEntryMode, setSilverEntryMode] = useState<'value' | 'weight'>('weight');
  const [silverWeight, setSilverWeight] = useState<number>(0);
  const [silverUnit, setSilverUnit] = useState<'gram' | 'vori'>('vori'); // Default to vori
  const [silverPricePerUnit, setSilverPricePerUnit] = useState<number>(() => {
    const rateGram = settingsHook.settings.silverRates[settingsHook.settings.selectedSilverCarat];
    return Math.round(rateGram * 11.664);
  });

  // Sync Gold Weight/Price changes to inputs
  useEffect(() => {
    if (goldEntryMode === 'weight') {
      const computedValue = goldWeight * goldPricePerUnit;
      const pricePerGram = goldUnit === 'gram' ? goldPricePerUnit : goldPricePerUnit / 11.664;
      setInputs(prev => ({
        ...prev,
        goldValue: Math.round(computedValue),
        goldPricePerGram: Math.round(pricePerGram)
      }));
    }
  }, [goldEntryMode, goldWeight, goldUnit, goldPricePerUnit]);

  // Sync Silver Weight/Price changes to inputs
  useEffect(() => {
    if (silverEntryMode === 'weight') {
      const computedValue = silverWeight * silverPricePerUnit;
      const pricePerGram = silverUnit === 'gram' ? silverPricePerUnit : silverPricePerUnit / 11.664;
      setInputs(prev => ({
        ...prev,
        silverValue: Math.round(computedValue),
        silverPricePerGram: Math.round(pricePerGram)
      }));
    }
  }, [silverEntryMode, silverWeight, silverUnit, silverPricePerUnit]);

  // Handle Carat changes
  const handleGoldCaratChange = (carat: keyof GoldRates) => {
    setGoldCarat(carat);
    const rateGram = settingsHook.settings.goldRates[carat];
    if (goldUnit === 'gram') {
      setGoldPricePerUnit(rateGram);
    } else {
      setGoldPricePerUnit(Math.round(rateGram * 11.664));
    }
  };

  const handleSilverCaratChange = (carat: keyof SilverRates) => {
    setSilverCarat(carat);
    const rateGram = settingsHook.settings.silverRates[carat];
    if (silverUnit === 'gram') {
      setSilverPricePerUnit(rateGram);
    } else {
      setSilverPricePerUnit(Math.round(rateGram * 11.664));
    }
  };

  // Handle Gold Unit change
  const handleGoldUnitChange = (unit: 'gram' | 'vori') => {
    setGoldUnit(unit);
    const rateGram = settingsHook.settings.goldRates[goldCarat];
    if (unit === 'gram') {
      setGoldPricePerUnit(rateGram);
    } else {
      setGoldPricePerUnit(Math.round(rateGram * 11.664));
    }
  };

  // Handle Silver Unit change
  const handleSilverUnitChange = (unit: 'gram' | 'vori') => {
    setSilverUnit(unit);
    const rateGram = settingsHook.settings.silverRates[silverCarat];
    if (unit === 'gram') {
      setSilverPricePerUnit(rateGram);
    } else {
      setSilverPricePerUnit(Math.round(rateGram * 11.664));
    }
  };

  // Load from initial state if provided
  useEffect(() => {
    if (initialState) {
      setInputs(initialState.inputs);
      setStep(3); // Go straight to results
    }
  }, [initialState]);

  const handleInputChange = (field: keyof ZakatInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEligibilityNext = () => {
    if (hasNisabAsset && hasOneYearPassed) {
      setStep(2);
    } else {
      setStep(3); // Jump to results to show "Not Obligatory" explanation
    }
  };

  const handleSaveToHistory = () => {
    const summary = result.isEligible 
      ? `যাকাত প্রদেয়: ${formatBanglaCurrency(result.zakatAmount)}` 
      : 'যাকাত ফরজ নয়';
    onSaveHistory(summary, inputs, result);
    alert('হিসাবটি সফলভাবে ইতিহাসে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setHasNisabAsset(null);
    setHasOneYearPassed(null);
    const defaultGoldCarat = settingsHook.settings.selectedGoldCarat;
    const defaultSilverCarat = settingsHook.settings.selectedSilverCarat;
    const defaultGoldPrice = settingsHook.settings.goldRates[defaultGoldCarat];
    const defaultSilverPrice = settingsHook.settings.silverRates[defaultSilverCarat];

    setInputs({
      cash: 0,
      bankBalance: 0,
      goldValue: 0,
      silverValue: 0,
      businessAssets: 0,
      investments: 0,
      receivables: 0,
      debts: 0,
      goldPricePerGram: defaultGoldPrice,
      silverPricePerGram: defaultSilverPrice,
      nisabType: 'silver'
    });
    setGoldCarat(defaultGoldCarat);
    setGoldEntryMode('weight');
    setGoldWeight(0);
    setGoldUnit('vori');
    setGoldPricePerUnit(Math.round(defaultGoldPrice * 11.664));

    setSilverCarat(defaultSilverCarat);
    setSilverEntryMode('weight');
    setSilverWeight(0);
    setSilverUnit('vori');
    setSilverPricePerUnit(Math.round(defaultSilverPrice * 11.664));
  };

  // Preparation for chart data
  const chartData = [
    { name: 'নগদ ও ব্যাংক', পরিমাণ: result.breakdown.cash + result.breakdown.bankBalance },
    { name: 'স্বর্ণ ও রৌপ্য', পরিমাণ: result.breakdown.goldValue + result.breakdown.silverValue },
    { name: 'ব্যবসা ও বিনিয়োগ', পরিমাণ: result.breakdown.businessAssets + result.breakdown.investments },
    { name: 'পাওনা অর্থ', পরিমাণ: result.breakdown.receivables },
    { name: 'ঋণ (বাদ যাবে)', পরিমাণ: result.breakdown.debts }
  ];

  // Printable formatted text
  const copyText = `দ্বীনি হিসাব — যাকাত রিপোর্ট
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
১. যাকাত যোগ্যতা: ${result.isEligible ? 'ফরজ' : 'এখনও ফরজ নয়'}
২. মোট সম্পদ: ${formatBanglaCurrency(result.totalAssets)}
৩. মোট ঋণ/দায়: ${formatBanglaCurrency(result.breakdown.debts)}
৪. যাকাতযোগ্য নিট সম্পদ: ${formatBanglaCurrency(result.netAssets)}
৫. যাকাতের হার: ২.৫%
৬. প্রদেয় যাকাতের পরিমাণ: ${formatBanglaCurrency(result.zakatAmount)}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">যাকাত হিসাব ও যোগ্যতা যাচাই</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">আপনার যাকাত ফরজ হওয়ার যোগ্যতা পরীক্ষা ও সম্পদের ২.৫% সঠিক হিসাব</p>
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
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
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
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">ধাপ ১: যোগ্যতা যাচাই</span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">যাকাত ফরজ হওয়ার যোগ্যতা যাচাই</h3>
              </div>

              {/* Question 1 */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs">১</span>
                  আপনার কি দৈনন্দিন প্রয়োজনীয় খরচ ও ঋণ বাদে নিসাব পরিমাণ (কমপক্ষে ৫২.৫ তোলা রূপা বা ৭.৫ তোলা সোনার সমমূল্য) উদ্বৃত্ত সম্পদ রয়েছে?
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setHasNisabAsset(true)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
                      hasNisabAsset === true
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20 font-bold'
                        : 'bg-emerald-50/30 hover:bg-emerald-100/50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 border-emerald-500/20 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-350'
                    }`}
                  >
                    হ্যাঁ, আছে
                  </button>
                  <button
                    onClick={() => setHasNisabAsset(false)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
                      hasNisabAsset === false
                        ? 'bg-red-600 border-red-600 text-white shadow-red-600/20 font-bold'
                        : 'bg-red-50/30 hover:bg-red-100/50 dark:bg-red-950/10 dark:hover:bg-red-950/20 border-red-500/20 dark:border-red-800/40 text-red-800 dark:text-red-350'
                    }`}
                  >
                    না, নেই
                  </button>
                </div>
              </div>

              {/* Question 2 */}
              <div className={`space-y-3 transition-opacity duration-300 ${hasNisabAsset === null ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs">২</span>
                  এই নিসাব পরিমাণ উদ্বৃত্ত সম্পদ কি এক চন্দ্র বছর (৩৫৪ দিন) বা এক সৌর বছর (৩৬৫ দিন) ধরে আপনার মালিকানাধীন রয়েছে?
                </label>
                <div className="flex gap-3 pl-8">
                  <button
                    onClick={() => setHasOneYearPassed(true)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
                      hasOneYearPassed === true
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20 font-bold'
                        : 'bg-emerald-50/30 hover:bg-emerald-100/50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 border-emerald-500/20 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-350'
                    }`}
                  >
                    হ্যাঁ, এক বছর পূর্ণ হয়েছে
                  </button>
                  <button
                    onClick={() => setHasOneYearPassed(false)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
                      hasOneYearPassed === false
                        ? 'bg-red-600 border-red-600 text-white shadow-red-600/20 font-bold'
                        : 'bg-red-50/30 hover:bg-red-100/50 dark:bg-red-950/10 dark:hover:bg-red-950/20 border-red-500/20 dark:border-red-800/40 text-red-800 dark:text-red-350'
                    }`}
                  >
                    না, পূর্ণ হয়নি
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                disabled={hasNisabAsset === null || (hasNisabAsset === true && hasOneYearPassed === null)}
                onClick={handleEligibilityNext}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:dark:bg-darkBg-light disabled:text-gray-400 dark:disabled:text-gray-600 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">ধাপ ২: তথ্য প্রদান</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">আপনার সঞ্চিত সম্পদের পরিমাণ উল্লেখ করুন</h3>
              <p className="text-xs text-gray-500">আপনার হিসাবের সুবিধার্থে আনুমানিক বা সঠিক পরিমাণগুলো বাংলায় বা ইংরেজিতে লিখুন:</p>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Cash */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">নগদ অর্থ (হাতে থাকা)</label>
                <NumericInput
                  placeholder="৳ ০.০০"
                  value={inputs.cash}
                  onChange={(val) => handleInputChange('cash', val)}
                />
              </div>

              {/* Bank Balance */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">ব্যাংক ব্যালেন্স (সেভিংস/কারেন্ট)</label>
                <NumericInput
                  placeholder="৳ ০.০০"
                  value={inputs.bankBalance}
                  onChange={(val) => handleInputChange('bankBalance', val)}
                />
              </div>

              {/* Gold Value */}
              <div className="space-y-2.5 p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gray-50/30 dark:bg-darkBg-light/10">
                <div className="flex justify-between items-center pb-1">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">স্বর্ণের হিসাব (Gold)</label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">স্বর্ণের মান (Carat)</span>
                    <select
                      value={goldCarat}
                      onChange={(e) => handleGoldCaratChange(e.target.value as keyof GoldRates)}
                      className="block w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs transition-all font-siliguri font-bold text-emerald-800 dark:text-emerald-400"
                    >
                      <option value="24k">২৪ ক্যারেট (বার / পাকা সোনা)</option>
                      <option value="22k">২২ ক্যারেট (অলঙ্কার)</option>
                      <option value="21k">২১ ক্যারেট</option>
                      <option value="18k">১৮ ক্যারেট</option>
                      <option value="traditional">সনাতন স্বর্ণ</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">স্বর্ণের পরিমাণ</span>
                      <NumericInput
                        placeholder="পরিমাণ"
                        value={goldWeight}
                        onChange={(val) => setGoldWeight(val)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">একক (Unit)</span>
                      <select
                        value={goldUnit}
                        onChange={(e) => handleGoldUnitChange(e.target.value as 'gram' | 'vori')}
                        className="block w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs transition-all font-siliguri"
                      >
                        <option value="vori">ভরি / তোলা</option>
                        <option value="gram">গ্রাম</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-100/50 dark:bg-darkBg-light/40 p-2.5 rounded-xl border border-gray-200/20 flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-siliguri">প্রতি {goldUnit === 'gram' ? 'গ্রাম' : 'ভরি'} এর বাজার দর:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300 font-siliguri">
                      {formatBanglaCurrency(goldPricePerUnit)}
                    </span>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10 flex justify-between items-center text-xs">
                    <span className="text-emerald-800 dark:text-emerald-350 font-siliguri">মোট বাজার মূল্য:</span>
                    <span className="font-bold text-emerald-850 dark:text-emerald-300 font-siliguri">{formatBanglaCurrency(inputs.goldValue)}</span>
                  </div>
                </div>
              </div>

              {/* Silver Value */}
              <div className="space-y-2.5 p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gray-50/30 dark:bg-darkBg-light/10">
                <div className="flex justify-between items-center pb-1">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">রৌপ্যের হিসাব (Silver)</label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">রৌপ্যের মান (Carat)</span>
                    <select
                      value={silverCarat}
                      onChange={(e) => handleSilverCaratChange(e.target.value as keyof SilverRates)}
                      className="block w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs transition-all font-siliguri font-bold text-emerald-800 dark:text-emerald-400"
                    >
                      <option value="22k">২২ ক্যারেট</option>
                      <option value="21k">২১ ক্যারেট</option>
                      <option value="18k">১৮ ক্যারেট</option>
                      <option value="traditional">সনাতন রূপা</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">রৌপ্যের পরিমাণ</span>
                      <NumericInput
                        placeholder="পরিমাণ"
                        value={silverWeight}
                        onChange={(val) => setSilverWeight(val)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">একক (Unit)</span>
                      <select
                        value={silverUnit}
                        onChange={(e) => handleSilverUnitChange(e.target.value as 'gram' | 'vori')}
                        className="block w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs transition-all font-siliguri"
                      >
                        <option value="vori">ভরি / তোলা</option>
                        <option value="gram">গ্রাম</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-100/50 dark:bg-darkBg-light/40 p-2.5 rounded-xl border border-gray-200/20 flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-siliguri">প্রতি {silverUnit === 'gram' ? 'গ্রাম' : 'ভরি'} এর বাজার দর:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300 font-siliguri">
                      {formatBanglaCurrency(silverPricePerUnit)}
                    </span>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10 flex justify-between items-center text-xs">
                    <span className="text-emerald-800 dark:text-emerald-350 font-siliguri">মোট বাজার মূল্য:</span>
                    <span className="font-bold text-emerald-850 dark:text-emerald-300 font-siliguri">{formatBanglaCurrency(inputs.silverValue)}</span>
                  </div>
                </div>
              </div>

              {/* Business Assets */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">ব্যবসায়িক পণ্য ও ক্যাশ</label>
                <NumericInput
                  placeholder="৳ ০.০০"
                  value={inputs.businessAssets}
                  onChange={(val) => handleInputChange('businessAssets', val)}
                />
              </div>

              {/* Investments */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">শেয়ার ও অন্যান্য দীর্ঘমেয়াদী বিনিয়োগ</label>
                <NumericInput
                  placeholder="৳ ০.০০"
                  value={inputs.investments}
                  onChange={(val) => handleInputChange('investments', val)}
                />
              </div>

              {/* Receivables */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">পাওনা অর্থ (যা ফেরত পাওয়ার সম্ভাবনা রয়েছে)</label>
                <NumericInput
                  placeholder="৳ ০.০০"
                  value={inputs.receivables}
                  onChange={(val) => handleInputChange('receivables', val)}
                />
              </div>

              {/* Debts */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri text-red-600 dark:text-red-400">বাদ যাবে: স্বল্পমেয়াদী বা বর্তমান প্রদেয় ঋণ</label>
                <NumericInput
                  placeholder="৳ ০.০০"
                  value={inputs.debts}
                  onChange={(val) => handleInputChange('debts', val)}
                  error={inputs.debts > 0}
                />
              </div>

              {/* Nisab Basis Switcher */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">নিসাবের ভিত্তি নির্বাচন</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleInputChange('nisabType', 'silver')}
                    className={`p-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all text-center flex flex-col justify-center items-center gap-1 ${
                      inputs.nisabType === 'silver'
                        ? 'border-emerald-600 bg-emerald-50/55 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-350'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500'
                    }`}
                  >
                    <span className="font-siliguri font-bold">রৌপ্য ভিত্তিক (জনপ্রিয়)</span>
                    <span className="text-[10px] font-normal font-siliguri opacity-80">দরিদ্রদের কল্যাণে এটি উত্তম (~৳৯৮,০০০+)</span>
                  </button>
                  <button
                    onClick={() => handleInputChange('nisabType', 'gold')}
                    className={`p-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all text-center flex flex-col justify-center items-center gap-1 ${
                      inputs.nisabType === 'gold'
                        ? 'border-emerald-600 bg-emerald-50/55 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-350'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500'
                    }`}
                  >
                    <span className="font-siliguri font-bold">স্বর্ণ ভিত্তিক</span>
                    <span className="text-[10px] font-normal font-siliguri opacity-80">যদি শুধুমাত্র সোনা থাকে (~৳৯,১৮,০০০+)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Row */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri"
              >
                <ArrowLeft className="w-4 h-4" />
                পূর্ববর্তী ধাপ
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                ফলাফল দেখুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results Panel */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            
            {/* 3a. Summary Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-md ${
              result.isEligible 
                ? 'bg-gradient-to-br from-emerald-900 to-teal-950 border-emerald-700 text-white shadow-emerald-950/20' 
                : 'bg-white dark:bg-darkBg-light/45 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white'
            }`}>
              {result.isEligible ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-siliguri">
                    আলহামদুলিল্লাহ, আপনার উপর যাকাত আবশ্যক
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm opacity-75 font-siliguri">আপনার প্রদেয় যাকাতের পরিমাণ</p>
                    <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 animate-pulse-gold tracking-tight">
                      {formatBanglaCurrency(result.zakatAmount)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার নিট সম্পদ {formatBanglaCurrency(result.netAssets)} যাকাতের নিসাব সীমা ({formatBanglaCurrency(result.nisabThreshold)}) অতিক্রম করেছে। এই মোট নিট সম্পদের ২.৫% যাকাত আদায় করা ফরজ।
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-500/10 font-siliguri">
                      আপনার উপর যাকাত ফরজ নয়
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-siliguri text-gray-900 dark:text-white pt-2">
                      ৳ ০
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার নিট যাকাতযোগ্য সম্পদ ({formatBanglaCurrency(result.netAssets)}) নিসাব সীমা ({formatBanglaCurrency(result.nisabThreshold)}) অতিক্রম করেনি অথবা সম্পদ এক চন্দ্র বছর আপনার নিকট অতিবাহিত হয়নি। তাই আপনার উপর যাকাত প্রদান ফরজ নয়।
                  </p>
                </>
              )}
            </div>

            {/* 3b. Visualization Chart Card (Visible only if total assets > 0) */}
            {result.totalAssets > 0 && (
              <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
                <h4 className="text-base font-bold text-gray-950 dark:text-white font-siliguri flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  আপনার সম্পদের অনুপাত ও বিভাজন চিত্র
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
                      <Bar dataKey="পরিমাণ" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3c. Detailed Calculations Breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-6">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                হিসাবের বিস্তারিত বিবরণী (Breakdown)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm font-siliguri">
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">নগদ অর্থ:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.cash)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">ব্যাংক ব্যালেন্স:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.bankBalance)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">স্বর্ণের মোট মূল্য:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.goldValue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">রৌপ্যের মোট মূল্য:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.silverValue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">ব্যবসায়িক পণ্য:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.businessAssets)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">বিনিয়োগ ও শেয়ার:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.investments)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40">
                  <span className="text-gray-500 dark:text-gray-400">পাওনা অর্থ:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.breakdown.receivables)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/60 dark:border-gray-800/40 text-red-600 dark:text-red-400 font-bold">
                  <span>বাদ যাবে (ঋণ):</span>
                  <span>- {formatBanglaCurrency(result.breakdown.debts)}</span>
                </div>
              </div>

              {/* Summaries totals */}
              <div className="bg-gray-50/50 dark:bg-darkBg-light/40 p-4 rounded-xl space-y-2.5 font-siliguri text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>মোট যাকাতযোগ্য সম্পদ (Assets):</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.totalAssets)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 dark:text-white border-t border-gray-200/50 dark:border-gray-800 pt-2 text-sm sm:text-base">
                  <span>নিট যাকাতযোগ্য সম্পদ (Net):</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{formatBanglaCurrency(result.netAssets)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-500 text-[11px] pt-1">
                  <span>নিসাব সীমা ({inputs.nisabType === 'silver' ? 'রুপা' : 'সোনা'} ভিত্তিক):</span>
                  <span>{formatBanglaCurrency(result.nisabThreshold)}</span>
                </div>
              </div>
            </div>

            {/* 3d. Islamic Notes & Scripture basis */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-emerald-50/15 dark:bg-emerald-950/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>যাকাতের বিধান ও শরয়ী তথ্যসূত্র</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri">
                {rules.zakat.explanations.rules}
              </p>
              <div className="p-3 bg-white dark:bg-darkBg-dark border-l-4 border-gold-600 rounded-r-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri italic">
                {rules.references.zakat}
              </div>
            </div>

            {/* 3e. Guided Flow Actions (Save, Copy, PDF, Go Back) */}
            <div className="pt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri mr-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                তথ্য সংশোধন করুন
              </button>
              
              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                হিসাব সংরক্ষণ করুন
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
