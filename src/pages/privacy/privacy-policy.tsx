import { useGetPrivacyQuery } from "@/store/api/terms";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Eye, Database, UserCheck } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const [termsText, setTermsText] = useState("");
  const { data, isLoading, error } = useGetPrivacyQuery();

  useEffect(() => {
    if (data) {
      setTermsText(data.privacy?.content || "No content available.");
    }
  }, [data]);

  return (
    <ContentPageShell
      icon={Lock}
      eyebrow="Your privacy"
      title={t("privacy.title") || "Privacy Policy"}
      subtitle="How we collect, use, and protect your personal information when you book with us."
      isLoading={isLoading}
      error={!!error}
      errorMessage={t("privacy.loadError") || "Failed to load privacy policy."}
      footer={
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Transparency",
              desc: "We explain what data we collect and why we need it.",
            },
            {
              icon: Database,
              title: "Secure storage",
              desc: "Booking and contact details are handled with care.",
            },
            {
              icon: UserCheck,
              title: "Your control",
              desc: "Reach out anytime for questions about your data.",
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

export default PrivacyPolicy;
