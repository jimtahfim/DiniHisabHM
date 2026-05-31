export interface MasturatInputs {
  habitHaydDays: number;      // Menstruation habit in days (3-10, default 6)
  habitTuhrDays: number;      // Purity habit in days (default 20, min 15)
  lastPurityDays: number;     // Days of purity between previous flow and current flow
  flowStartDate: string;      // Start date YYYY-MM-DD
  flowStartTime: string;      // Start time HH:MM
  isStillBleeding: boolean;
  flowEndDate?: string;       // End date YYYY-MM-DD
  flowEndTime?: string;       // End time HH:MM
}

export interface DurationBreakdown {
  haydDays: number;
  istihadahDays: number;
  totalFlowDays: number;
}

export interface MasturatResult {
  durationHours: number;
  durationDays: number;
  durationLabel: string;
  classification: 'hayd' | 'istihadah' | 'istihadah_excess' | 'too_short';
  isPure: boolean;
  rulingTitle: string;
  rulingDescription: string;
  rulingSteps: string[];
  // Enhanced fields for UI
  breakdown: DurationBreakdown;
  qazaNamazDays: number;  // How many days of qaza namaz must be prayed
  needsGhusl: boolean;     // Does she need to perform Ghusl now?
  nextExpectedHaydDate: string; // Estimated next hayd start date
  haydEndDate: string;     // When hayd portion ended
  purityStartDate: string; // When purity started/will start
}

/**
 * Calculates Hayd, Tuhr, and Istihadah statuses under Hanafi Fikh guidelines.
 */
