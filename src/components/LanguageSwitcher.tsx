import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", labelKey: "nav.english", native: "English" },
  { code: "mr", labelKey: "nav.marathi", native: "मराठी" },
] as const;

type Props = {
  /** Compact for mobile drawer */
  className?: string;
  variant?: "navbar" | "drawer";
};

/**
 * Language dropdown — English / Marathi.
 * Placed top-right in the public navbar.
 */
export default function LanguageSwitcher({
  className,
  variant = "navbar",
}: Props) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50",
          variant === "navbar" ? "px-3 py-1.5" : "w-full justify-between px-3 py-2.5"
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-orange-500" />
          <span className="hidden sm:inline">{t("nav.language")}:</span>
          <span className="font-semibold text-slate-900">{current.native}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-[60] mt-1.5 min-w-[10.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg",
            variant === "navbar" ? "right-0" : "left-0 right-0"
          )}
        >
          {LANGUAGES.map((lang) => {
            const active = current.code === lang.code;
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition",
                    active
                      ? "bg-orange-50 font-semibold text-orange-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>
                    <span className="block">{lang.native}</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {t(lang.labelKey)}
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-orange-500" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
