import React from 'react';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export const SocialLinks = () => {
  return (
    <div className="flex gap-4">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <motion.a
          key={label}
          href={href}
          whileHover={{ scale: 1.1 }}
          className="text-gray-600 hover:text-blue-600"
          aria-label={label}
        >
          <Icon className="h-6 w-6" />
        </motion.a>
      ))}
    </div>
  );
};