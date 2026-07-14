
import { useGetPrivacyQuery } from "@/store/api/terms";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const [termsText, setTermsText] = useState("");
  const { data, isLoading, error } = useGetPrivacyQuery();

  useEffect(() => {
    if (data) {
      console.log(data.privacy);
      setTermsText(data.privacy?.content || "No content available.");
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md p-8 space-y-8 border border-gray-200">
            <h1 className="text-4xl font-semibold text-gray-800 mb-4 text-center">
              <Skeleton width={250} height={40} baseColor="#F5F5F5" highlightColor="#FED7AA" />
            </h1>
            <div className="space-y-6">
              <div className="prose max-w-none bg-white p-4 rounded-md border border-gray-200">
                <Skeleton count={6} height={20} baseColor="#F5F5F5" highlightColor="#FED7AA" />
                <Skeleton count={2} height={15} width="80%" baseColor="#F5F5F5" highlightColor="#FED7AA" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-800">
          {t("privacy.loadError")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md p-8 space-y-8 border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-200">
          <h1 className="text-4xl font-semibold text-gray-800 mb-4 text-center">
            {t("privacy.title")}
          </h1>
          <div className="space-y-6">
            <div className="prose max-w-none bg-white p-4 rounded-md border border-gray-200 text-gray-600">
              <div dangerouslySetInnerHTML={{ __html: termsText }} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        h1, div.prose {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .prose {
          font-weight: 500;
        }
        .prose a {
          color: #F97316;
          text-decoration: none;
        }
        .prose a:hover {
          color: #EA580C;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
