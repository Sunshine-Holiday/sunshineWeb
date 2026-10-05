import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import mr from "./locales/mr.json";

const STORAGE_KEY = "sunshine_lang";

const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === "mr" || saved.startsWith("mr"))) return "mr";
    return "en";
  } catch {
    return "en";
  }
};

const initialLang = getSavedLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mr: { translation: mr },
  },
  lng: initialLang,
  fallbackLng: "en",
  supportedLngs: ["en", "mr"],
  interpolation: {
    escapeValue: false,
  },
});

// Keep <html lang="..."> and localStorage in sync
i18n.on("languageChanged", (lng: string) => {
  const normalized = lng?.startsWith("mr") ? "mr" : "en";
  document.documentElement.lang = normalized;
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    /* ignore */
  }
});

// Set initial lang attribute
document.documentElement.lang = initialLang;

export default i18n;
export { STORAGE_KEY };

