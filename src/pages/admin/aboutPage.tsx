import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useAboutTermsMutation, useGetAboutQuery } from "@/store/api/terms";

const AboutPage: React.FC = () => {
  const { data ,isLoading} = useGetAboutQuery();
  const [aboutText, setAboutText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [error, setError] = useState(false);
  const [createAbout] = useAboutTermsMutation();
  // Simulate fetching data
  React.useEffect(() => {
    if (data) {
      setAboutText(data.about.content);
    }
  }, [data]);

  const handleAboutChange = (value: string) => {
    setAboutText(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const resp = await createAbout({ content: aboutText }).unwrap();
      console.log(resp);
      toast.success("About Us section submitted successfully!");
    } catch (err) {
      toast.error("Failed to submit About Us section.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
              <Skeleton height={200} />
              <Skeleton height={40} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading About Us section. Please try again later.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            About Us
          </h1>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Edit About Us Section
              </label>
              <ReactQuill
                value={aboutText}
                onChange={handleAboutChange}
                className="mt-1"
                placeholder="Write about your company here..."
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Preview:
              </h2>
              <div
                className="prose max-w-none bg-gray-100 p-4 rounded-md border"
                dangerouslySetInnerHTML={{ __html: aboutText }}
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
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

export default AboutPage;
