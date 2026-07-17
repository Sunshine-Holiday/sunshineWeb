import { useGetAboutQuery } from "@/store/api/terms";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Users,
  Bus,
  Sparkles,
  Phone,
} from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

const AboutUs: React.FC = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const { data, isLoading, error } = useGetAboutQuery();

  useEffect(() => {
    if (data) {
      setContent(data?.about?.content || t("about.noContent"));
    }
  }, [data, t]);

  const stats = [
    { icon: Users, value: "100K+", label: "Happy travellers" },
    { icon: MapPin, value: "50+", label: "Destinations" },
    { icon: Bus, value: "Safe", label: "Guided journeys" },
    { icon: Sparkles, value: "5★", label: "Memories made" },
  ];

  return (
    <ContentPageShell
      icon={Heart}
      eyebrow="Our story"
      title={t("about.title") || "About Us"}
      subtitle="Sunshine Holiday Packages — unforgettable day trips and stay packages across Maharashtra and beyond."
      isLoading={isLoading}
      error={!!error}
      errorMessage={t("about.loadError") || "Failed to load about page."}
      footer={
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/80 p-5 text-center shadow-sm"
              >
                <s.icon className="mx-auto h-6 w-6 text-orange-500" />
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {s.value}
                </p>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Ready for your next adventure?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Browse trips or talk to our team — we&apos;re here to help.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/trips"
                className="inline-flex items-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
              >
                Explore trips
              </Link>
              <a
                href="tel:+919975375975"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <Phone className="h-4 w-4 text-orange-500" />
                Call us
              </a>
            </div>
          </div>
        </div>
      }
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </ContentPageShell>
  );
};

export default AboutUs;
