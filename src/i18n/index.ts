import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";

const STORAGE_KEY = "sunshine_lang";

// English only — clear any previously saved Marathi preference
try {
  localStorage.setItem(STORAGE_KEY, "en");
} catch {
  /* ignore */
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en"],
  interpolation: {
    escapeValue: false,
  },
});

// Keep <html lang="..."> in sync
i18n.on("languageChanged", () => {
  document.documentElement.lang = "en";
  try {
    localStorage.setItem(STORAGE_KEY, "en");
  } catch {
    /* ignore */
  }
});

// Set initial lang attribute
document.documentElement.lang = "en";

export default i18n;
export { STORAGE_KEY };
