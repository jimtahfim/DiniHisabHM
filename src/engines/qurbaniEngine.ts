export interface QurbaniInputs {
  hasNisabExtra: boolean; // Does user own assets exceeding Nisab on Qurbani days?
  animalType: 'cow' | 'goat' | 'sheep' | 'camel' | 'buffalo' | 'share';
  price: number; // Total animal cost or share cost
  shares: number; // Number of shares (1 for goat/sheep, 1 to 7 for cow/camel/buffalo)
}

export interface QurbaniResult {
  isEligible: boolean; // Is Qurbani obligatory?
  totalCost: number;
  costPerPerson: number;
  sharesCount: number;
  animalLabel: string;
}

const animalLabels: Record<string, string> = {
  cow: 'গরু',
  goat: 'ছাগল',
  sheep: 'ভেড়া',
  camel: 'উট',
  buffalo: 'মহিষ',
  share: 'গরু/মহিষের অংশ (ভাগ)'
};

/**
 * Calculates Qurbani eligibility and expense breakdowns.
 */
export function calculateQurbani(inputs: QurbaniInputs): QurbaniResult {
  const { hasNisabExtra, animalType, price, shares } = inputs;
  
  // Qurbani is obligatory (Wajib) if the person has Nisab-level extra assets on Eid days
  const isEligible = hasNisabExtra;
  
  const totalCost = price;
  const sharesCount = Math.max(1, shares);
  
  // Cost per person (if buying the whole animal, it is price / shares; if buying a single share, it is totalCost)
  const costPerPerson = animalType === 'share' ? price : totalCost / sharesCount;

  return {
    isEligible,
    totalCost,
    costPerPerson,
    sharesCount,
    animalLabel: animalLabels[animalType] || 'পশু'
  };
}
