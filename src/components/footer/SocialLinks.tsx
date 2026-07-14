import React from "react";
import { Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/sunshine_holiday_packages",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=100063907423640&mibextid=ZbWKwL",
    label: "Facebook",
  },
];

export const SocialLinks = () => {
  return (
    <div className="flex gap-3">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.08 }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white/5 text-slate-300 transition hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400"
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </motion.a>
      ))}
    </div>
  );
};
