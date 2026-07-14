import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { scaleOnHover } from "../../utils/animations";
import { useSendContactMutation } from "@/store/api/auth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const [sendContact] = useSendContactMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await sendContact(formData).unwrap();
      if (resp.success) {
        toast.success(t("contact.success"));
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(t("contact.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="name"
          className="block text-base font-semibold text-gray-800"
        >
          {t("contact.name")}
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border-gray-200 px-4 py-3 text-gray-800 shadow-md outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-base font-semibold text-gray-800"
        >
          {t("contact.email")}
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border-gray-200 px-4 py-3 text-gray-800 shadow-md outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-base font-semibold text-gray-800"
        >
          {t("contact.message")}
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border-gray-200 px-4 py-3 text-gray-800 shadow-md outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <motion.button
        {...scaleOnHover}
        type="submit"
        className={`w-full rounded-lg px-4 py-3 font-medium text-white shadow-md transition-all duration-200 ${
          loading
            ? "cursor-not-allowed bg-orange-300"
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg"
        }`}
        disabled={loading}
      >
        {loading ? t("contact.sending") : t("contact.send")}
      </motion.button>
    </form>
  );
};
