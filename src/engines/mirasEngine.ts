export interface MirasInputs {
  totalEstateValue: number;
  husband: number; // 0 or 1
  wife: number; // 0 to 4
  father: boolean;
  mother: boolean;
  sons: number;
  daughters: number;
  brothers: number;
  sisters: number;
}

export interface HeirResult {
  relationship: string; // Bangla label
  englishName: string;
  shareFraction: string; // e.g. "1/6", "2/3", "Asabah"
  sharePercent: number; // Percentage of estate
  amount: number; // Money amount in Taka
  status: 'active' | 'excluded' | 'none';
  exclusionReason?: string; // Reason if excluded
}

export interface MirasResult {
  heirs: HeirResult[];
  totalEstateValue: number;
  distributedAmount: number;
  hasAul: boolean;
  hasRadd: boolean;
}

/**
 * Calculates Sunni Hanafi inheritance shares for primary relatives.
 */
export function calculateMiras(inputs: MirasInputs): MirasResult {
  const {
    totalEstateValue,
    husband,
    wife,
    father,
    mother,
    sons,
    daughters,
    brothers,
    sisters
  } = inputs;

  const heirs: HeirResult[] = [];
  const activeShares: Record<string, number> = {};
  const shareFractions: Record<string, string> = {};
  const statuses: Record<string, 'active' | 'excluded' | 'none'> = {};
  const exclusionReasons: Record<string, string> = {};

  const hasChildren = sons > 0 || daughters > 0;
  const siblingCount = brothers + sisters;

  // Initialize status for each potential relative
  const spouseType = husband > 0 ? 'husband' : wife > 0 ? 'wife' : 'none';

  // 1. Check Exclusions (Mahjub)
  // Sons are never excluded
  // Daughters are never excluded
  // Father and Mother are never excluded
  // Spouses are never excluded
  
  // Brothers and Sisters are completely excluded if father or son is alive
  const isSiblingsExcluded = father || sons > 0;
  
  // 2. Base calculations for Spouses
  if (spouseType === 'husband') {
    statuses['husband'] = 'active';
    if (hasChildren) {
      activeShares['husband'] = 0.25; // 1/4
      shareFractions['husband'] = '১/৪ (সন্তান থাকায়)';
    } else {
      activeShares['husband'] = 0.50; // 1/2
      shareFractions['husband'] = '১/২ (সন্তান না থাকায়)';
    }
  } else if (spouseType === 'wife') {
    statuses['wife'] = 'active';
    if (hasChildren) {
      activeShares['wife'] = 0.125; // 1/8
      shareFractions['wife'] = `১/৮ (সন্তান থাকায়, ${wife} স্ত্রীর মধ্যে সমবণ্টন)`;
    } else {
      activeShares['wife'] = 0.25; // 1/4
      shareFractions['wife'] = `১/৪ (সন্তান না থাকায়, ${wife} স্ত্রীর মধ্যে সমবণ্টন)`;
    }
  }

  // 3. Base calculations for Mother
  if (mother) {
    statuses['mother'] = 'active';
    if (hasChildren || siblingCount >= 2) {
      activeShares['mother'] = 1/6;
      shareFractions['mother'] = '১/৬ (সন্তান বা একাধিক ভাই/বোন থাকায়)';
    } else {
      activeShares['mother'] = 1/3;
      shareFractions['mother'] = '১/৩ (সন্তান বা একাধিক ভাই/বোন না থাকায়)';
    }
  }

  // 4. Base calculations for Father
  if (father) {
    statuses['father'] = 'active';
    if (sons > 0) {
      activeShares['father'] = 1/6;
      shareFractions['father'] = '১/৬ (পুত্র থাকায় নির্দিষ্ট অংশ)';
    } else if (daughters > 0) {
      activeShares['father'] = 1/6; // gets 1/6 as sharer, will get residuary later
      shareFractions['father'] = '১/৬ + আসাবা (শুধুমাত্র কন্যা থাকায়)';
    } else {
      activeShares['father'] = 0; // gets nothing as fixed sharer, purely Asabah
      shareFractions['father'] = 'আসাবা (অবশিষ্টাংশভোগী)';
    }
  }

  // 5. Daughters (Sharers if no sons exist)
  if (daughters > 0) {
    statuses['daughter'] = 'active';
    if (sons === 0) {
      if (daughters === 1) {
        activeShares['daughter'] = 0.50; // 1/2
        shareFractions['daughter'] = '১/২ (একমাত্র কন্যা ও কোনো পুত্র না থাকায়)';
      } else {
        activeShares['daughter'] = 2/3; // 2/3 shared
        shareFractions['daughter'] = `২/৩ (একাধিক কন্যা ও কোনো পুত্র না থাকায়, ${daughters} জনের সমবণ্টন)`;
      }
    } else {
      // Becomes Asabah with son
      activeShares['daughter'] = 0;
      shareFractions['daughter'] = 'আসাবা (পুত্রের সাথে ২:১ অনুপাতে বণ্টন)';
    }
  }

  // 6. Siblings Exclusions and Shares
  if (brothers > 0 || sisters > 0) {
    if (isSiblingsExcluded) {
      if (brothers > 0) {
        statuses['brother'] = 'excluded';
        exclusionReasons['brother'] = sons > 0 ? 'পুত্র জীবিত থাকায় ভাই অংশ পাবেন না' : 'পিতা জীবিত থাকায় ভাই অংশ পাবেন না';
      }
      if (sisters > 0) {
        statuses['sister'] = 'excluded';
        exclusionReasons['sister'] = sons > 0 ? 'পুত্র জীবিত থাকায় বোন অংশ পাবেন না' : 'পিতা জীবিত থাকায় বোন অংশ পাবেন না';
      }
    } else {
      // Siblings can inherit
      if (brothers > 0) statuses['brother'] = 'active';
      if (sisters > 0) statuses['sister'] = 'active';

      if (sons === 0 && daughters === 0 && !father) {
        // Collateral inheritance (Kalalah)
        if (brothers === 0) {
          // Sisters are sharers
          if (sisters === 1) {
            activeShares['sister'] = 0.50;
            shareFractions['sister'] = '১/২ (একমাত্র বোন ও অন্য কোনো উত্তরাধিকারী না থাকায়)';
          } else {
            activeShares['sister'] = 2/3;
            shareFractions['sister'] = `২/৩ (${sisters} বোনের সমবণ্টন)`;
          }
        } else {
          // Brothers and sisters are Asabah
          if (brothers > 0) {
            activeShares['brother'] = 0;
            shareFractions['brother'] = 'আসাবা (অবশিষ্টাংশভোগী)';
          }
          if (sisters > 0) {
            activeShares['sister'] = 0;
            shareFractions['sister'] = 'আসাবা (ভাইয়ের সাথে ২:১ অনুপাতে)';
          }
        }
      } else if (daughters > 0 && sons === 0 && !father && brothers === 0) {
        // "Make sisters Asabah with daughters" rule
        if (sisters > 0) {
          statuses['sister'] = 'active';
          activeShares['sister'] = 0;
          shareFractions['sister'] = 'আসাবা (কন্যার সাথে অবশিষ্টাংশ)';
        }
      } else {
        // Excluded by other conditions (daughters + father, etc.)
        if (brothers > 0) {
          statuses['brother'] = 'excluded';
          exclusionReasons['brother'] = 'উত্তরাধিকারী কন্যা/পিতা/পুত্র থাকায় ভাই বঞ্চিত';
        }
        if (sisters > 0) {
          statuses['sister'] = 'excluded';
          exclusionReasons['sister'] = 'উত্তরাধিকারী কন্যা/পিতা/পুত্র থাকায় বোন বঞ্চিত';
        }
      }
    }
  }

  // 7. Calculate Sum of Fixed Shares
  let sumShares = 0;
  for (const k in activeShares) {
    sumShares += activeShares[k];
  }

  // 8. Determine if there are Asabah (Residuaries) who can take remainder
  const hasSons = sons > 0;
  const isFatherAsabah = father && sons === 0;
  const isBrotherAsabah = !isSiblingsExcluded && brothers > 0;
  const isSisterAsabahWithDaughter = !isSiblingsExcluded && sisters > 0 && daughters > 0 && sons === 0 && brothers === 0;
  const isSisterAsabahWithBrother = !isSiblingsExcluded && sisters > 0 && brothers > 0;

  const hasAsabah = hasSons || isFatherAsabah || isBrotherAsabah || isSisterAsabahWithDaughter || isSisterAsabahWithBrother;

  let hasAul = false;
  let hasRadd = false;

  const finalPercentages: Record<string, number> = {};

  if (hasAsabah) {
    if (sumShares >= 1) {
      // 8a. Aul Case with Asabah (Asabah gets 0, Sharers scaled down)
      hasAul = true;
      for (const k in activeShares) {
        finalPercentages[k] = activeShares[k] / sumShares;
      }
      // All Asabah get 0
      if (hasSons) {
        finalPercentages['son'] = 0;
        finalPercentages['daughter'] = 0;
      }
      if (father && sons === 0) {
        // Father gets his fixed 1/6 scaled down
        finalPercentages['father'] = activeShares['father'] / sumShares;
      }
      if (isBrotherAsabah || isSisterAsabahWithBrother) {
        finalPercentages['brother'] = 0;
        finalPercentages['sister'] = 0;
      }
      if (isSisterAsabahWithDaughter) {
        finalPercentages['sister'] = 0;
      }
    } else {
      // 8b. Normal Case with Asabah (Remainder goes to Asabah)
      const remainder = 1 - sumShares;

      // Copy fixed shares first
      for (const k in activeShares) {
        finalPercentages[k] = activeShares[k];
      }

      if (hasSons) {
        // Sons and daughters share remainder in 2:1 ratio
        // Total parts = (sons * 2) + daughters
        const totalParts = (sons * 2) + daughters;
        const partValue = remainder / totalParts;
        finalPercentages['son'] = partValue * 2;
        finalPercentages['daughter'] = partValue;
      } else if (isFatherAsabah) {
        // Father takes all remainder
        finalPercentages['father'] = (activeShares['father'] || 0) + remainder;
      } else if (isBrotherAsabah || isSisterAsabahWithBrother) {
        // Brothers and sisters share remainder in 2:1 ratio
        const totalParts = (brothers * 2) + sisters;
        const partValue = remainder / totalParts;
        if (brothers > 0) finalPercentages['brother'] = partValue * 2;
        if (sisters > 0) finalPercentages['sister'] = partValue;
      } else if (isSisterAsabahWithDaughter) {
        // Sisters take remainder
        finalPercentages['sister'] = remainder / sisters;
      }
    }
  } else {
    // 9. No Asabah present
    if (sumShares > 1) {
      // 9a. Aul (Scale down all shares)
      hasAul = true;
      for (const k in activeShares) {
        finalPercentages[k] = activeShares[k] / sumShares;
      }
    } else if (sumShares < 1) {
      // 9b. Radd (Return to sharers, EXCEPT Husband/Wife)
      // Remainder is distributed proportionally among non-spouse active sharers
      hasRadd = true;
      const spouseKey = spouseType === 'husband' ? 'husband' : spouseType === 'wife' ? 'wife' : '';
      const spouseShare = spouseKey ? activeShares[spouseKey] || 0 : 0;
      const nonSpouseSum = sumShares - spouseShare;

      if (nonSpouseSum > 0) {
        const remainder = 1 - sumShares;
        // Keep spouse share fixed
        if (spouseKey) {
          finalPercentages[spouseKey] = spouseShare;
        }
        // Distribute remainder proportionally to others
        for (const k in activeShares) {
          if (k !== spouseKey) {
            const proportionalReturn = (activeShares[k] / nonSpouseSum) * remainder;
            finalPercentages[k] = activeShares[k] + proportionalReturn;
            shareFractions[k] = `${shareFractions[k]} + রদ (উদ্বৃত্ত ফেরত)`;
          }
        }
      } else {
        // Only spouse alive (extreme edge case)
        if (spouseKey) {
          finalPercentages[spouseKey] = 1.0; // gets 100% in modern radd
          shareFractions[spouseKey] = '১০০% (অন্য কোনো ওয়ারিশ না থাকায় সমগ্র সম্পদ)';
        }
      }
    } else {
      // 9c. Sum is exactly 1
      for (const k in activeShares) {
        finalPercentages[k] = activeShares[k];
      }
    }
  }

  // Helper to push results
  const addHeirResult = (eng: string, bangla: string, count: number) => {
    const status = statuses[eng] || 'none';
    if (status === 'none') return;

    let pct = finalPercentages[eng] || 0;
    let desc = shareFractions[eng] || '';

    // Adjust labels and text for counts
    if (eng === 'son') {
      desc = `আসাবা (অবশিষ্টাংশভোগী, ${count} পুত্রের সমবণ্টন)`;
    } else if (eng === 'daughter' && sons > 0) {
      desc = `আসাবা (পুত্রের সাথে ২:১ অনুপাতে বণ্টন)`;
    } else if (eng === 'brother') {
      desc = `আসাবা (অবশিষ্টাংশভোগী, ${count} ভাইয়ের সমবণ্টন)`;
    } else if (eng === 'sister' && brothers > 0) {
      desc = `আসাবা (ভাইয়ের সাথে ২:১ অনুপাতে)`;
    }

    heirs.push({
      relationship: bangla + (count > 1 ? ` (${count} জন)` : ''),
      englishName: eng,
      shareFraction: status === 'excluded' ? '০' : desc || 'অবশিষ্টাংশভোগী (আসাবা)',
      sharePercent: status === 'excluded' ? 0 : pct * 100,
      amount: status === 'excluded' ? 0 : totalEstateValue * pct,
      status: status,
      exclusionReason: exclusionReasons[eng]
    });
  };

  // Push in hierarchical order
  if (husband > 0) addHeirResult('husband', 'স্বামী', 1);
  if (wife > 0) addHeirResult('wife', 'স্ত্রী', wife);
  if (father) addHeirResult('father', 'পিতা', 1);
  if (mother) addHeirResult('mother', 'মাতা', 1);
  if (sons > 0) addHeirResult('son', 'পুত্র', sons);
  if (daughters > 0) addHeirResult('daughter', 'কন্যা', daughters);
  if (brothers > 0) addHeirResult('brother', 'ভাই', brothers);
  if (sisters > 0) addHeirResult('sister', 'বোন', sisters);

  // Excluded heirs listing if any
  for (const key in statuses) {
    if (statuses[key] === 'excluded') {
      const bnLabel = 
        key === 'brother' ? 'ভাই' :
        key === 'sister' ? 'বোন' : '';
      const count = key === 'brother' ? brothers : sisters;
      
      heirs.push({
        relationship: bnLabel + (count > 1 ? ` (${count} জন)` : ''),
        englishName: key,
        shareFraction: 'বঞ্চিত (মাহজুব)',
        sharePercent: 0,
        amount: 0,
        status: 'excluded',
        exclusionReason: exclusionReasons[key]
      });
    }
  }

  const distributedAmount = heirs.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    heirs,
    totalEstateValue,
    distributedAmount,
    hasAul,
    hasRadd
  };
}
