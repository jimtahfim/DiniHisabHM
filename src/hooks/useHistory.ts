import { useState, useEffect } from 'react';
import { convertToBanglaNumber } from '../utils/banglaNumber';

export interface HistoryEntry {
  id: string;
  toolType: 'zakat' | 'miras' | 'qurbani' | 'fitra' | 'hajj' | 'ushr' | 'nisab' | 'masturat';
  toolName: string;
  timestamp: string;
  summary: string;
  inputs: any;
  result: any;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('dini-hisab-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('dini-hisab-history', JSON.stringify(newHistory));
  };

  const addHistoryEntry = (
    toolType: HistoryEntry['toolType'],
    toolName: string,
    summary: string,
    inputs: any,
    result: any
  ) => {
    const now = new Date();
    // Beautiful formatted Bangla date e.g. ৩১ মে, ২০২৬ ৬:২৮
    const banglaMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    const day = convertToBanglaNumber(now.getDate());
    const month = banglaMonths[now.getMonth()];
    const year = convertToBanglaNumber(now.getFullYear());
    let hours = now.getHours();
    const minutes = convertToBanglaNumber(String(now.getMinutes()).padStart(2, '0'));
    const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
    hours = hours % 12 || 12;
    const formattedHours = convertToBanglaNumber(hours);

    const timestamp = `${day} ${month}, ${year} • ${ampm} ${formattedHours}:${minutes}`;

    const newEntry: HistoryEntry = {
      id: `${Date.now()}`,
      toolType,
      toolName,
      timestamp,
      summary,
      inputs,
      result
    };

    const updated = [newEntry, ...history.filter(h => h.id !== newEntry.id)].slice(0, 50); // limit to 50 items
    saveHistory(updated);
  };

  const deleteHistoryEntry = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return {
    history,
    addHistoryEntry,
    deleteHistoryEntry,
    clearHistory
  };
}
