export interface HajjInputs {
  hasPhysicalAbility: boolean;
  hasFinancialAbility: boolean; // Sufficient funds for travel & accommodation
  isDebtFreeAndHasSavings: boolean; // Debts are managed & family has provisions during Hajj
  isPathSafe: boolean; // Safe travels (e.g. Mahram available for women, active safe borders)
  packageCost: number; // Cost of the Hajj packages
  travelCost: number; // Flight/travel tickets
  qurbaniCost: number; // Hajj Qurbani cost
  personalCost: number; // Pocket money
}

export interface HajjResult {
  isEligible: boolean; // Is Hajj obligatory?
  totalCost: number;
  breakdown: {
    packageCost: number;
    travelCost: number;
    qurbaniCost: number;
    personalCost: number;
  };
}

/**
 * Calculates Hajj eligibility and budgets total costs.
 */
export function calculateHajj(inputs: HajjInputs): HajjResult {
  const {
    hasPhysicalAbility,
    hasFinancialAbility,
    isDebtFreeAndHasSavings,
    isPathSafe,
    packageCost,
    travelCost,
    qurbaniCost,
    personalCost
  } = inputs;

  // Hajj is obligatory (Fardh) if all key conditions are met
  const isEligible = hasPhysicalAbility && hasFinancialAbility && isDebtFreeAndHasSavings && isPathSafe;

  const totalCost = packageCost + travelCost + qurbaniCost + personalCost;

  return {
    isEligible,
    totalCost,
    breakdown: {
      packageCost,
      travelCost,
      qurbaniCost,
      personalCost
    }
  };
}
