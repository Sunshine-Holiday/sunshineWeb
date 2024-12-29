import React from 'react';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/sunshine_holiday_packages', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100063907423640&mibextid=ZbWKwL', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://www.youtube.com/', label: 'Youtube' },
];

export const SocialLinks = () => {
  return (
    <div className="flex gap-4">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer" // Added for security
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
