import { create } from 'zustand';

interface Settings {
  language: 'ar' | 'en';
  lengthUnit: string;
  areaUnit: string;
  loadUnit: string;
  stressUnit: string;
  densityUnit: string;
}

interface SettingsStore extends Settings {
  setLanguage: (lang: 'ar' | 'en') => void;
  setLengthUnit: (unit: string) => void;
  setAreaUnit: (unit: string) => void;
  setLoadUnit: (unit: string) => void;
  setStressUnit: (unit: string) => void;
  setDensityUnit: (unit: string) => void;
  resetSettings: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const STORAGE_KEY = 'bs-evaluation-settings';

const defaultSettings: Settings = {
  language: 'ar',
  lengthUnit: 'cm',
  areaUnit: 'cm²',
  loadUnit: 'ton',
  stressUnit: 'kg/cm²',
  densityUnit: 'kg/cm³'
};

const loadFromStorage = (): Settings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading settings from storage:', error);
  }
  
  return defaultSettings;
};

const saveToStorage = (settings: Settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...defaultSettings,
  _hasHydrated: false,
  
  setLanguage: (lang) => {
    const currentSettings = loadFromStorage();
    const newSettings = { ...currentSettings, language: lang };
    set(newSettings);
    saveToStorage(newSettings);
  },
  
  setLengthUnit: (unit) => {
    const currentSettings = loadFromStorage();
    const newSettings = { ...currentSettings, lengthUnit: unit };
    set(newSettings);
    saveToStorage(newSettings);
  },
  
  setAreaUnit: (unit) => {
    const currentSettings = loadFromStorage();
    const newSettings = { ...currentSettings, areaUnit: unit };
    set(newSettings);
    saveToStorage(newSettings);
  },
  
  setLoadUnit: (unit) => {
    const currentSettings = loadFromStorage();
    const newSettings = { ...currentSettings, loadUnit: unit };
    set(newSettings);
    saveToStorage(newSettings);
  },
  
  setStressUnit: (unit) => {
    const currentSettings = loadFromStorage();
    const newSettings = { ...currentSettings, stressUnit: unit };
    set(newSettings);
    saveToStorage(newSettings);
  },
  
  setDensityUnit: (unit) => {
    const currentSettings = loadFromStorage();
    const newSettings = { ...currentSettings, densityUnit: unit };
    set(newSettings);
    saveToStorage(newSettings);
  },
  
  resetSettings: () => {
    set(defaultSettings);
    saveToStorage(defaultSettings);
  },
  
  setHasHydrated: (hydrated) => {
    set({ _hasHydrated: hydrated });
  }
}));

// Hydrate the store on client side
if (typeof window !== 'undefined') {
  const storedSettings = loadFromStorage();
  useSettingsStore.setState({ ...storedSettings, _hasHydrated: true });
}
