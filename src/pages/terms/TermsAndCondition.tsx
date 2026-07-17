import { useGetTermsQuery } from "@/store/api/terms";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, ShieldCheck, Scale } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

const TermsAndConditionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [termsText, setTermsText] = useState("");
  const { data, isLoading, error } = useGetTermsQuery();

  useEffect(() => {
    if (data) {
      setTermsText(data?.terms?.content || "No content available.");
    }
  }, [data]);

  return (
    <ContentPageShell
      icon={FileText}
      eyebrow="Legal"
      title={t("terms.title") || "Terms & Conditions"}
      subtitle="Please read these terms carefully before booking or using Sunshine Holiday Packages services."
      isLoading={isLoading}
      error={!!error}
      errorMessage={t("terms.loadError") || "Failed to load terms and conditions."}
      footer={
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Safe travel",
              desc: "Clear policies so every journey is transparent and fair.",
            },
            {
              icon: Scale,
              title: "Fair booking",
              desc: "Rules for seats, payments, and cancellations spelled out.",
            },
            {
              icon: FileText,
              title: "Your agreement",
              desc: "By booking you accept these terms and our service guidelines.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      }
    >
      <div dangerouslySetInnerHTML={{ __html: termsText }} />
    </ContentPageShell>
  );
};

export default TermsAndConditionsPage;
