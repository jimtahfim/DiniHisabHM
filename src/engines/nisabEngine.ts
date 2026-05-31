import rules from '../config/rules.json';

export interface NisabInputs {
  goldPricePerGram: number;
  silverPricePerGram: number;
  userCashAndAssets: number;
}

export interface NisabResult {
  goldNisabTola: number;
  silverNisabTola: number;
  goldNisabGram: number;
  silverNisabGram: number;
  goldNisabValue: number;
  silverNisabValue: number;
  isEligibleGold: boolean; // Does user asset exceed gold Nisab?
  isEligibleSilver: boolean; // Does user asset exceed silver Nisab?
  userCashAndAssets: number;
}

/**
 * Calculates current Nisab thresholds and compares with user's wealth.
 */
export function calculateNisab(inputs: NisabInputs): NisabResult {
  const { goldPricePerGram, silverPricePerGram, userCashAndAssets } = inputs;
  
  const goldPrice = goldPricePerGram || rules.nisab.defaultGoldPricePerGram;
  const silverPrice = silverPricePerGram || rules.nisab.defaultSilverPricePerGram;

  const goldNisabValue = rules.nisab.goldGram * goldPrice;
  const silverNisabValue = rules.nisab.silverGram * silverPrice;

  const isEligibleGold = userCashAndAssets >= goldNisabValue;
  const isEligibleSilver = userCashAndAssets >= silverNisabValue;

  return {
    goldNisabTola: rules.nisab.goldTola,
    silverNisabTola: rules.nisab.silverTola,
    goldNisabGram: rules.nisab.goldGram,
    silverNisabGram: rules.nisab.silverGram,
    goldNisabValue,
    silverNisabValue,
    isEligibleGold,
    isEligibleSilver,
    userCashAndAssets
  };
}
