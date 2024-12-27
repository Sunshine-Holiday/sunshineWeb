import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../utils/animations';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard = ({ children, title, subtitle }: AuthCardProps) => {
  return (
    <div className="max-w-md w-full space-y-8 bg-white bg-opacity-60 backdrop-blur-sm p-8 rounded-xl shadow-lg">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
};
