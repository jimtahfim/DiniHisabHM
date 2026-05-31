import { useState, useEffect } from 'react';
import defaultSettings from '../config/settings.json';

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

const LOCAL_STORAGE_KEY = 'dinihisab_settings_v2'; // Bump version since schema changed
const LAST_JSON_DEFAULTS_KEY = 'dinihisab_last_json_defaults';

export function useSettings() {
  const [settings, setSettings] = useState<DiniSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const lastJsonDefaults = localStorage.getItem(LAST_JSON_DEFAULTS_KEY);
      
      const currentJsonDefaultsStr = JSON.stringify({
        goldRates: defaultSettings.goldRates,
        silverRates: defaultSettings.silverRates,
        fitraRates: defaultSettings.fitraRates
      });
      
      const isJsonModified = lastJsonDefaults !== currentJsonDefaultsStr;

      if (saved) {
        const parsed = JSON.parse(saved);
        
        // If the JSON was modified, automatically sync the active settings
        if (isJsonModified) {
          const mergedSettings = {
            ...parsed,
            goldRates: { ...parsed.goldRates, ...defaultSettings.goldRates },
            silverRates: { ...parsed.silverRates, ...defaultSettings.silverRates },
            fitraRates: { ...parsed.fitraRates, ...defaultSettings.fitraRates }
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedSettings));
          localStorage.setItem(LAST_JSON_DEFAULTS_KEY, currentJsonDefaultsStr);
          return mergedSettings;
        }

        // Ensure all properties exist in loaded settings
        if (parsed.goldRates && parsed.silverRates && parsed.selectedGoldCarat && parsed.selectedSilverCarat) {
          if (!parsed.fitraRates) {
            parsed.fitraRates = { ...defaultSettings.fitraRates };
          }
          return parsed;
        }
      }

      // Initialize and save current defaults
      localStorage.setItem(LAST_JSON_DEFAULTS_KEY, currentJsonDefaultsStr);
    } catch (e) {
      console.error('Failed to parse settings', e);
    }

    return {
      goldRates: { ...defaultSettings.goldRates },
      silverRates: { ...defaultSettings.silverRates },
      selectedGoldCarat: defaultSettings.selectedGoldCarat as keyof GoldRates,
      selectedSilverCarat: defaultSettings.selectedSilverCarat as keyof SilverRates,
      fitraRates: { ...defaultSettings.fitraRates }
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
      goldRates: { ...defaultSettings.goldRates },
      silverRates: { ...defaultSettings.silverRates },
      selectedGoldCarat: defaultSettings.selectedGoldCarat as keyof GoldRates,
      selectedSilverCarat: defaultSettings.selectedSilverCarat as keyof SilverRates,
      fitraRates: { ...defaultSettings.fitraRates }
    });
  };

  return {
    settings,
    updateGoldRate,
    updateSilverRate,
    updateFitraRate,
    setSelectedGoldCarat,
    setSelectedSilverCarat,
    resetToDefaults,
    developer: defaultSettings.developer
  };
}
