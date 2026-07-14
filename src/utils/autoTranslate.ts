/**
 * Auto-translate between English and Marathi for trip titles/details.
 * Uses MyMemory free API + localStorage cache.
 */

export type AppLang = "en" | "mr";

const CACHE_PREFIX = "sunshine_tr_v1:";
const MAX_CHUNK = 450; // MyMemory free limit ~500 chars
const memoryCache = new Map<string, string>();

const hasDevanagari = (s: string) => /[\u0900-\u097F]/.test(s);

function cacheKey(text: string, target: AppLang): string {
  // short hash-ish key
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

function chunkText(text: string, size = MAX_CHUNK): string[] {
  if (text.length <= size) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= size) {
      chunks.push(rest);
      break;
    }
    // break on space near limit
    let cut = rest.lastIndexOf(" ", size);
    if (cut < size * 0.5) cut = size;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  return chunks;
}

/** Simple queue so many trip cards don't hammer the free API at once */
let queue: Promise<void> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function translateChunk(
  text: string,
  source: AppLang,
  target: AppLang
): Promise<string> {
  if (!text.trim() || source === target) return text;

  return enqueue(async () => {
    const langpair = `${source}|${target}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${langpair}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Translate HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || typeof translated !== "string") {
      throw new Error("Empty translation");
    }
    // MyMemory sometimes returns "PLEASE SELECT TWO DISTINCT LANGUAGES" etc.
    if (translated.toUpperCase().includes("PLEASE SELECT")) return text;
    // small gap between requests
    await new Promise((r) => setTimeout(r, 80));
    return translated;
  });
}

/**
 * Detect source language roughly, then translate to target if needed.
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

  try {
    const chunks = chunkText(plain);
    const parts: string[] = [];
    for (const chunk of chunks) {
      // small delay between chunks to be polite to free API
      if (parts.length > 0) {
        await new Promise((r) => setTimeout(r, 120));
      }
      parts.push(await translateChunk(chunk, source, target));
    }
    const result = parts.join(" ");
    writeCache(key, result);
    return result;
  } catch (err) {
    console.warn("autoTranslate failed, using original:", err);
    return plain;
  }
}

/**
 * Translate HTML by translating text nodes between tags (keeps markup).
 */
export async function autoTranslateHtml(
  html: string,
  target: AppLang
): Promise<string> {
  if (!html || !html.trim()) return html;
  // If no tags, plain translate
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return autoTranslate(html, target);
  }

  const parts = html.split(/(<[^>]+>)/g);
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("<")) {
      out.push(part);
      continue;
    }
    // skip pure whitespace
    if (!part.trim()) {
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
