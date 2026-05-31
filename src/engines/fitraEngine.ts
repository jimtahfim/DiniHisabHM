import rules from '../config/rules.json';

export interface FitraRates {
  wheat: number;
  barley: number;
  date: number;
  raisin: number;
  cheese: number;
}

export interface FitraInputs {
  memberCount: number; // Total family members including dependents
  selectedRateId: string; // e.g. wheat, barley, date, raisin, cheese
  fitraRates?: FitraRates;
}

export interface FitraResult {
  isEligible: boolean; // Fitra is Wajib for any Muslim who has food for 1 day
  ratePerPerson: number;
  totalFitra: number;
  rateName: string;
  rateDescription: string;
  memberCount: number;
}

/**
 * Calculates Sadakatul Fitr obligations for a household.
 */
export function calculateFitra(inputs: FitraInputs): FitraResult {
  const { memberCount, selectedRateId, fitraRates } = inputs;
  
  // Find the selected rate from rules.json
  const rateItem = rules.fitra.rates.find(r => r.id === selectedRateId) || rules.fitra.rates[0];
  
  // If custom fitraRates exist, use it; otherwise fallback to defaults in rules.json
  const ratePerPerson = fitraRates ? (fitraRates[selectedRateId as keyof FitraRates] ?? rateItem.rate) : rateItem.rate;
  const totalFitra = ratePerPerson * memberCount;
  
  // Fitra is obligatory (Wajib) for every Muslim who possesses food exceeding their day and night needs
  const isEligible = memberCount > 0;

  return {
    isEligible,
    ratePerPerson,
    totalFitra,
    rateName: rateItem.name,
    rateDescription: rateItem.description,
    memberCount
  };
}
