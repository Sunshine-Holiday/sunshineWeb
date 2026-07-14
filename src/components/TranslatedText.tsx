import React from "react";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { cn } from "@/lib/utils";

type Props = {
  text?: string | null;
  /** Render as HTML (trip descriptions from rich editor) */
  html?: boolean;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div" | "li";
  className?: string;
  /** Show subtle fade while translating */
  showLoading?: boolean;
};

/**
 * Displays text auto-translated to the active UI language (en / mr).
 */
export default function TranslatedText({
  text,
  html = false,
  as = "span",
  className,
  showLoading = true,
}: Props) {
  const { text: translated, loading } = useAutoTranslate(text, { html });
  const cls = cn(
    className,
    showLoading && loading && "opacity-70 transition-opacity"
  );

  if (html) {
    if (as === "div") {
      return (
        <div
          className={cls}
          dangerouslySetInnerHTML={{ __html: translated || "" }}
        />
      );
    }
    return (
      <span
        className={cls}
        dangerouslySetInnerHTML={{ __html: translated || "" }}
      />
    );
  }

  if (as === "p") return <p className={cls}>{translated}</p>;
  if (as === "h1") return <h1 className={cls}>{translated}</h1>;
  if (as === "h2") return <h2 className={cls}>{translated}</h2>;
  if (as === "h3") return <h3 className={cls}>{translated}</h3>;
  if (as === "div") return <div className={cls}>{translated}</div>;
  if (as === "li") return <li className={cls}>{translated}</li>;
  return <span className={cls}>{translated}</span>;
}
