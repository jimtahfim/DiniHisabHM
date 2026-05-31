import rules from '../config/rules.json';

export interface ZakatInputs {
  cash: number;
  bankBalance: number;
  goldValue: number; // Value of gold held
  silverValue: number; // Value of silver held
  businessAssets: number;
  investments: number;
  receivables: number;
  debts: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
  nisabType: 'silver' | 'gold'; // Standard is silver because it is lower and benefits the poor
}

export interface ZakatResult {
  totalAssets: number;
  netAssets: number;
  nisabThreshold: number;
  isEligible: boolean; // Is Zakat obligatory?
  zakatAmount: number;
  breakdown: {
    cash: number;
    bankBalance: number;
    goldValue: number;
    silverValue: number;
    businessAssets: number;
    investments: number;
    receivables: number;
    debts: number;
  };
}

/**
 * Calculates Zakat based on input assets and liabilities.
 */
export function calculateZakat(inputs: ZakatInputs): ZakatResult {
  const {
    cash,
    bankBalance,
    goldValue,
    silverValue,
    businessAssets,
    investments,
    receivables,
    debts,
    goldPricePerGram,
    silverPricePerGram,
    nisabType
  } = inputs;

  // Calculate Nisab thresholds
  const silverNisab = rules.nisab.silverGram * (silverPricePerGram || rules.nisab.defaultSilverPricePerGram);
  const goldNisab = rules.nisab.goldGram * (goldPricePerGram || rules.nisab.defaultGoldPricePerGram);
  
  const nisabThreshold = nisabType === 'silver' ? silverNisab : goldNisab;

  // Sum of all liquid/zakat-eligible assets
  const totalAssets = cash + bankBalance + goldValue + silverValue + businessAssets + investments + receivables;
  
  // Net assets after subtracting debts
  const netAssets = Math.max(0, totalAssets - debts);

  // Zakat is due if net assets are equal to or greater than the Nisab threshold
  const isEligible = netAssets >= nisabThreshold;
  
  // Zakat rate is 2.5%
  const zakatAmount = isEligible ? netAssets * rules.zakat.rate : 0;

  return {
    totalAssets,
    netAssets,
    nisabThreshold,
    isEligible,
    zakatAmount,
    breakdown: {
      cash,
      bankBalance,
      goldValue,
      silverValue,
      businessAssets,
      investments,
      receivables,
      debts
    }
  };
}
