import {
  useCreatePrivacyMutation,
  useGetPrivacyQuery,
} from "@/store/api/terms";
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Import the skeleton CSS
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

const EditPrivacy: React.FC = () => {
  const [termsText, setTermsText] = useState("");
  const { data, error, isLoading } = useGetPrivacyQuery();
  const [createTerms] = useCreatePrivacyMutation();
  const [isSubmitting, setIsSubmitting] = useState(false); // Track the submitting state

  // Update the termsText when data is fetched
  useEffect(() => {
    if (data) {
      setTermsText(data.privacy.content); // Assuming data.terms contains the terms text
      console.log(data.privacy);
    }
  }, [data]);

  const handleTermsChange = (value: string) => {
    setTermsText(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Start the submission process
    try {
      const resp = await createTerms({ content: termsText }).unwrap();
      console.log(resp.message);
      toast.success("Terms and Conditions submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit Terms and Conditions.");
    } finally {
      setIsSubmitting(false); // End the submission process
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              <Skeleton width={200} height={40} />
            </h1>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="terms"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Skeleton width={150} height={20} />
                </label>
                <Skeleton height={200} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  <Skeleton width={100} height={20} />
                </h2>
                <Skeleton height={200} />
              </div>
              <div className="text-center">
                <Skeleton width={100} height={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>Error loading terms and conditions. Please try again later.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            privacy-policy
          </h1>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="terms"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                privacy-policy
              </label>
              <ReactQuill
                value={termsText}
                onChange={handleTermsChange}
                className="mt-1"
                placeholder="Write your terms and conditions here..."
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Preview:
              </h2>
              <div
                className="prose max-w-none bg-gray-100 p-4 rounded-md border"
                dangerouslySetInnerHTML={{ __html: termsText }}
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting} // Disable the button during submission
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPrivacy;
