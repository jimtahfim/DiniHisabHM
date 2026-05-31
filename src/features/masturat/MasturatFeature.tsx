import { useState, useEffect } from 'react';
import { calculateMasturat, type MasturatInputs } from '../../engines/masturatEngine';
import { convertToBanglaNumber } from '../../utils/banglaNumber';
import { NumericInput } from '../../components/NumericInput';
import { CopyButton } from '../../components/CopyButton';
import { PDFExportButton } from '../../components/PDFExportButton';
import { 
  Sparkles, ArrowLeft, ArrowRight, CheckCircle2, 
  Save, RefreshCw, Calendar, Clock, 
  Heart, ShieldCheck, ShieldAlert, BookOpen,
  Info, Droplets, AlertTriangle, Bath
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface MasturatFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
}

export function MasturatFeature({ onSaveHistory, initialState }: MasturatFeatureProps) {
  // Steps: 1: Habit Setup, 2: Current Flow, 3: Results
  const [step, setStep] = useState(1);

  // Form Inputs
  const [habitHayd, setHabitHayd] = useState(6); // Default 6 days
  const [habitTuhr, setHabitTuhr] = useState(20); // Default 20 days
  const [lastPurity, setLastPurity] = useState(20); // Default 20 days since last hayd

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('08:00');
  const [isStillBleeding, setIsStillBleeding] = useState<boolean>(true);
  
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endTime, setEndTime] = useState('08:00');

  // Calculation inputs state
  const [inputs, setInputs] = useState<MasturatInputs>({
    habitHaydDays: habitHayd,
    habitTuhrDays: habitTuhr,
    lastPurityDays: lastPurity,
    flowStartDate: startDate,
    flowStartTime: startTime,
    isStillBleeding: isStillBleeding,
    flowEndDate: endDate,
    flowEndTime: endTime
  });

  const [result, setResult] = useState(() => calculateMasturat(inputs));

  // Sync inputs
  useEffect(() => {
    setInputs({
      habitHaydDays: Math.max(3, Math.min(10, habitHayd)),
      habitTuhrDays: Math.max(15, habitTuhr),
      lastPurityDays: Math.max(0, lastPurity),
      flowStartDate: startDate,
      flowStartTime: startTime,
      isStillBleeding,
      flowEndDate: isStillBleeding ? undefined : endDate,
      flowEndTime: isStillBleeding ? undefined : endTime
    });
  }, [
    habitHayd, habitTuhr, lastPurity, 
    startDate, startTime, isStillBleeding, 
    endDate, endTime
  ]);

  useEffect(() => {
    setResult(calculateMasturat(inputs));
  }, [inputs]);

  // Load from history if available
  useEffect(() => {
    if (initialState) {
      const {
        habitHaydDays,
        habitTuhrDays,
        lastPurityDays,
        flowStartDate,
        flowStartTime,
        isStillBleeding,
        flowEndDate,
        flowEndTime
      } = initialState.inputs;

      setHabitHayd(habitHaydDays);
      setHabitTuhr(habitTuhrDays);
      setLastPurity(lastPurityDays);
      setStartDate(flowStartDate);
      setStartTime(flowStartTime);
      setIsStillBleeding(isStillBleeding);
      if (flowEndDate) setEndDate(flowEndDate);
      if (flowEndTime) setEndTime(flowEndTime);
      setStep(3);
    }
  }, [initialState]);

  const handleSaveToHistory = () => {
    const statusLabel = result.isPure ? 'পবিত্র (Tahirah)' : 'অপবিত্র (ঋতুবতী)';
    const summary = `মাস্তুরাত: ${result.rulingTitle} — ${statusLabel} (${result.durationLabel})`;
    onSaveHistory(summary, inputs, result);
    alert('হিসাবটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setHabitHayd(6);
    setHabitTuhr(20);
    setLastPurity(20);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setStartTime('08:00');
    setIsStillBleeding(true);
    setEndDate(today);
    setEndTime('08:00');
  };

  const toBanglaNum = (num: number) => {
    return convertToBanglaNumber(num);
  };

  // Format a date string to Bangla locale
  const formatBanglaDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('bn-BD', { 
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
      });
    } catch {
      return dateStr;
    }
  };

  // Pie chart data
  const pieChartData = (() => {
    const { breakdown } = result;
    const data: { name: string; value: number; color: string }[] = [];
    
    if (breakdown.haydDays > 0) {
      data.push({ name: 'হায়েজ (ঋতুস্রাব)', value: Math.round(breakdown.haydDays * 10) / 10, color: '#ec4899' });
    }
    if (breakdown.istihadahDays > 0) {
      data.push({ name: 'ইস্তিহাজা (অনিয়মিত)', value: Math.round(breakdown.istihadahDays * 10) / 10, color: '#f59e0b' });
    }
    
    // Show habit tuhr as remaining cycle context
    const cycleTotal = habitHayd + habitTuhr;
    const flowTotal = breakdown.haydDays + breakdown.istihadahDays;
    const purityPortion = Math.max(0, cycleTotal - flowTotal);
    if (purityPortion > 0) {
      data.push({ name: 'পবিত্রতা (তুহর)', value: Math.round(purityPortion * 10) / 10, color: '#10b981' });
    }
    
    return data;
  })();

  const copyText = `দ্বীনি হিসাব — মাস্তুরাত (পবিত্রতা ও ঋতুস্রাব) রিপোর্ট
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
১. স্বাভাবিক ঋতুস্রাবের অভ্যাস: ${toBanglaNum(habitHayd)} দিন
২. পবিত্রতার স্বাভাবিক অভ্যাস: ${toBanglaNum(habitTuhr)} দিন
৩. বিগত পবিত্রতার মেয়াদ: ${toBanglaNum(lastPurity)} দিন
------------------------------------------
চলতি প্রবাহের তথ্য:
- শুরু: ${formatBanglaDate(startDate)} (${startTime})
- স্থিতি: ${isStillBleeding ? 'চলমান' : 'বন্ধ হয়েছে (' + formatBanglaDate(endDate) + ' ' + endTime + ')'}
- রক্তস্রাবের মোট মেয়াদ: ${result.durationLabel}
------------------------------------------
শরয়ী ফায়সালা:
- অবস্থা: ${result.isPure ? 'পবিত্র (সালাত/সওম ফরজ)' : 'অপবিত্র (ঋতুস্রাব চলমান)'}
- ফায়সালা: ${result.rulingTitle}
${result.qazaNamazDays > 0 ? `- কাযা নামাজ: ${toBanglaNum(result.qazaNamazDays)} দিনের` : ''}
${result.needsGhusl ? '- গোসল: ফরজ গোসল সম্পন্ন করা আবশ্যক' : ''}
${result.nextExpectedHaydDate ? `- পরবর্তী আনুমানিক ঋতুস্রাব: ${formatBanglaDate(result.nextExpectedHaydDate)}` : ''}
------------------------------------------
করণীয় পদক্ষেপ:
${result.rulingSteps.map((s, idx) => `${toBanglaNum(idx + 1)}. ${s}`).join('\n')}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  // Pie chart custom tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs font-siliguri">
          <p className="font-bold text-gray-800 dark:text-white">{payload[0].name}</p>
          <p className="text-gray-500">{convertToBanglaNumber(payload[0].value)} দিন</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend renderer
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5 text-xs font-siliguri">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-400">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">মাস্তুরাত সংক্রান্ত</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">মহিলাদের বিশেষ দিন ও পবিত্রতার শরয়ী সমাধান</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 transition-colors font-siliguri"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          নতুন হিসাব শুরু
        </button>
      </div>

      {/* Step Indicators — labeled */}
      <div className="flex items-center justify-center gap-1.5 max-w-lg mx-auto no-print">
        {[
          { label: 'অভ্যাস', num: 1 },
          { label: 'প্রবাহ', num: 2 },
          { label: 'ফলাফল', num: 3 }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className={`w-full h-2 rounded-full transition-all duration-300 ${step >= s.num ? 'bg-pink-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
              <span className={`text-[10px] font-bold font-siliguri transition-colors ${step >= s.num ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400 dark:text-gray-600'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div className="w-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Habit Setup */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 tracking-wider uppercase font-siliguri">ধাপ ১: স্বাভাবিক অভ্যাস (আদাত)</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">আপনার ঋতুস্রাব ও পবিত্রতার স্বাভাবিক অভ্যাস নির্ধারণ করুন</h3>
              <p className="text-xs sm:text-sm text-gray-500 font-siliguri">ইসলামী ফিকহ অনুযায়ী রক্তস্রাব দীর্ঘায়িত হলে অভ্যাসের মাধ্যমে শরয়ী মেয়াদ নির্ধারণ করা হয়।</p>
            </div>

            {/* Quick reference info card */}
            <div className="p-4 rounded-xl bg-pink-50/40 dark:bg-pink-950/10 border border-pink-200/40 dark:border-pink-800/30 flex gap-3 text-xs leading-relaxed text-pink-800 dark:text-pink-300">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="font-siliguri space-y-1">
                <p><strong>হানাফি মাযহাবের মূল নিয়ম:</strong></p>
                <p>• ঋতুস্রাবের <strong>সর্বনিম্ন মেয়াদ ৩ দিন</strong> (৭২ ঘণ্টা) ও <strong>সর্বোচ্চ মেয়াদ ১০ দিন</strong> (২৪০ ঘণ্টা)</p>
                <p>• দুই ঋতুস্রাবের মধ্যে পবিত্রতার <strong>সর্বনিম্ন মেয়াদ ১৫ দিন</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Regular Hayd Duration */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50/50 dark:bg-darkBg-light/10 border border-gray-100 dark:border-gray-800/40">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-pink-500" />
                  ঋতুস্রাবের অভ্যাস
                </label>
                <NumericInput
                  placeholder="৬"
                  value={habitHayd}
                  onChange={(val) => setHabitHayd(val)}
                  className="focus:ring-pink-500 text-sm"
                  showButtons
                  min={3}
                  max={10}
                />
                <p className="text-[10px] text-gray-400 font-siliguri leading-normal">সাধারণত কতদিন ঋতুস্রাব থাকে? (৩ থেকে ১০ দিন)</p>
              </div>

              {/* Regular Tuhr Duration */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50/50 dark:bg-darkBg-light/10 border border-gray-100 dark:border-gray-800/40">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  পবিত্রতার অভ্যাস
                </label>
                <NumericInput
                  placeholder="২০"
                  value={habitTuhr}
                  onChange={(val) => setHabitTuhr(val)}
                  className="focus:ring-pink-500 text-sm"
                  showButtons
                  min={15}
                  max={90}
                />
                <p className="text-[10px] text-gray-400 font-siliguri leading-normal">দুই ঋতুস্রাবের মাঝে কতদিন পবিত্র থাকেন? (সর্বনিম্ন ১৫ দিন)</p>
              </div>

              {/* Last Purity Days since flow */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50/50 dark:bg-darkBg-light/10 border border-gray-100 dark:border-gray-800/40">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  বিগত পবিত্রতা
                </label>
                <NumericInput
                  placeholder="২০"
                  value={lastPurity}
                  onChange={(val) => setLastPurity(val)}
                  className="focus:ring-pink-500 text-sm"
                  showButtons
                  min={0}
                  max={90}
                />
                <p className="text-[10px] text-gray-400 font-siliguri leading-normal">গতমাসে ঋতুস্রাব শেষে কতদিন পবিত্র ছিলেন?</p>
              </div>
            </div>

            {/* Warning if lastPurity is less than 15 */}
            {lastPurity < 15 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/15 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 font-siliguri leading-relaxed flex gap-2"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>সতর্কতা: দুই ঋতুস্রাবের মধ্যবর্তী পবিত্রতা ১৫ দিনের কম হলে বর্তমান রক্তস্রাবটি ঋতুস্রাব নয়, সরাসরি "ইস্তিহাজা" বা অনিয়মিত স্রাব হিসেবে সাব্যস্ত হতে পারে।</span>
              </motion.div>
            )}

            {/* Live Cycle Preview */}
            <div className="p-4 rounded-xl bg-gray-50/60 dark:bg-darkBg-light/10 border border-gray-100 dark:border-gray-800/40 space-y-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-siliguri">আপনার চক্রের প্রাক-পূর্বরূপ</span>
              <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-pink-500/80 rounded-l-lg flex items-center justify-center text-white text-[10px] font-bold font-siliguri transition-all"
                  style={{ width: `${(Math.min(10, Math.max(3, habitHayd)) / (Math.min(10, Math.max(3, habitHayd)) + Math.max(15, habitTuhr))) * 100}%`, minWidth: '50px' }}
                >
                  ঋতু {toBanglaNum(habitHayd)} দিন
                </div>
                <div 
                  className="h-full bg-emerald-500/80 rounded-r-lg flex items-center justify-center text-white text-[10px] font-bold font-siliguri flex-1 transition-all"
                >
                  পবিত্রতা {toBanglaNum(habitTuhr)} দিন
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-siliguri">মোট চক্র: {toBanglaNum(habitHayd + habitTuhr)} দিন</p>
            </div>

            {/* Navigation Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                পরবর্তী ধাপে যান
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Flow Status */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 tracking-wider uppercase font-siliguri">ধাপ ২: চলতি প্রবাহের সময় ও অবস্থা</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">রক্তস্রাবের সঠিক শুরুর সময় ও বর্তমান স্থিতি দিন</h3>
              <p className="text-xs text-gray-500 font-siliguri">শরীয়তের গাণিতিক মেয়াদের জন্য রক্তস্রাব শুরুর সঠিক সময় ও রক্ত বন্ধ হওয়ার সময় দেওয়া অতি জরুরি।</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Start Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    রক্তস্রাব শুরু হওয়ার তারিখ
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-pink-500 text-sm transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-pink-600" />
                    রক্তস্রাব শুরু হওয়ার সময়
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-pink-500 text-sm transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Status Switcher — More visual cards */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">বর্তমানে রক্তস্রাবের অবস্থা</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsStillBleeding(true)}
                    className={`p-4 rounded-xl border font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-2 ${
                      isStillBleeding
                        ? 'border-pink-500 bg-pink-50/60 dark:bg-pink-950/20 text-pink-800 dark:text-pink-300 shadow-sm ring-1 ring-pink-500/20'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Droplets className={`w-6 h-6 ${isStillBleeding ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`} />
                    <span className="font-siliguri">রক্তস্রাব চলমান আছে</span>
                  </button>
                  <button
                    onClick={() => setIsStillBleeding(false)}
                    className={`p-4 rounded-xl border font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-2 ${
                      !isStillBleeding
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <ShieldCheck className={`w-6 h-6 ${!isStillBleeding ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <span className="font-siliguri">রক্তস্রাব বন্ধ হয়ে গেছে</span>
                  </button>
                </div>
              </div>

              {/* End Date & Time (Show only if stopped) */}
              <AnimatePresence>
              {!isStillBleeding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      রক্তস্রাব বন্ধ হওয়ার তারিখ
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-sm transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      রক্তস্রাব বন্ধ হওয়ার সময়
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-sm transition-all font-semibold"
                    />
                  </div>
                </motion.div>
              )}
              </AnimatePresence>

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
                className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                ফলাফল ও ফায়সালা দেখুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            
            {/* Purity Banner Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-md ${
              result.isPure 
                ? 'bg-gradient-to-br from-emerald-900 to-teal-950 border-emerald-700 text-white shadow-emerald-950/20' 
                : 'bg-gradient-to-br from-pink-900 to-rose-950 border-pink-700 text-white shadow-pink-950/20'
            }`}>
              <div className="flex justify-center">
                {result.isPure ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center justify-center shadow-inner">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/20 font-siliguri">
                  বর্তমান অবস্থা: {result.isPure ? 'পবিত্র (Tahirah)' : 'অপবিত্র (ঋতুস্রাব চলমান)'}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold font-siliguri pt-2 text-gold-400">
                  {result.rulingTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-siliguri max-w-xl mx-auto">
                {result.rulingDescription}
              </p>

              {/* Quick action badges */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {result.needsGhusl && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/20 font-siliguri">
                    <Bath className="w-3.5 h-3.5" />
                    ফরজ গোসল আবশ্যক
                  </span>
                )}
                {result.qazaNamazDays > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/20 font-siliguri">
                    কাযা নামাজ: {toBanglaNum(result.qazaNamazDays)} দিনের
                  </span>
                )}
                {result.nextExpectedHaydDate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80 border border-white/15 font-siliguri">
                    <Calendar className="w-3.5 h-3.5" />
                    পরবর্তী আনুমানিক ঋতু: {formatBanglaDate(result.nextExpectedHaydDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Pie Chart & Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pie Chart */}
              {pieChartData.length > 0 && (
                <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4 no-print">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    চক্রের বিভাজন চিত্র
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="transparent"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend content={renderCustomLegend} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Timeline Info */}
              <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  রক্তস্রাবের সময় বিবরণী
                </h4>
                
                <div className="space-y-3 font-siliguri text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-gray-500">স্রাব শুরু:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-right">
                      {formatBanglaDate(startDate)}<br/>
                      <span className="text-[10px] text-gray-400 font-medium">{startTime}</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-gray-500">স্রাব সমাপ্তি:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-right">
                      {isStillBleeding ? (
                        <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1">
                          <Droplets className="w-3 h-3 animate-pulse" />
                          চলমান
                        </span>
                      ) : (
                        <>
                          {formatBanglaDate(endDate)}<br/>
                          <span className="text-[10px] text-gray-400 font-medium">{endTime}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-gray-500">মোট স্থায়ীত্ব:</span>
                    <span className="font-extrabold text-pink-600 dark:text-pink-400">{result.durationLabel}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-gray-500">বিগত পবিত্রতার মেয়াদ:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{convertToBanglaNumber(lastPurity)} দিন</span>
                  </div>
                  {result.breakdown.haydDays > 0 && result.breakdown.istihadahDays > 0 && (
                    <>
                      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                        <span className="text-gray-500">ঋতুস্রাবের মেয়াদ:</span>
                        <span className="font-bold text-pink-600 dark:text-pink-400">{convertToBanglaNumber(Math.round(result.breakdown.haydDays))} দিন</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/40">
                        <span className="text-gray-500">ইস্তিহাজার মেয়াদ:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{convertToBanglaNumber(Math.round(result.breakdown.istihadahDays * 10) / 10)} দিন</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Habit Reference Card */}
            <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                স্বাভাবিক আদাত বা অভ্যাস
              </h4>
              
              {/* Visual Cycle Bar */}
              <div className="flex items-center gap-1 h-10 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-pink-500/80 rounded-l-lg flex items-center justify-center text-white text-[10px] font-bold font-siliguri transition-all"
                  style={{ width: `${(habitHayd / (habitHayd + habitTuhr)) * 100}%`, minWidth: '60px' }}
                >
                  ঋতু {toBanglaNum(habitHayd)} দিন
                </div>
                <div 
                  className="h-full bg-emerald-500/80 rounded-r-lg flex items-center justify-center text-white text-[10px] font-bold font-siliguri flex-1 transition-all"
                >
                  পবিত্রতা {toBanglaNum(habitTuhr)} দিন
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-siliguri text-xs">
                <div className="p-3 rounded-xl bg-pink-50/40 dark:bg-pink-950/10 border border-pink-100 dark:border-pink-800/30 text-center">
                  <p className="text-[10px] text-gray-500">ঋতুর অভ্যাস</p>
                  <p className="text-lg font-black text-pink-600 dark:text-pink-400">{convertToBanglaNumber(habitHayd)} <span className="text-[10px] font-medium">দিন</span></p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-800/30 text-center">
                  <p className="text-[10px] text-gray-500">পবিত্রতার অভ্যাস</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{convertToBanglaNumber(habitTuhr)} <span className="text-[10px] font-medium">দিন</span></p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50/40 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/30 text-center">
                  <p className="text-[10px] text-gray-500">সর্বোচ্চ ঋতুসীমা</p>
                  <p className="text-lg font-black text-gray-800 dark:text-gray-200">১০ <span className="text-[10px] font-medium">দিন</span></p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50/40 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/30 text-center">
                  <p className="text-[10px] text-gray-500">সর্বনিম্ন ঋতুসীমা</p>
                  <p className="text-lg font-black text-gray-800 dark:text-gray-200">৩ <span className="text-[10px] font-medium">দিন</span></p>
                </div>
              </div>
            </div>

            {/* Actionable Steps / Rulings */}
            {result.rulingSteps.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-4">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-600" />
                  শরীয়ত মোতাবেক আপনার করণীয় পদক্ষেপসমূহ
                </h4>
                
                <ul className="space-y-3.5 font-siliguri text-xs sm:text-sm">
                  {result.rulingSteps.map((stepMsg, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed text-gray-700 dark:text-gray-300">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 font-bold text-[10px] mt-0.5">
                        {convertToBanglaNumber(idx + 1)}
                      </span>
                      <span>{stepMsg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guided Flow Actions */}
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
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/55 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-pink-600 dark:text-pink-400" />
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