export function calculateMasturat(inputs: MasturatInputs, currentTimeMs: number = Date.now()): MasturatResult {
  const {
    habitHaydDays,
    habitTuhrDays,
    lastPurityDays,
    flowStartDate,
    flowStartTime,
    isStillBleeding,
    flowEndDate,
    flowEndTime
  } = inputs;

  // 1. Calculate the flow duration in hours
  const startDateTimeStr = `${flowStartDate}T${flowStartTime || '00:00'}:00`;
  const startMs = Date.parse(startDateTimeStr);

  let endMs = currentTimeMs;
  if (!isStillBleeding && flowEndDate) {
    const endDateTimeStr = `${flowEndDate}T${flowEndTime || '00:00'}:00`;
    endMs = Date.parse(endDateTimeStr);
  }

  // Default enhanced fields
  const defaultBreakdown: DurationBreakdown = { haydDays: 0, istihadahDays: 0, totalFlowDays: 0 };

  // Helper to add days to a date string
  const addDaysToDate = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Handle invalid dates
  if (isNaN(startMs) || isNaN(endMs)) {
    return {
      durationHours: 0,
      durationDays: 0,
      durationLabel: '০ দিন',
      classification: 'too_short',
      isPure: true,
      rulingTitle: 'তথ্য অসম্পূর্ণ',
      rulingDescription: 'অনুগ্রহ করে রক্তস্রাব শুরু এবং শেষের সঠিক তারিখ ও সময় প্রদান করুন।',
      rulingSteps: [],
      breakdown: defaultBreakdown,
      qazaNamazDays: 0,
      needsGhusl: false,
      nextExpectedHaydDate: '',
      haydEndDate: '',
      purityStartDate: ''
    };
  }

  const diffMs = endMs - startMs;
  const durationHours = Math.max(0, diffMs / (1000 * 60 * 60));
  const durationDays = durationHours / 24;

  const durationDaysFormatted = durationDays.toFixed(1);

  // Helper to convert English decimals to Bangla format
  const toBanglaNum = (numStr: string) => {
    const enToBd: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return numStr.replace(/[0-9.]/g, (c) => enToBd[c] || c);
  };

  const durationLabel = `${toBanglaNum(durationDaysFormatted)} দিন (${toBanglaNum(Math.round(durationHours).toString())} ঘণ্টা)`;

  // Calculate next expected hayd date based on habit cycle
  const cycleLength = habitHaydDays + habitTuhrDays;
  const nextExpectedHaydDate = addDaysToDate(flowStartDate, cycleLength);

  // Rule 1: Intermediate Tuhr check
  if (lastPurityDays < 15) {
    return {
      durationHours,
      durationDays,
      durationLabel,
      classification: 'istihadah',
      isPure: true,
      rulingTitle: 'ইস্তিহাজা (অনিয়মিত রক্তস্রাব)',
      rulingDescription: 'দুই হায়েজের মধ্যবর্তী পবিত্রতার সর্বনিম্ন মেয়াদ ১৫ দিন। পূর্ববর্তী হায়েজ শেষ হওয়া এবং এই প্রবাহ শুরু হওয়ার মধ্যে মাত্র ' + toBanglaNum(lastPurityDays.toString()) + ' দিন ব্যবধান রয়েছে, যা ১৫ দিনের কম। অতএব, এই প্রবাহটি শরীয়তের দৃষ্টিতে "ইস্তিহাজা" বা অনিয়মিত রক্তস্রাব হিসেবে গণ্য হবে।',
      rulingSteps: [
        'এই রক্তস্রাবটি হায়েজ নয়, তাই আপনি শরয়ীভাবে পবিত্র (Tahirah) আছেন।',
        'আপনাকে সালাত (নামাজ) এবং সিয়াম (রোজা) নিয়মিত আদায় করতে হবে।',
        'প্রতিটি সালাতের ওয়াক্ত আসার পর নতুন করে ওযু সম্পন্ন করে নামাজ আদায় করবেন (আপনি হুকুমগতভাবে মাযুর বা সমস্যাক্রান্ত হিসেবে গণ্য হবেন)।'
      ],
      breakdown: { haydDays: 0, istihadahDays: Math.max(0, durationDays), totalFlowDays: Math.max(0, durationDays) },
      qazaNamazDays: 0,
      needsGhusl: false,
      nextExpectedHaydDate,
      haydEndDate: '',
      purityStartDate: flowStartDate
    };
  }

  // Rule 2: Bleeding is less than 3 days (72 hours)
  if (durationHours < 72) {
    if (isStillBleeding) {
      return {
        durationHours,
        durationDays,
        durationLabel,
        classification: 'too_short',
        isPure: false,
        rulingTitle: 'হায়েজের সম্ভাবনা (চলমান)',
        rulingDescription: 'আপনার রক্তস্রাব শুরু হয়েছে এবং এখনও ৩ দিন (৭২ ঘণ্টা) পূর্ণ হয়নি। শরীয়তের নিয়ম অনুযায়ী হায়েজ হওয়ার জন্য রক্তস্রাব কমপক্ষে ৩ দিন চলমান থাকা আবশ্যক। ৩ দিন পূর্ণ না হওয়া পর্যন্ত নামাজ-রোজা থেকে সাময়িকভাবে বিরত থাকুন।',
        rulingSteps: [
          'আপাতত নামাজ ও রোজা আদায় করা থেকে বিরত থাকুন।',
          'যদি ৩ দিন (৭২ ঘণ্টা) পূর্ণ হওয়ার আগেই রক্তস্রাব সম্পূর্ণ বন্ধ হয়ে যায়, তবে এটি ইস্তিহাজা গণ্য হবে এবং পূর্বের দিনগুলোর নামাজের কাযা পড়তে হবে।'
        ],
        breakdown: { haydDays: durationDays, istihadahDays: 0, totalFlowDays: durationDays },
        qazaNamazDays: 0,
        needsGhusl: false,
        nextExpectedHaydDate,
        haydEndDate: '',
        purityStartDate: ''
      };
    } else {
      // Stopped before 3 days = Istihadah
      const stoppedDays = Math.ceil(durationDays);
      return {
        durationHours,
        durationDays,
        durationLabel,
        classification: 'too_short',
        isPure: true,
        rulingTitle: 'ইস্তিহাজা (৩ দিনের কম রক্তস্রাব)',
        rulingDescription: 'আপনার রক্তস্রাব ' + durationLabel + ' চলে বন্ধ হয়ে গেছে, যা হায়েজের সর্বনিম্ন মেয়াদ ৩ দিন বা ৭২ ঘণ্টার চেয়ে কম। অতএব এটি হায়েজ নয়, বরং "ইস্তিহাজা" (অসুস্থতাজনিত অনিয়মিত রক্তস্রাব)।',
        rulingSteps: [
          'রক্তস্রাব বন্ধ হওয়ার পর আপনি সম্পূর্ণ পবিত্র আছেন।',
          'এই রক্তস্রাবের দিনগুলোতে যে সালাতগুলো (নামাজ) ছুটে গেছে, সেগুলোর কাযা আদায় করা আবশ্যক।',
          'এখন থেকে নিয়মিত সালাত ও সওম সম্পাদন করুন।'
        ],
        breakdown: { haydDays: 0, istihadahDays: durationDays, totalFlowDays: durationDays },
        qazaNamazDays: stoppedDays,
        needsGhusl: false,
        nextExpectedHaydDate,
        haydEndDate: '',
        purityStartDate: flowEndDate || flowStartDate
      };
    }
  }

  // Rule 3: Bleeding is between 3 days (72 hours) and 10 days (240 hours) inclusive
  if (durationHours <= 240) {
    if (isStillBleeding) {
      return {
        durationHours,
        durationDays,
        durationLabel,
        classification: 'hayd',
        isPure: false,
        rulingTitle: 'হায়েজ (মাসিক ঋতুস্রাব চলমান)',
        rulingDescription: 'আপনার রক্তস্রাব হায়েজের মেয়াদের মধ্যে চলমান রয়েছে (' + durationLabel + ')। শরীয়তের বিধান অনুযায়ী এটি আপনার মাসিক ঋতুস্রাব (হায়েজ)।',
        rulingSteps: [
          'আপনি বর্তমানে অপবিত্র (ঋতুবতী) অবস্থায় আছেন। নামাজ আদায় এবং রোজা রাখা থেকে সম্পূর্ণরূপে বিরত থাকুন।',
          'এই দিনগুলোতে ছুটে যাওয়া সালাত বা নামাজের কোনো কাযা আদায় করতে হবে না।',
          'রমজানের রোজা ছুটে গেলে পরবর্তী সময়ে সেগুলোর কাযা আদায় করতে হবে।'
        ],
        breakdown: { haydDays: durationDays, istihadahDays: 0, totalFlowDays: durationDays },
        qazaNamazDays: 0,
        needsGhusl: false,
        nextExpectedHaydDate,
        haydEndDate: '',
        purityStartDate: ''
      };
    } else {
      const haydEndDate = flowEndDate || addDaysToDate(flowStartDate, Math.ceil(durationDays));
      const purityStartDate = haydEndDate;
      return {
        durationHours,
        durationDays,
        durationLabel,
        classification: 'hayd',
        isPure: true,
        rulingTitle: 'হায়েজ সমাপ্ত (পবিত্রতা অর্জন)',
        rulingDescription: 'আপনার রক্তস্রাব ' + durationLabel + ' চলার পর বন্ধ হয়ে গেছে, যা হায়েজের স্বাভাবিক মেয়াদের (৩ থেকে ১০ দিন) মধ্যে রয়েছে। এটি আপনার হায়েজ ছিল এবং এখন তা সমাপ্ত হয়েছে।',
        rulingSteps: [
          'আপনার হায়েজ সফলভাবে শেষ হয়েছে, আপনি এখন পবিত্র।',
          'ফরজ গোসল (Ghusl) সম্পন্ন করে দ্রুত সালাত এবং ইবাদত শুরু করুন।',
          'এই হায়েজের মেয়াদে ছুটে যাওয়া নামাজের কোনো কাযা আদায় করতে হবে না।'
        ],
        breakdown: { haydDays: durationDays, istihadahDays: 0, totalFlowDays: durationDays },
        qazaNamazDays: 0,
        needsGhusl: true,
        nextExpectedHaydDate: addDaysToDate(flowStartDate, habitTuhrDays + Math.ceil(durationDays)),
        haydEndDate,
        purityStartDate
      };
    }
  }

  // Rule 4: Bleeding exceeds 10 days (240 hours)
  // Under Hanafi law, if flow exceeds 10 days, the habit (আদাত) determines the duration of Hayd.
  // The rest is Istihadah.
  const excessHours = durationHours - (habitHaydDays * 24);
  const excessDays = excessHours / 24;
  const haydEndDate = addDaysToDate(flowStartDate, habitHaydDays);
  const purityStartDate = haydEndDate;
  const qazaDays = Math.ceil(excessDays);

  if (isStillBleeding) {
    return {
      durationHours,
      durationDays,
      durationLabel,
      classification: 'istihadah_excess',
      isPure: true, // Excess is Istihadah, she is technically pure after habit days
      rulingTitle: '১০ দিন অতিক্রম করায় ইস্তিহাজা সাব্যস্ত',
      rulingDescription: 'আপনার রক্তস্রাব হায়েজের সর্বোচ্চ মেয়াদ ১০ দিন (২৪০ ঘণ্টা) অতিক্রম করেছে। হানাফি ফিকহ অনুযায়ী, রক্তস্রাব ১০ দিন পার হলে আপনার পূর্ববর্তী স্বাভাবিক অভ্যাস বা আদাত (' + toBanglaNum(habitHaydDays.toString()) + ' দিন) পর্যন্ত হায়েজ এবং অবশিষ্ট অতিরিক্ত সময়টুকু "ইস্তিহাজা" বা অনিয়মিত অসুস্থতা হিসেবে গণ্য হবে।',
      rulingSteps: [
        'আপনার হায়েজের মেয়াদ ছিল কেবল প্রথম ' + toBanglaNum(habitHaydDays.toString()) + ' দিন।',
        'অভ্যাসের মেয়াদ (' + toBanglaNum(habitHaydDays.toString()) + ' দিন) পার হওয়ার পর থেকেই আপনি হুকুমগতভাবে পবিত্র (Pure) সাব্যস্ত হয়েছেন।',
        'আপনাকে গোসল করে সালাত শুরু করতে হবে, যদিও এখনও রক্ত প্রবাহিত হচ্ছে। প্রতি নামাজের ওয়াক্তে নতুন ওযু করে সালাত ও সওম পালন করুন।',
        'হায়েজের নির্ধারিত ' + toBanglaNum(habitHaydDays.toString()) + ' দিনের পর থেকে এ পর্যন্ত যে নামাজগুলো পড়া হয়নি, সেগুলোর কাযা আদায় করতে হবে।'
      ],
      breakdown: { haydDays: habitHaydDays, istihadahDays: Math.max(0, excessDays), totalFlowDays: durationDays },
      qazaNamazDays: qazaDays,
      needsGhusl: true,
      nextExpectedHaydDate: addDaysToDate(flowStartDate, habitHaydDays + habitTuhrDays),
      haydEndDate,
      purityStartDate
    };
  } else {
    return {
      durationHours,
      durationDays,
      durationLabel,
      classification: 'istihadah_excess',
      isPure: true,
      rulingTitle: 'হায়েজ ও ইস্তিহাজা বিভাজন',
      rulingDescription: 'আপনার মোট রক্তস্রাব ' + durationLabel + ' স্থায়ী ছিল, যা হায়েজের সর্বোচ্চ মেয়াদ ১০ দিন অতিক্রম করেছে। অতএব, আপনার পূর্বের অভ্যাস বা আদাত (' + toBanglaNum(habitHaydDays.toString()) + ' দিন) হায়েজ হিসেবে এবং অবশিষ্ট ' + toBanglaNum(excessDays.toFixed(1)) + ' দিন "ইস্তিহাজা" (অসুস্থতা) হিসেবে সাব্যস্ত হবে।',
      rulingSteps: [
        'আপনার এই মাসের হায়েজ ছিল প্রথম ' + toBanglaNum(habitHaydDays.toString()) + ' দিন।',
        'পরবর্তী অতিরিক্ত ' + toBanglaNum(excessDays.toFixed(1)) + ' দিন আপনি ইস্তিহাজা অবস্থায় ছিলেন (অর্থাৎ আপনি পবিত্র ছিলেন)।',
        'ইস্তিহাজার দিনগুলোতে ছুটে যাওয়া সালাত বা নামাজের কাযা আদায় করা ফরজ। অবিলম্বে সেগুলোর কাযা আদায় করুন।',
        'হায়েজের প্রথম ' + toBanglaNum(habitHaydDays.toString()) + ' দিনের নামাজের কোনো কাযা আদায় করতে হবে না।'
      ],
      breakdown: { haydDays: habitHaydDays, istihadahDays: Math.max(0, excessDays), totalFlowDays: durationDays },
      qazaNamazDays: qazaDays,
      needsGhusl: true,
      nextExpectedHaydDate: addDaysToDate(flowStartDate, habitHaydDays + habitTuhrDays),
      haydEndDate,
      purityStartDate: flowEndDate || haydEndDate
    };
  }
}
