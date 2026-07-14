import React from 'react';
import { motion } from 'framer-motion';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';
import { fadeInUp } from '../../utils/animations';
import { useTranslation } from 'react-i18next';

 const ContactPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-2xl font-semibold mb-6">{t("contact.sendMessage")}</h2>
            <ContactForm />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-2xl font-semibold mb-6">{t("contact.info")}</h2>
            <ContactInfo />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage