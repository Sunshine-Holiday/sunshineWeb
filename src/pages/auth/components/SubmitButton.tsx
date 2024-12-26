import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { scaleOnHover } from '../../../utils/animations';

interface SubmitButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const SubmitButton = ({ loading, children }: SubmitButtonProps) => {
  return (
    <motion.button
      {...scaleOnHover}
      type="submit"
      disabled={loading}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : children}
    </motion.button>
  );
};