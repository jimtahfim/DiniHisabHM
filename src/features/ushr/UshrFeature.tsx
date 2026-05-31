import { useState, useEffect } from 'react';
import { calculateUshr, type UshrInputs } from '../../engines/ushrEngine';
import { 
  convertToBanglaNumber, 
  formatBanglaCurrency, 
  formatBanglaPercent 
} from '../../utils/banglaNumber';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import { NumericInput } from '../../components/NumericInput';
import rules from '../../config/rules.json';
import { 
  Wheat, ArrowLeft, ArrowRight, CheckCircle2, 
  HelpCircle, Save, RefreshCw, BarChart3, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface UshrFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
}

export function UshrFeature({ onSaveHistory, initialState }: UshrFeatureProps) {
  // Steps: 1: Eligibility, 2: Calculator, 3: Results
  const [step, setStep] = useState(1);

  // Eligibility states
  const [harvestWeight, setHarvestWeight] = useState(700); // 700 kg default (above Nisab)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'maund'>('kg');

  // Form Inputs
  const [harvestValue, setHarvestValue] = useState(50000); // ৳ ৫০,০০০ default
  const [irrigationType, setIrrigationType] = useState<UshrInputs['irrigationType']>('rain');

  const [inputs, setInputs] = useState<UshrInputs>(() => ({
    harvestWeightKg: harvestWeight,
    harvestValue,
    irrigationType
  }));

  const [result, setResult] = useState(() => calculateUshr(inputs));

  // Sync inputs
  useEffect(() => {
    const weightInKg = weightUnit === 'kg' ? harvestWeight : harvestWeight * 37.32;
    setInputs({
      harvestWeightKg: Math.max(0, weightInKg),
      harvestValue: Math.max(0, harvestValue),
      irrigationType,
      weightUnit
    } as any);
  }, [harvestWeight, weightUnit, harvestValue, irrigationType]);

  useEffect(() => {
    setResult(calculateUshr(inputs));
  }, [inputs]);

  // Load from history if available
  useEffect(() => {
    if (initialState) {
      const { harvestWeightKg, harvestValue, irrigationType, weightUnit: savedUnit } = initialState.inputs;
      if (savedUnit) {
        setWeightUnit(savedUnit);
        setHarvestWeight(savedUnit === 'kg' ? harvestWeightKg : Number((harvestWeightKg / 37.32).toFixed(1)));
      } else {
        setWeightUnit('kg');
        setHarvestWeight(harvestWeightKg);
      }
      setHarvestValue(harvestValue);
      setIrrigationType(irrigationType);
      setStep(3);
    }
  }, [initialState]);

  const handleEligibilityNext = () => {
    const weightInKg = weightUnit === 'kg' ? harvestWeight : harvestWeight * 37.32;
    if (weightInKg >= rules.ushr.nisabKg) {
      setStep(2);
    } else {
      setStep(3); // show Ushr not applicable
    }
  };

  const handleSaveToHistory = () => {
    const formattedWeight = weightUnit === 'maund' 
      ? `${convertToBanglaNumber(harvestWeight)} মণ`
      : `${convertToBanglaNumber(harvestWeight)} কেজি`;
    const summary = result.isEligible 
      ? `উশর: প্রদেয় ${formatBanglaCurrency(result.ushrAmount)} (ওজন: ${formattedWeight})` 
      : 'উশর প্রযোজ্য নয়';
    onSaveHistory(summary, inputs, result);
    alert('উশর হিসাবটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setHarvestWeight(700);
    setWeightUnit('kg');
    setHarvestValue(50000);
    setIrrigationType('rain');
  };

  // Chart setup
  const chartData = [
    { name: 'ফসলের মোট মূল্য', পরিমাণ: result.harvestValue },
    { name: 'প্রদেয় উশর', পরিমাণ: result.ushrAmount }
  ];

  const copyText = `দ্বীনি হিসাব — উশর (ফসলের যাকাত) রিপোর্ট
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
১. ফসলের মোট ওজন: ${weightUnit === 'maund' ? `${convertToBanglaNumber(harvestWeight)} মণ (~${convertToBanglaNumber(Math.round(inputs.harvestWeightKg))} কেজি)` : `${convertToBanglaNumber(harvestWeight)} কেজি (~${convertToBanglaNumber((inputs.harvestWeightKg / 37.32).toFixed(1))} মণ)`}
২. উশর যোগ্যতা: ${result.isEligible ? 'উশর প্রযোজ্য' : 'এখনও প্রযোজ্য নয় (নিসাব অতিক্রম করেনি)'}
৩. সেচ ব্যবস্থা: ${inputs.irrigationType === 'rain' ? 'প্রাকৃতিক (১০%)' : 'কৃত্রিম সেচ ও সার (৫%)'}
৪. ফসলের প্রাক্কলিত মূল্য: ${formatBanglaCurrency(result.harvestValue)}
------------------------------------------
মোট প্রদেয় উশরের পরিমাণ: ${formatBanglaCurrency(result.ushrAmount)}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 border border-lime-500/20 flex items-center justify-center shadow-sm">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">উশর (ফসলের যাকাত) ক্যালকুলেটর</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">উৎপাদিত কৃষিজমি ফসলের ধরণ ও সেচ ব্যবস্থা অনুযায়ী ফসলি যাকাত নির্ণয়</p>
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
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-lime-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-lime-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-lime-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
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
              <span className="text-xs font-bold text-lime-655 dark:text-lime-400 tracking-wider uppercase">ধাপ ১: যোগ্যতা যাচাই</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">ফসলের উশর ফরজ হওয়ার নিসাব কত?</h3>
              <p className="text-xs sm:text-sm text-gray-500">শরিয়তের নিয়ম অনুসারে মাঠ থেকে উৎপাদিত ফসলের ওজন ৫ ওয়াসাক (যা প্রায় ৬৫৩ কেজি বা ১৮ মণ ৩০ কেজি) অতিক্রম করলে উশর আদায় করা ফরজ হয়।</p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Question 1 */}
              <div className="space-y-3">
                <label className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 font-siliguri flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-400 font-bold text-xs">১</span>
                  আপনার মাঠ থেকে কর্তনকৃত মোট ফসলের ওজন ও পরিমাপের একক নির্বাচন করুন:
                </label>
                <div className="pl-8 space-y-2 max-w-md">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <NumericInput
                        placeholder="ফসলের ওজন লিখুন"
                        value={harvestWeight}
                        onChange={(val) => setHarvestWeight(val)}
                        className="focus:ring-lime-500 text-sm"
                      />
                    </div>
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'maund')}
                      className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-lime-500 text-xs transition-all font-siliguri font-bold text-lime-800 dark:text-lime-400"
                    >
                      <option value="kg">কেজি (KG)</option>
                      <option value="maund">মণ (Maund)</option>
                    </select>
                  </div>
                  {harvestWeight > 0 && (
                    <p className="text-xs text-gray-400">
                      {weightUnit === 'kg' ? (
                        <>আনুমানিক ওজনে প্রায় <strong>{convertToBanglaNumber((harvestWeight / 37.32).toFixed(1))}</strong> মণ ফসল হয়েছে।</>
                      ) : (
                        <>মেট্রিক ওজনে প্রায় <strong>{convertToBanglaNumber((harvestWeight * 37.32).toFixed(0))}</strong> কেজি ফসল হয়েছে।</>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                disabled={harvestWeight <= 0}
                onClick={handleEligibilityNext}
                className="px-6 py-3 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
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
              <span className="text-xs font-bold text-lime-655 dark:text-lime-400 tracking-wider uppercase">ধাপ ২: তথ্য প্রদান</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">ফসলের আনুমানিক বাজার মূল্য ও সেচ ব্যবস্থা</h3>
              <p className="text-xs text-gray-500">আপনার মাঠের ফসলের বাজার দর ও সেচের ধরণ উল্লেখ করুন:</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Market Value Input */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">ফসলের মোট আনুমানিক বাজার মূল্য (৳)</label>
                <NumericInput
                  placeholder="৳ ৫০,০০০"
                  value={harvestValue}
                  onChange={(val) => setHarvestValue(val)}
                  className="focus:ring-lime-500 text-sm"
                />
              </div>

              {/* Irrigation basis switcher */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">ফসলের সেচ ও পানি দেওয়ার ব্যবস্থা নির্বাচন</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setIrrigationType('rain')}
                    className={`p-4 rounded-xl border font-bold text-xs sm:text-sm text-left flex flex-col justify-between gap-1 transition-all ${
                      irrigationType === 'rain'
                        ? 'border-lime-500 bg-lime-50/50 dark:bg-lime-950/20 text-lime-800 dark:text-lime-300'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500'
                    }`}
                  >
                    <span className="font-siliguri font-bold text-sm">প্রাকৃতিক বা বৃষ্টির পানি (১০% হার)</span>
                    <span className="text-[10px] font-normal font-siliguri opacity-80 leading-normal">যেখানে প্রাকৃতিকভাবে পানি সরবরাহ হয়, যেমন নদী/বৃষ্টি (উশর)।</span>
                  </button>
                  <button
                    onClick={() => setIrrigationType('irrigated')}
                    className={`p-4 rounded-xl border font-bold text-xs sm:text-sm text-left flex flex-col justify-between gap-1 transition-all ${
                      irrigationType === 'irrigated'
                        ? 'border-lime-500 bg-lime-50/50 dark:bg-lime-950/20 text-lime-800 dark:text-lime-300'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500'
                    }`}
                  >
                    <span className="font-siliguri font-bold text-sm">কৃত্রিম সেচ ও সার (৫% হার)</span>
                    <span className="text-[10px] font-normal font-siliguri opacity-80 leading-normal">যেখানে পাম্প সেচ, সার ও শ্রমের মাধ্যমে ব্যয়বহুল চাষ হয় (নিসফে উশর)।</span>
                  </button>
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
                className="px-6 py-3 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                ফলাফল দেখুন
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
                ? 'bg-gradient-to-br from-lime-900 via-emerald-900 to-teal-950 border-lime-700 text-white shadow-lime-950/20' 
                : 'bg-white dark:bg-darkBg-light/45 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white'
            }`}>
              {result.isEligible ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-lime-500/20 text-lime-300 border border-lime-500/30 font-siliguri">
                    আলহামদুলিল্লাহ, আপনার ফসলে উশর প্রযোজ্য
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm opacity-75 font-siliguri">আপনার প্রদেয় উশরের মোট পরিমাণ</p>
                    <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 tracking-tight">
                      {formatBanglaCurrency(result.ushrAmount)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার মোট ফসল <strong>{weightUnit === 'maund' ? `${convertToBanglaNumber(harvestWeight)} মণ` : `${convertToBanglaNumber(harvestWeight)} কেজি`}</strong> ফসলের নিসাব সীমা <strong>{convertToBanglaNumber(result.nisabWeightThreshold)} কেজি</strong> অতিক্রম করেছে। আপনার সেচ অনুযায়ী ফসলি যাকাতের উশর হার <strong>{formatBanglaPercent(result.ushrRate * 100)}</strong> নির্ধারণ করা হয়েছে।
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-sm">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-500/10 font-siliguri">
                      আপনার ফসলে উশর প্রযোজ্য নয়
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-siliguri text-gray-900 dark:text-white pt-2">
                      ৳ ০
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri max-w-lg mx-auto">
                    আপনার ফসলের মোট ওজন <strong>{weightUnit === 'maund' ? `${convertToBanglaNumber(harvestWeight)} মণ` : `${convertToBanglaNumber(harvestWeight)} কেজি`}</strong> যা ইসলামী শরিয়তে মাঠের ফসলের ন্যূনতম নিসাব সীমা <strong>{convertToBanglaNumber(result.nisabWeightThreshold)} কেজি (~৬৫৩ কেজি)</strong> এর নিচে থাকায় উশর প্রদান ফরজ নয়।
                  </p>
                </>
              )}
            </div>

            {/* 3b. Chart representation (Harvest vs Ushr comparison) */}
            {result.harvestValue > 0 && (
              <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
                <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                  ফসলের মূল্য ও প্রদেয় উশরের তুলনা চিত্র
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
                      <Bar dataKey="পরিমাণ" fill="#84cc16" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3c. Detailed Calculations Breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                উশর হিসাবের বিবরণী
              </h4>
              
              <div className="space-y-3 font-siliguri text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">ফসলের মোট ওজন:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">
                    {weightUnit === 'maund' 
                      ? `${convertToBanglaNumber(harvestWeight)} মণ (~${convertToBanglaNumber(Math.round(inputs.harvestWeightKg))} কেজি)`
                      : `${convertToBanglaNumber(harvestWeight)} কেজি (~${convertToBanglaNumber((inputs.harvestWeightKg / 37.32).toFixed(1))} মণ)`}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">উশর নিসাব সীমা:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{convertToBanglaNumber(result.nisabWeightThreshold)} কেজি (~১৮ মণ ৩০ কেজি)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">সেচ ও পানি ব্যবস্থা:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{inputs.irrigationType === 'rain' ? 'প্রাকৃতিক বা বৃষ্টির পানি' : 'কৃত্রিম সেচ ও সার চাষ'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                  <span className="text-gray-500">উশরের শরয়ী হার:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{formatBanglaPercent(result.ushrRate * 100)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40 font-semibold">
                  <span className="text-gray-500">ফসলের বাজার মূল্য:</span>
                  <span className="text-gray-800 dark:text-gray-100">{formatBanglaCurrency(result.harvestValue)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold text-gray-955 dark:text-white border-t border-gray-200 dark:border-gray-800/60 pt-3">
                  <span>মোট প্রদেয় উশর (কৃষি যাকাত):</span>
                  <span className="text-lime-655 dark:text-lime-400">{formatBanglaCurrency(result.ushrAmount)}</span>
                </div>
              </div>
            </div>

            {/* 3d. Islamic Scripture References */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-lime-50/15 dark:bg-lime-950/5 space-y-4">
              <div className="flex items-center gap-2 text-lime-800 dark:text-lime-400 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>উশর সংক্রান্ত শরয়ী তথ্যসূত্র ও নিয়ম</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri">
                ফসলের যাকাতকে বা ভূমি থেকে উৎপাদিত পণ্যের যাকাতকে উশর বলা হয়। বৃষ্টির পানিতে প্রাকৃতিকভাবে উৎপাদিত ফসলের উশর ১০% (দশ ভাগের এক ভাগ) এবং কৃত্রিম সেচের মাধ্যমে উৎপাদিত ফসলের উশর ৫% (বিশ ভাগের এক ভাগ)। উশর ফসল কাটার পর সাথে সাথেই আদায় করতে হয়, এর জন্য বছর অতিক্রান্ত হওয়া শর্ত নয়।
              </p>
              <div className="p-3 bg-white dark:bg-darkBg-dark border-l-4 border-gold-600 rounded-r-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri italic">
                {rules.references.ushr}
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
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-lime-655 dark:text-lime-400" />
                উশর হিসাব সংরক্ষণ
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
