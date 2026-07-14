import { motion } from "framer-motion";
import {
  Bus,
  CalendarCheck2,
  HeadphonesIcon,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const features = [
    {
      icon: CalendarCheck2,
      title: t("why.f1Title"),
      description: t("why.f1Desc"),
    },
    {
      icon: Bus,
      title: t("why.f2Title"),
      description: t("why.f2Desc"),
    },
    {
      icon: Wallet,
      title: t("why.f3Title"),
      description: t("why.f3Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("why.f4Title"),
      description: t("why.f4Desc"),
    },
    {
      icon: HeadphonesIcon,
      title: t("why.f5Title"),
      description: t("why.f5Desc"),
    },
    {
      icon: Sparkles,
      title: t("why.f6Title"),
      description: t("why.f6Desc"),
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            {t("why.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("why.title")}
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            {t("why.subtitle")}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-6 transition hover:border-orange-100 hover:bg-white hover:shadow-lg hover:shadow-orange-100/40"
              >
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-3 text-white shadow-md shadow-orange-200/60">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-700">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
