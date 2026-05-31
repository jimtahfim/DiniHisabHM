import rules from '../config/rules.json';

export interface UshrInputs {
  harvestWeightKg: number; // Crop weight in kg
  harvestValue: number; // Financial value of harvest in Taka
  irrigationType: 'rain' | 'irrigated'; // Rain-fed (10%) vs irrigated (5%)
}

export interface UshrResult {
  isEligible: boolean; // Does harvest exceed Nisab of 5 Wasaq (~653 kg)?
  ushrRate: number; // 0.05 or 0.10
  ushrAmount: number; // Agricultural Zakat in Taka
  harvestValue: number;
  nisabWeightThreshold: number;
}

/**
 * Calculates agricultural Zakat (Ushr) obligation.
 */
export function calculateUshr(inputs: UshrInputs): UshrResult {
  const { harvestWeightKg, harvestValue, irrigationType } = inputs;
  
  // Ushr is due if the harvest weight exceeds 5 Wasaq (approx 653 kg)
  const isEligible = harvestWeightKg >= rules.ushr.nisabKg;
  
  // 10% (0.10) for rain-fed crops, 5% (0.05) for artificial irrigation
  const ushrRate = irrigationType === 'rain' ? rules.ushr.rainFedRate : rules.ushr.irrigatedRate;
  
  // Ushr amount based on total value of crop
  const ushrAmount = isEligible ? harvestValue * ushrRate : 0;

  return {
    isEligible,
    ushrRate,
    ushrAmount,
    harvestValue,
    nisabWeightThreshold: rules.ushr.nisabKg
  };
}
