import { create } from 'zustand';
import { Currency } from '../domain/currency';

interface SettingsState {
  currency: Currency;
  taxRequired: boolean;
  region: string | null;
  weekendSuppress: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;

  setCurrency: (c: Currency) => void;
  setTaxRequired: (v: boolean) => void;
  setRegion: (r: string | null) => void;
  setWeekendSuppress: (v: boolean) => void;
  setQuietHours: (start: number | null, end: number | null) => void;
}

export const useSettingsStore = create<SettingsState>(set => ({
  currency: 'VND',
  taxRequired: false,
  region: 'VN',
  weekendSuppress: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  setCurrency: c => set({ currency: c }),
  setTaxRequired: v => set({ taxRequired: v }),
  setRegion: r => set({ region: r }),
  setWeekendSuppress: v => set({ weekendSuppress: v }),
  setQuietHours: (start, end) => set({ quietHoursStart: start, quietHoursEnd: end }),
}));
