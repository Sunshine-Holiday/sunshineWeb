import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useGetBlogsIDQuery, useUpdateBlogsMutation } from "@/store/api/blogs";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useParams } from "react-router-dom";

const BlogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading: isFetching, isError } = useGetBlogsIDQuery({ id });
  const [updateBlogs] = useUpdateBlogsMutation();
  const user = useSelector(selectCurrentUser);

  const [formData, setFormData] = useState({
    title: "",
    author: user?.username || "",
    image: null as File | null,
    imagePreview: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && !isFetching && !isError) {
      setFormData({
        title: data.blog.title,
        author: data.blog.author,
        image: null,
        imagePreview: data.blog.image?.url || "",
        description: data.blog.description,
      });
    }
  }, [data, isFetching, isError]);

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
        toast.error("Please upload a valid image (PNG, JPEG, JPG).");
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("Invalid blog ID.");
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("author", formData.author);
    formDataToSend.append("description", formData.description);
    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }

    try {
      const response = await updateBlogs({ id, form: formDataToSend }).unwrap();
      toast.success("Blog updated successfully!");
      console.log(response);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to update the blog.");
    } finally {
      setLoading(false);
    }
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
            Edit Blog
          </h1>
          {isFetching ? (
            <div className="flex justify-center">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          ) : isError ? (
            <p className="text-center text-red-500">Failed to load blog data.</p>
          ) : (
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
                  Upload Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
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
                <ReactQuill
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className="mt-1"
                  placeholder="Enter a detailed description"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Update Blog"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogEdit;
