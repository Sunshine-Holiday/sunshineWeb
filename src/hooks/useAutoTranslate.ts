import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  autoTranslate,
  autoTranslateHtml,
  resolveAppLang,
  type AppLang,
} from "@/utils/autoTranslate";

/**
 * Auto-translate text when UI language is Marathi/English.
 * Assumes admin content is mostly English; Marathi content is detected via Devanagari.
 */
export function useAutoTranslate(
  text: string | undefined | null,
  options?: { html?: boolean }
): { text: string; loading: boolean } {
  const { i18n } = useTranslation();
  const target = resolveAppLang(i18n.language);
  const source = text ?? "";
  const html = options?.html ?? false;

  const [out, setOut] = useState(source);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!source.trim()) {
      setOut("");
      setLoading(false);
      return;
    }

    // Fast path: already in target script
    const hasMr = /[\u0900-\u097F]/.test(source);
    if ((target === "mr" && hasMr) || (target === "en" && !hasMr)) {
      setOut(source);
      setLoading(false);
      return;
    }

    setLoading(true);
    const run = html ? autoTranslateHtml : autoTranslate;

    run(source, target)
      .then((r) => {
        if (!cancelled) setOut(r);
      })
      .catch(() => {
        if (!cancelled) setOut(source);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [source, target, html]);

  return { text: out, loading };
}

/** Translate a list of strings (e.g. amenities) in parallel */
export function useAutoTranslateList(
  items: string[] | undefined | null
): { items: string[]; loading: boolean } {
  const { i18n } = useTranslation();
  const target = resolveAppLang(i18n.language);
  const input = items ?? [];
  const [out, setOut] = useState(input);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (input.length === 0) {
      setOut([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(input.map((s) => autoTranslate(s, target)))
      .then((r) => {
        if (!cancelled) setOut(r);
      })
      .catch(() => {
        if (!cancelled) setOut(input);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(input), target]);

  return { items: out, loading };
}

export type { AppLang };
