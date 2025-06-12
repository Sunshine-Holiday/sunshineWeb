
import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { scaleOnHover } from "../../utils/animations";
import { useSendContactMutation } from "@/store/api/auth";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [sendContact] = useSendContactMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    console.log("Form Data:", formData);
    try {
      const resp = await sendContact(formData).unwrap();
      if (resp.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" }); // Reset form
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-base font-semibold text-gray-800">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border-gray-200 shadow-md focus:border-orange-500 focus:ring-orange-500 focus:ring-2 outline-none text-gray-800 px-4 py-3"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-base font-semibold text-gray-800">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border-gray-200 shadow-md focus:border-orange-500 focus:ring-orange-500 focus:ring-2 outline-none text-gray-800 px-4 py-3"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-base font-semibold text-gray-800">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border-gray-200 shadow-md focus:border-orange-500 focus:ring-orange-500 focus:ring-2 outline-none text-gray-800 px-4 py-3"
        />
      </div>
      <motion.button
        {...scaleOnHover}
        type="submit"
        className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition-all duration-200 ${
          loading
            ? "bg-orange-300 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg"
        }`}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Message"}
      </motion.button>

      <style jsx>{`
        input, textarea, button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        label {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </form>
  );
};

export default ContactForm;
