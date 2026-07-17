import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type ContentPageShellProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: boolean;
  errorMessage?: string;
  /** Main HTML or React content body */
  children?: React.ReactNode;
  /** Extra blocks below the main card (e.g. About stats) */
  footer?: React.ReactNode;
};

/**
 * Shared marketing layout for Terms, Privacy, About, etc.
 * Hero gradient + glass card + readable prose.
 */
export default function ContentPageShell({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  isLoading,
  error,
  errorMessage = "Something went wrong. Please try again later.",
  children,
  footer,
}: ContentPageShellProps) {
  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/80 via-slate-50 to-slate-50" />
        <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Unable to load</h1>
          <p className="mt-2 text-slate-600">{errorMessage}</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400" />
        <div className="absolute inset-x-0 top-[320px] h-40 bg-gradient-to-b from-transparent to-slate-50" />
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 top-40 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center text-white"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl md:text-5xl">
            {isLoading ? (
              <span className="inline-block">
                <Skeleton
                  width={280}
                  height={48}
                  baseColor="rgba(255,255,255,0.35)"
                  highlightColor="rgba(255,255,255,0.55)"
                />
              </span>
            ) : (
              title
            )}
          </h1>
          {subtitle && !isLoading && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-orange-50/95 sm:text-lg">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-orange-900/10 backdrop-blur-xl"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400" />

          <div className="p-6 sm:p-10 md:p-12">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton count={8} height={18} baseColor="#F5F5F5" highlightColor="#FED7AA" />
                <Skeleton count={3} height={16} width="85%" baseColor="#F5F5F5" highlightColor="#FED7AA" />
              </div>
            ) : (
              <div className="content-prose prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:mt-10 prose-h2:border-b prose-h2:border-orange-100 prose-h2:pb-2 prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600 prose-a:font-semibold prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 hover:prose-a:underline prose-strong:text-slate-800 prose-ul:my-4 prose-ol:my-4">
                {children}
              </div>
            )}
          </div>
        </motion.div>

        {footer && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-8"
          >
            {footer}
          </motion.div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
