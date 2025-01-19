import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";

// Dynamically import ReactQuill to ensure compatibility with Vite and SSR.
const ReactQuill =
  typeof window !== "undefined"
    ? (await import("react-quill")).default
    : () => <div />;

const BlogCreatePage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [formData, setFormData] = useState({
    title: "",
    author: user?.username || "",
    image: null as File | null,
    imagePreview: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ["image/png", "image/jpeg", "image/jpg"];
      if (!validExtensions.includes(file.type)) {
        alert("Please upload an image in PNG, JPEG, or JPG format.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prevData) => ({ ...prevData, description: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Blog Data:", formData);
    alert("Blog submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-xl shadow-lg p-6 space-y-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Create a New Blog
          </h1>
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {formData.imagePreview && (
              <div className="mb-4">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter blog title"
              />
            </div>
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700"
              >
                Author Name
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter author name"
              />
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Image (PNG, JPEG, JPG)
              </label>
              <input
                type="file"
                id="image"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                required
                className="mt-1 block w-full text-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              {ReactQuill && (
                <div className="mt-1">
                  <ReactQuill
                    id="description"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    className="h-48 overflow-auto"
                    placeholder="Enter a detailed description of the blog"
                  />
                </div>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Blog
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogCreatePage;
