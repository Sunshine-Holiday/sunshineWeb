import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import mr from "./locales/mr.json";

const STORAGE_KEY = "sunshine_lang";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      mr: { translation: mr },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "mr"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

// Keep <html lang="..."> in sync
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng === "mr" ? "mr" : "en";
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

// Set initial lang attribute
document.documentElement.lang = i18n.language?.startsWith("mr") ? "mr" : "en";

export default i18n;
export { STORAGE_KEY };
