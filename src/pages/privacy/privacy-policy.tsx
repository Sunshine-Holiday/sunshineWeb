import { useGetTermsQuery } from "@/store/api/terms";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton"; // Import Skeleton component

const PrivacyPolicy: React.FC = () => {
  const [termsText, setTermsText] = useState("");
  const { data, error, isLoading } = useGetTermsQuery();

  useEffect(() => {
    if (data) {
      setTermsText(data.terms);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              <Skeleton width={200} height={40} />
            </h1>
            <div className="space-y-6">
              <div>
                <div className="prose max-w-none bg-gray-100 p-4 rounded-md border">
                  <Skeleton count={5} height={20} />
                  <Skeleton count={3} height={15} width="80%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>Error loading privacy-policy. Please try again later.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          privacy-policy
          </h1>
          <div className="space-y-6">
            <div>
              <div
                className="prose max-w-none bg-gray-100 p-4 rounded-md border"
                dangerouslySetInnerHTML={{ __html: termsText.content }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
