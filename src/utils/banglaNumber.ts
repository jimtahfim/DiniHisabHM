const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * Converts English numbers/digits in a string or number to Bangla digits
 */
export function convertToBanglaNumber(num: number | string): string {
  if (num === undefined || num === null) return '';
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
}

/**
 * Formats a number to Bangladeshi Currency format (৳) with Bangla digits
 * Uses Indian/Bangladeshi digit grouping (e.g. ৳ ১২,৫০,০০০ instead of ৳ ১,২৫০,০০০)
 */
export function formatBanglaCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳ ০';
  }
  
  // Format with commas using Indian English locale (similar comma placements to BD)
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `৳ ${convertToBanglaNumber(formatted)}`;
}

/**
 * Formats a number as a percentage with Bangla digits
 */
export function formatBanglaPercent(pct: number): string {
  if (pct === undefined || pct === null || isNaN(pct)) {
    return '০%';
  }
  
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(pct);
  
  return `${convertToBanglaNumber(formatted)}%`;
}

/**
 * Standard utility to parse inputs with Bangla or English digits to a regular float
 */
export function parseBanglaOrEnglishNumber(input: string): number {
  if (!input) return 0;
  
  // Map of Bangla digits to English
  const bdToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  
  // Replace Bangla digits with English ones
  const englishDigits = input.replace(/[০-৯]/g, (digit) => bdToEnMap[digit] || digit);
  
  // Remove commas, spaces, currency symbols
  const cleanInput = englishDigits.replace(/[৳,\s]/g, '');
  
  const parsed = parseFloat(cleanInput);
  return isNaN(parsed) ? 0 : parsed;
}
