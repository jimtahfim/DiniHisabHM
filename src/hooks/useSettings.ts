import { useState, useEffect } from 'react';
import rules from '../config/rules.json';

export interface GoldRates {
  '24k': number;
  '22k': number;
  '21k': number;
  '18k': number;
  'traditional': number;
}

export interface SilverRates {
  '22k': number;
  '21k': number;
  '18k': number;
  'traditional': number;
}

export interface FitraRates {
  wheat: number;
  barley: number;
  date: number;
  raisin: number;
  cheese: number;
}

export interface DiniSettings {
  goldRates: GoldRates;
  silverRates: SilverRates;
  selectedGoldCarat: keyof GoldRates;
  selectedSilverCarat: keyof SilverRates;
  fitraRates: FitraRates;
}

const DEFAULT_GOLD_RATES: GoldRates = {
  '24k': 11500,
  '22k': rules.nisab.defaultGoldPricePerGram, // 10500
  '21k': 10020,
  '18k': 8590,
  'traditional': 7150
};

const DEFAULT_SILVER_RATES: SilverRates = {
  '22k': rules.nisab.defaultSilverPricePerGram, // 160
  '21k': 153,
  '18k': 131,
  'traditional': 100
};

const DEFAULT_FITRA_RATES: FitraRates = {
  wheat: 115,
  barley: 400,
  date: 2000,
  raisin: 1800,
  cheese: 2800
};

const LOCAL_STORAGE_KEY = 'dinihisab_settings_v2'; // Bump version since schema changed

export function useSettings() {
  const [settings, setSettings] = useState<DiniSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all properties exist in loaded settings
        if (parsed.goldRates && parsed.silverRates && parsed.selectedGoldCarat && parsed.selectedSilverCarat) {
          if (!parsed.fitraRates) {
            parsed.fitraRates = { ...DEFAULT_FITRA_RATES };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }

    return {
      goldRates: { ...DEFAULT_GOLD_RATES },
      silverRates: { ...DEFAULT_SILVER_RATES },
      selectedGoldCarat: '22k',
      selectedSilverCarat: '22k',
      fitraRates: { ...DEFAULT_FITRA_RATES }
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateGoldRate = (carat: keyof GoldRates, rate: number) => {
    setSettings(prev => ({
      ...prev,
      goldRates: {
        ...prev.goldRates,
        [carat]: rate
      }
    }));
  };

  const updateSilverRate = (carat: keyof SilverRates, rate: number) => {
    setSettings(prev => ({
      ...prev,
      silverRates: {
        ...prev.silverRates,
        [carat]: rate
      }
    }));
  };

  const updateFitraRate = (id: keyof FitraRates, rate: number) => {
    setSettings(prev => ({
      ...prev,
      fitraRates: {
        ...prev.fitraRates,
        [id]: rate
      }
    }));
  };

  const setSelectedGoldCarat = (carat: keyof GoldRates) => {
    setSettings(prev => ({
      ...prev,
      selectedGoldCarat: carat
    }));
  };

  const setSelectedSilverCarat = (carat: keyof SilverRates) => {
    setSettings(prev => ({
      ...prev,
      selectedSilverCarat: carat
    }));
  };

  const resetToDefaults = () => {
    setSettings({
      goldRates: { ...DEFAULT_GOLD_RATES },
      silverRates: { ...DEFAULT_SILVER_RATES },
      selectedGoldCarat: '22k',
      selectedSilverCarat: '22k',
      fitraRates: { ...DEFAULT_FITRA_RATES }
    });
  };

  return {
    settings,
    updateGoldRate,
    updateSilverRate,
    updateFitraRate,
    setSelectedGoldCarat,
    setSelectedSilverCarat,
    resetToDefaults
  };
}
