/**
 * Fast Auto-translate between English and Marathi for dynamic trip content.
 * Uses Google Translate Free API + localStorage & memory cache.
 */

export type AppLang = "en" | "mr";

const CACHE_PREFIX = "sunshine_tr_v2:";
const memoryCache = new Map<string, string>();

const hasDevanagari = (s: string) => /[\u0900-\u097F]/.test(s);

function cacheKey(text: string, target: AppLang): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `${CACHE_PREFIX}${target}:${h}:${text.length}`;
}

function readCache(key: string): string | null {
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  try {
    const v = localStorage.getItem(key);
    if (v) {
      memoryCache.set(key, v);
      return v;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(key: string, value: string) {
  memoryCache.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota — ignore */
  }
}

/**
 * Translate a single piece of text using Google Translate free endpoint.
 */
async function fetchGoogleTranslate(
  text: string,
  source: AppLang,
  target: AppLang
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || source === target) return text;

  // Primary: Google clients5 dict-chrome-ex endpoint (blazing fast, full text)
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${source}&tl=${target}&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && typeof data[0] === "string" && data[0].trim()) {
        return data[0];
      }
      if (typeof data === "string" && data.trim()) {
        return data;
      }
    }
  } catch {
    /* try secondary */
  }

  // Secondary: Google Translate GTX endpoint
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((item: any) =>
            Array.isArray(item) && typeof item[0] === "string" ? item[0] : ""
          )
          .join("");
        if (translated.trim()) return translated;
      }
    }
  } catch {
    /* try fallback */
  }

  // Fallback: MyMemory translated.net
  try {
    const memUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed.slice(0, 450)
    )}&langpair=${source}|${target}`;
    const res = await fetch(memUrl);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (
        translated &&
        typeof translated === "string" &&
        !translated.toUpperCase().includes("PLEASE SELECT")
      ) {
        return translated;
      }
    }
  } catch {
    /* fallback to original */
  }

  return text;
}

// Concurrency pool for smooth parallel requests
let inflightCount = 0;
const MAX_CONCURRENT = 6;
const waitQueue: (() => void)[] = [];

async function acquireSlot(): Promise<void> {
  if (inflightCount < MAX_CONCURRENT) {
    inflightCount++;
    return;
  }
  return new Promise((resolve) => {
    waitQueue.push(() => {
      inflightCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  inflightCount--;
  const next = waitQueue.shift();
  if (next) next();
}

/**
 * Translate text between English and Marathi fast with caching.
 */
export async function autoTranslate(
  text: string,
  target: AppLang
): Promise<string> {
  if (!text || !String(text).trim()) return text;

  const plain = String(text);
  const source: AppLang = hasDevanagari(plain) ? "mr" : "en";
  if (source === target) return plain;

  const key = cacheKey(plain, target);
  const cached = readCache(key);
  if (cached != null) return cached;

  await acquireSlot();
  try {
    const result = await fetchGoogleTranslate(plain, source, target);
    writeCache(key, result);
    return result;
  } catch (err) {
    console.warn("autoTranslate failed, using original:", err);
    return plain;
  } finally {
    releaseSlot();
  }
}

/**
 * Translate HTML by translating text nodes between tags (keeps markup structure).
 */
export async function autoTranslateHtml(
  html: string,
  target: AppLang
): Promise<string> {
  if (!html || !html.trim()) return html;
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return autoTranslate(html, target);
  }

  const parts = html.split(/(<[^>]+>)/g);
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("<") || !part.trim()) {
      out.push(part);
      continue;
    }
    out.push(await autoTranslate(part, target));
  }
  return out.join("");
}

export function resolveAppLang(lng?: string): AppLang {
  return lng?.startsWith("mr") ? "mr" : "en";
}

