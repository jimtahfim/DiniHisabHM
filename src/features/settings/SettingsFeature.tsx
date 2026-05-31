import { useState } from 'react';
import { useSettings, type GoldRates, type SilverRates, type FitraRates } from '../../hooks/useSettings';
import { convertToBanglaNumber, parseBanglaOrEnglishNumber, formatBanglaCurrency } from '../../utils/banglaNumber';
import { Settings, Save, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react';

interface SettingsFeatureProps {
  onBackToDashboard: () => void;
  settingsHook: ReturnType<typeof useSettings>;
}

export function SettingsFeature({ onBackToDashboard, settingsHook }: SettingsFeatureProps) {
  const {
    settings,
    updateGoldRate,
    updateSilverRate,
    updateFitraRate,
    setSelectedGoldCarat,
    setSelectedSilverCarat,
    resetToDefaults
  } = settingsHook;

  // Local temporary states for input editing (default to Vori input as it is the standard in Bangladesh)
  const [priceUnit, setPriceUnit] = useState<'vori' | 'gram'>('vori');

  // Holds parsed numeric values for calculations
  const [goldInputs, setGoldInputs] = useState<GoldRates>(() => {
    const rates = { ...settings.goldRates };
    Object.keys(rates).forEach(k => {
      rates[k as keyof GoldRates] = Math.round(rates[k as keyof GoldRates] * 11.664);
    });
    return rates;
  });

  const [silverInputs, setSilverInputs] = useState<SilverRates>(() => {
    const rates = { ...settings.silverRates };
    Object.keys(rates).forEach(k => {
      rates[k as keyof SilverRates] = Math.round(rates[k as keyof SilverRates] * 11.664);
    });
    return rates;
  });

  const [fitraInputs, setFitraInputs] = useState<FitraRates>(() => ({ ...settings.fitraRates }));

  // Holds display string values containing Bangla digits for typing
  const [goldInputStrings, setGoldInputStrings] = useState<Record<keyof GoldRates, string>>(() => {
    const initial: any = {};
    Object.keys(settings.goldRates).forEach(k => {
      const voriPrice = Math.round(settings.goldRates[k as keyof GoldRates] * 11.664);
      initial[k] = convertToBanglaNumber(voriPrice);
    });
    return initial;
  });

  const [silverInputStrings, setSilverInputStrings] = useState<Record<keyof SilverRates, string>>(() => {
    const initial: any = {};
    Object.keys(settings.silverRates).forEach(k => {
      const voriPrice = Math.round(settings.silverRates[k as keyof SilverRates] * 11.664);
      initial[k] = convertToBanglaNumber(voriPrice);
    });
    return initial;
  });

  const [fitraInputStrings, setFitraInputStrings] = useState<Record<keyof FitraRates, string>>(() => {
    const initial: any = {};
    Object.keys(settings.fitraRates).forEach(k => {
      initial[k] = convertToBanglaNumber(settings.fitraRates[k as keyof FitraRates]);
    });
    return initial;
  });

  // Handle switching units (with automatic conversion of numbers and strings on the fly!)
  const handleUnitChange = (newUnit: 'vori' | 'gram') => {
    if (newUnit === priceUnit) return;
    setPriceUnit(newUnit);

    let nextGold: GoldRates;
    let nextSilver: SilverRates;

    if (newUnit === 'vori') {
      nextGold = {
        '24k': Math.round(goldInputs['24k'] * 11.664),
        '22k': Math.round(goldInputs['22k'] * 11.664),
        '21k': Math.round(goldInputs['21k'] * 11.664),
        '18k': Math.round(goldInputs['18k'] * 11.664),
        'traditional': Math.round(goldInputs['traditional'] * 11.664)
      };
      nextSilver = {
        '22k': Math.round(silverInputs['22k'] * 11.664),
        '21k': Math.round(silverInputs['21k'] * 11.664),
        '18k': Math.round(silverInputs['18k'] * 11.664),
        'traditional': Math.round(silverInputs['traditional'] * 11.664)
      };
    } else {
      nextGold = {
        '24k': Math.round(goldInputs['24k'] / 11.664),
        '22k': Math.round(goldInputs['22k'] / 11.664),
        '21k': Math.round(goldInputs['21k'] / 11.664),
        '18k': Math.round(goldInputs['18k'] / 11.664),
        'traditional': Math.round(goldInputs['traditional'] / 11.664)
      };
      nextSilver = {
        '22k': Math.round(silverInputs['22k'] / 11.664),
        '21k': Math.round(silverInputs['21k'] / 11.664),
        '18k': Math.round(silverInputs['18k'] / 11.664),
        'traditional': Math.round(silverInputs['traditional'] / 11.664)
      };
    }

    setGoldInputs(nextGold);
    setSilverInputs(nextSilver);

    // Sync input string states with Bangla digits
    setGoldInputStrings({
      '24k': convertToBanglaNumber(nextGold['24k']),
      '22k': convertToBanglaNumber(nextGold['22k']),
      '21k': convertToBanglaNumber(nextGold['21k']),
      '18k': convertToBanglaNumber(nextGold['18k']),
      'traditional': convertToBanglaNumber(nextGold['traditional'])
    });
    setSilverInputStrings({
      '22k': convertToBanglaNumber(nextSilver['22k']),
      '21k': convertToBanglaNumber(nextSilver['21k']),
      '18k': convertToBanglaNumber(nextSilver['18k']),
      'traditional': convertToBanglaNumber(nextSilver['traditional'])
    });
  };

  // Convert typed English digits to Bangla in real-time, filter invalid characters, and sync states
  const handleGoldPriceChangeRaw = (carat: keyof GoldRates, rawValue: string) => {
    const enToBdMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    const banglaOnly = rawValue
      .replace(/[0-9]/g, (digit) => enToBdMap[digit])
      .replace(/[^০-৯.]/g, '');

    setGoldInputStrings(prev => ({ ...prev, [carat]: banglaOnly }));

    const numVal = parseBanglaOrEnglishNumber(banglaOnly);
    setGoldInputs(prev => ({ ...prev, [carat]: numVal }));
  };

  const handleSilverPriceChangeRaw = (carat: keyof SilverRates, rawValue: string) => {
    const enToBdMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    const banglaOnly = rawValue
      .replace(/[0-9]/g, (digit) => enToBdMap[digit])
      .replace(/[^০-৯.]/g, '');

    setSilverInputStrings(prev => ({ ...prev, [carat]: banglaOnly }));

    const numVal = parseBanglaOrEnglishNumber(banglaOnly);
    setSilverInputs(prev => ({ ...prev, [carat]: numVal }));
  };

  const handleFitraPriceChangeRaw = (id: keyof FitraRates, rawValue: string) => {
    const enToBdMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    const banglaOnly = rawValue
      .replace(/[0-9]/g, (digit) => enToBdMap[digit])
      .replace(/[^০-৯]/g, '');

    setFitraInputStrings(prev => ({ ...prev, [id]: banglaOnly }));

    const numVal = parseBanglaOrEnglishNumber(banglaOnly) || 0;
    setFitraInputs(prev => ({ ...prev, [id]: numVal }));
  };

  const handleSaveAll = () => {
    // Sync local rates back to gram standard in settings hook
    Object.entries(goldInputs).forEach(([carat, price]) => {
      const pricePerGram = priceUnit === 'vori' ? price / 11.664 : price;
      updateGoldRate(carat as keyof GoldRates, Math.round(pricePerGram));
    });
    Object.entries(silverInputs).forEach(([carat, price]) => {
      const pricePerGram = priceUnit === 'vori' ? price / 11.664 : price;
      updateSilverRate(carat as keyof SilverRates, Math.round(pricePerGram));
    });
    Object.entries(fitraInputs).forEach(([id, price]) => {
      updateFitraRate(id as keyof FitraRates, price);
    });

    alert('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const handleResetDefaults = () => {
    if (confirm('আপনি কি সত্যিই সোনা, রূপা ও ফিতরার মূল্য স্ট্যান্ডার্ড বাজারদরে রিসেট করতে চান?')) {
      resetToDefaults();
      
      let nextGold: GoldRates;
      let nextSilver: SilverRates;

      if (priceUnit === 'gram') {
        nextGold = {
          '24k': 11500,
          '22k': 10500,
          '21k': 10020,
          '18k': 8590,
          'traditional': 7150
        };
        nextSilver = {
          '22k': 160,
          '21k': 153,
          '18k': 131,
          'traditional': 100
        };
      } else {
        nextGold = {
          '24k': Math.round(11500 * 11.664),
          '22k': Math.round(10500 * 11.664),
          '21k': Math.round(10020 * 11.664),
          '18k': Math.round(8590 * 11.664),
          'traditional': Math.round(7150 * 11.664)
        };
        nextSilver = {
          '22k': Math.round(160 * 11.664),
          '21k': Math.round(153 * 11.664),
          '18k': Math.round(131 * 11.664),
          'traditional': Math.round(100 * 11.664)
        };
      }

      setGoldInputs(nextGold);
      setSilverInputs(nextSilver);

      const nextFitra = {
        wheat: 115,
        barley: 400,
        date: 2000,
        raisin: 1800,
        cheese: 2800
      };
      setFitraInputs(nextFitra);
      
      setGoldInputStrings({
        '24k': convertToBanglaNumber(nextGold['24k']),
        '22k': convertToBanglaNumber(nextGold['22k']),
        '21k': convertToBanglaNumber(nextGold['21k']),
        '18k': convertToBanglaNumber(nextGold['18k']),
        'traditional': convertToBanglaNumber(nextGold['traditional'])
      });
      setSilverInputStrings({
        '22k': convertToBanglaNumber(nextSilver['22k']),
        '21k': convertToBanglaNumber(nextSilver['21k']),
        '18k': convertToBanglaNumber(nextSilver['18k']),
        'traditional': convertToBanglaNumber(nextSilver['traditional'])
      });
      setFitraInputStrings({
        wheat: convertToBanglaNumber(nextFitra.wheat),
        barley: convertToBanglaNumber(nextFitra.barley),
        date: convertToBanglaNumber(nextFitra.date),
        raisin: convertToBanglaNumber(nextFitra.raisin),
        cheese: convertToBanglaNumber(nextFitra.cheese)
      });
    }
  };

  // Helper text display opposite of chosen input unit
  const renderOppositePreview = (price: number) => {
    if (priceUnit === 'vori') {
      const pricePerGram = Math.round(price / 11.664);
      return `গ্রাম: ${formatBanglaCurrency(pricePerGram)}`;
    } else {
      const pricePerVori = Math.round(price * 11.664);
      return `ভরি: ${formatBanglaCurrency(pricePerVori)}`;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
            <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-siliguri">বাজার দর সেটিংস ও কাস্টমাইজেশন</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri">সোনার ও রূপার ক্যারেট অনুযায়ী মূল্য পরিবর্তন করুন</p>
          </div>
        </div>
        <button
          onClick={onBackToDashboard}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 transition-colors font-siliguri"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ড্যাশবোর্ডে ফিরুন
        </button>
      </div>

      {/* Dynamic Unit Switcher Toggle Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/35 shadow-sm">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 font-siliguri">দাম লেখার একক নির্বাচন করুন</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-siliguri mt-0.5">আপনি সোনা ও রুপার বাজার দর ভরি হিসেবে নাকি গ্রাম হিসেবে লিখতে চান তা নির্বাচন করুন:</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-darkBg-light/60 rounded-xl p-1 border border-gray-200/50 dark:border-gray-800/80 font-bold text-xs">
          <button
            type="button"
            onClick={() => handleUnitChange('vori')}
            className={`px-4 py-2 rounded-lg font-siliguri transition-all ${priceUnit === 'vori' ? 'bg-white dark:bg-darkBg-dark shadow-sm text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700'}`}
          >
            ভরি / তোলা অনুযায়ী
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('gram')}
            className={`px-4 py-2 rounded-lg font-siliguri transition-all ${priceUnit === 'gram' ? 'bg-white dark:bg-darkBg-dark shadow-sm text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700'}`}
          >
            গ্রাম অনুযায়ী
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex gap-3 text-xs sm:text-sm leading-relaxed text-blue-800 dark:text-blue-350">
        <ShieldAlert className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="font-siliguri">
          এখানে সেট করা বাজার মূল্যসমূহ <strong>যাকাত ক্যালকুলেটর</strong> এর ওজনে ইনপুটের ক্ষেত্রে ডিফল্ট হিসেবে প্রাক-পূরণ করা হবে এবং আপনার মোট সম্পদের মূল্যের সাথে <strong>নিসাব সীমা</strong> স্বয়ংক্রিয়ভাবে আপডেট করে পুরো অ্যাপে কার্যকর করবে।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gold Carat Settings */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri text-gold-600 dark:text-gold-500">
              স্বর্ণের ক্যারেট ভিত্তিক মূল্য (Gold Rates)
            </h3>
          </div>

          {/* Default Gold Carat Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 font-siliguri">ডিফল্ট ক্যারেট নির্বাচন</label>
            <select
              value={settings.selectedGoldCarat}
              onChange={(e) => setSelectedGoldCarat(e.target.value as keyof GoldRates)}
              className="block w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs transition-all font-siliguri font-bold text-emerald-800 dark:text-emerald-400"
            >
              <option value="24k">২৪ ক্যারেট (পাকা সোনা / গোল্ড বার)</option>
              <option value="22k">২২ ক্যারেট (অলঙ্কার সোনা - জনপ্রিয়)</option>
              <option value="21k">২১ ক্যারেট</option>
              <option value="18k">১৮ ক্যারেট</option>
              <option value="traditional">সনাতন স্বর্ণ</option>
            </select>
          </div>

          <div className="space-y-4 pt-2">
            {/* Rates Table / List */}
            {(Object.keys(goldInputs) as Array<keyof GoldRates>).map((carat) => {
              const caratName = carat === '24k' ? '২৪ ক্যারেট' : carat === '22k' ? '২২ ক্যারেট' : carat === '21k' ? '২১ ক্যারেট' : carat === '18k' ? '১৮ ক্যারেট' : 'সনাতন সোনা';
              return (
                <div key={carat} className="grid grid-cols-12 gap-3 items-center pb-3 border-b border-b-gray-100/60 dark:border-b-gray-800/40 last:border-0 last:pb-0">
                  <div className="col-span-5">
                    <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 font-siliguri">{caratName}</span>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 font-siliguri font-medium">
                      {renderOppositePreview(goldInputs[carat])}
                    </p>
                  </div>
                  <div className="col-span-7 flex items-center gap-2">
                    <input
                      type="text"
                      value={goldInputStrings[carat] || ''}
                      onChange={(e) => handleGoldPriceChangeRaw(carat, e.target.value)}
                      className="block w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs text-right transition-all font-siliguri font-bold text-gray-800 dark:text-white"
                    />
                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-siliguri">৳/{priceUnit === 'vori' ? 'ভরি' : 'গ্রাম'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Silver Carat Settings */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri text-emerald-700 dark:text-emerald-400">
              রৌপ্যের ক্যারেট ভিত্তিক মূল্য (Silver Rates)
            </h3>
          </div>

          {/* Default Silver Carat Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 font-siliguri">ডিফল্ট ক্যারেট নির্বাচন</label>
            <select
              value={settings.selectedSilverCarat}
              onChange={(e) => setSelectedSilverCarat(e.target.value as keyof SilverRates)}
              className="block w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs transition-all font-siliguri font-bold text-emerald-800 dark:text-emerald-400"
            >
              <option value="22k">২২ ক্যারেট / ৯২.৫%Sterling Silver (জনপ্রিয়)</option>
              <option value="21k">২১ ক্যারেট</option>
              <option value="18k">১৮ ক্যারেট</option>
              <option value="traditional">সনাতন রূপা</option>
            </select>
          </div>

          <div className="space-y-4 pt-2">
            {/* Rates List */}
            {(Object.keys(silverInputs) as Array<keyof SilverRates>).map((carat) => {
              const caratName = carat === '22k' ? '২২ ক্যারেট' : carat === '21k' ? '২১ ক্যারেট' : carat === '18k' ? '১৮ ক্যারেট' : 'সনাতন রূপা';
              return (
                <div key={carat} className="grid grid-cols-12 gap-3 items-center pb-3 border-b border-b-gray-100/60 dark:border-b-gray-800/40 last:border-0 last:pb-0">
                  <div className="col-span-5">
                    <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 font-siliguri">{caratName}</span>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 font-siliguri font-medium">
                      {renderOppositePreview(silverInputs[carat])}
                    </p>
                  </div>
                  <div className="col-span-7 flex items-center gap-2">
                    <input
                      type="text"
                      value={silverInputStrings[carat] || ''}
                      onChange={(e) => handleSilverPriceChangeRaw(carat, e.target.value)}
                      className="block w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-xs text-right transition-all font-siliguri font-bold text-gray-800 dark:text-white"
                    />
                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-siliguri">৳/{priceUnit === 'vori' ? 'ভরি' : 'গ্রাম'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fitra Commodity Rates Settings */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 shadow-sm space-y-6 md:col-span-2">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-siliguri text-rose-700 dark:text-rose-400">
              সাদকাতুল ফিতরের খাদ্যশস্য ভিত্তিক বাজার দর (Fitra Commodity Prices)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {(Object.keys(fitraInputs) as Array<keyof FitraRates>).map((id) => {
              const commodityName = 
                id === 'wheat' ? 'গম / আটা (১.৬৫ কেজি)' : 
                id === 'barley' ? 'যব (৩.৩ কেজি)' : 
                id === 'date' ? 'খেজুর (৩.৩ কেজি)' : 
                id === 'raisin' ? 'কিসমিস (৩.৩ কেজি)' : 'পনির (৩.৩ কেজি)';
              return (
                <div key={id} className="space-y-1.5 p-3 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50/40 dark:bg-darkBg-light/10">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-250 font-siliguri">{commodityName}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fitraInputStrings[id] || ''}
                      onChange={(e) => handleFitraPriceChangeRaw(id, e.target.value)}
                      className="block w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-855 bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-rose-500 text-xs text-right transition-all font-siliguri font-bold text-gray-800 dark:text-white"
                    />
                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-siliguri">৳/জন</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Settings Actions Panel */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
        <button
          onClick={handleResetDefaults}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm font-siliguri transition-all"
        >
          <RotateCcw className="w-4 h-4 text-orange-500" />
          ডিফল্ট মূল্যে রিসেট করুন
        </button>
        <button
          onClick={handleSaveAll}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm font-siliguri transition-all shadow-md shadow-emerald-700/10"
        >
          <Save className="w-4 h-4" />
          সেটিংস সংরক্ষণ করুন
        </button>
      </div>
    </div>
  );
}
