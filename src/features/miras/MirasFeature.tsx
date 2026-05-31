import { useState, useEffect } from 'react';
import { calculateMiras, type MirasInputs } from '../../engines/mirasEngine';
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
  Users, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, 
  HelpCircle, Save, RefreshCw, PieChart as PieIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

interface MirasFeatureProps {
  onSaveHistory: (summary: string, inputs: any, result: any) => void;
  initialState?: { inputs: any; result: any };
}

export function MirasFeature({ onSaveHistory, initialState }: MirasFeatureProps) {
  // Steps: 1: Pre-requisites, 2: Family Setup, 3: Results
  const [step, setStep] = useState(1);

  // Pre-requisites checklist states
  const [isBurialPaid, setIsBurialPaid] = useState(false);
  const [isDebtsPaid, setIsDebtsPaid] = useState(false);
  const [isWillsFulfilled, setIsWillsFulfilled] = useState(false);

  // Miras Inputs
  const [totalEstate, setTotalEstate] = useState(1000000); // ৳ ১০,০০,০০০ default
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [spousesCount, setSpousesCount] = useState(1); // 1 wife/husband
  const [hasFather, setHasFather] = useState(false);
  const [hasMother, setHasMother] = useState(false);
  const [sonsCount, setSonsCount] = useState(0);
  const [daughtersCount, setDaughtersCount] = useState(0);
  const [brothersCount, setBrothersCount] = useState(0);
  const [sistersCount, setSistersCount] = useState(0);

  // Extra assets states
  const [landAsset, setLandAsset] = useState<number>(0);
  const [landUnit, setLandUnit] = useState<'decimal' | 'katha' | 'bigha'>('decimal');
  const [goldAsset, setGoldAsset] = useState<number>(0);
  const [goldUnit, setGoldUnit] = useState<'vori' | 'gram'>('vori');
  const [silverAsset, setSilverAsset] = useState<number>(0);
  const [silverUnit, setSilverUnit] = useState<'vori' | 'gram'>('vori');
  const [apartmentAsset, setApartmentAsset] = useState<number>(0);
  const [apartmentUnit, setApartmentUnit] = useState<'flat' | 'room' | 'sqft'>('flat');

  // Combined Inputs
  const [inputs, setInputs] = useState<MirasInputs>({
    totalEstateValue: totalEstate,
    husband: 0,
    wife: 1,
    father: false,
    mother: false,
    sons: 0,
    daughters: 0,
    brothers: 0,
    sisters: 0
  });

  // Calculate results
  const [result, setResult] = useState(() => calculateMiras(inputs));

  // Sync inputs when specific form elements change
  useEffect(() => {
    setInputs({
      totalEstateValue: totalEstate,
      husband: deceasedGender === 'female' ? Math.min(1, spousesCount) : 0,
      wife: deceasedGender === 'male' ? Math.min(4, spousesCount) : 0,
      father: hasFather,
      mother: hasMother,
      sons: sonsCount,
      daughters: daughtersCount,
      brothers: brothersCount,
      sisters: sistersCount,
      // Extra assets included in saved inputs
      landAsset,
      landUnit,
      goldAsset,
      goldUnit,
      silverAsset,
      silverUnit,
      apartmentAsset,
      apartmentUnit
    } as any);
  }, [
    totalEstate, deceasedGender, spousesCount, 
    hasFather, hasMother, sonsCount, daughtersCount, 
    brothersCount, sistersCount,
    landAsset, landUnit, goldAsset, goldUnit, silverAsset, silverUnit, apartmentAsset, apartmentUnit
  ]);

  // Recalculate results when inputs change
  useEffect(() => {
    setResult(calculateMiras(inputs));
  }, [inputs]);

  // Load from history if provided
  useEffect(() => {
    if (initialState) {
      const { 
        totalEstateValue, husband, wife, father, mother, sons, daughters, brothers, sisters,
        landAsset: savedLandAsset, landUnit: savedLandUnit, 
        goldAsset: savedGoldAsset, goldUnit: savedGoldUnit, 
        silverAsset: savedSilverAsset, silverUnit: savedSilverUnit, 
        apartmentAsset: savedApartmentAsset, apartmentUnit: savedApartmentUnit 
      } = initialState.inputs;
      setTotalEstate(totalEstateValue);
      setDeceasedGender(husband > 0 ? 'female' : 'male');
      setSpousesCount(husband > 0 ? husband : wife);
      setHasFather(father);
      setHasMother(mother);
      setSonsCount(sons);
      setDaughtersCount(daughters);
      setBrothersCount(brothers);
      setSistersCount(sisters);
      
      // Load extra assets if they exist
      if (savedLandAsset !== undefined) setLandAsset(savedLandAsset);
      if (savedLandUnit !== undefined) setLandUnit(savedLandUnit);
      if (savedGoldAsset !== undefined) setGoldAsset(savedGoldAsset);
      if (savedGoldUnit !== undefined) setGoldUnit(savedGoldUnit);
      if (savedSilverAsset !== undefined) setSilverAsset(savedSilverAsset);
      if (savedSilverUnit !== undefined) setSilverUnit(savedSilverUnit);
      if (savedApartmentAsset !== undefined) setApartmentAsset(savedApartmentAsset);
      if (savedApartmentUnit !== undefined) setApartmentUnit(savedApartmentUnit);
      
      setStep(3); // skip straight to results
    }
  }, [initialState]);

  const handleSaveToHistory = () => {
    const activeHeirs = result.heirs.filter(h => h.status === 'active').length;
    const summary = `উত্তরাধিকার বণ্টন: মোট সম্পত্তি ${formatBanglaCurrency(result.totalEstateValue)} (${convertToBanglaNumber(activeHeirs)} জন অংশীদার)`;
    onSaveHistory(summary, inputs, result);
    alert('বণ্টন হিসেবটি ইতিহাসে সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const resetAll = () => {
    setStep(1);
    setIsBurialPaid(false);
    setIsDebtsPaid(false);
    setIsWillsFulfilled(false);
    setTotalEstate(1000000);
    setDeceasedGender('male');
    setSpousesCount(1);
    setHasFather(false);
    setHasMother(false);
    setSonsCount(0);
    setDaughtersCount(0);
    setBrothersCount(0);
    setSistersCount(0);
    
    // Reset extra assets states
    setLandAsset(0);
    setLandUnit('decimal');
    setGoldAsset(0);
    setGoldUnit('vori');
    setSilverAsset(0);
    setSilverUnit('vori');
    setApartmentAsset(0);
    setApartmentUnit('flat');
  };

  // Pie chart colors (Premium harmonious HSL theme)
  const COLORS = ['#0f766e', '#d97706', '#0284c7', '#4f46e5', '#7c3aed', '#db2777', '#2563eb', '#059669'];

  const chartData = result.heirs
    .filter(h => h.status === 'active' && h.sharePercent > 0)
    .map(h => ({
      name: h.relationship,
      value: h.sharePercent,
      amount: h.amount
    }));

  // Clipboard copy formatting
  const activeHeirsList = result.heirs
    .filter(h => h.status === 'active')
    .map(h => {
      let extraText = '';
      if (landAsset > 0) {
        const unitName = landUnit === 'decimal' ? 'শতক' : landUnit === 'katha' ? 'কাঠা' : 'বিঘা';
        extraText += `, জমি: ${(landAsset * h.sharePercent / 100).toFixed(2)} ${unitName}`;
      }
      if (goldAsset > 0) {
        const unitName = goldUnit === 'vori' ? 'ভরি' : 'গ্রাম';
        extraText += `, স্বর্ণ: ${(goldAsset * h.sharePercent / 100).toFixed(2)} ${unitName}`;
      }
      if (silverAsset > 0) {
        const unitName = silverUnit === 'vori' ? 'ভরি' : 'গ্রাম';
        extraText += `, রৌপ্য: ${(silverAsset * h.sharePercent / 100).toFixed(2)} ${unitName}`;
      }
      if (apartmentAsset > 0) {
        const unitName = apartmentUnit === 'flat' ? 'ফ্ল্যাট' : apartmentUnit === 'room' ? 'রুম' : 'বর্গফুট';
        extraText += `, ফ্ল্যাট/ঘর: ${(apartmentAsset * h.sharePercent / 100).toFixed(1)} ${unitName}`;
      }
      return `- ${h.relationship}: ${formatBanglaPercent(h.sharePercent)} (${formatBanglaCurrency(h.amount)}${extraText} - অংশ: ${h.shareFraction})`;
    })
    .join('\n');

  const excludedHeirsList = result.heirs
    .filter(h => h.status === 'excluded')
    .map(h => `- ${h.relationship}: বঞ্চিত (${h.exclusionReason})`)
    .join('\n');

  let estateSummaryText = `মোট বণ্টনযোগ্য নগদ সম্পত্তি: ${formatBanglaCurrency(result.totalEstateValue)}`;
  if (landAsset > 0) estateSummaryText += `\nমোট বণ্টনযোগ্য জমি: ${landAsset} ${landUnit === 'decimal' ? 'শতক' : landUnit === 'katha' ? 'কাঠা' : 'বিঘা'}`;
  if (goldAsset > 0) estateSummaryText += `\nমোট বণ্টনযোগ্য স্বর্ণ: ${goldAsset} ${goldUnit === 'vori' ? 'ভরি' : 'গ্রাম'}`;
  if (silverAsset > 0) estateSummaryText += `\nমোট বণ্টনযোগ্য রৌপ্য: ${silverAsset} ${silverUnit === 'vori' ? 'ভরি' : 'গ্রাম'}`;
  if (apartmentAsset > 0) estateSummaryText += `\nমোট বণ্টনযোগ্য ফ্ল্যাট/ঘর: ${apartmentAsset} ${apartmentUnit === 'flat' ? 'ফ্ল্যাট' : apartmentUnit === 'room' ? 'রুম' : 'বর্গফুট'}`;

  const copyText = `দ্বীনি হিসাব — মীরাস (উত্তরাধিকার) বণ্টন রিপোর্ট
    তারিখ: ${new Date().toLocaleDateString('bn-BD')}
------------------------------------------
${estateSummaryText}
------------------------------------------
অংশীদারদের তালিকা ও প্রাপ্য অংশ:
${activeHeirsList}

${result.heirs.some(h => h.status === 'excluded') ? `বঞ্চিত ওয়ারিশদের তালিকা:\n${excludedHeirsList}` : ''}
------------------------------------------
হিসাবটি www.dinihisab.com প্ল্যাটফর্ম থেকে প্রস্তুতকৃত।`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto print-container">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">মীরাস (উত্তরাধিকার) বণ্টন ক্যালকুলেটর</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">ইসলামী শরিয়াহ ফিকহ অনুযায়ী ওয়ারিশদের মাঝে মৃত ব্যক্তির সম্পদ বণ্টন</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-300 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          নতুন বণ্টন শুরু
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto no-print">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Pre-Requisites Checklist */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">ধাপ ১: বণ্টন পূর্ব-শর্ত</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">সম্পত্তি বণ্টনের পূর্ববর্তী বাধ্যবাধকতা যাচাই</h3>
              <p className="text-xs sm:text-sm text-gray-500">ইসলামী বিধান অনুসারে মৃত ব্যক্তির পরিত্যক্ত সম্পত্তি বণ্টনের পূর্বে ৩টি ক্রমানুসারী দায় মেটানো ফরজ। এগুলো সম্পন্ন করেছেন কি?</p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Check 1 */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-darkBg-light/20 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={isBurialPaid}
                  onChange={(e) => setIsBurialPaid(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-siliguri">১. দাফন-কাফনের যৌক্তিক খরচ সম্পন্ন হয়েছে?</h4>
                  <p className="text-xs text-gray-400 mt-0.5">মৃত ব্যক্তির কাফন, দাফন এবং সৎকারের স্বাভাবিক ও পরিমিত খরচ তার মোট সম্পত্তি থেকে মেটানো আবশ্যক।</p>
                </div>
              </label>

              {/* Check 2 */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-darkBg-light/20 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={isDebtsPaid}
                  onChange={(e) => setIsDebtsPaid(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-siliguri">২. মৃত ব্যক্তির বকেয়া ঋণ ও মোহরানা মেটানো হয়েছে?</h4>
                  <p className="text-xs text-gray-400 mt-0.5">মানুষের যেকোনো পাওনা বা কর্জ এবং স্ত্রীর অপরিশোধিত মোহরানা সম্পূর্ণরূপে শোধ করা বণ্টন পূর্ববর্তী দায়িত্ব।</p>
                </div>
              </label>

              {/* Check 3 */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-darkBg-light/20 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={isWillsFulfilled}
                  onChange={(e) => setIsWillsFulfilled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-siliguri">৩. বৈধ ওসিয়ত (অনধিক ১/৩ অংশ) পূরণ করা হয়েছে?</h4>
                  <p className="text-xs text-gray-400 mt-0.5">মৃত ব্যক্তি যদি সুস্থ অবস্থায় কোনো ওসিয়ত করে থাকেন যা মোট সম্পত্তির তিন ভাগের এক ভাগের বেশি নয়, তবে তা পূরণ করতে হবে।</p>
                </div>
              </label>
            </div>

            {/* Note alert */}
            <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 font-siliguri leading-relaxed flex gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>উপরোক্ত খরচের দায় মেটানোর পর <strong>অবশিষ্ট নিট সম্পত্তিই</strong> কেবল ওয়ারিশদের মাঝে শরিয়াহ মোতাবেক বণ্টন হবে। ওসিয়ত পূরণ ও ঋণ শোধ না করে মীরাস বণ্টন অবৈধ।</span>
            </div>

            {/* Navigation Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800/60 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                পরবর্তী ধাপে যান
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Family Setup Wizard */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-darkBg-light/30 p-6 sm:p-8 space-y-6 shadow-sm no-print"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">ধাপ ২: তথ্য প্রদান</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white font-siliguri">মৃত ব্যক্তির মোট সম্পত্তি ও জীবিত আত্মীয়দের তথ্য</h3>
              <p className="text-xs text-gray-500">দাফন, ঋণ ও ওসিয়ত মেটানোর পর অবশিষ্ট নিট বণ্টনযোগ্য টাকার পরিমাণ ও জীবিত ওয়ারিশদের সিলেক্ট করুন:</p>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Estate Input */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">বণ্টনযোগ্য নিট সম্পত্তি (টাকায়)</label>
                <NumericInput
                  placeholder="৳ ১০,০০,০০০"
                  value={totalEstate}
                  onChange={(val) => setTotalEstate(val)}
                  className="focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Extra Assets Section (Immovable / Other Assets) */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-darkBg-light/10 space-y-4">
                <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 font-siliguri border-b border-gray-250 dark:border-gray-800/80 pb-2">
                  স্থাবর-অস্থাবর অন্যান্য সম্পদ বণ্টন (ঐচ্ছিক)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Land */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">জমির পরিমাণ (Land)</span>
                    <div className="flex gap-2">
                      <NumericInput
                        placeholder="জমির পরিমাণ"
                        value={landAsset}
                        onChange={(val) => setLandAsset(val)}
                        className="flex-1 text-xs"
                      />
                      <select
                        value={landUnit}
                        onChange={(e) => setLandUnit(e.target.value as any)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light text-xs font-siliguri"
                      >
                        <option value="decimal">শতক / ডেসিমল</option>
                        <option value="katha">কাঠা</option>
                        <option value="bigha">বিঘা</option>
                      </select>
                    </div>
                  </div>

                  {/* Gold */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">স্বর্ণের পরিমাণ (Gold)</span>
                    <div className="flex gap-2">
                      <NumericInput
                        placeholder="স্বর্ণের পরিমাণ"
                        value={goldAsset}
                        onChange={(val) => setGoldAsset(val)}
                        className="flex-1 text-xs"
                      />
                      <select
                        value={goldUnit}
                        onChange={(e) => setGoldUnit(e.target.value as any)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light text-xs font-siliguri"
                      >
                        <option value="vori">ভরি / তোলা</option>
                        <option value="gram">গ্রাম</option>
                      </select>
                    </div>
                  </div>

                  {/* Silver */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">রৌপ্যের পরিমাণ (Silver)</span>
                    <div className="flex gap-2">
                      <NumericInput
                        placeholder="রৌপ্যের পরিমাণ"
                        value={silverAsset}
                        onChange={(val) => setSilverAsset(val)}
                        className="flex-1 text-xs"
                      />
                      <select
                        value={silverUnit}
                        onChange={(e) => setSilverUnit(e.target.value as any)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light text-xs font-siliguri"
                      >
                        <option value="vori">ভরি / তোলা</option>
                        <option value="gram">গ্রাম</option>
                      </select>
                    </div>
                  </div>

                  {/* Apartment / Rooms */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 font-siliguri">ফ্ল্যাট / রুম / ঘর (Apartment)</span>
                    <div className="flex gap-2">
                      <NumericInput
                        placeholder="সংখ্যা / আয়তন"
                        value={apartmentAsset}
                        onChange={(val) => setApartmentAsset(val)}
                        className="flex-1 text-xs"
                      />
                      <select
                        value={apartmentUnit}
                        onChange={(e) => setApartmentUnit(e.target.value as any)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light text-xs font-siliguri"
                      >
                        <option value="flat">ফ্ল্যাট</option>
                        <option value="room">রুম / ঘর</option>
                        <option value="sqft">বর্গফুট (Sq Ft)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-800" />

              {/* Deceased Spouse Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">মৃত ব্যক্তি পুরুষ নাকি নারী ছিলেন?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setDeceasedGender('male');
                        setSpousesCount(1); // Default 1 wife
                      }}
                      className={`py-2 rounded-xl border font-bold text-xs sm:text-sm transition-all ${
                        deceasedGender === 'male'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-355 border-blue-500'
                          : 'border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      পুরুষ (স্ত্রী জীবিত আছে)
                    </button>
                    <button
                      onClick={() => {
                        setDeceasedGender('female');
                        setSpousesCount(1); // 1 husband
                      }}
                      className={`py-2 rounded-xl border font-bold text-xs sm:text-sm transition-all ${
                        deceasedGender === 'female'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-355 border-blue-500'
                          : 'border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      নারী (স্বামী জীবিত আছে)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">
                    {deceasedGender === 'male' ? 'জীবিত স্ত্রীর সংখ্যা' : 'জীবিত স্বামীর সংখ্যা'}
                  </label>
                  {deceasedGender === 'male' ? (
                    <select
                      value={spousesCount}
                      onChange={(e) => setSpousesCount(parseInt(e.target.value) || 0)}
                      className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-blue-500 text-sm transition-all font-siliguri font-bold text-gray-850 dark:text-white"
                    >
                      <option value={0}>কোনো স্ত্রী জীবিত নেই</option>
                      <option value={1}>১ জন স্ত্রী জীবিত</option>
                      <option value={2}>২ জন স্ত্রী জীবিত</option>
                      <option value={3}>৩ জন স্ত্রী জীবিত</option>
                      <option value={4}>৪ জন স্ত্রী জীবিত</option>
                    </select>
                  ) : (
                    <select
                      value={spousesCount}
                      onChange={(e) => setSpousesCount(parseInt(e.target.value) || 0)}
                      className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-blue-500 text-sm transition-all font-siliguri font-bold text-gray-850 dark:text-white"
                    >
                      <option value={0}>স্বামী জীবিত নেই</option>
                      <option value={1}>১ জন স্বামী জীবিত</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Parents Alive options */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-darkBg-light/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFather}
                    onChange={(e) => setHasFather(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">মৃতের পিতা জীবিত আছেন?</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-darkBg-light/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMother}
                    onChange={(e) => setHasMother(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">মৃতের মাতা জীবিত আছেন?</span>
                </label>
              </div>

              {/* Children Count Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 font-siliguri">জীবিত পুত্রের সংখ্যা</label>
                  <NumericInput
                    placeholder="০"
                    value={sonsCount}
                    onChange={(val) => setSonsCount(val)}
                    showButtons={true}
                    min={0}
                    className="focus:ring-blue-500 text-sm py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 font-siliguri">জীবিত কন্যার সংখ্যা</label>
                  <NumericInput
                    placeholder="০"
                    value={daughtersCount}
                    onChange={(val) => setDaughtersCount(val)}
                    showButtons={true}
                    min={0}
                    className="focus:ring-blue-500 text-sm py-2"
                  />
                </div>
              </div>

              {/* Siblings Count (Only shows when father/sons are 0) */}
              <div className={`p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 space-y-3 transition-all ${
                hasFather || sonsCount > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'
              }`}>
                <h4 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-siliguri">
                  ভাই-বোন (শুধুমাত্র পিতা বা পুত্র জীবিত না থাকলে অংশ পেতে পারেন)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 font-siliguri">সহোদর ভাইয়ের সংখ্যা</label>
                    <NumericInput
                      placeholder="০"
                      disabled={hasFather || sonsCount > 0}
                      value={hasFather || sonsCount > 0 ? 0 : brothersCount}
                      onChange={(val) => setBrothersCount(val)}
                      showButtons={true}
                      min={0}
                      className="focus:ring-blue-500 text-sm py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 font-siliguri">সহোদর বোনের সংখ্যা</label>
                    <NumericInput
                      placeholder="০"
                      disabled={hasFather || sonsCount > 0}
                      value={hasFather || sonsCount > 0 ? 0 : sistersCount}
                      onChange={(val) => setSistersCount(val)}
                      showButtons={true}
                      min={0}
                      className="focus:ring-blue-500 text-sm py-2"
                    />
                  </div>
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
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md transition-all font-siliguri"
              >
                বণ্টন ফলাফল দেখুন
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Distribution Results */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            
            {/* 3a. Summary Title */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-700 text-white text-center space-y-2 shadow-md">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-siliguri">
                উত্তরাধিকার সম্পত্তি সমবণ্টন রিপোর্ট
              </span>
              <p className="text-xs sm:text-sm opacity-75 font-siliguri">বণ্টনযোগ্য মোট নিট সম্পদ</p>
              <h3 className="text-3xl sm:text-5xl font-black font-siliguri text-gold-500 tracking-tight">
                {formatBanglaCurrency(result.totalEstateValue)}
              </h3>
              {/* Extra Assets Summary Display */}
              {(landAsset > 0 || goldAsset > 0 || silverAsset > 0 || apartmentAsset > 0) && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs opacity-90 font-siliguri mt-2 border-t border-white/10 pt-2">
                  {landAsset > 0 && <span>জমি: {convertToBanglaNumber(landAsset)} {landUnit === 'decimal' ? 'শতক' : landUnit === 'katha' ? 'কাঠা' : 'বিঘা'}</span>}
                  {goldAsset > 0 && <span>স্বর্ণ: {convertToBanglaNumber(goldAsset)} {goldUnit === 'vori' ? 'ভরি' : 'গ্রাম'}</span>}
                  {silverAsset > 0 && <span>রৌপ্য: {convertToBanglaNumber(silverAsset)} {silverUnit === 'vori' ? 'ভরি' : 'গ্রাম'}</span>}
                  {apartmentAsset > 0 && <span>ফ্ল্যাট/ঘর: {convertToBanglaNumber(apartmentAsset)} {apartmentUnit === 'flat' ? 'ফ্ল্যাট' : apartmentUnit === 'room' ? 'রুম' : 'বর্গফুট'}</span>}
                </div>
              )}
              <div className="flex justify-center gap-4 text-xs font-siliguri opacity-80 pt-2">
                {result.hasAul && <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">আউল (সংশোধিত অংশ)</span>}
                {result.hasRadd && <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">রদ (উদ্বৃত্ত ফেরত বণ্টন)</span>}
              </div>
            </div>

            {/* 3b. Pie Chart Visualisation (The main visual highlight) */}
            {chartData.length > 0 && (
              <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-white dark:bg-darkBg-light/30 shadow-sm space-y-4 no-print">
                <h4 className="text-base font-bold text-gray-900 dark:text-white font-siliguri flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  উত্তরাধিকার সম্পত্তি বণ্টনের পাই-চিত্র (Pie Chart)
                </h4>
                <div className="h-72 w-full flex flex-col md:flex-row items-center justify-around gap-4 pt-2">
                  <div className="h-64 w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${formatBanglaPercent(Number(value))} (${formatBanglaCurrency(Number(props.payload.amount))})`,
                            name
                          ]}
                          contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend Box */}
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5 text-xs font-siliguri w-full md:w-1/2">
                    {chartData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-bold text-gray-800 dark:text-gray-200">{entry.name}:</span>
                        <span className="text-gray-500 dark:text-gray-400">{formatBanglaPercent(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3c. Heirs List Table */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-6">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri border-b border-gray-100 dark:border-gray-800 pb-3">
                ওয়ারিশদের প্রাপ্য অংশের বিস্তারিত তালিকা
              </h4>
              
              <div className="space-y-4">
                {result.heirs.map((heir, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                      heir.status === 'active'
                        ? 'border-gray-200 dark:border-gray-800 bg-gray-50/45 dark:bg-darkBg-light/20'
                        : 'border-red-500/10 bg-red-50/10 dark:bg-red-950/5 opacity-65'
                    }`}
                  >
                    <div>
                      {/* Name & status badge */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white font-siliguri">
                          {heir.relationship}
                        </span>
                        {heir.status === 'active' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-siliguri">
                            অংশীদার
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-siliguri">
                            বঞ্চিত (মাহজুব)
                          </span>
                        )}
                      </div>
                      
                      {/* Fraction Description */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-siliguri leading-relaxed">
                        {heir.status === 'active' ? `ইসলামী অনুপাত: ${heir.shareFraction}` : `বঞ্চনার কারণ: ${heir.exclusionReason}`}
                      </p>
                    </div>

                    {/* Percentage and monetary value */}
                    {heir.status === 'active' && (
                      <div className="sm:text-right font-siliguri">
                        <p className="text-base sm:text-lg font-black text-blue-700 dark:text-blue-400 leading-none">
                          {formatBanglaCurrency(heir.amount)}
                        </p>
                        {/* Extra Assets Breakdown */}
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 space-y-0.5 sm:text-right">
                          {landAsset > 0 && (
                            <p>জমি: <span className="font-bold text-gray-755 dark:text-gray-300">{convertToBanglaNumber(Number((landAsset * heir.sharePercent / 100).toFixed(3)))}</span> {landUnit === 'decimal' ? 'শতক' : landUnit === 'katha' ? 'কাঠা' : 'বিঘা'}</p>
                          )}
                          {goldAsset > 0 && (
                            <p>স্বর্ণ: <span className="font-bold text-gray-755 dark:text-gray-300">{convertToBanglaNumber(Number((goldAsset * heir.sharePercent / 100).toFixed(3)))}</span> {goldUnit === 'vori' ? 'ভরি' : 'গ্রাম'}</p>
                          )}
                          {silverAsset > 0 && (
                            <p>রৌপ্য: <span className="font-bold text-gray-755 dark:text-gray-300">{convertToBanglaNumber(Number((silverAsset * heir.sharePercent / 100).toFixed(3)))}</span> {silverUnit === 'vori' ? 'ভরি' : 'গ্রাম'}</p>
                          )}
                          {apartmentAsset > 0 && (
                            <p>ফ্ল্যাট/ঘর: <span className="font-bold text-gray-755 dark:text-gray-300">{convertToBanglaNumber(Number((apartmentAsset * heir.sharePercent / 100).toFixed(2)))}</span> {apartmentUnit === 'flat' ? 'ফ্ল্যাট' : apartmentUnit === 'room' ? 'রুম' : 'বর্গফুট'}</p>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 leading-none">
                          শতকরা হার: {formatBanglaPercent(heir.sharePercent)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3d. Islamic Scripture & Notes */}
            <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-blue-50/15 dark:bg-blue-950/5 space-y-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-bold font-siliguri">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>মীরাস বণ্টনের শরয়ী ভিত্তি ও তথ্যসূত্র</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-siliguri">
                কুরআনে বর্ণিত সুনির্দিষ্ট অংশীদারদের প্রাপ্য বণ্টনের পর অবশিষ্টাংশ মূলত আসাবাগণ (যেমন পুত্র বা পিতা) পেয়ে থাকেন। বণ্টনে আউল এবং রদের হিসাব হানাফি ফিকহের মূলনীতি অনুযায়ী গাণিতিক শুদ্ধতার সাথে করা হয়েছে।
              </p>
              <div className="p-3 bg-white dark:bg-darkBg-dark border-l-4 border-gold-600 rounded-r-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri italic">
                {rules.references.miras}
              </div>
            </div>

            {/* 3e. Guided Flow Actions (Save, Copy, PDF, Go Back) */}
            <div className="pt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-darkBg-dark transition-all flex items-center gap-1.5 text-xs sm:text-sm font-siliguri mr-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                তালিকায় সংশোধন
              </button>
              
              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 text-gray-700 dark:bg-darkBg-light/50 dark:hover:bg-darkBg-dark dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Save className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                বণ্টন হিসেব সংরক্ষণ
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
